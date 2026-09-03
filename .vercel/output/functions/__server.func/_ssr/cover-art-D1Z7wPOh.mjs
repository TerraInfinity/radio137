import { n as cn } from "./cn-UVNI8J0o.mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cover-art-D1Z7wPOh.js
var import_jsx_runtime = require_jsx_runtime();
var ABSOLUTE = /^https?:\/\//i;
function resolveMediaUrl(url) {
	if (!url) return "";
	if (ABSOLUTE.test(url)) return url;
	return url;
}
function CoverArt({ src, alt, className, dimmed = false }) {
	const url = resolveMediaUrl(src);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("relative overflow-hidden bg-bg-subtle shadow-[var(--shadow-border)]", dimmed && "opacity-55 grayscale", className),
		children: url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: url,
			alt,
			className: "size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-full bg-[radial-gradient(circle_at_30%_20%,#2a2118,transparent_55%),linear-gradient(180deg,#1b1714,#070605)]" })
	});
}
//#endregion
export { resolveMediaUrl as n, CoverArt as t };
