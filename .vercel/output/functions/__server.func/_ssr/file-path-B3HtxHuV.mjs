import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/file-path-B3HtxHuV.js
var file_path_B3HtxHuV_exports = /* @__PURE__ */ __exportAll({
	n: () => file_path_exports,
	r: () => r2KeyFromAudioUrl,
	t: () => fileLocationLabel
});
var file_path_exports = /* @__PURE__ */ __exportAll$1({
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
//#endregion
export { file_path_B3HtxHuV_exports as n, r2KeyFromAudioUrl as r, fileLocationLabel as t };
