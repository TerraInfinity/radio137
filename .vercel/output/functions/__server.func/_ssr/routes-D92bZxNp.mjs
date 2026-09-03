import { o as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { b as usePlayerStore, d as isChannelNsfw, f as kindHint, g as publicChannels, n as cn, s as getPlayableTracks, y as stationSkin } from "./player-store-4Ayk7g_Y.mjs";
import { o as Search } from "../_libs/lucide-react.mjs";
import { t as ModePill } from "./mode-pill-4w-aT33-.mjs";
import { t as StationVisual } from "./station-visual-CkavI54R.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D92bZxNp.js
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
	const featured = (0, import_react.useMemo)(() => channels.filter((channel) => channel.enabled && channel.featured && !isChannelNsfw(channel)).sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99) || a.name.localeCompare(b.name)), [channels]);
	const [query, setQuery] = (0, import_react.useState)("");
	const visible = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		return channels.filter((channel) => {
			if (!channel.enabled || isChannelNsfw(channel)) return false;
			if (!needle) return true;
			return `${channel.name} ${channel.slug} ${channel.energy} ${channel.tags.join(" ")} ${channel.category}`.toLowerCase().includes(needle);
		});
	}, [channels, query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-8 pb-44",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Clockwork temple"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-5xl font-semibold tracking-tight",
				children: "Radio"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-prose text-muted",
				children: "A dark-elf clockwork temple. Live desks share a station clock. Fixed rooms play start to finish. Vaults wait on demand."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-8 block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
					children: "Search"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "relative mt-1 block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input pl-10",
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Name, tag, category"
					})]
				})]
			}),
			featured.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
					children: "Featured"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: featured.slice(0, 6).map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelCard, { channel }, channel.slug))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
					children: "All stations"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: visible.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelCard, { channel }, channel.slug))
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
