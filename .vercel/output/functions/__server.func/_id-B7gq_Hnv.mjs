import { S as stationsForSong, o as getSong } from "./_ssr/catalog-BcaLbP39.mjs";
import { V as require_jsx_runtime, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { s as Play, u as Download } from "./_libs/lucide-react.mjs";
import { B as formatClock, H as usePlayerStore, R as CoverArt, c as useRadioUser, k as downloadName, l as TrackActions, n as Route$6, s as ssoLoginHref } from "./_ssr/router-Cp-QOkSx.mjs";
import { r as AdminTrackTools } from "./_ssr/admin-track-tools-Drwrd1Pw.mjs";
import { r as SongCopies, t as AdminMergeBox } from "./_ssr/desk-directory-9mJDMg10.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-B7gq_Hnv.js
var import_jsx_runtime = require_jsx_runtime();
function SongPage() {
	const { id } = Route$6.useParams();
	usePlayerStore((s) => s.catalog);
	usePlayerStore((s) => s.cutGroups);
	const song = getSong(id);
	const cueTrack = usePlayerStore((s) => s.cueTrack);
	const status = usePlayerStore((s) => s.status);
	const trackNow = usePlayerStore((s) => s.track);
	const bumpView = usePlayerStore((s) => s.bumpView);
	const { isAdmin } = useRadioUser();
	if (!song) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-ember",
				children: "Missing cut"
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
				children: "Search cuts"
			})
		]
	});
	if (song.locked) {
		const href = ssoLoginHref(`/player/${id}`);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-3xl px-4 py-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[11px] uppercase tracking-[0.2em] text-muted",
					children: "18+ · Locked"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 font-display text-4xl font-semibold",
					children: "This cut is off the public dial"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-prose text-muted",
					children: "Sign in through the Terrainfinity hub to open 18+ rooms. Google stays on the hub."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href,
					className: "mt-8 inline-flex h-12 min-w-44 items-center justify-center rounded-md bg-fg px-6 font-mono text-[12px] uppercase tracking-[0.16em] text-bg",
					children: "Sign in with Google"
				})
			]
		});
	}
	const playingHere = trackNow?.id === song.track.id && status === "playing";
	const alsoOn = stationsForSong(song.track.id).filter((channel) => channel.slug !== song.channel.slug);
	const filename = downloadName(song.track);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8 pb-44",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Cut"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex gap-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
					src: song.track.coverUrl || song.channel.cover,
					alt: "",
					className: "size-32 shrink-0 rounded-lg sm:size-40"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-4xl font-semibold tracking-tight",
							children: song.track.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted",
							children: song.track.artist
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle",
							children: formatClock(song.track.durationSec)
						}),
						song.track.tags && song.track.tags.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 flex flex-wrap gap-1",
							children: song.track.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								search: { q: tag },
								className: "inline-flex h-8 items-center rounded-md px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold shadow-[var(--shadow-border)]",
								children: tag
							}) }, tag))
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackActions, { trackId: song.track.id })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							bumpView(song.track.id);
							cueTrack(song.channel.slug, song.track.id);
						},
						className: "inline-flex h-12 min-w-36 items-center justify-center gap-2 rounded-md bg-fg px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-bg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 ml-0.5" }), playingHere ? "Playing" : "Play"]
					}),
					song.track.audioUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: song.track.audioUrl,
						download: filename,
						rel: "noopener noreferrer",
						className: "inline-flex h-12 items-center gap-2 px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download"]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/channel/$slug",
						params: { slug: song.channel.slug },
						className: "inline-flex h-12 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
						children: song.channel.name
					})
				]
			}),
			alsoOn.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
				children: [
					"Also on",
					" ",
					alsoOn.map((channel, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [index ? " · " : "", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/channel/$slug",
						params: { slug: channel.slug },
						className: "text-gold",
						children: channel.name
					})] }, channel.slug))
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SongCopies, { trackId: song.track.id }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTrackTools, {
				slug: song.channel.slug,
				track: song.track
			}, `${song.channel.slug}:${song.track.id}:${song.track.audioUrl}:${(song.track.tags ?? []).join(",")}`),
			isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminMergeBox, { trackId: song.track.id }) : null
		]
	});
}
//#endregion
export { SongPage as component };
