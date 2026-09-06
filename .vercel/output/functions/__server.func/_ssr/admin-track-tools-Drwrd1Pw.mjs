import { o as __toESM } from "../_runtime.mjs";
import { a as getSeedCatalog, m as parseTags } from "./catalog-BcaLbP39.mjs";
import { t as applyCatalogEdits } from "./catalog-edits-BhjK6UvC.mjs";
import { B as require_react, V as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as r2KeyFromAudioUrl, n as fileLocationLabel } from "./file-path-PXlvogCB.mjs";
import { r as getBearerToken } from "./client-BwJvEzbV.mjs";
import { H as usePlayerStore, c as useRadioUser, f as deleteStationFile, g as hideStationTrack, u as addStationTrack, x as patchStationTrack, z as cn } from "./router-Cp-QOkSx.mjs";
import { t as StationSettingsForm } from "./station-settings-C6eJKO8j.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-track-tools-Drwrd1Pw.js
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
	const [tags, setTags] = (0, import_react.useState)((track.tags ?? []).join(", "));
	const [audioUrl, setAudioUrl] = (0, import_react.useState)(track.audioUrl);
	const [coverUrl, setCoverUrl] = (0, import_react.useState)(track.coverUrl ?? "");
	const [hint, setHint] = (0, import_react.useState)("");
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
				artist: artist.trim() || track.artist,
				tags: parseTags(tags).join(", "),
				audioUrl: audioUrl.trim() || track.audioUrl,
				coverUrl: coverUrl.trim() || void 0
			} });
			applySnapshot(result.tracks, result.stations, playingId, next);
			setHint("Saved");
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Could not save");
		} finally {
			setBusy(null);
		}
	}
	async function replaceFile(file) {
		setBusy("file");
		setHint(`Uploading ${file.name}…`);
		try {
			const body = new FormData();
			body.set("slug", slug);
			body.set("trackId", track.id);
			body.set("file", file);
			if (coverUrl.trim()) body.set("coverUrl", coverUrl.trim());
			const token = getBearerToken();
			const res = await fetch("/api/desk/upload", {
				method: "POST",
				body,
				credentials: "include",
				headers: token ? { Authorization: `Bearer ${token}` } : void 0
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json.error || "Upload failed");
			if (json.tracks) applySnapshot(json.tracks, json.stations ?? [], playingId, next);
			if (json.object?.url) setAudioUrl(json.object.url);
			setHint(`Replaced with ${file.name}`);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Upload failed");
			setHint("");
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
		className: "mt-8 rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "C desk · this cut"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 break-all font-mono text-[11px] text-subtle",
				title: track.audioUrl,
				children: location
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 space-y-3",
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: "Tags"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "input mt-1",
							value: tags,
							onChange: (event) => setTags(event.target.value),
							placeholder: "glados, sting, voice"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: "Cover URL"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "input mt-1",
							value: coverUrl,
							onChange: (event) => setCoverUrl(event.target.value),
							placeholder: "/covers/… or https://"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: "Audio file URL"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "input mt-1",
							value: audioUrl,
							onChange: (event) => setAudioUrl(event.target.value),
							placeholder: "https://r2.terrainfinity.ca/radio/…"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: Boolean(busy),
						className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
						children: busy === "save" ? "Saving…" : "Save cut"
					}),
					hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: hint
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-4 block cursor-pointer rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
						children: "Replace audio file"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: r2Configured ? "Upload a new mp3 / wav / flac / m4a. The cut keeps its id and tags." : "R2 keys are dark — paste a new URL above instead."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						accept: "audio/mpeg,audio/wav,audio/flac,audio/mp4,audio/ogg,audio/aac,.mp3,.wav,.flac,.m4a,.ogg,.aac",
						disabled: Boolean(busy) || !r2Configured,
						className: "mt-2 block w-full text-sm text-muted file:mr-3 file:h-11 file:rounded-md file:border-0 file:bg-fg file:px-3 file:font-mono file:text-[11px] file:uppercase file:tracking-[0.14em] file:text-bg",
						onChange: (event) => {
							const file = event.target.files?.[0];
							event.target.value = "";
							if (file) replaceFile(file);
						}
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
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
	if (isPending || !isAdmin) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationSettingsForm, { channel }, channel.slug)
	});
}
//#endregion
export { AdminStationEdit as n, AdminTrackTools as r, AdminAddTrack as t };
