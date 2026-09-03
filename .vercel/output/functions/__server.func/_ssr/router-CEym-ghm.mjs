import { o as __toESM } from "../_runtime.mjs";
import { B as require_react, _ as createRootRoute, b as require_jsx_runtime, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { b as usePlayerStore, i as formatClock, l as getSong, n as cn, o as getChannel, y as stationSkin } from "./player-store-4Ayk7g_Y.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { A as boolean, D as _enum, F as object, M as literal, P as number, R as string, k as array, z as union } from "../_libs/@better-auth/core+[...].mjs";
import { t as authClient } from "./client-BoyDrSIS.mjs";
import { i as hasGateSessionMarker, t as auth } from "./server-De7W6YQL.mjs";
import { n as createMiddleware, r as createServerFn } from "./ssr.mjs";
import { t as assertSameSiteRequest } from "./isolation.server-B5IRAOYQ.mjs";
import { i as listStationEdits, r as listEdits, t as addTrack } from "./catalog-edits.server-BpE6K3Ld.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { a as sanitizeUploadName, n as putR2Object, r as r2Configured, t as defaultPrefixForSlug } from "./r2.server-c_pO0NX7.mjs";
import { _ as isAdminEmail, a as logoutLocation, c as readNextFromCookie, d as resolveRadioUser, f as safeRedirectPath, g as safeNext, h as isRelativeNext, i as loginLocation, l as readSsoUser, m as consumeHandoffHref, n as clearSsoCookie, o as mintSsoCookie, r as exchangeSsoCode, s as r2Configured$1, t as clearNextCookie, u as requireAdmin } from "./sso.server-pRd7455L.mjs";
import { a as SkipBack, c as Pause, d as ChevronDown, i as SkipForward, l as Heart, n as TriangleAlert, r as Star, s as Play, t as Volume2, u as ChevronUp } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desk-api-D5uE_snH.js
var desk_api_exports = /* @__PURE__ */ __exportAll({
	addStationTrack: () => addStationTrack,
	deleteR2Object: () => deleteR2Object,
	deleteStationFile: () => deleteStationFile,
	getRadioSession: () => getRadioSession,
	hideStationTrack: () => hideStationTrack,
	listCatalogEdits: () => listCatalogEdits,
	listStationR2: () => listStationR2,
	moveR2Object: () => moveR2Object,
	patchStationTrack: () => patchStationTrack,
	pingServices: () => pingServices,
	reorderStationTracks: () => reorderStationTracks,
	restoreStationTrack: () => restoreStationTrack,
	saveStation: () => saveStation
});
var radioSessionMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-BoyDrSIS.mjs").then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { resolveRadioUser, r2Configured, envLamps } = await import("./sso.server-pRd7455L.mjs").then((n) => n.p);
	return next({ context: {
		user: await resolveRadioUser(context.bearerToken),
		r2Configured: r2Configured(),
		lamps: envLamps()
	} });
});
var adminMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-BoyDrSIS.mjs").then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-B5IRAOYQ.mjs").then((n) => n.n);
	const { requireAdmin, r2Configured, envLamps } = await import("./sso.server-pRd7455L.mjs").then((n) => n.p);
	assertSameSiteRequest();
	return next({ context: {
		user: await requireAdmin(context.bearerToken),
		r2Configured: r2Configured(),
		lamps: envLamps()
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
var patchStationTrack = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	channelSlug: string().min(1),
	trackId: string().min(1),
	title: string().optional(),
	artist: string().optional(),
	audioUrl: string().optional(),
	durationSec: number().optional()
}).parse(input)).handler(createSsrRpc("da98c26cacb974e0e1405aa77e85814e3a2aec5b3a4e0b9e2e42c4119a20f587"));
var reorderStationTracks = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	channelSlug: string().min(1),
	trackIds: array(string().min(1)).min(1)
}).parse(input)).handler(createSsrRpc("86faca5244608013bd67686cf60e5d0459a82e02de3fa9da95267f70f32d0bd4"));
var deleteStationFile = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	channelSlug: string().min(1),
	trackId: string().min(1),
	audioUrl: string().min(1),
	r2Key: string().optional(),
	alsoDeleteR2: boolean()
}).parse(input)).handler(createSsrRpc("d9c9172f364a7e534585135887b704f2b3b59298313c4af8e00a092debec0967"));
var saveStation = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	slug: string().min(1),
	added: boolean().optional(),
	hidden: boolean().optional(),
	name: string().optional(),
	description: string().optional(),
	energy: string().optional(),
	category: string().optional(),
	cover: string().optional(),
	kind: _enum([
		"live",
		"ondemand",
		"fixed"
	]).optional(),
	featured: boolean().optional(),
	featuredRank: number().optional(),
	enabled: boolean().optional(),
	nsfw: boolean().optional(),
	tags: string().optional()
}).parse(input)).handler(createSsrRpc("cc74c64dc2667ff889d7baf82b14c6704c54a443ca298f5c60de9cf63700e054"));
var listStationR2 = createServerFn({ method: "GET" }).middleware([adminMiddleware]).validator((input) => object({
	prefix: string().optional(),
	slug: string().optional()
}).parse(input)).handler(createSsrRpc("df9d243e1b860c4496bba86a34cad4e87c50b6b7b199b0acf683fa5bc37e5c1f"));
var moveR2Object = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	from: string().min(1),
	to: string().min(1)
}).parse(input)).handler(createSsrRpc("6419abad04b105db7e36894252b6619b53542483e9295a713c9ad8fd0458c6d0"));
var deleteR2Object = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({ key: string().min(1) }).parse(input)).handler(createSsrRpc("b9c9fe0cca0befd3ae8bedbf69fee8d4a08b690b7d33de85aa2f47a155c3c7f0"));
var pingServices = createServerFn({ method: "GET" }).middleware([adminMiddleware]).handler(createSsrRpc("ad177eb156e0e962cf763c344be8866b84009abc7a6c31f2269e1048d8e105ad"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-CEym-ghm.js
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
function Atmosphere({ skin = "none" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none fixed inset-0 z-0 overflow-hidden",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "atmosphere-clockwork",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gear gear-a" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gear gear-b" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gear gear-c" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gallifrey gallifrey-a" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gallifrey gallifrey-b" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dial" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-sand" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "sand-grain" }),
			skin === "glaum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-glaum" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-glaum-spark" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-glaum-shrimp" })
			] }) : null,
			skin === "waheguru" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-wahe" }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-vignette" })
		]
	});
}
function AutoplayLamp({ label = "Auto" }) {
	const autoplay = usePlayerStore((s) => s.autoplay);
	const setAutoplay = usePlayerStore((s) => s.setAutoplay);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => setAutoplay(!autoplay),
		"aria-pressed": autoplay,
		title: autoplay ? "Autoplay on — next cut starts itself" : "Autoplay off",
		className: "inline-flex h-11 shrink-0 items-center gap-2 px-2 font-mono text-[11px] uppercase tracking-[0.14em]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "lamp-bezel",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("lamp", autoplay && "lamp-live") })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn(autoplay ? "lamp-on" : "text-subtle"),
			children: label
		})]
	});
}
function EnterGate() {
	const enterGate = usePlayerStore((s) => s.enterGate);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 grid place-items-center bg-bg/95 px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[11px] uppercase tracking-[0.22em] text-gold",
					children: "Frequency"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 font-display text-5xl font-semibold tracking-tight",
					children: "Radio"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-muted",
					children: "The green lamp is on. Default begins the clock. After this visit, this tab resumes wherever you left the dial. Dim the lamp if you want silence on arrival."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 flex justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutoplayLamp, { label: "Autoplay on" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => enterGate(),
						className: "inline-flex h-12 min-w-44 items-center justify-center rounded-md bg-fg px-6 font-mono text-[12px] uppercase tracking-[0.16em] text-bg",
						children: "Tune in"
					})
				})
			]
		})
	});
}
var WORDS = [
	"glåüm",
	"shrimp",
	"om",
	"sat nam",
	"pop",
	"♡",
	"prawn",
	"lantern",
	"sequin"
];
var seq = 1;
function LoveLayer() {
	const slug = usePlayerStore((s) => s.channelSlug);
	const status = usePlayerStore((s) => s.status);
	const collect = usePlayerStore((s) => s.collectGlaumule);
	const channel = slug ? getChannel(slug) : void 0;
	const skin = channel ? stationSkin(channel) : "none";
	const active = Boolean(channel && status === "playing" && (channel.loveBubbles || channel.glaumules || skin === "glaum"));
	const [orbs, setOrbs] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!active) {
			setOrbs([]);
			return;
		}
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const spawn = (kind, label) => {
			const id = seq++;
			const orb = {
				id,
				left: 8 + Math.random() * 84,
				label: label || WORDS[Math.floor(Math.random() * WORDS.length)],
				kind
			};
			setOrbs((current) => [...current.slice(-22), orb]);
			window.setTimeout(() => {
				setOrbs((current) => current.filter((item) => item.id !== id));
			}, kind === "pop" ? 2100 : 5100);
		};
		const timer = window.setInterval(() => {
			spawn("float");
			if (Math.random() > .55) spawn("float");
		}, 2200);
		spawn("float");
		spawn("float", "glåüm");
		const onLove = (event) => {
			const detail = event.detail;
			spawn("pop", detail?.kind === "like" ? "♡" : "glåüm");
			spawn("float", "shrimp");
		};
		window.addEventListener("radio-love", onLove);
		return () => {
			window.clearInterval(timer);
			window.removeEventListener("radio-love", onLove);
		};
	}, [active]);
	if (!active && orbs.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "love-layer",
		"aria-hidden": true,
		children: orbs.map((orb) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: orb.kind === "pop" ? "love-orb love-orb-pop love-orb-glaum" : "love-orb love-orb-glaum",
			style: { left: `${orb.left}%` },
			onClick: () => {
				collect(1);
				setOrbs((current) => current.filter((item) => item.id !== orb.id));
				window.dispatchEvent(new CustomEvent("radio-love", { detail: { kind: "collect" } }));
			},
			children: orb.label
		}, orb.id))
	});
}
function CoverArt({ src, alt, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src,
		alt,
		className: cn("object-cover", className)
	});
}
function TrackActions({ trackId, compact = false }) {
	const liked = usePlayerStore((s) => s.liked.includes(trackId));
	const favorite = usePlayerStore((s) => s.favorites.includes(trackId));
	const likes = usePlayerStore((s) => s.likeCounts[trackId] ?? 0);
	const views = usePlayerStore((s) => s.views[trackId] ?? 0);
	const toggleLike = usePlayerStore((s) => s.toggleLike);
	const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-wrap items-center", compact ? "gap-1" : "gap-2"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: (event) => {
					event.preventDefault();
					event.stopPropagation();
					toggleLike(trackId);
				},
				className: cn("inline-flex h-11 items-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em]", liked ? "text-buzz" : "text-subtle hover:text-gold"),
				"aria-pressed": liked,
				"aria-label": "Like",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
					className: "size-4",
					fill: liked ? "currentColor" : "none"
				}), likes > 0 ? likes : compact ? "" : "Like"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: (event) => {
					event.preventDefault();
					event.stopPropagation();
					toggleFavorite(trackId);
				},
				className: cn("inline-flex h-11 items-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em]", favorite ? "text-gold" : "text-subtle hover:text-gold"),
				"aria-pressed": favorite,
				"aria-label": "Favorite",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
					className: "size-4",
					fill: favorite ? "currentColor" : "none"
				}), compact ? "" : favorite ? "Saved" : "Save"]
			}),
			views > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
				children: [views, " plays"]
			}) : null
		]
	});
}
function VuMeter({ playing, skin }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("vu-meter", playing && "vu-meter-on", skin === "glaum" && "vu-meter-glaum"),
		"aria-hidden": true,
		children: Array.from({ length: 12 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { animationDelay: `${i * .07}s` } }, i))
	});
}
function MiniPlayer() {
	const track = usePlayerStore((s) => s.track);
	const status = usePlayerStore((s) => s.status);
	const slug = usePlayerStore((s) => s.channelSlug);
	const currentTime = usePlayerStore((s) => s.currentTime);
	const duration = usePlayerStore((s) => s.duration);
	const volume = usePlayerStore((s) => s.volume);
	const collapsed = usePlayerStore((s) => s.playerCollapsed);
	const togglePlay = usePlayerStore((s) => s.togglePlay);
	const next = usePlayerStore((s) => s.next);
	const prev = usePlayerStore((s) => s.prev);
	const seek = usePlayerStore((s) => s.seek);
	const setVolume = usePlayerStore((s) => s.setVolume);
	const setPlayerCollapsed = usePlayerStore((s) => s.setPlayerCollapsed);
	const skipAllowed = usePlayerStore((s) => s.skipAllowed);
	const channel = slug ? getChannel(slug) : void 0;
	if (!track || !channel) return null;
	const playing = status === "playing";
	const canSkip = skipAllowed(channel.slug);
	const pct = duration > 0 ? Math.min(100, currentTime / duration * 100) : 0;
	const skin = stationSkin(channel);
	const remaining = Math.max(0, duration - currentTime);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm", skin === "glaum" && "player-shell-glaum", skin === "waheguru" && "player-shell-wahe"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-0.5 bg-line",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("h-full bg-ember", skin === "glaum" && "player-bar-glaum", skin === "waheguru" && "player-bar-wahe"),
				style: { width: `${pct}%` }
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-4 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
						src: track.coverUrl || channel.cover,
						alt: "",
						className: cn("shrink-0 rounded-md", collapsed ? "size-11" : "size-14")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("truncate font-display leading-none", collapsed ? "text-lg" : "text-xl", skin === "glaum" && "glaum-title"),
							children: track.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: [
								track.artist ? `${track.artist} · ` : "",
								channel.name,
								" · ",
								formatClock(currentTime),
								" / ",
								formatClock(duration)
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutoplayLamp, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !canSkip,
						onClick: () => void prev(),
						className: cn("hidden size-11 place-items-center text-gold sm:grid", !canSkip && "opacity-40"),
						"aria-label": "Previous",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void togglePlay(),
						className: "grid size-11 place-items-center text-gold",
						"aria-label": playing ? "Pause" : "Play",
						children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-5 ml-0.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !canSkip,
						onClick: () => void next("user"),
						className: cn("grid size-11 place-items-center text-gold", !canSkip && "opacity-40"),
						"aria-label": "Skip",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setPlayerCollapsed(!collapsed),
						className: "grid size-11 place-items-center text-subtle",
						"aria-label": collapsed ? "Expand player" : "Collapse player",
						children: collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-5" })
					})
				]
			}), !collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VuMeter, {
						playing,
						skin
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-10 shrink-0 font-mono text-[10px] tabular-nums text-subtle",
								children: formatClock(currentTime)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 0,
								max: Math.max(1, duration),
								step: .25,
								value: Math.min(currentTime, duration || 0),
								disabled: !canSkip,
								onChange: (event) => seek(Number(event.target.value)),
								className: "h-11 w-full",
								"aria-label": "Seek"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "w-10 shrink-0 text-right font-mono text-[10px] tabular-nums text-subtle",
								children: ["-", formatClock(remaining)]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-w-40 flex-1 items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 0,
								max: 1,
								step: .01,
								value: volume,
								onChange: (event) => setVolume(Number(event.target.value)),
								className: "h-11 w-full",
								"aria-label": "Volume"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackActions, { trackId: track.id })]
					})
				]
			}) : null]
		})]
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
				r2Configured: data.r2Configured,
				lamps: data.lamps ?? []
			});
		}).catch(() => {
			if (!alive) return;
			setRemote({
				user: null,
				r2Configured: false,
				lamps: []
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
		lamps: remote?.lamps ?? [],
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
		if (gateSession) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
			children: "Signed in"
		});
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
function heldClaim(claims, identity) {
	if (!identity) return null;
	const now = Date.now();
	for (const [slug, claim] of Object.entries(claims)) if (claim.claimantId === identity.id && (claim.expiresAt ?? 0) > now) return {
		slug,
		own: true,
		claim
	};
	return null;
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
		href: "/library",
		label: "Library"
	},
	{
		href: "/about",
		label: "About"
	}
];
function SiteHeader() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const identity = usePlayerStore((s) => s.identity);
	const driving = heldClaim(usePlayerStore((s) => s.claims), identity);
	const points = usePlayerStore((s) => s.points);
	const glaumules = usePlayerStore((s) => s.glaumules);
	const slug = usePlayerStore((s) => s.channelSlug);
	const ready = usePlayerStore((s) => s.ready);
	const gateOpen = usePlayerStore((s) => s.gateOpen);
	const { isAdmin } = useRadioUser();
	const channel = slug ? getChannel(slug) : void 0;
	const onGlaum = Boolean(channel && stationSkin(channel) === "glaum");
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto",
					children: [links.map((link) => {
						const active = link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: link.href,
							className: cn("inline-flex h-11 shrink-0 items-center px-2 font-mono text-[11px] uppercase tracking-[0.14em]", active ? driving?.own ? "text-buzz" : "text-gold" : "text-muted hover:text-fg"),
							children: link.label
						}, link.href);
					}), isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/desk",
						className: cn("inline-flex h-11 shrink-0 items-center px-2 font-mono text-[11px] uppercase tracking-[0.14em]", pathname.startsWith("/desk") ? "text-gold" : "text-muted hover:text-fg"),
						children: "Desk"
					}) : null]
				}),
				ready && !gateOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle lg:block",
					children: [
						points,
						" pts",
						onGlaum || glaumules > 0 ? ` · ${glaumules} glåümules` : ""
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutoplayLamp, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HubLinks, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, {})
			]
		})
	});
}
/** Hub may land on this origin with ?code= after Google. Never hit consume without a code. */
function SsoCodeCatcher() {
	(0, import_react.useLayoutEffect)(() => {
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code")?.trim();
		if (!code) return;
		const path = window.location.pathname;
		if (path.startsWith("/api/sso/")) return;
		const nextParam = params.get("next");
		const next = isRelativeNext(nextParam) ? nextParam : safeNext(path || "/");
		window.location.replace(consumeHandoffHref(code, next));
	}, []);
	return null;
}
function RadioShell({ children }) {
	const hydrate = usePlayerStore((s) => s.hydrate);
	const ready = usePlayerStore((s) => s.ready);
	const gateOpen = usePlayerStore((s) => s.gateOpen);
	const slug = usePlayerStore((s) => s.channelSlug);
	const channel = slug ? getChannel(slug) : void 0;
	const skin = channel ? stationSkin(channel) : "none";
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-dvh",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SsoCodeCatcher, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Atmosphere, { skin }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoveLayer, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
					children,
					ready && !gateOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniPlayer, {}) : null
				]
			}),
			ready && gateOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnterGate, {}) : null
		]
	});
}
var styles_default = "/assets/styles-DS0a1sQ5.css";
var APP_NAME = "Radio";
var Route$15 = createRootRoute({
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
				content: "A dark-elf clockwork radio. Live clocks, on-demand vaults, and fixed start-to-finish frequencies."
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
var $$splitComponentImporter$8 = () => import("./routes-D92bZxNp.mjs");
var Route$14 = createFileRoute("/")({
	component: lazyRouteComponent($$splitComponentImporter$8, "component"),
	head: () => ({ meta: [{ title: "Radio" }] })
});
var $$splitComponentImporter$7 = () => import("./about-YnQJulZs.mjs");
var Route$13 = createFileRoute("/about")({
	component: lazyRouteComponent($$splitComponentImporter$7, "component"),
	head: () => ({ meta: [{ title: "About · Radio" }] })
});
var $$splitComponentImporter$6 = () => import("./desk-B2Sdz26f.mjs");
var Route$12 = createFileRoute("/desk")({
	component: lazyRouteComponent($$splitComponentImporter$6, "component"),
	head: () => ({ meta: [{ title: "Station desk · Radio" }] })
});
var $$splitComponentImporter$5 = () => import("./library-DqlkhuyI.mjs");
var Route$11 = createFileRoute("/library")({
	component: lazyRouteComponent($$splitComponentImporter$5, "component"),
	head: () => ({ meta: [{ title: "Library · Radio" }] })
});
var $$splitComponentImporter$4 = () => import("./login-BguY3rfC.mjs");
var Route$10 = createFileRoute("/login")({
	component: lazyRouteComponent($$splitComponentImporter$4, "component"),
	head: () => ({ meta: [{ title: "Sign in · Radio" }] })
});
var $$splitComponentImporter$3 = () => import("./logout-BZ_w7rU3.mjs");
var Route$9 = createFileRoute("/logout")({
	server: { handlers: {
		GET: async ({ request }) => {
			const { clearSsoCookie, logoutLocation } = await import("./sso.server-pRd7455L.mjs").then((n) => n.p);
			return new Response(null, {
				status: 302,
				headers: {
					Location: logoutLocation(request),
					"Set-Cookie": clearSsoCookie(request)
				}
			});
		},
		POST: async ({ request }) => {
			const { clearSsoCookie, logoutLocation } = await import("./sso.server-pRd7455L.mjs").then((n) => n.p);
			return new Response(null, {
				status: 302,
				headers: {
					Location: logoutLocation(request),
					"Set-Cookie": clearSsoCookie(request)
				}
			});
		}
	} },
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("../_slug-BkNgAp6-.mjs");
var Route$8 = createFileRoute("/channel/$slug")({
	component: lazyRouteComponent($$splitComponentImporter$2, "component"),
	head: ({ params }) => {
		return { meta: [{ title: `${getChannel(params.slug)?.name ?? "Station"} · Radio` }] };
	}
});
var $$splitComponentImporter$1 = () => import("./player-CEhC5170.mjs");
var Route$7 = createFileRoute("/player/")({
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	head: () => ({ meta: [{ title: "Player · Radio" }] })
});
var $$splitComponentImporter = () => import("../_id-BXuquL4Q.mjs");
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
		const tracks = await listEdits();
		const stations = await listStationEdits();
		return Response.json({
			ok: true,
			object,
			edit,
			tracks,
			stations
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
	return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Sign in · Radio</title>
<style>body{margin:0;min-height:100dvh;background:#070605;color:#e8e2d6;font-family:"IBM Plex Sans",sans-serif;display:grid;place-items:center;padding:2rem}a{color:#c9a36a}</style>
</head><body><main><p>Frequency</p><h1>Sign-in missed</h1><p>${safe}</p><p><a href="/">Back to stations</a></p></main></body></html>`, {
		status: 400,
		headers: { "content-type": "text/html; charset=utf-8" }
	});
}
function redirectHome(path, cookies) {
	const headers = new Headers({ Location: path });
	for (const cookie of cookies) headers.append("Set-Cookie", cookie);
	return new Response(null, {
		status: 302,
		headers
	});
}
var Route$3 = createFileRoute("/api/sso/consume")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const code = url.searchParams.get("code")?.trim() ?? "";
	const next = safeNext(url.searchParams.get("next") || readNextFromCookie(request));
	const path = safeRedirectPath(next, request);
	if (!code) return errorPage("Missing code from the hub.");
	if (await readSsoUser(request)) return redirectHome(path, [clearNextCookie(request)]);
	try {
		const user = await exchangeSsoCode(code);
		return redirectHome(path, [await mintSsoCookie(user, request), clearNextCookie(request)]);
	} catch (error) {
		return errorPage(error instanceof Error ? error.message : "Hub exchange failed.");
	}
} } } });
var Route$2 = createFileRoute("/api/sso/login")({ server: { handlers: { GET: ({ request }) => {
	const url = new URL(request.url);
	const next = safeNext(url.searchParams.get("next"));
	const { location, nextCookie } = loginLocation(request, next);
	return new Response(null, {
		status: 302,
		headers: {
			Location: location,
			"Set-Cookie": nextCookie
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
var IndexRoute = Route$14.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$15
});
var AboutRoute = Route$13.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => Route$15
});
var DeskRoute = Route$12.update({
	id: "/desk",
	path: "/desk",
	getParentRoute: () => Route$15
});
var LibraryRoute = Route$11.update({
	id: "/library",
	path: "/library",
	getParentRoute: () => Route$15
});
var LoginRoute = Route$10.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$15
});
var LogoutRoute = Route$9.update({
	id: "/logout",
	path: "/logout",
	getParentRoute: () => Route$15
});
var ChannelSlugRoute = Route$8.update({
	id: "/channel/$slug",
	path: "/channel/$slug",
	getParentRoute: () => Route$15
});
var PlayerIndexRoute = Route$7.update({
	id: "/player/",
	path: "/player/",
	getParentRoute: () => Route$15
});
var rootRouteChildren = {
	IndexRoute,
	AboutRoute,
	DeskRoute,
	LibraryRoute,
	LoginRoute,
	LogoutRoute,
	ChannelSlugRoute,
	PlayerIdRoute: Route$6.update({
		id: "/player/$id",
		path: "/player/$id",
		getParentRoute: () => Route$15
	}),
	PlayerIndexRoute,
	ApiAuthSplatRoute: Route$5.update({
		id: "/api/auth/$",
		path: "/api/auth/$",
		getParentRoute: () => Route$15
	}),
	ApiDeskUploadRoute: Route$4.update({
		id: "/api/desk/upload",
		path: "/api/desk/upload",
		getParentRoute: () => Route$15
	}),
	ApiSsoConsumeRoute: Route$3.update({
		id: "/api/sso/consume",
		path: "/api/sso/consume",
		getParentRoute: () => Route$15
	}),
	ApiSsoLoginRoute: Route$2.update({
		id: "/api/sso/login",
		path: "/api/sso/login",
		getParentRoute: () => Route$15
	}),
	ApiSsoLogoutRoute: Route$1.update({
		id: "/api/sso/logout",
		path: "/api/sso/logout",
		getParentRoute: () => Route$15
	}),
	ApiSsoMeRoute: Route.update({
		id: "/api/sso/me",
		path: "/api/sso/me",
		getParentRoute: () => Route$15
	})
};
var routeTree = Route$15._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { pingServices as _, useRadioUser as a, saveStation as b, addStationTrack as c, desk_api_exports as d, getRadioSession as f, patchStationTrack as g, moveR2Object as h, ssoLoginHref as i, deleteR2Object as l, listStationR2 as m, Route$6 as n, TrackActions as o, hideStationTrack as p, Route$8 as r, CoverArt as s, router_exports as t, deleteStationFile as u, reorderStationTracks as v, restoreStationTrack as y };
