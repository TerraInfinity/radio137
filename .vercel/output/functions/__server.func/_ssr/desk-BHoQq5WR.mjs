import { o as __toESM } from "../_runtime.mjs";
import { a as getCatalog, c as getSeedCatalog, n as cn, r as formatClock } from "./cn-UVNI8J0o.mjs";
import { B as require_react, b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as r2KeyFromAudioUrl, t as fileLocationLabel } from "./file-path-B3HtxHuV.mjs";
import { _ as restoreStationTrack, a as ssoLoginHref, d as addStationTrack, f as deleteStationFile, g as listStationR2, h as hideStationTrack, o as useRadioUser, s as usePlayerStore } from "./router-ICW3tdWz.mjs";
import { t as applyCatalogEdits } from "./catalog-edits-yasvWDPz.mjs";
import { t as CoverArt } from "./cover-art-D1Z7wPOh.mjs";
import { t as ModePill } from "./mode-pill-CWxrT3wM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desk-BHoQq5WR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function applyEdits(edits) {
	usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), edits));
}
function DeskPage() {
	const { user, isAdmin, isPending, r2Configured } = useRadioUser();
	const catalog = usePlayerStore((s) => s.catalog);
	const channels = catalog.channels.length ? catalog.channels : getCatalog().channels;
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Station desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold tracking-tight",
				children: "Station desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted",
				children: "Checking the door."
			})
		]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskLocked, {});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Station desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold tracking-tight",
				children: "Clockwork desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-muted",
				children: [
					"Signed in as ",
					user.email,
					". This door is for C — career@terrainfinity.ca and c@cyber-athens.ca."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-8 inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
				children: "Back to stations"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "C · God desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold tracking-tight",
				children: "Station desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 max-w-prose text-muted",
				children: ["Open a station to add or drop cuts. Remove keeps the object on R2. Delete on R2 destroys the file.", r2Configured ? " R2 keys are live." : " Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY to list, upload, and delete objects."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationBoard, {
				channels,
				r2Configured
			})
		]
	});
}
function DeskLocked() {
	const href = ssoLoginHref("/desk");
	(0, import_react.useEffect)(() => {
		window.location.assign(href);
	}, [href]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Station desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold tracking-tight",
				children: "Unlock"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-muted",
				children: "C accounts sign in through the Terrainfinity hub. Google lives there — this radio only consumes the session."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href,
				className: "mt-8 inline-flex h-12 items-center rounded-md bg-fg px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-bg",
				children: "Sign in with Google"
			})
		]
	});
}
function StationBoard({ channels, r2Configured }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(null);
	const visible = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		return channels.filter((channel) => {
			if (!needle) return true;
			return `${channel.name} ${channel.slug} ${channel.energy}`.toLowerCase().includes(needle);
		});
	}, [channels, query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
					children: "Search desks"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input mt-1",
					value: query,
					onChange: (event) => setQuery(event.target.value),
					placeholder: "Name or slug"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
				children: "Station board"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-3",
				children: visible.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-filigree)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setOpen((current) => current === channel.slug ? null : channel.slug),
						className: "flex w-full items-center gap-3 p-3 text-left",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
								src: channel.cover,
								alt: "",
								className: "size-14 shrink-0 rounded-md"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate font-display text-xl font-semibold",
									children: channel.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
									children: [
										channel.slug,
										" · ",
										channel.tracks.filter((track) => track.enabled !== false).length,
										" cuts"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModePill, {
								kind: channel.kind,
								mode: channel.mode,
								enabled: channel.enabled,
								nsfw: channel.nsfw
							})
						]
					}), open === channel.slug ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskEditor, {
						channel,
						r2Configured
					}) : null]
				}, channel.slug))
			})
		]
	});
}
function DeskEditor({ channel, r2Configured }) {
	const [filter, setFilter] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)("");
	const [audioUrl, setAudioUrl] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const tracks = (0, import_react.useMemo)(() => {
		const needle = filter.trim().toLowerCase();
		return channel.tracks.filter((track) => {
			if (!needle) return true;
			return `${track.title} ${track.artist} ${track.audioUrl}`.toLowerCase().includes(needle);
		});
	}, [channel.tracks, filter]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-t border-line p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
				children: "Add a cut"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-2 flex flex-wrap gap-2",
				onSubmit: (event) => {
					event.preventDefault();
					if (!title.trim() || !audioUrl.trim()) return;
					setBusy(true);
					addStationTrack({ data: {
						channelSlug: channel.slug,
						title: title.trim(),
						audioUrl: audioUrl.trim(),
						coverUrl: channel.cover
					} }).then((result) => {
						applyEdits(result.edits);
						setTitle("");
						setAudioUrl("");
					}).catch((error) => window.alert(error instanceof Error ? error.message : "Add failed")).finally(() => setBusy(false));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input max-w-xs",
						value: title,
						onChange: (event) => setTitle(event.target.value),
						placeholder: "Title"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input min-w-64 flex-1",
						value: audioUrl,
						onChange: (event) => setAudioUrl(event.target.value),
						placeholder: "Audio URL (R2 or file)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: busy,
						className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
						children: "Add URL"
					})
				]
			}),
			r2Configured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadDrop, {
				slug: channel.slug,
				cover: channel.cover
			}) : null,
			r2Configured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(R2Picker, {
				slug: channel.slug,
				cover: channel.cover
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
				children: "Connect R2 to upload and list folders. You can still paste audio URLs."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
				children: "Tracks"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "input mt-2",
				value: filter,
				onChange: (event) => setFilter(event.target.value),
				placeholder: "Filter files"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 divide-y divide-line",
				children: tracks.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskTrackRow, {
					channel,
					track,
					r2Configured
				}, track.id))
			})
		]
	});
}
function UploadDrop({ slug, cover }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [hint, setHint] = (0, import_react.useState)("");
	async function send(file) {
		setBusy(true);
		setHint(`Uploading ${file.name}…`);
		try {
			const body = new FormData();
			body.set("slug", slug);
			body.set("coverUrl", cover);
			body.set("file", file);
			const res = await fetch("/api/desk/upload", {
				method: "POST",
				body
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json.error || "Upload failed");
			if (json.edits) applyEdits(json.edits);
			setHint(`Added ${file.name}`);
		} catch (error) {
			setHint(error instanceof Error ? error.message : "Upload failed");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "mt-3 block cursor-pointer rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "Upload to R2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: hint || "Drop an mp3 (or wav/flac/m4a) onto this station folder."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "file",
				accept: "audio/mpeg,audio/wav,audio/flac,audio/mp4,audio/ogg,audio/aac,.mp3,.wav,.flac,.m4a,.ogg,.aac",
				disabled: busy,
				className: "mt-2 block w-full text-sm text-muted file:mr-3 file:h-11 file:rounded-md file:border-0 file:bg-fg file:px-3 file:font-mono file:text-[11px] file:uppercase file:tracking-[0.14em] file:text-bg",
				onChange: (event) => {
					const file = event.target.files?.[0];
					event.target.value = "";
					if (file) send(file);
				}
			})
		]
	});
}
function DeskTrackRow({ channel, track, r2Configured }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const location = fileLocationLabel(track.audioUrl);
	const key = r2KeyFromAudioUrl(track.audioUrl);
	const hidden = track.enabled === false;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: cn("flex flex-wrap items-start gap-2 py-3", hidden && "opacity-50"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-display text-lg",
						children: track.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm text-muted",
						children: track.artist
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 break-all font-mono text-[11px] text-subtle",
						title: track.audioUrl,
						children: location
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[11px] tabular-nums text-subtle",
				children: formatClock(track.durationSec)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-1",
				children: [hidden ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy,
					onClick: () => {
						setBusy(true);
						restoreStationTrack({ data: {
							channelSlug: channel.slug,
							trackId: track.id
						} }).then((result) => applyEdits(result.edits)).catch((error) => window.alert(error instanceof Error ? error.message : "Restore failed")).finally(() => setBusy(false));
					},
					className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
					children: "Restore"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy,
					onClick: () => {
						if (!window.confirm(`Remove “${track.title}” from ${channel.name}? File stays on R2.`)) return;
						setBusy(true);
						hideStationTrack({ data: {
							channelSlug: channel.slug,
							trackId: track.id,
							audioUrl: track.audioUrl
						} }).then((result) => applyEdits(result.edits)).catch((error) => window.alert(error instanceof Error ? error.message : "Remove failed")).finally(() => setBusy(false));
					},
					className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
					children: "Remove"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy || !r2Configured || !key,
					onClick: () => {
						if (!key) return;
						if (!window.confirm(`Permanently delete on R2?\n${key}`)) return;
						setBusy(true);
						deleteStationFile({ data: {
							channelSlug: channel.slug,
							trackId: track.id,
							audioUrl: track.audioUrl,
							r2Key: key,
							alsoDeleteR2: true
						} }).then((result) => applyEdits(result.edits)).catch((error) => window.alert(error instanceof Error ? error.message : "R2 delete failed")).finally(() => setBusy(false));
					},
					className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ember",
					children: "Delete on R2"
				})]
			})
		]
	});
}
function R2Picker({ slug, cover }) {
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [error, setError] = (0, import_react.useState)("");
	const [objects, setObjects] = (0, import_react.useState)([]);
	const [prefix, setPrefix] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setStatus("loading");
		listStationR2({ data: { slug } }).then((result) => {
			setPrefix(result.prefix);
			setObjects(result.objects);
			setStatus(result.ok ? "ready" : "error");
			setError(result.ok ? "" : result.error || "Could not list folders.");
		}).catch((err) => {
			setStatus("error");
			setError(err instanceof Error ? err.message : "Could not list folders.");
		});
	}, [slug]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: ["Explorer · ", prefix || `radio/${slug}/`]
			}),
			status === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Listing…"
			}) : null,
			status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-ember",
				children: error
			}) : null,
			status === "ready" && objects.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "No audio in this prefix, or still reading."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 max-h-64 space-y-1 overflow-y-auto",
				children: objects.map((object) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-0 flex-1 truncate font-mono text-[11px] text-subtle",
						children: object.key
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							const title = object.key.split("/").pop()?.replace(/\.[^.]+$/, "") || object.key;
							addStationTrack({ data: {
								channelSlug: slug,
								title,
								audioUrl: object.url,
								coverUrl: cover,
								r2Key: object.key
							} }).then((result) => applyEdits(result.edits)).catch((err) => window.alert(err instanceof Error ? err.message : "Import failed"));
						},
						className: "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: "Import"
					})]
				}, object.key))
			})
		]
	});
}
//#endregion
export { DeskPage as component };
