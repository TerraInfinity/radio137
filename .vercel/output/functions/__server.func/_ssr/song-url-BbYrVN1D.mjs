import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { i as slugify } from "./cn-BnEf6O0M.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/song-url-BbYrVN1D.js
var song_url_BbYrVN1D_exports = /* @__PURE__ */ __exportAll({
	a: () => findStationByAlias,
	c: () => songKey,
	d: () => stationPath,
	i: () => findStation,
	l: () => songPath,
	n: () => findPlayerSong,
	o: () => isReservedPublicPath,
	r: () => findSongByAlias,
	s: () => parseAliases,
	t: () => aliasPath,
	u: () => song_url_exports
});
var song_url_exports = /* @__PURE__ */ __exportAll$1({
	RESERVED_PUBLIC_PATHS: () => RESERVED_PUBLIC_PATHS,
	aliasPath: () => aliasPath,
	findPlayerSong: () => findPlayerSong,
	findSongByAlias: () => findSongByAlias,
	findStation: () => findStation,
	findStationByAlias: () => findStationByAlias,
	isReservedPublicPath: () => isReservedPublicPath,
	parseAliasToken: () => parseAliasToken,
	parseAliases: () => parseAliases,
	slugTaken: () => slugTaken,
	songKey: () => songKey,
	songPath: () => songPath,
	stationKeys: () => stationKeys,
	stationPath: () => stationPath,
	stationPublicSlug: () => stationPublicSlug,
	titleKey: () => titleKey,
	trackKeys: () => trackKeys
});
function asKey(value) {
	return slugify(value || "").slice(0, 80);
}
/** First-path segments that must stay app routes / static files — never song aliases. */
var RESERVED_PUBLIC_PATHS = [
	"about",
	"admin",
	"api",
	"assets",
	"auth",
	"channel",
	"channels",
	"covers",
	"cut",
	"cuts",
	"desk",
	"download",
	"experiences",
	"favicon",
	"grok",
	"health",
	"home",
	"index",
	"install",
	"library",
	"login",
	"logout",
	"manifest",
	"og",
	"player",
	"public",
	"radio",
	"robots",
	"search",
	"share",
	"sitemap",
	"song",
	"songs",
	"sso",
	"static",
	"station",
	"stations",
	"status",
	"well-known",
	"www"
];
var reserved = new Set(RESERVED_PUBLIC_PATHS);
function isReservedPublicPath(value) {
	const key = asKey(value);
	return !key || key.startsWith("_") || reserved.has(key);
}
/** Strip origins, /player/, and leading slashes so “/hari” and pasted URLs become `hari`. */
function parseAliasToken(part) {
	let raw = part.trim();
	if (!raw) return "";
	raw = raw.replace(/^(https?:\/\/)?((www|radio)\.)?(terrainfinity|cyber-athens)\.ca(?::\d+)?/i, "");
	raw = raw.replace(/^\/+/, "");
	if (/^player\//i.test(raw)) raw = raw.slice(7);
	if (/^channel\//i.test(raw)) raw = raw.slice(8);
	if (/^stations?\//i.test(raw)) raw = raw.replace(/^stations?\//i, "");
	raw = raw.split(/[/?#]/)[0] || "";
	return asKey(raw);
}
function parseAliases(raw) {
	const parts = Array.isArray(raw) ? raw : String(raw || "").split(/[,;\n]+/);
	const out = [];
	for (const part of parts) {
		const slug = parseAliasToken(part);
		if (slug && !out.includes(slug)) out.push(slug);
	}
	return out;
}
function titleKey(track) {
	return asKey(track.title);
}
/** Public URL ending for a song: custom slug, else the song title — never a reserved path. */
function songKey(track) {
	const slug = asKey(track.slug);
	if (slug && !isReservedPublicPath(slug)) return slug;
	const title = titleKey(track);
	if (title && !isReservedPublicPath(title)) return title;
	return track.id;
}
function stationPublicSlug(channel) {
	const slug = asKey(channel.publicSlug);
	if (slug && !isReservedPublicPath(slug)) return slug;
	return channel.slug;
}
function stationPath(channel) {
	return `/channel/${stationPublicSlug(channel)}`;
}
function stationKeys(channel) {
	const keys = [
		channel.slug,
		channel.publicSlug,
		stationPublicSlug(channel),
		...channel.aliases ?? []
	];
	return [...new Set(keys.map((key) => asKey(key) || (key || "").trim()).filter(Boolean))];
}
function findStationByAlias(catalog, needle) {
	const want = parseAliasToken(needle) || asKey(needle);
	if (!want || isReservedPublicPath(want)) return null;
	for (const channel of catalog.channels) if (parseAliases(channel.aliases).includes(want)) return channel;
	return null;
}
function findStation(catalog, needle) {
	const want = parseAliasToken(needle) || asKey(needle) || needle.trim();
	if (!want) return null;
	return catalog.channels.find((channel) => stationKeys(channel).includes(want) || channel.slug === needle) ?? null;
}
function songPath(track) {
	return `/player/${songKey(track)}`;
}
function aliasPath(alias) {
	const slug = parseAliasToken(alias);
	return slug ? `/${slug}` : "/";
}
function trackKeys(track) {
	const keys = [
		track.id,
		track.slug,
		titleKey(track),
		songKey(track),
		...track.aliases ?? []
	];
	return [...new Set(keys.map((key) => asKey(key) || (key || "").trim()).filter(Boolean))];
}
function findSongByAlias(catalog, needle) {
	const want = parseAliasToken(needle) || asKey(needle);
	if (!want || isReservedPublicPath(want)) return null;
	for (const channel of catalog.channels) for (const track of channel.tracks) if (parseAliases(track.aliases).includes(want)) return {
		track,
		channel
	};
	return null;
}
function findPlayerSong(catalog, needle) {
	const want = (asKey(needle) || needle.trim()).toLowerCase();
	if (!want) return null;
	let byTitle = null;
	for (const channel of catalog.channels) for (const track of channel.tracks) {
		if (asKey(track.id) === want || asKey(track.slug) === want || songKey(track) === want) return {
			track,
			channel
		};
		if (!byTitle && titleKey(track) === want) byTitle = {
			track,
			channel
		};
	}
	return byTitle;
}
function slugTaken(catalog, slug, exceptTrackId = "", exceptStationSlug = "") {
	const want = asKey(slug) || parseAliasToken(slug);
	if (!want) return false;
	if (isReservedPublicPath(want)) return true;
	for (const channel of catalog.channels) {
		if (channel.slug !== exceptStationSlug && stationKeys(channel).includes(want)) return true;
		for (const track of channel.tracks) {
			if (exceptTrackId && track.id === exceptTrackId) continue;
			if (trackKeys(track).includes(want)) return true;
		}
	}
	return false;
}
//#endregion
export { findStationByAlias as a, songKey as c, stationPath as d, findStation as i, songPath as l, findPlayerSong as n, isReservedPublicPath as o, findSongByAlias as r, parseAliases as s, aliasPath as t, song_url_BbYrVN1D_exports as u };
