import { getSql } from "@/lib/db";
import { r2KeyFromAudioUrl } from "@/lib/file-path";
import type { CatalogEdit, StationEdit } from "@/lib/catalog-edits";
import type { RadioUser } from "@/lib/sso.server";

type EditRow = {
  channel_slug: string;
  track_id: string;
  hidden: boolean;
  deleted_r2: boolean;
  added: boolean;
  sort_order: number | null;
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
    sortOrder: row.sort_order,
    title: row.title,
    artist: row.artist,
    durationSec: row.duration_sec,
    audioUrl: row.audio_url,
    coverUrl: row.cover_url,
    r2Key: row.r2_key,
  };
}

export async function listEdits(): Promise<CatalogEdit[]> {
  const sql = await getSql();
  const rows = await sql<EditRow>`
    select channel_slug, track_id, hidden, deleted_r2, added, sort_order, title, artist, duration_sec, audio_url, cover_url, r2_key
    from radio_track_edits order by id asc
  `;
  return rows.map(mapRow);
}

type StationRow = {
  slug: string;
  added: boolean;
  hidden: boolean;
  name: string | null;
  description: string | null;
  energy: string | null;
  category: string | null;
  cover: string | null;
  kind: string | null;
  mode: string | null;
  featured: boolean | null;
  featured_rank: number | null;
  enabled: boolean | null;
  nsfw: boolean | null;
  tags: string | null;
};

function mapStation(row: StationRow): StationEdit {
  return {
    slug: row.slug,
    added: Boolean(row.added),
    hidden: Boolean(row.hidden),
    name: row.name,
    description: row.description,
    energy: row.energy,
    category: row.category,
    cover: row.cover,
    kind: row.kind,
    mode: row.mode,
    featured: row.featured,
    featuredRank: row.featured_rank,
    enabled: row.enabled,
    nsfw: row.nsfw,
    tags: row.tags,
  };
}

export async function listStationEdits(): Promise<StationEdit[]> {
  const sql = await getSql();
  const rows = await sql<StationRow>`
    select slug, added, hidden, name, description, energy, category, cover, kind, mode, featured, featured_rank, enabled, nsfw, tags
    from radio_station_edits order by slug asc
  `;
  return rows.map(mapStation);
}

async function upsertEdit(
  user: RadioUser,
  patch: Partial<CatalogEdit> & { channelSlug: string; trackId: string },
): Promise<CatalogEdit> {
  const sql = await getSql();
  const r2Key = patch.r2Key ?? (patch.audioUrl ? r2KeyFromAudioUrl(patch.audioUrl) : null);
  const hiddenTouch = typeof patch.hidden === "boolean";
  const rows = await sql<EditRow>`
    insert into radio_track_edits (
      channel_slug, track_id, hidden, deleted_r2, added, sort_order, title, artist, duration_sec, audio_url, cover_url, r2_key, editor_id, editor_email, updated_at
    ) values (
      ${patch.channelSlug},
      ${patch.trackId},
      ${patch.hidden ?? false},
      ${patch.deletedR2 ?? false},
      ${patch.added ?? false},
      ${patch.sortOrder ?? null},
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
      hidden = case when ${hiddenTouch} then excluded.hidden else radio_track_edits.hidden end,
      deleted_r2 = radio_track_edits.deleted_r2 or excluded.deleted_r2,
      added = radio_track_edits.added or excluded.added,
      sort_order = coalesce(excluded.sort_order, radio_track_edits.sort_order),
      title = coalesce(excluded.title, radio_track_edits.title),
      artist = coalesce(excluded.artist, radio_track_edits.artist),
      duration_sec = coalesce(excluded.duration_sec, radio_track_edits.duration_sec),
      audio_url = coalesce(excluded.audio_url, radio_track_edits.audio_url),
      cover_url = coalesce(excluded.cover_url, radio_track_edits.cover_url),
      r2_key = coalesce(excluded.r2_key, radio_track_edits.r2_key),
      editor_id = excluded.editor_id,
      editor_email = excluded.editor_email,
      updated_at = now()
    returning channel_slug, track_id, hidden, deleted_r2, added, sort_order, title, artist, duration_sec, audio_url, cover_url, r2_key
  `;
  return mapRow(rows[0]);
}

export async function hideTrack(user: RadioUser, channelSlug: string, trackId: string, audioUrl?: string) {
  return upsertEdit(user, { channelSlug, trackId, hidden: true, audioUrl: audioUrl ?? null });
}

export async function restoreTrack(user: RadioUser, channelSlug: string, trackId: string) {
  return upsertEdit(user, { channelSlug, trackId, hidden: false });
}

export async function patchTrack(
  user: RadioUser,
  input: { channelSlug: string; trackId: string; title?: string; artist?: string; audioUrl?: string; durationSec?: number },
) {
  return upsertEdit(user, input);
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
) {
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

export async function markDeletedR2(user: RadioUser, channelSlug: string, trackId: string, audioUrl: string, r2Key: string) {
  return upsertEdit(user, { channelSlug, trackId, hidden: true, deletedR2: true, audioUrl, r2Key });
}

export async function reorderTracks(user: RadioUser, channelSlug: string, trackIds: string[]) {
  const edits: CatalogEdit[] = [];
  for (let i = 0; i < trackIds.length; i++) {
    edits.push(await upsertEdit(user, { channelSlug, trackId: trackIds[i], sortOrder: i }));
  }
  return edits;
}

export async function upsertStation(
  user: RadioUser,
  patch: Partial<StationEdit> & { slug: string },
): Promise<StationEdit> {
  const sql = await getSql();
  const hiddenTouch = typeof patch.hidden === "boolean";
  const featuredTouch = typeof patch.featured === "boolean";
  const enabledTouch = typeof patch.enabled === "boolean";
  const rows = await sql<StationRow>`
    insert into radio_station_edits (
      slug, added, hidden, name, description, energy, category, cover, kind, mode, featured, featured_rank, enabled, nsfw, tags, editor_id, editor_email, updated_at
    ) values (
      ${patch.slug},
      ${patch.added ?? false},
      ${patch.hidden ?? false},
      ${patch.name ?? null},
      ${patch.description ?? null},
      ${patch.energy ?? null},
      ${patch.category ?? null},
      ${patch.cover ?? null},
      ${patch.kind ?? null},
      ${patch.mode ?? patch.kind ?? null},
      ${patch.featured ?? null},
      ${patch.featuredRank ?? null},
      ${patch.enabled ?? null},
      ${patch.nsfw ?? null},
      ${patch.tags ?? null},
      ${user.id},
      ${user.email},
      now()
    )
    on conflict (slug) do update set
      added = radio_station_edits.added or excluded.added,
      hidden = case when ${hiddenTouch} then excluded.hidden else radio_station_edits.hidden end,
      name = coalesce(excluded.name, radio_station_edits.name),
      description = coalesce(excluded.description, radio_station_edits.description),
      energy = coalesce(excluded.energy, radio_station_edits.energy),
      category = coalesce(excluded.category, radio_station_edits.category),
      cover = coalesce(excluded.cover, radio_station_edits.cover),
      kind = coalesce(excluded.kind, radio_station_edits.kind),
      mode = coalesce(excluded.mode, radio_station_edits.mode),
      featured = case when ${featuredTouch} then excluded.featured else radio_station_edits.featured end,
      featured_rank = coalesce(excluded.featured_rank, radio_station_edits.featured_rank),
      enabled = case when ${enabledTouch} then excluded.enabled else radio_station_edits.enabled end,
      nsfw = coalesce(excluded.nsfw, radio_station_edits.nsfw),
      tags = coalesce(excluded.tags, radio_station_edits.tags),
      editor_id = excluded.editor_id,
      editor_email = excluded.editor_email,
      updated_at = now()
    returning slug, added, hidden, name, description, energy, category, cover, kind, mode, featured, featured_rank, enabled, nsfw, tags
  `;
  return mapStation(rows[0]);
}
