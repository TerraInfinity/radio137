import { d as listPublicSongs } from "./catalog-BcaLbP39.mjs";
import { V as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { B as formatClock, H as usePlayerStore, P as listCutCopies, j as collapseByCanonical, r as Route$7 } from "./router-Cp-QOkSx.mjs";
import { t as DialSearch } from "./dial-search-Blih35Tk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/player-BqsluCUx.js
var import_jsx_runtime = require_jsx_runtime();
function PlayerIndex() {
	const catalog = usePlayerStore((s) => s.catalog);
	const groups = usePlayerStore((s) => s.cutGroups);
	const { q = "" } = Route$7.useSearch();
	const navigate = Route$7.useNavigate();
	const searching = q.trim().length >= 2;
	const songs = collapseByCanonical(listPublicSongs(catalog), listCutCopies(catalog), groups);
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-prose text-muted",
				children: "Every public song has its own page. Search by title, artist, tag, or filename."
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
				children: [songs.length, " public cuts. Search the box to open any one of them."]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 divide-y divide-line",
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
			})] })
		]
	});
}
//#endregion
export { PlayerIndex as component };
