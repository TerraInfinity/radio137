import { b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { b as usePlayerStore, i as formatClock, m as listPublicSongs } from "./player-store-4Ayk7g_Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/player-CEhC5170.js
var import_jsx_runtime = require_jsx_runtime();
function PlayerIndex() {
	usePlayerStore((s) => s.catalog);
	const songs = listPublicSongs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8 pb-44",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Directory"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Cuts"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 divide-y divide-line",
				children: songs.slice(0, 80).map(({ track, channel }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/player/$id",
							params: { id: track.id },
							className: "min-w-0 flex-1 truncate font-display text-lg",
							children: track.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden truncate text-sm text-muted sm:inline",
							children: channel.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[11px] text-subtle",
							children: formatClock(track.durationSec)
						})
					]
				}, track.id))
			})
		]
	});
}
//#endregion
export { PlayerIndex as component };
