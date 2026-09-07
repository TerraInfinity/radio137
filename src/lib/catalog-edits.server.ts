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
  tags: string | null;
  slug: string | null;
  aliases: string | null;
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
    tags: row.tags ?? null,
    slug: row.slug ?? null,
    aliases: row.aliases ?? null,
  };
}

export async function listEdits(): Promise<CatalogEdit[]> {
  const sql = await getSql();
  try {
    const rows = await sql<EditRow>`
      select channel_slug, track_id, hidden, deleted_r2, added, sort_order, title, artist, duration_sec, audio_url, cover_url, r2_key, tags, slug, aliases
      from radio_track_edits order by id asc
    `;
    return rows.map(mapRow);
  } catch {
    try {
      const rows = await sql<EditRow>`
        select channel_slug, track_id, hidden, deleted_r2, added, sort_order, title, artist, duration_sec, audio_url, cover_url, r2_key, tags
        from radio_track_edits order by id asc
      `;
      return rows.map((row) => mapRow({ ...row, slug: null, aliases: null }));
    } catch {
      const rows = await sql<EditRow>`
        select channel_slug, track_id, hidden, deleted_r2, added, sort_order, title, artist, duration_sec, audio_url, cover_url, r2_key
        from radio_track_edits order by id asc
      `;
      return rows.map((row) => mapRow({ ...row, tags: null, slug: null, aliases: null }));
    }
  }
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
  shuffle: string | null;
  claimable: boolean | null;
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
    shuffle: row.shuffle,
    claimable: row.claimable,
  };
}

export async function listStationEdits(): Promise<StationEdit[]> {
  const sql = await getSql();
  try {
    const rows = await sql<StationRow>`
      select slug, added, hidden, name, description, energy, category, cover, kind, mode, featured, featured_rank, enabled, nsfw, tags, shuffle, claimable
      from radio_station_edits order by slug asc
    `;
    return rows.map(mapStation);
  } catch {
    const rows = await sql<StationRow>`
      select slug, added, hidden, name, description, energy, category, cover, kind, mode, featured, featured_rank, enabled, nsfw, tags
      from radio_station_edits order by slug asc
    `;
    return rows.map((row) => mapStation({ ...row, shuffle: null, claimable: null }));
  }
}

async function upsertEdit(
  user: RadioUser,
  patch: Partial<CatalogEdit> & { channelSlug: string; trackId: string },
): Promise<CatalogEdit> {
  const sql = await getSql();
  const r2Key = patch.r2Key ?? (patch.audioUrl ? r2KeyFromAudioUrl(patch.audioUrl) : null);
  const hiddenTouch = typeof patch.hidden === "boolean";
  const tagsTouch = patch.tags !== undefined;
  const slugTouch = patch.slug !== undefined;
  const aliasesTouch = patch.aliases !== undefined;
  const sqlText = async () =>
    sql<EditRow>`
    insert into radio_track_edits (
      channel_slug, track_id, hidden, deleted_r2, added, sort_order, title, artist, duration_sec, audio_url, cover_url, r2_key, tags, slug, aliases, editor_id, editor_email, updated_at
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
      ${patch.tags ?? null},
      ${patch.slug ?? null},
      ${patch.aliases ?? null},
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
      tags = case when ${tagsTouch} then excluded.tags else radio_track_edits.tags end,
      slug = case when ${slugTouch} then excluded.slug else radio_track_edits.slug end,
      aliases = case when ${aliasesTouch} then excluded.aliases else radio_track_edits.aliases end,
      editor_id = excluded.editor_id,
      editor_email = excluded.editor_email,
      updated_at = now()
    returning channel_slug, track_id, hidden, deleted_r2, added, sort_order, title, artist, duration_sec, audio_url, cover_url, r2_key, tags, slug, aliases
  `;
  try {
    const rows = await sqlText();
    return mapRow(rows[0]);
  } catch {
    const rows = await sql<EditRow>`
      insert into radio_track_edits (
        channel_slug, track_id, hidden, deleted_r2, added, sort_order, title, artist, duration_sec, audio_url, cover_url, r2_key, tags, editor_id, editor_email, updated_at
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
        ${patch.tags ?? null},
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
        tags = case when ${tagsTouch} then excluded.tags else radio_track_edits.tags end,
        editor_id = excluded.editor_id,
        editor_email = excluded.editor_email,
        updated_at = now()
      returning channel_slug, track_id, hidden, deleted_r2, added, sort_order, title, artist, duration_sec, audio_url, cover_url, r2_key, tags
    `;
    return mapRow({ ...rows[0], slug: null, aliases: null });
  }
}

export async function hideTrack(user: RadioUser, channelSlug: string, trackId: string, audioUrl?: string) {
  return upsertEdit(user, { channelSlug, trackId, hidden: true, audioUrl: audioUrl ?? null });
}

export async function restoreTrack(user: RadioUser, channelSlug: string, trackId: string) {
  return upsertEdit(user, { channelSlug, trackId, hidden: false });
}

export async function patchTrack(
  user: RadioUser,
  input: {
    channelSlug: string;
    trackId: string;
    title?: string;
    artist?: string;
    audioUrl?: string;
    coverUrl?: string;
    durationSec?: number;
    tags?: string | null;
    slug?: string | null;
    aliases?: string | null;
  },
) {
  if (input.slug || input.aliases) {
    const { slugify } = await import("@/lib/cn");
    const { isReservedPublicPath, parseAliases, slugTaken } = await import("@/lib/song-url");
    const catalog = await liveCatalog();
    const want = slugify(input.slug || "");
    if (want && isReservedPublicPath(want)) {
      throw new Error(`“${want}” is a reserved path. Use another public URL ending.`);
    }
    if (want && slugTaken(catalog, want, input.trackId)) {
      throw new Error(`Slug “${want}” is already used by another cut`);
    }
    const aliases = parseAliases(input.aliases);
    for (const key of aliases) {
      if (isReservedPublicPath(key)) {
        throw new Error(`Alias “${key}” is a reserved path (player, channel, desk, library, login, about, api…). Pick another ending.`);
      }
      if (slugTaken(catalog, key, input.trackId)) {
        throw new Error(`Alias “${key}” is already used by another cut`);
      }
    }
    if (input.aliases !== undefined) input.aliases = aliases.join(", ");
  }
  return upsertEdit(user, input);
}

export async function renameTrackFile(
  user: RadioUser,
  input: { channelSlug: string; trackId: string; toKey: string },
) {
  const { r2KeyFromAudioUrl } = await import("@/lib/file-path");
  const { moveR2Key } = await import("@/lib/r2.server");
  const catalog = await liveCatalog();
  const channel = catalog.channels.find((item) => item.slug === input.channelSlug);
  const track = channel?.tracks.find((item) => item.id === input.trackId);
  if (!track?.audioUrl) throw new Error("No audio file on this cut");
  const from = r2KeyFromAudioUrl(track.audioUrl);
  if (!from) throw new Error("This file is not on R2");
  const dest = input.toKey.replace(/^\/+/, "");
  if (!dest || dest.includes("..")) throw new Error("Invalid R2 key");
  const object = await moveR2Key(from, dest);
  const oldUrl = track.audioUrl;
  for (const desk of catalog.channels) {
    for (const item of desk.tracks) {
      if (item.audioUrl !== oldUrl && r2KeyFromAudioUrl(item.audioUrl) !== from) continue;
      await upsertEdit(user, {
        channelSlug: desk.slug,
        trackId: item.id,
        audioUrl: object.url,
        r2Key: object.key,
      });
    }
  }
  return object;
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
  const nsfwTouch = typeof patch.nsfw === "boolean";
  const claimableTouch = typeof patch.claimable === "boolean";
  const rows = await sql<StationRow>`
    insert into radio_station_edits (
      slug, added, hidden, name, description, energy, category, cover, kind, mode, featured, featured_rank, enabled, nsfw, tags, shuffle, claimable, editor_id, editor_email, updated_at
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
      ${patch.shuffle ?? null},
      ${patch.claimable ?? null},
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
      nsfw = case when ${nsfwTouch} then excluded.nsfw else radio_station_edits.nsfw end,
      tags = coalesce(excluded.tags, radio_station_edits.tags),
      shuffle = coalesce(excluded.shuffle, radio_station_edits.shuffle),
      claimable = case when ${claimableTouch} then excluded.claimable else radio_station_edits.claimable end,
      editor_id = excluded.editor_id,
      editor_email = excluded.editor_email,
      updated_at = now()
    returning slug, added, hidden, name, description, energy, category, cover, kind, mode, featured, featured_rank, enabled, nsfw, tags, shuffle, claimable
  `;
  return mapStation(rows[0]);
}

async function liveCatalog() {
  const { getSeedCatalog } = await import("@/lib/catalog");
  const { applyCatalogEdits } = await import("@/lib/catalog-edits");
  return applyCatalogEdits(getSeedCatalog(), await listEdits(), await listStationEdits());
}

export async function placeTrack(
  user: RadioUser,
  input: { fromSlug: string; trackId: string; toSlug: string; mode: "copy" | "move" },
) {
  const catalog = await liveCatalog();
  const from = catalog.channels.find((channel) => channel.slug === input.fromSlug);
  const to = catalog.channels.find((channel) => channel.slug === input.toSlug);
  if (!from || !to) throw new Error("Station not found");
  if (input.fromSlug === input.toSlug) throw new Error("Pick a different station");
  const track = from.tracks.find((item) => item.id === input.trackId);
  if (!track) throw new Error("Cut not found");
  const already = to.tracks.some((item) => item.enabled !== false && item.audioUrl && item.audioUrl === track.audioUrl);
  if (already) throw new Error(`Already on ${to.name}`);
  await addTrack(user, {
    channelSlug: input.toSlug,
    title: track.title,
    artist: track.artist,
    durationSec: track.durationSec,
    audioUrl: track.audioUrl,
    coverUrl: track.coverUrl || to.cover,
  });
  if (input.mode === "move") {
    await hideTrack(user, input.fromSlug, input.trackId, track.audioUrl);
  }
}

export async function setFeaturedOrder(user: RadioUser, slugs: string[]) {
  const unique = [...new Set(slugs.filter(Boolean))];
  const catalog = await liveCatalog();
  const known = new Set(catalog.channels.map((channel) => channel.slug));
  for (const slug of unique) {
    if (!known.has(slug)) throw new Error(`Unknown station ${slug}`);
  }
  const current = catalog.channels.filter((channel) => channel.featured).map((channel) => channel.slug);
  for (const slug of current) {
    if (!unique.includes(slug)) await upsertStation(user, { slug, featured: false });
  }
  for (let i = 0; i < unique.length; i++) {
    await upsertStation(user, { slug: unique[i], featured: true, featuredRank: i });
  }
}
