import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-edits-yasvWDPz.js
var catalog_edits_yasvWDPz_exports = /* @__PURE__ */ __exportAll({
	n: () => catalog_edits_exports,
	t: () => applyCatalogEdits
});
var catalog_edits_exports = /* @__PURE__ */ __exportAll$1({ applyCatalogEdits: () => applyCatalogEdits });
function applyCatalogEdits(catalog, edits) {
	if (edits.length === 0) return catalog;
	const deletedUrls = new Set(edits.filter((edit) => edit.deletedR2 && edit.audioUrl).map((edit) => edit.audioUrl));
	const deletedKeys = new Set(edits.filter((edit) => edit.deletedR2 && edit.r2Key).map((edit) => edit.r2Key));
	const hidden = /* @__PURE__ */ new Map();
	const added = /* @__PURE__ */ new Map();
	for (const edit of edits) {
		if (edit.hidden) {
			const set = hidden.get(edit.channelSlug) ?? /* @__PURE__ */ new Set();
			set.add(edit.trackId);
			hidden.set(edit.channelSlug, set);
		}
		if (edit.added && !edit.hidden) {
			const list = added.get(edit.channelSlug) ?? [];
			list.push(edit);
			added.set(edit.channelSlug, list);
		}
	}
	return {
		...catalog,
		channels: catalog.channels.map((channel) => {
			const hide = hidden.get(channel.slug);
			const extra = added.get(channel.slug) ?? [];
			const tracks = channel.tracks.map((track) => {
				if (!(hide?.has(track.id) || track.audioUrl && deletedUrls.has(track.audioUrl) || track.audioUrl && deletedKeys.size > 0 && [...deletedKeys].some((key) => track.audioUrl.includes(key)))) return track;
				return {
					...track,
					enabled: false
				};
			}).concat(extra.filter((edit) => !channel.tracks.some((track) => track.id === edit.trackId)).map((edit) => ({
				id: edit.trackId,
				title: edit.title || "Untitled",
				artist: edit.artist || channel.name,
				durationSec: edit.durationSec && edit.durationSec > 0 ? edit.durationSec : 60,
				audioUrl: edit.audioUrl || "",
				coverUrl: edit.coverUrl || channel.cover,
				nsfw: false,
				enabled: true,
				playback: "file"
			})));
			return {
				...channel,
				tracks
			};
		})
	};
}
//#endregion
export { catalog_edits_yasvWDPz_exports as n, applyCatalogEdits as t };
