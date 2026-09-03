import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cn-CyOQLR37.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatClock(seconds) {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const s = Math.floor(seconds);
	return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}
function slugify(value) {
	return value.trim().toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
}
//#endregion
export { formatClock as n, slugify as r, cn as t };
