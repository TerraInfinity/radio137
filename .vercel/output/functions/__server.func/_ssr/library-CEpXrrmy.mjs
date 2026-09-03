import { b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as usePlayerStore, m as publicChannels } from "./player-store-Dz5TRk6B.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-CEpXrrmy.js
var import_jsx_runtime = require_jsx_runtime();
function Library() {
	const catalog = usePlayerStore((s) => s.catalog);
	const channels = (catalog.channels.length ? catalog.channels : publicChannels()).filter((channel) => channel.enabled && !channel.nsfw);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8 pb-44",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Library"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Stations"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
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
			})
		]
	});
}
//#endregion
export { Library as component };
