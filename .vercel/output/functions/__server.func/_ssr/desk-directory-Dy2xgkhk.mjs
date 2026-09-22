import { o as __toESM } from "../_runtime.mjs";
import { o as mediaUrl } from "./media-ChlF6fRc.mjs";
import { r as formatClock, t as cn } from "./cn-BnEf6O0M.mjs";
import { c as songKey } from "./song-url-BbYrVN1D.mjs";
import { D as durationOf, a as getSeedCatalog } from "./catalog-DmckmNNR.mjs";
import { C as require_jsx_runtime, W as require_react, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as downloadAudio, y as usePlayerStore } from "./player-store-CdB40IHB.mjs";
import { t as applyCatalogEdits } from "./catalog-edits-B7ACZ19x.mjs";
import { a as filenameClusters, c as preferCanonical, o as listCutCopies, r as copiesOf, s as mergedClusters, u as titleClusters } from "./cuts-DHoBzPwa.mjs";
import { I as Download } from "../_libs/lucide-react.mjs";
import { G as mergeStationCuts, I as dissolveStationCut, V as listCutSkips, W as mergeStationCutClusters, it as skipSimilarCuts, ot as unmergeStationCut, w as downloadName } from "./router-BjRk-_wL.mjs";
import { r as FoldSection } from "./duration-probe-Cc9x2Byq.mjs";
import { n as similarClusters } from "./similar-cuts-BE0d4_OA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desk-directory-Dy2xgkhk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DownloadLink({ track, label = "Download", className }) {
	if (!track.audioUrl) return null;
	const name = downloadName(track);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href: mediaUrl(track.audioUrl),
		download: name,
		className: cn("inline-flex h-12 items-center gap-2 px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold", className),
		onClick: (event) => {
			event.preventDefault();
			downloadAudio(track, name);
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), label]
	});
}
function saveGroups(groups) {
	usePlayerStore.getState().replaceCutGroups(groups);
}
function applyMerge(result) {
	saveGroups(result.groups);
	if (result.tracks) usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations ?? []));
}
function fail(error) {
	window.alert(error instanceof Error ? error.message : "Directory save failed");
}
function reasonLabel(cluster) {
	if (cluster.reason === "file") return "same filename";
	if (cluster.reason === "title") return "same title";
	if (cluster.reason === "similar") return cluster.why?.join(" · ") || "similar names";
	return "merged";
}
function DeskDirectory({ catalog }) {
	const groups = usePlayerStore((s) => s.cutGroups);
	const [query, setQuery] = (0, import_react.useState)("");
	const [tab, setTab] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [skipKeys, setSkipKeys] = (0, import_react.useState)([]);
	const copies = (0, import_react.useMemo)(() => listCutCopies(catalog, true), [catalog]);
	const files = (0, import_react.useMemo)(() => filenameClusters(copies), [copies]);
	const merged = (0, import_react.useMemo)(() => mergedClusters(copies, groups), [copies, groups]);
	const skipIds = (0, import_react.useMemo)(() => {
		const ids = new Set(groups.flatMap((group) => group.memberIds));
		for (const cluster of files) for (const copy of cluster.copies) ids.add(copy.track.id);
		return ids;
	}, [files, groups]);
	const titles = (0, import_react.useMemo)(() => titleClusters(copies, skipIds), [copies, skipIds]);
	const similar = (0, import_react.useMemo)(() => similarClusters(copies, groups, skipKeys), [
		copies,
		groups,
		skipKeys
	]);
	const needle = query.trim().toLowerCase();
	const resolvedTab = tab ?? (similar.length > 0 ? "similar" : "file");
	(0, import_react.useEffect)(() => {
		listCutSkips().then((data) => setSkipKeys(data.keys)).catch(() => setSkipKeys([]));
	}, []);
	const visible = (resolvedTab === "similar" ? similar : resolvedTab === "file" ? files : resolvedTab === "title" ? titles : merged).filter((cluster) => {
		if (!needle) return true;
		return cluster.copies.some((copy) => `${copy.track.title} ${copy.channel.name} ${copy.filename} ${copy.folder}`.toLowerCase().includes(needle));
	});
	async function mergeOne(cluster, canonicalId) {
		const keep = canonicalId || preferCanonical(cluster.copies).track.id;
		setBusy(true);
		try {
			applyMerge(await mergeStationCuts({ data: {
				canonicalId: keep,
				memberIds: cluster.copies.map((copy) => copy.track.id)
			} }));
		} catch (error) {
			fail(error);
		} finally {
			setBusy(false);
		}
	}
	async function skipOne(cluster) {
		if (!window.confirm("Mark these as different songs? They will not be suggested again. Files stay. You can still merge them later by hand.")) return;
		setBusy(true);
		try {
			const result = await skipSimilarCuts({ data: { memberIds: cluster.copies.map((copy) => copy.track.id) } });
			setSkipKeys(result.keys);
		} catch (error) {
			fail(error);
		} finally {
			setBusy(false);
		}
	}
	async function mergeAllFiles() {
		if (!window.confirm(`Merge ${files.length} filename clusters into one directory row each?\n\nR2 files stay. Each station keeps one copy. Search will show one song.`)) return;
		setBusy(true);
		try {
			applyMerge(await mergeStationCutClusters({ data: { clusters: files.map((cluster) => {
				return {
					canonicalId: preferCanonical(cluster.copies).track.id,
					memberIds: cluster.copies.map((copy) => copy.track.id)
				};
			}) } }));
			setTab("merged");
		} catch (error) {
			fail(error);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "Directory"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 font-display text-2xl font-semibold",
				children: "One song, many folders"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-prose text-muted",
				children: "Copies in different R2 folders stay put. Merge them here so search lists one song. A station that already has the song keeps that one row — merge will not add a second copy or pull it off the desk."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle",
				children: [
					copies.length,
					" copies · ",
					similar.length,
					" similar · ",
					files.length,
					" same filename · ",
					titles.length,
					" same title · ",
					merged.length,
					" merged"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy || files.length === 0,
					onClick: () => void mergeAllFiles(),
					className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-50",
					children: busy ? "Merging…" : `Merge ${files.length} filename clusters`
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "input mt-4",
				value: query,
				onChange: (event) => setQuery(event.target.value),
				placeholder: "Filter title, station, or folder"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-1",
				children: [
					["similar", `Similar · ${similar.length}`],
					["file", `Filename · ${files.length}`],
					["title", `Title · ${titles.length}`],
					["merged", `Merged · ${merged.length}`]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(id),
					className: `inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] ${resolvedTab === id ? "bg-fg text-bg" : "text-gold"}`,
					children: label
				}, id))
			}),
			resolvedTab === "similar" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-prose text-sm text-muted",
				children: "Close titles and matching length — likely the same song with a spelling or folder drift. Merge to list them as one. Skip if they are different; that pair will not come back."
			}) : null,
			visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-muted",
				children: resolvedTab === "similar" ? "No similar songs waiting. Filename and title matches still have their own lists." : "Nothing in this list."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-3",
				children: visible.slice(0, 80).map((cluster) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClusterCard, {
					cluster,
					busy,
					onMerge: mergeOne,
					onSkip: skipOne
				}, `${cluster.reason}:${cluster.key}`))
			})
		]
	});
}
function ClusterCard({ cluster, busy, onMerge, onSkip }) {
	const preferred = preferCanonical(cluster.copies);
	const [keep, setKeep] = (0, import_react.useState)(preferred.track.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg",
					children: preferred.track.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
					children: [
						cluster.copies.length,
						" copies · ",
						reasonLabel(cluster)
					]
				})]
			}), cluster.reason === "merged" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: busy,
				onClick: () => {
					if (!window.confirm("Split this directory row back into separate songs? Files stay.")) return;
					dissolveStationCut({ data: { canonicalId: cluster.key } }).then((result) => saveGroups(result.groups)).catch(fail);
				},
				className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
				children: "Split"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [cluster.reason === "similar" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy,
					onClick: () => void onSkip(cluster),
					className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
					children: "Skip"
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy,
					onClick: () => void onMerge(cluster, keep),
					className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
					children: "Merge"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 space-y-2",
			children: cluster.copies.map((copy) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyRow, {
				copy,
				keep,
				onKeep: setKeep,
				merged: cluster.reason === "merged",
				group: cluster.key
			}, `${copy.channel.slug}:${copy.track.id}`))
		})]
	});
}
function CopyRow({ copy, keep, onKeep, merged, group }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex flex-wrap items-center gap-2",
		children: [
			merged ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "inline-flex h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "radio",
					name: `keep-${group}`,
					checked: keep === copy.track.id,
					onChange: () => onKeep(copy.track.id)
				}), "Directory"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/player/$id",
					params: { id: songKey(copy.track) },
					className: "block truncate text-sm",
					children: copy.track.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
					children: [
						copy.channel.name,
						" · ",
						formatClock(durationOf(copy.track)),
						" · ",
						copy.folder || copy.filename
					]
				})]
			}),
			merged ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => {
					unmergeStationCut({ data: { memberId: copy.track.id } }).then((result) => saveGroups(result.groups)).catch(fail);
				},
				className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
				children: "Unmerge"
			}) : null
		]
	});
}
function SongCopies({ trackId }) {
	const catalog = usePlayerStore((s) => s.catalog);
	const groups = usePlayerStore((s) => s.cutGroups);
	const cueTrack = usePlayerStore((s) => s.cueTrack);
	const copies = copiesOf(catalog, trackId, groups, false);
	if (copies.length <= 1) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FoldSection, {
		title: `Copies · ${copies.length}`,
		hint: "Open",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted",
			children: [
				"Same song on ",
				copies.length,
				" desks. Each folder keeps its file."
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 divide-y divide-line",
			children: copies.map((copy) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex flex-wrap items-center gap-2 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/channel/$slug",
							params: { slug: copy.channel.slug },
							className: "block truncate",
							children: copy.channel.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: [
								formatClock(durationOf(copy.track)),
								" · ",
								copy.folder || copy.filename
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void cueTrack(copy.channel.slug, copy.track.id),
						className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: "Play this copy"
					}),
					copy.track.audioUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadLink, {
						track: copy.track,
						label: "File",
						className: "h-11 text-[10px] tracking-[0.12em]"
					}) : null
				]
			}, `${copy.channel.slug}:${copy.track.id}`))
		})]
	});
}
function AdminMergeBox({ trackId }) {
	const catalog = usePlayerStore((s) => s.catalog);
	const groups = usePlayerStore((s) => s.cutGroups);
	const [needle, setNeedle] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const copies = (0, import_react.useMemo)(() => listCutCopies(catalog, true), [catalog]);
	const hits = (0, import_react.useMemo)(() => {
		const q = needle.trim().toLowerCase();
		if (q.length < 2) return [];
		const already = new Set(copiesOf(catalog, trackId, groups, true).map((copy) => copy.track.id));
		return copies.filter((copy) => !already.has(copy.track.id) && `${copy.track.title} ${copy.channel.name} ${copy.filename}`.toLowerCase().includes(q)).slice(0, 12);
	}, [
		catalog,
		copies,
		groups,
		needle,
		trackId
	]);
	async function mergeWith(id) {
		setBusy(true);
		try {
			applyMerge(await mergeStationCuts({ data: {
				canonicalId: trackId,
				memberIds: [trackId, id]
			} }));
			setNeedle("");
		} catch (error) {
			fail(error);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "Treat as the same song"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Search another title or filename. Each station keeps one row. Files stay on R2."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "input mt-2",
				value: needle,
				onChange: (event) => setNeedle(event.target.value),
				placeholder: "Other title or filename"
			}),
			hits.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-1",
				children: hits.map((copy) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1 truncate text-sm",
						children: [copy.track.title, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-subtle",
							children: [" · ", copy.channel.name]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy,
						onClick: () => void mergeWith(copy.track.id),
						className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: "Merge"
					})]
				}, copy.track.id))
			}) : null
		]
	});
}
//#endregion
export { SongCopies as i, DeskDirectory as n, DownloadLink as r, AdminMergeBox as t };
