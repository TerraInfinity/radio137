import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { s as parseAliases } from "./song-url-BbYrVN1D.mjs";
import { T as sortPlaylistTracks, g as parseTags, h as normalizeShuffle, m as normalizeKind } from "./catalog-DmckmNNR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-edits-B7ACZ19x.js
var catalog_edits_exports = /* @__PURE__ */ __exportAll({ applyCatalogEdits: () => applyCatalogEdits });
function orderMap(edits) {
	const map = /* @__PURE__ */ new Map();
	if (!edits) return map;
	for (const edit of edits) map.set(edit.trackId, edit.sortOrder);
	return map;
}
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
				tags: patch?.tags != null ? parseTags(patch.tags) : track.tags,
				slug: patch?.slug != null ? patch.slug || void 0 : track.slug,
				aliases: patch?.aliases != null ? parseAliases(patch.aliases) : track.aliases
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
			tags: parseTags(edit.tags),
			slug: edit.slug || void 0,
			aliases: parseAliases(edit.aliases)
		})));
		const kind = station?.kind ? normalizeKind(station.kind) : normalizeKind(channel.kind || channel.mode);
		const order = orderMap(bag?.values());
		const ordered = kind === "fixed" && ![...order.values()].some((n) => n != null) ? tracks : sortPlaylistTracks(tracks, order);
		return {
			...channel,
			name: station?.name || channel.name,
			description: station?.description || channel.description,
			energy: station?.energy || channel.energy,
			category: station?.category || channel.category,
			cover: station?.cover || channel.cover,
			animationUrl: station?.animationUrl || station?.videoUrl || channel.animationUrl,
			videoUrl: station?.videoUrl || station?.animationUrl || channel.videoUrl,
			kind,
			mode: station?.mode ? normalizeKind(station.mode) : kind,
			featured: station?.featured ?? channel.featured,
			featuredRank: station?.featuredRank ?? channel.featuredRank,
			enabled: station?.hidden ? false : station?.enabled ?? channel.enabled,
			nsfw: station?.nsfw ?? channel.nsfw,
			tags: station?.tags ? station.tags.split(",").map((item) => item.trim()).filter(Boolean) : channel.tags,
			shuffle: station?.shuffle ? normalizeShuffle(station.shuffle) : normalizeShuffle(channel.shuffle),
			claimable: station?.claimable ?? channel.claimable,
			publicSlug: station?.publicSlug != null ? station.publicSlug || void 0 : channel.publicSlug,
			aliases: station?.aliases != null ? parseAliases(station.aliases) : channel.aliases,
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
			tags: parseTags(edit.tags),
			slug: edit.slug || void 0,
			aliases: parseAliases(edit.aliases)
		}));
		const ordered = sortPlaylistTracks(tracks, orderMap(bag?.values() ?? extra));
		return {
			slug: station.slug,
			name: station.name || station.slug,
			energy: station.energy || "new frequency",
			mode: kind,
			kind,
			cover: station.cover || "/covers/ember-frequency.jpg",
			animationUrl: station.animationUrl || station.videoUrl || void 0,
			videoUrl: station.videoUrl || station.animationUrl || void 0,
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
			publicSlug: station.publicSlug || void 0,
			aliases: parseAliases(station.aliases),
			tracks: ordered
		};
	});
	return {
		...catalog,
		channels: [...patched, ...extras]
	};
}
//#endregion
export { catalog_edits_exports as n, applyCatalogEdits as t };
