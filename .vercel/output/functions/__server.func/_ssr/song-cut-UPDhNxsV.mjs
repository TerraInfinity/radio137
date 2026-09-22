import { o as __toESM } from "../_runtime.mjs";
import { r as formatClock } from "./cn-BnEf6O0M.mjs";
import { c as songKey, l as songPath, t as aliasPath } from "./song-url-BbYrVN1D.mjs";
import { D as durationOf, i as getPlayableTracks, w as stationsForSong } from "./catalog-DmckmNNR.mjs";
import { C as require_jsx_runtime, W as require_react, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { y as usePlayerStore } from "./player-store-CdB40IHB.mjs";
import { y as Play } from "../_libs/lucide-react.mjs";
import { D as useRadioUser, _ as CoverArt, d as ShareLink, l as TrackActions } from "./router-BjRk-_wL.mjs";
import { o as useDurationClock, r as FoldSection } from "./duration-probe-Cc9x2Byq.mjs";
import { n as AdminTrackTools } from "./admin-track-tools-Jp5gX6Ea.mjs";
import { t as SignInChoices } from "./sign-in-choices-_CiJYAa3.mjs";
import { i as SongCopies, r as DownloadLink, t as AdminMergeBox } from "./desk-directory-Dy2xgkhk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/song-cut-UPDhNxsV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SongCut({ track, channel, locked, sharePath }) {
	const cueTrack = usePlayerStore((s) => s.cueTrack);
	const status = usePlayerStore((s) => s.status);
	const trackNow = usePlayerStore((s) => s.track);
	const bumpView = usePlayerStore((s) => s.bumpView);
	const ready = usePlayerStore((s) => s.ready);
	const catalogReady = usePlayerStore((s) => s.catalogReady);
	const { isAdmin } = useRadioUser();
	useDurationClock([track]);
	(0, import_react.useEffect)(() => {
		if (!ready || !catalogReady || locked) return;
		const now = usePlayerStore.getState();
		if (now.track?.id === track.id && (now.status === "playing" || now.status === "loading" || now.status === "paused")) return;
		bumpView(track.id);
		cueTrack(channel.slug, track.id, { play: now.autoplay || now.status === "playing" });
	}, [
		ready,
		catalogReady,
		locked,
		track.id,
		channel.slug,
		bumpView,
		cueTrack
	]);
	if (locked) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-muted",
				children: "18+ · Locked"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl font-semibold",
				children: "This song is off the public dial"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-prose text-muted",
				children: "Sign in with Google or X to open 18+ rooms. Google still lives on the Terrainfinity hub."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignInChoices, { next: sharePath })
			})
		]
	});
	const playingHere = trackNow?.id === track.id && status === "playing";
	const alsoOn = stationsForSong(track.id).filter((item) => item.slug !== channel.slug);
	const canonical = songPath(track);
	const aliases = track.aliases ?? [];
	const tags = track.tags ?? [];
	const playable = getPlayableTracks(channel);
	const hereIndex = playable.findIndex((item) => item.id === track.id);
	const more = hereIndex < 0 ? playable.filter((item) => item.id !== track.id).slice(0, 8) : [...playable.slice(hereIndex + 1), ...playable.slice(0, hereIndex)].slice(0, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8 pb-52",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Song"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex gap-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
					src: track.coverUrl || channel.cover,
					alt: "",
					className: "size-32 shrink-0 rounded-lg sm:size-40",
					motion: "loop"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-4xl font-semibold tracking-tight",
							children: track.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted",
							children: track.artist
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle",
							children: formatClock(durationOf(track))
						}),
						tags.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SongTags, { tags }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackActions, { trackId: track.id })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							bumpView(track.id);
							cueTrack(channel.slug, track.id);
						},
						className: "inline-flex h-12 min-w-36 items-center justify-center gap-2 rounded-md bg-fg px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-bg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 ml-0.5" }), playingHere ? "Playing" : "Play"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadLink, { track }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/channel/$slug",
						params: { slug: channel.slug },
						className: "inline-flex h-12 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
						children: channel.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareLink, {
						path: sharePath,
						title: track.title,
						compact: true
					})
				]
			}),
			alsoOn.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
				children: [
					"Also on",
					" ",
					alsoOn.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [index ? " · " : "", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/channel/$slug",
						params: { slug: item.slug },
						className: "text-gold",
						children: item.name
					})] }, item.slug))
				]
			}) : null,
			aliases.length > 0 || canonical ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FoldSection, {
				title: "Addresses",
				hint: "Links",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "break-all font-mono text-[11px] text-subtle",
					children: [
						"Player",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: canonical,
							className: "text-gold",
							children: canonical
						})
					]
				}), aliases.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 font-mono text-[11px] text-subtle",
					children: [
						"Short",
						" ",
						aliases.map((alias, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [index ? " · " : "", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: aliasPath(alias),
							className: "text-gold",
							children: ["/", alias]
						})] }, alias))
					]
				}) : null]
			}) : null,
			more.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoldSection, {
				title: `More on ${channel.name}`,
				hint: "Open",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "divide-y divide-line",
					children: more.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "playlist-row px-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-7 shrink-0 text-center font-mono text-[10px] tabular-nums text-subtle",
								children: String((hereIndex < 0 ? index : (hereIndex + 1 + index) % playable.length) + 1).padStart(2, "0")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/player/$id",
								params: { id: songKey(item) },
								className: "flex min-w-0 flex-1 items-center gap-2.5 py-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "size-10 shrink-0 overflow-hidden rounded-sm bg-bg",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
											src: item.coverUrl && !item.coverUrl.match(/\.(mp4|webm|mov|m4v)$/i) ? item.coverUrl : channel.cover,
											alt: "",
											className: "size-full",
											motion: "still"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-sm",
											children: item.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.1em] text-subtle",
											children: item.artist || "Unknown"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "min-w-12 shrink-0 text-right font-mono text-[10px] tabular-nums text-subtle",
										children: formatClock(durationOf(item))
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => void cueTrack(channel.slug, item.id),
								className: "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
								children: "Play"
							})
						]
					}, item.id))
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SongCopies, { trackId: track.id }),
			isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoldSection, {
				title: "Edit this song",
				hint: "Edit",
				titleClassName: "text-gold",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTrackTools, {
					slug: channel.slug,
					track
				}, `${channel.slug}:${track.id}:${track.audioUrl}:${track.slug ?? ""}:${aliases.join(",")}:${(track.tags ?? []).join(",")}`)
			}) : null,
			isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoldSection, {
				title: "Merge copies",
				hint: "Open",
				titleClassName: "text-gold",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminMergeBox, { trackId: track.id })
			}) : null
		]
	});
}
function SongTags({ tags }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const shown = open ? tags : tags.slice(0, 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
		className: "mt-3 flex flex-wrap gap-1",
		children: [shown.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			search: { q: tag },
			className: "inline-flex h-8 items-center rounded-md px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold shadow-[var(--shadow-border)]",
			children: tag
		}) }, tag)), tags.length > 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setOpen((value) => !value),
			className: "inline-flex h-8 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
			children: open ? "Less" : `+${tags.length - 4}`
		}) }) : null]
	});
}
//#endregion
export { SongCut as t };
