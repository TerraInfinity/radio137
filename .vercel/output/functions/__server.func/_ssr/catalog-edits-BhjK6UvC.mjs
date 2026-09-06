import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { f as normalizeKind, m as parseTags, p as normalizeShuffle } from "./catalog-BcaLbP39.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-edits-BhjK6UvC.js
var catalog_edits_BhjK6UvC_exports = /* @__PURE__ */ __exportAll({
	n: () => catalog_edits_exports,
	t: () => applyCatalogEdits
});
var catalog_edits_exports = /* @__PURE__ */ __exportAll$1({ applyCatalogEdits: () => applyCatalogEdits });
function applyCatalogEdits(catalog, edits, stations = []) {
	const deletedUrls = new Set(edits.filter((edit) => edit.deletedR2 && edit.audioUrl).map((edit) => edit.audioUrl));
	const deletedKeys = new Set(edits.filter((edit) => edit.deletedR2 && edit.r2Key).map((edit) => edit.r2Key));
	const hidden = /* @__PURE__ */ new Map();
	const added = /* @__PURE__ */ new Map();
	const meta = /* @__PURE__ */ new Map();
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
		const bag = meta.get(edit.channelSlug) ?? /* @__PURE__ */ new Map();
		bag.set(edit.trackId, edit);
		meta.set(edit.channelSlug, bag);
	}
	const stationBySlug = new Map(stations.map((item) => [item.slug, item]));
	const patched = catalog.channels.map((channel) => {
		const station = stationBySlug.get(channel.slug);
		const hide = hidden.get(channel.slug);
		const extra = added.get(channel.slug) ?? [];
		const bag = meta.get(channel.slug);
		let tracks = channel.tracks.map((track) => {
			const patch = bag?.get(track.id);
			const gone = hide?.has(track.id) || track.audioUrl && deletedUrls.has(track.audioUrl) || track.audioUrl && deletedKeys.size > 0 && [...deletedKeys].some((key) => track.audioUrl.includes(key));
			return {
				...track,
				title: patch?.title || track.title,
				artist: patch?.artist || track.artist,
				audioUrl: patch?.audioUrl || track.audioUrl,
				coverUrl: patch?.coverUrl || track.coverUrl,
				durationSec: patch?.durationSec && patch.durationSec > 0 ? patch.durationSec : track.durationSec,
				enabled: gone ? false : track.enabled,
				tags: patch?.tags != null ? parseTags(patch.tags) : track.tags
			};
		});
		tracks = tracks.concat(extra.filter((edit) => !channel.tracks.some((track) => track.id === edit.trackId)).map((edit) => ({
			id: edit.trackId,
			title: edit.title || "Untitled",
			artist: edit.artist || channel.name,
			durationSec: edit.durationSec && edit.durationSec > 0 ? edit.durationSec : 60,
			audioUrl: edit.audioUrl || "",
			coverUrl: edit.coverUrl || channel.cover,
			nsfw: false,
			enabled: true,
			playback: "file",
			tags: parseTags(edit.tags)
		})));
		const ordered = [...bag?.values() ?? []].some((edit) => edit.sortOrder != null) ? [...tracks].sort((a, b) => {
			const ao = bag?.get(a.id)?.sortOrder;
			const bo = bag?.get(b.id)?.sortOrder;
			if (ao == null && bo == null) return 0;
			return (ao ?? 9999) - (bo ?? 9999);
		}) : tracks;
		const kind = station?.kind ? normalizeKind(station.kind) : normalizeKind(channel.kind || channel.mode);
		return {
			...channel,
			name: station?.name || channel.name,
			description: station?.description || channel.description,
			energy: station?.energy || channel.energy,
			category: station?.category || channel.category,
			cover: station?.cover || channel.cover,
			kind,
			mode: station?.mode ? normalizeKind(station.mode) : kind,
			featured: station?.featured ?? channel.featured,
			featuredRank: station?.featuredRank ?? channel.featuredRank,
			enabled: station?.hidden ? false : station?.enabled ?? channel.enabled,
			nsfw: station?.nsfw ?? channel.nsfw,
			tags: station?.tags ? station.tags.split(",").map((item) => item.trim()).filter(Boolean) : channel.tags,
			shuffle: station?.shuffle ? normalizeShuffle(station.shuffle) : normalizeShuffle(channel.shuffle),
			claimable: station?.claimable ?? channel.claimable,
			tracks: ordered
		};
	});
	const extras = stations.filter((station) => station.added && !station.hidden && !catalog.channels.some((channel) => channel.slug === station.slug)).map((station) => {
		const extra = added.get(station.slug) ?? [];
		const bag = meta.get(station.slug);
		const kind = normalizeKind(station.kind || station.mode || "fixed");
		const tracks = extra.map((edit) => ({
			id: edit.trackId,
			title: edit.title || "Untitled",
			artist: edit.artist || station.name || station.slug,
			durationSec: edit.durationSec && edit.durationSec > 0 ? edit.durationSec : 60,
			audioUrl: edit.audioUrl || "",
			coverUrl: edit.coverUrl || station.cover || "",
			nsfw: false,
			enabled: true,
			playback: "file",
			tags: parseTags(edit.tags)
		}));
		const ordered = extra.some((edit) => edit.sortOrder != null) ? [...tracks].sort((a, b) => {
			const ao = bag?.get(a.id)?.sortOrder;
			const bo = bag?.get(b.id)?.sortOrder;
			if (ao == null && bo == null) return 0;
			return (ao ?? 9999) - (bo ?? 9999);
		}) : tracks;
		return {
			slug: station.slug,
			name: station.name || station.slug,
			energy: station.energy || "new frequency",
			mode: kind,
			kind,
			cover: station.cover || "/covers/ember-frequency.jpg",
			description: station.description || "",
			enabled: station.enabled ?? true,
			tags: station.tags ? station.tags.split(",").map((item) => item.trim()).filter(Boolean) : ["new"],
			category: station.category || "Custom",
			featured: station.featured ?? false,
			featuredRank: station.featuredRank ?? 99,
			claimable: station.claimable ?? false,
			skin: "none",
			nsfw: station.nsfw ?? false,
			shuffle: normalizeShuffle(station.shuffle),
			tracks: ordered
		};
	});
	return {
		...catalog,
		channels: [...patched, ...extras]
	};
}
//#endregion
export { catalog_edits_BhjK6UvC_exports as n, applyCatalogEdits as t };
