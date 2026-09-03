import { getSql } from "@/lib/db";
import { r2KeyFromAudioUrl } from "@/lib/file-path";
import type { CatalogEdit } from "@/lib/catalog-edits";
import type { RadioUser } from "@/lib/sso.server";

type EditRow = {
  channel_slug: string;
  track_id: string;
  hidden: boolean;
  deleted_r2: boolean;
  added: boolean;
  title: string | null;
  artist: string | null;
  duration_sec: number | null;
  audio_url: string | null;
  cover_url: string | null;
  r2_key: string | null;
};

function mapRow(row: EditRow): CatalogEdit {
  return {
    channelSlug: row.channel_slug,
    trackId: row.track_id,
    hidden: Boolean(row.hidden),
    deletedR2: Boolean(row.deleted_r2),
    added: Boolean(row.added),
    title: row.title,
    artist: row.artist,
    durationSec: row.duration_sec,
    audioUrl: row.audio_url,
    coverUrl: row.cover_url,
    r2Key: row.r2_key,
  };
}

export async function listEdits(slug?: string): Promise<CatalogEdit[]> {
  const sql = await getSql();
  const rows = slug
    ? await sql<EditRow>`select channel_slug, track_id, hidden, deleted_r2, added, title, artist, duration_sec, audio_url, cover_url, r2_key from radio_track_edits where channel_slug = ${slug} order by id asc`
    : await sql<EditRow>`select channel_slug, track_id, hidden, deleted_r2, added, title, artist, duration_sec, audio_url, cover_url, r2_key from radio_track_edits order by id asc`;
  return rows.map(mapRow);
}

async function upsertEdit(
  user: RadioUser,
  patch: {
    channelSlug: string;
    trackId: string;
    hidden?: boolean;
    deletedR2?: boolean;
    added?: boolean;
    title?: string | null;
    artist?: string | null;
    durationSec?: number | null;
    audioUrl?: string | null;
    coverUrl?: string | null;
    r2Key?: string | null;
  },
): Promise<CatalogEdit> {
  const sql = await getSql();
  const r2Key = patch.r2Key ?? (patch.audioUrl ? r2KeyFromAudioUrl(patch.audioUrl) : null);
  const rows = await sql<EditRow>`
    insert into radio_track_edits (
      channel_slug, track_id, hidden, deleted_r2, added, title, artist, duration_sec, audio_url, cover_url, r2_key, editor_id, editor_email, updated_at
    ) values (
      ${patch.channelSlug},
      ${patch.trackId},
      ${patch.hidden ?? false},
      ${patch.deletedR2 ?? false},
      ${patch.added ?? false},
      ${patch.title ?? null},
      ${patch.artist ?? null},
      ${patch.durationSec ?? null},
      ${patch.audioUrl ?? null},
      ${patch.coverUrl ?? null},
      ${r2Key},
      ${user.id},
      ${user.email},
      now()
    )
    on conflict (channel_slug, track_id) do update set
      hidden = excluded.hidden,
      deleted_r2 = radio_track_edits.deleted_r2 or excluded.deleted_r2,
      added = radio_track_edits.added or excluded.added,
      title = coalesce(excluded.title, radio_track_edits.title),
      artist = coalesce(excluded.artist, radio_track_edits.artist),
      duration_sec = coalesce(excluded.duration_sec, radio_track_edits.duration_sec),
      audio_url = coalesce(excluded.audio_url, radio_track_edits.audio_url),
      cover_url = coalesce(excluded.cover_url, radio_track_edits.cover_url),
      r2_key = coalesce(excluded.r2_key, radio_track_edits.r2_key),
      editor_id = excluded.editor_id,
      editor_email = excluded.editor_email,
      updated_at = now()
    returning channel_slug, track_id, hidden, deleted_r2, added, title, artist, duration_sec, audio_url, cover_url, r2_key
  `;
  return mapRow(rows[0]);
}

export async function hideTrack(user: RadioUser, channelSlug: string, trackId: string, audioUrl?: string): Promise<CatalogEdit> {
  return upsertEdit(user, { channelSlug, trackId, hidden: true, audioUrl: audioUrl ?? null });
}

export async function restoreTrack(user: RadioUser, channelSlug: string, trackId: string): Promise<CatalogEdit> {
  return upsertEdit(user, { channelSlug, trackId, hidden: false });
}

export async function addTrack(
  user: RadioUser,
  input: {
    channelSlug: string;
    trackId?: string;
    title: string;
    artist?: string;
    durationSec?: number;
    audioUrl: string;
    coverUrl?: string;
    r2Key?: string;
  },
): Promise<CatalogEdit> {
  const trackId = input.trackId || `desk-${input.channelSlug}-${Date.now().toString(36)}`;
  return upsertEdit(user, {
    channelSlug: input.channelSlug,
    trackId,
    hidden: false,
    added: true,
    title: input.title,
    artist: input.artist ?? null,
    durationSec: input.durationSec ?? 60,
    audioUrl: input.audioUrl,
    coverUrl: input.coverUrl ?? null,
    r2Key: input.r2Key ?? r2KeyFromAudioUrl(input.audioUrl),
  });
}

export async function markDeletedR2(user: RadioUser, channelSlug: string, trackId: string, audioUrl: string, r2Key: string): Promise<CatalogEdit> {
  return upsertEdit(user, {
    channelSlug,
    trackId,
    hidden: true,
    deletedR2: true,
    audioUrl,
    r2Key,
  });
}
