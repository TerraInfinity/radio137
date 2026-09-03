import { o as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getSeedCatalog, g as usePlayerStore, l as kindHint, p as normalizeKind, t as applyCatalogEdits, u as kindLabel } from "./player-store-Dz5TRk6B.mjs";
import { t as cn } from "./cn-CyOQLR37.mjs";
import { r as r2KeyFromAudioUrl, t as fileLocationLabel } from "./file-path-B3HtxHuV.mjs";
import { a as useRadioUser, f as hideStationTrack, h as patchStationTrack, l as deleteStationFile, s as addStationTrack, y as saveStation } from "./router-DCyqcLgO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-track-tools-Dohd-T5g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function applySnapshot(tracks, stations, playingId, next) {
	const catalog = applyCatalogEdits(getSeedCatalog(), tracks, stations);
	usePlayerStore.getState().replaceCatalog(catalog);
	const still = catalog.channels.flatMap((channel) => channel.tracks).find((track) => track.id === playingId && track.enabled !== false);
	if (playingId && !still) next();
}
function AdminTrackTools({ slug, track, compact = false }) {
	const { isAdmin, r2Configured, isPending } = useRadioUser();
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [title, setTitle] = (0, import_react.useState)(track.title);
	const [artist, setArtist] = (0, import_react.useState)(track.artist);
	const next = usePlayerStore((s) => s.next);
	const playingId = usePlayerStore((s) => s.track?.id ?? null);
	if (isPending || !isAdmin) return null;
	const location = fileLocationLabel(track.audioUrl);
	const key = r2KeyFromAudioUrl(track.audioUrl);
	async function hide() {
		if (!window.confirm(`Remove “${track.title}” from this station? The file stays on R2.`)) return;
		setBusy("hide");
		try {
			const result = await hideStationTrack({ data: {
				channelSlug: slug,
				trackId: track.id,
				audioUrl: track.audioUrl
			} });
			applySnapshot(result.tracks, result.stations, playingId, next);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Could not remove");
		} finally {
			setBusy(null);
		}
	}
	async function destroy() {
		if (!key) {
			window.alert("No R2 key on this file.");
			return;
		}
		if (!window.confirm(`Permanently delete this file from R2?\n${key}`)) return;
		setBusy("r2");
		try {
			const result = await deleteStationFile({ data: {
				channelSlug: slug,
				trackId: track.id,
				audioUrl: track.audioUrl,
				r2Key: key,
				alsoDeleteR2: true
			} });
			applySnapshot(result.tracks, result.stations, playingId, next);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Could not delete from R2");
		} finally {
			setBusy(null);
		}
	}
	async function saveMeta() {
		setBusy("save");
		try {
			const result = await patchStationTrack({ data: {
				channelSlug: slug,
				trackId: track.id,
				title: title.trim() || track.title,
				artist: artist.trim() || track.artist
			} });
			applySnapshot(result.tracks, result.stations, playingId, next);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Could not save");
		} finally {
			setBusy(null);
		}
	}
	if (compact) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		disabled: Boolean(busy),
		onClick: (event) => {
			event.preventDefault();
			event.stopPropagation();
			hide();
		},
		className: "inline-flex h-7 items-center px-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-gold",
		children: busy === "hide" ? "…" : "Remove"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "C desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 break-all font-mono text-[11px] text-subtle",
				title: track.audioUrl,
				children: location
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-3 grid gap-2 sm:grid-cols-2",
				onSubmit: (event) => {
					event.preventDefault();
					saveMeta();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input",
						value: title,
						onChange: (event) => setTitle(event.target.value),
						placeholder: "Title"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input",
						value: artist,
						onChange: (event) => setArtist(event.target.value),
						placeholder: "Artist"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: Boolean(busy),
							className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
							children: busy === "save" ? "Saving…" : "Save details"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: Boolean(busy),
					onClick: () => void hide(),
					className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
					children: busy === "hide" ? "Removing…" : "Remove from station"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: Boolean(busy) || !r2Configured,
					onClick: () => void destroy(),
					className: cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", r2Configured ? "text-ember" : "text-subtle"),
					children: busy === "r2" ? "Deleting…" : "Delete on R2"
				})]
			})
		]
	});
}
function AdminAddTrack({ slug, cover }) {
	const { isAdmin, isPending } = useRadioUser();
	const [title, setTitle] = (0, import_react.useState)("");
	const [audioUrl, setAudioUrl] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending || !isAdmin) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-4 flex flex-wrap gap-2 px-3 pb-3",
		onSubmit: (event) => {
			event.preventDefault();
			if (!title.trim() || !audioUrl.trim()) return;
			setBusy(true);
			addStationTrack({ data: {
				channelSlug: slug,
				title: title.trim(),
				audioUrl: audioUrl.trim(),
				coverUrl: cover
			} }).then((result) => {
				usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
				setTitle("");
				setAudioUrl("");
			}).catch((error) => window.alert(error instanceof Error ? error.message : "Could not add")).finally(() => setBusy(false));
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "input max-w-xs",
				value: title,
				onChange: (event) => setTitle(event.target.value),
				placeholder: "Title"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "input max-w-md",
				value: audioUrl,
				onChange: (event) => setAudioUrl(event.target.value),
				placeholder: "https://r2.terrainfinity.ca/radio/…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				disabled: busy,
				className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
				children: busy ? "Adding…" : "Add to station"
			})
		]
	});
}
function AdminStationEdit({ channel }) {
	const { isAdmin, isPending } = useRadioUser();
	const [kind, setKind] = (0, import_react.useState)(normalizeKind(channel.kind || channel.mode));
	const [featured, setFeatured] = (0, import_react.useState)(Boolean(channel.featured));
	const [rank, setRank] = (0, import_react.useState)(String(channel.featuredRank ?? 99));
	const [name, setName] = (0, import_react.useState)(channel.name);
	const [description, setDescription] = (0, import_react.useState)(channel.description);
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending || !isAdmin) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-4 rounded-xl bg-bg-elevated p-3 shadow-[var(--shadow-filigree)]",
		onSubmit: (event) => {
			event.preventDefault();
			setBusy(true);
			const featuredRank = Number.parseInt(rank, 10);
			saveStation({ data: {
				slug: channel.slug,
				name: name.trim() || channel.name,
				description,
				kind,
				featured,
				featuredRank: Number.isFinite(featuredRank) ? featuredRank : 99
			} }).then((result) => {
				usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
			}).catch((error) => window.alert(error instanceof Error ? error.message : "Save failed")).finally(() => setBusy(false));
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "C · Station"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "input mt-3",
				value: name,
				onChange: (event) => setName(event.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				className: "input mt-2",
				value: description,
				onChange: (event) => setDescription(event.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					"live",
					"ondemand",
					"fixed"
				].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", kind === value ? "bg-fg text-bg" : "text-gold"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "radio",
						className: "sr-only",
						name: "kind",
						checked: kind === value,
						onChange: () => setKind(value)
					}), kindLabel(value)]
				}, value))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: kindHint(kind)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: featured,
						onChange: (event) => setFeatured(event.target.checked)
					}), "Featured rail"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
					children: ["Rank", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input w-20",
						inputMode: "numeric",
						value: rank,
						onChange: (event) => setRank(event.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: busy,
					className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
					children: busy ? "Saving…" : "Save station"
				})
			})
		]
	});
}
//#endregion
export { AdminStationEdit as n, AdminTrackTools as r, AdminAddTrack as t };
