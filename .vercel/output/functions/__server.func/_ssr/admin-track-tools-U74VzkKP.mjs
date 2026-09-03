import { o as __toESM } from "../_runtime.mjs";
import { c as getSeedCatalog, n as cn } from "./cn-UVNI8J0o.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as r2KeyFromAudioUrl, t as fileLocationLabel } from "./file-path-B3HtxHuV.mjs";
import { d as addStationTrack, f as deleteStationFile, h as hideStationTrack, o as useRadioUser, s as usePlayerStore } from "./router-ICW3tdWz.mjs";
import { t as applyCatalogEdits } from "./catalog-edits-yasvWDPz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-track-tools-U74VzkKP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function applyEditsAndMaybeSkip(edits, playingId, next) {
	const catalog = applyCatalogEdits(getSeedCatalog(), edits);
	usePlayerStore.getState().replaceCatalog(catalog);
	const still = catalog.channels.flatMap((channel) => channel.tracks).find((track) => track.id === playingId && track.enabled !== false);
	if (playingId && !still) next();
}
function AdminTrackTools({ slug, track, compact = false }) {
	const { isAdmin, r2Configured, isPending } = useRadioUser();
	const [busy, setBusy] = (0, import_react.useState)(null);
	const next = usePlayerStore((s) => s.next);
	const playingId = usePlayerStore((s) => s.track?.id ?? null);
	if (isPending || !isAdmin) return null;
	const location = fileLocationLabel(track.audioUrl);
	const key = r2KeyFromAudioUrl(track.audioUrl);
	async function hide() {
		if (!window.confirm(`Remove “${track.title}” from this station? The file stays on R2.`)) return;
		setBusy("hide");
		try {
			applyEditsAndMaybeSkip((await hideStationTrack({ data: {
				channelSlug: slug,
				trackId: track.id,
				audioUrl: track.audioUrl
			} })).edits, playingId, next);
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
		if (!window.confirm(`Permanently delete this file from R2?\n${key}\nIt will drop off every station that points at it.`)) return;
		setBusy("r2");
		try {
			applyEditsAndMaybeSkip((await deleteStationFile({ data: {
				channelSlug: slug,
				trackId: track.id,
				audioUrl: track.audioUrl,
				r2Key: key,
				alsoDeleteR2: true
			} })).edits, playingId, next);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Could not delete from R2");
		} finally {
			setBusy(null);
		}
	}
	if (compact) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "flex shrink-0 items-center gap-1",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			disabled: Boolean(busy),
			onClick: (event) => {
				event.preventDefault();
				event.stopPropagation();
				hide();
			},
			className: "inline-flex h-7 items-center px-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-gold",
			children: busy === "hide" ? "…" : "Remove"
		})
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
					title: r2Configured ? "Delete the object on R2" : "Set R2 keys to delete objects",
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
				usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.edits));
				setTitle("");
				setAudioUrl("");
			}).catch((error) => {
				window.alert(error instanceof Error ? error.message : "Could not add");
			}).finally(() => setBusy(false));
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
//#endregion
export { AdminTrackTools as n, AdminAddTrack as t };
