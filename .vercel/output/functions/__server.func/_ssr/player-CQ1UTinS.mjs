import { r as formatClock } from "./cn-BnEf6O0M.mjs";
import { c as songKey } from "./song-url-BbYrVN1D.mjs";
import { D as durationOf, p as listPublicSongs } from "./catalog-DmckmNNR.mjs";
import { C as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { y as usePlayerStore } from "./player-store-CdB40IHB.mjs";
import { n as collapseByCanonical, o as listCutCopies } from "./cuts-DHoBzPwa.mjs";
import { r as Route$9 } from "./router-BjRk-_wL.mjs";
import { t as DialSearch } from "./dial-search-B6qTAUXC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/player-CQ1UTinS.js
var import_jsx_runtime = require_jsx_runtime();
function PlayerIndex() {
	const catalog = usePlayerStore((s) => s.catalog);
	const groups = usePlayerStore((s) => s.cutGroups);
	const { q = "" } = Route$9.useSearch();
	const navigate = Route$9.useNavigate();
	const searching = q.trim().length >= 2;
	const songs = collapseByCanonical(listPublicSongs(catalog), listCutCopies(catalog), groups);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8 pb-52",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Library"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Songs"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-prose text-muted",
				children: "Every public song has its own page. Open one to play, share, or download."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialSearch, {
					catalog,
					query: q,
					onQuery: (next) => void navigate({
						search: { q: next.trim() ? next : void 0 },
						replace: true
					}),
					heading: "Find a song"
				})
			}),
			searching ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-6 text-sm text-muted",
				children: [songs.length, " public songs."]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 divide-y divide-line",
				children: songs.map(({ track, channel }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/player/$id",
							params: { id: songKey(track) },
							className: "min-w-0 flex-1 truncate font-display text-lg",
							children: track.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden truncate text-sm text-muted sm:inline",
							children: channel.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[11px] tabular-nums text-subtle",
							children: formatClock(durationOf(track))
						})
					]
				}, track.id))
			})] })
		]
	});
}
//#endregion
export { PlayerIndex as component };
