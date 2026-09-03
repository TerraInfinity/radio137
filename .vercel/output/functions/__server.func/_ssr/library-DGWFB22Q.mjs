import { o as __toESM } from "../_runtime.mjs";
import { m as listPublicSongs, r as formatClock } from "./cn-UVNI8J0o.mjs";
import { B as require_react, b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as usePlayerStore } from "./router-ICW3tdWz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-DGWFB22Q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LibraryPage() {
	const [query, setQuery] = (0, import_react.useState)("");
	const cueTrack = usePlayerStore((s) => s.cueTrack);
	const songs = (0, import_react.useMemo)(() => listPublicSongs(), []);
	const visible = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return songs;
		return songs.filter(({ track, channel }) => `${track.title} ${track.artist} ${channel.name} ${track.id}`.toLowerCase().includes(needle));
	}, [query, songs]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Vault"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold tracking-tight",
				children: "Library"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted",
				children: "Public cuts on the dial. 18+ stays off this list."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-6 block",
				htmlFor: "library-q",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
					children: "Search"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "library-q",
					className: "input mt-1",
					value: query,
					onChange: (event) => setQuery(event.target.value),
					placeholder: "Title, artist, channel"
				})]
			}),
			visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-sm text-muted",
				children: "No cuts match."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 divide-y divide-line",
				children: visible.map(({ track, channel }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex min-h-14 items-center gap-3 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/player/$id",
								params: { id: track.id },
								className: "block truncate font-display text-lg font-semibold",
								children: track.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
								children: [
									track.artist,
									" ·",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/channel/$slug",
										params: { slug: channel.slug },
										children: channel.name
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden shrink-0 font-mono text-[11px] tabular-nums text-subtle sm:inline",
							children: formatClock(track.durationSec)
						}),
						track.originalUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: track.originalUrl,
							target: "_blank",
							rel: "noreferrer",
							className: "hidden font-mono text-[10px] uppercase tracking-[0.12em] text-cyan sm:inline",
							children: "Source"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void cueTrack(channel.slug, track.id),
							className: "inline-flex h-11 items-center px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
							children: "Play"
						})
					]
				}, track.id))
			})
		]
	});
}
//#endregion
export { LibraryPage as component };
