import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { i as getPlayableTracks, l as isAdultTrack, u as isChannelNsfw } from "./catalog-DmckmNNR.mjs";
import { t as audioPathParts } from "./file-path-C0hfvhIH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cuts-DHoBzPwa.js
var cuts_DHoBzPwa_exports = /* @__PURE__ */ __exportAll({
	a: () => filenameClusters,
	c: () => preferCanonical,
	i: () => cuts_exports,
	l: () => stationCopies,
	n: () => collapseByCanonical,
	o: () => listCutCopies,
	r: () => copiesOf,
	s: () => mergedClusters,
	t: () => autoCanonicalMap,
	u: () => titleClusters
});
var cuts_exports = /* @__PURE__ */ __exportAll$1({
	autoCanonicalMap: () => autoCanonicalMap,
	collapseByCanonical: () => collapseByCanonical,
	copiesOf: () => copiesOf,
	extrasToHideOnStation: () => extrasToHideOnStation,
	filenameClusters: () => filenameClusters,
	idsShareSong: () => idsShareSong,
	listCutCopies: () => listCutCopies,
	memberMap: () => memberMap,
	mergedClusters: () => mergedClusters,
	preferCanonical: () => preferCanonical,
	stationCopies: () => stationCopies,
	titleClusters: () => titleClusters
});
function fold(value) {
	return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function listCutCopies(catalog, includeNsfw = false) {
	const rows = [];
	for (const channel of catalog.channels) {
		if (!channel.enabled) continue;
		if (!includeNsfw && isChannelNsfw(channel)) continue;
		for (const track of getPlayableTracks(channel)) {
			if (!includeNsfw && isAdultTrack(track) && !isChannelNsfw(channel)) continue;
			const parts = audioPathParts(track.audioUrl);
			rows.push({
				track,
				channel,
				folder: parts.folder,
				filename: parts.filename,
				stem: parts.stem
			});
		}
	}
	return rows;
}
function memberMap(groups) {
	const map = /* @__PURE__ */ new Map();
	for (const group of groups) {
		for (const id of group.memberIds) map.set(id, group.canonicalId);
		map.set(group.canonicalId, group.canonicalId);
	}
	return map;
}
function fileKey(copy) {
	return fold(copy.stem || copy.filename);
}
function titleKey(copy) {
	return fold(copy.track.title);
}
function preferCanonical(copies) {
	return [...copies].sort((a, b) => {
		const ao = /official|default/.test(a.channel.slug) ? 0 : 1;
		const bo = /official|default/.test(b.channel.slug) ? 0 : 1;
		if (ao !== bo) return ao - bo;
		if (a.folder.length !== b.folder.length) return a.folder.length - b.folder.length;
		return a.track.title.localeCompare(b.track.title) || a.track.id.localeCompare(b.track.id);
	})[0] ?? copies[0];
}
function groupBy(copies, keyOf) {
	const bags = /* @__PURE__ */ new Map();
	for (const copy of copies) {
		const key = keyOf(copy);
		if (!key) continue;
		const list = bags.get(key) ?? [];
		list.push(copy);
		bags.set(key, list);
	}
	const clusters = [];
	for (const [key, list] of bags) {
		const unique = [...new Map(list.map((item) => [item.track.id, item])).values()];
		if (unique.length < 2) continue;
		clusters.push({
			key,
			reason: "file",
			copies: unique.sort((a, b) => a.channel.name.localeCompare(b.channel.name))
		});
	}
	return clusters.sort((a, b) => b.copies.length - a.copies.length || a.key.localeCompare(b.key));
}
function filenameClusters(copies) {
	return groupBy(copies, fileKey).map((cluster) => ({
		...cluster,
		reason: "file"
	}));
}
function titleClusters(copies, skipIds) {
	return groupBy(copies.filter((copy) => !skipIds.has(copy.track.id)), (copy) => {
		const key = titleKey(copy);
		const tokens = key.split(" ").filter(Boolean);
		if (key.length < 12 && tokens.length < 3) return "";
		return key;
	}).map((cluster) => ({
		...cluster,
		reason: "title"
	}));
}
function mergedClusters(copies, groups) {
	const byId = new Map(copies.map((copy) => [copy.track.id, copy]));
	const clusters = [];
	for (const group of groups) {
		const list = [...new Set(group.memberIds)].map((id) => byId.get(id)).filter((item) => Boolean(item));
		if (list.length === 0) continue;
		clusters.push({
			key: group.canonicalId,
			reason: "merged",
			copies: list
		});
	}
	return clusters;
}
function autoCanonicalMap(copies, groups) {
	const map = memberMap(groups);
	for (const cluster of filenameClusters(copies)) {
		const keep = preferCanonical(cluster.copies);
		for (const copy of cluster.copies) if (!map.has(copy.track.id)) map.set(copy.track.id, keep.track.id);
	}
	return map;
}
function idsShareSong(a, b, groups) {
	if (a === b) return true;
	const map = memberMap(groups);
	return (map.get(a) ?? a) === (map.get(b) ?? b);
}
/** Keep one row per station. Extra members of a merge group are hidden, not deleted. */
function extrasToHideOnStation(tracks, memberIds, canonicalId) {
	const group = new Set(memberIds.filter(Boolean));
	const hits = tracks.filter((track) => track.enabled !== false && group.has(track.id));
	if (hits.length < 2) return [];
	const keep = hits.find((track) => track.id === canonicalId) ?? hits[0];
	return hits.filter((track) => track.id !== keep.id);
}
function stationCopies(channel) {
	return getPlayableTracks(channel).map((track) => {
		const parts = audioPathParts(track.audioUrl);
		return {
			track,
			channel,
			folder: parts.folder,
			filename: parts.filename,
			stem: parts.stem
		};
	});
}
function copiesOf(catalog, trackId, groups, includeNsfw = false) {
	const copies = listCutCopies(catalog, includeNsfw);
	const map = autoCanonicalMap(copies, groups);
	const canonical = map.get(trackId) ?? trackId;
	return copies.filter((copy) => (map.get(copy.track.id) ?? copy.track.id) === canonical);
}
function collapseByCanonical(rows, copies, groups) {
	const map = autoCanonicalMap(copies, groups);
	const byId = new Map(rows.map((row) => [row.track.id, row]));
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const row of rows) {
		const canonical = map.get(row.track.id) ?? row.track.id;
		if (seen.has(canonical)) continue;
		seen.add(canonical);
		out.push(byId.get(canonical) ?? row);
	}
	return out;
}
//#endregion
export { filenameClusters as a, preferCanonical as c, cuts_DHoBzPwa_exports as i, stationCopies as l, collapseByCanonical as n, listCutCopies as o, copiesOf as r, mergedClusters as s, autoCanonicalMap as t, titleClusters as u };
