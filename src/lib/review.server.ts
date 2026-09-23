import { getSql } from "@/lib/db";
import { hideTrack, restoreTrack } from "@/lib/catalog-edits.server";
import { r2KeyFromAudioUrl } from "@/lib/file-path";
import type { RadioUser } from "@/lib/sso.server";

export type ReviewItem = {
  id: number;
  trackId: string;
  channelSlug: string;
  audioUrl: string | null;
  title: string | null;
  artist: string | null;
  r2Key: string | null;
  coverUrl: string | null;
  status: string;
  editorEmail: string | null;
  createdAt: string;
};

type Row = {
  id: number;
  track_id: string;
  channel_slug: string;
  audio_url: string | null;
  title: string | null;
  artist: string | null;
  r2_key: string | null;
  cover_url: string | null;
  status: string;
  editor_email: string | null;
  created_at: Date | string;
};

function mapRow(row: Row): ReviewItem {
  return {
    id: row.id,
    trackId: row.track_id,
    channelSlug: row.channel_slug,
    audioUrl: row.audio_url,
    title: row.title,
    artist: row.artist,
    r2Key: row.r2_key,
    coverUrl: row.cover_url,
    status: row.status,
    editorEmail: row.editor_email,
    createdAt: typeof row.created_at === "string" ? row.created_at : row.created_at.toISOString(),
  };
}

export async function listReviewQueue(status = "open"): Promise<ReviewItem[]> {
  const sql = await getSql();
  try {
    const rows = await sql<Row>`
      select id, track_id, channel_slug, audio_url, title, artist, r2_key, cover_url, status, editor_email, created_at
      from radio_review_queue
      where status = ${status}
      order by id desc
      limit 200
    `;
    return rows.map(mapRow);
  } catch {
    return [];
  }
}

export async function countOpenReview(): Promise<number> {
  const sql = await getSql();
  try {
    const rows = await sql<{ count: number }>`select count(*)::int as count from radio_review_queue where status = 'open'`;
    return rows[0]?.count ?? 0;
  } catch {
    return 0;
  }
}

export async function unallocateTrack(
  user: RadioUser,
  input: {
    channelSlug: string;
    trackId: string;
    audioUrl?: string | null;
    title?: string | null;
    artist?: string | null;
    coverUrl?: string | null;
  },
) {
  const edit = await hideTrack(user, input.channelSlug, input.trackId, input.audioUrl ?? undefined);
  const sql = await getSql();
  const key = input.audioUrl ? r2KeyFromAudioUrl(input.audioUrl) : null;
  try {
    const open = await sql<{ id: number }>`
      select id from radio_review_queue
      where track_id = ${input.trackId} and channel_slug = ${input.channelSlug} and status = 'open'
      limit 1
    `;
    if (open[0]) {
      await sql`
        update radio_review_queue
        set title = coalesce(${input.title ?? null}, title),
            artist = coalesce(${input.artist ?? null}, artist),
            audio_url = coalesce(${input.audioUrl ?? null}, audio_url),
            cover_url = coalesce(${input.coverUrl ?? null}, cover_url),
            r2_key = coalesce(${key}, r2_key),
            editor_id = ${user.id},
            editor_email = ${user.email},
            updated_at = now()
        where id = ${open[0].id}
      `;
    } else {
      await sql`
        insert into radio_review_queue (
          track_id, channel_slug, audio_url, title, artist, r2_key, cover_url, status, editor_id, editor_email
        ) values (
          ${input.trackId}, ${input.channelSlug}, ${input.audioUrl ?? null}, ${input.title ?? null},
          ${input.artist ?? null}, ${key}, ${input.coverUrl ?? null}, 'open', ${user.id}, ${user.email}
        )
      `;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/radio_review_queue|does not exist/i.test(message)) throw error;
  }
  return edit;
}

export async function setReviewStatus(id: number, status: string) {
  const sql = await getSql();
  await sql`update radio_review_queue set status = ${status}, updated_at = now() where id = ${id}`;
}

export async function restoreReviewItem(user: RadioUser, id: number) {
  const sql = await getSql();
  const rows = await sql<Row>`
    select id, track_id, channel_slug, audio_url, title, artist, r2_key, cover_url, status, editor_email, created_at
    from radio_review_queue where id = ${id} limit 1
  `;
  const row = rows[0];
  if (!row) throw new Error("Review item missing");
  await restoreTrack(user, row.channel_slug, row.track_id);
  await setReviewStatus(id, "restored");
  return mapRow(row);
}

export async function getReviewItem(id: number): Promise<ReviewItem | null> {
  const sql = await getSql();
  const rows = await sql<Row>`
    select id, track_id, channel_slug, audio_url, title, artist, r2_key, cover_url, status, editor_email, created_at
    from radio_review_queue where id = ${id} limit 1
  `;
  return rows[0] ? mapRow(rows[0]) : null;
}
