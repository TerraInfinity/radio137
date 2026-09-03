import { m as listPublicSongs, r as formatClock } from "./cn-UVNI8J0o.mjs";
import { b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as usePlayerStore } from "./router-ICW3tdWz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/player-CQvaIS8k.js
var import_jsx_runtime = require_jsx_runtime();
function PlayerIndex() {
	const songs = listPublicSongs();
	const cueTrack = usePlayerStore((s) => s.cueTrack);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Cuts"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold tracking-tight",
				children: "Player"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted",
				children: "Public songs on the dial. 18+ cuts stay off this list."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 divide-y divide-line",
				children: songs.map(({ track, channel }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/player/$id",
						params: { id: track.id },
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-display text-lg font-semibold",
							children: track.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: [
								formatClock(track.durationSec),
								" · ",
								channel.name
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void cueTrack(channel.slug, track.id),
						className: "inline-flex h-11 items-center px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
						children: "Play"
					})]
				}, track.id))
			})
		]
	});
}
//#endregion
export { PlayerIndex as component };
