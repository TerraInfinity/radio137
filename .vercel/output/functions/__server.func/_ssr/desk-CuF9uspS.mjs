import { o as __toESM } from "../_runtime.mjs";
import { o as mediaUrl } from "./media-ChlF6fRc.mjs";
import { i as slugify, r as formatClock, t as cn } from "./cn-BnEf6O0M.mjs";
import { c as songKey } from "./song-url-BbYrVN1D.mjs";
import { D as durationOf, a as getSeedCatalog, d as kindHint, f as kindLabel, i as getPlayableTracks, m as normalizeKind, n as getCatalog } from "./catalog-DmckmNNR.mjs";
import { f as parsePhenomenon, h as sceneFromTags, o as lookForTrack, p as phenomenonAt, s as lookFromStation, t as PHENOMENA, u as mergeSceneTags } from "./phenomena-DIQMhlVR.mjs";
import { C as require_jsx_runtime, W as require_react, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as mergeXpTags, b as xpFromTags, m as listExperiences, s as experienceFromChannel, y as usePlayerStore } from "./player-store-CdB40IHB.mjs";
import { i as fileLocationLabel, l as r2KeyFromAudioUrl, n as buildDeskKeyIndex, o as formatBytes, r as desksForKey, s as isAudioKey, t as audioPathParts, u as titleFromR2Key } from "./file-path-C0hfvhIH.mjs";
import { t as applyCatalogEdits } from "./catalog-edits-B7ACZ19x.mjs";
import { r as copiesOf } from "./cuts-DHoBzPwa.mjs";
import { G as ArrowDown, U as ArrowUp, W as ArrowUpDown, a as Upload, h as Search, k as Link2, s as Trash2, v as Plus } from "../_libs/lucide-react.mjs";
import { $ as reorderStationTracks, A as addStationTrack, B as importR2Tracks, D as useRadioUser, F as dismissReviewItemFn, G as mergeStationCuts, H as listReviewQueue, J as patchStationTrack, M as deleteR2Object, N as deleteStationFile, R as hideStationTrack, U as listStationR2, X as placeStationTrack, Y as pingServices, Z as rehomeReviewItemFn, _ as CoverArt, et as restoreReviewItemFn, m as directDeskUpload, nt as saveStation, q as moveR2Object, rt as setFeaturedRail, tt as restoreStationTrack } from "./router-BjRk-_wL.mjs";
import { a as probeAudioDuration, i as StationSettingsForm, n as FoldDetails, r as FoldSection } from "./duration-probe-Cc9x2Byq.mjs";
import { t as SignInChoices } from "./sign-in-choices-_CiJYAa3.mjs";
import { t as ModePill } from "./mode-pill-XIKjkTPl.mjs";
import { n as ghostDropIds, t as GhostCleaner } from "./ghost-cleaner-DB9pD8oZ.mjs";
import { n as DeskDirectory } from "./desk-directory-Dy2xgkhk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desk-CuF9uspS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var r2Cache = /* @__PURE__ */ new Map();
var R2_TTL = 12e4;
function applySnapshot$3(tracks, stations) {
	usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}
function fail$2(error) {
	window.alert(error instanceof Error ? error.message : "Desk save failed");
}
async function loadR2Prefix(prefix, maxKeys = 800) {
	const cacheKey = `${prefix}#${maxKeys}`;
	const hit = r2Cache.get(cacheKey) ?? r2Cache.get(prefix);
	if (hit && Date.now() - hit.at < R2_TTL) return hit.objects;
	const result = await listStationR2({ data: {
		prefix,
		maxKeys
	} });
	if (!result.ok) throw new Error(result.error || "Could not list R2");
	const objects = result.objects.filter((item) => isAudioKey(item.key));
	r2Cache.set(cacheKey, {
		at: Date.now(),
		objects
	});
	r2Cache.set(prefix, {
		at: Date.now(),
		objects
	});
	return objects;
}
function scoreText(hay, q) {
	const n = hay.toLowerCase();
	if (n === q) return 100;
	if (n.startsWith(q)) return 80;
	const idx = n.indexOf(q);
	if (idx >= 0) return Math.max(30, 70 - idx);
	return 0;
}
function AddSongsPanel({ channel, channels, r2Configured }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [r2Objects, setR2Objects] = (0, import_react.useState)([]);
	const [r2Status, setR2Status] = (0, import_react.useState)("idle");
	const [r2Error, setR2Error] = (0, import_react.useState)("");
	const [wideStatus, setWideStatus] = (0, import_react.useState)("idle");
	const [busyKey, setBusyKey] = (0, import_react.useState)(null);
	const [hint, setHint] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)("");
	const [audioUrl, setAudioUrl] = (0, import_react.useState)("");
	const [urlBusy, setUrlBusy] = (0, import_react.useState)(false);
	const [uploads, setUploads] = (0, import_react.useState)([]);
	const [hot, setHot] = (0, import_react.useState)(false);
	const fileRef = (0, import_react.useRef)(null);
	const stationPrefix = `radio/${channel.slug}/`;
	const others = (0, import_react.useMemo)(() => channels.filter((item) => item.slug !== channel.slug), [channels, channel.slug]);
	const keyIndex = (0, import_react.useMemo)(() => buildDeskKeyIndex(channels), [channels]);
	(0, import_react.useEffect)(() => {
		if (!r2Configured) return;
		let live = true;
		const cached = r2Cache.get(stationPrefix);
		if (cached && Date.now() - cached.at < R2_TTL) {
			setR2Objects(cached.objects);
			setR2Status("ready");
			return;
		}
		setR2Status("loading");
		setR2Error("");
		const timer = window.setTimeout(() => {
			loadR2Prefix(stationPrefix, 800).then((stationFiles) => {
				if (!live) return;
				(0, import_react.startTransition)(() => {
					setR2Objects(stationFiles);
					setR2Status("ready");
				});
			}).catch((error) => {
				if (!live) return;
				setR2Status("error");
				setR2Error(error instanceof Error ? error.message : "Could not list R2");
			});
		}, 40);
		return () => {
			live = false;
			window.clearTimeout(timer);
		};
	}, [r2Configured, stationPrefix]);
	const needle = query.trim().toLowerCase();
	const searching = needle.length >= 2;
	(0, import_react.useEffect)(() => {
		if (!r2Configured || !searching || wideStatus === "ready" || wideStatus === "loading") return;
		let live = true;
		setWideStatus("loading");
		loadR2Prefix("radio/", 1e3).then((all) => {
			if (!live) return;
			(0, import_react.startTransition)(() => {
				setR2Objects((current) => {
					const byKey = new Map(current.map((item) => [item.key, item]));
					for (const item of all) if (!byKey.has(item.key)) byKey.set(item.key, item);
					return [...byKey.values()];
				});
				setWideStatus("ready");
			});
		}).catch(() => {
			if (!live) return;
			setWideStatus("idle");
		});
		return () => {
			live = false;
		};
	}, [
		r2Configured,
		searching,
		wideStatus
	]);
	const r2Hits = (0, import_react.useMemo)(() => {
		const rows = r2Objects.map((object) => {
			const name = titleFromR2Key(object.key);
			const desks = desksForKey(keyIndex, object.key);
			const here = desks.includes(channel.slug);
			const inFolder = object.key.startsWith(stationPrefix);
			const q = needle;
			const points = q ? Math.max(scoreText(name, q), scoreText(object.key, q), inFolder && name.toLowerCase().includes(q) ? 10 : 0) : inFolder && !here ? 20 : 0;
			return {
				...object,
				name,
				desks,
				here,
				inFolder,
				points
			};
		});
		const filtered = needle ? rows.filter((item) => item.points > 0) : rows.filter((item) => item.inFolder && !item.here);
		filtered.sort((a, b) => b.points - a.points || Number(a.here) - Number(b.here) || a.name.localeCompare(b.name));
		return filtered.slice(0, 24);
	}, [
		r2Objects,
		keyIndex,
		channel.slug,
		stationPrefix,
		needle
	]);
	const libraryHits = (0, import_react.useMemo)(() => {
		if (needle.length < 2) return [];
		const rows = [];
		for (const station of others) for (const track of station.tracks) {
			if (track.enabled === false) continue;
			const points = Math.max(scoreText(track.title, needle), scoreText(track.artist || "", needle), scoreText(station.name, needle));
			if (points <= 0) continue;
			if (channel.tracks.some((item) => item.enabled !== false && item.audioUrl === track.audioUrl)) continue;
			rows.push({
				station,
				track,
				points
			});
			if (rows.length >= 40) break;
		}
		rows.sort((a, b) => b.points - a.points || a.track.title.localeCompare(b.track.title));
		return rows.slice(0, 12);
	}, [
		needle,
		others,
		channel.tracks
	]);
	async function addR2(hit, name) {
		setBusyKey(hit.key);
		setHint("Adding…");
		try {
			const durationSec = await probeAudioDuration(hit.url).catch(() => void 0);
			const result = await importR2Tracks({ data: {
				channelSlugs: [channel.slug],
				items: [{
					key: hit.key,
					url: hit.url,
					title: name,
					durationSec
				}]
			} });
			applySnapshot$3(result.tracks, result.stations);
			r2Cache.clear();
			setHint(result.added ? `Added ${name}` : "Already on this station");
		} catch (error) {
			fail$2(error);
			setHint("");
		} finally {
			setBusyKey(null);
		}
	}
	async function addLibrary(station, track) {
		const key = `${station.slug}:${track.id}`;
		setBusyKey(key);
		setHint("Adding…");
		try {
			const result = await placeStationTrack({ data: {
				fromSlug: station.slug,
				trackId: track.id,
				toSlug: channel.slug,
				mode: "copy"
			} });
			applySnapshot$3(result.tracks, result.stations);
			setHint(`Added ${track.title}`);
		} catch (error) {
			fail$2(error);
			setHint("");
		} finally {
			setBusyKey(null);
		}
	}
	async function addUrl(event) {
		event.preventDefault();
		const url = audioUrl.trim();
		if (!url) return;
		const nextTitle = title.trim() || titleFromR2Key(url);
		setUrlBusy(true);
		setHint("Adding…");
		try {
			const durationSec = await probeAudioDuration(url).catch(() => void 0);
			const result = await addStationTrack({ data: {
				channelSlug: channel.slug,
				title: nextTitle,
				audioUrl: url,
				coverUrl: channel.cover,
				durationSec
			} });
			applySnapshot$3(result.tracks, result.stations);
			setTitle("");
			setAudioUrl("");
			setHint(`Added ${nextTitle}`);
		} catch (error) {
			fail$2(error);
			setHint("");
		} finally {
			setUrlBusy(false);
		}
	}
	async function sendFiles(files) {
		const audio = files.filter((file) => isAudioKey(file.name) || file.type.startsWith("audio/"));
		if (!audio.length) {
			setHint("Audio only (mp3, wav, flac, m4a, ogg, aac)");
			return;
		}
		setUploads(audio.map((file) => ({
			name: file.name,
			state: "up"
		})));
		for (let i = 0; i < audio.length; i++) {
			const file = audio[i];
			setHint(`Uploading ${file.name}…`);
			try {
				const durationSec = await probeAudioDuration(file).catch(() => void 0);
				const result = await directDeskUpload({
					kind: "audio",
					slug: channel.slug,
					file,
					title: titleFromR2Key(file.name),
					coverUrl: channel.cover,
					durationSec
				});
				if (result.tracks) applySnapshot$3(result.tracks, result.stations ?? []);
				r2Cache.clear();
				setUploads((current) => current.map((item, index) => index === i ? {
					...item,
					state: "ok"
				} : item));
			} catch (error) {
				const detail = error instanceof Error ? error.message : "Upload failed";
				setUploads((current) => current.map((item, index) => index === i ? {
					...item,
					state: "err",
					detail
				} : item));
				setHint(detail);
			}
		}
		setHint((current) => current.startsWith("Uploading") ? "Upload finished" : current);
	}
	const showR2 = r2Configured && (searching || r2Hits.length > 0);
	const emptySearch = searching && r2Hits.length === 0 && libraryHits.length === 0 && r2Status !== "loading" && wideStatus !== "loading";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "max-w-prose text-sm text-muted",
			children: "Search this folder first. Type two letters to look across R2 and other desks. Upload and URLs stay folded until you need them."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "relative mt-4 block",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "input pl-10",
				value: query,
				onChange: (event) => setQuery(event.target.value),
				placeholder: "Search R2 or other stations",
				autoComplete: "off",
				spellCheck: false
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
			children: r2Status === "loading" ? "Scanning this folder in the background…" : r2Status === "error" ? r2Error : !r2Configured ? "R2 keys are dark — search other desks or paste a URL." : wideStatus === "loading" ? "Still reading the rest of the bucket…" : searching ? `${r2Hits.length + libraryHits.length} matches` : r2Hits.length ? `${r2Hits.length} new in this folder — type to search farther` : "No new audio in this folder. Search, upload, or paste a URL."
		}),
		showR2 || libraryHits.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "mt-3 max-h-64 space-y-1 overflow-y-auto rounded-lg bg-bg p-2",
			children: [r2Hits.map((hit) => {
				const desks = hit.desks.map((slug) => channels.find((item) => item.slug === slug)?.name || slug);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 rounded-md px-2 py-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-sm",
							children: hit.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: [
								"R2 · ",
								formatBytes(hit.size),
								hit.inFolder ? "" : ` · ${hit.key.replace(/^radio\//, "")}`,
								desks.length ? ` · on ${desks.join(", ")}` : " · not on a station"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: Boolean(busyKey) || hit.here,
						onClick: () => void addR2(hit, hit.name),
						className: "inline-flex h-11 shrink-0 items-center gap-1.5 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), hit.here ? "On this station" : busyKey === hit.key ? "Adding…" : "Add"]
					})]
				}, hit.key);
			}), libraryHits.map(({ station, track }) => {
				const key = `${station.slug}:${track.id}`;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 rounded-md px-2 py-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-sm",
							children: track.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: [
								"On ",
								station.name,
								track.artist ? ` · ${track.artist}` : ""
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: Boolean(busyKey),
						onClick: () => void addLibrary(station, track),
						className: "inline-flex h-11 shrink-0 items-center gap-1.5 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), busyKey === key ? "Adding…" : "Add"]
					})]
				}, key);
			})]
		}) : null,
		emptySearch ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "No matches yet. Keep typing, or upload / paste a URL below."
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FoldDetails, {
			title: "Upload from this device",
			hint: "Open",
			persist: `upload:${channel.slug}`,
			children: [r2Configured ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("desk-add-drop", hot && "desk-add-drop-hot"),
				onDragOver: (event) => {
					event.preventDefault();
					setHot(true);
				},
				onDragLeave: () => setHot(false),
				onDrop: (event) => {
					event.preventDefault();
					setHot(false);
					const files = [...event.dataTransfer.files];
					if (files.length) sendFiles(files);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4 text-gold" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-w-0 flex-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Drop mp3 / wav / flac / m4a, or choose files. They land in this folder and on the playlist."
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => fileRef.current?.click(),
						className: "inline-flex h-11 shrink-0 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
						children: "Choose files"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						multiple: true,
						accept: "audio/mpeg,audio/wav,audio/flac,audio/mp4,audio/ogg,audio/aac,.mp3,.wav,.flac,.m4a,.ogg,.aac",
						className: "sr-only",
						onChange: (event) => {
							const files = [...event.target.files ?? []];
							event.target.value = "";
							if (files.length) sendFiles(files);
						}
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Uploads need R2 keys — use the Services tab."
			}), uploads.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1 font-mono text-[11px] uppercase tracking-[0.12em]",
				children: uploads.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: item.state === "err" ? "text-ember" : item.state === "ok" ? "text-gold" : "text-subtle",
					children: [
						item.state === "up" ? "Uploading" : item.state === "ok" ? "Added" : "Failed",
						" · ",
						item.name,
						item.detail ? ` — ${item.detail}` : ""
					]
				}, item.name))
			}) : null]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoldDetails, {
			title: "Paste a URL",
			hint: "Open",
			persist: `url:${channel.slug}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-2 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_auto]",
				onSubmit: (event) => void addUrl(event),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "sm:col-span-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-3.5" }), "From a URL"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input",
						value: title,
						onChange: (event) => setTitle(event.target.value),
						placeholder: "Title (optional)",
						autoComplete: "off"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input",
						value: audioUrl,
						onChange: (event) => setAudioUrl(event.target.value),
						placeholder: "https://…",
						autoComplete: "off",
						spellCheck: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: urlBusy || !audioUrl.trim(),
						className: "inline-flex h-11 items-center justify-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
						children: urlBusy ? "Adding…" : "Add URL"
					})
				]
			})
		}),
		hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-gold",
			children: hint
		}) : null
	] });
}
function applySnapshot$2(tracks, stations) {
	usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}
function fail$1(error) {
	window.alert(error instanceof Error ? error.message : "Desk save failed");
}
function readDeskStation() {
	try {
		return window.localStorage.getItem("radio.desk.station");
	} catch {
		return null;
	}
}
function DeskStations({ channels, r2Configured }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [kindFilter, setKindFilter] = (0, import_react.useState)("all");
	const [open, setOpen] = (0, import_react.useState)(null);
	const held = (0, import_react.useRef)(null);
	const playingSlug = usePlayerStore((s) => s.channelSlug);
	const selected = channels.find((channel) => channel.slug === open) ?? null;
	if (selected) held.current = selected;
	const view = selected ?? (held.current?.slug === open ? held.current : null);
	const visible = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		return channels.filter((channel) => {
			const liveCount = channel.tracks.filter((track) => track.enabled !== false).length;
			if (kindFilter === "live" && normalizeKind(channel.kind) !== "live") return false;
			if (kindFilter === "ondemand" && normalizeKind(channel.kind) !== "ondemand") return false;
			if (kindFilter === "fixed" && normalizeKind(channel.kind) !== "fixed") return false;
			if (kindFilter === "featured" && !channel.featured) return false;
			if (kindFilter === "off" && channel.enabled) return false;
			if (kindFilter === "empty" && liveCount > 0) return false;
			if (!needle) return true;
			if (`${channel.name} ${channel.slug} ${channel.kind}`.toLowerCase().includes(needle)) return true;
			return channel.tracks.some((track) => track.enabled !== false && `${track.title} ${track.artist}`.toLowerCase().includes(needle));
		});
	}, [
		channels,
		query,
		kindFilter
	]);
	const songHits = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		if (needle.length < 2) return [];
		const rows = [];
		for (const channel of channels) for (const track of channel.tracks) {
			if (track.enabled === false) continue;
			if (!`${track.title} ${track.artist}`.toLowerCase().includes(needle)) continue;
			rows.push({
				station: channel,
				track
			});
			if (rows.length >= 12) return rows;
		}
		return rows;
	}, [channels, query]);
	(0, import_react.useEffect)(() => {
		if (open) return;
		const saved = readDeskStation();
		if (saved && channels.some((channel) => channel.slug === saved)) setOpen(saved);
	}, [channels, open]);
	function pick(slug) {
		setOpen(slug);
		try {
			window.localStorage.setItem("radio.desk.station", slug);
		} catch {}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8 space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewStationForm, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeaturedRail, { channels }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
							children: "Stations"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "input mt-1",
							value: query,
							onChange: (event) => setQuery(event.target.value),
							placeholder: "Station or song"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-1",
						children: [
							["all", "All"],
							["live", "Live"],
							["ondemand", "On demand"],
							["fixed", "Fixed"],
							["featured", "Featured"],
							["off", "Off air"],
							["empty", "Empty"]
						].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setKindFilter(id),
							className: cn("inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em]", kindFilter === id ? "bg-fg text-bg" : "text-gold"),
							children: label
						}, id))
					}),
					playingSlug && channels.some((channel) => channel.slug === playingSlug) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => pick(playingSlug),
						className: "mt-2 inline-flex h-11 items-center font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: "Open what’s playing"
					}) : null,
					songHits.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-1 rounded-lg bg-bg p-2",
						children: songHits.map(({ station, track }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => pick(station.slug),
							className: "flex w-full items-center gap-2 py-1 text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-0 flex-1 truncate text-sm",
								children: track.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
								children: station.name
							})]
						}) }, `${station.slug}:${track.id}`))
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 max-h-[36rem] space-y-1 overflow-y-auto rounded-xl bg-bg-elevated p-2 shadow-[var(--shadow-filigree)]",
						children: visible.map((channel) => {
							const songs = channel.tracks.filter((track) => track.enabled !== false).length;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => pick(channel.slug),
								className: cn("flex w-full items-center gap-3 rounded-lg p-2 text-left", open === channel.slug ? "bg-bg shadow-[var(--shadow-filigree)]" : "hover:bg-bg"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
									src: channel.cover,
									alt: "",
									className: "size-11 shrink-0 rounded-md"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate font-display text-base font-semibold",
										children: channel.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
										children: [
											kindLabel(channel.kind),
											" · ",
											songs,
											" ",
											songs === 1 ? "song" : "songs",
											channel.featured ? " · featured" : "",
											channel.enabled ? "" : " · off air",
											songs === 0 ? " · empty" : ""
										]
									})]
								})]
							}) }, channel.slug);
						})
					})
				] }), view ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationWorkspace, {
					channel: view,
					channels,
					r2Configured
				}, view.slug) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "self-start rounded-xl bg-bg-elevated p-6 text-sm text-muted shadow-[var(--shadow-border)]",
					children: "Pick a station to edit its playlist. Search R2, upload from this device, or paste a URL — the form stays put while the playlist updates."
				})]
			})
		]
	});
}
function FeaturedRail({ channels }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [pick, setPick] = (0, import_react.useState)("");
	const featured = (0, import_react.useMemo)(() => [...channels].filter((channel) => channel.featured).sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99) || a.name.localeCompare(b.name)), [channels]);
	const rest = channels.filter((channel) => !channel.featured);
	const slugs = featured.map((channel) => channel.slug);
	async function commit(next) {
		setBusy(true);
		try {
			const result = await setFeaturedRail({ data: { slugs: next } });
			applySnapshot$2(result.tracks, result.stations);
		} catch (error) {
			fail$1(error);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FoldSection, {
		title: `Featured rail · ${featured.length}`,
		hint: "Edit",
		className: "mt-0",
		persist: "featured",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "This is the homepage rail. Move, remove, or add a station here — you do not need to open the station first."
			}),
			featured.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-subtle",
				children: "Nothing on the rail yet."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2",
				children: featured.map((channel, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center gap-2 rounded-lg bg-bg p-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
							src: channel.cover,
							alt: "",
							className: "size-12 shrink-0 rounded-md"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-6 font-mono text-[11px] tabular-nums text-subtle",
							children: index + 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate font-display text-lg font-semibold",
								children: channel.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
								children: kindLabel(channel.kind)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy || index === 0,
							onClick: () => {
								const next = [...slugs];
								[next[index - 1], next[index]] = [next[index], next[index - 1]];
								commit(next);
							},
							className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold disabled:opacity-40",
							children: "Up"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy || index === featured.length - 1,
							onClick: () => {
								const next = [...slugs];
								[next[index + 1], next[index]] = [next[index], next[index + 1]];
								commit(next);
							},
							className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold disabled:opacity-40",
							children: "Down"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy,
							onClick: () => void commit(slugs.filter((slug) => slug !== channel.slug)),
							className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ember",
							children: "Remove"
						})
					]
				}, channel.slug))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 flex flex-wrap gap-2",
				onSubmit: (event) => {
					event.preventDefault();
					if (!pick) return;
					commit([...slugs, pick]).then(() => setPick(""));
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "input min-w-56 flex-1",
					value: pick,
					onChange: (event) => setPick(event.target.value),
					disabled: busy,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Add a station to the rail"
					}), rest.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: channel.slug,
						children: channel.name
					}, channel.slug))]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: busy || !pick,
					className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-50",
					children: "Add to rail"
				})]
			})
		]
	});
}
function NewStationForm() {
	const [name, setName] = (0, import_react.useState)("");
	const [slug, setSlug] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)("fixed");
	const [featured, setFeatured] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoldSection, {
		title: "New station",
		hint: "Create",
		className: "mt-0",
		persist: "new-station",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-3",
			onSubmit: (event) => {
				event.preventDefault();
				const nextSlug = slugify(slug || name);
				if (!name.trim() || !nextSlug) return;
				setBusy(true);
				saveStation({ data: {
					slug: nextSlug,
					added: true,
					name: name.trim(),
					kind,
					featured,
					enabled: true,
					energy: kind === "fixed" ? "start to finish" : kind === "ondemand" ? "on demand" : "clock",
					category: "Custom"
				} }).then((result) => {
					applySnapshot$2(result.tracks, result.stations);
					setName("");
					setSlug("");
					setFeatured(false);
				}).catch(fail$1).finally(() => setBusy(false));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Fixed plays start to finish. Live joins a shared clock. On demand waits until you pick a song."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-2 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input",
						value: name,
						onChange: (event) => setName(event.target.value),
						placeholder: "Name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input",
						value: slug,
						onChange: (event) => setSlug(event.target.value),
						placeholder: "slug (optional)"
					})]
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
							checked: kind === value,
							onChange: () => setKind(value)
						}), kindLabel(value)]
					}, value))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
					children: kindHint(kind)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: featured,
						onChange: (event) => setFeatured(event.target.checked)
					}), "Put on featured rail"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: busy,
						className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
						children: busy ? "Creating…" : "Create station"
					})
				})
			]
		})
	});
}
function StationWorkspace({ channel, channels, r2Configured }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const others = channels.filter((item) => item.slug !== channel.slug);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
						children: "Editing"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl font-semibold tracking-tight",
						children: channel.name
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModePill, {
					kind: channel.kind,
					mode: channel.mode,
					enabled: channel.enabled,
					nsfw: channel.nsfw
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/channel/$slug",
						params: { slug: channel.slug },
						className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
						children: "View station"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void usePlayerStore.getState().tuneIn(channel.slug, { forcePlay: true }),
						className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
						children: "Listen"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy,
						onClick: () => {
							const slugs = channels.filter((item) => item.featured).sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99)).map((item) => item.slug);
							const next = channel.featured ? slugs.filter((slug) => slug !== channel.slug) : [...slugs, channel.slug];
							setBusy(true);
							setFeaturedRail({ data: { slugs: next } }).then((result) => applySnapshot$2(result.tracks, result.stations)).catch(fail$1).finally(() => setBusy(false));
						},
						className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
						children: channel.featured ? "Remove from featured" : "Add to featured"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy,
						onClick: () => {
							const nextHidden = channel.enabled;
							if (nextHidden && !window.confirm(`Take “${channel.name}” off air?`)) return;
							setBusy(true);
							saveStation({ data: {
								slug: channel.slug,
								hidden: nextHidden,
								enabled: !nextHidden
							} }).then((result) => applySnapshot$2(result.tracks, result.stations)).finally(() => setBusy(false));
						},
						className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ember",
						children: channel.enabled ? "Take off air" : "Restore to air"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoldSection, {
				title: "Station settings",
				hint: "Edit",
				className: "mt-4",
				titleClassName: "text-gold",
				persist: `settings:${channel.slug}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationSettingsForm, {
					channel,
					compact: true
				}, `${channel.slug}:${channel.shuffle}:${channel.kind}`)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoldSection, {
				title: "Add songs",
				hint: "Search R2",
				className: "mt-4",
				titleClassName: "text-gold",
				defaultOpen: true,
				persist: `add:${channel.slug}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddSongsPanel, {
					channel,
					channels,
					r2Configured
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoldSection, {
				title: `Playlist · ${channel.tracks.filter((track) => track.enabled !== false).length}`,
				hint: "Open",
				className: "mt-4",
				titleClassName: "text-gold",
				persist: `plist:${channel.slug}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Playlist, {
					channel,
					others,
					r2Configured
				})
			})
		]
	});
}
function Playlist({ channel, others, r2Configured }) {
	const [filter, setFilter] = (0, import_react.useState)("");
	const [showHidden, setShowHidden] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [arrange, setArrange] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const nowId = usePlayerStore((s) => s.channelSlug === channel.slug ? s.track?.id : null);
	const live = channel.tracks.filter((track) => track.enabled !== false);
	const hidden = channel.tracks.filter((track) => track.enabled === false);
	const totalSec = live.reduce((sum, track) => sum + durationOf(track), 0);
	const visible = (0, import_react.useMemo)(() => {
		const source = showHidden ? channel.tracks : live;
		const q = filter.trim().toLowerCase();
		if (!q) return source;
		return source.filter((track) => `${track.title} ${track.artist}`.toLowerCase().includes(q));
	}, [
		channel.tracks,
		filter,
		live,
		showHidden
	]);
	const alsoOn = (0, import_react.useMemo)(() => {
		const titles = /* @__PURE__ */ new Map();
		for (const desk of [channel, ...others]) for (const track of desk.tracks) {
			if (track.enabled === false) continue;
			const key = track.title.trim().toLowerCase();
			const set = titles.get(key) ?? /* @__PURE__ */ new Set();
			set.add(desk.slug);
			titles.set(key, set);
		}
		const map = /* @__PURE__ */ new Map();
		for (const track of channel.tracks) {
			const set = titles.get(track.title.trim().toLowerCase());
			map.set(track.id, Math.max(0, (set?.size ?? 1) - 1));
		}
		return map;
	}, [channel, others]);
	(0, import_react.useEffect)(() => {
		if (!nowId) return;
		const active = document.activeElement;
		if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT" || active.isContentEditable)) return;
		document.getElementById(`desk-track-${nowId}`)?.scrollIntoView({ block: "nearest" });
	}, [nowId]);
	async function move(indexInChannel, dir) {
		const ids = channel.tracks.map((item) => item.id);
		const next = indexInChannel + dir;
		if (next < 0 || next >= ids.length) return;
		[ids[indexInChannel], ids[next]] = [ids[next], ids[indexInChannel]];
		setBusy(true);
		try {
			const result = await reorderStationTracks({ data: {
				channelSlug: channel.slug,
				trackIds: ids
			} });
			applySnapshot$2(result.tracks, result.stations);
		} catch (error) {
			fail$1(error);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "Playlist"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					live.length,
					" on air · ",
					formatClock(totalSec),
					hidden.length ? ` · ${hidden.length} removed` : "",
					busy ? " · Saving…" : ""
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setArrange((value) => !value),
					"aria-pressed": arrange,
					className: "inline-flex h-11 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-gold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "size-3.5" }), arrange ? "Done" : "Arrange"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "inline-flex h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: showHidden,
						onChange: (event) => setShowHidden(event.target.checked)
					}), "Show removed"]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: "input mt-3",
			value: filter,
			onChange: (event) => setFilter(event.target.value),
			placeholder: "Filter this playlist"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "mt-3 max-h-[28rem] divide-y divide-line overflow-y-auto rounded-lg bg-bg",
			children: [visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "p-4 text-sm text-subtle",
				children: "No songs match."
			}) : null, visible.map((track) => {
				const index = channel.tracks.findIndex((item) => item.id === track.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskTrackRow, {
					channel,
					track,
					index,
					others,
					r2Configured,
					editing: editing === track.id,
					arrange,
					playing: nowId === track.id,
					alsoOn: alsoOn.get(track.id) ?? 0,
					onToggleEdit: () => setEditing((current) => current === track.id ? null : track.id),
					onMove: (dir) => void move(index, dir),
					busy
				}, track.id);
			})]
		})
	] });
}
function DeskTrackRow({ channel, track, index, others, r2Configured, editing, arrange, playing, alsoOn, onToggleEdit, onMove, busy }) {
	const [title, setTitle] = (0, import_react.useState)(track.title);
	const [artist, setArtist] = (0, import_react.useState)(track.artist);
	const [tags, setTags] = (0, import_react.useState)((track.tags ?? []).join(", "));
	const [dest, setDest] = (0, import_react.useState)("");
	const [localBusy, setLocalBusy] = (0, import_react.useState)(false);
	const location = fileLocationLabel(track.audioUrl);
	const key = r2KeyFromAudioUrl(track.audioUrl);
	const hidden = track.enabled === false;
	const locked = busy || localBusy;
	async function saveMeta() {
		setLocalBusy(true);
		try {
			const result = await patchStationTrack({ data: {
				channelSlug: channel.slug,
				trackId: track.id,
				title: title.trim() || track.title,
				artist: artist.trim() || track.artist,
				tags: (tags || "").trim()
			} });
			applySnapshot$2(result.tracks, result.stations);
			onToggleEdit();
		} catch (error) {
			fail$1(error);
		} finally {
			setLocalBusy(false);
		}
	}
	async function place(mode) {
		if (!dest) return;
		if (mode === "move" && !window.confirm(`Move “${track.title}” to that station? It leaves this playlist.`)) return;
		setLocalBusy(true);
		try {
			const result = await placeStationTrack({ data: {
				fromSlug: channel.slug,
				trackId: track.id,
				toSlug: dest,
				mode
			} });
			applySnapshot$2(result.tracks, result.stations);
			setDest("");
		} catch (error) {
			fail$1(error);
		} finally {
			setLocalBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		id: `desk-track-${track.id}`,
		className: cn("p-3", hidden && "opacity-50", playing && "bg-bg"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-8 font-mono text-[11px] tabular-nums text-subtle",
						children: String(index + 1).padStart(2, "0")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
						src: track.coverUrl || channel.cover,
						alt: "",
						className: "size-10 shrink-0 rounded-md"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("block truncate", playing && "text-gold"),
							children: track.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: [
								track.artist,
								" · ",
								location,
								alsoOn > 0 ? ` · also ${alsoOn}` : ""
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[11px] tabular-nums text-subtle",
						children: formatClock(durationOf(track))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: locked,
						onClick: () => void usePlayerStore.getState().cueTrack(channel.slug, track.id),
						className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: "Play"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/player/$id",
						params: { id: songKey(track) },
						className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: "Open"
					}),
					arrange ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: locked,
						onClick: () => onMove(-1),
						className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: "Up"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: locked,
						onClick: () => onMove(1),
						className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: "Down"
					})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: locked,
						onClick: onToggleEdit,
						className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: editing ? "Close" : "Edit"
					}),
					hidden ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: locked,
						onClick: () => {
							setLocalBusy(true);
							restoreStationTrack({ data: {
								channelSlug: channel.slug,
								trackId: track.id
							} }).then((result) => applySnapshot$2(result.tracks, result.stations)).finally(() => setLocalBusy(false));
						},
						className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: "Restore"
					}) : null
				]
			}),
			editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 space-y-2 rounded-lg bg-bg-elevated p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input",
						value: title,
						onChange: (event) => setTitle(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input",
						value: artist,
						onChange: (event) => setArtist(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input",
						value: tags,
						onChange: (event) => setTags(event.target.value),
						placeholder: "Tags, comma separated"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: locked,
						onClick: () => void saveMeta(),
						className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
						children: "Save names"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2 pt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "input min-w-52 flex-1",
								value: dest,
								onChange: (event) => setDest(event.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Move or copy to another station"
								}), others.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: item.slug,
									children: item.name
								}, item.slug))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: locked || !dest,
								onClick: () => void place("copy"),
								className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
								children: "Copy there"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: locked || !dest,
								onClick: () => void place("move"),
								className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
								children: "Move there"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2 pt-1",
						children: [hidden ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: locked,
							onClick: () => {
								if (!window.confirm(`Remove “${track.title}” from this station? File stays on R2.`)) return;
								setLocalBusy(true);
								hideStationTrack({ data: {
									channelSlug: channel.slug,
									trackId: track.id,
									audioUrl: track.audioUrl
								} }).then((result) => applySnapshot$2(result.tracks, result.stations)).finally(() => setLocalBusy(false));
							},
							className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
							children: "Remove from station"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: locked || !r2Configured || !key,
							onClick: () => {
								if (!key || !window.confirm(`Delete on R2?\n${key}`)) return;
								setLocalBusy(true);
								deleteStationFile({ data: {
									channelSlug: channel.slug,
									trackId: track.id,
									audioUrl: track.audioUrl,
									r2Key: key,
									alsoDeleteR2: true
								} }).then((result) => applySnapshot$2(result.tracks, result.stations)).finally(() => setLocalBusy(false));
							},
							className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ember",
							children: "Delete file"
						})]
					})
				]
			}) : null
		]
	});
}
function DeskReview() {
	const catalog = usePlayerStore((s) => s.catalog);
	const groups = usePlayerStore((s) => s.cutGroups);
	const channels = catalog.channels.length ? catalog.channels : getCatalog().channels;
	const [items, setItems] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [dupId, setDupId] = (0, import_react.useState)(null);
	const [toSlug, setToSlug] = (0, import_react.useState)(channels[0]?.slug ?? "");
	function applySnap(tracks, stations) {
		usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
	}
	async function refresh() {
		const data = await listReviewQueue();
		setItems(data.items);
	}
	(0, import_react.useEffect)(() => {
		refresh().catch(() => setItems([]));
	}, []);
	const source = catalog.channels.length ? catalog : getCatalog();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "Review queue"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-prose text-sm text-muted",
				children: "Songs unallocated from a station. Files stay on R2. Cousins on other desks stay on air until you merge or move them."
			}),
			items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-muted",
				children: "Nothing to review."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-3",
				children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewRow, {
					item,
					channels: channels.map((channel) => ({
						slug: channel.slug,
						name: channel.name
					})),
					toSlug,
					setToSlug,
					busy: busy === item.id,
					showDups: dupId === item.id,
					copies: copiesOf(source, item.trackId, groups, true),
					onDup: () => setDupId(dupId === item.id ? null : item.id),
					onRestore: async () => {
						setBusy(item.id);
						try {
							const snap = await restoreReviewItemFn({ data: { id: item.id } });
							applySnap(snap.tracks, snap.stations);
							await refresh();
						} catch (error) {
							window.alert(error instanceof Error ? error.message : "Restore failed");
						} finally {
							setBusy(null);
						}
					},
					onMove: async () => {
						if (!toSlug) return;
						setBusy(item.id);
						try {
							const snap = await rehomeReviewItemFn({ data: {
								id: item.id,
								toSlug,
								mode: "move"
							} });
							applySnap(snap.tracks, snap.stations);
							await refresh();
						} catch (error) {
							window.alert(error instanceof Error ? error.message : "Move failed");
						} finally {
							setBusy(null);
						}
					},
					onDismiss: async () => {
						setBusy(item.id);
						try {
							await dismissReviewItemFn({ data: {
								id: item.id,
								status: "dismissed"
							} });
							await refresh();
						} finally {
							setBusy(null);
						}
					},
					onMerge: async (canonicalId, memberIds) => {
						setBusy(item.id);
						try {
							const result = await mergeStationCuts({ data: {
								canonicalId,
								memberIds
							} });
							usePlayerStore.getState().replaceCutGroups(result.groups);
							if (result.tracks) applySnap(result.tracks, result.stations ?? []);
							await dismissReviewItemFn({ data: {
								id: item.id,
								status: "merged"
							} });
							await refresh();
						} catch (error) {
							window.alert(error instanceof Error ? error.message : "Merge failed");
						} finally {
							setBusy(null);
						}
					},
					onDestroy: async () => {
						if (!item.audioUrl) return;
						if (!window.confirm(`Permanently delete this file from R2?\n${item.r2Key || item.audioUrl}`)) return;
						setBusy(item.id);
						try {
							const snap = await deleteStationFile({ data: {
								channelSlug: item.channelSlug,
								trackId: item.trackId,
								audioUrl: item.audioUrl,
								r2Key: item.r2Key ?? void 0,
								alsoDeleteR2: true
							} });
							applySnap(snap.tracks, snap.stations);
							await dismissReviewItemFn({ data: {
								id: item.id,
								status: "dismissed"
							} });
							await refresh();
						} catch (error) {
							window.alert(error instanceof Error ? error.message : "Delete failed");
						} finally {
							setBusy(null);
						}
					}
				}, item.id))
			})
		]
	});
}
function ReviewRow({ item, channels, toSlug, setToSlug, busy, showDups, copies, onDup, onRestore, onMove, onDismiss, onMerge, onDestroy }) {
	const parts = item.audioUrl ? audioPathParts(item.audioUrl) : {
		folder: "",
		filename: "",
		stem: ""
	};
	const cousins = (0, import_react.useMemo)(() => copies.filter((copy) => copy.track.id !== item.trackId || copy.channel.slug !== item.channelSlug), [copies, item]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
					src: item.coverUrl,
					alt: "",
					className: "size-16 shrink-0 overflow-hidden rounded-md",
					motion: "still"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-display text-xl",
							children: item.title || item.trackId
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 truncate text-sm text-muted",
							children: [
								item.artist || "Unknown",
								" · from ",
								item.channelSlug
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 break-all font-mono text-[10px] text-subtle",
							children: [parts.folder ? `${parts.folder}/` : "", parts.filename || item.r2Key || "—"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: [
								item.editorEmail || "desk",
								" · ",
								new Date(item.createdAt).toLocaleString()
							]
						})
					]
				})]
			}),
			item.audioUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
				className: "mt-3 w-full",
				controls: true,
				preload: "none",
				src: mediaUrl(item.audioUrl)
			}) : null,
			item.trackId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/player/$id",
				params: { id: item.trackId },
				className: "mt-2 inline-flex h-11 items-center font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
				children: "Open song"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy,
						onClick: () => void onRestore(),
						className: "inline-flex h-11 items-center rounded-md bg-fg px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
						children: "Restore"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "input max-w-xs",
						value: toSlug,
						onChange: (event) => setToSlug(event.target.value),
						children: channels.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: channel.slug,
							children: channel.name
						}, channel.slug))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy || !toSlug,
						onClick: () => void onMove(),
						className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
						children: "Move"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy,
						onClick: onDup,
						className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
						children: "Find duplicates"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy,
						onClick: () => void onDismiss(),
						className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle",
						children: "Keep hidden"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy,
						onClick: () => void onDestroy(),
						className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ember",
						children: "Delete on R2"
					})
				]
			}),
			showDups ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 border-t border-line pt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: "Cousins"
					}),
					cousins.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "No other stations carry this stem or title."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-1",
						children: cousins.map((copy) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-sm text-muted",
							children: [
								copy.track.title,
								" · ",
								copy.channel.name,
								" · ",
								copy.folder || "radio",
								"/",
								copy.filename
							]
						}, `${copy.channel.slug}:${copy.track.id}`))
					}),
					cousins.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy,
						onClick: () => void onMerge(item.trackId, cousins.map((copy) => copy.track.id)),
						className: "mt-2 inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
						children: "Merge into song group"
					}) : null
				]
			}) : null
		]
	});
}
function applySnapshot$1(tracks, stations) {
	usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}
function fail(error) {
	window.alert(error instanceof Error ? error.message : "Could not save experience");
}
function draftFromChannel(channel) {
	const packed = xpFromTags(channel.tags);
	const seed = experienceFromChannel(channel);
	return {
		slug: packed?.slug || seed?.slug || channel.slug,
		title: packed?.title || seed?.title || channel.name,
		kicker: packed?.kicker || seed?.kicker || "Experience",
		line: packed?.line || seed?.line || channel.energy || "",
		whisper: packed?.whisper || seed?.whisper || "",
		summary: packed?.summary || seed?.summary || channel.description || "",
		bpm: packed?.bpm || seed?.bpm || 120,
		phenomenon: packed?.phenomenon || seed?.phenomenon || "vortex",
		captions: packed?.captions?.length ? packed.captions : seed?.captions ?? []
	};
}
function DeskExperiences({ channels }) {
	const catalog = usePlayerStore((s) => s.catalog);
	const experiences = listExperiences(catalog.channels.length ? catalog : void 0);
	const used = new Set(experiences.map((item) => item.stationSlug));
	const candidates = channels.filter((channel) => !used.has(channel.slug));
	const [open, setOpen] = (0, import_react.useState)(experiences[0]?.stationSlug ?? null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8 space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-prose text-sm text-muted",
				children: "An experience is a fixed-order rite: first song first, no live clock, shuffle off. If animation work added a second row for a song that was already here, a ghost banner appears — keep the original file, drop the stub."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewExperienceForm, { channels: candidates }),
			experiences.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No rites yet. Make one from a station."
			}) : null,
			experiences.map((item) => {
				const channel = channels.find((entry) => entry.slug === item.stationSlug);
				if (!channel) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoldSection, {
					title: item.title,
					hint: open === item.stationSlug ? "Hide" : "Direct",
					persist: `xp-${item.stationSlug}`,
					defaultOpen: open === item.stationSlug,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExperienceEditor, {
						channel,
						onOpen: () => setOpen(item.stationSlug)
					})
				}, item.stationSlug);
			})
		]
	});
}
function NewExperienceForm({ channels }) {
	const [slug, setSlug] = (0, import_react.useState)(channels[0]?.slug ?? "");
	const [title, setTitle] = (0, import_react.useState)("");
	const [kicker, setKicker] = (0, import_react.useState)("");
	const [line, setLine] = (0, import_react.useState)("");
	const [whisper, setWhisper] = (0, import_react.useState)("");
	const [summary, setSummary] = (0, import_react.useState)("");
	const [phenomenon, setPhenomenon] = (0, import_react.useState)("vortex");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const channel = channels.find((item) => item.slug === slug);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoldSection, {
		title: "New experience",
		hint: "Create",
		persist: "xp-new",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-3",
			onSubmit: (event) => {
				event.preventDefault();
				if (!channel || !title.trim()) return;
				setBusy(true);
				const draft = {
					slug: slugify(title) || channel.slug,
					title: title.trim(),
					kicker: kicker.trim() || "Experience",
					line: line.trim(),
					whisper: whisper.trim(),
					summary: summary.trim() || channel.description,
					bpm: 120,
					phenomenon,
					captions: [line.trim(), whisper.trim()].filter(Boolean)
				};
				saveStation({ data: {
					slug: channel.slug,
					kind: "fixed",
					shuffle: "off",
					featured: true,
					category: "Experience",
					energy: "start to finish",
					tags: mergeXpTags(channel.tags, draft)
				} }).then((result) => {
					applySnapshot$1(result.tracks, result.stations);
					setTitle("");
					setKicker("");
					setLine("");
					setWhisper("");
					setSummary("");
				}).catch(fail).finally(() => setBusy(false));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "The station becomes a fixed playlist. Listeners start at song one — never the live clock."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "input",
					value: slug,
					onChange: (event) => setSlug(event.target.value),
					disabled: !channels.length,
					children: [channels.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Every station already has a rite"
					}) : null, channels.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: item.slug,
						children: item.name
					}, item.slug))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input",
					value: title,
					onChange: (event) => setTitle(event.target.value),
					placeholder: "Title"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input",
					value: kicker,
					onChange: (event) => setKicker(event.target.value),
					placeholder: "Kicker · 2137"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input",
					value: line,
					onChange: (event) => setLine(event.target.value),
					placeholder: "The line on the stage"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input",
					value: whisper,
					onChange: (event) => setWhisper(event.target.value),
					placeholder: "Whisper"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "input",
					rows: 3,
					value: summary,
					onChange: (event) => setSummary(event.target.value),
					placeholder: "Summary"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1",
					children: PHENOMENA.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": phenomenon === item.id,
						title: item.hint,
						onClick: () => setPhenomenon(item.id),
						className: cn("inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em]", phenomenon === item.id ? "bg-fg text-bg" : "text-gold"),
						children: item.label
					}, item.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: busy || !channel || !title.trim(),
					className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-50",
					children: busy ? "Creating…" : "Make experience"
				})
			]
		})
	});
}
function ExperienceEditor({ channel, onOpen }) {
	const draft0 = draftFromChannel(channel);
	const [draft, setDraft] = (0, import_react.useState)(draft0);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const playable = getPlayableTracks(channel);
	const xp = experienceFromChannel(channel);
	function patch(next) {
		setDraft((prev) => ({
			...prev,
			...next
		}));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "xp-board",
		onFocus: onOpen,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "xp-board-actions",
				children: [xp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/experiences/$slug",
					params: { slug: xp.slug },
					className: "xp-link",
					children: "Open rite"
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/channel/$slug",
					params: { slug: channel.slug },
					className: "xp-link",
					children: "Station"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostCleaner, { channel }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackScenes, {
				channel,
				tracks: playable,
				stationPhenomenon: draft.phenomenon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoldSection, {
				title: "Rite identity",
				hint: "Edit",
				persist: `xp-id-${channel.slug}`,
				defaultOpen: false,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "space-y-3",
					onSubmit: (event) => {
						event.preventDefault();
						setBusy(true);
						saveStation({ data: {
							slug: channel.slug,
							kind: "fixed",
							shuffle: "off",
							name: draft.title.trim() || channel.name,
							energy: draft.line.trim() || channel.energy,
							description: draft.summary.trim() || channel.description,
							category: "Experience",
							tags: mergeXpTags(channel.tags, draft)
						} }).then((result) => applySnapshot$1(result.tracks, result.stations)).catch(fail).finally(() => setBusy(false));
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "input",
							value: draft.title,
							onChange: (event) => patch({ title: event.target.value }),
							placeholder: "Title"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "input",
							value: draft.kicker,
							onChange: (event) => patch({ kicker: event.target.value }),
							placeholder: "Kicker"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "input",
							value: draft.line,
							onChange: (event) => patch({ line: event.target.value }),
							placeholder: "Line"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "input",
							value: draft.whisper,
							onChange: (event) => patch({ whisper: event.target.value }),
							placeholder: "Whisper"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: "input",
							rows: 3,
							value: draft.summary,
							onChange: (event) => patch({ summary: event.target.value }),
							placeholder: "Summary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
								children: "Default BPM"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "input mt-1",
								type: "number",
								min: 0,
								max: 200,
								value: draft.bpm,
								onChange: (event) => patch({ bpm: Number(event.target.value) })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: "input",
							rows: 3,
							value: draft.captions.join("\n"),
							onChange: (event) => patch({ captions: event.target.value.split("\n") }),
							placeholder: "Captions · one per line"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: PHENOMENA.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": draft.phenomenon === item.id,
								title: item.hint,
								onClick: () => patch({ phenomenon: item.id }),
								className: cn("inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em]", draft.phenomenon === item.id ? "bg-fg text-bg" : "text-gold"),
								children: item.label
							}, item.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy,
							className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
							children: busy ? "Saving…" : "Save rite"
						})
					]
				})
			})
		]
	});
}
function TrackScenes({ channel, tracks, stationPhenomenon }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const base = lookFromStation(experienceFromChannel(channel) ?? {
		slug: channel.slug,
		stationSlug: channel.slug,
		title: channel.name,
		kicker: "",
		line: "",
		whisper: "",
		summary: "",
		cover: channel.cover,
		loop: channel.videoUrl || "",
		stills: [],
		bpm: 120,
		captions: [],
		phenomenon: stationPhenomenon
	}, channel);
	async function move(index, dir) {
		const next = [...tracks];
		const swap = index + dir;
		if (swap < 0 || swap >= next.length) return;
		[next[index], next[swap]] = [next[swap], next[index]];
		setBusy(true);
		try {
			const result = await reorderStationTracks({ data: {
				channelSlug: channel.slug,
				trackIds: next.map((item) => item.id)
			} });
			applySnapshot$1(result.tracks, result.stations);
		} catch (error) {
			fail(error);
		} finally {
			setBusy(false);
		}
	}
	async function pin(track, index, phenomenon) {
		setBusy(true);
		try {
			const current = lookForTrack(base, track, index);
			const result = await patchStationTrack({ data: {
				channelSlug: channel.slug,
				trackId: track.id,
				tags: mergeSceneTags(track.tags, {
					...current,
					phenomenon
				})
			} });
			applySnapshot$1(result.tracks, result.stations);
		} catch (error) {
			fail(error);
		} finally {
			setBusy(false);
		}
	}
	async function remove(track) {
		if (!window.confirm(`Remove “${track.title}” from this rite? Other desks keep their copy. The file stays on R2.`)) return;
		setBusy(true);
		try {
			const result = await hideStationTrack({ data: {
				channelSlug: channel.slug,
				trackId: track.id,
				audioUrl: track.audioUrl
			} });
			applySnapshot$1(result.tracks, result.stations);
		} catch (error) {
			fail(error);
		} finally {
			setBusy(false);
		}
	}
	const ghosts = ghostDropIds(channel.tracks);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "xp-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "xp-kicker",
				children: [
					"Score · ",
					tracks.length,
					" songs"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "This is the rite in order. Remove drops a row from this playlist only — it does not delete the R2 file. Ghost copies are extra rows added when a scene was painted; keep the real cut."
			}),
			tracks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Empty score. Add songs from the Stations tab."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "xp-score",
				children: tracks.map((track, index) => {
					const scene = sceneFromTags(track.tags);
					const phenomenon = scene?.phenomenon || phenomenonAt(index, stationPhenomenon);
					const ghost = ghosts.has(track.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: cn("xp-score-row", ghost && "is-ghost"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "xp-score-index",
								children: String(index + 1).padStart(2, "0")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-medium",
									children: track.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
									children: [
										formatClock(durationOf(track)),
										" · ",
										scene ? "pinned" : "cycles",
										ghost ? " · ghost copy" : ""
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "input xp-score-scene",
								value: phenomenon,
								disabled: busy,
								"aria-label": `Phenomenon for ${track.title}`,
								onChange: (event) => void pin(track, index, parsePhenomenon(event.target.value, stationPhenomenon)),
								children: PHENOMENA.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: item.id,
									children: item.label
								}, item.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "xp-score-tools",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: busy || index === 0,
										className: "xp-icon",
										"aria-label": "Move up",
										onClick: () => void move(index, -1),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: busy || index === tracks.length - 1,
										className: "xp-icon",
										"aria-label": "Move down",
										onClick: () => void move(index, 1),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: busy,
										className: "xp-icon is-danger",
										"aria-label": `Remove ${track.title}`,
										onClick: () => void remove(track),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
									})
								]
							})
						]
					}, track.id);
				})
			})
		]
	});
}
function applySnapshot(tracks, stations) {
	usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}
var DESK_TABS = [
	"stations",
	"experiences",
	"directory",
	"review",
	"r2",
	"services"
];
function readDeskTab() {
	try {
		const value = window.localStorage.getItem("radio.desk.tab");
		if (value && DESK_TABS.includes(value)) return value;
	} catch {}
	return "stations";
}
function DeskPage() {
	const { user, isAdmin, isPending, r2Configured, lamps } = useRadioUser();
	const catalog = usePlayerStore((s) => s.catalog);
	const channels = catalog.channels.length ? catalog.channels : getCatalog().channels;
	const [tab, setTab] = (0, import_react.useState)("stations");
	const [reviewOpen, setReviewOpen] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		setTab(readDeskTab());
	}, []);
	(0, import_react.useEffect)(() => {
		if (!isAdmin) return;
		listReviewQueue().then((data) => setReviewOpen(data.open)).catch(() => setReviewOpen(0));
	}, [isAdmin, tab]);
	function pickTab(next) {
		setTab(next);
		try {
			window.localStorage.setItem("radio.desk.tab", next);
		} catch {}
	}
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Station desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
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
				className: "mt-2 font-display text-4xl font-semibold",
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
		className: "mx-auto max-w-6xl px-4 py-8 pb-52",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "C · God desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold tracking-tight",
				children: "Station desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-prose text-muted",
				children: "Pick a station, add songs, keep the rest folded. R2 scans in the background so the desk stays light."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskOverview, {
				channels,
				reviewOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex flex-wrap gap-1",
				children: [
					["stations", "Stations"],
					["experiences", "Experiences"],
					["directory", "Directory"],
					["review", reviewOpen ? `Review (${reviewOpen})` : "Review"],
					["r2", "R2"],
					["services", "Services"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => pickTab(id),
					className: cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", tab === id ? "bg-fg text-bg" : "text-gold"),
					children: label
				}, id))
			}),
			tab === "stations" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskStations, {
				channels,
				r2Configured
			}) : null,
			tab === "experiences" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskExperiences, { channels }) : null,
			tab === "directory" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskDirectory, { catalog: catalog.channels.length ? catalog : getCatalog() }) : null,
			tab === "review" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskReview, {}) : null,
			tab === "r2" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(R2Board, {
				channels,
				r2Configured
			}) : null,
			tab === "services" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServicesBoard, {
				r2Configured,
				lamps
			}) : null
		]
	});
}
function DeskOverview({ channels, reviewOpen }) {
	const songs = channels.reduce((sum, channel) => sum + channel.tracks.filter((track) => track.enabled !== false).length, 0);
	const offAir = channels.filter((channel) => !channel.enabled).length;
	const empty = channels.filter((channel) => channel.enabled && channel.tracks.filter((track) => track.enabled !== false).length === 0).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
		children: [
			channels.length,
			" stations · ",
			songs,
			" songs",
			offAir ? ` · ${offAir} off air` : "",
			empty ? ` · ${empty} empty` : "",
			reviewOpen ? ` · ${reviewOpen} in review` : ""
		]
	});
}
function DeskLocked() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Station desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Unlock"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-muted",
				children: "C accounts sign in with Google or X. Google still opens on the Terrainfinity hub."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignInChoices, { next: "/desk" })
			})
		]
	});
}
function R2Board({ channels, r2Configured }) {
	const [prefix, setPrefix] = (0, import_react.useState)("radio/");
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [error, setError] = (0, import_react.useState)("");
	const [objects, setObjects] = (0, import_react.useState)([]);
	const [from, setFrom] = (0, import_react.useState)("");
	const [to, setTo] = (0, import_react.useState)("");
	const [assign, setAssign] = (0, import_react.useState)(channels[0]?.slug ? [channels[0].slug] : []);
	const [picked, setPicked] = (0, import_react.useState)([]);
	const [onlyNew, setOnlyNew] = (0, import_react.useState)(true);
	const [filter, setFilter] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	function refresh(nextPrefix = prefix) {
		setStatus("loading");
		listStationR2({ data: {
			prefix: nextPrefix,
			maxKeys: 800
		} }).then((result) => {
			setObjects(result.objects);
			setStatus(result.ok ? "ready" : "error");
			setError(result.ok ? "" : result.error || "Could not list.");
		}).catch((err) => {
			setStatus("error");
			setError(err instanceof Error ? err.message : "Could not list.");
		});
	}
	function toggleAssign(slug) {
		setAssign((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]);
	}
	function togglePick(key) {
		setPicked((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
	}
	const keyIndex = (0, import_react.useMemo)(() => buildDeskKeyIndex(channels), [channels]);
	const rows = (0, import_react.useMemo)(() => {
		const needle = filter.trim().toLowerCase();
		return objects.map((object) => ({
			...object,
			audio: isAudioKey(object.key),
			desks: desksForKey(keyIndex, object.key),
			title: titleFromR2Key(object.key)
		})).filter((object) => {
			if (onlyNew && object.audio && object.desks.length > 0) return false;
			if (onlyNew && !object.audio) return false;
			if (needle && !`${object.title} ${object.key}`.toLowerCase().includes(needle)) return false;
			return true;
		}).slice(0, 80);
	}, [
		objects,
		keyIndex,
		onlyNew,
		filter
	]);
	async function importKeys(keys) {
		const items = objects.filter((object) => keys.includes(object.key) && isAudioKey(object.key)).map((object) => ({
			key: object.key,
			url: object.url,
			title: titleFromR2Key(object.key)
		}));
		if (!items.length || assign.length === 0) {
			window.alert(assign.length === 0 ? "Pick at least one station." : "Pick audio files to import.");
			return;
		}
		setBusy(true);
		try {
			const result = await importR2Tracks({ data: {
				channelSlugs: assign,
				items
			} });
			applySnapshot(result.tracks, result.stations);
			setPicked([]);
			window.alert(result.added ? `Added ${result.added} song${result.added === 1 ? "" : "s"}${result.skipped ? ` · ${result.skipped} already listed` : ""}` : "Those files are already on the selected station(s).");
			refresh();
		} catch (err) {
			window.alert(err instanceof Error ? err.message : "Import failed");
		} finally {
			setBusy(false);
		}
	}
	if (!r2Configured) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8 rounded-xl bg-bg-elevated p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
			children: "R2"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-muted",
			children: "Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in Vercel. The Services tab will turn those lamps green."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-prose text-sm text-muted",
				children: "Pick a station folder to scan. The whole bucket is too large to list on open — this tab waits until you ask."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setPrefix("radio/");
						refresh("radio/");
					},
					className: cn("inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em]", prefix === "radio/" ? "bg-fg text-bg" : "text-gold"),
					children: "All radio/"
				}), channels.map((channel) => {
					const folder = `radio/${channel.slug}/`;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setPrefix(folder);
							setAssign([channel.slug]);
							refresh(folder);
						},
						className: cn("inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em]", prefix === folder ? "bg-fg text-bg" : "text-gold"),
						children: channel.name
					}, channel.slug);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-3 flex flex-wrap gap-2",
				onSubmit: (event) => {
					event.preventDefault();
					refresh(prefix);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input min-w-64 flex-1",
					value: prefix,
					onChange: (event) => setPrefix(event.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
					children: "List"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setOnlyNew((value) => !value),
					className: cn("inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em]", onlyNew ? "bg-fg text-bg" : "text-gold"),
					children: onlyNew ? "New audio only" : "Show all files"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input min-w-48 flex-1",
					value: filter,
					onChange: (event) => setFilter(event.target.value),
					placeholder: "Filter keys"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
				children: "Import onto"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 flex flex-wrap gap-1",
				children: channels.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => toggleAssign(channel.slug),
					className: cn("inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em]", assign.includes(channel.slug) ? "bg-fg text-bg" : "text-gold"),
					children: channel.name
				}, channel.slug))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy || picked.length === 0,
					onClick: () => void importKeys(picked),
					className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
					children: busy ? "Importing…" : `Import selected (${picked.length})`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy || rows.filter((item) => item.audio && item.desks.length === 0).length === 0,
					onClick: () => void importKeys(rows.filter((item) => item.audio && item.desks.length === 0).map((item) => item.key)),
					className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
					children: "Import all new"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 flex flex-wrap gap-2",
				onSubmit: (event) => {
					event.preventDefault();
					if (!from.trim() || !to.trim()) return;
					moveR2Object({ data: {
						from: from.trim(),
						to: to.trim()
					} }).then(() => {
						setFrom("");
						setTo("");
						refresh();
					}).catch((err) => window.alert(err instanceof Error ? err.message : "Move failed"));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input min-w-48 flex-1",
						value: from,
						onChange: (event) => setFrom(event.target.value),
						placeholder: "Move from key"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input min-w-48 flex-1",
						value: to,
						onChange: (event) => setTo(event.target.value),
						placeholder: "to key"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
						children: "Move"
					})
				]
			}),
			status === "idle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "Choose a station folder above, or type a prefix and list."
			}) : null,
			status === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "Listing this folder… the rest of the desk stays usable."
			}) : null,
			status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-ember",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 max-h-[28rem] space-y-1 overflow-y-auto rounded-xl bg-bg-elevated p-3",
				children: rows.map((object) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center gap-2 py-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-w-0 flex-1 items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: picked.includes(object.key),
								disabled: !object.audio,
								onChange: () => togglePick(object.key),
								className: "size-4"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate font-mono text-[11px] text-subtle",
									children: object.key
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
									children: [formatBytes(object.size), object.audio ? object.desks.length ? ` · on ${object.desks.map((slug) => channels.find((item) => item.slug === slug)?.name || slug).join(", ")}` : " · not on a station" : " · not audio"]
								})]
							})]
						}),
						object.audio ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy,
							onClick: () => void importKeys([object.key]),
							className: "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
							children: "Import"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setFrom(object.key);
								setTo(object.key);
							},
							className: "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
							children: "Move"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								if (!window.confirm(`Delete ${object.key}?`)) return;
								deleteR2Object({ data: { key: object.key } }).then(() => refresh()).catch((err) => window.alert(err instanceof Error ? err.message : "Delete failed"));
							},
							className: "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ember",
							children: "Delete"
						})
					]
				}, object.key))
			})
		]
	});
}
function ServicesBoard({ r2Configured, lamps }) {
	const [ping, setPing] = (0, import_react.useState)(null);
	const [pinging, setPinging] = (0, import_react.useState)(false);
	const groups = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const lamp of lamps) {
			const list = map.get(lamp.group) ?? [];
			list.push(lamp);
			map.set(lamp.group, list);
		}
		return [...map.entries()];
	}, [lamps]);
	const ready = lamps.filter((lamp) => lamp.required).every((lamp) => lamp.set);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "Production keys"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 max-w-prose text-muted",
				children: ["Put secrets in Vercel on the production project. This desk never shows the values — only whether each key is present. ", ready ? "Required lamps are green." : "Some required lamps are still dark."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
				children: ["R2 ", r2Configured ? "live" : "missing"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-4 max-w-prose space-y-2 text-sm text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "AUTH_SECRET must match the Terrainfinity hub so radio can mint and read the shared session." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "SSO_HUB must be https://www.terrainfinity.ca. Do not set AUTH_URL to the hub — Radio already mounts /api/auth/* for the Grok session." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "AUTH_COOKIE_DOMAIN=.terrainfinity.ca only on radio.terrainfinity.ca. radio.cyber-athens.ca uses the consume handoff instead of a shared cookie." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "DATABASE_URL is the shared Postgres with the hub — playlist, aliases, and station edits live here. On Vercel use the Supabase Connection pooling URI (Transaction or Session, host *.pooler.supabase.com), not the direct db.*.supabase.co host. Direct URIs are often IPv6-only and fail on Vercel unless an IPv4 add-on is attached." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "R2_ACCOUNT_ID + R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY open the media bucket. R2_BUCKET defaults to media-empire-radio." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: pinging,
				onClick: () => {
					setPinging(true);
					pingServices().then(setPing).catch((error) => window.alert(error instanceof Error ? error.message : "Ping failed")).finally(() => setPinging(false));
				},
				className: "mt-4 inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
				children: pinging ? "Pinging…" : "Test hub + R2"
			}),
			ping ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 space-y-2 text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					"Hub ",
					ping.hub.origin,
					" — ",
					ping.hub.ok ? "reachable" : "dark",
					" (",
					ping.hub.note,
					")."
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					"R2 — ",
					ping.r2.ok ? ping.r2.note : ping.r2.note,
					"."
				] })]
			}) : null,
			groups.map(([group, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
					children: group
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-3",
					children: items.map((lamp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("env-dot mt-1.5", lamp.set ? "env-dot-on" : "env-dot-off") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-[12px] uppercase tracking-[0.12em]",
								children: lamp.key
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									lamp.label,
									lamp.required ? " · required" : " · optional",
									" — ",
									lamp.set ? "active" : "missing",
									". ",
									lamp.hint
								]
							})]
						})]
					}, lamp.key))
				})]
			}, group))
		]
	});
}
//#endregion
export { DeskPage as component };
