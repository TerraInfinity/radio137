import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { r as getSql } from "./db-DZGjxB3j.mjs";
import { r as r2KeyFromAudioUrl } from "./file-path-B3HtxHuV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-edits.server-CwFXx2_o.js
var catalog_edits_server_exports = /* @__PURE__ */ __exportAll({
	addTrack: () => addTrack,
	hideTrack: () => hideTrack,
	listEdits: () => listEdits,
	listStationEdits: () => listStationEdits,
	markDeletedR2: () => markDeletedR2,
	patchTrack: () => patchTrack,
	reorderTracks: () => reorderTracks,
	restoreTrack: () => restoreTrack,
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
		r2Key: row.r2_key
	};
}
async function listEdits() {
	return (await (await getSql())`
    select channel_slug, track_id, hidden, deleted_r2, added, sort_order, title, artist, duration_sec, audio_url, cover_url, r2_key
    from radio_track_edits order by id asc
  `).map(mapRow);
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
		kind: row.kind,
		mode: row.mode,
		featured: row.featured,
		featuredRank: row.featured_rank,
		enabled: row.enabled,
		nsfw: row.nsfw,
		tags: row.tags
	};
}
async function listStationEdits() {
	return (await (await getSql())`
    select slug, added, hidden, name, description, energy, category, cover, kind, mode, featured, featured_rank, enabled, nsfw, tags
    from radio_station_edits order by slug asc
  `).map(mapStation);
}
async function upsertEdit(user, patch) {
	const sql = await getSql();
	const r2Key = patch.r2Key ?? (patch.audioUrl ? r2KeyFromAudioUrl(patch.audioUrl) : null);
	const hiddenTouch = typeof patch.hidden === "boolean";
	return mapRow((await sql`
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
  `)[0]);
}
async function hideTrack(user, channelSlug, trackId, audioUrl) {
	return upsertEdit(user, {
		channelSlug,
		trackId,
		hidden: true,
		audioUrl: audioUrl ?? null
	});
}
async function restoreTrack(user, channelSlug, trackId) {
	return upsertEdit(user, {
		channelSlug,
		trackId,
		hidden: false
	});
}
async function patchTrack(user, input) {
	return upsertEdit(user, input);
}
async function addTrack(user, input) {
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
	const sql = await getSql();
	const hiddenTouch = typeof patch.hidden === "boolean";
	const featuredTouch = typeof patch.featured === "boolean";
	const enabledTouch = typeof patch.enabled === "boolean";
	return mapStation((await sql`
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
  `)[0]);
}
//#endregion
export { listStationEdits as i, catalog_edits_server_exports as n, listEdits as r, addTrack as t };
