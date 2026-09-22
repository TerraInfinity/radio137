import { c as songKey, l as songPath } from "./_ssr/song-url-BbYrVN1D.mjs";
import { o as getSong } from "./_ssr/catalog-DmckmNNR.mjs";
import { C as require_jsx_runtime, b as Navigate, y as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { y as usePlayerStore } from "./_ssr/player-store-CdB40IHB.mjs";
import { n as Route$8 } from "./_ssr/router-BjRk-_wL.mjs";
import { t as SongCut } from "./_ssr/song-cut-UPDhNxsV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-Df9WS15L.js
var import_jsx_runtime = require_jsx_runtime();
function SongPage() {
	const { id } = Route$8.useParams();
	usePlayerStore((s) => s.catalog);
	usePlayerStore((s) => s.cutGroups);
	const song = getSong(id);
	const canonical = song ? songKey(song.track) : "";
	if (song && id !== canonical) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/player/$id",
		params: { id: canonical },
		replace: true
	});
	if (!song) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-ember",
				children: "Missing song"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl font-semibold",
				children: "No such song"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-muted",
				children: "It may have been taken off a desk. Search the archive."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/player",
				search: { q: id },
				className: "mt-6 inline-flex h-12 items-center font-mono text-[12px] uppercase tracking-[0.16em] text-gold",
				children: "Search songs"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SongCut, {
		track: song.track,
		channel: song.channel,
		locked: song.locked,
		sharePath: songPath(song.track)
	});
}
//#endregion
export { SongPage as component };
