import { getSql } from "@/lib/db";
import { wholeSeconds } from "@/lib/duration-policy";
import { r2KeyFromAudioUrl, normalizeR2Key } from "@/lib/file-path";
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
  animation_url?: string | null;
  video_url?: string | null;
  kind: string | null;
  mode: string | null;
  featured: boolean | null;
  featured_rank: number | null;
  enabled: boolean | null;
  nsfw: boolean | null;
  tags: string | null;
  shuffle: string | null;
  claimable: boolean | null;
  public_slug: string | null;
  aliases: string | null;
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
    animationUrl: row.animation_url ?? null,
    videoUrl: row.video_url ?? null,
    kind: row.kind,
    mode: row.mode,
    featured: row.featured,
    featuredRank: row.featured_rank,
    enabled: row.enabled,
    nsfw: row.nsfw,
    tags: row.tags,
    shuffle: row.shuffle,
    claimable: row.claimable,
    publicSlug: row.public_slug ?? null,
    aliases: row.aliases ?? null,
  };
}

export async function listStationEdits(): Promise<StationEdit[]> {
  const sql = await getSql();
  try {
    const rows = await sql<StationRow>`
      select slug, added, hidden, name, description, energy, category, cover, animation_url, video_url, kind, mode, featured, featured_rank, enabled, nsfw, tags, shuffle, claimable, public_slug, aliases
      from radio_station_edits order by slug asc
    `;
    return rows.map(mapStation);
  } catch {
    try {
      const rows = await sql<StationRow>`
        select slug, added, hidden, name, description, energy, category, cover, kind, mode, featured, featured_rank, enabled, nsfw, tags, shuffle, claimable, public_slug, aliases
        from radio_station_edits order by slug asc
      `;
      return rows.map((row) => mapStation({ ...row, animation_url: null, video_url: null }));
    } catch {
    try {
      const rows = await sql<StationRow>`
        select slug, added, hidden, name, description, energy, category, cover, kind, mode, featured, featured_rank, enabled, nsfw, tags, shuffle, claimable
        from radio_station_edits order by slug asc
      `;
      return rows.map((row) => mapStation({ ...row, animation_url: null, video_url: null, public_slug: null, aliases: null }));
    } catch {
      const rows = await sql<StationRow>`
        select slug, added, hidden, name, description, energy, category, cover, kind, mode, featured, featured_rank, enabled, nsfw, tags
        from radio_station_edits order by slug asc
      `;
      return rows.map((row) => mapStation({ ...row, animation_url: null, video_url: null, shuffle: null, claimable: null, public_slug: null, aliases: null }));
    }
    }
  }
}

async function upsertEdit(
  user: RadioUser,
  patch: Partial<CatalogEdit> & { channelSlug: string; trackId: string },
): Promise<CatalogEdit> {
  const sql = await getSql();
  const r2Key = patch.r2Key ?? (patch.audioUrl ? r2KeyFromAudioUrl(patch.audioUrl) : null);
  const durationSec = wholeSeconds(patch.durationSec);
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
      ${durationSec},
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
        ${durationSec},
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

export async function hideSameStationMergedCopies(user: RadioUser, canonicalId: string, memberIds: string[]) {
  const catalog = await liveCatalog();
  const { extrasToHideOnStation } = await import("@/lib/cuts");
  for (const channel of catalog.channels) {
    const extras = extrasToHideOnStation(channel.tracks, memberIds, canonicalId);
    for (const extra of extras) {
      await hideTrack(user, channel.slug, extra.id, extra.audioUrl);
    }
  }
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
      throw new Error(`Slug “${want}” is already used by another song or station`);
    }
    const aliases = parseAliases(input.aliases);
    for (const key of aliases) {
      if (isReservedPublicPath(key)) {
        throw new Error(`Alias “${key}” is a reserved path (player, channel, desk, library, login, about, api…). Pick another ending.`);
      }
      if (slugTaken(catalog, key, input.trackId)) {
        throw new Error(`Alias “${key}” is already used by another song or station`);
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
  if (!track?.audioUrl) throw new Error("No audio file on this song");
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
  const catalog = await liveCatalog();
  const channel = catalog.channels.find((item) => item.slug === input.channelSlug);
  if (channel && (input.audioUrl || input.r2Key) && !input.trackId) {
    const want = normalizeR2Key(input.r2Key || r2KeyFromAudioUrl(input.audioUrl) || "");
    const exists = channel.tracks.some((item) => {
      if (item.enabled === false) return false;
      if (item.audioUrl && input.audioUrl && item.audioUrl === input.audioUrl) return true;
      if (!want) return false;
      const have = normalizeR2Key(r2KeyFromAudioUrl(item.audioUrl) || "");
      return Boolean(have) && have === want;
    });
    if (exists) throw new Error(`Already on ${channel.name}`);
  }
  const trackId = input.trackId || `desk-${input.channelSlug}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
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
  if (patch.publicSlug !== undefined || patch.aliases !== undefined) {
    const { slugify } = await import("@/lib/cn");
    const { isReservedPublicPath, parseAliases, slugTaken } = await import("@/lib/song-url");
    const catalog = await liveCatalog();
    const want = slugify(patch.publicSlug || "");
    if (want && isReservedPublicPath(want)) {
      throw new Error(`“${want}” is a reserved path. Use another public URL ending.`);
    }
    if (want && slugTaken(catalog, want, "", patch.slug)) {
      throw new Error(`Slug “${want}” is already used by another song or station`);
    }
    const aliases = parseAliases(patch.aliases);
    for (const key of aliases) {
      if (isReservedPublicPath(key)) {
        throw new Error(`Alias “${key}” is a reserved path (player, channel, desk, library, login, api…). Pick another ending.`);
      }
      if (slugTaken(catalog, key, "", patch.slug)) {
        throw new Error(`Alias “${key}” is already used by another song or station`);
      }
    }
    if (patch.aliases !== undefined) patch.aliases = aliases.join(", ");
    if (patch.publicSlug !== undefined) patch.publicSlug = want || "";
  }
  const sql = await getSql();
  const hiddenTouch = typeof patch.hidden === "boolean";
  const featuredTouch = typeof patch.featured === "boolean";
  const enabledTouch = typeof patch.enabled === "boolean";
  const nsfwTouch = typeof patch.nsfw === "boolean";
  const claimableTouch = typeof patch.claimable === "boolean";
  const publicSlugTouch = patch.publicSlug !== undefined;
  const aliasesTouch = patch.aliases !== undefined;
  const write = async () =>
    sql<StationRow>`
    insert into radio_station_edits (
      slug, added, hidden, name, description, energy, category, cover, animation_url, video_url, kind, mode, featured, featured_rank, enabled, nsfw, tags, shuffle, claimable, public_slug, aliases, editor_id, editor_email, updated_at
    ) values (
      ${patch.slug},
      ${patch.added ?? false},
      ${patch.hidden ?? false},
      ${patch.name ?? null},
      ${patch.description ?? null},
      ${patch.energy ?? null},
      ${patch.category ?? null},
      ${patch.cover ?? null},
      ${patch.animationUrl ?? null},
      ${patch.videoUrl ?? patch.animationUrl ?? null},
      ${patch.kind ?? null},
      ${patch.mode ?? patch.kind ?? null},
      ${patch.featured ?? null},
      ${patch.featuredRank ?? null},
      ${patch.enabled ?? null},
      ${patch.nsfw ?? null},
      ${patch.tags ?? null},
      ${patch.shuffle ?? null},
      ${patch.claimable ?? null},
      ${patch.publicSlug ?? null},
      ${patch.aliases ?? null},
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
      animation_url = coalesce(excluded.animation_url, radio_station_edits.animation_url),
      video_url = coalesce(excluded.video_url, radio_station_edits.video_url),
      kind = coalesce(excluded.kind, radio_station_edits.kind),
      mode = coalesce(excluded.mode, radio_station_edits.mode),
      featured = case when ${featuredTouch} then excluded.featured else radio_station_edits.featured end,
      featured_rank = coalesce(excluded.featured_rank, radio_station_edits.featured_rank),
      enabled = case when ${enabledTouch} then excluded.enabled else radio_station_edits.enabled end,
      nsfw = case when ${nsfwTouch} then excluded.nsfw else radio_station_edits.nsfw end,
      tags = coalesce(excluded.tags, radio_station_edits.tags),
      shuffle = coalesce(excluded.shuffle, radio_station_edits.shuffle),
      claimable = case when ${claimableTouch} then excluded.claimable else radio_station_edits.claimable end,
      public_slug = case when ${publicSlugTouch} then excluded.public_slug else radio_station_edits.public_slug end,
      aliases = case when ${aliasesTouch} then excluded.aliases else radio_station_edits.aliases end,
      editor_id = excluded.editor_id,
      editor_email = excluded.editor_email,
      updated_at = now()
    returning slug, added, hidden, name, description, energy, category, cover, animation_url, video_url, kind, mode, featured, featured_rank, enabled, nsfw, tags, shuffle, claimable, public_slug, aliases
  `;
  try {
    const rows = await write();
    return mapStation(rows[0]);
  } catch {
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
    return mapStation({ ...rows[0], public_slug: null, aliases: null });
  }
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
  if (!track) throw new Error("Song not found");
  const { listCutGroups } = await import("@/lib/cuts.server");
  const { idsShareSong } = await import("@/lib/cuts");
  const groups = await listCutGroups();
  const already = to.tracks.some((item) => {
    if (item.enabled === false) return false;
    if (item.audioUrl && track.audioUrl && item.audioUrl === track.audioUrl) return true;
    return idsShareSong(item.id, track.id, groups);
  });
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

const MAX_AUDIO = 80 * 1024 * 1024;

function sameAudio(a: string, b: string): boolean {
  if (a === b) return true;
  const left = normalizeR2Key(r2KeyFromAudioUrl(a) || "");
  const right = normalizeR2Key(r2KeyFromAudioUrl(b) || "");
  return Boolean(left) && left === right;
}

function isRoseMp3(url: string): boolean {
  const key = normalizeR2Key(r2KeyFromAudioUrl(url) || "").toLowerCase();
  return key.startsWith("radio/rose/") && key.endsWith(".mp3");
}

async function readRemoteAudio(url: string): Promise<Uint8Array> {
  if (!/^https:\/\//i.test(url)) throw new Error("Audio URL must be https");
  const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Could not read the audio (${response.status})`);
  const length = Number(response.headers.get("content-length") || "0");
  if (length > MAX_AUDIO) throw new Error("That file is over 80 MB");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_AUDIO) throw new Error("That file is over 80 MB");
  if (bytes.byteLength < 64) throw new Error("That audio file is empty");
  return bytes;
}

/** Point every copy of this song at one file. Wav (and other non-mp3) can be encoded into radio/rose/ first. The original file stays on R2. */
export async function shareSongAudioFile(
  user: RadioUser,
  input: { channelSlug: string; trackId: string; convert?: boolean },
): Promise<{ url: string; key: string | null; updated: number; matched: number; converted: boolean; reused: boolean }> {
  const catalog = await liveCatalog();
  const channel = catalog.channels.find((item) => item.slug === input.channelSlug);
  const source = channel?.tracks.find((item) => item.id === input.trackId);
  if (!source?.audioUrl) throw new Error("No audio file on this song");
  const { sameSongTitle } = await import("@/lib/rose-rite");
  const { audioExtension, isMp3Name, transcodeToMp3 } = await import("@/lib/audio-transcode.server");
  const matches: Array<{ slug: string; id: string; audioUrl: string }> = [];
  for (const desk of catalog.channels) {
    for (const item of desk.tracks) {
      if (item.enabled === false || !item.audioUrl) continue;
      if (!sameSongTitle(item.title, source.title)) continue;
      matches.push({ slug: desk.slug, id: item.id, audioUrl: item.audioUrl });
    }
  }
  if (!matches.some((item) => item.slug === input.channelSlug && item.id === source.id)) {
    matches.push({ slug: input.channelSlug, id: source.id, audioUrl: source.audioUrl });
  }

  const wantConvert = Boolean(input.convert) && !isMp3Name(source.audioUrl);
  let targetUrl = source.audioUrl;
  let converted = false;
  let reused = false;

  if (wantConvert) {
    const existing =
      matches.find((item) => item.slug === "rose" && isRoseMp3(item.audioUrl)) ?? matches.find((item) => isRoseMp3(item.audioUrl));
    if (existing) {
      targetUrl = existing.audioUrl;
      reused = true;
    } else {
      const { putR2Object, r2Configured, sanitizeUploadName } = await import("@/lib/r2.server");
      if (!r2Configured()) throw new Error("R2 keys are not set");
      const bytes = await readRemoteAudio(source.audioUrl);
      const mp3 = await transcodeToMp3(bytes, audioExtension(source.audioUrl) || "wav");
      const stem = sanitizeUploadName(source.title).replace(/\.[a-z0-9]{2,5}$/i, "") || "track";
      let key = `radio/rose/${stem}.mp3`;
      const keyTaken = catalog.channels.some((desk) =>
        desk.tracks.some((item) => {
          if (!item.audioUrl || sameSongTitle(item.title, source.title)) return false;
          return normalizeR2Key(r2KeyFromAudioUrl(item.audioUrl) || "").toLowerCase() === key.toLowerCase();
        }),
      );
      if (keyTaken) key = `radio/rose/${stem}-shared.mp3`;
      const object = await putR2Object(key, mp3, "audio/mpeg");
      targetUrl = object.url;
      converted = true;
    }
  }

  const key = r2KeyFromAudioUrl(targetUrl);
  let updated = 0;
  for (const item of matches) {
    if (sameAudio(item.audioUrl, targetUrl)) continue;
    await upsertEdit(user, {
      channelSlug: item.slug,
      trackId: item.id,
      audioUrl: targetUrl,
      r2Key: key,
    });
    updated += 1;
  }
  return { url: targetUrl, key, updated, matched: matches.length, converted, reused };
}

function foldTitle(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export async function renameSongCopies(
  user: RadioUser,
  input: { title: string; members: { channelSlug: string; trackId: string }[] },
): Promise<{ updated: number }> {
  const title = input.title.trim();
  if (!title) throw new Error("Title is empty");
  const catalog = await liveCatalog();
  let updated = 0;
  for (const member of input.members) {
    const channel = catalog.channels.find((item) => item.slug === member.channelSlug);
    if (!channel?.tracks.some((item) => item.id === member.trackId)) continue;
    await upsertEdit(user, { channelSlug: member.channelSlug, trackId: member.trackId, title });
    updated += 1;
  }
  if (updated === 0) throw new Error("None of those songs are in the catalog");
  return { updated };
}

/** Copy one mp3 into radio/library and point every listed playlist row at it. Old files stay. */
export async function shelveLibraryFile(
  user: RadioUser,
  input: { channelSlug: string; trackId: string; members: { channelSlug: string; trackId: string }[] },
): Promise<{ key: string; url: string; updated: number; copied: boolean }> {
  const catalog = await liveCatalog();
  const channel = catalog.channels.find((item) => item.slug === input.channelSlug);
  const source = channel?.tracks.find((item) => item.id === input.trackId);
  if (!source?.audioUrl) throw new Error("No audio file on this song");
  const from = normalizeR2Key(r2KeyFromAudioUrl(source.audioUrl) || "");
  if (!from) throw new Error("That file is not on R2");
  if (!from.toLowerCase().endsWith(".mp3")) throw new Error("Only an mp3 can be shelved. Convert the wav first.");
  const { libraryKeyFor } = await import("@/lib/library-map");
  const { copyR2Key, r2Configured } = await import("@/lib/r2.server");
  if (!r2Configured()) throw new Error("R2 keys are not set");
  const fold = foldTitle(source.title);
  const members = input.members.filter((member) => {
    const desk = catalog.channels.find((item) => item.slug === member.channelSlug);
    const track = desk?.tracks.find((item) => item.id === member.trackId);
    return Boolean(track && foldTitle(track.title) === fold);
  });
  if (!members.some((member) => member.channelSlug === input.channelSlug && member.trackId === input.trackId)) {
    members.push({ channelSlug: input.channelSlug, trackId: input.trackId });
  }
  let key = libraryKeyFor(source.title);
  const owned = new Set(members.map((member) => `${member.channelSlug}:${member.trackId}`));
  const taken = catalog.channels.some((desk) =>
    desk.tracks.some((item) => {
      if (owned.has(`${desk.slug}:${item.id}`)) return false;
      return normalizeR2Key(r2KeyFromAudioUrl(item.audioUrl) || "").toLowerCase() === key.toLowerCase();
    }),
  );
  if (taken) key = key.replace(/\.mp3$/i, ` ${channel?.slug || "shared"}.mp3`);
  const copied = from.toLowerCase() !== key.toLowerCase();
  const object = copied ? await copyR2Key(from, key) : { key, size: 0, url: source.audioUrl };
  let updated = 0;
  for (const member of members) {
    const desk = catalog.channels.find((item) => item.slug === member.channelSlug);
    const track = desk?.tracks.find((item) => item.id === member.trackId);
    if (!track) continue;
    if (normalizeR2Key(r2KeyFromAudioUrl(track.audioUrl) || "").toLowerCase() === object.key.toLowerCase()) continue;
    await upsertEdit(user, { channelSlug: member.channelSlug, trackId: member.trackId, audioUrl: object.url, r2Key: object.key });
    updated += 1;
  }
  return { key: object.key, url: object.url, updated, copied };
}


/** Turn one Rose wav into a 320 kbps stereo mp3 beside it and point the row at the mp3. The wav stays. */
export async function convertRoseWavFile(user: RadioUser, trackId: string): Promise<{ key: string; url: string }> {
  const catalog = await liveCatalog();
  const channel = catalog.channels.find((item) => item.slug === "rose");
  const track = channel?.tracks.find((item) => item.id === trackId);
  if (!track?.audioUrl) throw new Error("That Rose song is not in the catalog");
  const { audioExtension, encodeStereoMp3, isMp3Name } = await import("@/lib/audio-transcode.server");
  if (isMp3Name(track.audioUrl)) throw new Error("That file is already an mp3");
  const { putR2Object, r2Configured, sanitizeUploadName } = await import("@/lib/r2.server");
  if (!r2Configured()) throw new Error("R2 keys are not set");
  const bytes = await readRemoteAudio(track.audioUrl);
  const mp3 = await encodeStereoMp3(bytes, audioExtension(track.audioUrl) || "wav");
  const from = normalizeR2Key(r2KeyFromAudioUrl(track.audioUrl) || "");
  const slash = from.lastIndexOf("/");
  const folder = slash >= 0 ? from.slice(0, slash) : "radio/rose";
  const base = (slash >= 0 ? from.slice(slash + 1) : sanitizeUploadName(track.title)).replace(/\.[a-z0-9]{2,5}$/i, "") || "track";
  const key = `${folder}/${base}.mp3`;
  const object = await putR2Object(key, mp3, "audio/mpeg");
  await upsertEdit(user, { channelSlug: "rose", trackId, audioUrl: object.url, r2Key: object.key });
  return { key: object.key, url: object.url };
}
