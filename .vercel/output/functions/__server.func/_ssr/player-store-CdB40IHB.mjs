import { i as isLoopingVisual, o as mediaUrl } from "./media-ChlF6fRc.mjs";
import { A as nextForward, C as stationSkin, D as durationOf, I as walkFrom, L as endPad, M as rememberDuration, N as resolveLivePlayhead, R as radioEngine, _ as patchTrackDuration, b as shuffleActive, h as normalizeShuffle, i as getPlayableTracks, j as nextShuffled, k as neighborTrack, l as isAdultTrack, m as normalizeKind, n as getCatalog, r as getChannel, u as isChannelNsfw, y as setLiveCatalog } from "./catalog-DmckmNNR.mjs";
import { f as parsePhenomenon } from "./phenomena-DIQMhlVR.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/player-store-CdB40IHB.js
function parseListenMode(value) {
	const raw = (value || "").toLowerCase().trim();
	if (raw === "stream" || raw === "live" || raw === "clock") return "stream";
	if (raw === "ondemand" || raw === "on-demand" || raw === "demand" || raw === "vault") return "ondemand";
	return null;
}
/** Session override from ?listen=stream or #stream — does not rewrite the saved default. */
function listenModeFromLocation(search = "", hash = "") {
	try {
		const q = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
		const fromQuery = parseListenMode(q.get("listen") || q.get("mode"));
		if (fromQuery) return fromQuery;
	} catch {}
	const token = hash.replace(/^#/, "").split("&")[0];
	return parseListenMode(token);
}
/**
* How this listener hears this desk.
* Desk kind wins for fixed / vault. Live desks honor stream vs on-demand overlay.
*/
function effectiveKind(channel, listenMode) {
	if (!channel) return "live";
	const desk = normalizeKind(channel.kind || channel.mode);
	if (desk === "fixed" || desk === "ondemand") return desk;
	return listenMode === "stream" ? "live" : "ondemand";
}
function isOnDemandOverlay(channel, listenMode) {
	if (!channel) return false;
	return normalizeKind(channel.kind || channel.mode) === "live" && listenMode === "ondemand";
}
function listenModeLabel(mode) {
	return mode === "stream" ? "Streaming" : "On demand";
}
function listenModeHint(mode) {
	if (mode === "stream") return "Join the shared station clock when the desk is live.";
	return "Your own pace. Skip and seek freely. Jump to live when you want the clock.";
}
/** Pages that own the desk: do not restore lastSlug from another station. */
function pageCuesPlayback(pathname) {
	if (pathname.startsWith("/channel/")) return true;
	if (experienceSlugFromPath(pathname)) return true;
	if (pathname.startsWith("/player/") && pathname.length > 8) return true;
	const parts = pathname.split("/").filter(Boolean);
	if (parts.length !== 1) return false;
	return ![
		"library",
		"experiences",
		"desk",
		"about",
		"login",
		"logout",
		"player",
		"songs"
	].includes(parts[0]);
}
function experienceSlugFromPath(pathname) {
	const parts = pathname.split("/").filter(Boolean);
	if (parts[0] !== "experiences" || !parts[1] || parts.length !== 2) return null;
	try {
		return decodeURIComponent(parts[1]).toLowerCase();
	} catch {
		return parts[1].toLowerCase();
	}
}
var XP_PREFIX = "xp.v1.";
function toB64(value) {
	if (typeof Buffer !== "undefined") return Buffer.from(value, "utf8").toString("base64url");
	const bytes = new TextEncoder().encode(value);
	let bin = "";
	bytes.forEach((b) => {
		bin += String.fromCharCode(b);
	});
	return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromB64(value) {
	const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
	if (typeof Buffer !== "undefined") return Buffer.from(padded, "base64").toString("utf8");
	const bin = atob(padded);
	const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}
function encodeXpTag(draft) {
	return XP_PREFIX + toB64(JSON.stringify({
		slug: (draft.slug || "").trim(),
		title: draft.title.trim(),
		kicker: draft.kicker.trim(),
		line: draft.line.trim(),
		whisper: draft.whisper.trim(),
		summary: draft.summary.trim(),
		bpm: Number.isFinite(draft.bpm) ? draft.bpm : 120,
		phenomenon: parsePhenomenon(draft.phenomenon),
		captions: (draft.captions ?? []).map((line) => String(line).trim()).filter(Boolean).slice(0, 6)
	}));
}
function decodeXpTag(tag) {
	if (!tag || !tag.startsWith(XP_PREFIX)) return null;
	try {
		const parsed = JSON.parse(fromB64(tag.slice(6)));
		return {
			slug: String(parsed.slug ?? "").trim(),
			title: String(parsed.title ?? "").trim(),
			kicker: String(parsed.kicker ?? "").trim(),
			line: String(parsed.line ?? "").trim(),
			whisper: String(parsed.whisper ?? "").trim(),
			summary: String(parsed.summary ?? "").trim(),
			bpm: Number.isFinite(Number(parsed.bpm)) ? Number(parsed.bpm) : 120,
			phenomenon: parsePhenomenon(parsed.phenomenon),
			captions: Array.isArray(parsed.captions) ? parsed.captions.map((line) => String(line ?? "").trim()).filter(Boolean).slice(0, 6) : []
		};
	} catch {
		return null;
	}
}
function xpFromTags(tags) {
	if (!tags) return null;
	for (const tag of tags) {
		const xp = decodeXpTag(tag);
		if (xp) return xp;
	}
	return null;
}
function mergeXpTags(tags, draft) {
	const rest = (tags ?? []).filter((tag) => !tag.startsWith(XP_PREFIX) && tag !== "experience");
	return [
		encodeXpTag(draft),
		"experience",
		...rest
	].join(", ");
}
var EXPERIENCES = [{
	slug: "rose",
	stationSlug: "rose",
	title: "Rose",
	kicker: "Bad Wolf Opera · 2137",
	line: "Paradise is in our hands",
	whisper: "Pretty eyes, pretty eyes…",
	summary: "A fixed-order rite. Sailor-crystal neo-elf tech awakens into a Gallifreyan time war. The blue box holds the stage while the opera watches.",
	cover: "/covers/rose.jpg",
	loop: "/experiences/rose/vortex-storm.mp4",
	bpm: 120,
	phenomenon: "vortex",
	captions: [
		"The box is waiting",
		"Pretty eyes, pretty eyes…",
		"Paradise is in our hands",
		"Time war 2137"
	],
	stills: [
		{
			src: "/experiences/rose/rose-field.jpg",
			caption: "White rose field"
		},
		{
			src: "/experiences/rose/hero.jpg",
			caption: "The box takes the stage"
		},
		{
			src: "/experiences/rose/eyes.jpg",
			caption: "Pretty eyes, pretty eyes"
		},
		{
			src: "/experiences/rose/timewar.jpg",
			caption: "Time war 2137"
		}
	]
}];
function experienceFromChannel(channel) {
	const packed = xpFromTags(channel.tags);
	const seed = EXPERIENCES.find((item) => item.stationSlug === channel.slug || item.slug === channel.slug);
	const flagged = (channel.tags ?? []).some((tag) => tag === "experience" || tag.startsWith(XP_PREFIX));
	if (!packed && !seed && !flagged) return void 0;
	return {
		slug: packed?.slug || seed?.slug || channel.slug,
		stationSlug: channel.slug,
		title: packed?.title || seed?.title || channel.name,
		kicker: packed?.kicker || seed?.kicker || channel.category || "Experience",
		line: packed?.line || seed?.line || channel.energy || "",
		whisper: packed?.whisper || seed?.whisper || "",
		summary: packed?.summary || seed?.summary || channel.description || "",
		cover: channel.cover || seed?.cover || "",
		loop: channel.videoUrl || channel.animationUrl || seed?.loop || "",
		bpm: packed?.bpm || seed?.bpm || 120,
		captions: packed?.captions?.length ? packed.captions : seed?.captions ?? [],
		stills: seed?.stills ?? [],
		phenomenon: packed?.phenomenon || seed?.phenomenon || "vortex"
	};
}
function listExperiences(catalog) {
	const channels = catalog?.channels ?? [];
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const channel of channels) {
		const xp = experienceFromChannel(channel);
		if (!xp) continue;
		seen.add(xp.slug);
		seen.add(xp.stationSlug);
		out.push(xp);
	}
	for (const seed of EXPERIENCES) {
		if (seen.has(seed.slug) || seen.has(seed.stationSlug)) continue;
		out.push(seed);
	}
	return out;
}
function getExperience(slug, catalog) {
	if (!slug) return void 0;
	const key = slug.toLowerCase();
	return listExperiences(catalog).find((item) => item.slug === key || item.stationSlug === key);
}
function experienceForStation(slug, catalog) {
	if (!slug) return void 0;
	const key = slug.toLowerCase();
	return listExperiences(catalog).find((item) => item.stationSlug === key);
}
/**
* Lock-screen / headset controls for the single HTMLAudioElement deck.
* iOS Safari is best-effort; Chrome/Brave/Android is the primary win.
* Media Session attaches after the first user-gesture unlocked play.
*/
var lastArtwork = "";
var lastTitle = "";
var lastSkip = null;
var lastPosAt = 0;
var bound = false;
function session() {
	if (typeof navigator === "undefined") return null;
	return navigator.mediaSession ?? null;
}
function absoluteArt(src) {
	const url = mediaUrl(src);
	if (!url) return "";
	if (/^https?:\/\//i.test(url)) return url;
	if (typeof window === "undefined") return "";
	try {
		return new URL(url, window.location.origin).href;
	} catch {
		return "";
	}
}
function artworkList(track, channel) {
	const cover = track.coverUrl || channel?.cover;
	const still = isLoopingVisual(cover) ? channel?.cover : cover;
	const href = absoluteArt(still && !isLoopingVisual(still) ? still : cover);
	if (!href || !/^https?:\/\//i.test(href)) return [];
	return [
		{
			src: href,
			sizes: "96x96",
			type: "image/jpeg"
		},
		{
			src: href,
			sizes: "256x256",
			type: "image/jpeg"
		},
		{
			src: href,
			sizes: "512x512",
			type: "image/jpeg"
		}
	];
}
function playbackState(status) {
	if (status === "playing") return "playing";
	if (status === "paused" || status === "loading") return "paused";
	return "none";
}
function bindMediaSession(getSnapshot, actions) {
	const ms = session();
	if (!ms || bound) return;
	bound = true;
	const run = (fn) => {
		try {
			fn();
		} catch {}
	};
	const handle = (name, fn) => {
		try {
			ms.setActionHandler(name, fn);
		} catch {}
	};
	handle("play", () => run(actions.play));
	handle("pause", () => run(actions.pause));
	handle("stop", () => run(actions.pause));
	const applySkipHandlers = (allowed) => {
		handle("nexttrack", allowed ? () => run(actions.next) : null);
		handle("previoustrack", allowed ? () => run(actions.prev) : null);
		handle("seekto", allowed ? (details) => {
			if (typeof details.seekTime === "number") run(() => actions.seek(details.seekTime));
		} : null);
		handle("seekbackward", allowed ? (details) => {
			const off = details.seekOffset || 10;
			const snap = getSnapshot();
			run(() => actions.seek(Math.max(0, snap.currentTime - off)));
		} : null);
		handle("seekforward", allowed ? (details) => {
			const off = details.seekOffset || 10;
			const snap = getSnapshot();
			run(() => actions.seek(snap.currentTime + off));
		} : null);
	};
	applySkipHandlers(false);
	const sync = () => {
		const snap = getSnapshot();
		const channel = snap.channelSlug ? getChannel(snap.channelSlug) : void 0;
		ms.playbackState = playbackState(snap.status);
		if (snap.track) {
			const title = snap.track.title;
			const art = (snap.track.coverUrl || channel?.cover || "") + title;
			if (title !== lastTitle || art !== lastArtwork) {
				lastTitle = title;
				lastArtwork = art;
				try {
					ms.metadata = new MediaMetadata({
						title: snap.track.title,
						artist: snap.track.artist || channel?.name || "Radio",
						album: channel?.name || "Radio",
						artwork: artworkList(snap.track, channel)
					});
				} catch {}
			}
		}
		const skip = snap.skipAllowed && snap.seekAllowed;
		if (lastSkip !== skip) {
			lastSkip = skip;
			applySkipHandlers(skip);
		}
		const now = typeof performance !== "undefined" ? performance.now() : Date.now();
		if (now - lastPosAt < 900) return;
		lastPosAt = now;
		const duration = snap.duration;
		const position = snap.currentTime;
		if (duration >= .5 && Number.isFinite(duration) && Number.isFinite(position) && position >= 0) try {
			ms.setPositionState({
				duration,
				playbackRate: 1,
				position: Math.min(position, duration)
			});
		} catch {}
	};
	bindMediaSession._sync = sync;
	sync();
}
function syncMediaSession() {
	bindMediaSession._sync?.();
}
function flushMediaSession() {
	lastPosAt = 0;
	lastArtwork = "";
	lastTitle = "";
	lastSkip = null;
	syncMediaSession();
}
function rebindMediaSession() {
	bound = false;
	lastArtwork = "";
	lastTitle = "";
	lastSkip = null;
}
/** Never pause the deck just because the screen went dark. */
function ignoreHidePause() {
	if (typeof document === "undefined") return;
	document.addEventListener("visibilitychange", () => {
		radioEngine.snapshot();
	});
	window.addEventListener("pagehide", () => {});
	window.addEventListener("pageshow", () => {
		rebindMediaSession();
	});
}
var AUTO_CACHE_BYTES_TIGHT = 8388608;
var AUTO_CACHE_BYTES_ROOMY = 16777216;
var FORCE_CACHE_BYTES = 50331648;
var BUDGET_TIGHT = 125829120;
var BUDGET_ROOMY = 419430400;
function isFiniteAudioUrl(url) {
	if (!url) return false;
	const raw = url.trim();
	if (!raw || raw.startsWith("blob:") || raw.startsWith("data:")) return false;
	const path = raw.split(/[?#]/)[0].toLowerCase();
	if (/\.(m3u8|mpd|m3u)$/.test(path)) return false;
	if (/(^|\/)(icy|icecast|hls|livestream)(\/|$)/.test(path)) return false;
	if (/\/stream(?:\.|\/|$)/.test(path)) return false;
	if (/\.(mp3|m4a|aac|ogg|opus|wav|flac|mp4)$/.test(path)) return true;
	try {
		const host = new URL(raw, "https://r2.terrainfinity.ca").hostname.toLowerCase();
		if (host.endsWith(".r2.dev") || host.endsWith(".r2.cloudflarestorage.com") || host === "r2.terrainfinity.ca") return true;
	} catch {}
	return false;
}
function isDataSaverConnection(conn) {
	if (!conn) return false;
	if (conn.saveData) return true;
	return String(conn.type || "").toLowerCase() === "cellular";
}
function isTightStorage(opts = {}) {
	if (opts.saveData || String(opts.type || "").toLowerCase() === "cellular") return true;
	if ((opts.width ?? 9999) <= 700) return true;
	const ua = (opts.ua ?? "").toLowerCase();
	return /iphone|ipod|ipad|android|mobile|watch/.test(ua);
}
function cacheBudgetBytes(quota, tight) {
	const cap = tight ? BUDGET_TIGHT : BUDGET_ROOMY;
	const frac = tight ? .18 : .35;
	if (!quota || !Number.isFinite(quota) || quota <= 0) return cap;
	return Math.max(8388608, Math.min(cap, Math.floor(quota * frac)));
}
function maxCachedTracks(tight) {
	return tight ? 8 : 20;
}
function maxKeepBytes(opts) {
	if (opts.force) return FORCE_CACHE_BYTES;
	return opts.tight ? AUTO_CACHE_BYTES_TIGHT : AUTO_CACHE_BYTES_ROOMY;
}
function shouldHoldAutoAdvance(dataSaver, nextCached) {
	return dataSaver && !nextCached;
}
function shouldAutoKeep(opts) {
	if (opts.force) return opts.bytes == null || opts.bytes <= 50331648;
	if (opts.dataSaver) return false;
	if (opts.listenedRatio != null && opts.listenedRatio < .72) return false;
	if (opts.bytes != null && opts.bytes > maxKeepBytes({ tight: opts.tight })) return false;
	return true;
}
function cacheOrder(a, b) {
	const ap = a.pinned ? 1 : 0;
	const bp = b.pinned ? 1 : 0;
	if (ap !== bp) return ap - bp;
	return a.lastUsed - b.lastUsed;
}
function lruVictims(entries, need) {
	if (need <= 0) return [];
	const ordered = [...entries].sort(cacheOrder);
	const out = [];
	let freed = 0;
	for (const row of ordered) {
		out.push(row.id);
		freed += row.size;
		if (freed >= need) break;
	}
	return out;
}
function overflowVictims(entries, maxCount) {
	if (entries.length <= maxCount) return [];
	return [...entries].sort(cacheOrder).slice(0, entries.length - maxCount).map((row) => row.id);
}
/** Device-local copies of finite audio. Player src stays R2 unless a full file is already here. */
var DB_NAME = "radio137-audio";
var STORE = "files";
var DB_VERSION = 2;
var inflight = /* @__PURE__ */ new Map();
var objectUrls = /* @__PURE__ */ new Map();
var known = /* @__PURE__ */ new Set();
var knownReady = null;
var cacheGen = 0;
var cacheSubs = /* @__PURE__ */ new Set();
function bumpCache() {
	cacheGen += 1;
	for (const sub of cacheSubs) sub();
}
function subscribeAudioCache(fn) {
	cacheSubs.add(fn);
	return () => cacheSubs.delete(fn);
}
function audioCacheGeneration() {
	return cacheGen;
}
function dataSaverOn() {
	if (typeof navigator === "undefined") return false;
	const nav = navigator;
	return isDataSaverConnection(nav.connection ?? nav.mozConnection ?? null);
}
function tightStorageOn() {
	if (typeof navigator === "undefined") return false;
	const nav = navigator;
	const conn = nav.connection ?? nav.mozConnection ?? null;
	const width = typeof window === "undefined" ? 9999 : window.innerWidth;
	return isTightStorage({
		ua: navigator.userAgent,
		width,
		saveData: conn?.saveData,
		type: conn?.type
	});
}
function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
function tx(mode, run) {
	return openDb().then((db) => new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE, mode);
		const request = run(transaction.objectStore(STORE));
		transaction.oncomplete = () => resolve(request ? request.result : void 0);
		transaction.onerror = () => reject(transaction.error);
		if (request) request.onerror = () => reject(request.error);
	}));
}
async function allRows() {
	return tx("readonly", (store) => store.getAll());
}
async function hydrateKnown() {
	if (typeof indexedDB === "undefined") return;
	knownReady ??= allRows().then((rows) => {
		known.clear();
		for (const row of rows) known.add(row.id);
		bumpCache();
	}).catch(() => {
		knownReady = null;
	});
	await knownReady;
}
async function hasCachedAudio(id) {
	if (known.has(id)) return true;
	await hydrateKnown();
	return known.has(id);
}
async function getCachedAudio(id) {
	try {
		const row = await tx("readonly", (store) => store.get(id));
		if (!row?.blob) return null;
		known.add(id);
		return row.blob;
	} catch {
		return null;
	}
}
function revoke(id) {
	const prev = objectUrls.get(id);
	if (prev) {
		URL.revokeObjectURL(prev);
		objectUrls.delete(id);
	}
}
function releaseOtherObjectUrls(keepId) {
	for (const id of [...objectUrls.keys()]) if (id !== keepId) revoke(id);
}
async function forgetCachedAudio(id) {
	revoke(id);
	known.delete(id);
	try {
		await tx("readwrite", (store) => store.delete(id));
	} catch {}
	bumpCache();
}
async function clearCachedAudio() {
	for (const id of [...objectUrls.keys()]) revoke(id);
	known.clear();
	try {
		await tx("readwrite", (store) => store.clear());
	} catch {}
	bumpCache();
}
async function cacheUsage() {
	const tight = tightStorageOn();
	let quota;
	try {
		quota = (await navigator.storage?.estimate?.())?.quota;
	} catch {}
	const budget = cacheBudgetBytes(quota, tight);
	try {
		const rows = await allRows();
		return {
			used: rows.reduce((sum, row) => sum + (row.size || 0), 0),
			count: rows.length,
			budget
		};
	} catch {
		return {
			used: 0,
			count: 0,
			budget
		};
	}
}
async function budgetBytes() {
	try {
		return cacheBudgetBytes((await navigator.storage?.estimate?.())?.quota, tightStorageOn());
	} catch {
		return cacheBudgetBytes(void 0, tightStorageOn());
	}
}
async function putWithLru(row) {
	const budget = await budgetBytes();
	if (row.size > budget) return;
	const cap = maxCachedTracks(tightStorageOn());
	let rows = [];
	try {
		rows = await allRows();
	} catch {
		return;
	}
	const others = rows.filter((item) => item.id !== row.id);
	const need = others.reduce((sum, item) => sum + (item.size || 0), 0) + row.size - budget;
	const drop = /* @__PURE__ */ new Set([...need > 0 ? lruVictims(others, need) : [], ...overflowVictims([...others, row], cap).filter((id) => id !== row.id)]);
	for (const id of drop) await forgetCachedAudio(id);
	await tx("readwrite", (store) => store.put(row));
	known.add(row.id);
	bumpCache();
}
async function touchCached(id, patch) {
	try {
		const row = await tx("readonly", (store) => store.get(id));
		if (!row) return;
		row.lastUsed = Date.now();
		if (patch?.pinned != null) row.pinned = patch.pinned;
		if (patch?.url) row.url = patch.url;
		await tx("readwrite", (store) => store.put(row));
	} catch {}
}
async function pinCachedAudio(id, pinned) {
	await touchCached(id, { pinned });
}
async function playableSrc(track) {
	const remote = mediaUrl(track.audioUrl);
	if (!isFiniteAudioUrl(track.audioUrl)) return remote;
	releaseOtherObjectUrls(track.id);
	const existing = objectUrls.get(track.id);
	if (existing && known.has(track.id)) {
		touchCached(track.id);
		return existing;
	}
	const blob = await getCachedAudio(track.id);
	if (!blob) return remote;
	try {
		const row = await tx("readonly", (store) => store.get(track.id));
		if (row?.url && row.url !== remote) {
			await forgetCachedAudio(track.id);
			return remote;
		}
	} catch {}
	revoke(track.id);
	const url = URL.createObjectURL(blob);
	objectUrls.set(track.id, url);
	touchCached(track.id);
	return url;
}
async function pullFullFile(url, maxBytes) {
	const res = await fetch(url, {
		mode: "cors",
		credentials: "omit",
		cache: "force-cache"
	});
	if (!res.ok || res.status === 206) return null;
	const declared = Number(res.headers.get("content-length") || 0);
	if (declared && declared > maxBytes) {
		try {
			await res.body?.cancel();
		} catch {}
		return null;
	}
	if (!res.body) {
		const blob = await res.blob();
		if (!blob.size || blob.size > maxBytes) return null;
		if (declared && blob.size < declared * .98) return null;
		return blob;
	}
	const reader = res.body.getReader();
	const chunks = [];
	let size = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		if (!value) continue;
		size += value.byteLength;
		if (size > maxBytes) {
			await reader.cancel();
			return null;
		}
		chunks.push(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
	}
	if (!size) return null;
	if (declared && size < declared * .98) return null;
	return new Blob(chunks, { type: res.headers.get("content-type") || "audio/mpeg" });
}
function rememberAudio(track, opts) {
	if (typeof window === "undefined") return;
	if (!isFiniteAudioUrl(track.audioUrl)) return;
	const tight = tightStorageOn();
	const saver = dataSaverOn();
	if (!shouldAutoKeep({
		force: opts?.force,
		dataSaver: saver,
		tight,
		listenedRatio: opts?.listenedRatio
	})) return;
	const id = track.id;
	if (inflight.has(id)) return;
	const url = mediaUrl(track.audioUrl);
	const cap = maxKeepBytes({
		force: opts?.force,
		tight
	});
	const work = (async () => {
		try {
			if (await hasCachedAudio(id)) {
				await touchCached(id, {
					pinned: opts?.force ? true : void 0,
					url
				});
				return;
			}
			const blob = await pullFullFile(url, cap);
			if (!blob) return;
			if (!shouldAutoKeep({
				force: opts?.force,
				dataSaver: saver,
				tight,
				bytes: blob.size,
				listenedRatio: opts?.listenedRatio
			})) return;
			await putWithLru({
				id,
				url,
				blob,
				size: blob.size,
				type: blob.type || "audio/mpeg",
				savedAt: Date.now(),
				lastUsed: Date.now(),
				pinned: Boolean(opts?.force)
			});
		} catch {}
	})();
	inflight.set(id, work);
	work.finally(() => {
		if (inflight.get(id) === work) inflight.delete(id);
	});
}
async function warmTrackSrc(track) {
	const src = await playableSrc(track);
	if (!src.startsWith("blob:")) return null;
	return src;
}
async function downloadAudio(track, filename) {
	const name = filename || "track.mp3";
	let blob = await getCachedAudio(track.id);
	if (!blob && isFiniteAudioUrl(track.audioUrl)) {
		blob = await pullFullFile(mediaUrl(track.audioUrl), FORCE_CACHE_BYTES);
		if (blob) await putWithLru({
			id: track.id,
			url: mediaUrl(track.audioUrl),
			blob,
			size: blob.size,
			type: blob.type || "audio/mpeg",
			savedAt: Date.now(),
			lastUsed: Date.now(),
			pinned: true
		});
	}
	if (!blob) {
		window.location.assign(mediaUrl(track.audioUrl));
		return;
	}
	const href = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = href;
	link.download = name;
	link.rel = "noopener";
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.setTimeout(() => URL.revokeObjectURL(href), 4e3);
}
var KEY = "radio.persist.v4";
var LEGACY = "radio.persist.v3";
var defaults = {
	autoplay: true,
	lastSlug: null,
	lastTrackId: null,
	lastOffsetSec: 0,
	visited: false,
	playerCollapsed: true,
	playerHidden: false,
	volume: .85,
	muted: false,
	identityName: null,
	points: 0,
	glaumules: 0,
	liked: [],
	favorites: [],
	shuffleBySlug: {},
	listenMode: "ondemand"
};
function loadPersisted() {
	if (typeof window === "undefined") return defaults;
	try {
		const raw = window.localStorage.getItem(KEY) || window.localStorage.getItem(LEGACY);
		if (!raw) return defaults;
		const parsed = JSON.parse(raw);
		return {
			...defaults,
			...parsed,
			autoplay: parsed.autoplay === false ? false : parsed.autoplay === true ? true : defaults.autoplay,
			liked: Array.isArray(parsed.liked) ? parsed.liked : [],
			favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
			shuffleBySlug: parsed.shuffleBySlug && typeof parsed.shuffleBySlug === "object" ? parsed.shuffleBySlug : {},
			points: Number.isFinite(parsed.points) ? Number(parsed.points) : 0,
			glaumules: Number.isFinite(parsed.glaumules) ? Number(parsed.glaumules) : 0,
			lastTrackId: typeof parsed.lastTrackId === "string" && parsed.lastTrackId ? parsed.lastTrackId : null,
			lastOffsetSec: Number.isFinite(parsed.lastOffsetSec) ? Math.max(0, Number(parsed.lastOffsetSec)) : 0,
			volume: Number.isFinite(parsed.volume) ? Math.min(1, Math.max(0, Number(parsed.volume))) : .85,
			muted: Boolean(parsed.muted),
			playerHidden: Boolean(parsed.playerHidden),
			listenMode: parseListenMode(parsed.listenMode) ?? "ondemand"
		};
	} catch {
		return defaults;
	}
}
function savePersisted(value) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEY, JSON.stringify(value));
	} catch {}
}
var PLAYBACK_LOCK_KEY = "radio.playback.leader";
var PLAYBACK_CHANNEL = "radio137.playback";
var LEADER_TTL_MS = 8e3;
var LEADER_HEARTBEAT_MS = 2500;
function parseLeader(raw) {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed.tabId !== "string" || !parsed.tabId) return null;
		if (!Number.isFinite(Number(parsed.at))) return null;
		return {
			tabId: parsed.tabId,
			at: Number(parsed.at),
			trackId: typeof parsed.trackId === "string" ? parsed.trackId : null,
			title: typeof parsed.title === "string" ? parsed.title : null,
			slug: typeof parsed.slug === "string" ? parsed.slug : null
		};
	} catch {
		return null;
	}
}
function leaderIsOther(peer, selfId, now, ttl = LEADER_TTL_MS) {
	if (!peer || peer.tabId === selfId) return false;
	return now - peer.at < ttl;
}
function thisTabOwnsClock(isLeader, heldElsewhere) {
	return isLeader || !heldElsewhere;
}
function makeTabId() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
var PlaybackLock = class {
	tabId = typeof window === "undefined" ? "ssr" : makeTabId();
	channel = null;
	beat = null;
	leading = false;
	meta = {};
	handlers = null;
	started = false;
	start(handlers) {
		if (this.started || typeof window === "undefined") return;
		this.started = true;
		this.handlers = handlers;
		try {
			this.channel = new BroadcastChannel(PLAYBACK_CHANNEL);
			this.channel.addEventListener("message", (event) => this.onMessage(event.data));
		} catch {
			this.channel = null;
		}
		window.addEventListener("storage", this.onStorage);
		window.addEventListener("pagehide", this.onPageHide);
		window.addEventListener("beforeunload", this.onPageHide);
		const other = this.otherLeader();
		if (other) handlers.onYield(other);
	}
	isLeader() {
		return this.leading;
	}
	otherLeader(now = Date.now()) {
		if (typeof window === "undefined") return null;
		const peer = parseLeader(window.localStorage.getItem(PLAYBACK_LOCK_KEY));
		return leaderIsOther(peer, this.tabId, now) ? peer : null;
	}
	claim(meta = {}) {
		if (typeof window === "undefined") return;
		this.meta = meta;
		this.leading = true;
		const peer = this.peer();
		this.write(peer);
		this.post({
			kind: "claim",
			peer
		});
		this.pulse();
	}
	release() {
		if (!this.leading) return;
		this.leading = false;
		this.stopPulse();
		if (typeof window !== "undefined") {
			if (parseLeader(window.localStorage.getItem("radio.playback.leader"))?.tabId === this.tabId) window.localStorage.removeItem(PLAYBACK_LOCK_KEY);
		}
		this.post({
			kind: "release",
			tabId: this.tabId,
			at: Date.now()
		});
	}
	async probe(ms = 90) {
		const stored = this.otherLeader();
		if (stored) return stored;
		if (!this.channel) return null;
		this.post({
			kind: "probe",
			tabId: this.tabId,
			at: Date.now()
		});
		return new Promise((resolve) => {
			const finish = (peer) => {
				window.clearTimeout(timer);
				this.channel?.removeEventListener("message", onMsg);
				resolve(peer);
			};
			const onMsg = (event) => {
				const msg = event.data;
				if (msg?.kind === "here" && leaderIsOther(msg.peer, this.tabId, Date.now())) finish(msg.peer);
				if (msg?.kind === "claim" && leaderIsOther(msg.peer, this.tabId, Date.now())) finish(msg.peer);
			};
			const timer = window.setTimeout(() => finish(this.otherLeader()), ms);
			this.channel?.addEventListener("message", onMsg);
		});
	}
	peer() {
		return {
			tabId: this.tabId,
			at: Date.now(),
			...this.meta
		};
	}
	write(peer) {
		try {
			window.localStorage.setItem(PLAYBACK_LOCK_KEY, JSON.stringify(peer));
		} catch {}
	}
	post(msg) {
		try {
			this.channel?.postMessage(msg);
		} catch {}
	}
	pulse() {
		this.stopPulse();
		this.beat = window.setInterval(() => {
			if (!this.leading) return;
			const peer = this.peer();
			this.write(peer);
		}, LEADER_HEARTBEAT_MS);
	}
	stopPulse() {
		if (this.beat != null) window.clearInterval(this.beat);
		this.beat = null;
	}
	onMessage = (msg) => {
		if (!msg || typeof msg !== "object") return;
		if (msg.kind === "claim" && leaderIsOther(msg.peer, this.tabId, Date.now())) {
			this.leading = false;
			this.stopPulse();
			this.handlers?.onYield(msg.peer);
			return;
		}
		if (msg.kind === "release" && msg.tabId !== this.tabId) {
			this.handlers?.onReleased(msg.tabId);
			return;
		}
		if (msg.kind === "probe" && this.leading && msg.tabId !== this.tabId) this.post({
			kind: "here",
			peer: this.peer()
		});
	};
	onStorage = (event) => {
		if (event.key !== "radio.playback.leader") return;
		const peer = parseLeader(event.newValue);
		if (leaderIsOther(peer, this.tabId, Date.now())) {
			this.leading = false;
			this.stopPulse();
			this.handlers?.onYield(peer);
			return;
		}
		if (!peer && event.oldValue) {
			const old = parseLeader(event.oldValue);
			if (old && old.tabId !== this.tabId) this.handlers?.onReleased(old.tabId);
		}
	};
	onPageHide = (event) => {
		if ("persisted" in event && Boolean(event.persisted)) return;
		if (this.leading) this.release();
	};
};
var playbackLock = new PlaybackLock();
/** First-visit Tune In landing is only the bare home page. */
function isLandingLocation(pathname, search = "") {
	if (pathname !== "/") return false;
	const raw = search.startsWith("?") ? search.slice(1) : search;
	return !new URLSearchParams(raw).get("q")?.trim();
}
var consecutiveErrors = 0;
var loadLock = null;
var engineBound = false;
var justEndedId = null;
var userPaused = false;
var viewed = /* @__PURE__ */ new Set();
var recents = [];
function persist() {
	const s = usePlayerStore.getState();
	const prev = loadPersisted();
	const ownsClock = thisTabOwnsClock(playbackLock.isLeader(), Boolean(s.elsewhere));
	savePersisted({
		autoplay: s.autoplay,
		lastSlug: ownsClock ? s.lastSlug : prev.lastSlug,
		lastTrackId: ownsClock ? s.track?.id ?? s.lastTrackId : prev.lastTrackId,
		lastOffsetSec: ownsClock ? s.track ? s.currentTime : s.lastOffsetSec : prev.lastOffsetSec,
		visited: s.visited,
		playerCollapsed: s.playerCollapsed,
		playerHidden: s.playerHidden,
		volume: s.volume,
		muted: s.muted,
		identityName: s.identity?.name ?? null,
		points: s.points,
		glaumules: s.glaumules,
		liked: s.liked,
		favorites: s.favorites,
		shuffleBySlug: s.shuffleBySlug,
		listenMode: s.listenMode
	});
}
function channelOf(slug) {
	if (!slug) return void 0;
	return getChannel(slug);
}
function drivingDesk(slug) {
	if (!slug) return false;
	const state = usePlayerStore.getState();
	const claim = state.claims[slug];
	if (!claim?.claimantId || (claim.expiresAt ?? 0) < Date.now()) return false;
	return claim.claimantId === state.identity?.id;
}
function rememberRecent(id) {
	if (recents[recents.length - 1] === id) return;
	recents.push(id);
	if (recents.length > 40) recents.splice(0, recents.length - 40);
}
function pickNext(channel, playable, currentId) {
	const pref = channel ? Boolean(usePlayerStore.getState().shuffleBySlug[channel.slug]) : false;
	if (channel && shuffleActive(channel, pref)) return nextShuffled(playable, currentId, recents);
	return nextForward(playable, currentId, justEndedId);
}
function listenOf(state) {
	const s = state ?? usePlayerStore.getState();
	return s.listenModeSession ?? s.listenMode;
}
function leaveLiveClock() {
	const s = usePlayerStore.getState();
	if ((s.listenModeSession ?? s.listenMode) !== "stream") return;
	usePlayerStore.setState({
		listenMode: "ondemand",
		listenModeSession: null
	});
	persist();
	setHint("On demand — left the station clock.");
	flushMediaSession();
}
function setHint(message) {
	usePlayerStore.setState({ deckHint: message });
	if (typeof window === "undefined") return;
	window.setTimeout(() => {
		if (usePlayerStore.getState().deckHint === message) usePlayerStore.setState({ deckHint: "" });
	}, 3200);
}
function takeSpeaker() {
	const s = usePlayerStore.getState();
	playbackLock.claim({
		trackId: s.track?.id,
		title: s.track?.title,
		slug: s.channelSlug
	});
	if (s.elsewhere) usePlayerStore.setState({ elsewhere: null });
}
function yieldTo(peer) {
	radioEngine.pause();
	userPaused = true;
	usePlayerStore.setState({
		status: "paused",
		elsewhere: peer,
		buffering: false
	});
	flushMediaSession();
	setHint(`Playing in another tab · ${peer.title ? peer.title : "the radio"}`);
}
var lockBound = false;
function bindPlaybackLock() {
	if (lockBound || typeof window === "undefined") return;
	lockBound = true;
	playbackLock.start({
		onYield: (peer) => {
			yieldTo(peer);
		},
		onReleased: () => {
			if (!usePlayerStore.getState().elsewhere) return;
			usePlayerStore.setState({ elsewhere: null });
			setHint("This tab is ready — press play");
		}
	});
}
function bindEngine() {
	if (engineBound || typeof window === "undefined") return;
	engineBound = true;
	bindPlaybackLock();
	ignoreHidePause();
	radioEngine.attach({
		onTime: (currentTime, duration) => {
			if (usePlayerStore.getState().status === "loading") return;
			usePlayerStore.setState({
				currentTime,
				duration: duration > 0 ? duration : usePlayerStore.getState().duration
			});
			syncMediaSession();
		},
		onEnded: (measured, fileDuration) => {
			const track = usePlayerStore.getState().track;
			const known = fileDuration > 0 ? fileDuration : measured;
			const tail = Math.max(endPad(known), known < 6 ? .15 : .35);
			if (track && known > 0 && measured >= known - tail && measured > .2) {
				rememberDuration(track.id, known);
				patchTrackDuration(track.id, known);
			}
			if (track) {
				justEndedId = track.id;
				rememberAudio(track, { listenedRatio: 1 });
			}
			usePlayerStore.getState().next("ended");
		},
		onError: () => {
			usePlayerStore.getState().next("error");
		},
		onPause: () => {
			const s = usePlayerStore.getState();
			if (s.status === "playing") usePlayerStore.setState({ status: "paused" });
			if (s.track && s.duration > 20) rememberAudio(s.track, { listenedRatio: s.currentTime / Math.max(s.duration, 1) });
			syncMediaSession();
		},
		onPlay: () => {
			const s = usePlayerStore.getState();
			if (userPaused) {
				radioEngine.pause();
				return;
			}
			takeSpeaker();
			if (s.status === "paused" || s.status === "loading") usePlayerStore.setState({
				status: "playing",
				buffering: false,
				elsewhere: null
			});
			syncMediaSession();
		},
		onBuffering: (value) => {
			usePlayerStore.setState({ buffering: value });
		}
	});
	bindMediaSession(() => {
		const s = usePlayerStore.getState();
		const allowed = s.channelSlug ? s.skipAllowed(s.channelSlug) : true;
		return {
			track: s.track,
			channelSlug: s.channelSlug,
			status: s.status,
			currentTime: s.currentTime,
			duration: s.duration,
			skipAllowed: allowed,
			seekAllowed: allowed
		};
	}, {
		play: () => {
			const s = usePlayerStore.getState();
			if (s.status === "playing") radioEngine.resume();
			else s.togglePlay();
		},
		pause: () => {
			const s = usePlayerStore.getState();
			if (s.status === "playing") s.togglePlay();
		},
		next: () => {
			usePlayerStore.getState().next("user");
		},
		prev: () => {
			usePlayerStore.getState().prev();
		},
		seek: (seconds) => {
			usePlayerStore.getState().seek(seconds);
		}
	});
	window.addEventListener("pagehide", persist);
	window.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "hidden") persist();
	});
	window.addEventListener("pageshow", () => {
		rebindMediaSession();
		bindEngine();
		bindMediaSession(() => {
			const s = usePlayerStore.getState();
			const allowed = s.channelSlug ? s.skipAllowed(s.channelSlug) : true;
			return {
				track: s.track,
				channelSlug: s.channelSlug,
				status: s.status,
				currentTime: s.currentTime,
				duration: s.duration,
				skipAllowed: allowed,
				seekAllowed: allowed
			};
		}, {
			play: () => {
				const s = usePlayerStore.getState();
				if (s.status === "playing") radioEngine.resume();
				else s.togglePlay();
			},
			pause: () => {
				const s = usePlayerStore.getState();
				if (s.status === "playing") s.togglePlay();
			},
			next: () => void usePlayerStore.getState().next("user"),
			prev: () => void usePlayerStore.getState().prev(),
			seek: (seconds) => usePlayerStore.getState().seek(seconds)
		});
		syncMediaSession();
	});
}
async function loadTrack(slug, track, offset, play, set, hops = 0, mode = "flow") {
	bindEngine();
	if (!play) {
		radioEngine.pause();
		playbackLock.release();
	}
	if (justEndedId && track.id === justEndedId && hops === 0 && mode !== "join") {
		const channel = channelOf(slug);
		const nxt = pickNext(channel, getPlayableTracks(channel), track.id);
		if (nxt && nxt.id !== track.id) {
			await loadTrack(slug, nxt, 0, play, set, hops + 1, "flow");
			return;
		}
	}
	if (!play) {
		const peer = playbackLock.otherLeader();
		if (peer) {
			set({
				channelSlug: slug,
				track,
				status: "paused",
				currentTime: Math.max(0, offset),
				duration: durationOf(track),
				lastTrackId: track.id,
				lastOffsetSec: Math.max(0, offset),
				lastSlug: slug,
				elsewhere: peer
			});
			persist();
			return;
		}
	}
	set({
		channelSlug: slug,
		track,
		status: "loading",
		currentTime: Math.max(0, offset),
		duration: durationOf(track),
		lastTrackId: track.id,
		lastOffsetSec: Math.max(0, offset),
		lastSlug: slug
	});
	if (play) {
		playbackLock.claim({
			trackId: track.id,
			title: track.title,
			slug
		});
		usePlayerStore.setState({ elsewhere: null });
	}
	const state = usePlayerStore.getState();
	const src = await playableSrc(track);
	let result = await radioEngine.load({
		url: src,
		offsetSec: offset,
		play,
		volume: state.volume,
		muted: state.muted
	});
	if (result.kind === "error" && src.startsWith("blob:")) {
		await forgetCachedAudio(track.id);
		result = await radioEngine.load({
			url: mediaUrl(track.audioUrl),
			offsetSec: offset,
			play,
			volume: state.volume,
			muted: state.muted
		});
	}
	if (result.kind === "stale") return;
	if (result.kind === "error") {
		await usePlayerStore.getState().next("error");
		return;
	}
	if (result.kind === "skip") {
		if (result.duration > .25) {
			rememberDuration(track.id, result.duration);
			patchTrackDuration(track.id, result.duration);
		}
		if (!usePlayerStore.getState().autoplay && mode !== "join") {
			radioEngine.pause();
			set({
				status: "paused",
				duration: result.duration
			});
			return;
		}
		const channel = channelOf(slug);
		const playable = getPlayableTracks(channel);
		if (hops >= 16) {
			const nxt = pickNext(channel, playable, track.id);
			if (nxt && nxt.id !== track.id) {
				await loadTrack(slug, nxt, 0, play, set, hops + 1, "flow");
				return;
			}
			set({
				status: play ? "playing" : "paused",
				duration: result.duration
			});
			return;
		}
		if (mode === "join") {
			const walked = walkFrom(playable, track.id, result.leftover, justEndedId);
			if (walked && walked.track.id !== track.id) {
				await loadTrack(slug, walked.track, walked.offsetSec, play, set, hops + 1, "join");
				return;
			}
		}
		const nxt = pickNext(channel, playable, track.id);
		if (nxt && nxt.id !== track.id) {
			await loadTrack(slug, nxt, 0, play, set, hops + 1, "flow");
			return;
		}
		set({
			status: "paused",
			duration: result.duration
		});
		return;
	}
	rememberDuration(track.id, result.duration);
	patchTrackDuration(track.id, result.duration);
	consecutiveErrors = 0;
	if (justEndedId && track.id !== justEndedId) justEndedId = null;
	const autoOff = !usePlayerStore.getState().autoplay && userPaused;
	const playing = play && !autoOff && !radioEngine.snapshot().paused;
	if (autoOff) radioEngine.pause();
	if (playing) userPaused = false;
	rememberRecent(track.id);
	set({
		status: playing ? "playing" : "paused",
		currentTime: result.currentTime,
		duration: result.duration,
		lastTrackId: track.id,
		lastOffsetSec: result.currentTime,
		lastSlug: slug
	});
	persist();
	if (playing) usePlayerStore.getState().bumpView(track.id);
	const channel = channelOf(slug);
	const playable = getPlayableTracks(channel);
	const nxt = effectiveKind(channel, listenOf()) === "live" ? playable[(Math.max(0, playable.findIndex((item) => item.id === track.id)) + 1) % Math.max(playable.length, 1)] : pickNext(channel, playable, track.id);
	if (nxt?.audioUrl && nxt.id !== track.id) warmTrackSrc(nxt).then((warm) => {
		if (warm) radioEngine.warm(warm);
	});
	flushMediaSession();
}
var usePlayerStore = create((set, get) => ({
	catalog: getCatalog(),
	ready: false,
	channelSlug: null,
	track: null,
	status: "idle",
	currentTime: 0,
	duration: 0,
	volume: .85,
	muted: false,
	autoplay: true,
	lastSlug: null,
	lastTrackId: null,
	lastOffsetSec: 0,
	visited: false,
	gateOpen: false,
	playerCollapsed: true,
	playerHidden: false,
	identity: null,
	claims: {},
	points: 0,
	glaumules: 0,
	liked: [],
	favorites: [],
	views: {},
	likeCounts: {},
	shuffle: false,
	shuffleBySlug: {},
	cutGroups: [],
	listenMode: "ondemand",
	listenModeSession: null,
	buffering: false,
	deckHint: "",
	catalogReady: false,
	elsewhere: null,
	hydrate: () => {
		bindEngine();
		const p = loadPersisted();
		userPaused = !p.autoplay;
		const identity = p.identityName ? {
			id: `guest:${p.identityName.toLowerCase()}`,
			name: p.identityName
		} : null;
		const landing = typeof window !== "undefined" && isLandingLocation(window.location.pathname, window.location.search);
		const showGate = landing && !p.visited;
		const visited = p.visited || !landing;
		set({
			autoplay: p.autoplay,
			lastSlug: p.lastSlug,
			lastTrackId: p.lastTrackId,
			lastOffsetSec: p.lastOffsetSec,
			visited,
			playerCollapsed: p.playerCollapsed,
			playerHidden: p.playerHidden,
			volume: p.volume,
			muted: p.muted,
			identity,
			gateOpen: showGate,
			ready: true,
			points: p.points,
			glaumules: p.glaumules,
			liked: p.liked,
			favorites: p.favorites,
			shuffleBySlug: p.shuffleBySlug,
			listenMode: p.listenMode,
			listenModeSession: typeof window !== "undefined" ? listenModeFromLocation(window.location.search, window.location.hash) : null
		});
		radioEngine.setGain(p.volume, p.muted);
		if (visited && !p.visited) persist();
		import("../_libs/_2.mjs").then((n) => n.n).then(({ ensureLiveCatalog }) => ensureLiveCatalog()).then(async () => {
			try {
				const { listCutGroups } = await import("../_libs/_.mjs").then((n) => n.a);
				const cuts = await listCutGroups();
				get().replaceCutGroups(cuts.groups);
			} catch {}
			get().replaceCatalog(getCatalog());
		}).catch(() => {}).finally(() => {
			set({ catalogReady: true });
			const s = get();
			if (typeof window === "undefined") return;
			if (!s.visited || s.gateOpen || !s.lastSlug || s.track) return;
			if (pageCuesPlayback(window.location.pathname)) return;
			const peer = playbackLock.otherLeader();
			if (peer) {
				userPaused = true;
				set({ elsewhere: peer });
			}
			get().tuneIn(s.lastSlug);
		});
		if (typeof window !== "undefined") window.__radioDebug = {
			state: () => {
				const s = usePlayerStore.getState();
				return {
					title: s.track?.title ?? null,
					id: s.track?.id ?? null,
					status: s.status,
					currentTime: Math.round(s.currentTime * 100) / 100,
					duration: Math.round(s.duration * 100) / 100,
					slug: s.channelSlug,
					points: s.points,
					glaumules: s.glaumules,
					autoplay: s.autoplay,
					listenMode: s.listenModeSession ?? s.listenMode,
					justEndedId,
					userPaused,
					elsewhere: s.elsewhere?.tabId ?? null,
					driving: drivingDesk(s.channelSlug)
				};
			},
			engine: () => radioEngine.snapshot(),
			seekNearEnd: () => {
				const s = usePlayerStore.getState();
				const t = Math.max(0, s.duration - .85);
				s.seek(t);
				return {
					sought: t,
					title: s.track?.title ?? null,
					id: s.track?.id ?? null
				};
			},
			cueSting: async () => {
				const sting = getChannel("official-glaum-frequency")?.tracks.find((item) => /glados/i.test(item.title) && item.enabled !== false);
				if (!sting) return { ok: false };
				await usePlayerStore.getState().cueTrack("official-glaum-frequency", sting.id);
				return {
					ok: true,
					id: sting.id,
					title: sting.title,
					catalogDur: sting.durationSec
				};
			}
		};
		if (typeof window !== "undefined" && !window.__radioListenTick) window.__radioListenTick = window.setInterval(() => {
			const s = usePlayerStore.getState();
			if (s.status !== "playing" || !s.track) return;
			const channel = channelOf(s.channelSlug);
			const skin = channel ? stationSkin(channel) : "none";
			const nextPoints = s.points + 1;
			const nextGlaum = s.glaumules + (skin === "glaum" || channel?.glaumules ? 1 : 0);
			usePlayerStore.setState({
				points: nextPoints,
				glaumules: nextGlaum
			});
			persist();
		}, 2e4);
	},
	enterGate: () => {
		const xpSlug = typeof window !== "undefined" ? experienceSlugFromPath(window.location.pathname) : null;
		const xp = xpSlug ? getExperience(xpSlug, get().catalog) : void 0;
		const last = xp?.stationSlug || get().lastSlug || get().catalog.defaultSlug;
		set({
			gateOpen: false,
			visited: true,
			lastSlug: last
		});
		persist();
		get().tuneIn(last, {
			forcePlay: !xp,
			fromStart: Boolean(xp),
			play: xp ? false : void 0
		});
	},
	tuneIn: async (slug, opts) => {
		const channel = channelOf(slug);
		if (!channel) {
			set({ status: "idle" });
			return;
		}
		if (!channel.enabled) {
			set({
				channelSlug: slug,
				track: null,
				status: "off-air",
				visited: true,
				gateOpen: false
			});
			radioEngine.pause();
			persist();
			return;
		}
		const playable = getPlayableTracks(channel);
		if (playable.length === 0) {
			set({
				channelSlug: slug,
				track: null,
				status: "off-air",
				visited: true,
				gateOpen: false
			});
			persist();
			return;
		}
		if (opts?.fromStart) {
			leaveLiveClock();
			justEndedId = null;
			set({ listenModeSession: "ondemand" });
		}
		if (get().channelSlug === slug && Boolean(get().track) && get().status !== "idle" && get().status !== "off-air" && get().status !== "missing" && !opts?.fromStart) {
			set({
				visited: true,
				gateOpen: false,
				lastSlug: slug
			});
			persist();
			if (opts?.forcePlay && get().status !== "playing" && get().track) {
				userPaused = false;
				takeSpeaker();
				const ok = await radioEngine.resume();
				set({
					status: ok ? "playing" : "paused",
					elsewhere: ok ? null : get().elsewhere
				});
				flushMediaSession();
			}
			return;
		}
		if (opts?.forcePlay) userPaused = false;
		else if (opts?.play === false) userPaused = true;
		const peer = !opts?.forcePlay ? playbackLock.otherLeader() : null;
		if (peer) {
			userPaused = true;
			set({ elsewhere: peer });
		}
		const play = Boolean(opts?.forcePlay) || opts?.play !== false && !userPaused && get().autoplay;
		const kind = opts?.fromStart ? "fixed" : effectiveKind(channel, listenOf(get()));
		const mixing = opts?.fromStart ? false : shuffleActive(channel, Boolean(get().shuffleBySlug[slug]));
		if (slug !== get().channelSlug) justEndedId = null;
		const run = async () => {
			if (kind === "live" && !opts?.fromStart) {
				const head = resolveLivePlayhead(playable, Date.now(), slug, justEndedId);
				await loadTrack(slug, head?.track ?? playable[0], head?.offsetSec ?? 0, play, set, 0, "join");
			} else {
				const resumeId = opts?.fromStart ? null : get().lastTrackId;
				const resume = resumeId ? playable.find((item) => item.id === resumeId) : void 0;
				if (resume) {
					const dur = durationOf(resume);
					const raw = get().lastOffsetSec || 0;
					await loadTrack(slug, resume, dur > 3 && raw >= dur - 1.5 ? 0 : Math.min(Math.max(0, raw), Math.max(0, dur - .25)), play, set, 0, "flow");
				} else if (mixing) await loadTrack(slug, nextShuffled(playable, null, recents) ?? playable[0], 0, play, set, 0, "flow");
				else await loadTrack(slug, playable[0], 0, play, set, 0, "flow");
			}
		};
		loadLock = Promise.resolve(loadLock).then(run, run);
		await loadLock;
		set({
			lastSlug: slug,
			visited: true,
			gateOpen: false,
			shuffle: mixing
		});
		persist();
	},
	cueTrack: async (slug, trackId, opts) => {
		leaveLiveClock();
		const channel = channelOf(slug);
		const track = channel?.tracks.find((item) => item.id === trackId);
		if (!channel || !track || isAdultTrack(track) && !isChannelNsfw(channel)) {
			await get().tuneIn(slug);
			return;
		}
		const play = opts?.play ?? true;
		if (play) userPaused = false;
		else userPaused = true;
		await loadTrack(slug, track, 0, play, set, 0, "flow");
		set({
			lastSlug: slug,
			visited: true,
			gateOpen: false
		});
		persist();
	},
	togglePlay: async () => {
		const state = get();
		if (state.status === "playing") {
			userPaused = true;
			radioEngine.pause();
			playbackLock.release();
			set({
				status: "paused",
				elsewhere: null
			});
			flushMediaSession();
			return;
		}
		userPaused = false;
		takeSpeaker();
		if (state.track && state.channelSlug) {
			if (!radioEngine.snapshot().src) {
				await loadTrack(state.channelSlug, state.track, state.currentTime, true, set, 0, "flow");
				return;
			}
			const ok = await radioEngine.resume();
			set({
				status: ok ? "playing" : "paused",
				elsewhere: ok ? null : get().elsewhere
			});
			flushMediaSession();
			return;
		}
		if (state.channelSlug) await get().tuneIn(state.channelSlug, { forcePlay: true });
	},
	next: async (reason) => {
		const run = async () => {
			const slug = get().channelSlug;
			if (!slug) return;
			const channel = channelOf(slug);
			if (!channel) return;
			const playable = getPlayableTracks(channel);
			const current = get().track;
			const kind = effectiveKind(channel, listenOf(get()));
			if (reason === "error") {
				consecutiveErrors += 1;
				if (consecutiveErrors > 8) {
					set({ status: "missing" });
					return;
				}
				const nxt = pickNext(channel, playable, current?.id);
				if (nxt) await loadTrack(slug, nxt, 0, true, set, 0, "flow");
				return;
			}
			const mixing = shuffleActive(channel, Boolean(get().shuffleBySlug[slug]));
			if (reason === "ended") {
				if (!get().autoplay || userPaused) {
					radioEngine.pause();
					playbackLock.release();
					set({ status: "paused" });
					flushMediaSession();
					return;
				}
				const play = true;
				const hold = async (nxt) => {
					if (!nxt) return false;
					if (!shouldHoldAutoAdvance(dataSaverOn(), await hasCachedAudio(nxt.id))) return false;
					radioEngine.pause();
					playbackLock.release();
					set({ status: "paused" });
					flushMediaSession();
					return true;
				};
				if (kind === "live") {
					const nxt = pickNext(channel, playable, current?.id);
					if (await hold(nxt)) return;
					if (nxt) await loadTrack(slug, nxt, 0, play, set, 0, "flow");
					return;
				}
				if (!mixing && kind === "fixed") {
					const nxt = current ? neighborTrack(playable, current.id, 1, false) : playable[0];
					if (await hold(nxt)) return;
					if (nxt) await loadTrack(slug, nxt, 0, true, set, 0, "flow");
					else {
						radioEngine.pause();
						set({ status: "paused" });
					}
					return;
				}
				const nxt = pickNext(channel, playable, current?.id);
				if (await hold(nxt)) return;
				if (nxt) await loadTrack(slug, nxt, 0, play, set, 0, "flow");
				return;
			}
			if (reason === "user") {
				leaveLiveClock();
				userPaused = false;
			}
			const nxt = pickNext(channel, playable, current?.id);
			if (nxt) await loadTrack(slug, nxt, 0, true, set, 0, "flow");
			else if (playable[0]) await loadTrack(slug, playable[0], 0, true, set, 0, "flow");
		};
		loadLock = Promise.resolve(loadLock).then(run, run);
		await loadLock;
	},
	prev: async () => {
		leaveLiveClock();
		const slug = get().channelSlug;
		if (!slug) return;
		const channel = channelOf(slug);
		if (!channel) return;
		const playable = getPlayableTracks(channel);
		const current = get().track;
		if (shuffleActive(channel, Boolean(get().shuffleBySlug[slug])) && recents.length > 1) {
			const currentId = current?.id;
			let prior = recents.length - 1;
			if (recents[prior] === currentId) prior -= 1;
			const id = prior >= 0 ? recents[prior] : null;
			const prevTrack = id ? playable.find((item) => item.id === id) : null;
			if (prevTrack) {
				userPaused = false;
				recents.splice(prior + 1);
				await loadTrack(slug, prevTrack, 0, true, set, 0, "flow");
				return;
			}
		}
		const wrap = effectiveKind(channel, listenOf(get())) !== "fixed";
		const prev = current ? neighborTrack(playable, current.id, -1, wrap) : playable[0];
		if (prev) {
			userPaused = false;
			await loadTrack(slug, prev, 0, true, set, 0, "flow");
		}
	},
	seek: (seconds) => {
		if (!get().channelSlug) return;
		leaveLiveClock();
		radioEngine.seek(seconds);
		const snap = radioEngine.snapshot();
		set({
			currentTime: snap.currentTime,
			duration: snap.duration || get().duration
		});
		flushMediaSession();
	},
	setVolume: (volume) => {
		const next = Math.min(1, Math.max(0, volume));
		const muted = next <= 0;
		radioEngine.setGain(next, muted);
		set({
			volume: next,
			muted
		});
		persist();
	},
	toggleMute: () => {
		if (get().muted || get().volume <= 0) {
			const volume = get().volume > .02 ? get().volume : .85;
			radioEngine.setGain(volume, false);
			set({
				muted: false,
				volume
			});
		} else {
			radioEngine.setGain(get().volume, true);
			set({ muted: true });
		}
		persist();
	},
	setAutoplay: (value) => {
		set({ autoplay: value });
		persist();
	},
	setListenMode: (value) => {
		set({
			listenMode: value,
			listenModeSession: null
		});
		persist();
		const slug = get().channelSlug;
		const channel = channelOf(slug);
		if (value === "stream" && channel && normalizeKind(channel.kind || channel.mode) === "live") get().jumpToLive();
		else flushMediaSession();
	},
	applyListenQuery: (search, hash) => {
		if (typeof window === "undefined") return;
		const forced = listenModeFromLocation(search ?? window.location.search, hash ?? window.location.hash);
		if (!forced || get().listenModeSession === forced) return;
		set({ listenModeSession: forced });
		const channel = channelOf(get().channelSlug);
		if (forced === "stream" && channel && normalizeKind(channel.kind || channel.mode) === "live") get().jumpToLive();
		else flushMediaSession();
	},
	jumpToLive: async () => {
		const slug = get().channelSlug;
		const channel = channelOf(slug);
		if (!slug || !channel) return;
		const playable = getPlayableTracks(channel);
		if (playable.length === 0) return;
		set({
			listenMode: "stream",
			listenModeSession: null
		});
		persist();
		const play = !userPaused && (get().status === "playing" || get().autoplay);
		userPaused = false;
		const head = resolveLivePlayhead(playable, Date.now(), slug, justEndedId);
		const track = head?.track ?? playable[0];
		const offset = head?.offsetSec ?? 0;
		const run = async () => {
			await loadTrack(slug, track, offset, play || true, set, 0, "join");
		};
		loadLock = Promise.resolve(loadLock).then(run, run);
		await loadLock;
		setHint("Back on the station clock.");
		flushMediaSession();
	},
	toggleShuffle: (slugArg) => {
		const slug = slugArg || get().channelSlug;
		const channel = channelOf(slug);
		if (!channel || !slug) return;
		const mode = normalizeShuffle(channel.shuffle);
		if (mode === "off" || mode === "on") return;
		const next = !shuffleActive(channel, Boolean(get().shuffleBySlug[slug]));
		const shuffleBySlug = {
			...get().shuffleBySlug,
			[slug]: next
		};
		if (get().channelSlug === slug) set({
			shuffle: next,
			shuffleBySlug
		});
		else set({ shuffleBySlug });
		persist();
	},
	setPlayerCollapsed: (value) => {
		set({
			playerCollapsed: value,
			playerHidden: false
		});
		persist();
	},
	setPlayerHidden: (value) => {
		set(value ? {
			playerHidden: true,
			playerCollapsed: true
		} : { playerHidden: false });
		persist();
	},
	setIdentityName: (name) => {
		const trimmed = name.trim().slice(0, 24);
		set({ identity: trimmed ? {
			id: `guest:${trimmed.toLowerCase()}`,
			name: trimmed
		} : null });
		persist();
	},
	claimChannel: (slug, minutes) => {
		const identity = get().identity;
		if (!identity) return;
		set({ claims: {
			...get().claims,
			[slug]: {
				claimantId: identity.id,
				name: identity.name,
				expiresAt: Date.now() + minutes * 6e4
			}
		} });
	},
	releaseClaim: (slug) => {
		const next = { ...get().claims };
		delete next[slug];
		set({ claims: next });
	},
	skipAllowed: (slug) => {
		if (effectiveKind(channelOf(slug), listenOf(get())) !== "live") return true;
		const claim = get().claims[slug];
		if (!claim?.claimantId || (claim.expiresAt ?? 0) < Date.now()) return true;
		return claim.claimantId === get().identity?.id;
	},
	replaceCatalog: (catalog) => {
		setLiveCatalog(catalog);
		const slug = get().channelSlug;
		const channel = slug ? catalog.channels.find((item) => item.slug === slug) : void 0;
		const playingId = get().track?.id ?? null;
		const playable = getPlayableTracks(channel);
		const still = playingId ? playable.find((item) => item.id === playingId) : null;
		set({
			catalog,
			shuffle: shuffleActive(channel, Boolean(slug && get().shuffleBySlug[slug])),
			track: still ?? get().track
		});
		if (playingId && !still) get().next("ended");
		flushMediaSession();
	},
	replaceCutGroups: (groups) => set({ cutGroups: groups }),
	toggleLike: (trackId) => {
		const liked = new Set(get().liked);
		const counts = { ...get().likeCounts };
		if (liked.has(trackId)) {
			liked.delete(trackId);
			counts[trackId] = Math.max(0, (counts[trackId] ?? 1) - 1);
		} else {
			liked.add(trackId);
			counts[trackId] = (counts[trackId] ?? 0) + 1;
			const channel = channelOf(get().channelSlug);
			if (channel && (stationSkin(channel) === "glaum" || channel.loveBubbles)) window.dispatchEvent(new CustomEvent("radio-love", { detail: { kind: "like" } }));
		}
		set({
			liked: [...liked],
			likeCounts: counts
		});
		persist();
		import("./social-api-DT7HdRgY.mjs").then((n) => n.r).then((n) => n.r).then(({ bumpTrackLike }) => bumpTrackLike({ data: {
			trackId,
			liked: liked.has(trackId)
		} })).catch(() => {});
	},
	toggleFavorite: (trackId) => {
		const favorites = new Set(get().favorites);
		if (favorites.has(trackId)) {
			favorites.delete(trackId);
			pinCachedAudio(trackId, false);
		} else {
			favorites.add(trackId);
			const track = get().track?.id === trackId ? get().track : get().catalog.channels.flatMap((channel) => channel.tracks).find((item) => item.id === trackId);
			if (track) rememberAudio(track, { force: true });
		}
		set({ favorites: [...favorites] });
		persist();
		import("./social-api-DT7HdRgY.mjs").then((n) => n.r).then((n) => n.r).then(({ toggleFavoriteTrack }) => toggleFavoriteTrack({ data: { trackId } })).catch(() => {});
	},
	collectGlaumule: (amount = 1) => {
		set({
			glaumules: get().glaumules + amount,
			points: get().points + amount
		});
		persist();
	},
	bumpView: (trackId) => {
		if (viewed.has(trackId)) return;
		viewed.add(trackId);
		set({ views: {
			...get().views,
			[trackId]: (get().views[trackId] ?? 0) + 1
		} });
		import("./social-api-DT7HdRgY.mjs").then((n) => n.r).then((n) => n.r).then(({ bumpTrackView }) => bumpTrackView({ data: { trackId } })).then((row) => {
			if (row) usePlayerStore.setState((s) => ({
				views: {
					...s.views,
					[trackId]: row.views
				},
				likeCounts: {
					...s.likeCounts,
					[trackId]: row.likes
				}
			}));
		}).catch(() => {});
	}
}));
//#endregion
export { mergeXpTags as _, effectiveKind as a, xpFromTags as b, forgetCachedAudio as c, isFiniteAudioUrl as d, isLandingLocation as f, listenModeLabel as g, listenModeHint as h, downloadAudio as i, getExperience as l, listExperiences as m, cacheUsage as n, experienceForStation as o, isOnDemandOverlay as p, clearCachedAudio as r, experienceFromChannel as s, audioCacheGeneration as t, hasCachedAudio as u, subscribeAudioCache as v, usePlayerStore as y };
