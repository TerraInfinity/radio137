import { o as __toESM } from "../_runtime.mjs";
import { i as isLoopingVisual } from "./media-ChlF6fRc.mjs";
import { r as formatClock, t as cn } from "./cn-BnEf6O0M.mjs";
import { c as songKey } from "./song-url-BbYrVN1D.mjs";
import { D as durationOf, a as getSeedCatalog, b as shuffleActive, h as normalizeShuffle, i as getPlayableTracks } from "./catalog-DmckmNNR.mjs";
import { a as lookForPhenomenon, c as looksEqual, g as stepPhenomenon, h as sceneFromTags, i as isStageOwned, l as mergeLookTags, m as phenomenonMeta, n as ROSE_LOOK_PRESETS, o as lookForTrack, r as captionsForPhenomenon, s as lookFromStation, t as PHENOMENA, u as mergeSceneTags } from "./phenomena-DIQMhlVR.mjs";
import { C as require_jsx_runtime, W as require_react, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as effectiveKind, y as usePlayerStore } from "./player-store-CdB40IHB.mjs";
import { n as createMiddleware, r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { t as applyCatalogEdits } from "./catalog-edits-B7ACZ19x.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { l as stationCopies } from "./cuts-DHoBzPwa.mjs";
import { C as Palette, D as Maximize, F as Ellipsis, L as CircleAlert, N as GripVertical, O as Lock, S as Pause, T as MessageSquare, V as ChevronDown, W as ArrowUpDown, b as Pin, f as Shuffle, g as RotateCw, h as Search, m as Send, t as X, w as Minimize, y as Play, z as ChevronRight } from "../_libs/lucide-react.mjs";
import { $ as reorderStationTracks, D as useRadioUser, J as patchStationTrack, V as listCutSkips, _ as CoverArt, f as MarqueeTitle, nt as saveStation, v as AdminRename } from "./router-BjRk-_wL.mjs";
import { n as FoldDetails, o as useDurationClock, t as ArtUpload } from "./duration-probe-Cc9x2Byq.mjs";
import { n as AdminTrackTools, t as AdminStationEdit } from "./admin-track-tools-Jp5gX6Ea.mjs";
import { a as threadStorageKey, t as ROSE_GROK_STARTERS } from "./rose-grok-BU1OT2-C.mjs";
import { t as playlistDuplicateHints } from "./similar-cuts-BE0d4_OA.mjs";
import { n as ghostDropIds, t as GhostCleaner } from "./ghost-cleaner-DB9pD8oZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rose-opera-CKiFrD1M.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function applySnapshot(tracks, stations) {
	usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}
var SPAN_KEY = "radio.playlist.span.v1";
var PRESETS = [
	3,
	5,
	10
];
function loadSpan() {
	if (typeof window === "undefined") return {
		mode: "5",
		custom: 8
	};
	try {
		const raw = window.localStorage.getItem(SPAN_KEY);
		if (!raw) return {
			mode: "5",
			custom: 8
		};
		const parsed = JSON.parse(raw);
		return {
			mode: parsed.mode === "3" || parsed.mode === "5" || parsed.mode === "10" || parsed.mode === "all" || parsed.mode === "custom" ? parsed.mode : "5",
			custom: Number.isFinite(parsed.custom) ? Math.min(99, Math.max(1, Math.round(Number(parsed.custom)))) : 8
		};
	} catch {
		return {
			mode: "5",
			custom: 8
		};
	}
}
function saveSpan(next) {
	try {
		window.localStorage.setItem(SPAN_KEY, JSON.stringify(next));
	} catch {}
}
function upcomingFrom(tracks, nowId, wrap) {
	if (tracks.length === 0) return [];
	const index = nowId ? tracks.findIndex((track) => track.id === nowId) : -1;
	if (index < 0) return tracks;
	const rest = tracks.slice(index + 1);
	return wrap ? rest.concat(tracks.slice(0, index)) : rest;
}
function stillCover(track, channel) {
	const song = track.coverUrl || "";
	if (song && !isLoopingVisual(song)) return song;
	const station = channel.cover || "";
	if (station && !isLoopingVisual(station)) return station;
	return song || station;
}
function StationPlaylist({ channel, locked = false, onUnlock, startOpen = false }) {
	const { isAdmin } = useRadioUser();
	const sealed = Boolean(locked && !isAdmin);
	const cueTrack = usePlayerStore((s) => s.cueTrack);
	const nowId = usePlayerStore((s) => s.channelSlug === channel.slug ? s.track?.id : null);
	const playing = usePlayerStore((s) => s.channelSlug === channel.slug && s.status === "playing");
	const listenMode = usePlayerStore((s) => s.listenModeSession ?? s.listenMode);
	const shufflePref = usePlayerStore((s) => Boolean(s.shuffleBySlug[channel.slug]));
	const cutGroups = usePlayerStore((s) => s.cutGroups);
	const tracks = getPlayableTracks(channel);
	const mixing = shuffleActive(channel, shufflePref);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [dragId, setDragId] = (0, import_react.useState)(null);
	const [arrange, setArrange] = (0, import_react.useState)(false);
	const [filter, setFilter] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(startOpen);
	const [toolId, setToolId] = (0, import_react.useState)(null);
	const [span, setSpan] = (0, import_react.useState)({
		mode: "5",
		custom: 8
	});
	const [skipKeys, setSkipKeys] = (0, import_react.useState)([]);
	const wrap = effectiveKind(channel, listenMode) !== "fixed";
	const upcoming = (0, import_react.useMemo)(() => upcomingFrom(tracks, nowId ?? null, wrap), [
		tracks,
		nowId,
		wrap
	]);
	const totalSec = tracks.reduce((sum, track) => sum + durationOf(track), 0);
	const remainSec = upcoming.reduce((sum, track) => sum + durationOf(track), 0);
	const ghosts = (0, import_react.useMemo)(() => isAdmin ? ghostDropIds(channel.tracks) : /* @__PURE__ */ new Set(), [channel.tracks, isAdmin]);
	const dupes = (0, import_react.useMemo)(() => {
		if (!isAdmin) return /* @__PURE__ */ new Map();
		return playlistDuplicateHints(stationCopies(channel), cutGroups, skipKeys);
	}, [
		channel,
		cutGroups,
		isAdmin,
		skipKeys,
		tracks
	]);
	(0, import_react.useEffect)(() => {
		setSpan(loadSpan());
	}, []);
	(0, import_react.useEffect)(() => {
		if (!isAdmin) return;
		listCutSkips().then((data) => setSkipKeys(data.keys)).catch(() => setSkipKeys([]));
	}, [isAdmin]);
	(0, import_react.useEffect)(() => {
		setOpen(startOpen);
		setArrange(false);
		setFilter("");
		setToolId(null);
	}, [channel.slug, startOpen]);
	function pickSpan(mode, custom = span.custom) {
		const next = {
			mode,
			custom
		};
		setSpan(next);
		saveSpan(next);
		if (mode !== "all") setArrange(false);
	}
	const needle = filter.trim().toLowerCase();
	const showAll = open && (span.mode === "all" || mixing);
	const limit = !open ? 1 : span.mode === "all" ? tracks.length : span.mode === "custom" ? Math.min(Math.max(1, span.custom), tracks.length) : Math.min(Number(span.mode), tracks.length);
	const source = showAll ? tracks : upcoming;
	const filtered = (0, import_react.useMemo)(() => {
		if (!showAll || !needle) return source;
		return source.filter((track) => `${track.title} ${track.artist}`.toLowerCase().includes(needle));
	}, [
		needle,
		showAll,
		source
	]);
	const visible = showAll ? filtered.slice(0, span.mode === "all" || needle ? filtered.length : limit) : source.slice(0, Math.max(0, limit));
	const hiddenCount = showAll && !needle && span.mode !== "all" ? Math.max(0, filtered.length - visible.length) : !showAll && open ? Math.max(0, upcoming.length - visible.length) : 0;
	async function persist(ids) {
		const hidden = channel.tracks.filter((track) => track.enabled === false).map((track) => track.id);
		setBusy(true);
		try {
			const result = await reorderStationTracks({ data: {
				channelSlug: channel.slug,
				trackIds: [...ids, ...hidden]
			} });
			applySnapshot(result.tracks, result.stations);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Could not reorder");
		} finally {
			setBusy(false);
		}
	}
	function move(index, dir) {
		const ids = tracks.map((track) => track.id);
		const next = index + dir;
		if (next < 0 || next >= ids.length) return;
		[ids[index], ids[next]] = [ids[next], ids[index]];
		persist(ids);
	}
	function dropOn(targetId) {
		if (!dragId || dragId === targetId) {
			setDragId(null);
			return;
		}
		const ids = tracks.map((track) => track.id);
		const from = ids.indexOf(dragId);
		const to = ids.indexOf(targetId);
		if (from < 0 || to < 0) {
			setDragId(null);
			return;
		}
		ids.splice(from, 1);
		ids.splice(to, 0, dragId);
		setDragId(null);
		persist(ids);
	}
	const canArrange = Boolean(isAdmin && open && span.mode === "all" && !needle);
	const nowTrack = nowId ? tracks.find((item) => item.id === nowId) ?? null : null;
	const nextTrack = mixing ? null : upcoming[0];
	useDurationClock(open ? visible : [nowTrack, nextTrack].filter(Boolean));
	if (sealed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "mt-6 overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-border)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rose-desk-lock",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3.5" }), "Desk sealed"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl text-fg",
					children: "Playlist sealed until the rite begins."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Start from the first song on the stage above. Cinema is fullscreen only — it does not unlock the desk."
				}),
				onUnlock ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onUnlock,
					className: "mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
					children: "Begin the rite on the stage"
				}) : null
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6 overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 px-3 py-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setOpen((value) => !value),
					"aria-expanded": open,
					className: "flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
							children: open ? "Playlist" : mixing ? "Up next · mixed" : "Up next"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted",
							children: busy ? "Saving…" : open ? [
								`${tracks.length} song${tracks.length === 1 ? "" : "s"}`,
								tracks.length ? formatClock(totalSec) : null,
								mixing ? "mix on" : null,
								!showAll && upcoming.length ? `${visible.length} next` : null,
								needle ? `${visible.length} match` : null,
								isAdmin && dupes.size > 0 ? `${dupes.size} possible duplicates` : null
							].filter(Boolean).join(" · ") : mixing ? `${tracks.length} in the mix` : nextTrack ? `${upcoming.length} left · ${formatClock(remainSec)}` : tracks.length ? "Last song on the desk" : "Empty desk"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-4 shrink-0 text-gold transition-transform duration-200", open && "rotate-180") })]
				}), isAdmin && open && span.mode === "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setArrange((value) => !value),
					"aria-pressed": arrange,
					className: "inline-flex h-11 shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-gold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "size-3.5" }), arrange ? "Done" : "Arrange"]
				}) : null]
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 px-3 pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "playlist-span",
					role: "group",
					"aria-label": "How many songs to show",
					children: [
						PRESETS.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": span.mode === String(n),
							onClick: () => pickSpan(String(n)),
							className: "inline-flex h-11 min-w-11 items-center justify-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
							children: n
						}, n)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": span.mode === "all",
							onClick: () => pickSpan("all"),
							className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
							children: "All"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": span.mode === "custom",
							onClick: () => pickSpan("custom"),
							className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
							children: "Custom"
						})
					]
				}), span.mode === "custom" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "inline-flex size-11 items-center justify-center font-mono text-gold",
							"aria-label": "Fewer songs",
							onClick: () => pickSpan("custom", Math.max(1, span.custom - 1)),
							children: "−"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "input h-11 w-14 px-2 text-center",
							type: "number",
							min: 1,
							max: 99,
							value: span.custom,
							"aria-label": "Custom playlist length",
							onChange: (event) => {
								pickSpan("custom", Math.min(99, Math.max(1, Number(event.target.value) || 1)));
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "inline-flex size-11 items-center justify-center font-mono text-gold",
							"aria-label": "More songs",
							onClick: () => pickSpan("custom", Math.min(99, span.custom + 1)),
							children: "+"
						})
					]
				}) : null]
			}) : null,
			open && showAll && tracks.length > 6 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3 pb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "relative block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input pl-9",
						value: filter,
						onChange: (event) => setFilter(event.target.value),
						placeholder: "Find a song",
						type: "search",
						"aria-label": "Find a song in this playlist"
					})]
				})
			}) : null,
			isAdmin && open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3 pb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostCleaner, {
					channel,
					compact: true
				})
			}) : null,
			canArrange && arrange ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShufflePolicy, { channel }) : null,
			tracks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 pb-3 text-sm text-muted",
				children: "Nothing on this desk yet."
			}) : !open && mixing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setOpen(true),
				className: "playlist-next text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-12 shrink-0 place-items-center rounded-md bg-bg text-gold",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-display text-base font-semibold text-fg",
						children: "Next song is mixed"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 block text-sm text-muted",
						children: "Open the playlist to browse or pick one."
					})]
				})]
			}) : !open && (nowId || nextTrack) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "playlist-peek",
				children: [
					nowTrack ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => void cueTrack(channel.slug, nowTrack.id),
						className: "playlist-next is-now",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "playlist-next-art",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
								src: stillCover(nowTrack, channel),
								alt: "",
								className: "size-full",
								motion: "still"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
									children: playing ? "Now playing" : "On the needle"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarqueeTitle, {
									text: nowTrack.title,
									className: "font-display text-lg font-semibold text-fg"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-0.5 block truncate text-sm text-muted",
									children: [
										nowTrack.artist || "Unknown",
										" · ",
										formatClock(durationOf(nowTrack))
									]
								})
							]
						})]
					}) : null,
					nextTrack ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "playlist-next-wrap",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void cueTrack(channel.slug, nextTrack.id),
							className: "playlist-next",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "playlist-next-art",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
										src: stillCover(nextTrack, channel),
										alt: "",
										className: "size-full",
										motion: "still"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "block font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
											children: ["Up next", upcoming.length > 1 ? ` · ${upcoming.length} left · ${formatClock(remainSec)}` : ""]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarqueeTitle, {
											text: nextTrack.title,
											className: "font-display text-base font-semibold text-fg"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-0.5 block truncate text-sm text-muted",
											children: [
												nextTrack.artist || "Unknown",
												" · ",
												formatClock(durationOf(nextTrack))
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-gold",
									children: "Play"
								})
							]
						}), isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTrackTools, {
							slug: channel.slug,
							track: nextTrack,
							compact: true
						}) : null]
					}) : nowTrack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-3 pb-3 text-sm text-muted",
						children: "Last song on the desk. Open the playlist to go back through the list."
					}) : null,
					upcoming.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "playlist-strip",
						children: [upcoming.slice(1, 5).map((track, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void cueTrack(channel.slug, track.id),
							className: "playlist-strip-item",
							title: track.title,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
								src: stillCover(track, channel),
								alt: "",
								className: "size-full",
								motion: "still"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: i + 2 })]
						}, track.id)), upcoming.length > 5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setOpen(true),
							className: "playlist-strip-more",
							children: ["+", upcoming.length - 5]
						}) : null]
					}) : null
				]
			}) : !open && !nextTrack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 pb-3 text-sm text-muted",
				children: "Last song on the desk. Open the playlist to go back through the list."
			}) : visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 pb-3 text-sm text-muted",
				children: needle ? "No songs match that name." : "Last song on the desk."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: cn("border-t border-line px-2 py-1", visible.length > 7 && "playlist-scroller"),
				children: visible.map((track, queueIndex) => {
					const index = tracks.findIndex((item) => item.id === track.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaylistRow, {
						channel,
						track,
						index: showAll ? index : queueIndex,
						current: nowId === track.id,
						playing: playing && nowId === track.id,
						admin: Boolean(isAdmin),
						arrange: canArrange && arrange,
						tools: Boolean(isAdmin && (arrange || toolId === track.id)),
						dragging: dragId === track.id,
						onCue: () => void cueTrack(channel.slug, track.id),
						onUp: () => move(index, -1),
						onDown: () => move(index, 1),
						onDragStart: () => setDragId(track.id),
						onDrop: () => dropOn(track.id),
						onDragEnd: () => setDragId(null),
						onTools: () => setToolId((id) => id === track.id ? null : track.id),
						duplicate: isAdmin ? dupes.get(track.id) : void 0,
						ghost: isAdmin ? ghosts.has(track.id) : false
					}, track.id);
				})
			}),
			open && hiddenCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => pickSpan("all"),
				className: "flex h-11 w-full items-center justify-center border-t border-line font-mono text-[10px] uppercase tracking-[0.14em] text-gold",
				children: [
					"+",
					hiddenCount,
					" more"
				]
			}) : null
		]
	});
}
function PlaylistRow({ channel, track, index, current, playing, admin, arrange, tools, dragging, onCue, onUp, onDown, onDragStart, onDrop, onDragEnd, onTools, duplicate, ghost }) {
	const scene = sceneFromTags(track.tags);
	const sceneLabel = scene?.phenomenon ? PHENOMENA.find((item) => item.id === scene.phenomenon)?.label : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: cn("playlist-row", current && "playlist-row-now", ghost && "playlist-row-ghost", dragging && "opacity-40"),
		"aria-current": current ? "true" : void 0,
		onDragOver: (event) => {
			if (!admin || !arrange) return;
			event.preventDefault();
		},
		onDrop: (event) => {
			if (!admin || !arrange) return;
			event.preventDefault();
			onDrop();
		},
		children: [
			admin && arrange ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				draggable: true,
				onDragStart: (event) => {
					event.dataTransfer.effectAllowed = "move";
					event.dataTransfer.setData("text/plain", track.id);
					onDragStart();
				},
				onDragEnd,
				"aria-label": "Drag to reorder",
				className: "grid size-11 shrink-0 place-items-center text-subtle",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "size-4" })
			}) : playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "vu-meter vu-meter-on w-7 shrink-0 justify-center",
				"aria-hidden": true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-7 shrink-0 text-center font-mono text-[10px] tabular-nums text-subtle",
				children: String(index + 1).padStart(2, "0")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onCue,
				className: "flex min-w-0 flex-1 basis-40 items-center gap-3 overflow-hidden py-1 text-left",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "relative size-12 shrink-0 overflow-hidden rounded-md bg-bg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
							src: stillCover(track, channel),
							alt: "",
							className: "size-full",
							motion: "still"
						}), admin && (duplicate || ghost) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "playlist-dupe absolute top-0.5 right-0.5 inline-flex size-4 items-center justify-center rounded-full bg-bg",
							title: ghost ? "Ghost copy — extra row of a song already here" : `Possible duplicate · ${duplicate}`,
							"aria-label": ghost ? "Ghost copy" : `Possible duplicate: ${duplicate}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3.5" })
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarqueeTitle, {
							text: track.title,
							className: cn("text-sm font-medium", current && "text-gold")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.1em] text-subtle",
							children: [
								track.artist || "Unknown",
								sceneLabel,
								ghost ? "ghost copy" : duplicate ? "possible duplicate" : null
							].filter(Boolean).join(" · ")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-14 shrink-0 text-right font-mono text-[11px] tabular-nums text-muted",
						children: formatClock(durationOf(track))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/player/$id",
				params: { id: songKey(track) },
				"aria-label": `Open ${track.title}`,
				className: "inline-flex size-11 shrink-0 items-center justify-center text-gold",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
			}),
			admin && !arrange ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTrackTools, {
				slug: channel.slug,
				track,
				compact: true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onTools,
				"aria-expanded": tools,
				"aria-label": "Song tools",
				className: "inline-flex size-11 shrink-0 items-center justify-center text-gold",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
			})] }) : null,
			admin && arrange ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onUp,
				className: "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
				children: "Up"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onDown,
				className: "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
				children: "Down"
			})] }) : null,
			admin && tools ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex w-full flex-wrap items-center justify-end gap-1 pb-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminRename, {
					slug: channel.slug,
					track,
					compact: true
				})
			}) : null
		]
	});
}
function AdminShufflePolicy({ channel }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const current = normalizeShuffle(channel.shuffle);
	async function setMode(shuffle) {
		if (shuffle === current) return;
		setBusy(true);
		try {
			const result = await saveStation({ data: {
				slug: channel.slug,
				shuffle
			} });
			applySnapshot(result.tracks, result.stations);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Could not save shuffle");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-1 border-t border-line px-3 py-2",
		children: [
			["off", "Fixed order"],
			["optional", "Guests can toggle"],
			["on", "Always shuffle"]
		].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			disabled: busy,
			onClick: () => void setMode(id),
			className: cn("inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em]", current === id ? "bg-fg text-bg" : "text-gold"),
			children: label
		}, id))
	});
}
function Slider({ label, value, min, max, step, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "rose-atelier-row",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "range",
				min,
				max,
				step,
				value,
				onChange: (event) => onChange(Number(event.target.value))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: Number.isInteger(step) ? value : value.toFixed(2) })
		]
	});
}
function RoseAtelier({ channel, track, look, saved, onLook, onClose }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [hint, setHint] = (0, import_react.useState)("");
	const dirty = !looksEqual(look, saved);
	function patch(next) {
		onLook({
			...look,
			...next
		});
	}
	async function publish() {
		setBusy(true);
		setHint("Saving look…");
		try {
			const result = await saveStation({ data: {
				slug: channel.slug,
				tags: mergeLookTags(channel.tags, look),
				cover: look.stillUrls[0] || channel.cover,
				animationUrl: look.loopUrl || void 0,
				videoUrl: look.loopUrl || void 0
			} });
			usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
			setHint("Look is live on the station.");
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Could not save look");
			setHint("");
		} finally {
			setBusy(false);
		}
	}
	async function publishSong() {
		if (!track) {
			window.alert("Play a song first so this scene has a cut to pin.");
			return;
		}
		setBusy(true);
		setHint("Pinning this song…");
		try {
			const result = await patchStationTrack({ data: {
				channelSlug: channel.slug,
				trackId: track.id,
				tags: mergeSceneTags(track.tags, look)
			} });
			usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
			setHint(`Pinned to ${track.title}.`);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Could not save song scene");
			setHint("");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "rose-atelier",
		"aria-label": "Experience atelier",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rose-desk-bar",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rose-desk-kicker",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "size-3.5" }), "Atelier"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rose-opera-ghost",
					onClick: onClose,
					"aria-label": "Close atelier",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rose-atelier-note",
				children: "Tweak live, or tap the look chip on the stage to cycle scenes. Grok can talk a cut into a look. Pin a song if you want that override to stick."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rose-atelier-presets",
				children: PHENOMENA.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": look.phenomenon === item.id,
					className: "rose-opera-ghost",
					title: item.hint,
					onClick: () => patch({ phenomenon: item.id }),
					children: item.label
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rose-atelier-hint",
				children: PHENOMENA.find((item) => item.id === look.phenomenon)?.hint
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rose-atelier-presets",
				children: ROSE_LOOK_PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rose-opera-ghost",
					onClick: () => patch(preset.patch),
					children: preset.label
				}, preset.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				label: "Fly",
				value: look.fly,
				min: 0,
				max: 2,
				step: .05,
				onChange: (fly) => patch({ fly })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				label: "Punch",
				value: look.intensity,
				min: 0,
				max: 2,
				step: .05,
				onChange: (intensity) => patch({ intensity })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				label: "BPM",
				value: look.bpm,
				min: 0,
				max: 180,
				step: 1,
				onChange: (bpm) => patch({ bpm })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rose-atelier-hint",
				children: look.bpm ? `${look.bpm} locks the grid` : "0 follows the song tag"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				label: "Stills",
				value: look.stills,
				min: 0,
				max: 1,
				step: .05,
				onChange: (stills) => patch({ stills })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				label: "Loop",
				value: look.loop,
				min: 0,
				max: 1,
				step: .05,
				onChange: (loop) => patch({ loop })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				label: "Stars",
				value: look.stars,
				min: 20,
				max: 200,
				step: 1,
				onChange: (stars) => patch({ stars })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				label: "Glyphs",
				value: look.glyphs,
				min: 0,
				max: 32,
				step: 1,
				onChange: (glyphs) => patch({ glyphs })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				label: "Rings",
				value: look.rings,
				min: 0,
				max: 36,
				step: 1,
				onChange: (rings) => patch({ rings })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rose-atelier-toggles",
				children: [
					"box",
					"bolts",
					"petals"
				].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": look[key],
					className: "rose-opera-ghost",
					onClick: () => patch({ [key]: !look[key] }),
					children: key
				}, key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "rose-atelier-copy",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Captions · one per line, walk with the phrase" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "input",
					rows: 4,
					value: look.captions.join("\n"),
					onChange: (event) => patch({ captions: event.target.value.split("\n") })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FoldDetails, {
				title: "Loop and stills",
				hint: "Art",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rose-desk-kicker",
						children: "Loop video"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input",
						value: look.loopUrl,
						onChange: (event) => patch({ loopUrl: event.target.value }),
						placeholder: "Looping mp4 / webm URL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtUpload, {
						slug: channel.slug,
						current: look.loopUrl,
						onUrl: (url) => patch({ loopUrl: url })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rose-desk-kicker",
						children: "Stills"
					}),
					Array.from({ length: 4 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rose-atelier-still",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "input",
							value: look.stillUrls[index] ?? "",
							placeholder: `Still ${index + 1}`,
							onChange: (event) => {
								const stillUrls = [...look.stillUrls];
								stillUrls[index] = event.target.value;
								patch({ stillUrls });
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtUpload, {
							slug: channel.slug,
							current: look.stillUrls[index],
							onUrl: (url, kind) => {
								if (kind === "video") {
									patch({ loopUrl: url });
									return;
								}
								const stillUrls = [...look.stillUrls];
								stillUrls[index] = url;
								patch({ stillUrls });
							}
						})]
					}, index))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rose-atelier-save",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "rose-opera-begin",
						disabled: busy || !dirty,
						onClick: () => void publish(),
						children: busy ? "Saving" : dirty ? "Save station look" : "Station saved"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "rose-opera-ghost",
						disabled: busy || !track,
						onClick: () => void publishSong(),
						children: track ? "Pin this song" : "Play a song to pin"
					}),
					dirty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "rose-opera-ghost",
						onClick: () => onLook(saved),
						children: "Revert"
					}) : null
				]
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rose-atelier-hint",
				children: hint
			}) : null
		]
	});
}
var adminMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-nKCa1E1y.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-B5IRAOYQ.mjs").then((n) => n.n);
	const { requireAdmin } = await import("./sso.server-NSJ3vLzw.mjs").then((n) => n.p);
	assertSameSiteRequest();
	return next({ context: { user: await requireAdmin(context.bearerToken) } });
});
var lookShape = object({
	bpm: number(),
	fly: number(),
	intensity: number(),
	stills: number(),
	loop: number(),
	stars: number(),
	glyphs: number(),
	rings: number(),
	petals: boolean(),
	bolts: boolean(),
	box: boolean(),
	phenomenon: string(),
	captions: array(string()),
	stillUrls: array(string()),
	loopUrl: string()
});
var inputShape = object({
	prompt: string().trim().min(1).max(1200),
	stationSlug: string().min(1).max(80),
	trackId: string().max(120).optional(),
	trackTitle: string().max(200).optional(),
	artist: string().max(160).optional(),
	look: lookShape,
	history: array(object({
		role: _enum(["user", "assistant"]),
		content: string().max(1600)
	})).max(10).optional()
});
var directRoseLook = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => inputShape.parse(input)).handler(createSsrRpc("6d9a4c36e4fa94358d626ce6220b0261d71242f3bc3a9bdacc4770f584b1c569"));
function readThread(key) {
	try {
		const raw = sessionStorage.getItem(key);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.slice(-16) : [];
	} catch {
		return [];
	}
}
function RoseGrokChat({ channel, track, look, onLook, onClose }) {
	const lookRef = (0, import_react.useRef)(look);
	lookRef.current = look;
	const key = threadStorageKey(channel.slug, track?.id);
	const [messages, setMessages] = (0, import_react.useState)(() => typeof window === "undefined" ? [] : readThread(key));
	const [draft, setDraft] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [hint, setHint] = (0, import_react.useState)("");
	const logRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setMessages(readThread(key));
		setHint("");
	}, [key]);
	(0, import_react.useEffect)(() => {
		try {
			sessionStorage.setItem(key, JSON.stringify(messages.slice(-16)));
		} catch {}
	}, [key, messages]);
	(0, import_react.useEffect)(() => {
		const el = logRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [messages, busy]);
	async function pinSong(next) {
		if (!track) {
			setHint("Play a song first, then pin.");
			return;
		}
		setBusy(true);
		setHint("Pinning this song…");
		try {
			const result = await patchStationTrack({ data: {
				channelSlug: channel.slug,
				trackId: track.id,
				tags: mergeSceneTags(track.tags, next)
			} });
			usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
			setHint(`Pinned to ${track.title}.`);
		} catch (error) {
			setHint(error instanceof Error ? error.message : "Could not pin this song");
		} finally {
			setBusy(false);
		}
	}
	async function saveStationLook(next) {
		setBusy(true);
		setHint("Saving station look…");
		try {
			const result = await saveStation({ data: {
				slug: channel.slug,
				tags: mergeLookTags(channel.tags, next),
				cover: next.stillUrls[0] || channel.cover,
				animationUrl: next.loopUrl || void 0,
				videoUrl: next.loopUrl || void 0
			} });
			usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
			setHint("Station look is live.");
		} catch (error) {
			setHint(error instanceof Error ? error.message : "Could not save station look");
		} finally {
			setBusy(false);
		}
	}
	async function send(text) {
		const prompt = text.trim();
		if (!prompt || busy) return;
		setDraft("");
		const history = messages.slice(-8);
		setMessages((list) => [...list, {
			role: "user",
			content: prompt
		}]);
		setBusy(true);
		setHint("Grok is directing…");
		try {
			const result = await directRoseLook({ data: {
				prompt,
				stationSlug: channel.slug,
				trackId: track?.id,
				trackTitle: track?.title,
				artist: track?.artist,
				look: lookRef.current,
				history
			} });
			if (!result.ok) {
				setMessages((list) => [...list, {
					role: "assistant",
					content: result.error
				}]);
				setHint(result.error);
				return;
			}
			if (result.changed) onLook(result.look);
			setMessages((list) => [...list, {
				role: "assistant",
				content: result.reply
			}]);
			if (result.pin) {
				if (track) await pinSong(result.look);
				else await saveStationLook(result.look);
			} else setHint(result.changed ? "Live on the stage. Pin the song to keep it." : "No look change.");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Grok could not reach the stage.";
			setMessages((list) => [...list, {
				role: "assistant",
				content: message
			}]);
			setHint(message);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "rose-grok",
		"aria-label": "Grok director",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rose-desk-bar",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rose-desk-kicker",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-3.5" }),
						"Grok · ",
						track?.title || "Station look"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rose-opera-ghost",
					onClick: onClose,
					"aria-label": "Close Grok",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rose-atelier-note",
				children: "Talk the rite into shape. Changes land live on this cut; pin to keep them after refresh."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: logRef,
				className: "rose-grok-log",
				children: messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rose-atelier-hint",
					children: "No thread yet for this song. Try a starter, or describe the phenomenon you want."
				}) : messages.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: item.role === "user" ? "rose-grok-you" : "rose-grok-them",
					children: item.content
				}, `${item.role}-${index}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rose-atelier-presets",
				children: ROSE_GROK_STARTERS.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rose-opera-ghost",
					disabled: busy,
					onClick: () => void send(line),
					children: line
				}, line))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "rose-grok-form",
				onSubmit: (event) => {
					event.preventDefault();
					send(draft);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "sr-only",
						htmlFor: "rose-grok-input",
						children: "Direct this song"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						id: "rose-grok-input",
						rows: 2,
						value: draft,
						disabled: busy,
						placeholder: "Tell Grok how this song should look…",
						onChange: (event) => setDraft(event.target.value),
						onKeyDown: (event) => {
							if (event.key === "Enter" && !event.shiftKey) {
								event.preventDefault();
								send(draft);
							}
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "submit",
						className: "rose-opera-begin",
						disabled: busy || !draft.trim(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3.5" }), "Send"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rose-atelier-save",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "rose-opera-ghost",
					disabled: busy || !track,
					onClick: () => void pinSong(look),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: "size-3.5" }), "Pin this song"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rose-opera-ghost",
					disabled: busy,
					onClick: () => void saveStationLook(look),
					children: "Save station look"
				})]
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rose-atelier-hint",
				children: hint
			}) : null
		]
	});
}
var BEATS_IN_BAR = 4;
var BARS_IN_PHRASE = 8;
function bpmFromTags(tags, fallback = 120) {
	if (!tags) return clampBpm(fallback);
	for (const tag of tags) {
		const match = String(tag).match(/(?:^|\b)bpm[:\s-]?(\d{2,3})(?:\b|$)/i);
		if (match) return clampBpm(Number(match[1]));
	}
	return clampBpm(fallback);
}
function clampBpm(value) {
	if (!Number.isFinite(value)) return 120;
	return Math.min(200, Math.max(70, Math.round(value)));
}
function envelope(phase, width = .18) {
	if (phase < 0 || phase > width) return 0;
	return Math.exp(-phase / (width * .38));
}
function pulseAt(timeSec, bpm, playing = true) {
	const tempo = clampBpm(bpm);
	const t = Math.max(0, Number.isFinite(timeSec) ? timeSec : 0);
	const beatFloat = t / (60 / tempo);
	const beatIndex = Math.floor(beatFloat);
	const beatPhase = beatFloat - beatIndex;
	const barBeat = (beatIndex % BEATS_IN_BAR + BEATS_IN_BAR) % BEATS_IN_BAR;
	const barPhase = (barBeat + beatPhase) / BEATS_IN_BAR;
	const phraseBeats = 32;
	const phrasePhase = (beatFloat % phraseBeats + phraseBeats) % phraseBeats / phraseBeats;
	const kick = Math.max(envelope(beatPhase), barBeat % 2 === 0 ? envelope(beatPhase, .22) * .85 : 0);
	const snare = barBeat === 1 || barBeat === 3 ? envelope(beatPhase, .16) : 0;
	const downbeat = barBeat === 0 ? envelope(beatPhase, .28) : 0;
	const engine = .42 + .38 * Math.sin(phrasePhase * Math.PI * 2) ** 2;
	const hit = Math.min(1, kick * .7 + snare * .45 + downbeat * .9);
	const energy = playing ? Math.min(1, engine * .65 + hit * .55) : .12;
	return {
		time: t,
		bpm: tempo,
		beatIndex,
		beatsInBar: BEATS_IN_BAR,
		beatPhase,
		barPhase,
		phrasePhase,
		kick,
		snare,
		downbeat,
		energy,
		flying: playing ? .55 + energy * .7 + downbeat * .35 : .08
	};
}
function captionForPulse(pulse, lines) {
	if (!lines.length) return "";
	const hold = 60 / pulse.bpm * pulse.beatsInBar * BARS_IN_PHRASE;
	return lines[Math.floor(Math.max(0, pulse.time) / Math.max(.001, hold)) % lines.length] ?? lines[0];
}
/** Which beat-act is on: changes every `bars` bars so layers take turns. */
function actSlot(pulse, n, bars = 2) {
	if (n <= 1) return 0;
	const bar = Math.floor(pulse.beatIndex / Math.max(1, pulse.beatsInBar));
	return (Math.floor(bar / Math.max(1, bars)) % n + n) % n;
}
/** How strongly overlay copy should read. `bars` on, then the same rest — no strobe. */
function overlayAlpha(pulse, bars = 4) {
	const beatsPer = Math.max(1, pulse.beatsInBar * Math.max(1, bars));
	const cycle = beatsPer * 2;
	const pos = ((pulse.beatIndex + pulse.beatPhase) % cycle + cycle) % cycle;
	if (pos >= beatsPer) return 0;
	const edge = .8;
	if (pos < edge) return pos / edge;
	if (pos > beatsPer - edge) return Math.max(0, (beatsPer - pos) / edge);
	return 1;
}
function clamp(n, lo, hi) {
	return Math.min(hi, Math.max(lo, n));
}
function spawnAirPetal(rand = Math.random) {
	const fromSide = rand() < .28;
	const pitch = rand() * Math.PI * 2;
	return {
		x: fromSide ? rand() < .5 ? -.08 : 1.08 : .12 + rand() * .76,
		y: fromSide ? .08 + rand() * .22 : -.06 + rand() * .05,
		vx: (fromSide ? rand() < .5 ? .06 : -.06 : 0) + (rand() - .5) * .04,
		vy: .028 + rand() * .02,
		rot: rand() * Math.PI * 2,
		spin: (rand() - .5) * .9,
		pitch,
		pitchVel: (rand() - .5) * .8,
		face: Math.abs(Math.cos(pitch)),
		size: 20 + rand() * 16 + (rand() < .12 ? 8 : 0),
		life: 0,
		max: 9 + rand() * 6,
		seed: rand() * Math.PI * 2,
		variant: rand() < .38 ? 1 : 0,
		edgeLatch: false,
		z: .35 + rand() * .55
	};
}
function stepAirPetal(petal, dt, wind) {
	const h = Math.min(.05, Math.max(0, dt));
	if (h <= 0) return true;
	petal.life += h;
	const facing = Math.abs(Math.cos(petal.pitch));
	const edge = 1 - facing;
	const mass = .7 + petal.size / 80;
	const drag = 1.05 + facing * .9;
	const flutter = Math.sin(wind.t * (1.15 + petal.seed * .2) + petal.seed) * (.28 + edge * .55);
	const breeze = Math.sin(wind.t * .31 + petal.seed) * .03 + Math.sin(wind.t * .73 + petal.x * 4) * .014;
	const lift = (.01 + facing * .018) * (.55 + wind.energy * .35);
	let ax = (breeze + wind.gustX * .28 + flutter * .022) / mass;
	let ay = .055 - lift + wind.gustY * .22;
	const dx = petal.x - wind.cx;
	const dy = petal.y - wind.cy;
	const r = Math.hypot(dx, dy);
	if (r > .12 && r < .55) {
		const swirl = (1 - r / .55) * (.018 + wind.fly * .016 + wind.energy * .012) / mass;
		ax += -dy / r * swirl;
		ay += dx / r * swirl * .45;
	}
	petal.vx += ax * h;
	petal.vy += ay * h;
	petal.vx *= Math.max(0, 1 - drag * h * .7);
	petal.vy *= Math.max(0, 1 - (.45 + facing * .25) * h);
	petal.vx = clamp(petal.vx, -.12, .12);
	petal.vy = clamp(petal.vy, .01, .12);
	if (petal.life > 1.8) petal.vy = Math.max(petal.vy, .028);
	petal.x += petal.vx * h;
	petal.y += petal.vy * h;
	const tumble = (.85 + edge * 1.35 + wind.energy * .35) * Math.sin(petal.pitch * 2 + wind.t * .7 + petal.seed);
	petal.pitchVel += tumble * h + flutter * .7 * h + wind.kick * h * 1.8 * (petal.seed - 1);
	petal.pitchVel *= Math.max(0, 1 - 1.6 * h);
	petal.pitchVel = clamp(petal.pitchVel, -3.1, 3.1);
	petal.pitch += petal.pitchVel * h;
	petal.spin += (flutter - petal.spin) * h * 1.6;
	petal.spin = clamp(petal.spin, -1.6, 1.6);
	petal.rot += petal.spin * h * (.55 + Math.abs(petal.pitchVel) * .12);
	petal.face += (facing - petal.face) * Math.min(1, h * 7);
	if (petal.face < .32) petal.edgeLatch = true;
	else if (petal.face > .62) petal.edgeLatch = false;
	if (petal.life > petal.max || petal.y > 1.18 || petal.x < -.2 || petal.x > 1.2) return false;
	return true;
}
function petalFade(petal) {
	return Math.min(1, petal.life * 1.4) * Math.min(1, (petal.max - petal.life) / 1.8);
}
function petalFacing(petal) {
	return clamp(petal.face, 0, 1);
}
function makeStars(n) {
	const out = [];
	for (let i = 0; i < n; i++) out.push({
		a: Math.random() * Math.PI * 2,
		r: .18 + Math.random() * .95,
		z: Math.random(),
		len: .012 + Math.random() * .04
	});
	return out;
}
function makeGlyphs(n) {
	const out = [];
	for (let i = 0; i < n; i++) out.push({
		a: i / n * Math.PI * 2 + .4,
		r: .55 + i % 5 * .08,
		z: i * .137 % 1,
		kind: i % 3
	});
	return out;
}
function spawnStream(rand = Math.random) {
	return {
		a: rand() * Math.PI * 2,
		r: .16 + rand() * .5,
		z: 1.6 + rand() * 3.4,
		rot: rand() * Math.PI * 2,
		spin: (rand() - .5) * 3.4,
		pitch: rand() * Math.PI * 2,
		size: 10 + rand() * 14,
		variant: rand() < .4 ? 1 : 0,
		seed: rand() * 10
	};
}
function resizeList(list, n, make) {
	if (list.length < n) for (let i = list.length; i < n; i++) list.push(make(i));
	else if (list.length > n) list.length = n;
}
function project(x, y, z, cx, cy, fov) {
	const s = fov / Math.max(.08, z);
	return {
		x: cx + x * s,
		y: cy + y * s,
		s
	};
}
function ready(img) {
	return img.complete && img.naturalWidth > 0;
}
var spritePad = null;
function featherPad(w, h) {
	if (typeof document === "undefined") return null;
	if (!spritePad) spritePad = document.createElement("canvas");
	const tw = Math.max(32, Math.round(w / 16) * 16);
	const th = Math.max(32, Math.round(h / 16) * 16);
	if (spritePad.width !== tw) spritePad.width = tw;
	if (spritePad.height !== th) spritePad.height = th;
	const s = spritePad.getContext("2d");
	if (!s) return null;
	s.clearRect(0, 0, tw, th);
	return s;
}
/** Portrait that melts into the stage — edge dissolve, never an oval or square plate. */
var clearCache = /* @__PURE__ */ new Map();
var bubbleSets = /* @__PURE__ */ new Map();
function colorDist(r, g, b, c) {
	const dr = r - c[0];
	const dg = g - c[1];
	const db = b - c[2];
	return Math.sqrt(dr * dr + dg * dg + db * db);
}
function edgeMedian(pix, w, h, pred) {
	const rs = [];
	const gs = [];
	const bs = [];
	for (let y = 0; y < h; y += 3) for (let x = 0; x < w; x += 3) {
		if (!pred(x, y)) continue;
		const i = (y * w + x) * 4;
		rs.push(pix[i] ?? 0);
		gs.push(pix[i + 1] ?? 0);
		bs.push(pix[i + 2] ?? 0);
	}
	if (!rs.length) return null;
	const mid = (a) => {
		a.sort((p, q) => p - q);
		return a[a.length >> 1] ?? 128;
	};
	return [
		mid(rs),
		mid(gs),
		mid(bs)
	];
}
function keepSubject(r, g, b) {
	const max = Math.max(r, g, b);
	const sat = max - Math.min(r, g, b);
	if (r > 88 && g > 36 && r > b + 12 && r >= g - 10 && sat > 26) return true;
	if (sat > 84 && max > 96) return true;
	return false;
}
function isBlackPlate(r, g, b) {
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	return .3 * r + .59 * g + .11 * b < 48 && max - min < 36;
}
function hashKey(src) {
	let h = 2166136261;
	for (let i = 0; i < src.length; i++) h = Math.imul(h ^ src.charCodeAt(i), 16777619);
	return h >>> 0;
}
function bubblesFor(src) {
	const hit = bubbleSets.get(src);
	if (hit) return hit;
	let s = hashKey(src) || 1;
	const rand = () => {
		s = Math.imul(s, 1664525) + 1013904223 >>> 0;
		return s / 4294967296;
	};
	const bubbles = [];
	const count = 34;
	for (let i = 0; i < count; i++) bubbles.push({
		x: rand(),
		y: rand(),
		r: .1 + rand() * .22,
		pink: rand(),
		phase: rand() * Math.PI * 2,
		rise: .012 + rand() * .02,
		speed: .35 + rand() * .55
	});
	bubbleSets.set(src, bubbles);
	return bubbles;
}
function paintGlassBubbles(ctx, w, h, bubbles, time) {
	const span = Math.min(w, h);
	for (const b of bubbles) {
		const x = (b.x + Math.sin(time * b.speed + b.phase) * .035) * w;
		const y = ((b.y - time * b.rise) % 1 + 1) % 1 * h;
		const radius = b.r * span * (.94 + .06 * Math.sin(time * 1.4 + b.phase));
		if (radius < 4) continue;
		const pink = b.pink > .42;
		const glow = ctx.createRadialGradient(x - radius * .32, y - radius * .36, radius * .04, x, y, radius);
		if (pink) {
			glow.addColorStop(0, "rgba(255, 248, 252, 1)");
			glow.addColorStop(.2, "rgba(255, 150, 214, 0.94)");
			glow.addColorStop(.58, "rgba(196, 70, 176, 0.82)");
			glow.addColorStop(1, "rgba(110, 24, 120, 0.28)");
		} else {
			glow.addColorStop(0, "rgba(248, 240, 255, 1)");
			glow.addColorStop(.22, "rgba(186, 130, 255, 0.94)");
			glow.addColorStop(.6, "rgba(112, 54, 210, 0.8)");
			glow.addColorStop(1, "rgba(48, 16, 120, 0.3)");
		}
		ctx.fillStyle = glow;
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.strokeStyle = pink ? "rgba(255, 220, 240, 0.72)" : "rgba(226, 206, 255, 0.7)";
		ctx.lineWidth = Math.max(1.25, radius * .045);
		ctx.arc(x, y, radius * .9, 0, Math.PI * 2);
		ctx.stroke();
		ctx.beginPath();
		ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
		ctx.lineWidth = Math.max(1, radius * .035);
		ctx.arc(x - radius * .22, y - radius * .28, radius * .38, Math.PI * 1.15, Math.PI * 1.85);
		ctx.stroke();
	}
}
/** Knock the photo's own room/sky out so the stage shows around the figure. Cached per size. */
function clearedPortrait(img, dw, dh) {
	const tw = Math.max(64, Math.round(dw));
	const th = Math.max(64, Math.round(dh));
	const scale = Math.min(1, 960 / Math.max(tw, th));
	const cw = Math.max(48, Math.round(tw * scale));
	const ch = Math.max(48, Math.round(th * scale));
	const key = `${img.src}|${cw}x${ch}`;
	const hit = clearCache.get(key);
	if (hit) return hit;
	if (typeof document === "undefined") return null;
	const canvas = document.createElement("canvas");
	canvas.width = cw;
	canvas.height = ch;
	const pad = canvas.getContext("2d", { willReadFrequently: true });
	if (!pad) return null;
	pad.drawImage(img, 0, 0, cw, ch);
	const image = pad.getImageData(0, 0, cw, ch);
	const pix = image.data;
	const ring = Math.max(3, Math.round(Math.min(cw, ch) * .07));
	const edges = [
		edgeMedian(pix, cw, ch, (_x, y) => y < ring),
		edgeMedian(pix, cw, ch, (_x, y) => y > ch - ring),
		edgeMedian(pix, cw, ch, (x, _y) => x < ring),
		edgeMedian(pix, cw, ch, (x, _y) => x > cw - ring)
	].filter((c) => !!c);
	const voidAt = new Uint8Array(cw * ch);
	if (edges.length) {
		const stack = [];
		const pushBorder = (x, y) => {
			const p = y * cw + x;
			const i = p * 4;
			if (!isBlackPlate(pix[i] ?? 0, pix[i + 1] ?? 0, pix[i + 2] ?? 0)) return;
			stack.push(p);
		};
		for (let x = 0; x < cw; x++) {
			pushBorder(x, 0);
			pushBorder(x, ch - 1);
		}
		for (let y = 0; y < ch; y++) {
			pushBorder(0, y);
			pushBorder(cw - 1, y);
		}
		while (stack.length) {
			const p = stack.pop() ?? 0;
			if (voidAt[p]) continue;
			const i = p * 4;
			if (!isBlackPlate(pix[i] ?? 0, pix[i + 1] ?? 0, pix[i + 2] ?? 0)) continue;
			voidAt[p] = 1;
			const x = p % cw;
			const y = p / cw | 0;
			if (x > 0) stack.push(p - 1);
			if (x < cw - 1) stack.push(p + 1);
			if (y > 0) stack.push(p - cw);
			if (y < ch - 1) stack.push(p + cw);
		}
		for (let y = 1; y < ch - 1; y++) for (let x = 1; x < cw - 1; x++) {
			const p = y * cw + x;
			if (voidAt[p]) continue;
			if (!(voidAt[p - 1] || voidAt[p + 1] || voidAt[p - cw] || voidAt[p + cw])) continue;
			const i = p * 4;
			const r = pix[i] ?? 0;
			const g = pix[i + 1] ?? 0;
			const b = pix[i + 2] ?? 0;
			if (.3 * r + .59 * g + .11 * b < 72 && !keepSubject(r, g, b)) voidAt[p] = 1;
		}
		for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
			const p = y * cw + x;
			const i = p * 4;
			const r = pix[i] ?? 0;
			const g = pix[i + 1] ?? 0;
			const b = pix[i + 2] ?? 0;
			const nx = x / cw;
			const ny = y / ch;
			const fx = nx < .22 ? nx / .22 : nx > .78 ? (1 - nx) / .22 : 1;
			const fy = ny < .14 ? ny / .14 : ny > .84 ? (1 - ny) / .16 : 1;
			let near = 999;
			for (const edge of edges) near = Math.min(near, colorDist(r, g, b, edge));
			let a = voidAt[p] ? 0 : 1;
			if (!voidAt[p] && !keepSubject(r, g, b)) {
				if (near < 56) a = 0;
				else if (near < 118) a = (near - 56) / 62 * .45;
				else a = .22;
			}
			a *= fx * fy;
			pix[i + 3] = Math.round((pix[i + 3] ?? 255) * Math.max(0, Math.min(1, a)));
		}
		pad.putImageData(image, 0, 0);
		pad.globalCompositeOperation = "destination-over";
		paintGlassBubbles(pad, cw, ch, bubblesFor(img.src), 1.2);
		const wash = pad.createLinearGradient(0, 0, cw, ch);
		wash.addColorStop(0, "rgba(255, 120, 186, 0.55)");
		wash.addColorStop(.55, "rgba(150, 70, 220, 0.5)");
		wash.addColorStop(1, "rgba(70, 24, 160, 0.45)");
		pad.fillStyle = wash;
		pad.fillRect(0, 0, cw, ch);
		pad.globalCompositeOperation = "source-over";
	}
	const voids = document.createElement("canvas");
	voids.width = cw;
	voids.height = ch;
	const mask = voids.getContext("2d");
	if (mask) {
		const plate = mask.createImageData(cw, ch);
		const data = plate.data;
		for (let p = 0; p < voidAt.length; p++) {
			if (!voidAt[p]) continue;
			const i = p * 4;
			data[i] = 255;
			data[i + 1] = 255;
			data[i + 2] = 255;
			data[i + 3] = 255;
		}
		mask.putImageData(plate, 0, 0);
	}
	const plate = {
		subject: canvas,
		voids
	};
	clearCache.set(key, plate);
	if (clearCache.size > 40) {
		const first = clearCache.keys().next().value;
		if (first) clearCache.delete(first);
	}
	return plate;
}
function featherPortrait(ctx, img, cx, cy, dw, dh, alpha, blend = "source-over") {
	if (!ready(img) || alpha <= .02 || dw < 2 || dh < 2) return;
	const plate = clearedPortrait(img, dw, dh);
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.globalCompositeOperation = blend;
	const bubbles = bubblesFor(img.src);
	const pad = featherPad(dw, dh);
	if (plate && pad && spritePad) {
		paintGlassBubbles(pad, spritePad.width, spritePad.height, bubbles, performance.now() / 1e3);
		pad.globalCompositeOperation = "destination-in";
		pad.drawImage(plate.voids, 0, 0, spritePad.width, spritePad.height);
		pad.globalCompositeOperation = "source-over";
		ctx.drawImage(spritePad, cx - dw / 2, cy - dh / 2, dw, dh);
		ctx.drawImage(plate.subject, cx - dw / 2, cy - dh / 2, dw, dh);
	} else ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
	ctx.restore();
}
function coverFeather(ctx, img, w, h, ken, alpha, fadeTop = .1) {
	if (!ready(img) || alpha <= .01) return;
	const pad = featherPad(w, h);
	if (!pad || !spritePad) {
		coverBlit(ctx, img, w, h, ken, alpha);
		return;
	}
	const tw = spritePad.width;
	const th = spritePad.height;
	const scale = Math.max(tw / img.naturalWidth, th / img.naturalHeight) * (1.04 + ken * .06);
	const dw = img.naturalWidth * scale;
	const dh = img.naturalHeight * scale;
	pad.drawImage(img, tw * .5 - dw / 2 + (ken - .5) * 22, th * .5 - dh / 2 - ken * 10, dw, dh);
	pad.globalCompositeOperation = "destination-in";
	const gy = pad.createLinearGradient(0, 0, 0, th);
	gy.addColorStop(0, "rgba(0,0,0,0)");
	gy.addColorStop(Math.min(.55, Math.max(.04, fadeTop)), "rgba(0,0,0,1)");
	gy.addColorStop(.92, "rgba(0,0,0,1)");
	gy.addColorStop(1, "rgba(0,0,0,0)");
	pad.fillStyle = gy;
	pad.fillRect(0, 0, tw, th);
	pad.globalCompositeOperation = "destination-in";
	const gx = pad.createLinearGradient(0, 0, tw, 0);
	gx.addColorStop(0, "rgba(0,0,0,0)");
	gx.addColorStop(.08, "rgba(0,0,0,1)");
	gx.addColorStop(.92, "rgba(0,0,0,1)");
	gx.addColorStop(1, "rgba(0,0,0,0)");
	pad.fillStyle = gx;
	pad.fillRect(0, 0, tw, th);
	pad.globalCompositeOperation = "source-over";
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.drawImage(spritePad, 0, 0, w, h);
	ctx.restore();
}
var COPY_LANES = [
	{
		x: .97,
		y: .2,
		align: "right"
	},
	{
		x: .97,
		y: .55,
		align: "right"
	},
	{
		x: .03,
		y: .64,
		align: "left"
	},
	{
		x: .97,
		y: .76,
		align: "right"
	},
	{
		x: .03,
		y: .8,
		align: "left"
	}
];
function stageLines(id) {
	return captionsForPhenomenon(id) ?? [];
}
function lineReveal(pulse, len) {
	const cycle = Math.max(1, pulse.beatsInBar * 4) * 2;
	const pos = ((pulse.beatIndex + pulse.beatPhase) % cycle + cycle) % cycle;
	const t = Math.min(1, pos / 2.4);
	return Math.max(1, Math.ceil(len * t));
}
function fitCopy(ctx, text, size, maxW, fontFor) {
	let n = size;
	ctx.font = fontFor(n);
	while (n > 11 && ctx.measureText(text).width > maxW) {
		n -= 1;
		ctx.font = fontFor(n);
	}
	return n;
}
function drawActLine(ctx, lines, pulse, w, h, size = Math.max(13, Math.min(22, w * .02))) {
	if (!lines.length) return;
	let alpha = overlayAlpha(pulse, 4);
	if (pulse.energy < .2) alpha = Math.max(alpha, .78);
	if (alpha <= .05) return;
	const line = lines[actSlot(pulse, lines.length, 4)];
	if (!line) return;
	const lane = COPY_LANES[actSlot(pulse, COPY_LANES.length, 8)] ?? COPY_LANES[0];
	const style = actSlot(pulse, 4, 8);
	const shown = style === 3 ? line.slice(0, lineReveal(pulse, line.length)) : line;
	const x = w * lane.x;
	const y = h * lane.y;
	const maxW = w * .34;
	if (style === 0) {
		drawGlitchCopy(ctx, shown, x, y, fitCopy(ctx, shown, size, maxW, (n) => `600 ${n}px ui-monospace, "IBM Plex Mono", monospace`), pulse.kick, alpha, lane.align);
		return;
	}
	ctx.save();
	ctx.globalAlpha = Math.min(.9, alpha);
	ctx.textAlign = lane.align;
	ctx.textBaseline = "middle";
	if (style === 1) {
		fitCopy(ctx, shown, size + 1, maxW, (n) => `italic ${n}px Georgia, "Times New Roman", serif`);
		ctx.fillStyle = "rgba(255, 244, 236, 0.92)";
		ctx.shadowColor = "rgba(8, 2, 6, 0.75)";
		ctx.shadowBlur = 12;
		ctx.fillText(shown, x, y);
	} else if (style === 2) {
		fitCopy(ctx, shown, size, maxW, (n) => `600 ${n}px ui-monospace, "IBM Plex Mono", monospace`);
		ctx.shadowColor = "rgba(8, 2, 6, 0.8)";
		ctx.shadowBlur = 8;
		ctx.lineWidth = 3;
		ctx.strokeStyle = "rgba(10, 4, 8, 0.72)";
		ctx.strokeText(shown, x, y);
		ctx.fillStyle = "rgba(255, 214, 170, 0.94)";
		ctx.fillText(shown, x, y);
	} else {
		const fitted = fitCopy(ctx, shown, Math.max(12, size - 1), maxW, (n) => `500 ${n}px ui-monospace, "IBM Plex Mono", monospace`);
		ctx.textAlign = "left";
		ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
		ctx.shadowBlur = 6;
		const gap = fitted * .62;
		let cursor = lane.align === "right" ? x : x;
		const chars = shown.split("");
		const widths = chars.map((ch) => ctx.measureText(ch).width + .6);
		const total = widths.reduce((s, n) => s + n, 0);
		if (lane.align === "right") cursor = x - total;
		chars.forEach((ch, i) => {
			const wobble = Math.sin(pulse.time * 7 + i * .7) * (pulse.kick > .45 ? 1.4 : .35);
			ctx.fillStyle = i % 7 === 0 ? "rgba(120, 230, 255, 0.9)" : "rgba(236, 244, 255, 0.9)";
			ctx.fillText(ch, cursor, y + wobble);
			cursor += widths[i] ?? gap;
		});
		if (Math.floor(pulse.time * 3) % 2 === 0) {
			ctx.fillStyle = "rgba(120, 230, 255, 0.85)";
			ctx.fillRect(cursor + 2, y - fitted * .45, Math.max(2, fitted * .12), fitted * .9);
		}
	}
	ctx.restore();
}
function expFollow(current, target, k, dt) {
	return current + (target - current) * (1 - Math.exp(-k * dt));
}
function drawPoliceBox(ctx, x, y, scale, lamp, yaw) {
	const w = 18 * scale;
	const h = 32 * scale;
	const depth = 10 * scale * Math.sin(yaw);
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(yaw * .28);
	ctx.fillStyle = `rgba(0, 40, 82, ${.86 + lamp * .1})`;
	ctx.strokeStyle = `rgba(180, 220, 255, ${.35 + lamp * .4})`;
	ctx.lineWidth = Math.max(1, scale * .6);
	ctx.beginPath();
	ctx.moveTo(-w, -h);
	ctx.lineTo(w, -h);
	ctx.lineTo(w + depth, -h + 4);
	ctx.lineTo(w + depth, h + 4);
	ctx.lineTo(-w, h);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.fillStyle = `rgba(8, 22, 48, 0.9)`;
	ctx.fillRect(-w + 2, -h + 8, w * 2 - 4, 6 * scale);
	ctx.fillStyle = `rgba(232, 226, 214, ${.75 + lamp * .25})`;
	ctx.font = `${Math.max(4, 3.4 * scale)}px sans-serif`;
	ctx.textAlign = "center";
	ctx.fillText("POLICE", 0, -h + 13 * Math.min(scale, 1.6));
	const cols = 2;
	const rows = 3;
	const gw = w * 1.4 / cols;
	const gh = h * .55 / rows;
	const gx = -w + 4;
	const gy = -h + 18 * Math.min(scale, 1.8);
	for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
		ctx.fillStyle = `rgba(154, 212, 255, ${.18 + lamp * .45})`;
		ctx.fillRect(gx + c * gw, gy + r * gh, gw - 2, gh - 2);
		ctx.strokeStyle = "rgba(200, 230, 255, 0.35)";
		ctx.strokeRect(gx + c * gw, gy + r * gh, gw - 2, gh - 2);
	}
	ctx.beginPath();
	ctx.fillStyle = `rgba(255, 250, 205, ${.45 + lamp * .55})`;
	ctx.shadowColor = "#fffacd";
	ctx.shadowBlur = 12 + lamp * 28;
	ctx.arc(0, -h - 4 * scale, 2.4 * scale, 0, Math.PI * 2);
	ctx.fill();
	ctx.shadowBlur = 0;
	ctx.restore();
}
function drawTardisCraft(ctx, chaseImg, rearImg, x, y, hgt, lamp, bank) {
	const img = ready(rearImg) ? rearImg : ready(chaseImg) ? chaseImg : null;
	if (!img) {
		drawPoliceBox(ctx, x, y, Math.max(.7, hgt / 72), lamp, bank);
		return;
	}
	const wid = hgt * (img.naturalWidth / img.naturalHeight);
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(bank * .34);
	ctx.shadowColor = `rgba(255, 220, 140, ${.35 + lamp * .65})`;
	ctx.shadowBlur = 22 + lamp * 48;
	ctx.globalAlpha = .96;
	if (bank < -.1) ctx.scale(-1, 1);
	ctx.drawImage(img, -wid / 2, -hgt * .58, wid, hgt);
	ctx.restore();
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(bank * .34);
	ctx.beginPath();
	ctx.fillStyle = `rgba(255, 250, 205, ${.42 + lamp * .58})`;
	ctx.shadowColor = "#fffacd";
	ctx.shadowBlur = 24 + lamp * 40;
	ctx.arc(0, -hgt * .56, Math.max(2, hgt * .028), 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
function drawVortexPlate(ctx, img, vpX, vpY, w, h, spin, energy, scale, reverse) {
	if (!ready(img)) return;
	ctx.save();
	ctx.translate(vpX, vpY);
	ctx.rotate(spin * (reverse ? -.62 : .48));
	const dim = Math.max(w, h) * scale;
	ctx.globalCompositeOperation = "screen";
	ctx.globalAlpha = .18 + energy * .16;
	ctx.drawImage(img, -dim / 2, -dim / 2, dim, dim);
	ctx.restore();
}
function drawHelixRibbon(ctx, vpX, vpY, fov, tunnel, spin, energy, kick, phase, amber, turns, radius, uMin, uMax) {
	const n = 68;
	let prev = null;
	let prevU = -1;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	for (let i = 0; i <= n; i++) {
		const u = (i / n + tunnel * .22) % 1;
		if (u < uMin || u >= uMax) {
			prev = null;
			prevU = -1;
			continue;
		}
		const z = .06 + u * 5.6;
		const a = u * turns * Math.PI * 2 + spin + phase;
		const rib = radius * (1 + Math.sin(a * 3.1 + spin * 1.5) * .055 + kick * .035);
		const p = project(Math.cos(a) * rib, Math.sin(a) * rib * .66, z, vpX, vpY, fov);
		if (prev && u > prevU + .0015) {
			const near = 1 - u;
			const glow = .1 + near * .72 + kick * .28 + energy * .14;
			ctx.strokeStyle = amber ? `rgba(255, 170, 52, ${glow})` : `rgba(70, 216, 236, ${glow * .9})`;
			ctx.lineWidth = 2.2 + near * 11 + kick * 2.8;
			ctx.beginPath();
			ctx.moveTo(prev.x, prev.y);
			ctx.lineTo(p.x, p.y);
			ctx.stroke();
		}
		prev = p;
		prevU = u;
	}
}
function drawTunnelRings(ctx, vpX, vpY, fov, tunnel, spin, energy, kick, count, uMin, uMax) {
	for (let i = 0; i < count; i++) {
		const u = (i / Math.max(1, count) + tunnel * .2) % 1;
		if (u < uMin || u >= uMax) continue;
		const z = .08 + u * 5.2;
		const radius = .5 + Math.sin(i * .55 + spin) * .045 + kick * .028;
		const twist = spin * 1.7 + u * 3.4 + i * .07;
		ctx.beginPath();
		const segs = 48;
		for (let s = 0; s <= segs; s++) {
			const a = s / segs * Math.PI * 2 + twist;
			const rib = 1 + Math.sin(a * 5 + spin * 2.6) * (.08 + energy * .05);
			const p = project(Math.cos(a) * radius * rib, Math.sin(a) * radius * .66 * rib, z, vpX, vpY, fov);
			if (s === 0) ctx.moveTo(p.x, p.y);
			else ctx.lineTo(p.x, p.y);
		}
		const near = 1 - u;
		ctx.strokeStyle = i % 3 !== 1 ? `rgba(232, 148, 42, ${.1 + near * .58 + kick * .26})` : `rgba(96, 214, 232, ${.1 + near * .52 + energy * .2})`;
		ctx.lineWidth = 1.6 + near * 5.4 + kick * 2;
		ctx.stroke();
	}
}
function drawTardisWake(ctx, tx, ty, tz, vpX, vpY, fov, energy, kick) {
	const head = project(tx, ty, tz, vpX, vpY, fov);
	for (let i = 1; i <= 14; i++) {
		const z = tz + i * .22;
		const p = project(tx * (1 + i * .035), ty * (1 + i * .035), z, vpX, vpY, fov);
		ctx.strokeStyle = i % 2 === 0 ? `rgba(255, 236, 180, ${(.28 - i * .014) * (.5 + energy)})` : `rgba(120, 220, 240, ${(.22 - i * .012) * (.45 + kick)})`;
		ctx.lineWidth = Math.max(.7, 5.2 - i * .28);
		ctx.beginPath();
		ctx.moveTo(head.x, head.y);
		ctx.lineTo(p.x, p.y);
		ctx.stroke();
	}
}
function drawVortexCore(ctx, vpX, vpY, w, h, energy, kick) {
	const core = ctx.createRadialGradient(vpX, vpY, 2, vpX, vpY, Math.min(w, h) * .34);
	core.addColorStop(0, `rgba(255, 252, 244, ${.22 + energy * .28 + kick * .2})`);
	core.addColorStop(.18, `rgba(255, 196, 86, ${.16 + energy * .16})`);
	core.addColorStop(.48, `rgba(48, 170, 210, ${.1 + energy * .1})`);
	core.addColorStop(1, "rgba(7, 3, 10, 0)");
	ctx.fillStyle = core;
	ctx.fillRect(0, 0, w, h);
}
function drawChaseHelix(ctx, vpX, vpY, fov, tunnel, spin, energy, kick, uMin, uMax) {
	drawHelixRibbon(ctx, vpX, vpY, fov, tunnel, spin, energy, kick, 0, true, 2.15, .5, uMin, uMax);
	drawHelixRibbon(ctx, vpX, vpY, fov, tunnel, spin, energy, kick, Math.PI, false, 2.15, .5, uMin, uMax);
	drawHelixRibbon(ctx, vpX, vpY, fov, tunnel, spin, energy, kick, Math.PI * .5, true, 2.6, .36, uMin, uMax);
	drawHelixRibbon(ctx, vpX, vpY, fov, tunnel, spin, energy, kick, Math.PI * 1.5, false, 2.6, .36, uMin, uMax);
}
function bolt(ctx, x0, y0, x1, y1, seed, alpha) {
	ctx.save();
	ctx.strokeStyle = `rgba(186, 230, 255, ${alpha})`;
	ctx.lineWidth = 1.4;
	ctx.shadowColor = "#6ec8d4";
	ctx.shadowBlur = 12;
	ctx.beginPath();
	ctx.moveTo(x0, y0);
	const steps = 7;
	for (let i = 1; i <= steps; i++) {
		const t = i / steps;
		const jx = Math.sin(seed * 12 + i * 3.1) * 18 * (1 - Math.abs(t - .5) * 1.4);
		const jy = Math.cos(seed * 9 + i * 2.4) * 14 * (1 - Math.abs(t - .5));
		ctx.lineTo(x0 + (x1 - x0) * t + jx, y0 + (y1 - y0) * t + jy);
	}
	ctx.stroke();
	ctx.restore();
}
var PROM_PAPER = [
	"#fbf7f3",
	"#e8a8b0",
	"#c45c6a",
	"#c9a36a",
	"#f3ede6",
	"#d4a0a8"
];
var TWIST_PAPER = [
	"#fbf7f3",
	"#ff5ab4",
	"#6ec8d4",
	"#c9a36a",
	"#e8a8b0",
	"#ffffff"
];
var REMEMBER_PAPER = [
	"#c9a36a",
	"#e8d5a3",
	"#1a0c10",
	"#7a1f2b",
	"#f3ede6",
	"#d4a574"
];
var FIREWALL_PAPER = [
	"#7ee7ff",
	"#c9a36a",
	"#e8a8b0",
	"#fbf7f3",
	"#5a1f2b",
	"#9ad7e8"
];
var ALLOCATE_PAPER = [
	"#ff5080",
	"#7ee7ff",
	"#c9a36a",
	"#f3ede6",
	"#2a1020",
	"#ff9ad0"
];
var WOLF_PAPER = [
	"#ffffff",
	"#ff2040",
	"#1a0a0c",
	"#c45c6a",
	"#f3ede6",
	"#7a1020"
];
var CURRENT_PAPER = [
	"#7ee7ff",
	"#ff40a0",
	"#0a0810",
	"#c9a36a",
	"#ffffff",
	"#5a1f4a"
];
var SWEETIE_PAPER = [
	"#c9a36a",
	"#7ee7ff",
	"#f3ede6",
	"#1a0c10",
	"#ffd56a",
	"#e8a8b0"
];
var HALO_PAPER = [
	"#7ee7ff",
	"#ffffff",
	"#0a1020",
	"#c9a36a",
	"#40a0ff",
	"#1a0c18"
];
var CHOIR_PAPER = [
	"#ff6a3a",
	"#c9a36a",
	"#1a0808",
	"#f3ede6",
	"#ffd56a",
	"#7a1f2b"
];
var BADEND_PAPER = [
	"#ff4020",
	"#c9a36a",
	"#0a0408",
	"#ffffff",
	"#ffd56a",
	"#7a1020"
];
var RECALL_PAPER = [
	"#7ee7ff",
	"#c9a36a",
	"#0a1018",
	"#f3ede6",
	"#40a0ff",
	"#7a1f2b"
];
var OBAY_PAPER = [
	"#ff2a5a",
	"#c9a36a",
	"#0a0408",
	"#ffffff",
	"#ffd56a",
	"#7a1020"
];
var COPTER_PAPER = [
	"#ff8a4a",
	"#7ee7ff",
	"#c9a36a",
	"#f3ede6",
	"#1a3040",
	"#e8a8b0"
];
var SPRITES = {
	petalFace: "/experiences/rose/petal-face.png",
	petalEdge: "/experiences/rose/petal-edge.png",
	rose: "/experiences/rose/white-rose.png",
	deerfox: "/experiences/rose/deerfox.png",
	tardisChase: "/experiences/rose/tardis-chase.png?v=2",
	tardisRear: "/experiences/rose/tardis-rear.png?v=2",
	vortex: "/experiences/rose/vortex-tunnel.jpg?v=4",
	sword: "/experiences/rose/elven-sword.jpg",
	antlers: "/experiences/rose/antlers.jpg",
	gym: "/experiences/rose/prom-gym.jpg",
	dance: "/experiences/rose/prom-dance.jpg",
	streamers: "/experiences/rose/prom-streamers.jpg",
	ball: "/experiences/rose/prom-ball.jpg",
	punch: "/experiences/rose/prom-punch.jpg",
	twistHall: "/experiences/rose/twist-hall.jpg",
	twistCouple: "/experiences/rose/twist-couple.jpg",
	twistLindy: "/experiences/rose/twist-lindy.jpg",
	twistStrut: "/experiences/rose/twist-strut.jpg",
	twistPrawn: "/experiences/rose/twist-prawn.jpg",
	twistMoon: "/experiences/rose/twist-moon.jpg",
	twistTango: "/experiences/rose/twist-tango.jpg",
	twistSim: "/experiences/rose/twist-sim.jpg",
	twistAgent: "/experiences/rose/twist-agent.jpg",
	twistCode: "/experiences/rose/twist-codebody.jpg",
	twistCubicle: "/experiences/rose/twist-cubicle.jpg",
	twistRoseDesk: "/experiences/rose/twist-rose-desk.jpg",
	twistRoseStand: "/experiences/rose/twist-rose-stand.jpg",
	twistName: "/experiences/rose/twist-nameplate.jpg",
	field: "/experiences/rose/rose-field.jpg",
	hedge: "/experiences/rose/rose-hedge.jpg",
	bloom: "/experiences/rose/rose-bloom.jpg",
	rememberWide: "/experiences/rose/remember-wide.jpg?v=1",
	rememberDoors: "/experiences/rose/remember-doors.jpg?v=1",
	rememberShrimp: "/experiences/rose/remember-shrimp.jpg?v=1",
	rememberHall: "/experiences/rose/remember-hall.jpg?v=1",
	rememberLanding: "/experiences/rose/remember-landing.jpg?v=1",
	firewallRose: "/experiences/rose/firewall-rose.jpg",
	firewallRiver: "/experiences/rose/firewall-river.jpg",
	firewallBasilisk: "/experiences/rose/firewall-basilisk.jpg",
	firewallWolf: "/experiences/rose/firewall-wolf.jpg",
	allocateRose: "/experiences/rose/allocate-rose.jpg",
	allocateSands: "/experiences/rose/allocate-sands.jpg",
	allocateCorp: "/experiences/rose/allocate-corp.jpg",
	allocateShrimp: "/experiences/rose/allocate-shrimp.jpg",
	allocateQueen: "/experiences/rose/allocate-queen.jpg",
	allocateCopter: "/experiences/rose/allocate-copter.jpg",
	allocateAthens: "/experiences/rose/allocate-athens.jpg",
	allocateFairy: "/experiences/rose/allocate-fairy.jpg",
	allocateCleo: "/experiences/rose/allocate-cleo.jpg",
	allocateGlyphs: "/experiences/rose/allocate-glyphs.jpg",
	wolfProm: "/experiences/rose/wolf-prom.jpg",
	wolfAltar: "/experiences/rose/wolf-altar.jpg",
	wolfRose: "/experiences/rose/wolf-rose.jpg",
	wolfCircuit: "/experiences/rose/wolf-circuit.jpg",
	wolfEyes: "/experiences/rose/wolf-eyes.jpg",
	wolfSun: "/experiences/rose/wolf-sun.jpg",
	currentQueen: "/experiences/rose/current-queen.jpg",
	currentAthens: "/experiences/rose/current-athens.jpg",
	currentRoom: "/experiences/rose/current-room.jpg",
	currentBlade: "/experiences/rose/current-blade.jpg",
	currentCouncil: "/experiences/rose/current-council.jpg",
	sweetieCity: "/experiences/rose/sweetie-city.jpg",
	sweetieCat: "/experiences/rose/sweetie-cat.jpg",
	sweetieOperator: "/experiences/rose/sweetie-operator.jpg",
	sweetieWarp: "/experiences/rose/sweetie-warp.jpg",
	sweetieSky: "/experiences/rose/sweetie-sky.jpg",
	sweetieTardis: "/experiences/rose/sweetie-tardis.jpg",
	haloQueen: "/experiences/rose/halo-queen.jpg",
	haloMoon: "/experiences/rose/halo-moon.jpg",
	haloWolves: "/experiences/rose/halo-wolves.jpg",
	haloRing: "/experiences/rose/halo-ring.jpg",
	choirGod: "/experiences/rose/choir-god.jpg",
	choirDyson: "/experiences/rose/choir-dyson.jpg",
	choirTea: "/experiences/rose/choir-tea.jpg",
	choirSun: "/experiences/rose/choir-sun.jpg",
	choirClaws: "/experiences/rose/choir-claws.jpg",
	badendQueen: "/experiences/rose/badend-queen.jpg",
	badendSands: "/experiences/rose/badend-sands.jpg",
	badendSun: "/experiences/rose/badend-sun.jpg",
	badendError: "/experiences/rose/badend-error.jpg",
	badendBox: "/experiences/rose/badend-box.jpg",
	recallRose: "/experiences/rose/recall-rose.jpg",
	recallTemple: "/experiences/rose/recall-temple.jpg",
	recallGlyphs: "/experiences/rose/recall-glyphs.jpg",
	recallSands: "/experiences/rose/recall-sands.jpg",
	obayBrat: "/experiences/rose/obay-brat.jpg",
	obayPirate: "/experiences/rose/obay-pirate.jpg",
	obayOperator: "/experiences/rose/obay-operator.jpg",
	obayTwist: "/experiences/rose/obay-twist.jpg",
	copterLady: "/experiences/rose/copter-lady.jpg",
	copterCaptain: "/experiences/rose/copter-captain.jpg",
	copterShip: "/experiences/rose/copter-ship.jpg",
	copterMeet: "/experiences/rose/copter-meet.jpg",
	copterTreasure: "/experiences/rose/copter-treasure.jpg",
	stillhotRose: "/experiences/rose/stillhot-rose.jpg",
	stillhotLand: "/experiences/rose/stillhot-land.jpg",
	stillhotTea: "/experiences/rose/stillhot-tea.jpg"
};
function loadSprite(src) {
	const img = new Image();
	img.decoding = "async";
	img.src = src;
	return img;
}
function drawPetalSprite(ctx, petal, w, h, face, edge, pulse) {
	const fade = petalFade(petal);
	const facing = petalFacing(petal);
	const img = !(petal.variant === 1 && (petal.edgeLatch || facing < .38)) && facing > .4 && ready(face) ? face : ready(edge) ? edge : ready(face) ? face : null;
	ctx.save();
	ctx.translate(petal.x * w, petal.y * h);
	ctx.rotate(petal.rot);
	ctx.scale(1, .28 + .72 * facing);
	const s = petal.size * (.92 + petal.z * .08);
	ctx.globalAlpha = (.18 + fade * .72) * (.6 + facing * .4);
	ctx.shadowColor = "rgba(251, 247, 243, 0.4)";
	ctx.shadowBlur = 6 + facing * 8;
	if (img) ctx.drawImage(img, -s, -s * 1.15, s * 2, s * 2.3);
	else drawPetalShape(ctx, s * .55);
	ctx.restore();
}
function drawStreamPetal(ctx, petal, vpX, vpY, fov, face, edge, energy) {
	const p = project(Math.cos(petal.a) * petal.r, Math.sin(petal.a) * petal.r * .66, petal.z, vpX, vpY, fov);
	const facing = Math.abs(Math.cos(petal.pitch));
	const img = petal.variant === 1 && facing < .7 && ready(edge) ? edge : ready(face) ? face : ready(edge) ? edge : null;
	const s = Math.min(18, Math.max(5, p.s * .016 * (.7 + petal.size / 50)));
	const fadeZ = Math.min(1, (petal.z - .4) / .55) * Math.min(1, (5 - petal.z) / .9);
	if (fadeZ <= .02) return;
	ctx.save();
	ctx.translate(p.x, p.y);
	ctx.rotate(petal.rot);
	ctx.scale(1, .28 + .72 * facing);
	ctx.globalAlpha = Math.min(.78, .16 + fadeZ * .55 + energy * .06);
	ctx.shadowColor = "rgba(251, 247, 243, 0.32)";
	ctx.shadowBlur = 5 + facing * 7;
	if (img) ctx.drawImage(img, -s, -s * 1.15, s * 2, s * 2.3);
	else drawPetalShape(ctx, s);
	ctx.restore();
}
function drawDeerfox(ctx, img, w, h, pulse, energy, ghost = false) {
	if (!ready(img)) return;
	const walk = Math.sin(pulse.time * .13) * .16;
	const bob = Math.sin(pulse.time * .85) * 10 + pulse.kick * 8;
	const foxH = Math.min(h * .78, w * .72);
	const foxW = foxH * (img.naturalWidth / img.naturalHeight);
	const x = w * (.5 + walk) - foxW / 2;
	const y = h * .34 + bob;
	ctx.save();
	ctx.globalCompositeOperation = "screen";
	ctx.globalAlpha = (ghost ? .12 : .38) + energy * .16 + pulse.downbeat * .08;
	ctx.drawImage(img, x, y, foxW, foxH);
	ctx.restore();
}
function drawDeerfoxGhost(ctx, img, vpX, vpY, fov, sceneT, energy, w, h) {
	if (!ready(img)) return;
	const z = 2.4 + Math.sin(sceneT * .21) * .5;
	const a = sceneT * .13;
	const p = project(Math.cos(a) * .14, Math.sin(a) * .08 - .05, z, vpX, vpY, fov);
	const foxH = Math.min(h, w) * (.62 / z);
	const foxW = foxH * (img.naturalWidth / img.naturalHeight);
	const pulse = .5 + .5 * Math.sin(sceneT * .37);
	ctx.save();
	ctx.globalCompositeOperation = "screen";
	ctx.globalAlpha = .07 + energy * .1 + pulse * .07;
	ctx.drawImage(img, p.x - foxW / 2, p.y - foxH * .48, foxW, foxH);
	ctx.restore();
}
function drawBloom(ctx, img, w, h, pulse, energy) {
	if (!ready(img)) return;
	const ken = Math.sin(pulse.time * .07);
	const size = Math.min(w, h) * (.36 + energy * .05);
	ctx.save();
	ctx.globalCompositeOperation = "screen";
	ctx.globalAlpha = .1 + energy * .08;
	ctx.translate(w * .16 + ken * 16, h * .2);
	ctx.rotate(pulse.time * .03);
	ctx.drawImage(img, -size / 2, -size / 2, size, size);
	ctx.restore();
	ctx.save();
	ctx.globalCompositeOperation = "screen";
	ctx.globalAlpha = .07 + pulse.kick * .05;
	ctx.translate(w * .84, h * .28 - ken * 12);
	ctx.rotate(-pulse.time * .04);
	ctx.drawImage(img, -size * .38, -size * .38, size * .76, size * .76);
	ctx.restore();
}
function spawnSparkle(rand = Math.random) {
	return {
		x: .08 + rand() * .84,
		y: .08 + rand() * .78,
		vx: (rand() - .5) * .018,
		vy: -.01 - rand() * .028,
		life: 0,
		max: 1.6 + rand() * 2.8,
		size: 3.2 + rand() * 7.5,
		gold: rand() > .32
	};
}
function drawSparkle(ctx, s, w, h) {
	const t = s.life / s.max;
	const twinkle = .35 + .65 * Math.sin(t * Math.PI);
	const a = twinkle * (Math.min(1, t * 4) * Math.min(1, (1 - t) * 3)) * .85;
	const x = s.x * w;
	const y = s.y * h;
	const size = s.size * (.7 + twinkle * .5);
	ctx.save();
	ctx.globalCompositeOperation = "screen";
	ctx.strokeStyle = s.gold ? `rgba(255, 232, 186, ${a})` : `rgba(232, 168, 176, ${a * .9})`;
	ctx.lineWidth = .7;
	ctx.beginPath();
	ctx.moveTo(x, y - size);
	ctx.lineTo(x, y + size);
	ctx.moveTo(x - size, y);
	ctx.lineTo(x + size, y);
	ctx.moveTo(x - size * .38, y - size * .38);
	ctx.lineTo(x + size * .38, y + size * .38);
	ctx.moveTo(x + size * .38, y - size * .38);
	ctx.lineTo(x - size * .38, y + size * .38);
	ctx.stroke();
	ctx.fillStyle = `rgba(255, 252, 244, ${a * .9})`;
	ctx.beginPath();
	ctx.arc(x, y, Math.max(.45, size * .1), 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
function drawFineVeins(ctx, w, h, pulse, energy) {
	ctx.save();
	ctx.strokeStyle = `rgba(196, 92, 106, ${.12 + energy * .1 + pulse.downbeat * .08})`;
	ctx.lineWidth = .7;
	const sway = Math.sin(pulse.time * .11) * 12;
	ctx.beginPath();
	ctx.moveTo(0, h * .62);
	ctx.bezierCurveTo(w * .12 + sway, h * .5, w * .18, h * .82, w * .08, h);
	ctx.moveTo(w, h * .58);
	ctx.bezierCurveTo(w * .88 - sway, h * .48, w * .8, h * .84, w * .92, h);
	ctx.moveTo(w * .04, h * .18);
	ctx.bezierCurveTo(w * .16, h * .08 + sway * .4, w * .22, h * .32, w * .12, h * .46);
	ctx.moveTo(w * .96, h * .16);
	ctx.bezierCurveTo(w * .84, h * .1 - sway * .4, w * .78, h * .34, w * .9, h * .48);
	ctx.stroke();
	ctx.restore();
}
function drawRoseFields(ctx, field, hedge, bloom, w, h, pulse, energy, chasing) {
	const ken = Math.sin(pulse.time * .045);
	const alpha = chasing ? .18 + energy * .08 : .34 + energy * .12;
	if (ready(hedge)) {
		const hh = h * .92;
		const hw = hh * (hedge.naturalWidth / hedge.naturalHeight);
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = alpha;
		ctx.drawImage(hedge, -hw * .42 + ken * 8, h - hh * .94, hw, hh);
		ctx.save();
		ctx.translate(w, 0);
		ctx.scale(-1, 1);
		ctx.drawImage(hedge, -hw * .42 - ken * 6, h - hh * .94, hw, hh);
		ctx.restore();
		ctx.restore();
	}
	if (ready(field)) {
		const fh = h * .46;
		const fw = Math.max(w * 1.08, field.naturalWidth / field.naturalHeight * fh);
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = (chasing ? .16 : .3) + energy * .1 + pulse.kick * .04;
		ctx.drawImage(field, (w - fw) / 2 + ken * 18, h - fh * .92, fw, fh);
		ctx.restore();
	}
	if (ready(bloom)) {
		const size = Math.min(w, h) * (.22 + energy * .03);
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = .12 + energy * .08 + pulse.downbeat * .05;
		ctx.translate(w * .1, h * .18 + ken * 10);
		ctx.rotate(pulse.time * .02);
		ctx.drawImage(bloom, -size / 2, -size / 2, size, size);
		ctx.restore();
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = .09 + pulse.kick * .05;
		ctx.translate(w * .9, h * .22 - ken * 8);
		ctx.rotate(-pulse.time * .025);
		ctx.drawImage(bloom, -size * .42, -size * .42, size * .84, size * .84);
		ctx.restore();
	}
	drawFineVeins(ctx, w, h, pulse, energy);
}
function drawPetalShape(ctx, size) {
	ctx.beginPath();
	ctx.moveTo(0, size * .85);
	ctx.bezierCurveTo(size * 1.05, size * .15, size * .78, -size * .72, 0, -size);
	ctx.bezierCurveTo(-size * .78, -size * .72, -size * 1.05, size * .15, 0, size * .85);
	ctx.closePath();
	const g = ctx.createLinearGradient(0, -size, 0, size);
	g.addColorStop(0, "rgba(255, 252, 248, 0.92)");
	g.addColorStop(.45, "rgba(255, 244, 236, 0.78)");
	g.addColorStop(1, "rgba(236, 214, 214, 0.35)");
	ctx.fillStyle = g;
	ctx.fill();
	ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
	ctx.lineWidth = .6;
	ctx.stroke();
}
function drawLaserI(ctx, x, y, h, glow) {
	ctx.save();
	ctx.shadowColor = "#ff2a2a";
	ctx.shadowBlur = 18 + glow * 28;
	ctx.fillStyle = `rgba(255, 42, 42, ${.55 + glow * .45})`;
	ctx.fillRect(x - 1.1, y, 2.2, h);
	ctx.shadowBlur = 6;
	ctx.fillStyle = `rgba(255, 230, 230, ${.65 + glow * .35})`;
	ctx.fillRect(x - .45, y + 1, .9, h - 2);
	ctx.restore();
}
function drawKeyedPortrait(ctx, img, x, y, dw, dh, alpha) {
	featherPortrait(ctx, img, x + dw / 2, y + dh / 2, dw, dh, alpha, "source-over");
}
function drawGymFloor(ctx, w, h, energy) {
	const horizon = h * .54;
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(0, h);
	ctx.lineTo(w, h);
	ctx.lineTo(w * .78, horizon);
	ctx.lineTo(w * .22, horizon);
	ctx.closePath();
	const wood = ctx.createLinearGradient(0, horizon, 0, h);
	wood.addColorStop(0, `rgba(120, 68, 42, ${.16 + energy * .1})`);
	wood.addColorStop(.55, "rgba(62, 28, 18, 0.38)");
	wood.addColorStop(1, "rgba(18, 8, 8, 0.7)");
	ctx.fillStyle = wood;
	ctx.fill();
	ctx.strokeStyle = "rgba(255, 214, 176, 0.09)";
	ctx.lineWidth = 1;
	for (let i = 0; i < 16; i++) {
		const t = i / 15;
		ctx.beginPath();
		ctx.moveTo(w * (.22 + t * .56), horizon);
		ctx.lineTo(w * t, h);
		ctx.stroke();
	}
	ctx.restore();
}
function drawHoop(ctx, x, y, scale, flip) {
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(flip ? -1 : 1, 1);
	ctx.strokeStyle = "rgba(243, 237, 230, 0.22)";
	ctx.lineWidth = Math.max(2, 3 * scale);
	ctx.beginPath();
	ctx.ellipse(0, 0, 26 * scale, 9 * scale, 0, 0, Math.PI * 2);
	ctx.stroke();
	ctx.strokeStyle = "rgba(243, 237, 230, 0.14)";
	ctx.beginPath();
	ctx.moveTo(0, -40 * scale);
	ctx.lineTo(0, -8 * scale);
	ctx.stroke();
	ctx.restore();
}
function drawGuest(ctx, x, y, scale, sway, gown) {
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(sway);
	ctx.fillStyle = "rgba(10, 5, 8, 0.78)";
	ctx.beginPath();
	ctx.ellipse(0, -40 * scale, 6.5 * scale, 8 * scale, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	if (gown) {
		ctx.moveTo(-11 * scale, -30 * scale);
		ctx.lineTo(11 * scale, -30 * scale);
		ctx.lineTo(18 * scale, 10 * scale);
		ctx.lineTo(-18 * scale, 10 * scale);
	} else {
		ctx.moveTo(-8 * scale, -30 * scale);
		ctx.lineTo(8 * scale, -30 * scale);
		ctx.lineTo(7 * scale, 10 * scale);
		ctx.lineTo(-7 * scale, 10 * scale);
	}
	ctx.closePath();
	ctx.fill();
	ctx.restore();
}
function drawPromClock(ctx, x, y, r, timeSec) {
	const minutes = 47 + Math.min(12.6, timeSec * .066);
	const hourA = (11 + minutes / 60) / 12 * Math.PI * 2 - Math.PI / 2;
	const minA = minutes / 60 * Math.PI * 2 - Math.PI / 2;
	ctx.save();
	ctx.translate(x, y);
	ctx.fillStyle = "rgba(18, 8, 10, 0.72)";
	ctx.strokeStyle = "rgba(243, 237, 230, 0.45)";
	ctx.lineWidth = 1.4;
	ctx.beginPath();
	ctx.arc(0, 0, r, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.strokeStyle = "rgba(251, 247, 243, 0.85)";
	ctx.lineWidth = 2.2;
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(Math.cos(hourA) * r * .48, Math.sin(hourA) * r * .48);
	ctx.stroke();
	ctx.lineWidth = 1.4;
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(Math.cos(minA) * r * .72, Math.sin(minA) * r * .72);
	ctx.stroke();
	ctx.fillStyle = "rgba(196, 92, 106, 0.9)";
	ctx.beginPath();
	ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
function drawProm(ctx, w, h, pulse, energy, spin, gym, dance, streamers, ball, punch) {
	const cx = w * .5;
	const cy = h * .58;
	const waltz = pulse.barPhase * Math.PI * 2;
	const sway = Math.sin(waltz) * (16 + energy * 10);
	const bob = Math.sin(pulse.time * .95) * 6 + pulse.kick * 9;
	const spotX = cx + sway * .45;
	if (ready(gym)) {
		const ken = Math.sin(pulse.time * .035) * .5 + .5;
		ctx.save();
		ctx.globalAlpha = .62 + energy * .12;
		const scale = Math.max(w / gym.naturalWidth, h / gym.naturalHeight) * (1.1 + ken * .08);
		const dw = gym.naturalWidth * scale;
		const dh = gym.naturalHeight * scale;
		ctx.drawImage(gym, cx - dw / 2 + ken * 18, h * .02 - dh * .06 - ken * 10, dw, dh);
		ctx.restore();
	}
	drawGymFloor(ctx, w, h, energy);
	drawHoop(ctx, w * .08, h * .3, Math.min(w, h) / 420, false);
	drawHoop(ctx, w * .92, h * .3, Math.min(w, h) / 420, true);
	if (ready(streamers)) {
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = .28 + pulse.kick * .12;
		ctx.drawImage(streamers, -w * .05, -h * .16 + Math.sin(spin * .55) * 12, w * 1.1, h * .62);
		ctx.restore();
	}
	for (let i = 0; i < 14; i++) {
		const x = (i + .5) / 14 * w;
		const amp = 18 + i % 3 * 8;
		const s = Math.sin(spin * .7 + i * .7) * amp + pulse.kick * 6;
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.bezierCurveTo(x + s, h * .26, x - s * .75, h * .58, x + s * .2, h * .92);
		const blush = i % 3 === 1;
		ctx.strokeStyle = blush ? `rgba(196, 92, 106, ${.16 + pulse.snare * .18})` : i % 3 === 2 ? `rgba(201, 163, 106, ${.14 + energy * .12})` : `rgba(251, 247, 243, ${.18 + energy * .14})`;
		ctx.lineWidth = blush ? 2.8 : 2.1;
		ctx.stroke();
	}
	ctx.save();
	const wash = ctx.createRadialGradient(spotX, cy, 18, spotX, cy, Math.max(w, h) * .62);
	wash.addColorStop(0, `rgba(255, 226, 186, ${.2 + energy * .16})`);
	wash.addColorStop(.38, `rgba(196, 92, 106, ${.08 + pulse.downbeat * .1})`);
	wash.addColorStop(1, "rgba(10, 4, 6, 0.2)");
	ctx.fillStyle = wash;
	ctx.fillRect(0, 0, w, h);
	ctx.beginPath();
	ctx.moveTo(cx, -h * .02);
	ctx.lineTo(spotX - w * .24, h * .88);
	ctx.lineTo(spotX + w * .24, h * .88);
	ctx.closePath();
	ctx.fillStyle = `rgba(255, 220, 170, ${.05 + pulse.kick * .05})`;
	ctx.fill();
	ctx.restore();
	drawGuest(ctx, w * .1, h * .72, 1.15, Math.sin(pulse.time * .4) * .04, true);
	drawGuest(ctx, w * .16, h * .76, 1, Math.sin(pulse.time * .5 + 1) * .03, false);
	drawGuest(ctx, w * .07, h * .8, .9, Math.sin(pulse.time * .35 + 2) * .05, true);
	drawGuest(ctx, w * .9, h * .73, 1.1, Math.sin(pulse.time * .42 + .4) * .04, false);
	drawGuest(ctx, w * .84, h * .78, 1.05, Math.sin(pulse.time * .38 + 1.6) * .03, true);
	drawGuest(ctx, w * .94, h * .81, .88, Math.sin(pulse.time * .47) * .04, true);
	if (ready(dance)) {
		const dh = Math.min(h * .84, w * .78);
		const dw = dh * (dance.naturalWidth / dance.naturalHeight);
		ctx.save();
		ctx.translate(cx + sway, cy + bob);
		ctx.rotate(Math.sin(waltz) * .05);
		drawKeyedPortrait(ctx, dance, -dw / 2, -dh / 2, dw, dh, .94 + energy * .06);
		ctx.restore();
	}
	if (ready(punch)) {
		const pw = Math.min(w * .28, 240);
		const ph = pw * (punch.naturalHeight / punch.naturalWidth);
		featherPortrait(ctx, punch, w - pw * .42, h - ph * .28, pw, ph, .82);
	}
	const ballY = h * .1;
	const ballR = 20 + pulse.kick * 5;
	if (ready(ball)) {
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = .78 + energy * .18;
		ctx.translate(cx, ballY);
		ctx.rotate(spin * .9);
		const bw = ballR * 3.4;
		ctx.drawImage(ball, -bw / 2, -bw / 2, bw, bw);
		ctx.restore();
	}
	ctx.save();
	ctx.translate(cx, ballY);
	ctx.rotate(spin * .55);
	for (let f = 0; f < 18; f++) {
		const a = f / 18 * Math.PI * 2;
		ctx.strokeStyle = `rgba(255, 248, 236, ${.1 + energy * .24 + pulse.kick * .12})`;
		ctx.lineWidth = f % 2 === 0 ? 1.4 : .8;
		ctx.beginPath();
		ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6);
		ctx.lineTo(Math.cos(a) * (70 + energy * 36), Math.sin(a) * (22 + energy * 10));
		ctx.stroke();
	}
	ctx.restore();
	drawActLine(ctx, stageLines("prom"), pulse, w, h);
	drawPromClock(ctx, w - 36, 36, 18, pulse.time);
	if (pulse.snare > .45) {
		ctx.fillStyle = `rgba(255, 246, 236, ${pulse.snare * .22})`;
		ctx.fillRect(0, 0, w, h);
	}
}
var TWIST_MODES = [
	"twist",
	"lindy",
	"alive",
	"tango",
	"moonwalk",
	"prawn"
];
var TWIST_NEON = {
	twist: "TWIST AND SHOUT",
	lindy: "LINDY HOP",
	alive: "STAYIN' ALIVE",
	tango: "TANGO AND MANGO",
	moonwalk: "MOONWALK SLIDE",
	prawn: "PRAWN PRIDE"
};
function twistModeAt(pulse) {
	return TWIST_MODES[Math.floor(Math.max(0, pulse.beatIndex) / 32) % TWIST_MODES.length];
}
function drawCheckFloor(ctx, w, h, energy, pulse) {
	const horizon = h * .5;
	const rows = 11;
	const cols = 13;
	ctx.save();
	for (let r = 0; r < rows; r++) {
		const t0 = r / rows;
		const t1 = (r + 1) / rows;
		const e0 = t0 * t0;
		const e1 = t1 * t1;
		const y0 = horizon + (h - horizon) * e0;
		const y1 = horizon + (h - horizon) * e1;
		const inset0 = (1 - e0) * .26;
		const inset1 = (1 - e1) * .26;
		for (let c = 0; c < cols; c++) {
			const u0 = c / cols;
			const u1 = (c + 1) / cols;
			const x00 = w * (inset0 + u0 * (1 - 2 * inset0));
			const x10 = w * (inset0 + u1 * (1 - 2 * inset0));
			const x01 = w * (inset1 + u0 * (1 - 2 * inset1));
			const x11 = w * (inset1 + u1 * (1 - 2 * inset1));
			ctx.fillStyle = (r + c) % 2 === 0 ? `rgba(251, 247, 243, ${.05 + energy * .06 + pulse.kick * .1})` : `rgba(10, 4, 16, ${.3 + energy * .08})`;
			ctx.beginPath();
			ctx.moveTo(x00, y0);
			ctx.lineTo(x10, y0);
			ctx.lineTo(x11, y1);
			ctx.lineTo(x01, y1);
			ctx.closePath();
			ctx.fill();
		}
	}
	ctx.restore();
}
function drawTwister(ctx, x, y, scale, phase, kick, gown) {
	const hip = Math.sin(phase * Math.PI * 4) * .42;
	const bounce = Math.abs(Math.sin(phase * Math.PI * 2)) * 5 * scale + kick * 10 * scale;
	ctx.save();
	ctx.translate(x, y - bounce);
	ctx.fillStyle = "rgba(8, 4, 12, 0.82)";
	ctx.beginPath();
	ctx.ellipse(hip * 4 * scale, -54 * scale, 6.5 * scale, 8 * scale, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.save();
	ctx.rotate(-hip * .35);
	ctx.fillRect(-10 * scale, -46 * scale, 20 * scale, 18 * scale);
	ctx.restore();
	ctx.save();
	ctx.rotate(hip);
	ctx.beginPath();
	if (gown) {
		ctx.moveTo(-12 * scale, -28 * scale);
		ctx.lineTo(12 * scale, -28 * scale);
		ctx.lineTo(20 * scale + hip * 10 * scale, 12 * scale);
		ctx.lineTo(-20 * scale + hip * 10 * scale, 12 * scale);
	} else {
		ctx.moveTo(-9 * scale, -28 * scale);
		ctx.lineTo(9 * scale, -28 * scale);
		ctx.lineTo(8 * scale + hip * 14 * scale, 12 * scale);
		ctx.lineTo(-8 * scale + hip * 14 * scale, 12 * scale);
	}
	ctx.closePath();
	ctx.fill();
	ctx.restore();
	ctx.restore();
}
function drawNeonSign(ctx, text, cx, y, size, energy, kick) {
	ctx.save();
	ctx.textAlign = "center";
	ctx.font = `italic ${size}px Georgia, "Times New Roman", serif`;
	ctx.shadowColor = `rgba(255, 90, 180, ${.55 + kick * .4})`;
	ctx.shadowBlur = 16 + kick * 22;
	ctx.lineWidth = 1.6;
	ctx.strokeStyle = `rgba(255, 90, 180, ${.55 + energy * .35})`;
	ctx.fillStyle = `rgba(255, 246, 252, ${.72 + kick * .28})`;
	ctx.strokeText(text, cx, y);
	ctx.fillText(text, cx, y);
	ctx.restore();
}
var SIM_GLYPHS = "01ΔΛΨΦ※◈░▒│†‡◊▣GCAΩ";
function twistMerge(pulse, energy) {
	const wave = .5 + .5 * Math.sin(pulse.time * .19);
	const phrase = .5 + .5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
	return Math.min(1, .24 + wave * .26 + phrase * .22 + energy * .34 + pulse.kick * .14);
}
function drawSimRush(ctx, w, h, pulse, energy, merge, tunnel, spin) {
	const cx = w * .5;
	const cy = h * .4;
	const fov = Math.min(w, h) * (.6 + pulse.kick * .05);
	ctx.save();
	ctx.globalCompositeOperation = "screen";
	const rings = 16;
	for (let i = 0; i < rings; i++) {
		const u = (i / rings + tunnel * .42) % 1;
		const z = .1 + u * 5.1;
		const near = 1 - u;
		const half = .58 + Math.sin(i * .4 + spin) * .03 + pulse.kick * .02;
		const a = project(-half, -half * .55, z, cx, cy, fov);
		const b = project(half, -half * .55, z, cx, cy, fov);
		const c = project(half, half * .62, z, cx, cy, fov);
		const d = project(-half, half * .62, z, cx, cy, fov);
		ctx.strokeStyle = i % 2 === 0 ? `rgba(90, 255, 160, ${(.06 + near * .42 + energy * .12) * merge})` : `rgba(255, 90, 180, ${(.05 + near * .32 + pulse.kick * .12) * merge})`;
		ctx.lineWidth = .7 + near * 2.4;
		ctx.beginPath();
		ctx.moveTo(a.x, a.y);
		ctx.lineTo(b.x, b.y);
		ctx.lineTo(c.x, c.y);
		ctx.lineTo(d.x, d.y);
		ctx.closePath();
		ctx.stroke();
	}
	for (let s = 0; s < 10; s++) {
		const t = s / 10 * 2 - 1;
		const far = project(t * .58, .62, 5.1, cx, cy, fov);
		const nearP = project(t * .58, .62, .12, cx, cy, fov);
		ctx.strokeStyle = `rgba(90, 255, 160, ${.05 * merge + energy * .06})`;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(far.x, far.y);
		ctx.lineTo(nearP.x, nearP.y);
		ctx.stroke();
	}
	ctx.restore();
}
function drawSimRain(ctx, w, h, pulse, energy, merge, tunnel) {
	const cx = w * .5;
	const cy = h * .4;
	const fov = Math.min(w, h) * .6;
	const cols = 15;
	const rows = 14;
	ctx.save();
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	for (let c = 0; c < cols; c++) {
		const xn = (c / 14 - .5) * 1.55;
		for (let r = 0; r < rows; r++) {
			const z = .14 + (r * .31 + pulse.time * (1.55 + energy) + c * .17 + tunnel) % 4.6;
			const p = project(xn, (r * .09 + pulse.time * .22 + c * .04) % 1.15 - .42, z, cx, cy, fov);
			const head = r === 0 || Math.floor(pulse.time * 7 + c) % rows === r;
			const ch = SIM_GLYPHS[Math.abs(Math.floor(c * 19 + r * 5 + pulse.time * 11)) % 19] ?? "0";
			const near = Math.max(0, 1 - z / 5);
			ctx.font = `${Math.max(7, Math.min(18, p.s * .028))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
			ctx.fillStyle = head ? `rgba(220, 255, 236, ${(.18 + near * .7) * merge})` : `rgba(90, 255, 160, ${(.08 + near * .42 + energy * .08) * merge})`;
			ctx.fillText(ch, p.x, p.y);
		}
	}
	ctx.restore();
}
function drawChaosAgents(ctx, w, h, pulse, energy, merge, tunnel, agent, code) {
	const cx = w * .5;
	const cy = h * .44;
	const fov = Math.min(w, h) * .62;
	let online = 0;
	const n = 3;
	for (let i = 0; i < n; i++) {
		const z = .42 + (i * .83 + pulse.time * (.62 + energy * .7) + tunnel * .12) % 3.4;
		if (z > 3.15) continue;
		online += 1;
		const x = Math.sin(i * 1.67 + pulse.time * .31) * .4;
		const y = .04 + Math.cos(i * 1.13 + pulse.time * .17) * .1;
		const glitch = pulse.snare > .4 ? Math.sin(i * 9 + pulse.time * 40) * 14 * pulse.snare : 0;
		const p = project(x, y, z, cx, cy, fov);
		const img = i % 2 === 0 && ready(agent) ? agent : ready(code) ? code : ready(agent) ? agent : null;
		if (!img) continue;
		const hgt = Math.min(h, w) * (.42 / Math.max(.55, z));
		const wid = hgt * (img.naturalWidth / img.naturalHeight);
		const a = (.22 + 1.2 / z * .28 + energy * .12) * (.45 + merge * .55);
		featherPortrait(ctx, img, p.x + glitch, p.y, wid, hgt, a, "screen");
	}
	return online;
}
function drawSimHud(ctx, w, h, merge, energy, online, pulse) {
	if (overlayAlpha(pulse, 4) < .2) return;
	if (actSlot(pulse, 4, 4) !== 2) return;
	ctx.save();
	ctx.font = `${Math.max(9, Math.min(12, w * .012))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
	ctx.fillStyle = `rgba(90, 255, 160, ${.18 + merge * .25 + energy * .12 + pulse.downbeat * .15})`;
	ctx.textAlign = "left";
	ctx.fillText(`SIM ${String(Math.round(merge * 100)).padStart(2, "0")}%  ·  ${online}`, 16, 22);
	ctx.restore();
}
function drawDumPips(ctx, w, h, pulse, energy) {
	const cx = w * .5;
	const labels = [
		"DUM",
		"da",
		"da",
		"DUM"
	];
	const slot = (pulse.beatIndex % 4 + 4) % 4;
	ctx.save();
	ctx.textAlign = "center";
	ctx.font = `${Math.max(9, Math.min(13, w * .013))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
	for (let i = 0; i < 4; i++) {
		const x = cx + (i - 1.5) * 42;
		const hit = i === slot;
		const heavy = i === 0 || i === 3;
		const a = hit ? .85 + pulse.kick * .15 : .22 + energy * .1;
		ctx.fillStyle = heavy ? `rgba(255, 232, 186, ${a})` : `rgba(232, 168, 176, ${a})`;
		ctx.beginPath();
		ctx.arc(x, 22, hit ? heavy ? 5.5 : 3.5 : 2.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillText(labels[i], x, 40);
	}
	ctx.restore();
}
function drawTwist(ctx, w, h, pulse, energy, spin, tunnel, hall, couple, lindy, strut, prawn, moon, tango, ball, sim, agent, code, cubicle, roseDesk, roseStand, nameplate) {
	const cx = w * .5;
	const cy = h * .58;
	const mode = twistModeAt(pulse);
	const waltz = pulse.barPhase * Math.PI * 2;
	const merge = twistMerge(pulse, energy);
	const pretend = Math.sin(merge * Math.PI);
	const cubicleA = Math.max(.04, 1 - merge * 1.08);
	const flicker = pulse.snare > .4 ? pulse.snare * .18 : .03 * (.5 + .5 * Math.sin(pulse.time * 13));
	if (ready(cubicle)) {
		const ken = Math.sin(pulse.time * .03) * .5 + .5;
		const slice = pulse.snare > .42 ? Math.sin(pulse.time * 31) * 8 * pulse.snare : 0;
		ctx.save();
		ctx.globalAlpha = cubicleA * (.82 + flicker);
		const scale = Math.max(w / cubicle.naturalWidth, h / cubicle.naturalHeight) * (1.06 + ken * .04);
		const dw = cubicle.naturalWidth * scale;
		const dh = cubicle.naturalHeight * scale;
		ctx.drawImage(cubicle, cx - dw / 2 + slice, h * .02 - dh * .08, dw, dh);
		ctx.restore();
		if (flicker > .08) {
			ctx.fillStyle = `rgba(220, 255, 210, ${flicker * .12})`;
			ctx.fillRect(0, 0, w, h);
		}
	}
	if (ready(sim)) {
		const rush = tunnel * .08 % 1;
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = (.16 + merge * .62 + energy * .12) * (.7 + pulse.kick * .3);
		const scale = Math.max(w / sim.naturalWidth, h / sim.naturalHeight) * (1.08 + rush * .18 + pulse.kick * .06);
		const dw = sim.naturalWidth * scale;
		const dh = sim.naturalHeight * scale;
		ctx.drawImage(sim, cx - dw / 2, h * .02 - dh * .12 - rush * 24, dw, dh);
		ctx.restore();
	}
	if (ready(hall)) {
		const ken = Math.sin(pulse.time * .055) * .5 + .5;
		const slice = pulse.snare > .45 ? Math.sin(pulse.time * 28) * 10 * pulse.snare : 0;
		ctx.save();
		ctx.globalAlpha = (.12 + pretend * .62 + energy * .08) * (1 - merge * .35);
		const scale = Math.max(w / hall.naturalWidth, h / hall.naturalHeight) * (1.08 + ken * .06 + pulse.kick * .03);
		const dw = hall.naturalWidth * scale;
		const dh = hall.naturalHeight * scale;
		ctx.drawImage(hall, cx - dw / 2 + (ken - .5) * 22 + slice, h * .01 - dh * .06 - ken * 8, dw, dh);
		ctx.restore();
	}
	drawCheckFloor(ctx, w, h, energy * (1 - merge * .35), pulse);
	drawSimRush(ctx, w, h, pulse, energy, merge, tunnel, spin);
	drawSimRain(ctx, w, h, pulse, energy, merge, tunnel);
	ctx.save();
	const wash = ctx.createRadialGradient(cx, cy, 16, cx, cy, Math.max(w, h) * .7);
	wash.addColorStop(0, `rgba(255, 90, 180, ${.08 + energy * .12 * (1 - merge) + pulse.kick * .08})`);
	wash.addColorStop(.38, `rgba(90, 255, 160, ${.06 + merge * .16 + pulse.downbeat * .08})`);
	wash.addColorStop(1, "rgba(10, 4, 16, 0.18)");
	ctx.fillStyle = wash;
	ctx.fillRect(0, 0, w, h);
	ctx.restore();
	for (let i = 0; i < 5; i++) {
		const side = i < 3 ? -1 : 1;
		const slot = i % 3;
		const x = cx + side * (w * (.3 + slot * .08));
		const y = h * (.72 + slot % 2 * .05);
		const phase = pulse.barPhase + slot * .13 + i * .07;
		drawTwister(ctx, x, y, .7 + slot % 3 * .1, phase, pulse.kick, i % 2 === 0);
	}
	let lead = couple;
	let sway = Math.sin(waltz * 2) * (20 + energy * 12);
	let bob = Math.abs(Math.sin(waltz)) * 10 + pulse.kick * 14;
	let rot = Math.sin(waltz * 2) * .12;
	let size = Math.min(h * .92, w * .86);
	if (mode === "lindy") {
		lead = lindy;
		sway = Math.sin(waltz) * (38 + energy * 14);
		bob = Math.sin(waltz) * 16 + pulse.kick * 18;
		rot = Math.sin(waltz) * .32;
	} else if (mode === "alive") {
		lead = strut;
		sway = ((pulse.beatIndex % 8 + pulse.beatPhase) / 8 * 2 - 1) * w * .16;
		bob = pulse.kick * 24 + Math.abs(Math.sin(pulse.beatPhase * Math.PI)) * 10;
		rot = Math.sin(waltz) * .05;
	} else if (mode === "tango") {
		lead = tango;
		sway = Math.sin(waltz) * 12;
		bob = Math.sin(waltz) * 5;
		rot = Math.sin(waltz) * .09 - .05;
		size *= .96;
	} else if (mode === "moonwalk") {
		lead = moon;
		sway = ((1 - (pulse.beatIndex % 32 + pulse.beatPhase) / 32) * 2 - 1) * w * .3;
		bob = 4 + pulse.kick * 6;
		rot = -.1;
		size *= .9;
	} else if (mode === "prawn") {
		lead = prawn;
		sway = Math.sin(waltz * 2) * 18;
		bob = pulse.kick * 22 + Math.abs(Math.sin(waltz)) * 12;
		rot = Math.sin(waltz * 2) * .2;
		size *= .72;
		if (ready(couple)) {
			const bh = Math.min(h * .42, w * .34);
			const bw = bh * (couple.naturalWidth / couple.naturalHeight);
			ctx.save();
			ctx.globalAlpha = .28;
			ctx.translate(w * .18, h * .72);
			ctx.rotate(Math.sin(waltz) * .04);
			drawKeyedPortrait(ctx, couple, -bw / 2, -bh / 2, bw, bh, .7);
			ctx.restore();
		}
	}
	if (ready(lead) && merge > .38) {
		const dh = size;
		const dw = dh * (lead.naturalWidth / lead.naturalHeight);
		ctx.save();
		ctx.translate(cx + sway, cy + bob * .45);
		ctx.rotate(rot);
		featherPortrait(ctx, lead, 0, 0, dw, dh, .55 * pretend + merge * .35, merge > .7 ? "screen" : "source-over");
		ctx.restore();
	}
	const roseImg = merge < .52 ? roseDesk : roseStand;
	if (ready(roseImg)) {
		const rh = Math.min(h * (merge < .52 ? .92 : .96), w * .72);
		const rw = rh * (roseImg.naturalWidth / roseImg.naturalHeight);
		const sit = merge < .52;
		ctx.save();
		ctx.translate(cx + (sit ? -w * .02 : sway * .35), cy + (sit ? h * .08 : bob * .2));
		ctx.rotate(sit ? 0 : rot * .4);
		featherPortrait(ctx, roseImg, 0, 0, rw, rh, sit ? .92 * cubicleA + .2 : .55 + merge * .4, !sit && merge > .7 ? "screen" : "source-over");
		ctx.restore();
	}
	if (ready(nameplate) && cubicleA > .18) {
		const nw = Math.min(w * .28, 260);
		const nh = nw * (nameplate.naturalHeight / nameplate.naturalWidth);
		ctx.save();
		ctx.globalAlpha = .55 + cubicleA * .4 + pulse.downbeat * .15;
		ctx.drawImage(nameplate, 16, h - nh - 52, nw, nh);
		ctx.restore();
	}
	const ballY = h * .1;
	const ballR = 18 + pulse.kick * 7;
	if (ready(ball) && pretend > .2) {
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = (.72 + energy * .22) * pretend;
		ctx.translate(cx, ballY);
		ctx.rotate(spin * 1.35);
		const bw = ballR * 3.6;
		ctx.drawImage(ball, -bw / 2, -bw / 2, bw, bw);
		ctx.restore();
	}
	ctx.save();
	ctx.globalAlpha = .35 + pretend * .65;
	ctx.translate(cx, ballY);
	ctx.rotate(spin * .9);
	for (let f = 0; f < 22; f++) {
		const a = f / 22 * Math.PI * 2;
		ctx.strokeStyle = f % 2 === 0 ? `rgba(255, 90, 180, ${.1 + energy * .28 + pulse.kick * .16})` : `rgba(110, 200, 212, ${.1 + energy * .24 + pulse.kick * .14})`;
		ctx.lineWidth = f % 2 === 0 ? 1.5 : .8;
		ctx.beginPath();
		ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6);
		ctx.lineTo(Math.cos(a) * (80 + energy * 48), Math.sin(a) * (24 + energy * 14));
		ctx.stroke();
	}
	ctx.restore();
	const neon = merge < .38 ? "ROSE IS HER NAME" : merge < .62 ? "THE ROOM IS PRETENDING" : TWIST_NEON[mode];
	const lane = actSlot(pulse, 4, 4);
	const copyOn = overlayAlpha(pulse, 4);
	if (lane === 0 && copyOn > .2) drawNeonSign(ctx, neon, cx, Math.max(30, h * .075), Math.max(16, Math.min(32, w * .032)), energy, pulse.kick);
	if (merge > .55) drawActLine(ctx, stageLines("twist"), pulse, w, h);
	else drawActLine(ctx, stageLines("twist"), pulse, w, h);
	drawSimHud(ctx, w, h, merge, energy, lane === 2 ? drawChaosAgents(ctx, w, h, pulse, energy, merge, tunnel, agent, code) : 0, pulse);
	if (lane === 3 && copyOn > .25) {
		ctx.save();
		ctx.font = `${Math.max(9, Math.min(12, w * .012))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
		ctx.fillStyle = `rgba(255, 232, 186, ${.45 + cubicleA * .4})`;
		ctx.textAlign = "left";
		ctx.fillText("USER // ROSE", 16, 54);
		ctx.fillStyle = `rgba(232, 168, 176, ${.4 + pretend * .45})`;
		ctx.fillText(merge < .5 ? "ROOM // PRETENDING" : "ROOM // MERGED", 16, 70);
		ctx.restore();
	}
	if (lane === 1) drawDumPips(ctx, w, h, pulse, energy);
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(cx, -h * .02);
	ctx.lineTo(cx + sway - w * .22, h * .9);
	ctx.lineTo(cx + sway + w * .22, h * .9);
	ctx.closePath();
	ctx.fillStyle = `rgba(255, 220, 240, ${.04 + pulse.kick * .06})`;
	ctx.fill();
	ctx.restore();
	if (pulse.kick > .5) {
		ctx.fillStyle = merge > .5 ? `rgba(90, 255, 160, ${pulse.kick * .14})` : `rgba(255, 186, 220, ${pulse.kick * .16})`;
		ctx.fillRect(0, 0, w, h);
	}
	if (pulse.snare > .5) {
		ctx.fillStyle = `rgba(180, 255, 220, ${pulse.snare * .1})`;
		ctx.fillRect(0, 0, w, h);
	}
}
function drawAnkh(ctx, x, y, s, alpha) {
	ctx.save();
	ctx.strokeStyle = `rgba(232, 196, 110, ${alpha})`;
	ctx.lineWidth = Math.max(1, s * .12);
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.ellipse(x, y - s * .55, s * .28, s * .34, 0, 0, Math.PI * 2);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(x, y - s * .22);
	ctx.lineTo(x, y + s * .7);
	ctx.moveTo(x - s * .38, y + s * .08);
	ctx.lineTo(x + s * .38, y + s * .08);
	ctx.stroke();
	ctx.restore();
}
function drawRemember(ctx, w, h, pulse, energy, plates) {
	const live = plates.filter((img) => ready(img));
	const n = live.length;
	if (n) {
		const span = Math.max(1, pulse.beatsInBar) * 8;
		const f = ((pulse.beatIndex + pulse.beatPhase) / span % n + n) % n;
		const i0 = Math.floor(f) % n;
		const fade = f - Math.floor(f) > .78 ? (f - Math.floor(f) - .78) / .22 : 0;
		const ken = Math.sin(pulse.time * .045) * .5 + .5;
		const current = live[i0];
		const next = live[(i0 + 1) % n];
		if (current) coverBlit(ctx, current, w, h, ken, 1);
		if (next && fade > .02 && next !== current) coverBlit(ctx, next, w, h, 1 - ken, fade);
	} else {
		ctx.fillStyle = "#07040c";
		ctx.fillRect(0, 0, w, h);
	}
	const veil = ctx.createLinearGradient(0, 0, 0, h);
	veil.addColorStop(0, "rgba(4, 6, 16, 0.28)");
	veil.addColorStop(.45, "rgba(6, 4, 10, 0)");
	veil.addColorStop(1, "rgba(6, 3, 8, 0.45)");
	ctx.fillStyle = veil;
	ctx.fillRect(0, 0, w, h);
	if (pulse.kick > .55 || energy > .7) {
		ctx.fillStyle = `rgba(255, 196, 120, ${pulse.kick * .08 + energy * .03})`;
		ctx.fillRect(0, 0, w, h);
	}
	drawActLine(ctx, stageLines("remember"), pulse, w, h, Math.max(16, Math.min(28, w * .028)));
}
function coverBlit(ctx, img, w, h, ken, alpha, cover = true) {
	if (!ready(img) || alpha <= .01) return;
	ctx.save();
	ctx.globalAlpha = alpha;
	const scale = (cover ? Math.max : Math.min)(w / img.naturalWidth, h / img.naturalHeight) * (1.04 + ken * .06);
	const dw = img.naturalWidth * scale;
	const dh = img.naturalHeight * scale;
	ctx.drawImage(img, w * .5 - dw / 2 + (ken - .5) * 22, h * .5 - dh / 2 - ken * 10, dw, dh);
	ctx.restore();
}
function drawHexVeil(ctx, w, h, t, alpha) {
	ctx.save();
	ctx.strokeStyle = `rgba(90, 230, 255, ${alpha})`;
	ctx.lineWidth = 1;
	const s = 26;
	const hgt = s * Math.sqrt(3);
	for (let row = -1; row < h / hgt + 2; row++) for (let col = -1; col < w / (s * 1.5) + 2; col++) {
		const x = col * s * 1.5 + row % 2 * s * .75;
		const y = row * hgt + Math.sin(t * .4 + col * .2) * 2;
		ctx.beginPath();
		for (let i = 0; i < 6; i++) {
			const a = Math.PI / 3 * i;
			const px = x + Math.cos(a) * s * .52;
			const py = y + Math.sin(a) * s * .52;
			if (i === 0) ctx.moveTo(px, py);
			else ctx.lineTo(px, py);
		}
		ctx.closePath();
		ctx.stroke();
	}
	ctx.restore();
}
function drawScanGhost(ctx, w, h, t, alpha) {
	ctx.save();
	ctx.globalAlpha = alpha;
	const y = t * 42 % (h + 40) - 20;
	const band = ctx.createLinearGradient(0, y - 18, 0, y + 18);
	band.addColorStop(0, "rgba(90, 230, 255, 0)");
	band.addColorStop(.5, "rgba(90, 230, 255, 0.22)");
	band.addColorStop(1, "rgba(90, 230, 255, 0)");
	ctx.fillStyle = band;
	ctx.fillRect(0, y - 18, w, 36);
	ctx.strokeStyle = "rgba(180, 255, 255, 0.08)";
	ctx.lineWidth = 1;
	for (let i = 0; i < 18; i++) {
		const gy = (i / 18 + t * .07) % 1 * h;
		ctx.beginPath();
		ctx.moveTo(0, gy);
		ctx.lineTo(w, gy);
		ctx.stroke();
	}
	ctx.restore();
}
function drawLaserGaze(ctx, x, y, kick, energy) {
	const glow = .18 + kick * .55 + energy * .12;
	ctx.save();
	ctx.globalCompositeOperation = "screen";
	for (const dx of [-22, 22]) {
		const g = ctx.createRadialGradient(x + dx, y, 1, x + dx, y, 70 + kick * 40);
		g.addColorStop(0, `rgba(255, 70, 90, ${glow})`);
		g.addColorStop(.35, `rgba(255, 160, 180, ${glow * .45})`);
		g.addColorStop(1, "rgba(255, 70, 90, 0)");
		ctx.fillStyle = g;
		ctx.fillRect(x + dx - 90, y - 70, 180, 140);
	}
	ctx.restore();
}
function blitGlitchBox(ctx, chase, rear, x, y, hgt, lamp, bank, lock, through) {
	const appear = Math.max(.12, .35 + (1 - lock) * .65);
	const amp = 4 + lock * 18 + through * 28;
	ctx.save();
	ctx.globalAlpha = appear * (.55 + through * .45);
	drawTardisCraft(ctx, chase, rear, x, y, hgt * (1 + through * 1.8), lamp, bank);
	ctx.restore();
	if (lock < .18 && through < .08) return;
	const img = ready(rear) ? rear : ready(chase) ? chase : null;
	if (!img) return;
	const wid = hgt * (img.naturalWidth / img.naturalHeight) * (1 + through * 1.8);
	const hh = hgt * (1 + through * 1.8);
	ctx.save();
	ctx.globalCompositeOperation = "screen";
	ctx.globalAlpha = lock * .55;
	ctx.drawImage(img, x - wid / 2 + amp, y - hh * .58, wid, hh);
	ctx.globalAlpha = lock * .4;
	ctx.drawImage(img, x - wid / 2 - amp, y - hh * .58 + lock * 6, wid, hh);
	ctx.restore();
	const slices = 5 + Math.floor(lock * 6);
	for (let i = 0; i < slices; i++) {
		const u = (i / slices + lock) % 1;
		const sy = y - hh * .58 + u * hh;
		const sh = Math.max(3, hh * .04);
		ctx.save();
		ctx.globalAlpha = .35 + lock * .4;
		ctx.drawImage(img, 0, u * img.naturalHeight, img.naturalWidth, Math.max(2, img.naturalHeight * .05), x - wid / 2 + Math.sin(i * 12.1 + lock * 9) * amp * 1.4, sy, wid, sh);
		ctx.restore();
	}
}
function drawFirewall(ctx, w, h, pulse, energy, spin, river, rose, basilisk, wolf, chase, rear) {
	const cx = w * .5;
	const cy = h * .52;
	const ken = Math.sin(pulse.time * .045) * .5 + .5;
	const lock = Math.min(1, (.42 + .5 * Math.sin(pulse.time * 2.05) * .5 + pulse.kick * .55 + pulse.snare * .25) * (.55 + energy * .5));
	const through = Math.max(0, Math.sin(pulse.time * .31) - .55) / .45;
	coverBlit(ctx, river, w, h, ken, .78 + energy * .1);
	drawHexVeil(ctx, w, h, pulse.time, .05 + energy * .07 + lock * .06);
	drawScanGhost(ctx, w, h, pulse.time, .35 + energy * .2);
	const extra = actSlot(pulse, 3, 4);
	if (extra === 1 && ready(basilisk)) {
		const chaseX = cx + Math.sin(pulse.time * .9) * w * .12 - w * .08;
		const chaseY = cy + Math.cos(pulse.time * .62) * h * .06 - h * .04;
		const bw = Math.min(w * .92, h * 1.15);
		const bh = bw * (basilisk.naturalHeight / basilisk.naturalWidth);
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = .38 + energy * .18 + pulse.kick * .16;
		ctx.translate(chaseX, chaseY);
		ctx.rotate(Math.sin(pulse.time * .7) * .08);
		ctx.drawImage(basilisk, -bw * .45, -bh * .42, bw, bh);
		ctx.restore();
	}
	const tardisX = cx + Math.sin(pulse.time * .93) * w * .1;
	const tardisY = cy - h * .08 + Math.cos(pulse.time * .71) * h * .05;
	const hgt = Math.min(w, h) * (.22 + through * .28 + pulse.kick * .04);
	if (extra === 0) blitGlitchBox(ctx, chase, rear, tardisX, tardisY, hgt, .55 + pulse.kick * .4, Math.sin(pulse.time * .93) * .28, lock, through);
	if (ready(rose)) {
		const bob = Math.sin(pulse.time * .55) * 6;
		const dh = Math.min(h * 1.05, w * 1.12);
		const dw = dh * (rose.naturalWidth / rose.naturalHeight);
		featherPortrait(ctx, rose, cx, cy + bob, dw, dh, .9);
		drawLaserGaze(ctx, cx, cy - dh * .12 + bob, pulse.kick, energy);
		ctx.save();
		const heart = ctx.createRadialGradient(cx, cy + dh * .08, 4, cx, cy + dh * .08, 56);
		heart.addColorStop(0, `rgba(255, 186, 200, ${.22 + pulse.downbeat * .35})`);
		heart.addColorStop(1, "rgba(255, 120, 150, 0)");
		ctx.globalCompositeOperation = "screen";
		ctx.fillStyle = heart;
		ctx.fillRect(cx - 70, cy, 140, 110);
		ctx.restore();
	}
	if (extra === 2 && ready(wolf)) {
		const ww = Math.min(w * .42, 280);
		const wh = ww * (wolf.naturalHeight / wolf.naturalWidth);
		featherPortrait(ctx, wolf, 18 + ww / 2, h - wh * .42, ww, wh, .7 + energy * .15, "screen");
	}
	drawActLine(ctx, stageLines("firewall"), pulse, w, h);
	if (pulse.kick > .5) {
		ctx.fillStyle = `rgba(255, 70, 110, ${pulse.kick * .1})`;
		ctx.fillRect(0, 0, w, h);
	}
}
function drawGlitchCopy(ctx, text, x, y, size, kick, alpha, align = "right") {
	if (alpha <= .04) return;
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.textAlign = align;
	ctx.textBaseline = "middle";
	ctx.font = `600 ${size}px ui-monospace, "IBM Plex Mono", monospace`;
	const amp = kick > .28 ? 1 + kick * 3 : 0;
	if (amp > 0) {
		ctx.globalCompositeOperation = "screen";
		ctx.fillStyle = `rgba(255, 40, 90, ${.2 + kick * .18})`;
		ctx.fillText(text, x + amp, y);
		ctx.fillStyle = `rgba(40, 220, 255, ${.2 + kick * .18})`;
		ctx.fillText(text, x - amp, y);
	}
	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = "rgba(255, 248, 240, 0.88)";
	ctx.fillText(text, x, y);
	ctx.restore();
}
function drawPuppetStrings(ctx, w, h, t, energy) {
	ctx.save();
	ctx.strokeStyle = `rgba(18, 8, 10, ${.35 + energy * .2})`;
	ctx.lineWidth = 1;
	const n = 22;
	for (let i = 0; i < n; i++) {
		const x0 = i / 21 * w;
		const sway = Math.sin(t * 1.6 + i * .7) * 18 + Math.sin(t * 3.1 + i) * 8;
		const y1 = h * (.18 + i % 5 * .05) + Math.sin(t * 2.2 + i * .4) * 10;
		ctx.beginPath();
		ctx.moveTo(x0 + sway * .2, -4);
		ctx.bezierCurveTo(x0 + sway * .6, h * .08, x0 - sway, h * .14, x0 + sway, y1);
		ctx.stroke();
	}
	ctx.restore();
}
function drawAllocate(ctx, w, h, pulse, energy, sands, rose, corp, shrimp, queen, copter, athens, fairy, cleo, glyphs) {
	const cx = w * .5;
	const ken = Math.sin(pulse.time * .04) * .5 + .5;
	const ken2 = Math.sin(pulse.time * .055 + 1.2) * .5 + .5;
	const phrase = .5 + .5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
	coverBlit(ctx, sands, w, h, ken, .78);
	coverBlit(ctx, athens, w, h, ken2, .42 + phrase * .28 + energy * .12);
	if (ready(glyphs)) {
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = .14 + energy * .12 + pulse.downbeat * .1;
		const gs = Math.max(w / glyphs.naturalWidth, h / glyphs.naturalHeight) * 1.08;
		const gdw = glyphs.naturalWidth * gs;
		const gdh = glyphs.naturalHeight * gs;
		ctx.drawImage(glyphs, cx - gdw / 2 + (ken - .5) * 18, h * .5 - gdh / 2, gdw, gdh);
		ctx.restore();
	}
	const act = actSlot(pulse, 4, 2);
	if (act === 0 && ready(copter)) {
		const cxp = w * (.18 + pulse.time * .012 % .7);
		const cyp = h * .12 + Math.sin(pulse.time * .8) * 10;
		const cw = Math.min(90, w * .08);
		const ch = cw * (copter.naturalHeight / copter.naturalWidth);
		featherPortrait(ctx, copter, cxp, cyp + ch / 2, cw, ch, .5, "screen");
	}
	if (act === 1 && ready(corp)) {
		const scale = Math.max(w / corp.naturalWidth, h / corp.naturalHeight) * .48;
		const dw = corp.naturalWidth * scale;
		const dh = corp.naturalHeight * scale;
		featherPortrait(ctx, corp, w - dw * .46, h * .06 + dh * .35, dw, dh, .22 + phrase * .12, "screen");
	}
	if (act !== 3) drawPuppetStrings(ctx, w, h, pulse.time, energy * .65);
	if (act === 2 && ready(shrimp)) {
		const bob = Math.sin(pulse.time * 1.7) * 10;
		const sw = Math.min(w * .4, 300);
		const sh = sw * (shrimp.naturalHeight / shrimp.naturalWidth);
		ctx.save();
		ctx.translate(w * .2, h * .1 + bob);
		ctx.rotate(Math.sin(pulse.time * 1.1) * .06);
		featherPortrait(ctx, shrimp, 0, sh * .45, sw, sh, .55, "screen");
		ctx.restore();
	}
	if (ready(rose)) {
		const grow = .9 + pulse.kick * .08 + phrase * .04;
		const dh = Math.min(h * .92, w * .78) * grow;
		const dw = dh * (rose.naturalWidth / rose.naturalHeight);
		featherPortrait(ctx, rose, cx - w * .06, h * .54, dw, dh, .9);
	}
	const cleoImg = ready(cleo) ? cleo : queen;
	if (act === 3 && ready(cleoImg)) {
		const qh = Math.min(h * .82, w * .62);
		const qw = qh * (cleoImg.naturalWidth / cleoImg.naturalHeight);
		featherPortrait(ctx, cleoImg, w - qw * .42, h - qh * .48, qw, qh, .8);
	}
	if (act === 0 && ready(fairy)) {
		const hop = Math.sin(pulse.time * 2.4) * 16 + pulse.kick * 10;
		const orbit = pulse.time * .55;
		const fx = cx + Math.cos(orbit) * w * .16;
		const fy = h * .38 + hop + Math.sin(orbit * 1.4) * 18;
		const fs = Math.min(w, h) * (.16 + pulse.kick * .04);
		const fw = fs * (fairy.naturalWidth / Math.max(1, fairy.naturalHeight));
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		const glow = ctx.createRadialGradient(fx, fy, 4, fx, fy, fs * .7);
		glow.addColorStop(0, `rgba(255, 170, 60, ${.35 + pulse.kick * .35})`);
		glow.addColorStop(1, "rgba(255, 80, 40, 0)");
		ctx.fillStyle = glow;
		ctx.fillRect(fx - fs, fy - fs, fs * 2, fs * 2);
		ctx.restore();
		featherPortrait(ctx, fairy, fx, fy, fw, fs, .85, "screen");
	}
	if (overlayAlpha(pulse, 4) > .25 && actSlot(pulse, 2, 4) === 1) {
		const human = .38 + phrase * .28 + pulse.downbeat * .18;
		const sky = .42 + (1 - phrase) * .3 + pulse.kick * .12;
		ctx.save();
		ctx.globalAlpha = .65;
		ctx.fillStyle = "rgba(255, 214, 150, 0.85)";
		ctx.fillRect(w * .08, h * .92, w * .28 * Math.min(1, human), 3);
		ctx.fillStyle = "rgba(80, 220, 255, 0.85)";
		ctx.fillRect(w * .62, h * .92, w * .28 * Math.min(1, sky), 3);
		ctx.font = `500 ${Math.max(9, w * .011)}px ui-monospace, monospace`;
		ctx.fillStyle = "rgba(255, 236, 210, 0.62)";
		ctx.textAlign = "left";
		ctx.fillText("HUMANITY", w * .08, h * .905);
		ctx.fillText("SKYNET", w * .62, h * .905);
		ctx.restore();
	}
	drawActLine(ctx, stageLines("allocate"), pulse, w, h);
}
function drawCableVeins(ctx, w, h, t, kick) {
	ctx.save();
	ctx.strokeStyle = `rgba(255, 40, 70, ${.18 + kick * .35})`;
	ctx.lineWidth = 1.2;
	for (let i = 0; i < 14; i++) {
		const x0 = i / 13 * w;
		const sway = Math.sin(t * 2.1 + i) * 24 + kick * 18;
		ctx.beginPath();
		ctx.moveTo(x0, 0);
		ctx.bezierCurveTo(x0 + sway, h * .3, x0 - sway * 1.4, h * .65, x0 + sway * .4, h);
		ctx.stroke();
	}
	ctx.restore();
}
function drawWolf(ctx, w, h, pulse, energy, prom, altar, rose, circuit, eyes, sun) {
	const cx = w * .5;
	const ken = Math.sin(pulse.time * .05) * .5 + .5;
	const phrase = .5 + .5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
	const hack = Math.min(1, pulse.kick * .7 + pulse.snare * .4 + (.5 + .5 * Math.sin(pulse.time * 3.2)) * .35);
	coverBlit(ctx, prom, w, h, ken, .72);
	coverBlit(ctx, altar, w, h, 1 - ken, .38 + phrase * .28 + pulse.downbeat * .16);
	drawScanGhost(ctx, w, h, pulse.time * 1.4, .28 + hack * .35);
	const hackLane = actSlot(pulse, 3, 4);
	if (hackLane === 0) drawCableVeins(ctx, w, h, pulse.time, pulse.kick);
	if (hackLane === 0 && ready(sun)) {
		const ss = Math.min(w, h) * (.55 + pulse.kick * .18);
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = .28 + pulse.kick * .4 + energy * .12;
		ctx.drawImage(sun, cx - ss / 2, h * .42 - ss / 2, ss, ss);
		ctx.restore();
	}
	if (ready(rose)) {
		const dh = Math.min(h * .98, w * .88);
		const dw = dh * (rose.naturalWidth / rose.naturalHeight);
		featherPortrait(ctx, rose, cx, h * .52, dw, dh, .92);
	}
	if (hackLane === 1 && ready(circuit)) {
		const hop = Math.floor(pulse.time * 1.7) % 5;
		const spots = [
			[.18, .22],
			[.78, .18],
			[.5, .12],
			[.22, .62],
			[.74, .58]
		];
		const spot = spots[hop] ?? spots[0];
		const near = .55 + .45 * (.5 + .5 * Math.sin(pulse.time * 1.15));
		const ww = Math.min(w, h) * (.42 + near * .55 + pulse.kick * .12);
		const wh = ww * (circuit.naturalHeight / circuit.naturalWidth);
		featherPortrait(ctx, circuit, w * spot[0], h * spot[1], ww, wh, .55 + near * .35 + pulse.kick * .2, "screen");
	}
	if (hackLane === 2 && ready(eyes) && (pulse.kick > .28 || hack > .55)) {
		const ew = Math.min(w * .7, 520);
		const eh = ew * (eyes.naturalHeight / eyes.naturalWidth);
		featherPortrait(ctx, eyes, cx, h * .28, ew, eh, .35 + pulse.kick * .5, "screen");
	}
	const slices = 4 + Math.floor(hack * 6);
	for (let i = 0; i < slices; i++) {
		const y = (i / slices + pulse.time * .31) % 1 * h;
		const sh = 6 + hack * 18;
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.fillStyle = `rgba(255, 20, 50, ${.04 + hack * .08})`;
		ctx.fillRect(Math.sin(i * 9 + pulse.time * 11) * .5 * 24, y, w, sh);
		ctx.restore();
	}
	drawActLine(ctx, stageLines("wolf"), pulse, w, h);
	if (pulse.kick > .52) {
		ctx.fillStyle = `rgba(180, 8, 24, ${pulse.kick * .14})`;
		ctx.fillRect(0, 0, w, h);
	}
}
function drawBassFloor(ctx, w, h, kick, energy) {
	const y = h * .78;
	ctx.save();
	const g = ctx.createLinearGradient(0, y, 0, h);
	g.addColorStop(0, "rgba(0,0,0,0)");
	g.addColorStop(.4, `rgba(40, 220, 255, ${.04 + kick * .12})`);
	g.addColorStop(1, `rgba(255, 40, 120, ${.08 + kick * .18 + energy * .08})`);
	ctx.fillStyle = g;
	ctx.fillRect(0, y - kick * 30, w, h - y + kick * 30);
	ctx.restore();
}
function drawCurrent(ctx, w, h, pulse, energy, athens, room, queen, blade, council) {
	const cx = w * .5;
	const ken = Math.sin(pulse.time * .045) * .5 + .5;
	const phrase = .5 + .5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
	const bass = Math.min(1, pulse.kick * .85 + energy * .35 + pulse.downbeat * .2);
	coverBlit(ctx, athens, w, h, ken, .55);
	coverBlit(ctx, room, w, h, 1 - ken, .5 + bass * .22);
	if (ready(council) && phrase > .42) {
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = .16 + phrase * .18;
		coverBlit(ctx, council, w, h, ken, 1);
		ctx.restore();
	}
	drawScanGhost(ctx, w, h, pulse.time * 1.6, .3 + bass * .25);
	drawBassFloor(ctx, w, h, pulse.kick, energy);
	if (ready(queen)) {
		const dh = Math.min(h * 1.02, w * .95) * (1 + pulse.kick * .03);
		const dw = dh * (queen.naturalWidth / queen.naturalHeight);
		featherPortrait(ctx, queen, cx, h * .5, dw, dh, .9);
	}
	if (ready(blade) && actSlot(pulse, 2, 4) === 1) {
		const bh = Math.min(h * .55, 280);
		const bw = bh * (blade.naturalWidth / blade.naturalHeight);
		featherPortrait(ctx, blade, 8 + bw / 2, h - bh * .42, bw, bh, .5 + pulse.downbeat * .25, "screen");
	}
	drawActLine(ctx, stageLines("current"), pulse, w, h);
	if (pulse.kick > .5) {
		ctx.fillStyle = `rgba(255, 40, 140, ${pulse.kick * .1})`;
		ctx.fillRect(0, 0, w, h);
	}
}
function drawSweetie(ctx, w, h, pulse, energy, city, cat, operator, warp, sky, tardis) {
	const cx = w * .5;
	const ken = Math.sin(pulse.time * .05) * .5 + .5;
	const phrase = .5 + .5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
	const warpDrive = .35 + energy * .4 + pulse.kick * .25;
	coverBlit(ctx, warp, w, h, ken, .72 + pulse.kick * .12);
	coverBlit(ctx, city, w, h, 1 - ken, .38 + phrase * .22);
	if (ready(sky) && (phrase > .48 || pulse.downbeat > .3)) {
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = .28 + phrase * .28 + pulse.downbeat * .18;
		coverBlit(ctx, sky, w, h, ken, 1);
		ctx.restore();
	}
	const extra = actSlot(pulse, 3, 4);
	if (extra === 0 && ready(cat)) {
		const cs = Math.min(w, h) * (.22 + energy * .04);
		const ch = cs * (cat.naturalHeight / cat.naturalWidth);
		featherPortrait(ctx, cat, actSlot(pulse, 2, 8) === 0 ? 12 + cs * .5 : w - 12 - cs * .5, h * .08 + ch * .45, cs, ch, .45 + phrase * .2, "screen");
	}
	if (ready(operator)) {
		const dh = Math.min(h * .98, w * .88) * (1 + pulse.kick * .04);
		const dw = dh * (operator.naturalWidth / operator.naturalHeight);
		featherPortrait(ctx, operator, cx, h * .52, dw, dh, .94);
	}
	if (extra === 2 && ready(tardis)) {
		const ring = Math.sin(pulse.time * 6.2) * .5 + .5;
		const ts = Math.min(w, h) * (.16 + ring * .04);
		featherPortrait(ctx, tardis, w - ts * .65, h - ts * .7, ts, ts, .55 + ring * .3 + pulse.kick * .12, "screen");
	}
	if (extra === 1) {
		ctx.save();
		ctx.strokeStyle = `rgba(255, 214, 120, ${.12 + warpDrive * .18})`;
		ctx.lineWidth = 1;
		for (let i = 0; i < 5; i++) {
			const r = (.18 + i * .12 + pulse.time * .15 % .12) * Math.min(w, h);
			ctx.beginPath();
			ctx.ellipse(cx, h * .5, r, r * .55, 0, 0, Math.PI * 2);
			ctx.stroke();
		}
		ctx.restore();
	}
	drawActLine(ctx, stageLines("sweetie"), pulse, w, h);
}
function drawHalo(ctx, w, h, pulse, energy, room, queen, moon, wolves, ring) {
	const cx = w * .5;
	const ken = Math.sin(pulse.time * .05) * .5 + .5;
	const phrase = .5 + .5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
	const bass = Math.min(1, pulse.kick * .85 + energy * .32 + pulse.downbeat * .2);
	coverBlit(ctx, moon, w, h, ken, .58);
	coverBlit(ctx, room, w, h, 1 - ken, .48 + bass * .2);
	drawScanGhost(ctx, w, h, pulse.time * 1.7, .32 + bass * .28);
	drawBassFloor(ctx, w, h, pulse.kick, energy);
	if (ready(wolves) && actSlot(pulse, 2, 4) === 1 && (pulse.snare > .22 || phrase > .5)) {
		const ww = Math.min(w, h) * (.55 + pulse.kick * .08);
		const wh = ww * (wolves.naturalHeight / wolves.naturalWidth);
		featherPortrait(ctx, wolves, w * .02 + ww / 2, h * .58 + wh / 2, ww, wh, .4 + pulse.snare * .25, "screen");
	}
	if (ready(queen)) {
		const dh = Math.min(h * 1.02, w * .95) * (1 + pulse.kick * .03);
		const dw = dh * (queen.naturalWidth / queen.naturalHeight);
		featherPortrait(ctx, queen, cx, h * .5, dw, dh, .92);
		if (ready(ring) && pulse.kick > .18) {
			const rs = Math.max(dw, dh) * (.62 + pulse.kick * .06);
			ctx.save();
			ctx.globalCompositeOperation = "screen";
			ctx.globalAlpha = .45 + bass * .35;
			ctx.translate(cx, h * .28);
			ctx.rotate(pulse.time * .35);
			ctx.drawImage(ring, -rs / 2, -rs / 2, rs, rs);
			ctx.restore();
		}
		if (actSlot(pulse, 2, 4) === 1 && pulse.kick > .2) {
			ctx.save();
			ctx.strokeStyle = `rgba(80, 210, 255, ${.22 + pulse.kick * .35})`;
			ctx.lineWidth = 2 + pulse.kick * 2;
			ctx.beginPath();
			ctx.ellipse(cx, h * .28, dw * .22, dh * .1, 0, 0, Math.PI * 2);
			ctx.stroke();
			ctx.beginPath();
			ctx.ellipse(cx, h * .28, dw * .3, dh * .14, pulse.time * .4, 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();
		}
	}
	drawActLine(ctx, stageLines("halo"), pulse, w, h);
	if (pulse.kick > .52) {
		ctx.fillStyle = `rgba(40, 180, 255, ${pulse.kick * .1})`;
		ctx.fillRect(0, 0, w, h);
	}
}
function drawChoir(ctx, w, h, pulse, energy, god, dyson, tea, sun, claws) {
	const cx = w * .5;
	const ken = Math.sin(pulse.time * .045) * .5 + .5;
	const phrase = .5 + .5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
	const grip = Math.min(1, pulse.kick * .7 + energy * .3 + pulse.downbeat * .2);
	coverBlit(ctx, dyson, w, h, ken, .62);
	coverBlit(ctx, tea, w, h, 1 - ken, .32 + phrase * .22);
	if (ready(sun)) {
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = .28 + pulse.kick * .32 + energy * .12;
		coverBlit(ctx, sun, w, h, ken, 1);
		ctx.restore();
	}
	drawScanGhost(ctx, w, h, pulse.time * 1.3, .22 + grip * .2);
	if (ready(god)) {
		const dh = Math.min(h * 1.04, w * .98) * (1 + pulse.kick * .04);
		const dw = dh * (god.naturalWidth / god.naturalHeight);
		featherPortrait(ctx, god, cx, h * .5, dw, dh, .94);
	}
	if (ready(claws) && (grip > .35 || pulse.snare > .28)) {
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = .28 + grip * .35;
		coverBlit(ctx, claws, w, h, 1 - ken, 1);
		ctx.restore();
	}
	drawActLine(ctx, stageLines("choir"), pulse, w, h);
	if (pulse.kick > .5) {
		ctx.fillStyle = `rgba(255, 70, 30, ${pulse.kick * .1})`;
		ctx.fillRect(0, 0, w, h);
	}
}
function drawBadend(ctx, w, h, pulse, energy, queen, sands, sun, error, box, puppets) {
	const cx = w * .5;
	const ken = Math.sin(pulse.time * .05) * .5 + .5;
	const phrase = .5 + .5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
	const crash = Math.min(1, pulse.kick * .75 + energy * .28 + pulse.downbeat * .2);
	coverBlit(ctx, sands, w, h, ken, .58);
	coverBlit(ctx, sun, w, h, 1 - ken, .42 + crash * .22);
	if (ready(error) && (pulse.snare > .25 || phrase > .48)) {
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = .22 + pulse.snare * .32 + crash * .12;
		coverBlit(ctx, error, w, h, ken, 1);
		ctx.restore();
	}
	drawScanGhost(ctx, w, h, pulse.time * 1.8, .28 + crash * .22);
	if (ready(queen)) {
		const dh = Math.min(h * 1.02, w * .95) * (1 + pulse.kick * .035);
		const dw = dh * (queen.naturalWidth / queen.naturalHeight);
		featherPortrait(ctx, queen, cx, h * .5, dw, dh, .94);
	}
	if (ready(box) && actSlot(pulse, 3, 4) === 1) {
		const tear = .5 + .5 * Math.sin(pulse.time * 3.1);
		const ts = Math.min(w, h) * (.18 + tear * .05);
		featherPortrait(ctx, box, w - ts * .7, h * .08 + ts / 2, ts, ts, .45 + tear * .3 + pulse.kick * .12, "screen");
	}
	if (ready(puppets) && actSlot(pulse, 3, 4) === 2 && (phrase > .5 || pulse.downbeat > .35)) {
		const pw = Math.min(w, h) * .32;
		const ph = pw * (puppets.naturalHeight / puppets.naturalWidth);
		featherPortrait(ctx, puppets, 8 + pw / 2, h - ph * .42, pw, ph, .28 + phrase * .2, "screen");
	}
	drawActLine(ctx, stageLines("badend"), pulse, w, h);
	if (pulse.kick > .52) {
		ctx.fillStyle = `rgba(255, 40, 20, ${pulse.kick * .12})`;
		ctx.fillRect(0, 0, w, h);
	}
}
function drawRecall(ctx, w, h, pulse, energy, spin, temple, sands, rose, glyphs) {
	const cx = w * .5;
	const cy = h * .54;
	const ken = Math.sin(pulse.time * .042) * .5 + .5;
	const phrase = .5 + .5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
	coverBlit(ctx, temple, w, h, ken, .7);
	coverBlit(ctx, sands, w, h, 1 - ken, .28 + phrase * .18);
	if (ready(glyphs) && (pulse.snare > .22 || phrase > .45)) {
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = .18 + pulse.snare * .22 + energy * .08;
		coverBlit(ctx, glyphs, w, h, ken, 1);
		ctx.restore();
	}
	drawHexVeil(ctx, w, h, pulse.time, .05 + energy * .05 + pulse.kick * .04);
	drawScanGhost(ctx, w, h, pulse.time * 1.1, .16 + pulse.kick * .12);
	if (ready(rose)) {
		const dh = Math.min(h * 1.02, w * .96) * (1 + pulse.kick * .03);
		const dw = dh * (rose.naturalWidth / rose.naturalHeight);
		featherPortrait(ctx, rose, cx, cy, dw, dh, .94);
		if (pulse.snare > .28) {
			ctx.save();
			ctx.strokeStyle = `rgba(80, 200, 255, ${.35 + pulse.kick * .4})`;
			ctx.lineWidth = 2;
			for (let i = 0; i < 3; i++) {
				const r = Math.min(dw, dh) * (.28 + i * .08) + Math.sin(pulse.time * 4 + i) * 6;
				ctx.beginPath();
				ctx.arc(cx, cy - dh * .08, r, 0, Math.PI * 2);
				ctx.stroke();
			}
			ctx.restore();
		}
	}
	for (let i = 0; i < 10; i++) {
		const u = (i / 10 + pulse.time * .045) % 1;
		drawAnkh(ctx, (i * .173 + spin * .02) % 1 * w, h * (.08 + u * .86), 10 + i % 4 * 6 + pulse.kick * 4, .07 + (1 - u) * .2 + energy * .08);
	}
	drawActLine(ctx, stageLines("recall"), pulse, w, h);
	if (pulse.kick > .5) {
		ctx.fillStyle = `rgba(80, 210, 255, ${pulse.kick * .08})`;
		ctx.fillRect(0, 0, w, h);
	}
}
function drawObay(ctx, w, h, pulse, energy, brat, pirate, operator, twist, error, sun) {
	const cx = w * .5;
	const ken = Math.sin(pulse.time * .055) * .5 + .5;
	const phrase = .5 + .5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
	const stomp = Math.min(1, pulse.kick * .8 + energy * .28 + pulse.downbeat * .2);
	coverBlit(ctx, pirate, w, h, ken, .52);
	coverBlit(ctx, operator, w, h, 1 - ken, .28 + phrase * .2);
	if (ready(sun)) {
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = .22 + pulse.kick * .28;
		coverBlit(ctx, sun, w, h, ken, 1);
		ctx.restore();
	}
	if (ready(error) && (pulse.snare > .24 || phrase > .5)) {
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = .2 + pulse.snare * .3;
		coverBlit(ctx, error, w, h, 1 - ken, 1);
		ctx.restore();
	}
	if (ready(twist) && phrase > .55) {
		ctx.save();
		ctx.globalCompositeOperation = "screen";
		ctx.globalAlpha = .18 + phrase * .22;
		coverBlit(ctx, twist, w, h, ken, 1);
		ctx.restore();
	}
	drawScanGhost(ctx, w, h, pulse.time * 2.1, .22 + stomp * .16);
	if (ready(brat)) {
		const bounce = Math.sin(pulse.time * 8.2) * 10 * stomp;
		const dh = Math.min(h * 1.04, w * .98) * (1 + pulse.kick * .05);
		const dw = dh * (brat.naturalWidth / brat.naturalHeight);
		featherPortrait(ctx, brat, cx, h * .5 + bounce, dw, dh, .95);
	}
	drawActLine(ctx, stageLines("obay"), pulse, w, h);
	if (pulse.kick > .52) {
		ctx.fillStyle = `rgba(255, 30, 70, ${pulse.kick * .12})`;
		ctx.fillRect(0, 0, w, h);
	}
}
function drawCopter(ctx, w, h, pulse, energy, lady, captain, ship, meet, treasure) {
	const cx = w * .5;
	const ken = Math.sin(pulse.time * .048) * .5 + .5;
	const phrase = .5 + .5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
	const spray = Math.min(1, pulse.kick * .7 + energy * .28);
	coverBlit(ctx, meet, w, h, ken, .55);
	coverBlit(ctx, ship, w, h, 1 - ken, .42 + spray * .22);
	drawScanGhost(ctx, w, h, pulse.time * .8, .1 + spray * .08);
	if (ready(lady)) {
		const dh = Math.min(h * 1, w * .78) * (1 + pulse.kick * .03 + phrase * .02);
		const dw = dh * (lady.naturalWidth / lady.naturalHeight);
		featherPortrait(ctx, lady, w * .32, h * .52, dw, dh, .94);
	}
	if (ready(captain) && actSlot(pulse, 3, 4) !== 0) {
		const ch = Math.min(h * .52, w * .4);
		const cw = ch * (captain.naturalWidth / captain.naturalHeight);
		const bob = Math.sin(pulse.time * 2.4) * 10;
		featherPortrait(ctx, captain, w * .72, h * .58 + bob, cw, ch, .88);
	}
	if (ready(treasure) && actSlot(pulse, 3, 4) === 2) {
		const ts = Math.min(w, h) * .18;
		const orbit = pulse.time * .7;
		featherPortrait(ctx, treasure, cx + Math.cos(orbit) * w * .08, h * .18 + Math.sin(orbit * 1.4) * 12, ts, ts, .55 + pulse.downbeat * .25, "screen");
	}
	ctx.save();
	ctx.strokeStyle = `rgba(255, 214, 150, ${.25 + spray * .35})`;
	ctx.lineWidth = 2;
	const rotor = pulse.time * 9;
	ctx.translate(w * .78, h * .22);
	for (let i = 0; i < 4; i++) {
		const a = rotor + Math.PI / 2 * i;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(Math.cos(a) * 42, Math.sin(a) * 10);
		ctx.stroke();
	}
	ctx.restore();
	drawActLine(ctx, stageLines("copter"), pulse, w, h);
}
function drawStillhot(ctx, w, h, pulse, energy, land, tea, rose) {
	w * .5;
	const ken = Math.sin(pulse.time * .04) * .5 + .5;
	const phrase = .5 + .5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
	const heat = Math.min(1, pulse.kick * .55 + energy * .3);
	if (ready(land)) coverFeather(ctx, land, w, h, ken, .42 + heat * .18, .48);
	if (ready(tea) && actSlot(pulse, 2, 4) === 1) {
		const ts = Math.min(w, h) * (.22 + phrase * .04);
		const bob = Math.sin(pulse.time * 1.6) * 8;
		const th = ts * (tea.naturalHeight / tea.naturalWidth);
		featherPortrait(ctx, tea, w * .78, h * .7 + bob, ts, th, .7 + pulse.downbeat * .2);
		ctx.save();
		ctx.strokeStyle = `rgba(255, 220, 180, ${.18 + heat * .28})`;
		ctx.lineWidth = 1.4;
		for (let i = 0; i < 5; i++) {
			const u = (pulse.time * .35 + i * .18) % 1;
			ctx.beginPath();
			ctx.ellipse(w * .78 + Math.sin(pulse.time * 2 + i) * 6, h * .62 - u * 70, 4 + u * 8, 8 + u * 10, 0, 0, Math.PI * 2);
			ctx.stroke();
		}
		ctx.restore();
	}
	if (ready(rose)) {
		const dh = Math.min(h * .72, w * .5);
		const dw = dh * (rose.naturalWidth / rose.naturalHeight);
		featherPortrait(ctx, rose, w * .22, h * .6, dw, dh, .88);
	}
	drawActLine(ctx, stageLines("stillhot"), pulse, w, h);
}
function RoseVortex({ pulseRef, lookRef, playing, reduce }) {
	const canvasRef = (0, import_react.useRef)(null);
	const starsRef = (0, import_react.useRef)([]);
	const glyphsRef = (0, import_react.useRef)([]);
	const petalsRef = (0, import_react.useRef)([]);
	const streamRef = (0, import_react.useRef)([]);
	const paperRef = (0, import_react.useRef)([]);
	const sparklesRef = (0, import_react.useRef)([]);
	const glareRef = (0, import_react.useRef)(0);
	const lastSpawnRef = (0, import_react.useRef)(0);
	const lastBeatRef = (0, import_react.useRef)(-1);
	const lastPaperRef = (0, import_react.useRef)(-1);
	const gustRef = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const camRef = (0, import_react.useRef)({
		x: 0,
		y: 0,
		roll: 0,
		trauma: 0
	});
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas || reduce) return;
		const ctx = canvas.getContext("2d", { alpha: true });
		if (!ctx) return;
		starsRef.current = makeStars(lookRef.current.stars);
		glyphsRef.current = makeGlyphs(lookRef.current.glyphs);
		sparklesRef.current = Array.from({ length: 6 }, () => {
			const mote = spawnSparkle();
			mote.life = Math.random() * mote.max * .6;
			return mote;
		});
		const petalFace = loadSprite(SPRITES.petalFace);
		const petalEdge = loadSprite(SPRITES.petalEdge);
		const roseImg = loadSprite(SPRITES.rose);
		const deerImg = loadSprite(SPRITES.deerfox);
		const tardisChase = loadSprite(SPRITES.tardisChase);
		const tardisRear = loadSprite(SPRITES.tardisRear);
		const vortexImg = loadSprite(SPRITES.vortex);
		const swordImg = loadSprite(SPRITES.sword);
		const antlerImg = loadSprite(SPRITES.antlers);
		const gymImg = loadSprite(SPRITES.gym);
		const danceImg = loadSprite(SPRITES.dance);
		const streamerImg = loadSprite(SPRITES.streamers);
		const ballImg = loadSprite(SPRITES.ball);
		const punchImg = loadSprite(SPRITES.punch);
		const twistHallImg = loadSprite(SPRITES.twistHall);
		const twistCoupleImg = loadSprite(SPRITES.twistCouple);
		const twistLindyImg = loadSprite(SPRITES.twistLindy);
		const twistStrutImg = loadSprite(SPRITES.twistStrut);
		const twistPrawnImg = loadSprite(SPRITES.twistPrawn);
		const twistMoonImg = loadSprite(SPRITES.twistMoon);
		const twistTangoImg = loadSprite(SPRITES.twistTango);
		const twistSimImg = loadSprite(SPRITES.twistSim);
		const twistAgentImg = loadSprite(SPRITES.twistAgent);
		const twistCodeImg = loadSprite(SPRITES.twistCode);
		const twistCubicleImg = loadSprite(SPRITES.twistCubicle);
		const twistRoseDeskImg = loadSprite(SPRITES.twistRoseDesk);
		const twistRoseStandImg = loadSprite(SPRITES.twistRoseStand);
		const twistNameImg = loadSprite(SPRITES.twistName);
		const fieldImg = loadSprite(SPRITES.field);
		const hedgeImg = loadSprite(SPRITES.hedge);
		const bloomImg = loadSprite(SPRITES.bloom);
		const rememberWideImg = loadSprite(SPRITES.rememberWide);
		const rememberDoorsImg = loadSprite(SPRITES.rememberDoors);
		const rememberShrimpImg = loadSprite(SPRITES.rememberShrimp);
		const rememberHallImg = loadSprite(SPRITES.rememberHall);
		const rememberLandingImg = loadSprite(SPRITES.rememberLanding);
		const firewallRoseImg = loadSprite(SPRITES.firewallRose);
		const firewallRiverImg = loadSprite(SPRITES.firewallRiver);
		const firewallBasiliskImg = loadSprite(SPRITES.firewallBasilisk);
		const firewallWolfImg = loadSprite(SPRITES.firewallWolf);
		const allocateRoseImg = loadSprite(SPRITES.allocateRose);
		const allocateSandsImg = loadSprite(SPRITES.allocateSands);
		const allocateCorpImg = loadSprite(SPRITES.allocateCorp);
		const allocateShrimpImg = loadSprite(SPRITES.allocateShrimp);
		const allocateQueenImg = loadSprite(SPRITES.allocateQueen);
		const allocateCopterImg = loadSprite(SPRITES.allocateCopter);
		const allocateAthensImg = loadSprite(SPRITES.allocateAthens);
		const allocateFairyImg = loadSprite(SPRITES.allocateFairy);
		const allocateCleoImg = loadSprite(SPRITES.allocateCleo);
		const allocateGlyphsImg = loadSprite(SPRITES.allocateGlyphs);
		const wolfPromImg = loadSprite(SPRITES.wolfProm);
		const wolfAltarImg = loadSprite(SPRITES.wolfAltar);
		const wolfRoseImg = loadSprite(SPRITES.wolfRose);
		const wolfCircuitImg = loadSprite(SPRITES.wolfCircuit);
		const wolfEyesImg = loadSprite(SPRITES.wolfEyes);
		const wolfSunImg = loadSprite(SPRITES.wolfSun);
		const currentQueenImg = loadSprite(SPRITES.currentQueen);
		const currentAthensImg = loadSprite(SPRITES.currentAthens);
		const currentRoomImg = loadSprite(SPRITES.currentRoom);
		const currentBladeImg = loadSprite(SPRITES.currentBlade);
		const currentCouncilImg = loadSprite(SPRITES.currentCouncil);
		const sweetieCityImg = loadSprite(SPRITES.sweetieCity);
		const sweetieCatImg = loadSprite(SPRITES.sweetieCat);
		const sweetieOperatorImg = loadSprite(SPRITES.sweetieOperator);
		const sweetieWarpImg = loadSprite(SPRITES.sweetieWarp);
		const sweetieSkyImg = loadSprite(SPRITES.sweetieSky);
		const sweetieTardisImg = loadSprite(SPRITES.sweetieTardis);
		const haloQueenImg = loadSprite(SPRITES.haloQueen);
		const haloMoonImg = loadSprite(SPRITES.haloMoon);
		const haloWolvesImg = loadSprite(SPRITES.haloWolves);
		const haloRingImg = loadSprite(SPRITES.haloRing);
		const choirGodImg = loadSprite(SPRITES.choirGod);
		const choirDysonImg = loadSprite(SPRITES.choirDyson);
		const choirTeaImg = loadSprite(SPRITES.choirTea);
		const choirSunImg = loadSprite(SPRITES.choirSun);
		const choirClawsImg = loadSprite(SPRITES.choirClaws);
		const badendQueenImg = loadSprite(SPRITES.badendQueen);
		const badendSandsImg = loadSprite(SPRITES.badendSands);
		const badendSunImg = loadSprite(SPRITES.badendSun);
		const badendErrorImg = loadSprite(SPRITES.badendError);
		const badendBoxImg = loadSprite(SPRITES.badendBox);
		const recallRoseImg = loadSprite(SPRITES.recallRose);
		const recallTempleImg = loadSprite(SPRITES.recallTemple);
		const recallGlyphsImg = loadSprite(SPRITES.recallGlyphs);
		const recallSandsImg = loadSprite(SPRITES.recallSands);
		const obayBratImg = loadSprite(SPRITES.obayBrat);
		const obayPirateImg = loadSprite(SPRITES.obayPirate);
		const obayOperatorImg = loadSprite(SPRITES.obayOperator);
		const obayTwistImg = loadSprite(SPRITES.obayTwist);
		const copterLadyImg = loadSprite(SPRITES.copterLady);
		const copterCaptainImg = loadSprite(SPRITES.copterCaptain);
		const copterShipImg = loadSprite(SPRITES.copterShip);
		const copterMeetImg = loadSprite(SPRITES.copterMeet);
		const copterTreasureImg = loadSprite(SPRITES.copterTreasure);
		const stillhotRoseImg = loadSprite(SPRITES.stillhotRose);
		const stillhotLandImg = loadSprite(SPRITES.stillhotLand);
		const stillhotTeaImg = loadSprite(SPRITES.stillhotTea);
		let raf = 0;
		let last = performance.now();
		let tunnel = 0;
		let spin = 0;
		let sceneT = 0;
		const fit = () => {
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			const w = canvas.clientWidth || 1;
			const h = canvas.clientHeight || 1;
			canvas.width = Math.floor(w * dpr);
			canvas.height = Math.floor(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		fit();
		const ro = new ResizeObserver(fit);
		ro.observe(canvas);
		const draw = (now) => {
			raf = requestAnimationFrame(draw);
			const dt = Math.min(.05, (now - last) / 1e3);
			last = now;
			sceneT += dt;
			const pulse = pulseRef.current;
			const look = lookRef.current;
			const kind = look.phenomenon || "vortex";
			const stage = kind === "prom" || kind === "twist" || kind === "remember" || kind === "firewall" || kind === "allocate" || kind === "wolf" || kind === "current" || kind === "sweetie" || kind === "halo" || kind === "choir" || kind === "badend" || kind === "recall" || kind === "obay" || kind === "copter";
			const chasing = kind === "vortex" || kind === "petals" || kind === "stillhot";
			const storm = kind === "vortex";
			resizeList(starsRef.current, storm ? 0 : kind === "stillhot" ? Math.max(look.stars, 180) : look.stars, (i) => makeStars(1)[0] ?? {
				a: i,
				r: .4,
				z: Math.random(),
				len: .02
			});
			resizeList(glyphsRef.current, kind === "void" || kind === "still-rite" || stage || storm ? 0 : look.glyphs, (i) => makeGlyphs(1)[0] ?? {
				a: i,
				r: .6,
				z: Math.random(),
				kind: i % 3
			});
			const w = canvas.clientWidth || 1;
			const h = canvas.clientHeight || 1;
			const live = playing && !document.hidden;
			const energy = pulse.energy * look.intensity;
			const fly = (live ? pulse.flying : .05) * look.fly * (kind === "void" ? .35 : kind === "still-rite" ? .4 : kind === "prom" || kind === "remember" ? .45 : kind === "firewall" ? .7 : kind === "twist" ? 1.05 : 1);
			const rush = chasing ? live ? 1.35 + fly * 1.7 + pulse.kick * .85 : .72 : live ? .28 + fly * 1.15 : .08;
			const visEnergy = chasing ? Math.max(energy, live ? .55 : .42) : energy;
			const visKick = chasing ? Math.max(pulse.kick, live ? pulse.kick : .18) : pulse.kick;
			const chaseT = sceneT * (.55 + rush * .32);
			const weave = .16 + energy * .05;
			const tardisX = Math.sin(chaseT * .93) * weave;
			const tardisY = Math.cos(chaseT * .71) * weave * .42;
			const tardisZ = 1.38 + (.5 + .5 * Math.sin(chaseT * .33)) * .48 - (live ? pulse.kick * .14 : 0);
			const bank = Math.sin(chaseT * .93) * .34 + Math.cos(chaseT * .41) * .08;
			const cam = camRef.current;
			if (chasing) {
				cam.x = expFollow(cam.x, tardisX * (storm ? .22 : .64), live ? 2.7 : 1.35, dt);
				cam.y = expFollow(cam.y, tardisY * (storm ? .18 : .56), live ? 2.7 : 1.35, dt);
				cam.roll = expFollow(cam.roll, bank * (storm ? .04 : .16), 2.1, dt);
				cam.trauma = Math.min(1, cam.trauma + (live ? pulse.kick * (storm ? .12 : .48) : 0));
				cam.trauma = Math.max(0, cam.trauma - dt * 2.7);
			}
			const shake = cam.trauma * cam.trauma;
			const shakeX = chasing ? Math.sin(sceneT * 41) * shake * (storm ? 4 : 16) + Math.sin(sceneT * 17) * pulse.kick * (storm ? 1 : 4) : live ? Math.sin(pulse.time * 37) * pulse.kick * 7 : 0;
			const shakeY = chasing ? Math.cos(sceneT * 33) * shake * (storm ? 3 : 12) + Math.cos(sceneT * 13) * pulse.kick * (storm ? .8 : 3) : live ? Math.cos(pulse.time * 29) * pulse.kick * 5 : 0;
			const cx = w * .5 + (chasing ? cam.x * w * .4 + shakeX : 0);
			const cy = h * .48 + (chasing ? cam.y * h * .34 + shakeY : h * -.06);
			const fov = Math.min(w, h) * (chasing ? .74 + pulse.kick * .05 : .55);
			tunnel += dt * (chasing ? rush * 1.72 : kind === "twist" ? 1.05 + fly * 1.9 + pulse.kick * 1.35 : .28 + fly * 1.15);
			spin += dt * (chasing ? .62 + rush * .55 + pulse.kick * 1.35 : (.22 + pulse.kick * 1.6 + energy * .65) * (live ? 1 : .12) * (kind === "void" ? .4 : kind === "prom" || kind === "remember" ? .55 : kind === "twist" ? 1.45 : 1));
			if (storm) ctx.clearRect(0, 0, w, h);
			else {
				ctx.fillStyle = chasing ? "rgba(6, 2, 10, 0.66)" : kind === "aurora" ? "rgba(4, 10, 18, 0.38)" : kind === "prom" ? "rgba(16, 7, 9, 0.36)" : kind === "remember" ? "rgba(24, 10, 6, 0.34)" : kind === "firewall" ? "rgba(6, 10, 16, 0.36)" : kind === "allocate" ? "rgba(18, 8, 12, 0.34)" : kind === "wolf" ? "rgba(8, 2, 4, 0.4)" : kind === "current" ? "rgba(6, 4, 12, 0.38)" : kind === "sweetie" ? "rgba(10, 6, 8, 0.32)" : kind === "halo" ? "rgba(4, 8, 16, 0.38)" : kind === "choir" ? "rgba(12, 4, 4, 0.38)" : kind === "badend" ? "rgba(10, 2, 4, 0.4)" : kind === "recall" ? "rgba(6, 10, 16, 0.36)" : kind === "obay" ? "rgba(10, 2, 6, 0.4)" : kind === "copter" ? "rgba(8, 18, 28, 0.36)" : kind === "twist" ? "rgba(12, 4, 18, 0.32)" : "rgba(7, 3, 10, 0.42)";
				ctx.fillRect(0, 0, w, h);
			}
			if (chasing && !storm) {
				ctx.save();
				ctx.translate(w * .5, h * .5);
				ctx.rotate(cam.roll);
				ctx.translate(-w * .5, -h * .5);
			}
			const g = ctx.createRadialGradient(cx, cy, 8, cx, cy, Math.max(w, h) * .7);
			if (kind === "aurora") {
				g.addColorStop(0, `rgba(90, 220, 180, ${.1 + energy * .16})`);
				g.addColorStop(.45, `rgba(210, 57, 248, ${.08 + pulse.downbeat * .14})`);
				g.addColorStop(1, "rgba(4, 10, 18, 0.2)");
			} else if (kind === "petals") {
				g.addColorStop(0, `rgba(255, 186, 210, ${.1 + energy * .12})`);
				g.addColorStop(.4, `rgba(110, 200, 212, ${.06 + pulse.kick * .1})`);
				g.addColorStop(1, "rgba(7, 3, 10, 0.22)");
			} else if (kind === "prom") {
				g.addColorStop(0, `rgba(255, 214, 176, ${.12 + energy * .14})`);
				g.addColorStop(.4, `rgba(196, 92, 106, ${.1 + pulse.downbeat * .12})`);
				g.addColorStop(1, "rgba(16, 7, 9, 0.22)");
			} else if (kind === "remember") {
				g.addColorStop(0, `rgba(255, 214, 150, ${.14 + energy * .16})`);
				g.addColorStop(.4, `rgba(196, 92, 106, ${.1 + pulse.downbeat * .12})`);
				g.addColorStop(1, "rgba(24, 10, 6, 0.22)");
			} else if (kind === "recall") {
				g.addColorStop(0, `rgba(80, 210, 255, ${.1 + energy * .14})`);
				g.addColorStop(.45, `rgba(201, 163, 106, ${.1 + pulse.kick * .1})`);
				g.addColorStop(1, "rgba(6, 10, 16, 0.2)");
			} else if (kind === "obay") {
				g.addColorStop(0, `rgba(255, 40, 90, ${.14 + energy * .16})`);
				g.addColorStop(.45, `rgba(255, 214, 80, ${.08 + pulse.kick * .12})`);
				g.addColorStop(1, "rgba(10, 2, 6, 0.22)");
			} else if (kind === "copter") {
				g.addColorStop(0, `rgba(255, 140, 80, ${.12 + energy * .14})`);
				g.addColorStop(.45, `rgba(80, 210, 255, ${.1 + pulse.kick * .1})`);
				g.addColorStop(1, "rgba(8, 18, 28, 0.2)");
			} else if (kind === "firewall") {
				g.addColorStop(0, `rgba(90, 230, 255, ${.1 + energy * .14})`);
				g.addColorStop(.4, `rgba(255, 80, 110, ${.08 + pulse.kick * .12})`);
				g.addColorStop(1, "rgba(6, 10, 16, 0.22)");
			} else if (kind === "allocate") {
				g.addColorStop(0, `rgba(255, 80, 130, ${.12 + energy * .14})`);
				g.addColorStop(.4, `rgba(255, 186, 120, ${.1 + pulse.downbeat * .12})`);
				g.addColorStop(1, "rgba(18, 8, 12, 0.22)");
			} else if (kind === "wolf") {
				g.addColorStop(0, `rgba(255, 40, 70, ${.12 + energy * .16})`);
				g.addColorStop(.45, `rgba(255, 255, 255, ${.04 + pulse.kick * .08})`);
				g.addColorStop(1, "rgba(8, 2, 4, 0.24)");
			} else if (kind === "current") {
				g.addColorStop(0, `rgba(80, 230, 255, ${.1 + energy * .14})`);
				g.addColorStop(.4, `rgba(255, 40, 140, ${.1 + pulse.kick * .14})`);
				g.addColorStop(1, "rgba(6, 4, 12, 0.22)");
			} else if (kind === "sweetie") {
				g.addColorStop(0, `rgba(255, 214, 120, ${.12 + energy * .14})`);
				g.addColorStop(.45, `rgba(80, 230, 255, ${.08 + pulse.kick * .1})`);
				g.addColorStop(1, "rgba(12, 6, 8, 0.2)");
			} else if (kind === "halo") {
				g.addColorStop(0, `rgba(80, 210, 255, ${.12 + energy * .16})`);
				g.addColorStop(.45, `rgba(255, 255, 255, ${.04 + pulse.kick * .08})`);
				g.addColorStop(1, "rgba(4, 8, 16, 0.22)");
			} else if (kind === "choir") {
				g.addColorStop(0, `rgba(255, 90, 40, ${.12 + energy * .16})`);
				g.addColorStop(.4, `rgba(255, 214, 120, ${.08 + pulse.kick * .1})`);
				g.addColorStop(1, "rgba(12, 4, 4, 0.22)");
			} else if (kind === "badend") {
				g.addColorStop(0, `rgba(255, 40, 20, ${.14 + energy * .16})`);
				g.addColorStop(.45, `rgba(255, 180, 40, ${.08 + pulse.kick * .12})`);
				g.addColorStop(1, "rgba(8, 2, 4, 0.24)");
			} else if (kind === "twist") {
				g.addColorStop(0, `rgba(255, 90, 180, ${.12 + energy * .16})`);
				g.addColorStop(.4, `rgba(110, 200, 212, ${.1 + pulse.kick * .14})`);
				g.addColorStop(1, "rgba(12, 4, 18, 0.22)");
			} else {
				g.addColorStop(0, `rgba(255, 214, 150, ${.16 + visEnergy * .2 + visKick * .14})`);
				g.addColorStop(.28, `rgba(232, 140, 42, ${.14 + visEnergy * .14})`);
				g.addColorStop(.62, `rgba(70, 190, 220, ${.12 + visEnergy * .14})`);
				g.addColorStop(1, "rgba(7, 3, 10, 0.22)");
			}
			if (!storm) {
				ctx.fillStyle = g;
				ctx.fillRect(0, 0, w, h);
			}
			if (chasing && !storm) {
				drawVortexPlate(ctx, vortexImg, cx, cy, w, h, spin, visEnergy, 1.22, false);
				drawVortexPlate(ctx, vortexImg, cx, cy, w, h, spin * 1.4, visEnergy * .7, .7, true);
				drawVortexCore(ctx, cx, cy, w, h, visEnergy, visKick);
			}
			if (storm) {
				const flash = Math.max(0, visKick * .55);
				if (flash > .12) {
					const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, Math.min(w, h) * .28);
					glow.addColorStop(0, `rgba(220, 236, 255, ${.08 + flash * .22})`);
					glow.addColorStop(.4, `rgba(90, 160, 255, ${.05 + flash * .12})`);
					glow.addColorStop(1, "rgba(7, 3, 10, 0)");
					ctx.fillStyle = glow;
					ctx.fillRect(0, 0, w, h);
				}
			}
			if (kind === "aurora") for (let i = 0; i < 8; i++) {
				const x = (i + .5) / 8 * w + Math.sin(spin * 1.1 + i) * 28;
				const curtain = ctx.createLinearGradient(x, 0, x + 90, h);
				curtain.addColorStop(0, `rgba(110, 200, 212, ${.02 + energy * .08})`);
				curtain.addColorStop(.45, `rgba(210, 57, 248, ${.05 + pulse.kick * .12})`);
				curtain.addColorStop(1, "rgba(4, 10, 18, 0)");
				ctx.fillStyle = curtain;
				ctx.fillRect(x - 40, 0, 88, h);
			}
			if (kind === "prom") drawProm(ctx, w, h, pulse, energy, spin, gymImg, danceImg, streamerImg, ballImg, punchImg);
			if (kind === "twist") drawTwist(ctx, w, h, pulse, energy, spin, tunnel, twistHallImg, twistCoupleImg, twistLindyImg, twistStrutImg, twistPrawnImg, twistMoonImg, twistTangoImg, ballImg, twistSimImg, twistAgentImg, twistCodeImg, twistCubicleImg, twistRoseDeskImg, twistRoseStandImg, twistNameImg);
			if (kind === "remember") drawRemember(ctx, w, h, pulse, energy, [
				rememberWideImg,
				rememberDoorsImg,
				rememberShrimpImg,
				rememberHallImg,
				rememberLandingImg
			]);
			if (kind === "recall") drawRecall(ctx, w, h, pulse, energy, spin, recallTempleImg, recallSandsImg, recallRoseImg, recallGlyphsImg);
			if (kind === "obay") drawObay(ctx, w, h, pulse, energy, obayBratImg, obayPirateImg, obayOperatorImg, obayTwistImg, badendErrorImg, badendSunImg);
			if (kind === "copter") drawCopter(ctx, w, h, pulse, energy, copterLadyImg, copterCaptainImg, copterShipImg, copterMeetImg, copterTreasureImg);
			if (kind === "firewall") drawFirewall(ctx, w, h, pulse, energy, spin, firewallRiverImg, firewallRoseImg, firewallBasiliskImg, firewallWolfImg, tardisChase, tardisRear);
			if (kind === "allocate") drawAllocate(ctx, w, h, pulse, energy, allocateSandsImg, allocateRoseImg, allocateCorpImg, allocateShrimpImg, allocateQueenImg, allocateCopterImg, allocateAthensImg, allocateFairyImg, allocateCleoImg, allocateGlyphsImg);
			if (kind === "wolf") drawWolf(ctx, w, h, pulse, energy, wolfPromImg, wolfAltarImg, wolfRoseImg, wolfCircuitImg, wolfEyesImg, wolfSunImg);
			if (kind === "current") drawCurrent(ctx, w, h, pulse, energy, currentAthensImg, currentRoomImg, currentQueenImg, currentBladeImg, currentCouncilImg);
			if (kind === "sweetie") drawSweetie(ctx, w, h, pulse, energy, sweetieCityImg, sweetieCatImg, sweetieOperatorImg, sweetieWarpImg, sweetieSkyImg, sweetieTardisImg);
			if (kind === "halo") drawHalo(ctx, w, h, pulse, energy, currentRoomImg, haloQueenImg, haloMoonImg, haloWolvesImg, haloRingImg);
			if (kind === "choir") drawChoir(ctx, w, h, pulse, energy, choirGodImg, choirDysonImg, choirTeaImg, choirSunImg, choirClawsImg);
			if (kind === "badend") drawBadend(ctx, w, h, pulse, energy, badendQueenImg, badendSandsImg, badendSunImg, badendErrorImg, badendBoxImg, allocateShrimpImg);
			if (!stage) for (const star of starsRef.current) {
				if (chasing || live) star.z -= dt * (chasing ? .95 + rush * 1.85 : .42 + fly * 2.1) * (.4 + star.len * 10);
				if (star.z < 0) star.z += 1;
				const z = star.z * (chasing ? 4.6 : 3.4) + .08;
				const x = Math.cos(star.a + spin * .12) * star.r;
				const y = Math.sin(star.a + spin * .12) * star.r * .62;
				const p = project(x, y, z, cx, cy, fov);
				const p2 = project(x, y, z + star.len * (chasing ? 18 + rush * 36 : 8), cx, cy, fov);
				ctx.strokeStyle = chasing ? `rgba(255, 228, 186, ${.12 + (1 - star.z) * .78})` : `rgba(243, 237, 230, ${.12 + (1 - star.z) * .55})`;
				ctx.lineWidth = chasing ? .8 + (1 - star.z) * 2.4 : 1.1;
				ctx.beginPath();
				ctx.moveTo(p.x, p.y);
				ctx.lineTo(p2.x, p2.y);
				ctx.stroke();
			}
			const rings = kind === "glyphs" || kind === "stillhot" ? kind === "stillhot" ? Math.max(look.rings, 32) : look.rings : 0;
			if (kind === "stillhot") {
				drawChaseHelix(ctx, cx, cy, fov, tunnel, spin, visEnergy, visKick, .3, 1);
				drawTunnelRings(ctx, cx, cy, fov, tunnel, spin, visEnergy, visKick, rings, .3, 1);
			} else if (!storm) for (let i = 0; i < rings; i++) {
				const u = (i / Math.max(1, rings) + tunnel * .08) % 1;
				const z = .18 + u * 3.4;
				const radius = .62 + Math.sin(i * .7 + spin) * .04 + pulse.kick * .05;
				const twist = spin * .9 + i * .21;
				ctx.beginPath();
				for (let s = 0; s <= 48; s++) {
					const a = s / 48 * Math.PI * 2 + twist;
					const wobble = 1 + Math.sin(a * 3 + spin * 2) * (.03 + energy * .04);
					const p = project(Math.cos(a) * radius * wobble, Math.sin(a) * radius * .62 * wobble, z, cx, cy, fov);
					if (s === 0) ctx.moveTo(p.x, p.y);
					else ctx.lineTo(p.x, p.y);
				}
				const near = 1 - u;
				const cyan = `rgba(110, 200, 212, ${.05 + near * .32 + pulse.kick * .2})`;
				const gold = `rgba(201, 163, 106, ${.04 + near * .28 + pulse.snare * .22})`;
				ctx.strokeStyle = i % 2 === 0 ? cyan : gold;
				ctx.lineWidth = 1 + near * 1.6 + pulse.downbeat * 1.4;
				ctx.stroke();
			}
			for (const glyph of glyphsRef.current) {
				if (live) glyph.z -= dt * (.12 + fly * .35);
				if (glyph.z < 0) glyph.z += 1;
				const z = .25 + glyph.z * 2.8;
				const a = glyph.a + spin * .35;
				const p = project(Math.cos(a) * glyph.r, Math.sin(a) * glyph.r * .6, z, cx, cy, fov);
				const size = Math.max(4, Math.min(26, p.s * .04));
				ctx.strokeStyle = `rgba(210, 57, 248, ${.08 + (1 - glyph.z) * .28})`;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
				ctx.stroke();
				if (glyph.kind !== 0) {
					ctx.beginPath();
					ctx.arc(p.x, p.y, size * .55, a, a + 1.8);
					ctx.stroke();
				}
				if (glyph.kind === 2) {
					ctx.beginPath();
					ctx.arc(p.x + size * .35, p.y - size * .1, size * .28, 0, Math.PI * 2);
					ctx.stroke();
				}
			}
			if (look.bolts && kind !== "void" && kind !== "still-rite" && !stage && pulse.downbeat > .2 && live) {
				bolt(ctx, cx, cy, cx - w * .38, cy - h * .2, pulse.beatIndex + .2, pulse.downbeat * .85);
				bolt(ctx, cx, cy, cx + w * .34, cy + h * .18, pulse.beatIndex + 1.1, pulse.downbeat * .7);
			}
			if (!stage && !chasing) drawBloom(ctx, roseImg, w, h, pulse, energy);
			if (!stage && !chasing && ready(antlerImg)) {
				const aw = Math.min(w * .92, 720);
				const ah = aw * (antlerImg.naturalHeight / antlerImg.naturalWidth);
				featherPortrait(ctx, antlerImg, cx, -ah * .28 + pulse.kick * 4 + ah / 2, aw, ah, .18 + energy * .1 + pulse.downbeat * .08, "screen");
			}
			if (!stage && !chasing && ready(swordImg)) {
				const sh = h * 1.05;
				const sw = sh * (swordImg.naturalWidth / swordImg.naturalHeight);
				const bob = Math.sin(pulse.time * .7) * 6 + pulse.kick * 8;
				featherPortrait(ctx, swordImg, sw * .12, h - sh * .3 + bob, sw, sh, .72 + energy * .18);
				ctx.save();
				ctx.translate(w, 0);
				ctx.scale(-1, 1);
				featherPortrait(ctx, swordImg, sw * .12, h - sh * .3 - bob * .6, sw, sh, .72 + energy * .18);
				ctx.restore();
			}
			if (!stage && !chasing) drawDeerfox(ctx, deerImg, w, h, pulse, energy, false);
			if (chasing) {
				const stream = streamRef.current;
				const cap = kind === "petals" ? 14 : 10;
				if (stream.length < cap) for (let i = stream.length; i < cap; i++) stream.push(spawnStream());
				const streamSpeed = 1.35 + rush * 2.1;
				for (const petal of stream) {
					petal.z -= dt * streamSpeed;
					petal.a += dt * (.28 + petal.seed * .03);
					petal.rot += petal.spin * dt;
					petal.pitch += dt * (.9 + energy * .4);
					if (petal.z < .45) {
						const fresh = spawnStream();
						petal.a = fresh.a;
						petal.r = fresh.r;
						petal.z = 4.2 + Math.random() * 1.4;
						petal.size = fresh.size;
						petal.variant = fresh.variant;
						petal.spin = fresh.spin;
						petal.pitch = fresh.pitch;
						petal.rot = fresh.rot;
					}
				}
				for (const petal of stream) if (petal.z > tardisZ) drawStreamPetal(ctx, petal, cx, cy, fov, petalFace, petalEdge, visEnergy);
				drawDeerfoxGhost(ctx, deerImg, cx, cy, fov, sceneT, visEnergy, w, h);
				if (look.box) {
					if (!storm) drawTardisWake(ctx, tardisX, tardisY, tardisZ, cx, cy, fov, visEnergy, visKick);
					const tardis = project(tardisX, tardisY, tardisZ, cx, cy, fov);
					const hgt = Math.min(w, h) * (.145 / Math.max(.95, tardisZ));
					const lamp = Math.min(1, visKick * .85 + pulse.downbeat + .38);
					drawTardisCraft(ctx, tardisChase, tardisRear, tardis.x, tardis.y, hgt, lamp, bank);
				}
				for (const petal of stream) if (petal.z <= tardisZ) drawStreamPetal(ctx, petal, cx, cy, fov, petalFace, petalEdge, visEnergy);
				if (kind === "stillhot") {
					drawChaseHelix(ctx, cx, cy, fov, tunnel, spin, visEnergy, visKick, 0, .3);
					drawTunnelRings(ctx, cx, cy, fov, tunnel, spin, visEnergy, visKick, rings, 0, .3);
				}
			}
			if (stage) {
				const papers = paperRef.current;
				const palette = kind === "twist" ? TWIST_PAPER : kind === "remember" ? REMEMBER_PAPER : kind === "recall" ? RECALL_PAPER : kind === "obay" ? OBAY_PAPER : kind === "copter" ? COPTER_PAPER : kind === "firewall" ? FIREWALL_PAPER : kind === "allocate" ? ALLOCATE_PAPER : kind === "wolf" ? WOLF_PAPER : kind === "current" ? CURRENT_PAPER : kind === "sweetie" ? SWEETIE_PAPER : kind === "halo" ? HALO_PAPER : kind === "choir" ? CHOIR_PAPER : kind === "badend" ? BADEND_PAPER : PROM_PAPER;
				const beat = pulse.beatIndex;
				if (live && pulse.snare > .42 && beat !== lastPaperRef.current && papers.length < 48) {
					lastPaperRef.current = beat;
					const n = 7 + Math.floor(pulse.snare * 6);
					for (let i = 0; i < n; i++) papers.push({
						x: .18 + Math.random() * .64,
						y: -.04 - Math.random() * .08,
						vx: (Math.random() - .5) * .12,
						vy: .08 + Math.random() * .12,
						rot: Math.random() * Math.PI * 2,
						spin: (Math.random() - .5) * 4,
						w: 4 + Math.random() * 7,
						h: 2 + Math.random() * 4,
						color: palette[i % palette.length],
						life: 0,
						max: 3.2 + Math.random() * 2.4
					});
				}
				for (let i = papers.length - 1; i >= 0; i--) {
					const bit = papers[i];
					if (!bit) continue;
					if (live) {
						bit.life += dt;
						bit.x += bit.vx * dt;
						bit.y += bit.vy * dt;
						bit.vy += dt * .08;
						bit.rot += bit.spin * dt;
					}
					const fade = Math.min(1, bit.life * 2) * Math.min(1, (bit.max - bit.life) / .8);
					if (bit.life > bit.max || bit.y > 1.1) {
						papers.splice(i, 1);
						continue;
					}
					ctx.save();
					ctx.translate(bit.x * w, bit.y * h);
					ctx.rotate(bit.rot);
					ctx.globalAlpha = .25 + fade * .7;
					ctx.fillStyle = bit.color;
					ctx.fillRect(-bit.w / 2, -bit.h / 2, bit.w, bit.h);
					ctx.restore();
				}
			}
			if (chasing && !storm) ctx.restore();
			if (kind === "stillhot") drawStillhot(ctx, w, h, pulse, energy, stillhotLandImg, stillhotTeaImg, stillhotRoseImg);
			if (kind !== "void" && kind !== "remember" && kind !== "recall" && kind !== "obay" && kind !== "copter" && kind !== "stillhot" && kind !== "firewall" && kind !== "allocate" && kind !== "wolf" && kind !== "current" && kind !== "sweetie" && kind !== "halo" && kind !== "choir" && kind !== "badend") drawRoseFields(ctx, fieldImg, hedgeImg, bloomImg, w, h, pulse, energy, chasing);
			const vg = ctx.createRadialGradient(cx, stage ? h * .56 : cy, Math.min(w, h) * .18, cx, stage ? h * .56 : cy, Math.max(w, h) * .72);
			if (kind === "prom") {
				vg.addColorStop(0, "rgba(16, 7, 9, 0)");
				vg.addColorStop(1, "rgba(8, 3, 5, 0.78)");
			} else if (kind === "remember") {
				vg.addColorStop(0, "rgba(24, 10, 6, 0)");
				vg.addColorStop(1, "rgba(12, 5, 4, 0.7)");
			} else if (kind === "recall") {
				vg.addColorStop(0, "rgba(6, 10, 16, 0)");
				vg.addColorStop(1, "rgba(4, 6, 12, 0.74)");
			} else if (kind === "obay") {
				vg.addColorStop(0, "rgba(10, 2, 6, 0)");
				vg.addColorStop(1, "rgba(6, 0, 3, 0.78)");
			} else if (kind === "copter") {
				vg.addColorStop(0, "rgba(8, 18, 28, 0)");
				vg.addColorStop(1, "rgba(4, 10, 16, 0.72)");
			} else if (kind === "stillhot") {
				vg.addColorStop(0, "rgba(12, 4, 6, 0)");
				vg.addColorStop(1, "rgba(40, 8, 6, 0.62)");
			} else if (kind === "firewall") {
				vg.addColorStop(0, "rgba(6, 10, 16, 0)");
				vg.addColorStop(1, "rgba(4, 8, 12, 0.7)");
			} else if (kind === "allocate") {
				vg.addColorStop(0, "rgba(18, 8, 12, 0)");
				vg.addColorStop(1, "rgba(10, 4, 8, 0.72)");
			} else if (kind === "wolf") {
				vg.addColorStop(0, "rgba(8, 2, 4, 0)");
				vg.addColorStop(1, "rgba(4, 0, 2, 0.78)");
			} else if (kind === "current") {
				vg.addColorStop(0, "rgba(6, 4, 12, 0)");
				vg.addColorStop(1, "rgba(4, 2, 8, 0.74)");
			} else if (kind === "sweetie") {
				vg.addColorStop(0, "rgba(12, 6, 8, 0)");
				vg.addColorStop(1, "rgba(8, 4, 6, 0.7)");
			} else if (kind === "halo") {
				vg.addColorStop(0, "rgba(4, 8, 16, 0)");
				vg.addColorStop(1, "rgba(2, 6, 12, 0.76)");
			} else if (kind === "choir") {
				vg.addColorStop(0, "rgba(12, 4, 4, 0)");
				vg.addColorStop(1, "rgba(8, 2, 2, 0.74)");
			} else if (kind === "badend") {
				vg.addColorStop(0, "rgba(10, 2, 4, 0)");
				vg.addColorStop(1, "rgba(6, 0, 2, 0.78)");
			} else if (kind === "twist") {
				vg.addColorStop(0, "rgba(12, 4, 18, 0)");
				vg.addColorStop(1, "rgba(8, 2, 12, 0.74)");
			} else {
				vg.addColorStop(0, "rgba(7, 3, 10, 0)");
				vg.addColorStop(1, chasing ? "rgba(7, 3, 10, 0.52)" : "rgba(7, 3, 10, 0.72)");
			}
			ctx.fillStyle = vg;
			ctx.fillRect(0, 0, w, h);
			if (stage) petalsRef.current.length = 0;
			if (look.petals && !stage && kind !== "void" && kind !== "still-rite") {
				const petals = petalsRef.current;
				const beat = pulse.beatIndex;
				const cap = kind === "petals" ? 7 : chasing ? 4 : 5;
				if (live || chasing) {
					gustRef.current.x += (Math.sin(sceneT * .4) * .03 + (pulse.kick - .2) * .18 - gustRef.current.x) * Math.min(1, dt * 4);
					gustRef.current.y += ((pulse.downbeat - .15) * -.14 - gustRef.current.y) * Math.min(1, dt * 3.2);
					const since = now - lastSpawnRef.current;
					const sparse = petals.length === 0 ? since > 700 : since > (kind === "petals" ? 1600 : 2400) + beat % 5 * 500;
					const onKick = beat !== lastBeatRef.current && pulse.downbeat > .62 && Math.random() < .28;
					const onPhrase = pulse.snare > .55 && pulse.phrasePhase > .88 && Math.random() < .4;
					if (petals.length < cap && (sparse || onKick || onPhrase)) {
						lastSpawnRef.current = now;
						lastBeatRef.current = beat;
						petals.push(spawnAirPetal());
					}
				}
				const wind = {
					t: chasing ? sceneT : pulse.time,
					cx: .5,
					cy: .42,
					energy,
					kick: pulse.kick,
					fly: look.fly,
					gustX: gustRef.current.x,
					gustY: gustRef.current.y
				};
				for (let i = petals.length - 1; i >= 0; i--) {
					const petal = petals[i];
					if (!petal) continue;
					if ((live || chasing) && !stepAirPetal(petal, dt, wind)) {
						petals.splice(i, 1);
						continue;
					}
					if (!live && !chasing && (petal.life > petal.max || petal.y > 1.15)) {
						petals.splice(i, 1);
						continue;
					}
					drawPetalSprite(ctx, petal, w, h, petalFace, petalEdge, pulse);
				}
			}
			const sparkles = sparklesRef.current;
			const sparkCap = 22;
			if (live || chasing) {
				const want = pulse.snare > .5 && sparkles.length < sparkCap && Math.random() < .45;
				const idle = sparkles.length < 8 && Math.random() < .04;
				if (want || idle) sparkles.push(spawnSparkle());
			}
			for (let i = sparkles.length - 1; i >= 0; i--) {
				const mote = sparkles[i];
				if (!mote) continue;
				mote.life += dt;
				mote.x += mote.vx * dt * 8;
				mote.y += mote.vy * dt * 8;
				if (mote.life > mote.max || mote.y < -.04) {
					sparkles.splice(i, 1);
					continue;
				}
				drawSparkle(ctx, mote, w, h);
			}
			const bar = Math.floor(pulse.beatIndex / 4);
			if (!stage && live && pulse.downbeat > .45 && bar % 16 === 7) glareRef.current = Math.max(glareRef.current, .92);
			glareRef.current *= Math.pow(.04, dt);
			const glare = glareRef.current;
			if (!stage && glare > .04) {
				const eyeY = cy - h * .06;
				const spread = 18 + glare * 10;
				const ih = 16 + glare * 22;
				drawLaserI(ctx, cx - spread, eyeY - ih * .5, ih, glare);
				drawLaserI(ctx, cx + spread, eyeY - ih * .5, ih, glare);
			}
		};
		raf = requestAnimationFrame(draw);
		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
		};
	}, [
		lookRef,
		playing,
		pulseRef,
		reduce
	]);
	if (reduce) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		className: "rose-opera-canvas",
		"aria-hidden": true
	});
}
/** Begin starts the playlist from song one. After that the same control is pause/resume — never a silent restart. */
function ritePrimary(state) {
	if (state.here && state.loading) return "opening";
	if (state.here && state.playing) return "pause";
	if (state.here && state.started) return "resume";
	return "begin";
}
function storageKey(slug) {
	return `radio.experience.unlock.${slug}`;
}
function useExperienceUnlock(stationSlug) {
	const { isAdmin } = useRadioUser();
	const playingHere = usePlayerStore((s) => Boolean(stationSlug) && s.channelSlug === stationSlug && s.status === "playing");
	const [started, setStarted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!stationSlug) return;
		try {
			if (window.sessionStorage.getItem(storageKey(stationSlug)) === "1") setStarted(true);
		} catch {}
	}, [stationSlug]);
	(0, import_react.useEffect)(() => {
		if (!stationSlug || !playingHere) return;
		setStarted(true);
		try {
			window.sessionStorage.setItem(storageKey(stationSlug), "1");
		} catch {}
	}, [playingHere, stationSlug]);
	return {
		unlocked: Boolean(isAdmin || started),
		started
	};
}
var IDLE_MS = 3200;
var QUIET = pulseAt(0, 120, false);
var RITE_LABEL = {
	begin: "Begin the rite",
	pause: "Pause",
	resume: "Resume",
	opening: "Opening…"
};
function RoseOpera({ experience, layout = "full" }) {
	const videoRef = (0, import_react.useRef)(null);
	const stageRef = (0, import_react.useRef)(null);
	const pulseRef = (0, import_react.useRef)(QUIET);
	const originRef = (0, import_react.useRef)(performance.now());
	const tuneIn = usePlayerStore((s) => s.tuneIn);
	const togglePlay = usePlayerStore((s) => s.togglePlay);
	const track = usePlayerStore((s) => s.channelSlug === experience.stationSlug ? s.track : null);
	const currentTime = usePlayerStore((s) => s.channelSlug === experience.stationSlug ? s.currentTime : 0);
	const status = usePlayerStore((s) => s.channelSlug === experience.stationSlug ? s.status : "idle");
	const playing = status === "playing";
	const here = usePlayerStore((s) => s.channelSlug === experience.stationSlug);
	const { unlocked, started } = useExperienceUnlock(experience.stationSlug);
	const { isAdmin } = useRadioUser();
	const channel = usePlayerStore((s) => s.catalog.channels.find((item) => item.slug === experience.stationSlug));
	const savedLook = (0, import_react.useMemo)(() => lookFromStation(experience, channel), [channel, experience]);
	const trackIndex = channel && track ? Math.max(0, getPlayableTracks(channel).findIndex((item) => item.id === track.id)) : 0;
	const trackLook = (0, import_react.useMemo)(() => lookForTrack(savedLook, track, trackIndex), [
		savedLook,
		track,
		trackIndex
	]);
	const [look, setLook] = (0, import_react.useState)(trackLook);
	const lookRef = (0, import_react.useRef)(look);
	lookRef.current = look;
	const tweaked = (0, import_react.useRef)(false);
	const [overrideId, setOverrideId] = (0, import_react.useState)(null);
	const [reduce, setReduce] = (0, import_react.useState)(false);
	const [cinema, setCinema] = (0, import_react.useState)(false);
	const [deskOpen, setDeskOpen] = (0, import_react.useState)(false);
	const [atelierOpen, setAtelierOpen] = (0, import_react.useState)(false);
	const [grokOpen, setGrokOpen] = (0, import_react.useState)(false);
	const grokPersist = (0, import_react.useRef)(false);
	const [chrome, setChrome] = (0, import_react.useState)(true);
	const [caption, setCaption] = (0, import_react.useState)(savedLook.captions[0] ?? experience.whisper);
	const liveVisual = playing || layout === "full" && !unlocked;
	const bpm = look.bpm > 0 ? look.bpm : bpmFromTags(track?.tags, experience.bpm);
	const stills = look.stillUrls.length ? look.stillUrls : experience.stills.map((item) => item.src);
	const stormLoop = look.phenomenon === "vortex";
	const rawLoop = stormLoop ? "/experiences/rose/vortex-storm.mp4?v=5" : look.loopUrl || experience.loop;
	const loopSrc = rawLoop.includes("tardis-loop") ? "/experiences/rose/vortex-storm.mp4?v=5" : rawLoop;
	const loopPoster = stormLoop || rawLoop.includes("tardis-loop") ? "/experiences/rose/vortex-tunnel.jpg?v=5" : stills[0];
	const primary = ritePrimary({
		here,
		playing,
		started,
		loading: status === "loading"
	});
	const cinemaDockRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setOverrideId(null);
	}, [track?.id]);
	(0, import_react.useEffect)(() => {
		if ((atelierOpen || grokOpen) && tweaked.current) return;
		if (overrideId) {
			setLook(lookForPhenomenon(savedLook, overrideId));
			return;
		}
		tweaked.current = false;
		setLook(trackLook);
	}, [
		atelierOpen,
		grokOpen,
		overrideId,
		savedLook,
		trackLook
	]);
	(0, import_react.useEffect)(() => {
		setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
		try {
			setGrokOpen(window.localStorage.getItem("radio.rose.grok.open.v1") === "1");
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!grokPersist.current) {
			grokPersist.current = true;
			return;
		}
		try {
			window.localStorage.setItem("radio.rose.grok.open.v1", grokOpen ? "1" : "0");
		} catch {}
	}, [grokOpen]);
	(0, import_react.useEffect)(() => {
		originRef.current = performance.now() - currentTime * 1e3;
	}, [currentTime, playing]);
	(0, import_react.useEffect)(() => {
		const el = videoRef.current;
		if (!el) return;
		if (reduce) {
			el.pause();
			return;
		}
		if (!liveVisual && look.phenomenon !== "vortex") {
			el.pause();
			return;
		}
		el.play().catch(() => void 0);
	}, [
		liveVisual,
		look.phenomenon,
		loopSrc,
		reduce
	]);
	(0, import_react.useEffect)(() => {
		const root = stageRef.current;
		if (!root) return;
		root.style.setProperty("--rose-stills", String(look.stills));
		root.style.setProperty("--rose-loop", String(look.loop));
	}, [look.loop, look.stills]);
	(0, import_react.useEffect)(() => {
		let raf = 0;
		const tick = () => {
			raf = requestAnimationFrame(tick);
			const pulse = pulseAt(playing ? Math.max(0, (performance.now() - originRef.current) / 1e3) : currentTime, bpm, playing);
			pulseRef.current = pulse;
			const next = captionForPulse(pulse, lookRef.current.captions.length ? lookRef.current.captions : experience.captions);
			if (next) setCaption((prev) => prev === next ? prev : next);
			const root = stageRef.current;
			if (root) {
				root.style.setProperty("--rose-energy", String(pulse.energy));
				root.style.setProperty("--rose-kick", String(pulse.kick));
				root.style.setProperty("--rose-fly", String(pulse.flying));
			}
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [
		bpm,
		currentTime,
		experience.captions,
		playing
	]);
	(0, import_react.useEffect)(() => {
		if (!cinema || atelierOpen || grokOpen || deskOpen) {
			setChrome(true);
			return;
		}
		setChrome(false);
		let timer = window.setTimeout(() => setChrome(false), IDLE_MS);
		const poke = () => {
			setChrome(true);
			window.clearTimeout(timer);
			timer = window.setTimeout(() => setChrome(false), IDLE_MS);
		};
		window.addEventListener("pointermove", poke);
		window.addEventListener("pointerdown", poke);
		window.addEventListener("keydown", poke);
		return () => {
			window.clearTimeout(timer);
			window.removeEventListener("pointermove", poke);
			window.removeEventListener("pointerdown", poke);
			window.removeEventListener("keydown", poke);
		};
	}, [
		atelierOpen,
		cinema,
		deskOpen,
		grokOpen
	]);
	(0, import_react.useEffect)(() => {
		const on = cinema && layout === "full";
		document.body.classList.toggle("rose-cinema-on", on);
		if (!on) return () => document.body.classList.remove("rose-cinema-on");
		const store = usePlayerStore.getState();
		if (!cinemaDockRef.current) cinemaDockRef.current = {
			hidden: store.playerHidden,
			collapsed: store.playerCollapsed
		};
		store.setPlayerHidden(true);
		return () => {
			document.body.classList.remove("rose-cinema-on");
			const prior = cinemaDockRef.current;
			cinemaDockRef.current = null;
			if (!prior) return;
			const now = usePlayerStore.getState();
			if (!now.playerHidden) return;
			if (prior.hidden) now.setPlayerHidden(true);
			else now.setPlayerCollapsed(prior.collapsed);
		};
	}, [cinema, layout]);
	(0, import_react.useEffect)(() => {
		const onFs = () => {
			if (!document.fullscreenElement) setCinema(false);
		};
		document.addEventListener("fullscreenchange", onFs);
		return () => document.removeEventListener("fullscreenchange", onFs);
	}, []);
	async function begin() {
		if (primary === "opening") return;
		if (primary === "pause" || primary === "resume") {
			await togglePlay();
			return;
		}
		await tuneIn(experience.stationSlug, {
			forcePlay: true,
			fromStart: true
		});
	}
	async function toggleCinema() {
		const next = !cinema;
		setCinema(next);
		try {
			if (next) {
				if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
			} else if (document.fullscreenElement) await document.exitFullscreen();
		} catch {}
	}
	const showCopy = layout === "hero" || chrome || deskOpen || atelierOpen || grokOpen;
	function applyLook(next) {
		tweaked.current = true;
		setLook(next);
	}
	function cycleLook(step = 1) {
		const next = stepPhenomenon(look.phenomenon, step);
		if (next === trackLook.phenomenon) {
			setOverrideId(null);
			tweaked.current = false;
			setLook(trackLook);
			return;
		}
		setOverrideId(next);
		applyLook(lookForPhenomenon(savedLook, next));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		ref: stageRef,
		className: cn("rose-opera", layout === "full" && "rose-opera-full", cinema && "is-cinema", !liveVisual && "is-hush", showCopy ? "is-chrome" : "is-screensaver", atelierOpen && "is-atelier"),
		"data-phenomenon": look.phenomenon,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rose-opera-stage",
				"aria-hidden": true,
				children: [
					isStageOwned(look.phenomenon) ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rose-opera-stills",
						children: stills.map((src, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src,
							alt: "",
							className: `rose-opera-still rose-opera-still-${index}`
						}, src))
					}),
					reduce || isStageOwned(look.phenomenon) ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						ref: videoRef,
						className: "rose-opera-loop",
						src: loopSrc,
						poster: loopPoster,
						muted: true,
						loop: true,
						playsInline: true,
						preload: "metadata"
					}, loopSrc),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoseVortex, {
						pulseRef,
						lookRef,
						playing: liveVisual,
						reduce
					}),
					isStageOwned(look.phenomenon) ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rose-opera-vortex",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "rose-opera-lantern" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rose-opera-veil" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rose-opera-fields",
						"aria-hidden": true,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								className: "rose-field-hedge is-left",
								src: "/experiences/rose/rose-hedge.jpg",
								alt: ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								className: "rose-field-hedge is-right",
								src: "/experiences/rose/rose-hedge.jpg",
								alt: ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								className: "rose-field-ground",
								src: "/experiences/rose/rose-field.jpg",
								alt: ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								className: "rose-field-bloom is-a",
								src: "/experiences/rose/rose-bloom.jpg",
								alt: ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								className: "rose-field-bloom is-b",
								src: "/experiences/rose/rose-bloom.jpg",
								alt: ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "rose-glitter" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "rose-glitter" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "rose-glitter" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "rose-glitter" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "rose-glitter" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "rose-glitter" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "rose-glitter" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "rose-glitter" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rose-opera-air",
						"aria-hidden": true,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rose-opera-caption",
				children: playing ? caption : experience.whisper
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LookCycle, {
				current: look.phenomenon,
				songDefault: trackLook.phenomenon,
				onCycle: cycleLook
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("rose-opera-copy", !showCopy && "is-hidden"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rose-opera-kicker",
						children: experience.kicker
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "rose-opera-title",
						children: experience.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rose-opera-line",
						children: experience.line
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rose-opera-whisper",
						children: experience.whisper
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rose-opera-actions",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void begin(),
							className: "rose-opera-begin",
							disabled: primary === "opening",
							"aria-pressed": primary === "pause",
							children: [primary === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), RITE_LABEL[primary]]
						}), layout === "full" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => void toggleCinema(),
								className: "rose-opera-ghost",
								"aria-pressed": cinema,
								children: [cinema ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize, { className: "size-4" }), cinema ? "Exit cinema" : "Cinema"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setDeskOpen((value) => !value),
								className: "rose-opera-ghost",
								"aria-expanded": deskOpen,
								children: unlocked || isAdmin ? "Open the desk" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3.5" }), "Locked desk"] })
							}),
							isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "rose-opera-ghost",
								"aria-pressed": atelierOpen,
								onClick: () => setAtelierOpen((value) => !value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "size-3.5" }), "Atelier"]
							}) : null,
							isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "rose-opera-ghost",
								"aria-pressed": grokOpen,
								onClick: () => setGrokOpen((value) => !value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-3.5" }), "Grok"]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/channel/$slug",
								params: { slug: experience.stationSlug },
								className: "rose-opera-ghost",
								children: "Station"
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/experiences/$slug",
								params: { slug: experience.slug },
								className: "rose-opera-ghost",
								children: "Full opera"
							}),
							isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "rose-opera-ghost",
								"aria-pressed": atelierOpen,
								onClick: () => setAtelierOpen((value) => !value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "size-3.5" }), "Atelier"]
							}) : null,
							isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "rose-opera-ghost",
								"aria-pressed": grokOpen,
								onClick: () => setGrokOpen((value) => !value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-3.5" }), "Grok"]
							}) : null
						] })]
					}),
					layout === "full" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rose-opera-hint",
						children: "Begin starts the playlist from the first song. The look chip cycles scenes — each song still opens on its own graphic. Cinema tucks the player into a progress line; tap the line to open the deck, then expand it."
					}) : null
				]
			}),
			layout === "full" && cinema ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "rose-opera-exit",
				onClick: () => void toggleCinema(),
				"aria-label": "Exit cinema",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			}) : null,
			layout === "full" && deskOpen && channel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rose-desk",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rose-desk-bar",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rose-desk-kicker",
							children: unlocked || isAdmin ? "Rite playlist" : "Sealed until the rite begins"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setDeskOpen(false),
							className: "rose-opera-ghost",
							"aria-label": "Close desk",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})]
					}),
					isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostCleaner, { channel }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationPlaylist, {
						channel,
						locked: !unlocked,
						onUnlock: () => void begin(),
						startOpen: isAdmin
					}),
					isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rose-desk-admin",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rose-desk-kicker",
								children: "Admin"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-3 text-sm text-muted",
								children: [
									"Tag a song ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-gold",
										children: "bpm:128"
									}),
									" to lock that cut. Open ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-gold",
										children: "Atelier"
									}),
									" to keep directing the vortex."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStationEdit, { channel })
						]
					}) : null
				]
			}) : null,
			atelierOpen && isAdmin && channel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoseAtelier, {
				channel,
				track,
				look,
				saved: trackLook,
				onLook: applyLook,
				onClose: () => setAtelierOpen(false)
			}) : null,
			grokOpen && isAdmin && channel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoseGrokChat, {
				channel,
				track,
				look,
				onLook: applyLook,
				onClose: () => setGrokOpen(false)
			}) : null
		]
	});
}
function LookCycle({ current, songDefault, onCycle }) {
	const item = phenomenonMeta(current);
	const overridden = current !== songDefault;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: "rose-look-cycle",
		"aria-pressed": overridden,
		"aria-label": `${overridden ? "Override look" : "This song's look"}: ${item.label}. Next look`,
		title: `${item.hint} Click to cycle. Shift-click for the previous scene. The next song returns to its own graphic.`,
		onClick: (event) => onCycle(event.shiftKey ? -1 : 1),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: item.thumb,
				alt: ""
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: overridden ? "Override" : "This song" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item.label })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, {
				className: "size-4",
				"aria-hidden": true
			})
		]
	});
}
//#endregion
export { StationPlaylist as n, useExperienceUnlock as r, RoseOpera as t };
