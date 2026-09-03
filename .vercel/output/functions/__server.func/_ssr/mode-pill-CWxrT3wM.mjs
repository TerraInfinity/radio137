import { n as cn } from "./cn-UVNI8J0o.mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mode-pill-CWxrT3wM.js
var import_jsx_runtime = require_jsx_runtime();
function ModePill({ mode, kind, enabled, nsfw = false }) {
	const label = !enabled ? "Off air" : kind === "experience" ? "Experience" : kind === "fixed" ? "Fixed" : kind === "on-demand" || mode === "on-demand" ? "On demand" : "Live";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("inline-flex h-7 items-center rounded-full px-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em]", !enabled && "bg-bg-subtle text-muted ring-1 ring-line", enabled && label === "Live" && "bg-ember/15 text-ember ring-1 ring-ember/40", enabled && label === "On demand" && "bg-cyan/10 text-cyan ring-1 ring-cyan/35", enabled && label === "Fixed" && "bg-gold/10 text-gold ring-1 ring-gold/35", enabled && label === "Experience" && "bg-gold/15 text-gold ring-1 ring-gold/40"),
			children: label
		}), nsfw ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "inline-flex h-7 items-center rounded-full px-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-gold ring-1 ring-gold/40",
			children: "18+"
		}) : null]
	});
}
//#endregion
export { ModePill as t };
