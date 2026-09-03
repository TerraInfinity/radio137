import { o as __toESM } from "../_runtime.mjs";
import { d as isAdultTrack, f as isChannelNsfw, n as cn, p as listChannels, s as getPlayableTracks, t as channelIsLive } from "./cn-UVNI8J0o.mjs";
import { B as require_react, b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Search, n as Star, o as Play, s as Pause } from "../_libs/lucide-react.mjs";
import { c as liveCursor, s as usePlayerStore, u as heldClaim } from "./router-ICW3tdWz.mjs";
import { t as ModePill } from "./mode-pill-CWxrT3wM.mjs";
import { t as StationVisual } from "./station-visual-MtY7nXC_.mjs";
import { n as loadFavorites, r as toggleFavorite, t as FAV_EVENT } from "./favorites-C6NI1-_a.mjs";
import { n as sortByPopularity, r as usePresenceStore, t as listenerLabel } from "./presence-store-dfB6t-9y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BaSG08Hd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ChannelCard({ channel }) {
	const [fav, setFav] = (0, import_react.useState)(() => loadFavorites().includes(channel.slug));
	const presence = usePresenceStore((s) => s.snapshot);
	const channelSlug = usePlayerStore((s) => s.channelSlug);
	const status = usePlayerStore((s) => s.status);
	const tuneIn = usePlayerStore((s) => s.tuneIn);
	const togglePlay = usePlayerStore((s) => s.togglePlay);
	const claims = usePlayerStore((s) => s.claims);
	const identity = usePlayerStore((s) => s.identity);
	const driving = heldClaim(claims, identity);
	const live = presence?.live[channel.slug] ?? 0;
	const listens = presence?.listens[channel.slug] ?? 0;
	const viewers = presence?.viewers[channel.slug] ?? 0;
	const views = presence?.views[channel.slug] ?? 0;
	const host = presence?.host?.slug === channel.slug;
	const here = channelSlug === channel.slug;
	const playingHere = here && status === "playing";
	const spotlight = channel.spotlightTrackId ? channel.tracks.find((track) => track.id === channel.spotlightTrackId && !isAdultTrack(track)) : null;
	const label = listenerLabel(live, listens, viewers, views);
	const skin = channel.skin !== "none" && channel.enabled ? channel.skin : null;
	const locked = !channel.enabled;
	const nsfw = isChannelNsfw(channel);
	function onPlay(event) {
		event.preventDefault();
		event.stopPropagation();
		if (locked) return;
		if (playingHere) togglePlay();
		else tuneIn(channel.slug, { forcePlay: true });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("filigree-frame group relative rounded-xl p-2 shadow-[var(--shadow-filigree)] transition-[box-shadow] duration-150 ease-[var(--ease-out-smooth)] hover:shadow-[var(--shadow-border-hover)]", skin === "glaum" && "skin-glaum shadow-[var(--shadow-glaum)]", skin === "waheguru" && "skin-waheguru", driving?.slug === channel.slug && "card-buzz", locked && "opacity-70"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/channel/$slug",
					params: { slug: channel.slug },
					className: "block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationVisual, {
						channel,
						dimmed: locked,
						size: "card",
						className: "aspect-square w-full rounded-lg"
					})
				}),
				locked ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onPlay,
					className: cn("absolute bottom-3 left-3 z-10 inline-flex size-11 items-center justify-center rounded-full bg-fg text-bg shadow-[var(--shadow-border)]", playingHere && "ring-2 ring-lamp"),
					"aria-label": playingHere ? `Pause ${channel.name}` : `Play ${channel.name}`,
					children: playingHere ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 ml-0.5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFav(toggleFavorite(channel.slug).includes(channel.slug)),
					className: "absolute right-3 top-3 z-10 inline-flex size-11 items-center justify-center rounded-full bg-bg/70",
					"aria-pressed": fav,
					"aria-label": fav ? "Remove favorite" : "Add favorite",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-4", fav ? "fill-gold text-gold" : "text-muted") })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-1 pb-2 pt-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/channel/$slug",
					params: { slug: channel.slug },
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: cn("font-display text-xl font-semibold tracking-tight text-fg", skin === "glaum" && "glaum-title text-[1.35rem]"),
							children: skin === "glaum" ? "Glåüm" : channel.name
						}), locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
							children: "Locked"
						}) : driving?.slug === channel.slug ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] uppercase tracking-[0.14em] text-buzz",
							children: driving.own ? "Your booth" : "DJ held"
						}) : channel.claimable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] uppercase tracking-[0.14em] text-buzz/80",
							children: "Open booth"
						}) : host ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] uppercase tracking-[0.14em] text-glaum-soft",
							children: "Grooving"
						}) : channel.featured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] uppercase tracking-[0.14em] text-gold",
							children: "Featured"
						}) : null]
					}), locked && nsfw ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle",
						children: "18+ frequency"
					}) : skin === "glaum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "glaum-sponsor mt-0.5 font-mono text-[10px] uppercase",
						children: "Sponsored by Shrimp™"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted",
						children: channel.energy
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModePill, {
							kind: channel.kind,
							mode: channel.mode,
							enabled: channel.enabled,
							nsfw
						}),
						locked ? null : label ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: label
						}) : null,
						!locked && here ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] uppercase tracking-[0.12em] text-lamp",
							children: "You"
						}) : null,
						!locked && fav ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
							children: "Fav"
						}) : null
					]
				}),
				locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
					children: nsfw ? "Playlist hidden" : "Off the dial"
				}) : spotlight ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
					children: ["Proud pick · ", spotlight.title]
				}) : channel.tags.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
					children: channel.tags.join(" · ")
				}) : null,
				locked ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onPlay,
					className: "mt-3 inline-flex h-11 items-center gap-2 rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.16em] text-bg",
					children: [playingHere ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5" }), playingHere ? "Pause" : "Play"]
				})
			]
		})]
	});
}
function FeaturedRail({ channels, presence, favorites = [], hostSlug }) {
	const scroller = (0, import_react.useRef)(null);
	const [index, setIndex] = (0, import_react.useState)(0);
	const [paused, setPaused] = (0, import_react.useState)(false);
	const ordered = (0, import_react.useMemo)(() => {
		const ranked = sortByPopularity(channels, presence, favorites);
		if (!hostSlug) return ranked;
		const host = ranked.find((channel) => channel.slug === hostSlug);
		if (!host) return ranked;
		return [host, ...ranked.filter((channel) => channel.slug !== hostSlug)];
	}, [
		channels,
		favorites,
		hostSlug,
		presence
	]);
	(0, import_react.useEffect)(() => {
		if (ordered.length < 2 || paused) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const timer = window.setInterval(() => {
			setIndex((n) => (n + 1) % ordered.length);
		}, 6500);
		return () => window.clearInterval(timer);
	}, [ordered.length, paused]);
	(0, import_react.useEffect)(() => {
		const root = scroller.current;
		if (!root) return;
		const child = root.children[index % Math.max(ordered.length, 1)];
		if (!child) return;
		const left = child.offsetLeft;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		root.scrollTo({
			left,
			behavior: reduce ? "auto" : "smooth"
		});
	}, [index, ordered.length]);
	if (ordered.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		onPointerEnter: () => setPaused(true),
		onPointerLeave: () => setPaused(false),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: scroller,
			className: "relative flex gap-4 overflow-x-auto overflow-y-hidden pb-2 snap-x snap-mandatory overscroll-x-contain [overflow-anchor:none] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
			children: ordered.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-[min(100%,320px)] shrink-0 snap-start",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelCard, { channel })
			}, channel.slug))
		}), ordered.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 flex justify-center gap-1",
			children: ordered.map((channel, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": `Show ${channel.name}`,
				onClick: () => setIndex(i),
				className: i === index % ordered.length ? "h-2 w-6 rounded-full bg-gold" : "size-2 rounded-full bg-subtle"
			}, channel.slug))
		}) : null]
	});
}
function LiveNowStrip() {
	const catalog = usePlayerStore((s) => s.catalog);
	const ready = usePlayerStore((s) => s.ready);
	const tuneIn = usePlayerStore((s) => s.tuneIn);
	const presence = usePresenceStore((s) => s.snapshot);
	const claims = usePlayerStore((s) => s.claims);
	const identity = usePlayerStore((s) => s.identity);
	const driving = heldClaim(claims, identity);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-3 overflow-hidden",
		children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-20 w-56 shrink-0 animate-pulse rounded-lg bg-bg-elevated" }, i))
	});
	const now = Date.now();
	const live = catalog.channels.filter((channel) => channel.enabled && channelIsLive(channel)).sort((a, b) => (presence?.live[b.slug] ?? 0) - (presence?.live[a.slug] ?? 0));
	if (live.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "font-mono text-[11px] uppercase tracking-[0.16em] text-muted",
		children: "No live desks"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
		children: live.map((channel) => {
			const playable = getPlayableTracks(channel);
			const title = liveCursor(playable, now, channel.slug)?.track.title ?? (playable[0]?.title || "Signal idle");
			const label = listenerLabel(presence?.live[channel.slug] ?? 0, presence?.listens[channel.slug] ?? 0, presence?.viewers[channel.slug] ?? 0, presence?.views[channel.slug] ?? 0);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex min-h-20 min-w-72 shrink-0 items-center gap-3 rounded-lg bg-bg-elevated px-3 py-3 shadow-[var(--shadow-filigree)]", driving?.slug === channel.slug && "card-buzz"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/channel/$slug",
					params: { slug: channel.slug },
					className: "flex min-w-0 flex-1 items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationVisual, {
						channel,
						size: "thumb",
						className: "size-14 shrink-0 rounded-md"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("font-mono text-[10px] uppercase tracking-[0.18em]", driving?.slug === channel.slug ? "text-buzz" : "text-ember"),
								children: driving?.slug === channel.slug ? driving.own ? "Your booth" : "DJ held" : "Live now"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-display text-base font-semibold text-fg",
								children: channel.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-mono text-[11px] text-muted",
								children: title
							}),
							label ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
								children: label
							}) : null
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `Play ${channel.name}`,
					onClick: () => void tuneIn(channel.slug, { forcePlay: true }),
					className: "inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-fg text-bg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 ml-0.5" })
				})]
			}, channel.slug);
		})
	});
}
function Home() {
	const catalog = usePlayerStore((s) => s.catalog);
	const channels = catalog.channels.length > 0 ? catalog.channels : listChannels();
	const channelSlug = usePlayerStore((s) => s.channelSlug);
	const track = usePlayerStore((s) => s.track);
	const tuneIn = usePlayerStore((s) => s.tuneIn);
	const presence = usePresenceStore((s) => s.snapshot);
	const [query, setQuery] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [favTick, setFavTick] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const onFav = () => setFavTick((n) => n + 1);
		window.addEventListener(FAV_EVENT, onFav);
		return () => window.removeEventListener(FAV_EVENT, onFav);
	}, []);
	const favorites = (0, import_react.useMemo)(() => {
		return loadFavorites();
	}, [favTick]);
	const ranked = (0, import_react.useMemo)(() => sortByPopularity(channels.filter((channel) => channel.enabled), presence, favorites), [
		channels,
		favorites,
		presence
	]);
	const offAir = (0, import_react.useMemo)(() => channels.filter((channel) => !channel.enabled).sort((a, b) => a.name.localeCompare(b.name)), [channels]);
	const categories = (0, import_react.useMemo)(() => {
		return [
			"all",
			"popular",
			"listened",
			"viewed",
			"featured",
			"live",
			"favorites",
			...[...new Set(channels.map((channel) => channel.category).filter(Boolean))].sort()
		];
	}, [channels]);
	const visible = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		const fav = new Set(favorites);
		return (filter === "popular" || filter === "listened" || filter === "viewed" || filter === "all" && !needle ? filter === "all" ? [...ranked, ...offAir] : ranked : channels).filter((channel) => {
			if (filter === "live" && !(channel.enabled && channel.kind === "live")) return false;
			if (filter === "featured" && !channel.featured) return false;
			if (filter === "favorites" && !fav.has(channel.slug)) return false;
			if (filter === "popular" && !channel.enabled) return false;
			if (filter === "listened") return (presence?.listens[channel.slug] ?? 0) > 0;
			if (filter === "viewed") return (presence?.views[channel.slug] ?? 0) > 0;
			if (![
				"all",
				"live",
				"featured",
				"favorites",
				"popular",
				"listened",
				"viewed"
			].includes(filter) && channel.category !== filter) return false;
			if (!needle) return true;
			return `${channel.name} ${channel.energy} ${channel.tags.join(" ")} ${channel.category} ${channel.description}`.toLowerCase().includes(needle);
		});
	}, [
		channels,
		favorites,
		filter,
		offAir,
		presence,
		query,
		ranked
	]);
	const host = presence?.host;
	const featured = ranked.filter((channel) => {
		if (!channel.enabled) return false;
		if (channel.featured) return true;
		if (host?.slug === channel.slug) return true;
		return false;
	});
	const hottest = ranked.filter((channel) => (presence?.live[channel.slug] ?? 0) > 0 || (presence?.listens[channel.slug] ?? 0) > 0).slice(0, 6);
	const hostChannel = host ? channels.find((channel) => channel.slug === host.slug) : null;
	const you = channels.find((channel) => channel.slug === channelSlug);
	const hero = hostChannel ?? you ?? channels.find((channel) => channel.slug === catalog.defaultSlug) ?? ranked[0] ?? null;
	const heroLabel = hostChannel ? host?.live ? `${host.name} is grooving` : `${host?.name ?? "Desk"} last grooved here` : channelSlug === hero?.slug ? "On the dial" : "Default intro";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.28em] text-gold",
				children: "Clockwork temple"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-5xl font-semibold tracking-tight sm:text-6xl",
				children: "Radio"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-prose text-muted",
				children: "A dark-elf clockwork temple. Live desks share a station clock. The green lamp starts the first frequency. After that, this tab remembers where you were."
			}),
			hero ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: cn("filigree-frame mt-8 grid gap-4 rounded-xl bg-bg-elevated p-3 shadow-[var(--shadow-filigree)] sm:grid-cols-[160px_minmax(0,1fr)] sm:p-4", hero.skin === "glaum" && "skin-glaum", hero.skin === "waheguru" && "skin-waheguru"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationVisual, {
					channel: hero,
					size: "hero",
					className: "aspect-square w-full rounded-lg"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-col justify-center px-1 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("font-mono text-[10px] uppercase tracking-[0.18em] text-subtle", hero.skin === "glaum" && "glaum-kicker"),
							children: hero.skin === "glaum" ? "What If · Theme frequency" : heroLabel
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: cn("mt-1 font-display text-3xl font-semibold tracking-tight", hero.skin === "glaum" && "glaum-title"),
							children: hero.skin === "glaum" ? "Glåüm" : hero.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 truncate font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
							children: hero.skin === "glaum" ? "Sponsored by Shrimp™" : hostChannel && host?.trackTitle ? host.trackTitle : track && channelSlug === hero.slug ? track.title : hero.energy
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModePill, {
								kind: hero.kind,
								mode: hero.mode,
								enabled: hero.enabled
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => void tuneIn(hero.slug, { forcePlay: true }),
								className: cn("inline-flex h-11 items-center gap-2 px-4 text-[11px] uppercase", hero.skin === "glaum" ? "btn-glaum" : "rounded-md bg-fg font-mono tracking-[0.16em] text-bg"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5" }), "Tune in"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/channel/$slug",
								params: { slug: hero.slug },
								className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
								children: "Open desk"
							})]
						})
					]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-8 block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
					children: "Search stations"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "relative mt-1 block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input pl-10",
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Name, tag, category"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex gap-2 overflow-x-auto pb-1",
				children: categories.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFilter(item),
					className: filter === item ? "inline-flex h-11 shrink-0 items-center rounded-md bg-fg px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bg" : "inline-flex h-11 shrink-0 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
					children: item
				}, item))
			}),
			hottest.length > 0 && !query && filter === "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
					children: "Most listeners"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: hottest.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelCard, { channel }, channel.slug))
				})]
			}) : null,
			featured.length > 0 && !query && filter === "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
					children: "Featured"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeaturedRail, {
					channels: featured,
					presence,
					favorites,
					hostSlug: host?.slug
				})]
			}) : null,
			favorites.length > 0 && !query && filter === "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
					children: "Favorites"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: ranked.filter((channel) => favorites.includes(channel.slug)).map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelCard, { channel }, channel.slug))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
					children: "Live now"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveNowStrip, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
					children: filter === "all" && !query ? "All stations" : "Matching stations"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelGrid, { channels: visible })]
			})
		]
	});
}
function ChannelGrid({ channels }) {
	if (channels.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "No stations match."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
		children: channels.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelCard, { channel }, channel.slug))
	});
}
//#endregion
export { Home as component };
