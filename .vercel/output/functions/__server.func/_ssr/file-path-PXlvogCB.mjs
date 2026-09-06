import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/file-path-PXlvogCB.js
var file_path_PXlvogCB_exports = /* @__PURE__ */ __exportAll({
	i: () => r2KeyFromAudioUrl,
	n: () => fileLocationLabel,
	r: () => file_path_exports,
	t: () => audioPathParts
});
var file_path_exports = /* @__PURE__ */ __exportAll$1({
	audioPathParts: () => audioPathParts,
	fileLocationLabel: () => fileLocationLabel,
	r2KeyFromAudioUrl: () => r2KeyFromAudioUrl
});
var ABSOLUTE = /^https?:\/\//i;
function r2KeyFromAudioUrl(url) {
	if (!url || !ABSOLUTE.test(url)) return null;
	try {
		const parsed = new URL(url);
		const host = parsed.hostname.toLowerCase();
		if (host === "r2.terrainfinity.ca" || host.endsWith(".r2.dev") || host.endsWith(".r2.cloudflarestorage.com")) return decodeURIComponent(parsed.pathname.replace(/^\/+/, "")) || null;
	} catch {
		return null;
	}
	return null;
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
//#endregion
export { r2KeyFromAudioUrl as i, fileLocationLabel as n, file_path_PXlvogCB_exports as r, audioPathParts as t };
