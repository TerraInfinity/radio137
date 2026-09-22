import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/media-ChlF6fRc.js
var media_ChlF6fRc_exports = /* @__PURE__ */ __exportAll({
	a: () => isLoopingVisual,
	c: () => media_exports,
	i: () => MEDIA_MAX_VIDEO,
	l: () => stationVisualSrc,
	n: () => MEDIA_MAX_IMAGE,
	o: () => mediaKeyFromUrl,
	r: () => MEDIA_MAX_IMAGE_PICK,
	s: () => mediaUrl,
	t: () => ART_ACCEPT,
	u: () => visualSrc
});
var media_exports = /* @__PURE__ */ __exportAll$1({
	ART_ACCEPT: () => ART_ACCEPT,
	DEFAULT_MEDIA_BASE: () => DEFAULT_MEDIA_BASE,
	MEDIA_MAX_IMAGE: () => MEDIA_MAX_IMAGE,
	MEDIA_MAX_IMAGE_PICK: () => MEDIA_MAX_IMAGE_PICK,
	MEDIA_MAX_VIDEO: () => MEDIA_MAX_VIDEO,
	isLoopingVisual: () => isLoopingVisual,
	isManagedMediaHost: () => isManagedMediaHost,
	mediaKeyFromUrl: () => mediaKeyFromUrl,
	mediaPublicBase: () => mediaPublicBase,
	mediaUrl: () => mediaUrl,
	stationVisualSrc: () => stationVisualSrc,
	visualSrc: () => visualSrc
});
/** Public media origin. Flip VITE_MEDIA_PUBLIC_BASE to move buckets without rewriting catalog URLs. */
var DEFAULT_MEDIA_BASE = "https://r2.terrainfinity.ca";
var MEDIA_MAX_IMAGE = 2097152;
var MEDIA_MAX_IMAGE_PICK = 25165824;
var MEDIA_MAX_VIDEO = 25165824;
var ART_ACCEPT = "image/*,video/*,image/heic,image/heif,image/heic-sequence,video/quicktime,video/mp4,video/webm,.heic,.heif,.jpg,.jpeg,.png,.webp,.gif,.avif,.mp4,.webm,.mov,.m4v";
var HOST_SUFFIXES = [".r2.dev", ".r2.cloudflarestorage.com"];
var HOSTS = /* @__PURE__ */ new Set(["r2.terrainfinity.ca"]);
function readEnv(name) {
	try {
		return String({
			"BASE_URL": "/",
			"DEV": false,
			"MODE": "production",
			"PROD": true,
			"SSR": true,
			"TSS_DEV_SERVER": "false",
			"TSS_DEV_SSR_STYLES_BASEPATH": "/",
			"TSS_DEV_SSR_STYLES_ENABLED": "true",
			"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
			"TSS_INLINE_CSS_ENABLED": "false",
			"TSS_ROUTER_BASEPATH": "",
			"TSS_SERVER_FN_BASE": "/_serverFn/",
			"VITE_DEV_SERVER_HOST": "0.0.0.0"
		}[name] ?? "").trim();
	} catch {
		return "";
	}
}
function mediaPublicBase() {
	return (readEnv("VITE_MEDIA_PUBLIC_BASE") || "https://r2.terrainfinity.ca").replace(/\/$/, "");
}
function extraLegacyBases() {
	return readEnv("VITE_MEDIA_LEGACY_BASES").split(",").map((item) => item.trim()).filter(Boolean);
}
function isManagedMediaHost(host) {
	const h = host.toLowerCase();
	if (HOSTS.has(h)) return true;
	if (HOST_SUFFIXES.some((suffix) => h.endsWith(suffix))) return true;
	try {
		if (new URL(mediaPublicBase()).hostname.toLowerCase() === h) return true;
	} catch {}
	for (const base of extraLegacyBases()) try {
		if (new URL(base).hostname.toLowerCase() === h) return true;
	} catch {}
	return false;
}
function mediaKeyFromUrl(url) {
	if (!url || !/^https?:\/\//i.test(url)) return null;
	try {
		const parsed = new URL(url);
		if (!isManagedMediaHost(parsed.hostname)) return null;
		return decodeURIComponent(parsed.pathname.replace(/^\/+/, "")) || null;
	} catch {
		return null;
	}
}
/** Resolve a stored cover/audio URL against the current public base. */
function mediaUrl(src) {
	if (!src) return "";
	if (src.startsWith("/") && !src.startsWith("//")) return src;
	const key = mediaKeyFromUrl(src);
	if (!key) return src;
	return `${mediaPublicBase()}/${key.split("/").map(encodeURIComponent).join("/")}`;
}
function isLoopingVisual(src) {
	if (!src) return false;
	const path = src.split("?")[0].toLowerCase();
	return /\.(mp4|webm|mov|m4v)$/.test(path);
}
function firstUrl(...urls) {
	for (const url of urls) if (url && url.trim()) return url.trim();
	return "";
}
/** Station card / hero base layer: motion first, still as fallback. */
function stationVisualSrc(channel) {
	return firstUrl(channel?.videoUrl, channel?.animationUrl, channel?.cover);
}
/** Still or looping visual for a song, falling back through station motion fields. */
function visualSrc(track, channel) {
	return firstUrl(track?.coverUrl, stationVisualSrc(channel));
}
//#endregion
export { mediaKeyFromUrl as a, stationVisualSrc as c, isLoopingVisual as i, visualSrc as l, MEDIA_MAX_IMAGE_PICK as n, mediaUrl as o, MEDIA_MAX_VIDEO as r, media_ChlF6fRc_exports as s, ART_ACCEPT as t };
