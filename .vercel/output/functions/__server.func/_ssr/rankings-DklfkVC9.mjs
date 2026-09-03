import { o as __toESM } from "../_runtime.mjs";
import { f as isChannelNsfw, m as listPublicSongs, p as listChannels } from "./cn-UVNI8J0o.mjs";
import { B as require_react, b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as CoverArt } from "./cover-art-D1Z7wPOh.mjs";
import { n as loadFavorites } from "./favorites-C6NI1-_a.mjs";
import { n as voteRank, t as loadRanks } from "./ranks-C9jEqfnZ.mjs";
import { n as sortByPopularity, r as usePresenceStore, t as listenerLabel } from "./presence-store-dfB6t-9y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rankings-DklfkVC9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RankingsPage() {
	const presence = usePresenceStore((s) => s.snapshot);
	const [tick, setTick] = (0, import_react.useState)(0);
	const ranks = (0, import_react.useMemo)(() => {
		return loadRanks();
	}, [tick]);
	const favorites = (0, import_react.useMemo)(() => loadFavorites(), [tick]);
	const channels = (0, import_react.useMemo)(() => sortByPopularity(listChannels().filter((channel) => channel.enabled || isChannelNsfw(channel)), presence, favorites, ranks.channels), [
		favorites,
		presence,
		ranks.channels
	]);
	const songs = (0, import_react.useMemo)(() => {
		return listPublicSongs().map((row) => ({
			...row,
			score: ranks.songs[row.track.id] ?? 0
		})).sort((a, b) => b.score - a.score || a.track.title.localeCompare(b.track.title)).slice(0, 24);
	}, [ranks.songs]);
	const vote = (kind, id, delta) => {
		voteRank(kind, id, delta);
		setTick((n) => n + 1);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Dial"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold tracking-tight",
				children: "Rankings"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Stations"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 divide-y divide-line",
					children: channels.map((channel, index) => {
						const live = presence?.live[channel.slug] ?? 0;
						const listens = presence?.listens[channel.slug] ?? 0;
						const viewers = presence?.viewers[channel.slug] ?? 0;
						const views = presence?.views[channel.slug] ?? 0;
						const label = listenerLabel(live, listens, viewers, views);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex min-h-16 items-center gap-3 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-8 font-mono text-[11px] text-subtle",
									children: index + 1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
									src: channel.cover,
									alt: "",
									dimmed: !channel.enabled,
									className: "size-12 shrink-0 rounded-md"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/channel/$slug",
										params: { slug: channel.slug },
										className: "block truncate font-display text-lg",
										children: channel.skin === "glaum" ? "Glåüm" : channel.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
										children: channel.enabled ? label || channel.energy : isChannelNsfw(channel) ? "18+ · Locked" : "Off air"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-8 text-right font-mono text-[11px] tabular-nums text-gold",
									children: ranks.channels[channel.slug] ?? 0
								}),
								channel.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => vote("channels", channel.slug, 1),
										className: "inline-flex size-11 items-center justify-center font-mono text-[12px] text-muted",
										"aria-label": `Upvote ${channel.name}`,
										children: "+"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => vote("channels", channel.slug, -1),
										className: "inline-flex size-11 items-center justify-center font-mono text-[12px] text-muted",
										"aria-label": `Downvote ${channel.name}`,
										children: "−"
									})]
								}) : null
							]
						}, channel.slug);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Songs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 divide-y divide-line",
					children: songs.map(({ track, channel, score }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex min-h-14 items-center gap-3 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/player/$id",
									params: { id: track.id },
									className: "block truncate font-display text-lg",
									children: track.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
									children: channel.name
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-8 text-right font-mono text-[11px] tabular-nums text-gold",
								children: score
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => vote("songs", track.id, 1),
									className: "inline-flex size-11 items-center justify-center font-mono text-[12px] text-muted",
									"aria-label": `Upvote ${track.title}`,
									children: "+"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => vote("songs", track.id, -1),
									className: "inline-flex size-11 items-center justify-center font-mono text-[12px] text-muted",
									"aria-label": `Downvote ${track.title}`,
									children: "−"
								})]
							})
						]
					}, track.id))
				})]
			})
		]
	});
}
//#endregion
export { RankingsPage as component };
