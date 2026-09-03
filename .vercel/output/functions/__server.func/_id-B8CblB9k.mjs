import { b as require_jsx_runtime, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { g as usePlayerStore, o as getSong } from "./_ssr/player-store-Dz5TRk6B.mjs";
import { n as formatClock } from "./_ssr/cn-CyOQLR37.mjs";
import { i as Play } from "./_libs/lucide-react.mjs";
import { n as Route$6, o as CoverArt } from "./_ssr/router-DCyqcLgO.mjs";
import { r as AdminTrackTools } from "./_ssr/admin-track-tools-Dohd-T5g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-B8CblB9k.js
var import_jsx_runtime = require_jsx_runtime();
function SongPage() {
	const { id } = Route$6.useParams();
	const song = getSong(id);
	const cueTrack = usePlayerStore((s) => s.cueTrack);
	const status = usePlayerStore((s) => s.status);
	const trackNow = usePlayerStore((s) => s.track);
	if (!song) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-[11px] uppercase tracking-[0.2em] text-ember",
			children: "Missing cut"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-3 font-display text-4xl font-semibold",
			children: "No such song"
		})]
	});
	if (song.locked) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-[11px] uppercase tracking-[0.2em] text-muted",
			children: "18+ · Locked"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-3 font-display text-4xl font-semibold",
			children: "This cut is off the public dial"
		})]
	});
	const playingHere = trackNow?.id === song.track.id && status === "playing";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8 pb-44",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Player"
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
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => void cueTrack(song.channel.slug, song.track.id),
					className: "inline-flex h-12 min-w-36 items-center justify-center gap-2 rounded-md bg-fg px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-bg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), playingHere ? "Playing" : "Play"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/channel/$slug",
					params: { slug: song.channel.slug },
					className: "inline-flex h-12 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
					children: song.channel.name
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTrackTools, {
				slug: song.channel.slug,
				track: song.track
			})
		]
	});
}
//#endregion
export { SongPage as component };
