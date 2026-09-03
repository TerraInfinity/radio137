import { o as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { b as usePlayerStore, g as publicChannels, i as formatClock, l as getSong, m as listPublicSongs } from "./player-store-4Ayk7g_Y.mjs";
import { o as TrackActions } from "./router-CEym-ghm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-DqlkhuyI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Library() {
	const catalog = usePlayerStore((s) => s.catalog);
	const favorites = usePlayerStore((s) => s.favorites);
	const cueTrack = usePlayerStore((s) => s.cueTrack);
	const [tab, setTab] = (0, import_react.useState)("stations");
	const channels = (catalog.channels.length ? catalog.channels : publicChannels()).filter((channel) => channel.enabled && !channel.nsfw);
	const songs = (0, import_react.useMemo)(() => listPublicSongs(), [catalog]);
	const saved = favorites.flatMap((id) => {
		const row = getSong(id);
		return row && !row.locked ? [row] : [];
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8 pb-44",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Library"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Desk archive"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex flex-wrap gap-1",
				children: [
					["stations", "Stations"],
					["cuts", "Cuts"],
					["saved", "Favorites"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(id),
					className: `inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] ${tab === id ? "bg-fg text-bg" : "text-gold"}`,
					children: label
				}, id))
			}),
			tab === "stations" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 divide-y divide-line",
				children: channels.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/channel/$slug",
						params: { slug: channel.slug },
						className: "font-display text-xl",
						children: channel.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
						children: [
							channel.kind,
							" · ",
							channel.tracks.filter((track) => track.enabled !== false).length,
							" cuts"
						]
					})]
				}, channel.slug))
			}) : null,
			tab === "cuts" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 divide-y divide-line",
				children: songs.slice(0, 80).map(({ track, channel }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => void cueTrack(channel.slug, track.id),
								className: "min-w-0 flex-1 truncate text-left font-display text-lg",
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackActions, {
						trackId: track.id,
						compact: true
					})]
				}, track.id))
			}) : null,
			tab === "saved" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-6 divide-y divide-line",
				children: [saved.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "py-3 text-muted",
					children: "Star a cut from the player to keep it here."
				}) : null, saved.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/player/$id",
							params: { id: row.track.id },
							className: "min-w-0 flex-1 truncate font-display text-lg",
							children: row.track.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/channel/$slug",
							params: { slug: row.channel.slug },
							className: "font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
							children: row.channel.name
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackActions, {
						trackId: row.track.id,
						compact: true
					})]
				}, row.track.id))]
			}) : null
		]
	});
}
//#endregion
export { Library as component };
