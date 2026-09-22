import { o as __toESM } from "../_runtime.mjs";
import { i as slugify, t as cn } from "./cn-BnEf6O0M.mjs";
import { a as getSeedCatalog, g as parseTags } from "./catalog-DmckmNNR.mjs";
import { C as require_jsx_runtime, W as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { y as usePlayerStore } from "./player-store-CdB40IHB.mjs";
import { i as fileLocationLabel, l as r2KeyFromAudioUrl, t as audioPathParts } from "./file-path-C0hfvhIH.mjs";
import { t as applyCatalogEdits } from "./catalog-edits-B7ACZ19x.mjs";
import { D as useRadioUser, J as patchStationTrack, N as deleteStationFile, Q as renameStationFile, R as hideStationTrack, m as directDeskUpload } from "./router-BjRk-_wL.mjs";
import { i as StationSettingsForm, n as FoldDetails, t as ArtUpload } from "./duration-probe-Cc9x2Byq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-track-tools-Jp5gX6Ea.js
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
	const [tags, setTags] = (0, import_react.useState)((track.tags ?? []).filter((tag) => !tag.startsWith("scene.v1.")).join(", "));
	const [publicSlug, setPublicSlug] = (0, import_react.useState)(track.slug ?? "");
	const [aliases, setAliases] = (0, import_react.useState)((track.aliases ?? []).join(", "));
	const [audioUrl, setAudioUrl] = (0, import_react.useState)(track.audioUrl);
	const [coverUrl, setCoverUrl] = (0, import_react.useState)(track.coverUrl ?? "");
	const [filename, setFilename] = (0, import_react.useState)(audioPathParts(track.audioUrl).filename);
	const [hint, setHint] = (0, import_react.useState)("");
	const next = usePlayerStore((s) => s.next);
	const playingId = usePlayerStore((s) => s.track?.id ?? null);
	if (isPending || !isAdmin) return null;
	const location = fileLocationLabel(track.audioUrl);
	const key = r2KeyFromAudioUrl(track.audioUrl);
	async function hide() {
		if (!window.confirm(`Remove “${track.title}” from this station? Other desks keep their copy. The file stays on R2.`)) return;
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
				tags: [...(track.tags ?? []).filter((tag) => tag.startsWith("scene.v1.")), ...parseTags(tags).filter((tag) => !tag.startsWith("scene.v1."))].join(", "),
				slug: slugify(publicSlug).slice(0, 80),
				aliases,
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
			const result = await directDeskUpload({
				kind: "audio",
				slug,
				file,
				trackId: track.id,
				coverUrl: coverUrl.trim() || void 0
			});
			if (result.tracks) applySnapshot(result.tracks, result.stations ?? [], playingId, next);
			if (result.object?.url) setAudioUrl(result.object.url);
			setHint(`Replaced with ${file.name}`);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Upload failed");
			setHint("");
		} finally {
			setBusy(null);
		}
	}
	async function renameFile() {
		const current = audioPathParts(track.audioUrl);
		const nextName = filename.trim();
		if (!nextName || nextName === current.filename) return;
		if (nextName.includes("..") || nextName.includes("/")) {
			window.alert("Use a file name, not a path. Folder stays the same.");
			return;
		}
		const toKey = `${current.folder ? `${current.folder}/` : ""}${nextName}`;
		if (!window.confirm(`Rename R2 object?\n${current.folder}/${current.filename}\n→ ${toKey}\n\nThe old key is copied then removed. Display title and public URL stay unless you change those too.`)) return;
		setBusy("rename");
		try {
			const result = await renameStationFile({ data: {
				channelSlug: slug,
				trackId: track.id,
				toKey
			} });
			applySnapshot(result.tracks, result.stations, playingId, next);
			if (result.object?.url) setAudioUrl(result.object.url);
			setHint(`File is now ${nextName}`);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Rename failed");
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
		title: "Remove this song from this station",
		"aria-label": `Remove ${track.title} from this station`,
		className: "playlist-remove",
		children: busy === "hide" ? "…" : "Remove"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "break-all font-mono text-[11px] text-subtle",
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
					placeholder: "Title shown on the site"
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
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: "Art URL"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "input mt-1",
							value: coverUrl,
							onChange: (event) => setCoverUrl(event.target.value),
							placeholder: "/covers/… or https://… jpg or mp4"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-sm text-muted",
							children: "Still under 2 MB or looping mp4 under 32 MB. Phone photos shrink on the way in. Plays on this song page only, not on every list thumbnail."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtUpload, {
					slug,
					trackId: track.id,
					current: coverUrl,
					onUrl: setCoverUrl
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FoldDetails, {
					title: "Public URLs",
					hint: "Edit",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
								children: "Public URL ending"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "input mt-1",
								value: publicSlug,
								onChange: (event) => setPublicSlug(event.target.value),
								placeholder: slugify(title) || "karma-7-hari-singh-ong-namo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-1 block font-mono text-[10px] text-subtle",
								children: ["/player/", slugify(publicSlug || title) || "…"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-sm text-muted",
								children: "Canonical player URL. Blank uses the song title. Same on both Radio hosts."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setPublicSlug(slugify(title)),
								className: "mt-1 inline-flex h-11 items-center font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
								children: "Use title"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
								children: "Aliases"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "input mt-1",
								value: aliases,
								onChange: (event) => setAliases(event.target.value),
								placeholder: "hari, gong"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block font-mono text-[10px] text-subtle",
								children: "radio.terrainfinity.ca/hari · radio.cyber-athens.ca/hari"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-sm text-muted",
								children: "Custom site endings without /player. Type hari or /hari. The address bar stays /hari — it does not bounce to the public /player/… URL. Comma-separated. Does not rename the file or the display title."
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FoldDetails, {
					title: "Audio file",
					hint: "Open",
					children: [
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
						key ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
									children: "R2 file name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "input mt-1",
									value: filename,
									onChange: (event) => setFilename(event.target.value),
									placeholder: "Karma 7 Hari Singh.mp3"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 block truncate font-mono text-[10px] text-subtle",
									children: audioPathParts(track.audioUrl).folder || "radio/"
								})
							]
						}) : null,
						key ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: Boolean(busy) || !r2Configured,
							onClick: () => void renameFile(),
							className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
							children: busy === "rename" ? "Renaming…" : "Rename file on R2"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block cursor-pointer rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
									children: "Replace audio file"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: r2Configured ? "Upload a new mp3 / wav / flac / m4a. The song keeps its id and tags." : "R2 keys are dark — paste a new URL above instead."
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
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: Boolean(busy),
						className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
						children: busy === "save" ? "Saving…" : "Save song"
					})
				}),
				hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: hint
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoldDetails, {
			title: "Remove or delete",
			hint: "Open",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
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
		})
	] });
}
function AdminStationEdit({ channel }) {
	const { isAdmin, isPending } = useRadioUser();
	if (isPending || !isAdmin) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationSettingsForm, {
		channel,
		compact: true
	}, channel.slug);
}
//#endregion
export { AdminTrackTools as n, AdminStationEdit as t };
