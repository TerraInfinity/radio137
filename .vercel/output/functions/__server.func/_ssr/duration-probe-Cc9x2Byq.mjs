import { o as __toESM } from "../_runtime.mjs";
import { i as isLoopingVisual, o as mediaUrl, r as MEDIA_MAX_VIDEO } from "./media-ChlF6fRc.mjs";
import { i as slugify, t as cn } from "./cn-BnEf6O0M.mjs";
import { E as durationGeneration, F as subscribeDurations, M as rememberDuration, O as hasMeasuredDuration, P as slotDuration, S as shuffleLabel, a as getSeedCatalog, d as kindHint, f as kindLabel, h as normalizeShuffle, m as normalizeKind, x as shuffleHint } from "./catalog-DmckmNNR.mjs";
import { C as require_jsx_runtime, W as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as isFiniteAudioUrl, y as usePlayerStore } from "./player-store-CdB40IHB.mjs";
import { l as isStubDuration } from "./catalog-edits.server-KLXNzPRk.mjs";
import { t as applyCatalogEdits } from "./catalog-edits-B7ACZ19x.mjs";
import { D as useRadioUser, _ as CoverArt, g as PhoneArtPicker, h as prepareArtFile, m as directDeskUpload, nt as saveStation } from "./router-BjRk-_wL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/duration-probe-Cc9x2Byq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ArtUpload({ slug, trackId, current, onUrl }) {
	const { r2Configured, isAdmin, isPending } = useRadioUser();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [hint, setHint] = (0, import_react.useState)("");
	if (isPending || !isAdmin) return null;
	async function upload(file) {
		setBusy(true);
		setHint(`Preparing ${file.name || "file"}…`);
		try {
			const ready = await prepareArtFile(file);
			setHint(`Uploading ${ready.name}…`);
			const result = await directDeskUpload({
				kind: "art",
				slug,
				file: ready,
				trackId
			});
			if (result.tracks) usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations ?? []));
			const kind = result.kind === "video" || isLoopingVisual(result.object.url) ? "video" : "image";
			onUrl?.(result.object.url, kind);
			setHint(kind === "video" ? "Looping video saved" : "Photo saved");
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Upload failed");
			setHint("");
		} finally {
			setBusy(false);
		}
	}
	const mb = Math.round(MEDIA_MAX_VIDEO / 1048576);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			current ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
				src: current,
				alt: "",
				className: "h-28 w-full rounded-lg",
				motion: "loop"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
						children: "Upload art"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: r2Configured ? `Photos, HEIC, or a looping clip under ${mb} MB. Cards and the station page both play motion.` : "R2 keys are dark — paste a URL instead."
					}),
					r2Configured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneArtPicker, {
							disabled: busy,
							onFile: (file) => void upload(file),
							label: busy ? "Working…" : "Choose file"
						})
					}) : null
				]
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: hint
			}) : null
		]
	});
}
function foldKey(id) {
	return `radio.desk.fold.${id}`;
}
/** Advanced blocks start closed so the page stays a listen surface. */
function FoldSection({ title, hint = "Open", defaultOpen = false, persist, children, className, titleClassName }) {
	const [open, setOpen] = (0, import_react.useState)(defaultOpen);
	(0, import_react.useEffect)(() => {
		if (!persist) return;
		try {
			const value = window.localStorage.getItem(foldKey(persist));
			if (value === "1") setOpen(true);
			if (value === "0") setOpen(false);
		} catch {}
	}, [persist]);
	function toggle() {
		setOpen((value) => {
			const next = !value;
			if (persist) try {
				window.localStorage.setItem(foldKey(persist), next ? "1" : "0");
			} catch {}
			return next;
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("mt-6 overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-border)]", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: toggle,
			"aria-expanded": open,
			className: "flex h-12 w-full items-center justify-between gap-3 px-3 text-left",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-subtle", titleClassName),
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-gold",
				children: open ? "Close" : hint
			})]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-line p-3",
			children
		}) : null]
	});
}
/** Nested disclosure for forms already inside a card — no second chrome. */
function FoldDetails({ title, hint = "Open", defaultOpen = false, persist, children }) {
	const [open, setOpen] = (0, import_react.useState)(defaultOpen);
	(0, import_react.useEffect)(() => {
		if (!persist) return;
		try {
			const value = window.localStorage.getItem(foldKey(persist));
			if (value === "1") setOpen(true);
			if (value === "0") setOpen(false);
		} catch {}
	}, [persist]);
	function toggle() {
		setOpen((value) => {
			const next = !value;
			if (persist) try {
				window.localStorage.setItem(foldKey(persist), next ? "1" : "0");
			} catch {}
			return next;
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: toggle,
			"aria-expanded": open,
			className: "flex h-11 w-full items-center justify-between gap-3 text-left",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-gold",
				children: open ? "Close" : hint
			})]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3 border-t border-line pt-3",
			children
		}) : null]
	});
}
function applySnapshot(tracks, stations) {
	usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}
function StationSettingsForm({ channel, compact = false }) {
	const [name, setName] = (0, import_react.useState)(channel.name);
	const [description, setDescription] = (0, import_react.useState)(channel.description);
	const [kind, setKind] = (0, import_react.useState)(normalizeKind(channel.kind || channel.mode));
	const [shuffle, setShuffle] = (0, import_react.useState)(normalizeShuffle(channel.shuffle));
	const [category, setCategory] = (0, import_react.useState)(channel.category ?? "");
	const [energy, setEnergy] = (0, import_react.useState)(channel.energy ?? "");
	const [tags, setTags] = (0, import_react.useState)(channel.tags.filter((tag) => !tag.startsWith("look.v1.") && !tag.startsWith("xp.v1.")).join(", "));
	const [cover, setCover] = (0, import_react.useState)(channel.cover ?? "");
	const [motion, setMotion] = (0, import_react.useState)(channel.videoUrl || channel.animationUrl || "");
	const [publicSlug, setPublicSlug] = (0, import_react.useState)(channel.publicSlug ?? "");
	const [aliases, setAliases] = (0, import_react.useState)((channel.aliases ?? []).join(", "));
	const [nsfw, setNsfw] = (0, import_react.useState)(Boolean(channel.nsfw));
	const [claimable, setClaimable] = (0, import_react.useState)(Boolean(channel.claimable));
	const [featured, setFeatured] = (0, import_react.useState)(Boolean(channel.featured));
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: cn("space-y-3", compact ? "" : "rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]"),
		onSubmit: (event) => {
			event.preventDefault();
			setBusy(true);
			saveStation({ data: {
				slug: channel.slug,
				name: name.trim() || channel.name,
				description,
				kind,
				shuffle,
				category: category.trim() || void 0,
				energy: energy.trim() || void 0,
				tags: [...channel.tags.filter((tag) => tag.startsWith("look.v1.") || tag.startsWith("xp.v1.")), ...tags.split(/[,;]+/).map((item) => item.trim()).filter((item) => item && !item.startsWith("look.v1.") && !item.startsWith("xp.v1."))].join(", ") || void 0,
				cover: cover.trim() || void 0,
				animationUrl: motion.trim() || void 0,
				videoUrl: motion.trim() || void 0,
				publicSlug,
				aliases,
				nsfw,
				claimable,
				featured
			} }).then((result) => applySnapshot(result.tracks, result.stations)).catch((error) => window.alert(error instanceof Error ? error.message : "Save failed")).finally(() => setBusy(false));
		},
		children: [
			compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "C desk · this station"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "input",
				value: name,
				onChange: (event) => setName(event.target.value),
				placeholder: "Name shown on the site"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				className: "input",
				value: description,
				onChange: (event) => setDescription(event.target.value),
				placeholder: "Description"
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
							placeholder: channel.slug
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-1 block font-mono text-[10px] text-subtle",
							children: ["/channel/", slugify(publicSlug) || channel.slug]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-sm text-muted",
							children: "Canonical station URL. Blank keeps the internal slug. Same on both Radio hosts."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setPublicSlug(slugify(name) || channel.slug),
							className: "mt-1 inline-flex h-11 items-center font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
							children: "Use name"
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
							placeholder: "glaum, gong"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block font-mono text-[10px] text-subtle",
							children: "radio.terrainfinity.ca/glaum · radio.cyber-athens.ca/glaum"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-sm text-muted",
							children: "Custom site endings without /channel. Type glaum or /glaum. The address bar stays /glaum. Comma-separated. Must not collide with a song alias or another station."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
					children: "Type"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: [
						"live",
						"ondemand",
						"fixed"
					].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", kind === value ? "bg-fg text-bg" : "text-gold"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "radio",
							className: "sr-only",
							checked: kind === value,
							onChange: () => setKind(value)
						}), kindLabel(value)]
					}, value))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: kindHint(kind)
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
					children: "Shuffle"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: [
						"off",
						"optional",
						"on"
					].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", shuffle === value ? "bg-fg text-bg" : "text-gold"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "radio",
							className: "sr-only",
							checked: shuffle === value,
							onChange: () => setShuffle(value)
						}), shuffleLabel(value)]
					}, value))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: shuffleHint(shuffle)
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
						children: "Category"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input mt-1",
						value: category,
						onChange: (event) => setCategory(event.target.value),
						placeholder: "Temple, frequency…"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
						children: "Energy"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input mt-1",
						value: energy,
						onChange: (event) => setEnergy(event.target.value),
						placeholder: "clock, start to finish…"
					})]
				})]
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
					placeholder: "comma separated"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
						children: "Cover URL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input mt-1",
						value: cover,
						onChange: (event) => setCover(event.target.value),
						placeholder: "https://… jpg / png / webp"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm text-muted",
						children: "Still poster for the card. Used if motion is empty, and as the video poster when both are set."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
						children: "Animation / video URL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input mt-1",
						value: motion,
						onChange: (event) => setMotion(event.target.value),
						placeholder: "https://… mp4 / webm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm text-muted",
						children: "Muted looping clip on the home card and station hero. Overlays stay on top."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtUpload, {
				slug: channel.slug,
				current: motion || cover,
				onUrl: (url, kind) => {
					if (kind === "video") setMotion(url);
					else setCover(url);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: featured,
							onChange: (event) => setFeatured(event.target.checked)
						}), "Featured"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: claimable,
							onChange: (event) => setClaimable(event.target.checked)
						}), "DJ booth"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: nsfw,
							onChange: (event) => setNsfw(event.target.checked)
						}), "18+"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				disabled: busy,
				className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
				children: busy ? "Saving…" : "Save settings"
			})
		]
	});
}
/** Read real file length from metadata. Catalog slots are often 8s (stings) or 60s (desk add). */
var queued = [];
var pending = /* @__PURE__ */ new Set();
var pumping = false;
function needsDurationProbe(track) {
	if (hasMeasuredDuration(track.id)) return false;
	if (!isFiniteAudioUrl(track.audioUrl)) return false;
	const slot = slotDuration(track);
	return isStubDuration(slot);
}
function probeAudioDuration(src) {
	return new Promise((resolve, reject) => {
		if (typeof window === "undefined" || typeof Audio === "undefined") {
			reject(/* @__PURE__ */ new Error("no audio"));
			return;
		}
		const el = new Audio();
		el.preload = "metadata";
		const objectUrl = src instanceof File ? URL.createObjectURL(src) : "";
		const url = src instanceof File ? objectUrl : mediaUrl(src);
		let settled = false;
		const finish = (err, value) => {
			if (settled) return;
			settled = true;
			el.removeEventListener("loadedmetadata", onMeta);
			el.removeEventListener("error", onErr);
			window.clearTimeout(timer);
			el.removeAttribute("src");
			try {
				el.load();
			} catch {}
			if (objectUrl) URL.revokeObjectURL(objectUrl);
			if (err || !(value && Number.isFinite(value))) reject(err ?? /* @__PURE__ */ new Error("no duration"));
			else resolve(value);
		};
		const onMeta = () => {
			const duration = el.duration;
			if (Number.isFinite(duration) && duration > .2) finish(void 0, duration);
			else finish(/* @__PURE__ */ new Error("empty duration"));
		};
		const onErr = () => finish(/* @__PURE__ */ new Error("probe failed"));
		const timer = window.setTimeout(() => finish(/* @__PURE__ */ new Error("probe timeout")), 8e3);
		el.addEventListener("loadedmetadata", onMeta, { once: true });
		el.addEventListener("error", onErr, { once: true });
		el.src = url;
		el.load();
	});
}
function pump() {
	if (pumping) return;
	const track = queued.shift();
	if (!track) return;
	pumping = true;
	pending.add(track.id);
	probeAudioDuration(track.audioUrl).then((seconds) => rememberDuration(track.id, seconds)).catch(() => {}).finally(() => {
		pending.delete(track.id);
		pumping = false;
		if (queued.length) window.setTimeout(pump, 120);
	});
}
function requestDurations(tracks) {
	if (typeof window === "undefined") return;
	for (const track of tracks) {
		if (!needsDurationProbe(track)) continue;
		if (pending.has(track.id)) continue;
		if (queued.some((item) => item.id === track.id)) continue;
		queued.push(track);
	}
	pump();
}
function useDurationClock(tracks) {
	const generation = (0, import_react.useSyncExternalStore)(subscribeDurations, durationGeneration, durationGeneration);
	const key = tracks.map((track) => track.id).join("|");
	(0, import_react.useEffect)(() => {
		requestDurations(tracks);
	}, [key, tracks]);
	return generation;
}
//#endregion
export { probeAudioDuration as a, StationSettingsForm as i, FoldDetails as n, useDurationClock as o, FoldSection as r, ArtUpload as t };
