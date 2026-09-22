import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./cn-BnEf6O0M.mjs";
import { C as stationSkin, d as kindHint, i as getPlayableTracks, u as isChannelNsfw, v as publicChannels } from "./catalog-DmckmNNR.mjs";
import { C as require_jsx_runtime, W as require_react, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { y as usePlayerStore } from "./player-store-CdB40IHB.mjs";
import { s as Route$20 } from "./router-BjRk-_wL.mjs";
import { t as ModePill } from "./mode-pill-XIKjkTPl.mjs";
import { t as StationVisual } from "./station-visual-CwReJURx.mjs";
import { t as DialSearch } from "./dial-search-B6qTAUXC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-EW8SRgCS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ChannelCard({ channel }) {
	const tuneIn = usePlayerStore((s) => s.tuneIn);
	const locked = isChannelNsfw(channel) || !channel.enabled;
	const playable = getPlayableTracks(channel);
	const skin = stationSkin(channel);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-filigree)]", skin === "glaum" && "skin-glaum", locked && "opacity-60"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/channel/$slug",
			params: { slug: channel.slug },
			className: "block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationVisual, {
				channel,
				className: "aspect-[4/3] w-full"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: cn("min-w-0 truncate font-display text-xl font-semibold", skin === "glaum" && "glaum-title"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/channel/$slug",
							params: { slug: channel.slug },
							children: channel.name
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModePill, {
						kind: channel.kind,
						mode: channel.mode,
						enabled: channel.enabled,
						nsfw: channel.nsfw
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
					children: [
						channel.energy,
						" · ",
						kindHint(channel.kind)
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 line-clamp-2 text-sm text-muted",
					children: channel.description
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: locked || playable.length === 0,
						onClick: () => void tuneIn(channel.slug, { forcePlay: true }),
						className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-60",
						children: "Play"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/channel/$slug",
						params: { slug: channel.slug },
						className: "inline-flex h-11 items-center px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
						children: "Open"
					})]
				})
			]
		})]
	});
}
function Home() {
	const catalog = usePlayerStore((s) => s.catalog);
	const channels = catalog.channels.length ? catalog.channels : publicChannels();
	const { q = "" } = Route$20.useSearch();
	const navigate = Route$20.useNavigate();
	const featured = (0, import_react.useMemo)(() => channels.filter((channel) => channel.enabled && channel.featured && !isChannelNsfw(channel)).sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99) || a.name.localeCompare(b.name)), [channels]);
	const searching = q.trim().length >= 2;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-8 pb-52",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Welcome to the Light Ages"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-5xl font-semibold tracking-tight",
				children: "Radio"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-prose text-muted",
				children: "Herein the chaos primer, bound in relative time. A radio of frequencies. Live desks keep one shared present."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 max-w-3xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialSearch, {
					catalog: catalog.channels.length ? catalog : {
						...catalog,
						channels
					},
					query: q,
					onQuery: (next) => void navigate({
						search: { q: next.trim() ? next : void 0 },
						replace: true
					}),
					heading: "Search songs & stations"
				})
			}),
			searching ? null : featured.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
					children: "Featured"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: featured.slice(0, 6).map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelCard, { channel }, channel.slug))
				})]
			}) : null,
			searching ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
					children: "All stations"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: channels.filter((channel) => channel.enabled && !isChannelNsfw(channel)).map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelCard, { channel }, channel.slug))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-10 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
				children: ["The network is quiet. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/channel/$slug",
					params: { slug: "default" },
					className: "text-gold",
					children: "Open desk"
				})]
			})
		]
	});
}
//#endregion
export { Home as component };
