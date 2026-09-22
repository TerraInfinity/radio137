import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cn-BnEf6O0M.js
var cn_BnEf6O0M_exports = /* @__PURE__ */ __exportAll({
	i: () => slugify,
	n: () => cn_exports,
	r: () => formatClock,
	t: () => cn
});
var cn_exports = /* @__PURE__ */ __exportAll$1({
	cn: () => cn,
	formatClock: () => formatClock,
	slugify: () => slugify
});
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatClock(seconds, opts) {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const s = opts?.floor ? Math.floor(seconds) : Math.round(seconds);
	const h = Math.floor(s / 3600);
	const m = Math.floor(s % 3600 / 60);
	const r = s % 60;
	if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
	return `${m}:${r.toString().padStart(2, "0")}`;
}
function slugify(value) {
	return value.trim().toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
//#endregion
export { slugify as i, cn_BnEf6O0M_exports as n, formatClock as r, cn as t };
