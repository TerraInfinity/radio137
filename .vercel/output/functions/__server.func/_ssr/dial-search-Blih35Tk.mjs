import { o as __toESM } from "../_runtime.mjs";
import { B as require_react, V as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as Search } from "../_libs/lucide-react.mjs";
import { A as searchDial, B as formatClock, H as usePlayerStore, R as CoverArt } from "./router-Cp-QOkSx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dial-search-Blih35Tk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DialSearch({ catalog, query, onQuery, autoFocus = false, heading = "Search" }) {
	const cueTrack = usePlayerStore((s) => s.cueTrack);
	const groups = usePlayerStore((s) => s.cutGroups);
	const needle = query.trim();
	const results = (0, import_react.useMemo)(() => needle.length >= 2 ? searchDial(catalog, needle, false, groups) : {
		stations: [],
		songs: []
	}, [
		catalog,
		groups,
		needle
	]);
	const searching = needle.length >= 2;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "block",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
				children: heading
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "relative mt-1 block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input pl-10",
					value: query,
					autoFocus,
					onChange: (event) => onQuery(event.target.value),
					placeholder: "Song, artist, tag, station, filename",
					type: "search",
					enterKeyHint: "search",
					autoComplete: "off",
					spellCheck: false
				})]
			})]
		}),
		needle.length === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-subtle",
			children: "Type one more letter."
		}) : null,
		searching && results.stations.length === 0 && results.songs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 text-muted",
			children: [
				"Nothing on the dial matches “",
				needle,
				"”."
			]
		}) : null,
		results.stations.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
				children: ["Stations · ", results.stations.length]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 divide-y divide-line",
				children: results.stations.map(({ channel }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/channel/$slug",
						params: { slug: channel.slug },
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
							src: channel.cover,
							alt: "",
							className: "size-12 shrink-0 rounded-md"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate font-display text-lg",
								children: channel.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
								children: [
									channel.kind,
									" · ",
									channel.energy,
									channel.tags?.length ? ` · ${channel.tags.slice(0, 4).join(" · ")}` : ""
								]
							})]
						})]
					})
				}, channel.slug))
			})]
		}) : null,
		results.songs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
				children: ["Songs · ", results.songs.length]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 divide-y divide-line",
				children: results.songs.map(({ track, channel, copies }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
								src: track.coverUrl || channel.cover,
								alt: "",
								className: "size-12 shrink-0 rounded-md"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/player/$id",
								params: { id: track.id },
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate font-display text-lg",
										children: track.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block truncate text-sm text-muted",
										children: [
											track.artist,
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-subtle",
												children: [" · ", channel.name]
											}),
											copies > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-subtle",
												children: [
													" · ",
													copies,
													" copies"
												]
											}) : null
										]
									}),
									track.tags && track.tags.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
										children: track.tags.join(" · ")
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden font-mono text-[11px] text-subtle sm:inline",
								children: formatClock(track.durationSec)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => void cueTrack(channel.slug, track.id),
								className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
								children: "Play"
							})
						]
					})
				}, track.id))
			})]
		}) : null
	] });
}
//#endregion
export { DialSearch as t };
