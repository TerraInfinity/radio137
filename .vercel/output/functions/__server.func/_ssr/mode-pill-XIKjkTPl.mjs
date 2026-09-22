import { t as cn } from "./cn-BnEf6O0M.mjs";
import { f as kindLabel, m as normalizeKind } from "./catalog-DmckmNNR.mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mode-pill-XIKjkTPl.js
var import_jsx_runtime = require_jsx_runtime();
function ModePill({ kind, mode, enabled = true, nsfw = false }) {
	if (nsfw || !enabled) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "lamp" }), nsfw ? "18+" : "Off air"]
	});
	const k = normalizeKind(kind || mode);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-gold",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("lamp", k === "live" ? "lamp-live" : "") }), kindLabel(k)]
	});
}
//#endregion
export { ModePill as t };
