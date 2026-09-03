import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { r as getSql } from "./db-vc06irBo.mjs";
import { r as r2KeyFromAudioUrl } from "./file-path-B3HtxHuV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-edits.server-BA-vL_pw.js
var catalog_edits_server_exports = /* @__PURE__ */ __exportAll({
	addTrack: () => addTrack,
	hideTrack: () => hideTrack,
	listEdits: () => listEdits,
	markDeletedR2: () => markDeletedR2,
	restoreTrack: () => restoreTrack
});
function mapRow(row) {
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
		r2Key: row.r2_key
	};
}
async function listEdits(slug) {
	const sql = await getSql();
	return (slug ? await sql`select channel_slug, track_id, hidden, deleted_r2, added, title, artist, duration_sec, audio_url, cover_url, r2_key from radio_track_edits where channel_slug = ${slug} order by id asc` : await sql`select channel_slug, track_id, hidden, deleted_r2, added, title, artist, duration_sec, audio_url, cover_url, r2_key from radio_track_edits order by id asc`).map(mapRow);
}
async function upsertEdit(user, patch) {
	const sql = await getSql();
	const r2Key = patch.r2Key ?? (patch.audioUrl ? r2KeyFromAudioUrl(patch.audioUrl) : null);
	return mapRow((await sql`
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
//#endregion
export { catalog_edits_server_exports as n, listEdits as r, addTrack as t };
