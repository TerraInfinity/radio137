import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { a as mediaKeyFromUrl } from "./media-ChlF6fRc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/file-path-C0hfvhIH.js
var file_path_C0hfvhIH_exports = /* @__PURE__ */ __exportAll({
	a: () => file_path_exports,
	c: () => normalizeR2Key,
	i: () => fileLocationLabel,
	l: () => r2KeyFromAudioUrl,
	n: () => buildDeskKeyIndex,
	o: () => formatBytes,
	r: () => desksForKey,
	s: () => isAudioKey,
	t: () => audioPathParts,
	u: () => titleFromR2Key
});
var file_path_exports = /* @__PURE__ */ __exportAll$1({
	audioPathParts: () => audioPathParts,
	buildDeskKeyIndex: () => buildDeskKeyIndex,
	desksForKey: () => desksForKey,
	fileLocationLabel: () => fileLocationLabel,
	formatBytes: () => formatBytes,
	isAudioKey: () => isAudioKey,
	normalizeR2Key: () => normalizeR2Key,
	r2KeyFromAudioUrl: () => r2KeyFromAudioUrl,
	titleFromR2Key: () => titleFromR2Key
});
function r2KeyFromAudioUrl(url) {
	return mediaKeyFromUrl(url);
}
function fileLocationLabel(url) {
	const key = r2KeyFromAudioUrl(url);
	if (key) return key;
	if (!url) return "—";
	try {
		const parsed = new URL(url);
		return decodeURIComponent(parsed.pathname.replace(/^\/+/, "")) || parsed.hostname;
	} catch {
		return url;
	}
}
function audioPathParts(url) {
	const path = fileLocationLabel(url);
	const slash = path.lastIndexOf("/");
	const filename = (slash >= 0 ? path.slice(slash + 1) : path) || path;
	return {
		folder: slash >= 0 ? path.slice(0, slash) : "",
		filename,
		stem: filename.replace(/\.[a-z0-9]{2,5}$/i, "").replace(/-\d{4,}$/, "")
	};
}
function isAudioKey(key) {
	return /\.(mp3|wav|flac|m4a|ogg|aac)$/i.test(key.split("?")[0]);
}
function normalizeR2Key(key) {
	const cleaned = key.replace(/^\/+/, "").replace(/\\/g, "/");
	try {
		return decodeURIComponent(cleaned);
	} catch {
		return cleaned;
	}
}
function titleFromR2Key(key) {
	return (normalizeR2Key(key).split("/").pop() || key).replace(/\.[a-z0-9]{2,5}$/i, "").replace(/\s+/g, " ").trim() || "Untitled";
}
function formatBytes(size) {
	if (!Number.isFinite(size) || size <= 0) return "";
	if (size < 1024) return `${Math.round(size)} B`;
	if (size < 1048576) return `${Math.round(size / 1024)} KB`;
	return `${(size / 1048576).toFixed(1)} MB`;
}
/** One pass over the catalog so R2 rows can look up desks in O(1). */
function buildDeskKeyIndex(channels) {
	const map = /* @__PURE__ */ new Map();
	for (const channel of channels) for (const track of channel.tracks) {
		if (track.enabled === false) continue;
		const key = normalizeR2Key(r2KeyFromAudioUrl(track.audioUrl) || "");
		if (!key) continue;
		const list = map.get(key);
		if (list) {
			if (!list.includes(channel.slug)) list.push(channel.slug);
		} else map.set(key, [channel.slug]);
	}
	return map;
}
function desksForKey(index, key) {
	return index.get(normalizeR2Key(key)) ?? [];
}
//#endregion
export { file_path_C0hfvhIH_exports as a, normalizeR2Key as c, fileLocationLabel as i, r2KeyFromAudioUrl as l, buildDeskKeyIndex as n, formatBytes as o, desksForKey as r, isAudioKey as s, audioPathParts as t, titleFromR2Key as u };
