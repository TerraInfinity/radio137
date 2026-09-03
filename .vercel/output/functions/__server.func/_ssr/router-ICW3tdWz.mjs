import { o as __toESM } from "../_runtime.mjs";
import { a as getCatalog, c as getSeedCatalog, d as isAdultTrack, f as isChannelNsfw, h as setLiveCatalog, i as formatRemaining, l as getSong, n as cn, o as getChannel, r as formatClock, s as getPlayableTracks, u as hashString } from "./cn-UVNI8J0o.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { L as string, N as number, P as object, R as union, j as literal, k as boolean } from "../_libs/@better-auth/core+[...].mjs";
import { B as require_react, _ as createRootRoute, b as require_jsx_runtime, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as authClient } from "./client-BoyDrSIS.mjs";
import { i as hasGateSessionMarker, t as auth } from "./server-DcQ8bsHF.mjs";
import { r as listEdits, t as addTrack } from "./catalog-edits.server-BA-vL_pw.mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, n as createMiddleware, r as createServerFn } from "./ssr.mjs";
import { a as sanitizeUploadName, n as putR2Object, r as r2Configured, t as defaultPrefixForSlug } from "./r2.server-YB-_jTkE.mjs";
import { a as logoutLocation, c as r2Configured$1, d as requireAdmin, f as resolveRadioUser, h as isAdminEmail, i as hubOrigin, l as readNextFromCookie, n as clearSsoCookie, o as mintNextCookie, p as safeNext, r as exchangeSsoCode, s as mintSsoCookie, t as clearNextCookie, u as requestOrigin } from "./sso.server-CuN0LZXH.mjs";
import { c as ChevronUp, i as SkipBack, l as ChevronDown, o as Play, r as SkipForward, s as Pause, t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desk-api-Bb_SBJUB.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var desk_api_exports = /* @__PURE__ */ __exportAll({
	addStationTrack: () => addStationTrack,
	deleteStationFile: () => deleteStationFile,
	getRadioSession: () => getRadioSession,
	hideStationTrack: () => hideStationTrack,
	listCatalogEdits: () => listCatalogEdits,
	listStationR2: () => listStationR2,
	restoreStationTrack: () => restoreStationTrack
});
var radioSessionMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-BoyDrSIS.mjs").then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { resolveRadioUser, r2Configured } = await import("./sso.server-CuN0LZXH.mjs").then((n) => n.m);
	return next({ context: {
		user: await resolveRadioUser(context.bearerToken),
		r2Configured: r2Configured()
	} });
});
var adminMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-BoyDrSIS.mjs").then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireAdmin, r2Configured } = await import("./sso.server-CuN0LZXH.mjs").then((n) => n.m);
	assertSameSiteRequest();
	return next({ context: {
		user: await requireAdmin(context.bearerToken),
		r2Configured: r2Configured()
	} });
});
var getRadioSession = createServerFn({ method: "GET" }).middleware([radioSessionMiddleware]).handler(createSsrRpc("d9e89e6e17ea4381b3ec922098d3fcb3e864b4b3b07789c439e701ed259ef683"));
var listCatalogEdits = createServerFn({ method: "GET" }).handler(createSsrRpc("ce752a9c60416a0748de8ae86a006017f54ced857f2581ba1a9f7cfcce8bb3a9"));
var trackRef = object({
	channelSlug: string().min(1),
	trackId: string().min(1),
	audioUrl: string().optional()
});
var hideStationTrack = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => trackRef.parse(input)).handler(createSsrRpc("a0f574ca851bffce43b4e3ba655b29babab6d5b0703b3873a41409a03e7b9a6a"));
var restoreStationTrack = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => trackRef.parse(input)).handler(createSsrRpc("e4f922a88d85017fd6365e5b5442c3930c1905e0e4755d162c604c57f6992e91"));
var addStationTrack = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	channelSlug: string().min(1),
	title: string().min(1),
	artist: string().optional(),
	durationSec: number().optional(),
	audioUrl: string().min(8),
	coverUrl: string().optional(),
	r2Key: string().optional()
}).parse(input)).handler(createSsrRpc("08659e0d0d60384b044868cdfd6b5d78aac7aba6ca3e76a712a57aac1b061266"));
var deleteStationFile = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	channelSlug: string().min(1),
	trackId: string().min(1),
	audioUrl: string().min(1),
	r2Key: string().optional(),
	alsoDeleteR2: boolean()
}).parse(input)).handler(createSsrRpc("d9c9172f364a7e534585135887b704f2b3b59298313c4af8e00a092debec0967"));
var listStationR2 = createServerFn({ method: "GET" }).middleware([adminMiddleware]).validator((input) => object({ slug: string().min(1) }).parse(input)).handler(createSsrRpc("df9d243e1b860c4496bba86a34cad4e87c50b6b7b199b0acf683fa5bc37e5c1f"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-ICW3tdWz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function heldClaim(claims, identity, now = Date.now()) {
	for (const [slug, claim] of Object.entries(claims)) {
		if (!claim?.claimantId || (claim.expiresAt ?? 0) <= now) continue;
		return {
			slug,
			claim,
			own: Boolean(identity && claim.claimantId === identity.id)
		};
	}
	return null;
}
function claimRemainingMs(claim, now = Date.now()) {
	if (!claim.expiresAt) return 0;
	return Math.max(0, claim.expiresAt - now);
}
function claimElapsedMs(claim, now = Date.now()) {
	if (!claim.claimedAt) return 0;
	const end = claim.expiresAt ? Math.min(now, claim.expiresAt) : now;
	return Math.max(0, end - claim.claimedAt);
}
function claimTotalMs(claim) {
	if (!claim.claimedAt || !claim.expiresAt) return 0;
	return Math.max(1, claim.expiresAt - claim.claimedAt);
}
function claimRemainRatio(claim, now = Date.now()) {
	const total = claimTotalMs(claim);
	if (!total) return 0;
	return Math.min(1, claimRemainingMs(claim, now) / total);
}
function liveCursor(tracks, serverNowMs, slug) {
	const playable = tracks.filter((track) => track.durationSec > 0 && track.audioUrl);
	const totalSec = playable.reduce((sum, track) => sum + track.durationSec, 0);
	if (totalSec <= 0 || playable.length === 0) return null;
	const seed = hashString(slug) % totalSec;
	const elapsed = ((Math.floor(serverNowMs / 1e3) + seed) % totalSec + totalSec) % totalSec;
	let acc = 0;
	for (let index = 0; index < playable.length; index++) {
		const track = playable[index];
		if (elapsed < acc + track.durationSec) return {
			track,
			index,
			offsetSec: elapsed - acc,
			totalSec
		};
		acc += track.durationSec;
	}
	return {
		track: playable[0],
		index: 0,
		offsetSec: 0,
		totalSec
	};
}
function upcomingTracks(channel, currentId, count = 12) {
	const playable = getPlayableTracks(channel);
	if (playable.length === 0) return [];
	const currentIndex = Math.max(0, playable.findIndex((track) => track.id === currentId));
	const out = [];
	for (let i = 1; i <= count && i < playable.length; i++) out.push(playable[(currentIndex + i) % playable.length]);
	return out;
}
function neighborTrack(tracks, currentId, direction) {
	if (tracks.length === 0) return null;
	const index = tracks.findIndex((track) => track.id === currentId);
	if (index < 0) return tracks[0];
	return tracks[(index + direction + tracks.length) % tracks.length];
}
var KEY$1 = "radio.persist.v2";
var empty = {
	autoplay: true,
	lastSlug: null,
	visited: false,
	playerCollapsed: true,
	volume: .85,
	identityName: null
};
function loadPersisted() {
	if (typeof window === "undefined") return empty;
	try {
		const raw = window.localStorage.getItem(KEY$1);
		if (!raw) return empty;
		return {
			...empty,
			...JSON.parse(raw)
		};
	} catch {
		return empty;
	}
}
function savePersisted(next) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEY$1, JSON.stringify(next));
	} catch {}
}
var audio = null;
var loadGen = 0;
function getAudio() {
	if (typeof window === "undefined") return null;
	if (!audio) {
		audio = new Audio();
		audio.preload = "auto";
		audio.addEventListener("timeupdate", () => {
			usePlayerStore.setState({
				currentTime: audio?.currentTime ?? 0,
				duration: Number.isFinite(audio?.duration) ? audio.duration : usePlayerStore.getState().duration
			});
		});
		audio.addEventListener("ended", () => {
			usePlayerStore.getState().next("ended");
		});
		audio.addEventListener("error", () => {
			usePlayerStore.getState().next();
		});
	}
	return audio;
}
function persist() {
	const s = usePlayerStore.getState();
	savePersisted({
		autoplay: s.autoplay,
		lastSlug: s.lastSlug,
		visited: s.visited,
		playerCollapsed: s.playerCollapsed,
		volume: s.volume,
		identityName: s.identity?.name ?? null
	});
}
function channelOf(slug) {
	if (!slug) return void 0;
	return getChannel(slug);
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
	visited: false,
	gateOpen: true,
	playerCollapsed: true,
	identity: null,
	claims: {},
	hydrate: () => {
		const p = loadPersisted();
		const identity = p.identityName ? {
			id: `guest:${p.identityName.toLowerCase()}`,
			name: p.identityName
		} : null;
		set({
			autoplay: p.autoplay,
			lastSlug: p.lastSlug,
			visited: p.visited,
			playerCollapsed: p.playerCollapsed,
			volume: p.volume,
			identity,
			gateOpen: !p.visited,
			ready: true
		});
		const el = getAudio();
		if (el) el.volume = p.volume;
		if (typeof document !== "undefined") document.documentElement.classList.toggle("is-dj", false);
		if (p.visited && p.lastSlug) get().tuneIn(p.lastSlug);
		Promise.all([import("../_libs/_.mjs").then((n) => n.r), import("./catalog-edits-yasvWDPz.mjs").then((n) => n.n).then((n) => n.n)]).then(([{ listCatalogEdits }, { applyCatalogEdits }]) => listCatalogEdits().then((edits) => {
			if (!edits.length) return;
			get().replaceCatalog(applyCatalogEdits(getSeedCatalog(), edits));
		})).catch(() => {});
	},
	enterGate: () => {
		const last = get().lastSlug || get().catalog.defaultSlug;
		set({
			gateOpen: false,
			visited: true,
			lastSlug: last
		});
		persist();
		get().tuneIn(last, { forcePlay: true });
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
				status: "off-air"
			});
			getAudio()?.pause();
			return;
		}
		const playable = getPlayableTracks(channel);
		if (playable.length === 0) {
			set({
				channelSlug: slug,
				track: null,
				status: "off-air"
			});
			return;
		}
		if (opts?.forcePlay) set({ autoplay: true });
		const live = channel.kind === "live" ? liveCursor(playable, Date.now(), slug) : null;
		await loadTrack(slug, live?.track ?? playable[0], live?.offsetSec ?? 0, get().autoplay || Boolean(opts?.forcePlay), set, get);
		set({
			lastSlug: slug,
			visited: true,
			gateOpen: false
		});
		persist();
	},
	cueTrack: async (slug, trackId) => {
		if (!get().skipAllowed(slug)) return;
		const channel = channelOf(slug);
		const track = channel?.tracks.find((item) => item.id === trackId);
		if (!channel || !track || isAdultTrack(track) && !isChannelNsfw(channel)) {
			await get().tuneIn(slug);
			return;
		}
		await loadTrack(slug, track, 0, true, set, get);
	},
	togglePlay: async () => {
		const el = getAudio();
		const state = get();
		if (state.status === "playing") {
			el?.pause();
			set({ status: "paused" });
			return;
		}
		if (state.track && el) {
			try {
				await el.play();
				set({ status: "playing" });
			} catch {
				set({ status: "paused" });
			}
			return;
		}
		if (state.channelSlug) await get().tuneIn(state.channelSlug, { forcePlay: true });
	},
	next: async (reason = "user") => {
		const state = get();
		const channel = channelOf(state.channelSlug);
		if (!channel) return;
		if (reason === "user" && !state.skipAllowed(channel.slug)) return;
		const nextTrack = neighborTrack(getPlayableTracks(channel), state.track?.id ?? null, 1);
		if (!nextTrack) return;
		await loadTrack(channel.slug, nextTrack, 0, true, set, get);
	},
	prev: async () => {
		const state = get();
		const channel = channelOf(state.channelSlug);
		if (!channel || !state.skipAllowed(channel.slug)) return;
		if (state.currentTime > 3) {
			const el = getAudio();
			if (el) el.currentTime = 0;
			set({ currentTime: 0 });
			return;
		}
		const prevTrack = neighborTrack(getPlayableTracks(channel), state.track?.id ?? null, -1);
		if (!prevTrack) return;
		await loadTrack(channel.slug, prevTrack, 0, true, set, get);
	},
	seek: (seconds) => {
		const el = getAudio();
		if (!el) return;
		const slug = get().channelSlug;
		if (slug && !get().skipAllowed(slug)) return;
		el.currentTime = seconds;
		set({ currentTime: seconds });
	},
	setVolume: (volume) => {
		const next = Math.min(1, Math.max(0, volume));
		const el = getAudio();
		if (el) el.volume = get().muted ? 0 : next;
		set({ volume: next });
		persist();
	},
	toggleMute: () => {
		const muted = !get().muted;
		const el = getAudio();
		if (el) el.volume = muted ? 0 : get().volume;
		set({ muted });
	},
	setAutoplay: (value) => {
		set({ autoplay: value });
		persist();
	},
	setPlayerCollapsed: (value) => {
		set({ playerCollapsed: value });
		persist();
	},
	setIdentityName: (name) => {
		const trimmed = name.trim().slice(0, 32);
		if (!trimmed) return;
		set({ identity: {
			id: `guest:${trimmed.toLowerCase()}`,
			name: trimmed
		} });
		persist();
	},
	claimChannel: (slug, minutes) => {
		const identity = get().identity;
		if (!identity) return;
		if (!channelOf(slug)?.claimable) return;
		const taken = Object.entries(get().claims).find(([, claim]) => claim.claimantId && (claim.expiresAt ?? 0) > Date.now());
		if (taken && taken[0] !== slug && taken[1].claimantId !== identity.id) {}
		const claims = { ...get().claims };
		for (const [key, claim] of Object.entries(claims)) if (claim.claimantId === identity.id) claims[key] = {
			claimantId: null,
			claimantName: null,
			claimedAt: null,
			expiresAt: null
		};
		claims[slug] = {
			claimantId: identity.id,
			claimantName: identity.name,
			claimedAt: Date.now(),
			expiresAt: Date.now() + minutes * 6e4
		};
		set({
			claims,
			autoplay: true
		});
		if (typeof document !== "undefined") document.documentElement.classList.add("is-dj");
		persist();
	},
	releaseClaim: (slug) => {
		set({ claims: {
			...get().claims,
			[slug]: {
				claimantId: null,
				claimantName: null,
				claimedAt: null,
				expiresAt: null
			}
		} });
		if (typeof document !== "undefined") document.documentElement.classList.remove("is-dj");
	},
	skipAllowed: (slug) => {
		const claim = get().claims[slug];
		if (!claim?.claimantId || (claim.expiresAt ?? 0) < Date.now()) return true;
		return claim.claimantId === get().identity?.id;
	},
	replaceCatalog: (catalog) => {
		setLiveCatalog(catalog);
		set({ catalog });
	}
}));
async function loadTrack(slug, track, offset, play, set, get) {
	const gen = ++loadGen;
	const channel = channelOf(slug);
	if (isAdultTrack(track) && (!channel || !isChannelNsfw(channel))) {
		set({
			track: null,
			status: "off-air",
			channelSlug: slug
		});
		return;
	}
	set({
		channelSlug: slug,
		track,
		status: "loading",
		currentTime: offset,
		duration: track.durationSec
	});
	const el = getAudio();
	if (!el) return;
	el.src = track.audioUrl;
	el.volume = get().muted ? 0 : get().volume;
	try {
		el.currentTime = offset;
		if (play) await el.play();
		if (gen !== loadGen) return;
		set({
			status: play && !el.paused ? "playing" : "paused",
			duration: Number.isFinite(el.duration) && el.duration > 0 ? el.duration : track.durationSec
		});
	} catch {
		if (gen !== loadGen) return;
		set({ status: play ? "paused" : "paused" });
	}
}
function Atmosphere() {
	const catalog = usePlayerStore((s) => s.catalog);
	const channelSlug = usePlayerStore((s) => s.channelSlug);
	const status = usePlayerStore((s) => s.status);
	const claims = usePlayerStore((s) => s.claims);
	const identity = usePlayerStore((s) => s.identity);
	const theme = catalog.theme;
	const clockwork = theme?.clockwork !== false;
	const sand = theme?.sand !== false;
	const intensity = theme?.intensity ?? .55;
	const channel = catalog.channels.find((item) => item.slug === channelSlug);
	const glaum = channel?.skin === "glaum" && (status === "playing" || status === "loading");
	const wahe = channel?.skin === "waheguru" && (status === "playing" || status === "loading");
	const driving = heldClaim(claims, identity)?.own;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none fixed inset-0 z-0 overflow-hidden",
		"aria-hidden": true,
		children: [
			clockwork ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "atmosphere-clockwork",
				style: { opacity: .12 + intensity * .22 },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gallifrey gallifrey-a" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gallifrey gallifrey-b" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gear gear-a" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gear gear-b" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gear gear-c" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dial" })
				]
			}) : null,
			sand ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "atmosphere-sand",
				style: { opacity: .08 + intensity * .2 }
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sand-grain",
				style: { opacity: .12 + intensity * .18 }
			})] }) : null,
			glaum ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-glaum" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-glaum-spark" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-glaum-shrimp" })
			] }) : null,
			wahe ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-wahe" }) : null,
			driving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-buzz" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-buzz-arc" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-buzz-bolt" })
			] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-vignette" })
		]
	});
}
function DeepLink() {
	const search = useRouterState({ select: (s) => s.location.searchStr });
	const gateOpen = usePlayerStore((s) => s.gateOpen);
	const apply = usePlayerStore((s) => s.tuneIn);
	const cueTrack = usePlayerStore((s) => s.cueTrack);
	(0, import_react.useEffect)(() => {
		if (gateOpen) return;
		const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
		const station = params.get("station");
		const track = params.get("track") || params.get("t") || params.get("radio");
		const catalog = getCatalog();
		if (station) {
			const channel = catalog.channels.find((item) => item.slug === station || item.slug.includes(station) || item.name.toLowerCase().includes(station.toLowerCase()));
			if (channel?.enabled) apply(channel.slug, { forcePlay: true });
			return;
		}
		if (track) for (const channel of catalog.channels) {
			if (!channel.enabled) continue;
			const hit = getPlayableTracks(channel).find((item) => item.audioUrl.includes(track) || item.id === track);
			if (hit) {
				cueTrack(channel.slug, hit.id);
				return;
			}
		}
	}, [
		apply,
		cueTrack,
		gateOpen,
		search
	]);
	return null;
}
function EnterGate() {
	const gateOpen = usePlayerStore((s) => s.gateOpen);
	const enterGate = usePlayerStore((s) => s.enterGate);
	const catalog = usePlayerStore((s) => s.catalog);
	if (!gateOpen) return null;
	const intro = catalog.channels.find((channel) => channel.slug === catalog.defaultSlug)?.name ?? "Default";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[60] flex items-end justify-center bg-bg/88 px-4 pb-16 pt-24 backdrop-blur-[3px] sm:items-center sm:pb-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "filigree-frame relative w-full max-w-md rounded-xl bg-bg-elevated p-6 shadow-[var(--shadow-filigree)] sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[11px] uppercase tracking-[0.22em] text-gold",
					children: "Frequency"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 font-display text-5xl font-semibold tracking-tight",
					children: "Radio"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-muted",
					children: [
						"The green lamp is on. ",
						intro,
						" begins the clock. After this visit, this tab resumes wherever you left the dial. Uncheck the lamp if you want silence on arrival."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => enterGate(),
					className: "mt-6 inline-flex h-12 w-full items-center justify-center gap-3 rounded-md bg-fg font-mono text-[12px] uppercase tracking-[0.18em] text-bg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "lamp-bezel",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "lamp lamp-live" })
					}), "Tune in"]
				})
			]
		})
	});
}
var KEY = "radio.glaumules.v1";
var GLAUMULE_EVENT = "radio:glaumules";
function loadGlaumules() {
	if (typeof window === "undefined") return 0;
	try {
		return Number(window.localStorage.getItem(KEY) || 0) || 0;
	} catch {
		return 0;
	}
}
function addGlaumules(n) {
	const next = loadGlaumules() + n;
	try {
		window.localStorage.setItem(KEY, String(next));
		window.dispatchEvent(new CustomEvent(GLAUMULE_EVENT, { detail: next }));
	} catch {}
	return next;
}
var GLAUM = [
	"wow",
	"omg",
	"wowie",
	"shrimply amazing",
	"weee",
	"darling",
	"pearl",
	"love"
];
var WAHE = [
	"wow",
	"om",
	"light",
	"grace",
	"love",
	"waheguru",
	"peace"
];
function LoveBubbles() {
	const catalog = usePlayerStore((s) => s.catalog);
	const channelSlug = usePlayerStore((s) => s.channelSlug);
	const status = usePlayerStore((s) => s.status);
	const collapsed = usePlayerStore((s) => s.playerCollapsed);
	const channel = catalog.channels.find((item) => item.slug === channelSlug);
	const [bubbles, setBubbles] = (0, import_react.useState)([]);
	const playing = status === "playing" && Boolean(channel);
	const bubblesOn = Boolean(playing && channel?.loveBubbles);
	const glaumulesOn = Boolean(playing && channel?.glaumules);
	const skin = channel?.skin ?? "none";
	(0, import_react.useEffect)(() => {
		if (!bubblesOn) {
			setBubbles([]);
			return;
		}
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const words = skin === "waheguru" ? WAHE : GLAUM;
		const timers = [];
		const spawn = (text, kind = "word") => {
			const id = Date.now() + Math.random();
			const x = kind === "pop" ? 72 + Math.random() * 18 : 8 + Math.random() * 64;
			setBubbles((list) => [...list.slice(-2), {
				id,
				text,
				x,
				kind
			}]);
			timers.push(window.setTimeout(() => {
				setBubbles((list) => list.filter((item) => item.id !== id));
			}, kind === "pop" ? 2200 : 5200));
		};
		spawn(words[Math.floor(Math.random() * words.length)]);
		const timer = window.setInterval(() => {
			spawn(words[Math.floor(Math.random() * words.length)]);
		}, 8e3 + Math.random() * 4e3);
		return () => {
			window.clearInterval(timer);
			for (const id of timers) window.clearTimeout(id);
		};
	}, [bubblesOn, skin]);
	(0, import_react.useEffect)(() => {
		if (!glaumulesOn) return;
		const tick = window.setInterval(() => {
			addGlaumules(1);
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
			setBubbles((list) => {
				const id = Date.now();
				window.setTimeout(() => {
					setBubbles((next) => next.filter((item) => item.id !== id));
				}, 2200);
				return [...list.slice(-2), {
					id,
					text: "+1",
					x: 78 + Math.random() * 12,
					kind: "pop"
				}];
			});
		}, 14e3);
		return () => window.clearInterval(tick);
	}, [glaumulesOn]);
	if (!channel || !bubblesOn && !glaumulesOn) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "love-layer",
		"aria-hidden": true,
		children: bubbles.map((bubble) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("love-orb", bubble.kind === "pop" && "love-orb-pop", skin === "waheguru" ? "love-orb-wahe" : "love-orb-glaum"),
			style: {
				left: `${bubble.x}%`,
				bottom: collapsed ? "calc(5.25rem + env(safe-area-inset-bottom, 0px))" : "calc(10.5rem + env(safe-area-inset-bottom, 0px))"
			},
			children: bubble.text
		}, bubble.id))
	});
}
function GlaumuleChip({ className }) {
	const catalog = usePlayerStore((s) => s.catalog);
	const channelSlug = usePlayerStore((s) => s.channelSlug);
	const status = usePlayerStore((s) => s.status);
	const channel = catalog.channels.find((item) => item.slug === channelSlug);
	const [points, setPoints] = (0, import_react.useState)(0);
	const show = Boolean(channel?.glaumules && (status === "playing" || status === "paused" || status === "loading"));
	(0, import_react.useEffect)(() => {
		setPoints(loadGlaumules());
		const onChange = (event) => {
			const detail = event.detail;
			setPoints(typeof detail === "number" ? detail : loadGlaumules());
		};
		window.addEventListener(GLAUMULE_EVENT, onChange);
		return () => window.removeEventListener(GLAUMULE_EVENT, onChange);
	}, []);
	if (!show) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("shrink-0 rounded-full bg-glaum/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-glaum-soft", className),
		children: ["Glaumules ", points]
	});
}
function MiniPlayer() {
	const status = usePlayerStore((s) => s.status);
	const track = usePlayerStore((s) => s.track);
	const channelSlug = usePlayerStore((s) => s.channelSlug);
	const catalog = usePlayerStore((s) => s.catalog);
	const currentTime = usePlayerStore((s) => s.currentTime);
	const duration = usePlayerStore((s) => s.duration);
	const collapsed = usePlayerStore((s) => s.playerCollapsed);
	const identity = usePlayerStore((s) => s.identity);
	const claims = usePlayerStore((s) => s.claims);
	const togglePlay = usePlayerStore((s) => s.togglePlay);
	const next = usePlayerStore((s) => s.next);
	const prev = usePlayerStore((s) => s.prev);
	const setPlayerCollapsed = usePlayerStore((s) => s.setPlayerCollapsed);
	const skipAllowed = usePlayerStore((s) => s.channelSlug ? s.skipAllowed(s.channelSlug) : true);
	const channel = catalog.channels.find((item) => item.slug === channelSlug);
	const playing = status === "playing";
	const empty = !track || status === "idle" || status === "off-air";
	const claim = channelSlug ? claims[channelSlug] : void 0;
	const held = heldClaim(claims, identity);
	const driving = Boolean(held?.own && held.slug === channelSlug);
	const elapsed = driving && claim?.claimedAt ? Date.now() - claim.claimedAt : 0;
	const remaining = driving && claim?.expiresAt ? claim.expiresAt - Date.now() : 0;
	const progress = duration > 0 ? currentTime / duration : 0;
	const skin = channel?.skin && channel.skin !== "none" ? channel.skin : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur-sm", driving && "player-shell-buzz", !driving && skin === "glaum" && "player-shell-glaum", !driving && skin === "waheguru" && "player-shell-wahe"),
		children: [!empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-0.5 bg-line",
			"aria-hidden": true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("h-full", driving ? "player-bar-buzz" : skin === "glaum" ? "player-bar-glaum" : skin === "waheguru" ? "player-bar-wahe" : "bg-ember"),
				style: { width: `${Math.min(100, Math.max(0, progress * 100))}%` }
			})
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-6xl px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1",
			children: empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-12 items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate font-mono text-[11px] uppercase tracking-[0.16em] text-muted",
					children: status === "off-air" ? "Off air — choose another channel" : "The network is quiet. Open a channel."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collapse, {
					collapsed,
					onToggle: () => setPlayerCollapsed(!collapsed)
				})]
			}) : collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-14 items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setPlayerCollapsed(false),
						className: "min-w-0 flex-1 text-left",
						"aria-label": "Expand player",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-display text-sm font-semibold",
							children: track.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate font-mono text-[11px] uppercase tracking-[0.12em] text-muted",
							children: [track.artist, channel ? ` · ${channel.name}` : ""]
						})]
					}),
					driving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "lamp-pink font-mono text-[10px] uppercase tracking-[0.12em] tabular-nums",
						children: formatRemaining(elapsed)
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlaumuleChip, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Previous",
						disabled: !skipAllowed,
						onClick: () => void prev(),
						className: "inline-flex size-11 items-center justify-center disabled:text-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": playing ? "Pause" : "Play",
						onClick: () => void togglePlay(),
						className: "inline-flex size-11 items-center justify-center",
						children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 ml-0.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Next",
						disabled: !skipAllowed,
						onClick: () => void next(),
						className: "inline-flex size-11 items-center justify-center disabled:text-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collapse, {
						collapsed: true,
						onToggle: () => setPlayerCollapsed(false)
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/player/$id",
									params: { id: track.id },
									className: "truncate font-display text-lg font-semibold",
									children: track.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate text-sm text-muted",
									children: [track.artist, channel ? ` · ${channel.name}` : ""]
								})]
							}),
							driving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "lamp-pink font-mono text-[10px] uppercase tracking-[0.12em] tabular-nums",
								children: [
									formatRemaining(elapsed),
									" · ",
									formatRemaining(remaining),
									" left"
								]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collapse, {
								collapsed: false,
								onToggle: () => setPlayerCollapsed(true)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-10 font-mono text-[10px] tabular-nums text-subtle",
								children: formatClock(currentTime)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 0,
								max: Math.max(duration, 1),
								value: currentTime,
								onChange: (event) => usePlayerStore.getState().seek(Number(event.target.value)),
								className: "h-11 flex-1 accent-ember"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-10 text-right font-mono text-[10px] tabular-nums text-subtle",
								children: formatClock(duration)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex items-center justify-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Previous",
								disabled: !skipAllowed,
								onClick: () => void prev(),
								className: "inline-flex size-11 items-center justify-center disabled:text-subtle",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": playing ? "Pause" : "Play",
								onClick: () => void togglePlay(),
								className: "inline-flex size-12 items-center justify-center rounded-full bg-fg text-bg",
								children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 ml-0.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Next",
								disabled: !skipAllowed,
								onClick: () => void next(),
								className: "inline-flex size-11 items-center justify-center disabled:text-subtle",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-4" })
							})
						]
					})
				]
			})
		})]
	});
}
function Collapse({ collapsed, onToggle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": collapsed ? "Expand player" : "Collapse player",
		onClick: onToggle,
		className: "inline-flex size-11 items-center justify-center text-muted",
		children: collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4" })
	});
}
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
function fromAppUser(user) {
	return {
		id: user.id,
		email: user.primaryEmail,
		name: user.displayName,
		image: user.profileImageUrl,
		isAdmin: isAdminEmail(user.primaryEmail)
	};
}
function useRadioUser() {
	const ba = useCurrentUserState();
	const [remote, setRemote] = (0, import_react.useState)(null);
	const [remotePending, setRemotePending] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let alive = true;
		getRadioSession().then((data) => {
			if (!alive) return;
			setRemote({
				user: data.user ? {
					id: data.user.id,
					email: data.user.email,
					name: data.user.name,
					image: data.user.image,
					isAdmin: data.user.isAdmin
				} : null,
				r2Configured: data.r2Configured
			});
		}).catch(() => {
			if (!alive) return;
			setRemote({
				user: null,
				r2Configured: false
			});
		}).finally(() => {
			if (alive) setRemotePending(false);
		});
		return () => {
			alive = false;
		};
	}, [ba.user?.id]);
	const user = (0, import_react.useMemo)(() => {
		if (remote?.user) return remote.user;
		if (ba.user) return fromAppUser(ba.user);
		return null;
	}, [ba.user, remote?.user]);
	return {
		user,
		isAdmin: Boolean(user?.isAdmin),
		r2Configured: Boolean(remote?.r2Configured),
		isPending: ba.isPending || remotePending
	};
}
function ssoLoginHref(next = "/") {
	const path = next.startsWith("/") && !next.startsWith("//") ? next : "/";
	return `/api/sso/login?next=${encodeURIComponent(path)}`;
}
var subscribeToNothing = () => () => {};
function AuthSlot() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { user, isAdmin, isPending } = useRadioUser();
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, () => false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 w-24 shrink-0 animate-pulse rounded-md bg-bg-elevated" });
	if (!user) {
		if (gateSession) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 w-24 shrink-0 rounded-md bg-bg-elevated" });
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: ssoLoginHref(pathname || "/"),
			className: "inline-flex h-11 shrink-0 items-center px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
			children: "Sign in with Google"
		});
	}
	const label = user.email || user.name || "Signed in";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 shrink-0 items-center gap-2",
		children: [
			user.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.image,
				alt: "",
				className: "size-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("grid size-8 place-items-center rounded-full font-mono text-[11px]", isAdmin ? "bg-gold/20 text-gold" : "bg-bg-elevated text-muted"),
				children: isAdmin ? "C" : (label[0] || "?").toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden max-w-[11rem] truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted lg:inline",
				children: label
			}),
			isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden font-mono text-[10px] uppercase tracking-[0.14em] text-gold sm:inline",
				children: "C"
			}) : null,
			gateSession ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "/logout",
				className: "inline-flex h-11 items-center font-mono text-[10px] uppercase tracking-[0.12em] text-subtle hover:text-fg",
				children: "Sign out"
			})
		]
	});
}
function HubLinks() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "hidden items-center gap-2 md:flex",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: "https://terrainfinity.ca",
			className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle hover:text-gold",
			children: "Hub"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: "https://cyber-athens.ca",
			className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle hover:text-gold",
			children: "Athens"
		})]
	});
}
function DriveBadge() {
	const identity = usePlayerStore((s) => s.identity);
	const autoplay = usePlayerStore((s) => s.autoplay);
	const setAutoplay = usePlayerStore((s) => s.setAutoplay);
	const claims = usePlayerStore((s) => s.claims);
	const catalog = usePlayerStore((s) => s.catalog);
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	const driving = heldClaim(claims, identity, now);
	(0, import_react.useEffect)(() => {
		if (!driving) return;
		const id = window.setInterval(() => setNow(Date.now()), 250);
		return () => window.clearInterval(id);
	}, [driving?.slug]);
	if (driving?.own) {
		const remaining = claimRemainingMs(driving.claim, now);
		const elapsed = claimElapsedMs(driving.claim, now);
		const ratio = claimRemainRatio(driving.claim, now);
		const name = catalog.channels.find((item) => item.slug === driving.slug)?.name ?? "desk";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/channel/$slug",
			params: { slug: driving.slug },
			className: "drive-badge inline-flex h-11 max-w-[52vw] shrink-0 items-center gap-2 px-1 sm:max-w-none",
			title: `Driving ${name} · on ${formatRemaining(elapsed)} · ${formatRemaining(remaining)} left`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DriveRing, {
					ratio,
					urgent: remaining > 0 && remaining < 6e4
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "dj-timer block font-mono text-[10px] font-medium uppercase tracking-[0.16em] tabular-nums leading-none",
						children: formatRemaining(elapsed)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 block font-mono text-[9px] uppercase tracking-[0.14em] text-buzz/80",
						children: remaining > 0 ? `${formatRemaining(remaining)} left` : "live"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "sr-only",
					children: [
						"Autoplay lamp is pink. You are driving ",
						name,
						". On for ",
						formatRemaining(elapsed),
						". ",
						formatRemaining(remaining),
						" remaining."
					]
				})
			]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => setAutoplay(!autoplay),
		className: "inline-flex h-11 shrink-0 items-center gap-2 px-1",
		"aria-pressed": autoplay,
		title: autoplay ? "Autoplay on — stations start when you open them" : "Autoplay off",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "lamp-bezel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("lamp", autoplay && "lamp-live") })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-subtle sm:inline",
				children: "auto"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "sr-only",
				children: ["Autoplay ", autoplay ? "on" : "off"]
			})
		]
	});
}
function DriveRing({ ratio, urgent }) {
	const r = 9;
	const c = 2 * Math.PI * r;
	const clamped = Math.min(1, Math.max(0, ratio));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("drive-bezel relative", urgent && "drive-ring-urgent"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			className: "drive-ring absolute inset-0 size-7 -rotate-90",
			viewBox: "0 0 28 28",
			"aria-hidden": true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "14",
				cy: "14",
				r,
				fill: "none",
				stroke: "rgb(255 61 154 / 0.22)",
				strokeWidth: "2"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "14",
				cy: "14",
				r,
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "2",
				strokeLinecap: "round",
				strokeDasharray: `${c * clamped} ${c}`
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "lamp lamp-buzz" })]
	});
}
var links = [
	{
		href: "/",
		label: "Stations"
	},
	{
		href: "/player",
		label: "Player"
	},
	{
		href: "/rankings",
		label: "Rankings"
	},
	{
		href: "/library",
		label: "Library"
	},
	{
		href: "/about",
		label: "About"
	},
	{
		href: "/desk",
		label: "Desk"
	}
];
function SiteHeader() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const identity = usePlayerStore((s) => s.identity);
	const driving = heldClaim(usePlayerStore((s) => s.claims), identity);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl items-center gap-2 px-4 py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "min-w-0 shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("mark-radio font-display text-lg font-semibold leading-none tracking-[0.28em]", driving?.own ? "text-buzz" : "text-gold"),
						children: "Radio"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DriveBadge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto",
					children: links.map((link) => {
						const active = link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: link.href,
							className: cn("inline-flex h-11 shrink-0 items-center px-2 font-mono text-[11px] uppercase tracking-[0.14em]", active ? driving?.own ? "text-buzz" : "text-gold" : "text-muted hover:text-fg"),
							children: link.label
						}, link.href);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HubLinks, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, {}),
				identity ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden max-w-24 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted xl:inline",
					children: identity.name
				}) : null
			]
		})
	});
}
function RadioShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const collapsed = usePlayerStore((s) => s.playerCollapsed);
	const hydrate = usePlayerStore((s) => s.hydrate);
	const claims = usePlayerStore((s) => s.claims);
	const identity = usePlayerStore((s) => s.identity);
	const driving = Boolean(heldClaim(claims, identity)?.own);
	const embed = pathname === "/embed" || pathname.startsWith("/embed/");
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	(0, import_react.useEffect)(() => {
		document.documentElement.classList.toggle("is-dj", driving);
	}, [driving]);
	if (embed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-dvh overflow-hidden bg-bg",
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Atmosphere, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeepLink, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("relative z-10 flex min-h-dvh flex-col", driving && "is-dj"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: cn("flex-1", collapsed ? "pb-20" : "pb-44"),
					children
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniPlayer, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoveBubbles, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnterGate, {})
		]
	});
}
var styles_default = "/assets/styles-BEUhvukd.css";
var APP_NAME = "Radio";
var Route$17 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#070605"
			},
			{
				name: "description",
				content: "A dark-elf clockwork radio. Live clocks, on-demand vaults, and a first frequency called Default."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Syne:wght@500;600;700;800&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$10 = () => import("./routes-BaSG08Hd.mjs");
var Route$16 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./about-sjvYBAy7.mjs");
var Route$15 = createFileRoute("/about")({
	component: lazyRouteComponent($$splitComponentImporter$9, "component"),
	head: () => ({ meta: [{ title: "About · Radio" }] })
});
var $$splitComponentImporter$8 = () => import("./desk-BHoQq5WR.mjs");
var Route$14 = createFileRoute("/desk")({
	component: lazyRouteComponent($$splitComponentImporter$8, "component"),
	head: () => ({ meta: [{ title: "Station desk · Radio" }] })
});
var $$splitComponentImporter$7 = () => import("./embed-BsP2xzt1.mjs");
var Route$13 = createFileRoute("/embed")({
	component: lazyRouteComponent($$splitComponentImporter$7, "component"),
	head: () => ({ meta: [{ title: "Radio embed" }] })
});
var $$splitComponentImporter$6 = () => import("./library-DGWFB22Q.mjs");
var Route$12 = createFileRoute("/library")({
	component: lazyRouteComponent($$splitComponentImporter$6, "component"),
	head: () => ({ meta: [{ title: "Library · Radio" }] })
});
var $$splitComponentImporter$5 = () => import("./login-Dm29zrky.mjs");
var Route$11 = createFileRoute("/login")({
	component: lazyRouteComponent($$splitComponentImporter$5, "component"),
	head: () => ({ meta: [{ title: "Sign in · Radio" }] })
});
var $$splitComponentImporter$4 = () => import("./logout-BZ_w7rU3.mjs");
async function logoutResponse(request) {
	const { clearSsoCookie, logoutLocation } = await import("./sso.server-CuN0LZXH.mjs").then((n) => n.m);
	return new Response(null, {
		status: 302,
		headers: {
			Location: logoutLocation(request),
			"Set-Cookie": clearSsoCookie(request)
		}
	});
}
var Route$10 = createFileRoute("/logout")({
	server: { handlers: {
		GET: ({ request }) => logoutResponse(request),
		POST: ({ request }) => logoutResponse(request)
	} },
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./rankings-DklfkVC9.mjs");
var Route$9 = createFileRoute("/rankings")({
	component: lazyRouteComponent($$splitComponentImporter$3, "component"),
	head: () => ({ meta: [{ title: "Rankings · Radio" }] })
});
var $$splitComponentImporter$2 = () => import("../_slug-EdW9HFD4.mjs");
var Route$8 = createFileRoute("/channel/$slug")({
	component: lazyRouteComponent($$splitComponentImporter$2, "component"),
	head: ({ params }) => {
		const channel = getChannel(params.slug);
		return { meta: [{ title: channel ? `${channel.name} · Radio` : "Channel · Radio" }] };
	}
});
var $$splitComponentImporter$1 = () => import("./player-CQvaIS8k.mjs");
var Route$7 = createFileRoute("/player/")({
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	head: () => ({ meta: [{ title: "Player · Radio" }] })
});
var $$splitComponentImporter = () => import("../_id-aJF6HGhq.mjs");
var Route$6 = createFileRoute("/player/$id")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	head: ({ params }) => {
		const song = getSong(params.id);
		if (!song || song.locked) return { meta: [{ title: "Locked cut · Radio" }] };
		return { meta: [{ title: `${song.track.title} · Radio` }] };
	}
});
var Route$5 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var MAX_BYTES = 83886080;
var Route$4 = createFileRoute("/api/desk/upload")({ server: { handlers: { POST: async ({ request }) => {
	try {
		const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
		assertSameSiteRequest();
		const user = await requireAdmin();
		if (!r2Configured()) return Response.json({ error: "R2 keys are not set" }, { status: 400 });
		const form = await request.formData();
		const slug = String(form.get("slug") || "").trim();
		const file = form.get("file");
		if (!slug || !(file instanceof File)) return Response.json({ error: "Need a station slug and a file" }, { status: 400 });
		if (file.size > MAX_BYTES) return Response.json({ error: "File is larger than 80 MB" }, { status: 400 });
		const name = sanitizeUploadName(file.name);
		if (!/\.(mp3|wav|flac|m4a|ogg|aac)$/i.test(name)) return Response.json({ error: "Audio only (mp3, wav, flac, m4a, ogg, aac)" }, { status: 400 });
		const key = `${defaultPrefixForSlug(slug)}${name}`;
		const bytes = new Uint8Array(await file.arrayBuffer());
		const object = await putR2Object(key, bytes, file.type || "audio/mpeg");
		const title = String(form.get("title") || "").trim() || name.replace(/\.[^.]+$/, "");
		const coverUrl = String(form.get("coverUrl") || "").trim() || void 0;
		const edit = await addTrack(user, {
			channelSlug: slug,
			title,
			audioUrl: object.url,
			coverUrl,
			r2Key: object.key
		});
		const edits = await listEdits();
		return Response.json({
			ok: true,
			object,
			edit,
			edits
		});
	} catch (error) {
		const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 500;
		return Response.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: status || 500 });
	}
} } } });
function escapeHtml(message) {
	return message.replace(/[&<>"]/g, (char) => {
		if (char === "&") return "&amp;";
		if (char === "<") return "&lt;";
		if (char === ">") return "&gt;";
		return "&quot;";
	});
}
function errorPage(message) {
	const safe = escapeHtml(message);
	return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Sign in \u00b7 Radio</title>
<style>body{margin:0;min-height:100dvh;background:#070605;color:#e8e2d6;font-family:"IBM Plex Sans",sans-serif;display:grid;place-items:center;padding:2rem}a{color:#c9a36a}</style>
</head><body><main><p>Frequency</p><h1>Sign-in missed</h1><p>${safe}</p><p><a href="/">Back to stations</a></p></main></body></html>`, {
		status: 400,
		headers: { "content-type": "text/html; charset=utf-8" }
	});
}
var Route$3 = createFileRoute("/api/sso/consume")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const next = safeNext(url.searchParams.get("next") || readNextFromCookie(request));
	if (!code) return errorPage("Missing code from the hub.");
	try {
		const user = await exchangeSsoCode(code);
		const cookie = await mintSsoCookie(user, request);
		const resolved = new URL(next, request.url);
		const safeLocation = resolved.pathname.startsWith("/") && !resolved.pathname.startsWith("//") ? `${resolved.pathname}${resolved.search}` : "/";
		const headers = new Headers({ Location: safeLocation });
		headers.append("Set-Cookie", cookie);
		headers.append("Set-Cookie", clearNextCookie(request));
		return new Response(null, {
			status: 302,
			headers
		});
	} catch (error) {
		return errorPage(error instanceof Error ? error.message : "Hub exchange failed.");
	}
} } } });
var Route$2 = createFileRoute("/api/sso/login")({ server: { handlers: { GET: ({ request }) => {
	const url = new URL(request.url);
	const next = safeNext(url.searchParams.get("next"));
	const origin = requestOrigin(request);
	const consume = new URL("/api/sso/consume", origin);
	consume.searchParams.set("next", next);
	const start = new URL("/api/sso/start", hubOrigin());
	start.searchParams.set("returnTo", consume.toString());
	return new Response(null, {
		status: 302,
		headers: {
			Location: start.toString(),
			"Set-Cookie": mintNextCookie(next, request)
		}
	});
} } } });
function logout(request) {
	return new Response(null, {
		status: 302,
		headers: {
			Location: logoutLocation(request),
			"Set-Cookie": clearSsoCookie(request)
		}
	});
}
var Route$1 = createFileRoute("/api/sso/logout")({ server: { handlers: {
	GET: ({ request }) => logout(request),
	POST: ({ request }) => logout(request)
} } });
var Route = createFileRoute("/api/sso/me")({ server: { handlers: { GET: async () => {
	const user = await resolveRadioUser();
	return Response.json({
		user,
		r2Configured: r2Configured$1()
	});
} } } });
var IndexRoute = Route$16.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$17
});
var AboutRoute = Route$15.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => Route$17
});
var DeskRoute = Route$14.update({
	id: "/desk",
	path: "/desk",
	getParentRoute: () => Route$17
});
var EmbedRoute = Route$13.update({
	id: "/embed",
	path: "/embed",
	getParentRoute: () => Route$17
});
var LibraryRoute = Route$12.update({
	id: "/library",
	path: "/library",
	getParentRoute: () => Route$17
});
var LoginRoute = Route$11.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$17
});
var LogoutRoute = Route$10.update({
	id: "/logout",
	path: "/logout",
	getParentRoute: () => Route$17
});
var RankingsRoute = Route$9.update({
	id: "/rankings",
	path: "/rankings",
	getParentRoute: () => Route$17
});
var ChannelSlugRoute = Route$8.update({
	id: "/channel/$slug",
	path: "/channel/$slug",
	getParentRoute: () => Route$17
});
var PlayerIndexRoute = Route$7.update({
	id: "/player/",
	path: "/player/",
	getParentRoute: () => Route$17
});
var rootRouteChildren = {
	IndexRoute,
	AboutRoute,
	DeskRoute,
	EmbedRoute,
	LibraryRoute,
	LoginRoute,
	LogoutRoute,
	RankingsRoute,
	ChannelSlugRoute,
	PlayerIdRoute: Route$6.update({
		id: "/player/$id",
		path: "/player/$id",
		getParentRoute: () => Route$17
	}),
	PlayerIndexRoute,
	ApiAuthSplatRoute: Route$5.update({
		id: "/api/auth/$",
		path: "/api/auth/$",
		getParentRoute: () => Route$17
	}),
	ApiDeskUploadRoute: Route$4.update({
		id: "/api/desk/upload",
		path: "/api/desk/upload",
		getParentRoute: () => Route$17
	}),
	ApiSsoConsumeRoute: Route$3.update({
		id: "/api/sso/consume",
		path: "/api/sso/consume",
		getParentRoute: () => Route$17
	}),
	ApiSsoLoginRoute: Route$2.update({
		id: "/api/sso/login",
		path: "/api/sso/login",
		getParentRoute: () => Route$17
	}),
	ApiSsoLogoutRoute: Route$1.update({
		id: "/api/sso/logout",
		path: "/api/sso/logout",
		getParentRoute: () => Route$17
	}),
	ApiSsoMeRoute: Route.update({
		id: "/api/sso/me",
		path: "/api/sso/me",
		getParentRoute: () => Route$17
	})
};
var routeTree = Route$17._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { restoreStationTrack as _, ssoLoginHref as a, liveCursor as c, addStationTrack as d, deleteStationFile as f, listStationR2 as g, hideStationTrack as h, Route$13 as i, upcomingTracks as l, getRadioSession as m, Route$6 as n, useRadioUser as o, desk_api_exports as p, Route$8 as r, usePlayerStore as s, router_exports as t, heldClaim as u };
