import { o as isReservedPublicPath, t as aliasPath } from "./_ssr/song-url-BbYrVN1D.mjs";
import { c as getStationByAlias, s as getSongByAlias } from "./_ssr/catalog-DmckmNNR.mjs";
import { C as require_jsx_runtime, y as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { y as usePlayerStore } from "./_ssr/player-store-CdB40IHB.mjs";
import { o as Route$19 } from "./_ssr/router-BjRk-_wL.mjs";
import { t as ChannelView } from "./_ssr/channel-view-CFTjwjSI.mjs";
import { t as SongCut } from "./_ssr/song-cut-UPDhNxsV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_alias-2K26nAsE.js
var import_jsx_runtime = require_jsx_runtime();
function AliasPage() {
	const { alias } = Route$19.useParams();
	usePlayerStore((s) => s.catalog);
	usePlayerStore((s) => s.cutGroups);
	if (isReservedPublicPath(alias)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AliasMiss, { alias });
	const song = getSongByAlias(alias);
	if (song) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SongCut, {
		track: song.track,
		channel: song.channel,
		locked: song.locked,
		sharePath: aliasPath(alias)
	});
	const station = getStationByAlias(alias);
	if (station) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelView, {
		channel: station,
		sharePath: aliasPath(alias)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AliasMiss, { alias });
}
function AliasMiss({ alias }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-ember",
				children: "Unknown ending"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "mt-3 font-display text-4xl font-semibold",
				children: ["/", alias]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-muted",
				children: "No song or station uses that short link."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-6 inline-flex h-12 items-center font-mono text-[12px] uppercase tracking-[0.16em] text-gold",
				children: "Back to stations"
			})
		]
	});
}
//#endregion
export { AliasPage as component };
