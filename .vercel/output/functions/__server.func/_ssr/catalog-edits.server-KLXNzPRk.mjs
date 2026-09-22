import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { r as getSql } from "./db-B_31co1Y.mjs";
import { c as normalizeR2Key, l as r2KeyFromAudioUrl } from "./file-path-C0hfvhIH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-edits.server-KLXNzPRk.js
/** Catalog slots that were never read from the file. */
function isStubDuration(seconds) {
	if (!Number.isFinite(seconds) || seconds <= 0) return true;
	return seconds <= 15 || seconds === 60;
}
/** `duration_sec` is an integer column. Audio probes return fractions like 376.520167. */
function wholeSeconds(value) {
	if (value == null || !Number.isFinite(value) || value <= 0) return null;
	return Math.max(1, Math.round(value));
}
var catalog_edits_server_exports = /* @__PURE__ */ __exportAll({
	addTrack: () => addTrack,
	hideSameStationMergedCopies: () => hideSameStationMergedCopies,
	hideTrack: () => hideTrack,
	listEdits: () => listEdits,
	listStationEdits: () => listStationEdits,
	markDeletedR2: () => markDeletedR2,
	patchTrack: () => patchTrack,
	placeTrack: () => placeTrack,
	renameTrackFile: () => renameTrackFile,
	reorderTracks: () => reorderTracks,
	restoreTrack: () => restoreTrack,
	setFeaturedOrder: () => setFeaturedOrder,
	upsertStation: () => upsertStation
});
function mapRow(row) {
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
		aliases: row.aliases ?? null
	};
}
async function listEdits() {
	const sql = await getSql();
	try {
		return (await sql`
      select channel_slug, track_id, hidden, deleted_r2, added, sort_order, title, artist, duration_sec, audio_url, cover_url, r2_key, tags, slug, aliases
      from radio_track_edits order by id asc
    `).map(mapRow);
	} catch {
		try {
			return (await sql`
        select channel_slug, track_id, hidden, deleted_r2, added, sort_order, title, artist, duration_sec, audio_url, cover_url, r2_key, tags
        from radio_track_edits order by id asc
      `).map((row) => mapRow({
				...row,
				slug: null,
				aliases: null
			}));
		} catch {
			return (await sql`
        select channel_slug, track_id, hidden, deleted_r2, added, sort_order, title, artist, duration_sec, audio_url, cover_url, r2_key
        from radio_track_edits order by id asc
      `).map((row) => mapRow({
				...row,
				tags: null,
				slug: null,
				aliases: null
			}));
		}
	}
}
function mapStation(row) {
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
		aliases: row.aliases ?? null
	};
}
async function listStationEdits() {
	const sql = await getSql();
	try {
		return (await sql`
      select slug, added, hidden, name, description, energy, category, cover, animation_url, video_url, kind, mode, featured, featured_rank, enabled, nsfw, tags, shuffle, claimable, public_slug, aliases
      from radio_station_edits order by slug asc
    `).map(mapStation);
	} catch {
		try {
			return (await sql`
        select slug, added, hidden, name, description, energy, category, cover, kind, mode, featured, featured_rank, enabled, nsfw, tags, shuffle, claimable, public_slug, aliases
        from radio_station_edits order by slug asc
      `).map((row) => mapStation({
				...row,
				animation_url: null,
				video_url: null
			}));
		} catch {
			try {
				return (await sql`
        select slug, added, hidden, name, description, energy, category, cover, kind, mode, featured, featured_rank, enabled, nsfw, tags, shuffle, claimable
        from radio_station_edits order by slug asc
      `).map((row) => mapStation({
					...row,
					animation_url: null,
					video_url: null,
					public_slug: null,
					aliases: null
				}));
			} catch {
				return (await sql`
        select slug, added, hidden, name, description, energy, category, cover, kind, mode, featured, featured_rank, enabled, nsfw, tags
        from radio_station_edits order by slug asc
      `).map((row) => mapStation({
					...row,
					animation_url: null,
					video_url: null,
					shuffle: null,
					claimable: null,
					public_slug: null,
					aliases: null
				}));
			}
		}
	}
}
async function upsertEdit(user, patch) {
	const sql = await getSql();
	const r2Key = patch.r2Key ?? (patch.audioUrl ? r2KeyFromAudioUrl(patch.audioUrl) : null);
	const durationSec = wholeSeconds(patch.durationSec);
	const hiddenTouch = typeof patch.hidden === "boolean";
	const tagsTouch = patch.tags !== void 0;
	const slugTouch = patch.slug !== void 0;
	const aliasesTouch = patch.aliases !== void 0;
	const sqlText = async () => sql`
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
		return mapRow((await sqlText())[0]);
	} catch {
		return mapRow({
			...(await sql`
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
    `)[0],
			slug: null,
			aliases: null
		});
	}
}
async function hideTrack(user, channelSlug, trackId, audioUrl) {
	return upsertEdit(user, {
		channelSlug,
		trackId,
		hidden: true,
		audioUrl: audioUrl ?? null
	});
}
async function hideSameStationMergedCopies(user, canonicalId, memberIds) {
	const catalog = await liveCatalog();
	const { extrasToHideOnStation } = await import("./cuts-DHoBzPwa.mjs").then((n) => n.i).then((n) => n.i);
	for (const channel of catalog.channels) {
		const extras = extrasToHideOnStation(channel.tracks, memberIds, canonicalId);
		for (const extra of extras) await hideTrack(user, channel.slug, extra.id, extra.audioUrl);
	}
}
async function restoreTrack(user, channelSlug, trackId) {
	return upsertEdit(user, {
		channelSlug,
		trackId,
		hidden: false
	});
}
async function patchTrack(user, input) {
	if (input.slug || input.aliases) {
		const { slugify } = await import("./cn-BnEf6O0M.mjs").then((n) => n.n).then((n) => n.n);
		const { isReservedPublicPath, parseAliases, slugTaken } = await import("./song-url-BbYrVN1D.mjs").then((n) => n.u).then((n) => n.u);
		const catalog = await liveCatalog();
		const want = slugify(input.slug || "");
		if (want && isReservedPublicPath(want)) throw new Error(`“${want}” is a reserved path. Use another public URL ending.`);
		if (want && slugTaken(catalog, want, input.trackId)) throw new Error(`Slug “${want}” is already used by another song or station`);
		const aliases = parseAliases(input.aliases);
		for (const key of aliases) {
			if (isReservedPublicPath(key)) throw new Error(`Alias “${key}” is a reserved path (player, channel, desk, library, login, about, api…). Pick another ending.`);
			if (slugTaken(catalog, key, input.trackId)) throw new Error(`Alias “${key}” is already used by another song or station`);
		}
		if (input.aliases !== void 0) input.aliases = aliases.join(", ");
	}
	return upsertEdit(user, input);
}
async function renameTrackFile(user, input) {
	const { r2KeyFromAudioUrl } = await import("./file-path-C0hfvhIH.mjs").then((n) => n.a).then((n) => n.a);
	const { moveR2Key } = await import("./r2.server-BMj6CRvu.mjs").then((n) => n.i).then((n) => n.i);
	const catalog = await liveCatalog();
	const track = catalog.channels.find((item) => item.slug === input.channelSlug)?.tracks.find((item) => item.id === input.trackId);
	if (!track?.audioUrl) throw new Error("No audio file on this song");
	const from = r2KeyFromAudioUrl(track.audioUrl);
	if (!from) throw new Error("This file is not on R2");
	const dest = input.toKey.replace(/^\/+/, "");
	if (!dest || dest.includes("..")) throw new Error("Invalid R2 key");
	const object = await moveR2Key(from, dest);
	const oldUrl = track.audioUrl;
	for (const desk of catalog.channels) for (const item of desk.tracks) {
		if (item.audioUrl !== oldUrl && r2KeyFromAudioUrl(item.audioUrl) !== from) continue;
		await upsertEdit(user, {
			channelSlug: desk.slug,
			trackId: item.id,
			audioUrl: object.url,
			r2Key: object.key
		});
	}
	return object;
}
async function addTrack(user, input) {
	const channel = (await liveCatalog()).channels.find((item) => item.slug === input.channelSlug);
	if (channel && (input.audioUrl || input.r2Key) && !input.trackId) {
		const want = normalizeR2Key(input.r2Key || r2KeyFromAudioUrl(input.audioUrl) || "");
		if (channel.tracks.some((item) => {
			if (item.enabled === false) return false;
			if (item.audioUrl && input.audioUrl && item.audioUrl === input.audioUrl) return true;
			if (!want) return false;
			const have = normalizeR2Key(r2KeyFromAudioUrl(item.audioUrl) || "");
			return Boolean(have) && have === want;
		})) throw new Error(`Already on ${channel.name}`);
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
		r2Key: input.r2Key ?? r2KeyFromAudioUrl(input.audioUrl)
	});
}
async function markDeletedR2(user, channelSlug, trackId, audioUrl, r2Key) {
	return upsertEdit(user, {
		channelSlug,
		trackId,
		hidden: true,
		deletedR2: true,
		audioUrl,
		r2Key
	});
}
async function reorderTracks(user, channelSlug, trackIds) {
	const edits = [];
	for (let i = 0; i < trackIds.length; i++) edits.push(await upsertEdit(user, {
		channelSlug,
		trackId: trackIds[i],
		sortOrder: i
	}));
	return edits;
}
async function upsertStation(user, patch) {
	if (patch.publicSlug !== void 0 || patch.aliases !== void 0) {
		const { slugify } = await import("./cn-BnEf6O0M.mjs").then((n) => n.n).then((n) => n.n);
		const { isReservedPublicPath, parseAliases, slugTaken } = await import("./song-url-BbYrVN1D.mjs").then((n) => n.u).then((n) => n.u);
		const catalog = await liveCatalog();
		const want = slugify(patch.publicSlug || "");
		if (want && isReservedPublicPath(want)) throw new Error(`“${want}” is a reserved path. Use another public URL ending.`);
		if (want && slugTaken(catalog, want, "", patch.slug)) throw new Error(`Slug “${want}” is already used by another song or station`);
		const aliases = parseAliases(patch.aliases);
		for (const key of aliases) {
			if (isReservedPublicPath(key)) throw new Error(`Alias “${key}” is a reserved path (player, channel, desk, library, login, api…). Pick another ending.`);
			if (slugTaken(catalog, key, "", patch.slug)) throw new Error(`Alias “${key}” is already used by another song or station`);
		}
		if (patch.aliases !== void 0) patch.aliases = aliases.join(", ");
		if (patch.publicSlug !== void 0) patch.publicSlug = want || "";
	}
	const sql = await getSql();
	const hiddenTouch = typeof patch.hidden === "boolean";
	const featuredTouch = typeof patch.featured === "boolean";
	const enabledTouch = typeof patch.enabled === "boolean";
	const nsfwTouch = typeof patch.nsfw === "boolean";
	const claimableTouch = typeof patch.claimable === "boolean";
	const publicSlugTouch = patch.publicSlug !== void 0;
	const aliasesTouch = patch.aliases !== void 0;
	const write = async () => sql`
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
		return mapStation((await write())[0]);
	} catch {
		return mapStation({
			...(await sql`
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
  `)[0],
			public_slug: null,
			aliases: null
		});
	}
}
async function liveCatalog() {
	const { getSeedCatalog } = await import("./catalog-DmckmNNR.mjs").then((n) => n.t);
	const { applyCatalogEdits } = await import("./catalog-edits-B7ACZ19x.mjs").then((n) => n.n);
	return applyCatalogEdits(getSeedCatalog(), await listEdits(), await listStationEdits());
}
async function placeTrack(user, input) {
	const catalog = await liveCatalog();
	const from = catalog.channels.find((channel) => channel.slug === input.fromSlug);
	const to = catalog.channels.find((channel) => channel.slug === input.toSlug);
	if (!from || !to) throw new Error("Station not found");
	if (input.fromSlug === input.toSlug) throw new Error("Pick a different station");
	const track = from.tracks.find((item) => item.id === input.trackId);
	if (!track) throw new Error("Song not found");
	const { listCutGroups } = await import("./cuts.server-DljvaoBP.mjs");
	const { idsShareSong } = await import("./cuts-DHoBzPwa.mjs").then((n) => n.i).then((n) => n.i);
	const groups = await listCutGroups();
	if (to.tracks.some((item) => {
		if (item.enabled === false) return false;
		if (item.audioUrl && track.audioUrl && item.audioUrl === track.audioUrl) return true;
		return idsShareSong(item.id, track.id, groups);
	})) throw new Error(`Already on ${to.name}`);
	await addTrack(user, {
		channelSlug: input.toSlug,
		title: track.title,
		artist: track.artist,
		durationSec: track.durationSec,
		audioUrl: track.audioUrl,
		coverUrl: track.coverUrl || to.cover
	});
	if (input.mode === "move") await hideTrack(user, input.fromSlug, input.trackId, track.audioUrl);
}
async function setFeaturedOrder(user, slugs) {
	const unique = [...new Set(slugs.filter(Boolean))];
	const catalog = await liveCatalog();
	const known = new Set(catalog.channels.map((channel) => channel.slug));
	for (const slug of unique) if (!known.has(slug)) throw new Error(`Unknown station ${slug}`);
	const current = catalog.channels.filter((channel) => channel.featured).map((channel) => channel.slug);
	for (const slug of current) if (!unique.includes(slug)) await upsertStation(user, {
		slug,
		featured: false
	});
	for (let i = 0; i < unique.length; i++) await upsertStation(user, {
		slug: unique[i],
		featured: true,
		featuredRank: i
	});
}
//#endregion
export { listStationEdits as a, upsertStation as c, listEdits as i, isStubDuration as l, catalog_edits_server_exports as n, patchTrack as o, hideTrack as r, restoreTrack as s, addTrack as t };
