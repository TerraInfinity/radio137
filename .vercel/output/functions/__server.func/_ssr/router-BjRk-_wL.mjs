import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { i as isLoopingVisual, l as visualSrc, n as MEDIA_MAX_IMAGE_PICK, o as mediaUrl, r as MEDIA_MAX_VIDEO, t as ART_ACCEPT } from "./media-ChlF6fRc.mjs";
import { r as formatClock, t as cn } from "./cn-BnEf6O0M.mjs";
import { c as songKey, l as songPath, o as isReservedPublicPath, r as findSongByAlias } from "./song-url-BbYrVN1D.mjs";
import { C as stationSkin, S as shuffleLabel, a as getSeedCatalog, b as shuffleActive, c as getStationByAlias, f as kindLabel, h as normalizeShuffle, i as getPlayableTracks, l as isAdultTrack, m as normalizeKind, n as getCatalog, o as getSong, r as getChannel, s as getSongByAlias, u as isChannelNsfw, x as shuffleHint, y as setLiveCatalog } from "./catalog-DmckmNNR.mjs";
import { C as require_jsx_runtime, S as useRouter, V as redirect, W as require_react, _ as createFileRoute, d as HeadContent, f as useRouterState, g as lazyRouteComponent, h as Outlet, m as createRouter, u as Scripts, v as createRootRoute, x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as forgetCachedAudio, f as isLandingLocation, g as listenModeLabel, h as listenModeHint, l as getExperience, n as cacheUsage, p as isOnDemandOverlay, r as clearCachedAudio, t as audioCacheGeneration, u as hasCachedAudio, v as subscribeAudioCache, y as usePlayerStore } from "./player-store-CdB40IHB.mjs";
import { n as createMiddleware, r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, M as literal, P as number, R as string, k as array, z as union } from "../_libs/@better-auth/core+[...].mjs";
import { i as hasGateSessionMarker, t as auth } from "./server-BP3SiiSg.mjs";
import { t as assertSameSiteRequest } from "./isolation.server-B5IRAOYQ.mjs";
import { i as fileLocationLabel } from "./file-path-C0hfvhIH.mjs";
import { a as listStationEdits, c as upsertStation, i as listEdits, o as patchTrack, t as addTrack } from "./catalog-edits.server-KLXNzPRk.mjs";
import { t as applyCatalogEdits } from "./catalog-edits-B7ACZ19x.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { s as isGlaumDesk, t as GLAUM_DEFAULT_WORDS } from "./glaum-words-DJcoXeXq.mjs";
import { a as sanitizeUploadName, n as putR2Object, r as r2Configured, t as defaultPrefixForSlug } from "./r2.server-BMj6CRvu.mjs";
import { _ as isAdminEmail, a as logoutLocation, c as readNextFromCookie, d as resolveRadioUser, f as safeRedirectPath, g as safeNext, h as isRelativeNext, i as loginLocation, l as readSsoUser, m as consumeHandoffHref, n as clearSsoCookie, o as mintSsoCookie, r as exchangeSsoCode, s as r2Configured$1, t as clearNextCookie, u as requireAdmin } from "./sso.server-NSJ3vLzw.mjs";
import { t as authClient } from "./client-nKCa1E1y.mjs";
import { o as listCutCopies, t as autoCanonicalMap } from "./cuts-DHoBzPwa.mjs";
import { A as ImagePlus, E as Menu, H as Camera, M as HardDrive, R as ChevronUp, S as Pause, V as ChevronDown, _ as Radio, c as Star, d as SkipBack, f as Shuffle, h as Search, i as Volume1, j as Heart, n as VolumeX, o as TriangleAlert, p as Share2, r as Volume2, t as X, u as SkipForward, x as Pencil, y as Play } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desk-api-JX-7khci.js
var desk_api_exports = /* @__PURE__ */ __exportAll({
	addStationTrack: () => addStationTrack,
	completeDeskUpload: () => completeDeskUpload,
	deleteR2Object: () => deleteR2Object,
	deleteStationFile: () => deleteStationFile,
	dismissReviewItemFn: () => dismissReviewItemFn,
	dissolveStationCut: () => dissolveStationCut,
	getRadioSession: () => getRadioSession,
	hideStationTrack: () => hideStationTrack,
	hideStationTracks: () => hideStationTracks,
	importR2Tracks: () => importR2Tracks,
	listCatalogEdits: () => listCatalogEdits,
	listCutGroups: () => listCutGroups,
	listCutSkips: () => listCutSkips,
	listReviewQueue: () => listReviewQueue,
	listStationR2: () => listStationR2,
	mergeStationCutClusters: () => mergeStationCutClusters,
	mergeStationCuts: () => mergeStationCuts,
	mintDeskUpload: () => mintDeskUpload,
	moveR2Object: () => moveR2Object,
	patchStationTrack: () => patchStationTrack,
	pingServices: () => pingServices,
	placeStationTrack: () => placeStationTrack,
	rehomeReviewItemFn: () => rehomeReviewItemFn,
	renameStationFile: () => renameStationFile,
	reorderStationTracks: () => reorderStationTracks,
	restoreReviewItemFn: () => restoreReviewItemFn,
	restoreStationTrack: () => restoreStationTrack,
	saveStation: () => saveStation,
	setFeaturedRail: () => setFeaturedRail,
	skipSimilarCuts: () => skipSimilarCuts,
	unallocateStationTrack: () => unallocateStationTrack,
	unmergeStationCut: () => unmergeStationCut
});
var radioSessionMiddleware$1 = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-nKCa1E1y.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { resolveRadioUser, r2Configured, envLamps } = await import("./sso.server-NSJ3vLzw.mjs").then((n) => n.p);
	return next({ context: {
		user: await resolveRadioUser(context.bearerToken),
		r2Configured: r2Configured(),
		lamps: envLamps()
	} });
});
var adminMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-nKCa1E1y.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-B5IRAOYQ.mjs").then((n) => n.n);
	const { requireAdmin, r2Configured, envLamps } = await import("./sso.server-NSJ3vLzw.mjs").then((n) => n.p);
	assertSameSiteRequest();
	return next({ context: {
		user: await requireAdmin(context.bearerToken),
		r2Configured: r2Configured(),
		lamps: envLamps()
	} });
});
var getRadioSession = createServerFn({ method: "GET" }).middleware([radioSessionMiddleware$1]).handler(createSsrRpc("d9e89e6e17ea4381b3ec922098d3fcb3e864b4b3b07789c439e701ed259ef683"));
var listCatalogEdits = createServerFn({ method: "GET" }).handler(createSsrRpc("ce752a9c60416a0748de8ae86a006017f54ced857f2581ba1a9f7cfcce8bb3a9"));
var trackRef = object({
	channelSlug: string().min(1),
	trackId: string().min(1),
	audioUrl: string().optional()
});
var hideStationTrack = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => trackRef.parse(input)).handler(createSsrRpc("a0f574ca851bffce43b4e3ba655b29babab6d5b0703b3873a41409a03e7b9a6a"));
var hideStationTracks = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	channelSlug: string().min(1),
	tracks: array(trackRef.extend({ audioUrl: string().optional() })).min(1).max(80)
}).parse(input)).handler(createSsrRpc("f2dace1869b4b93bdcb91d67211a80767c66904df25ea5f8e992e05d96283a2a"));
var unallocateStationTrack = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => trackRef.extend({
	title: string().optional(),
	artist: string().optional(),
	coverUrl: string().optional()
}).parse(input)).handler(createSsrRpc("90fd962caebe299f7527d82a153d8a20a3717fbdcf226f5c3a6f12c720d8f4fd"));
var listReviewQueue = createServerFn({ method: "GET" }).middleware([adminMiddleware]).handler(createSsrRpc("6394d77b68adc7de38f7d5b92074423b52e5b7be42a911ba3de73f04918268ac"));
var restoreReviewItemFn = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({ id: number().int().positive() }).parse(input)).handler(createSsrRpc("595cc028164bced834212e5cbe6c60a901bce2ed87db2abd1ed37525bb3f50e3"));
var dismissReviewItemFn = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	id: number().int().positive(),
	status: _enum([
		"dismissed",
		"merged",
		"rehomed"
	]).optional()
}).parse(input)).handler(createSsrRpc("2adf9a5e205af9c1d15d19e63fe2f106c7f5a6330edf5fc760537317911ed9b7"));
var rehomeReviewItemFn = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	id: number().int().positive(),
	toSlug: string().min(1),
	mode: _enum(["copy", "move"]).optional()
}).parse(input)).handler(createSsrRpc("789391bd697359317c296e3f37247ff55aa67af199a6b74ba94c7d4f8decd163"));
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
	coverUrl: string().optional(),
	durationSec: number().optional(),
	tags: string().optional(),
	slug: string().optional(),
	aliases: string().optional()
}).parse(input)).handler(createSsrRpc("da98c26cacb974e0e1405aa77e85814e3a2aec5b3a4e0b9e2e42c4119a20f587"));
var renameStationFile = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	channelSlug: string().min(1),
	trackId: string().min(1),
	toKey: string().min(1)
}).parse(input)).handler(createSsrRpc("800fe0eb6f64b76196232f5cc031243f8f0f09e2cdca82e2c8251647814fe247"));
var reorderStationTracks = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	channelSlug: string().min(1),
	trackIds: array(string().min(1)).min(1)
}).parse(input)).handler(createSsrRpc("86faca5244608013bd67686cf60e5d0459a82e02de3fa9da95267f70f32d0bd4"));
var placeStationTrack = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	fromSlug: string().min(1),
	trackId: string().min(1),
	toSlug: string().min(1),
	mode: _enum(["copy", "move"])
}).parse(input)).handler(createSsrRpc("d2882a2b429e6c16019d84a0522a03cc982ad7b92d32eff9362b05d04d93cd1e"));
var setFeaturedRail = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({ slugs: array(string()) }).parse(input)).handler(createSsrRpc("144c9e43196ca6bf0a596c59ad5c3095bc07d2aa8f85cd097d593121f0a2ec34"));
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
	animationUrl: string().optional(),
	videoUrl: string().optional(),
	kind: _enum([
		"live",
		"ondemand",
		"fixed"
	]).optional(),
	featured: boolean().optional(),
	featuredRank: number().optional(),
	enabled: boolean().optional(),
	nsfw: boolean().optional(),
	tags: string().optional(),
	shuffle: _enum([
		"off",
		"optional",
		"on"
	]).optional(),
	claimable: boolean().optional(),
	publicSlug: string().optional(),
	aliases: string().optional()
}).parse(input)).handler(createSsrRpc("cc74c64dc2667ff889d7baf82b14c6704c54a443ca298f5c60de9cf63700e054"));
var listStationR2 = createServerFn({ method: "GET" }).middleware([adminMiddleware]).validator((input) => object({
	prefix: string().optional(),
	slug: string().optional(),
	maxKeys: number().int().positive().optional()
}).parse(input)).handler(createSsrRpc("df9d243e1b860c4496bba86a34cad4e87c50b6b7b199b0acf683fa5bc37e5c1f"));
var importR2Tracks = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	channelSlugs: array(string().min(1)).min(1),
	items: array(object({
		key: string().min(1),
		url: string().min(8),
		title: string().optional(),
		durationSec: number().optional()
	})).min(1)
}).parse(input)).handler(createSsrRpc("92be32e04773b72416ff5451aa424abf58edefa82028323d6a5f1d02f061a0bb"));
var moveR2Object = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	from: string().min(1),
	to: string().min(1)
}).parse(input)).handler(createSsrRpc("6419abad04b105db7e36894252b6619b53542483e9295a713c9ad8fd0458c6d0"));
var deleteR2Object = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({ key: string().min(1) }).parse(input)).handler(createSsrRpc("b9c9fe0cca0befd3ae8bedbf69fee8d4a08b690b7d33de85aa2f47a155c3c7f0"));
var listCutGroups = createServerFn({ method: "GET" }).handler(createSsrRpc("82a76a214c21f04ee0c704c6bf2329e4b5b8a9152b58b7d4ab524b5d1dc64843"));
var mergeStationCuts = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	canonicalId: string().min(1),
	memberIds: array(string().min(1)).min(1)
}).parse(input)).handler(createSsrRpc("d86c18414a468e5882fe82b035766d562e4179ae03a7965f0b06cb986a1cec7a"));
var mergeStationCutClusters = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({ clusters: array(object({
	canonicalId: string().min(1),
	memberIds: array(string().min(1)).min(1)
})).min(1) }).parse(input)).handler(createSsrRpc("4312dafe79054c46e754cd9b8607c11bb2607d5c3a3f8a59ff3aa0a9123febe4"));
var unmergeStationCut = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({ memberId: string().min(1) }).parse(input)).handler(createSsrRpc("7e0e63ee3f7f7eca955516fee0d48f5605e9338c3859b4a9d175aeb5f96c54bd"));
var dissolveStationCut = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({ canonicalId: string().min(1) }).parse(input)).handler(createSsrRpc("ef8d1ed7626b299fba3a7d71b3c1354edca25d308009b62e5bdb0ce70327bb2d"));
var listCutSkips = createServerFn({ method: "GET" }).middleware([adminMiddleware]).handler(createSsrRpc("f9a90fefbce8c7877d112d09bb33465d0ac179e6127dd5c0e438fa0d59f78fd6"));
var skipSimilarCuts = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({ memberIds: array(string().min(1)).min(2) }).parse(input)).handler(createSsrRpc("1c7e2a4bf243ecec1748ddd3254f51bf34a1be3c8c0aaded4b4d41b322685c35"));
var pingServices = createServerFn({ method: "GET" }).middleware([adminMiddleware]).handler(createSsrRpc("ad177eb156e0e962cf763c344be8866b84009abc7a6c31f2269e1048d8e105ad"));
var mintDeskUpload = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	kind: _enum(["audio", "art"]),
	slug: string().min(1),
	filename: string().min(1),
	contentType: string().optional(),
	size: number().int().nonnegative().optional(),
	trackId: string().optional()
}).parse(input)).handler(createSsrRpc("be4f0c5d004d01180e478be884f3b7aa2de4cdbc95ddf46f1ff3a37c72cbe9c1"));
var completeDeskUpload = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	kind: _enum(["audio", "art"]),
	slug: string().min(1),
	key: string().min(1),
	title: string().optional(),
	coverUrl: string().optional(),
	trackId: string().optional(),
	contentType: string().optional(),
	durationSec: number().optional()
}).parse(input)).handler(createSsrRpc("1f9b8aaec0e2a3610687481c510ceeb3159aa9d36fbbc8714870d1ad5c4128a6"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/live-catalog-CbEK6DhS.js
var live_catalog_exports = /* @__PURE__ */ __exportAll({ ensureLiveCatalog: () => ensureLiveCatalog });
var livePromise = null;
/** Pull desk edits so alias / slug lookups see the same catalog both hosts share. */
function ensureLiveCatalog() {
	livePromise ??= (async () => {
		const { listCatalogEdits } = await import("../_libs/_.mjs").then((n) => n.a);
		const data = await listCatalogEdits();
		setLiveCatalog(applyCatalogEdits(getSeedCatalog(), data.tracks, data.stations));
	})().catch((err) => {
		livePromise = null;
		throw err;
	});
	return livePromise;
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/radio-user-BLy_gvYe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
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
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/search-CqHByik2.js
function foldText(value) {
	return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function searchTokens(query) {
	return foldText(query).split(/\s+/).filter((token) => token.length > 0);
}
function hay(...parts) {
	return foldText(parts.flatMap((part) => Array.isArray(part) ? part : part ? [part] : []).join(" "));
}
function scoreField(field, tokens, weight) {
	const text = foldText(field);
	if (!text) return 0;
	let score = 0;
	for (const token of tokens) if (text === token) score += weight * 4;
	else if (text.startsWith(token)) score += weight * 2;
	else if (` ${text} `.includes(` ${token} `) || text.includes(token)) score += weight;
	return score;
}
function allTokensIn(haystack, tokens) {
	return tokens.every((token) => haystack.includes(token));
}
function searchStations(catalog, query, includeNsfw = false) {
	const tokens = searchTokens(query);
	if (tokens.length === 0) return [];
	const hits = [];
	for (const channel of catalog.channels) {
		if (!channel.enabled) continue;
		if (!includeNsfw && isChannelNsfw(channel)) continue;
		if (!allTokensIn(hay(channel.name, channel.slug, channel.energy, channel.category, channel.description, channel.tags, channel.kind, channel.mode), tokens)) continue;
		const score = scoreField(channel.name, tokens, 12) + scoreField(channel.slug, tokens, 8) + scoreField((channel.tags ?? []).join(" "), tokens, 7) + scoreField(channel.category, tokens, 5) + scoreField(channel.energy, tokens, 4) + scoreField(channel.description, tokens, 2);
		hits.push({
			channel,
			score
		});
	}
	return hits.sort((a, b) => b.score - a.score || a.channel.name.localeCompare(b.channel.name)).slice(0, 24);
}
function searchSongs(catalog, query, includeNsfw = false, groups = []) {
	const tokens = searchTokens(query);
	if (tokens.length === 0) return [];
	const copies = listCutCopies(catalog, includeNsfw);
	const canonical = autoCanonicalMap(copies, groups);
	const copyCount = /* @__PURE__ */ new Map();
	for (const copy of copies) {
		const id = canonical.get(copy.track.id) ?? copy.track.id;
		copyCount.set(id, (copyCount.get(id) ?? 0) + 1);
	}
	const hits = [];
	const seen = /* @__PURE__ */ new Set();
	for (const channel of catalog.channels) {
		if (!channel.enabled) continue;
		if (!includeNsfw && isChannelNsfw(channel)) continue;
		for (const track of getPlayableTracks(channel)) {
			if (!includeNsfw && isAdultTrack(track) && !isChannelNsfw(channel)) continue;
			const file = fileLocationLabel(track.audioUrl);
			if (!allTokensIn(hay(track.title, track.artist, track.id, track.slug, track.aliases, track.tags, file, channel.name, channel.slug, channel.tags), tokens)) continue;
			const keepId = canonical.get(track.id) ?? track.id;
			if (seen.has(keepId)) continue;
			seen.add(keepId);
			const keep = copies.find((item) => item.track.id === keepId) ?? {
				track,
				channel
			};
			const score = scoreField(keep.track.title, tokens, 14) + scoreField(keep.track.artist, tokens, 9) + scoreField((keep.track.tags ?? []).join(" "), tokens, 8) + scoreField(keep.track.id, tokens, 6) + scoreField(keep.track.slug ?? "", tokens, 8) + scoreField((keep.track.aliases ?? []).join(" "), tokens, 7) + scoreField(file, tokens, 6) + scoreField(keep.channel.name, tokens, 3);
			hits.push({
				track: keep.track,
				channel: keep.channel,
				score,
				copies: copyCount.get(keepId) ?? 1
			});
		}
	}
	return hits.sort((a, b) => b.score - a.score || a.track.title.localeCompare(b.track.title)).slice(0, 60);
}
function searchDial(catalog, query, includeNsfw = false, groups = []) {
	return {
		stations: searchStations(catalog, query, includeNsfw),
		songs: searchSongs(catalog, query, includeNsfw, groups)
	};
}
function qSearch(search) {
	return { q: typeof search.q === "string" && search.q.trim() ? search.q : void 0 };
}
function downloadName(track) {
	return `${(track.title || "song").replace(/[<>:"/\\|?*]+/g, "").trim() || "song"}.${track.audioUrl.match(/\.([a-z0-9]{2,5})(?:\?|#|$)/i)?.[1]?.toLowerCase() || "mp3"}`;
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-BjRk-_wL.js
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
function rng(seed) {
	let a = seed >>> 0;
	return () => {
		a = a + 1831565813 >>> 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function polar(cx, cy, r, deg) {
	const rad = (deg - 90) * Math.PI / 180;
	return {
		x: cx + Math.cos(rad) * r,
		y: cy + Math.sin(rad) * r
	};
}
function arcPath(cx, cy, r, start, sweep) {
	const a = polar(cx, cy, r, start);
	const b = polar(cx, cy, r, start + sweep);
	const large = Math.abs(sweep) > 180 ? 1 : 0;
	const sweepFlag = sweep >= 0 ? 1 : 0;
	return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${large} ${sweepFlag} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}
function gearPath(teeth, outer = 94, inner = 78, hole = 16) {
	const step = Math.PI * 2 / teeth;
	const tooth = step * .3;
	const pts = [];
	for (let i = 0; i < teeth; i++) {
		const a = i * step - Math.PI / 2;
		const corners = [
			[inner, a - tooth],
			[outer, a - tooth * .36],
			[outer, a + tooth * .36],
			[inner, a + tooth]
		];
		for (const [r, ang] of corners) {
			const x = (100 + Math.cos(ang) * r).toFixed(2);
			const y = (100 + Math.sin(ang) * r).toFixed(2);
			pts.push(`${pts.length === 0 ? "M" : "L"}${x} ${y}`);
		}
	}
	const holePts = [];
	for (let i = 0; i <= 28; i++) {
		const ang = i / 28 * Math.PI * 2 + Math.PI / 2;
		holePts.push(`${(100 + Math.cos(ang) * hole).toFixed(2)} ${(100 + Math.sin(ang) * hole).toFixed(2)}`);
	}
	return `${pts.join(" ")} Z M ${holePts.join(" L ")} Z`;
}
function Gear({ teeth, spokes = 6, className, brass = true }) {
	const stroke = brass ? "var(--color-gold)" : "var(--color-cyan)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 200 200",
		className,
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: gearPath(teeth),
				fill: brass ? "#c9a36a14" : "#6ec8d412",
				fillRule: "evenodd",
				stroke,
				strokeOpacity: "0.42",
				strokeWidth: "1.4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "100",
				r: "54",
				fill: "none",
				stroke,
				strokeOpacity: "0.22",
				strokeWidth: "6"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "100",
				r: "38",
				fill: "none",
				stroke,
				strokeOpacity: "0.3",
				strokeWidth: "1.2"
			}),
			Array.from({ length: spokes }, (_, i) => {
				const a = polar(100, 100, 16, i * 360 / spokes);
				const b = polar(100, 100, 54, i * 360 / spokes);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: a.x,
					y1: a.y,
					x2: b.x,
					y2: b.y,
					stroke,
					strokeOpacity: "0.28",
					strokeWidth: "1.4"
				}, i);
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "100",
				r: "10",
				fill: brass ? "#c9a36a33" : "#6ec8d429",
				stroke,
				strokeOpacity: "0.55",
				strokeWidth: "1.2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "100",
				r: "3.2",
				fill: stroke,
				fillOpacity: "0.7"
			})
		]
	});
}
function GallifreyDisc({ seed, accent = "cyan" }) {
	const rand = rng(seed);
	const color = accent === "gold" ? "var(--color-gold)" : accent === "ember" ? "var(--color-ember)" : "var(--color-cyan)";
	const brass = "var(--color-gold)";
	const letters = Array.from({ length: 7 + Math.floor(rand() * 4) }, (_, i) => {
		const ang = i * 360 / 10 + rand() * 28;
		const r = 78 + rand() * 8;
		const size = 7 + rand() * 11;
		return {
			ang,
			r: rand() > .35 ? 86 : r,
			size,
			dots: 1 + Math.floor(rand() * 3),
			stem: rand() > .4,
			nest: rand() > .7
		};
	});
	const innerArcs = Array.from({ length: 8 }, () => ({
		r: 28 + rand() * 46,
		start: rand() * 360,
		sweep: 28 + rand() * 92,
		width: 1 + rand() * 2.2
	}));
	const chords = Array.from({ length: 5 }, () => {
		const a = rand() * 360;
		return {
			a,
			b: a + 40 + rand() * 110,
			r: 34 + rand() * 40
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 200 200",
		className: "gallifrey-disc",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "100",
				r: "96",
				fill: "none",
				stroke: brass,
				strokeOpacity: "0.2",
				strokeWidth: "1.1",
				strokeDasharray: "18 7 4 9"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "100",
				r: "88",
				fill: "#6ec8d408",
				stroke: color,
				strokeOpacity: "0.55",
				strokeWidth: "2.2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "100",
				r: "88",
				fill: "none",
				stroke: brass,
				strokeOpacity: "0.18",
				strokeWidth: "6"
			}),
			innerArcs.map((arc, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: arcPath(100, 100, arc.r, arc.start, arc.sweep),
				fill: "none",
				stroke: i % 3 === 0 ? brass : color,
				strokeOpacity: .28 + i % 4 * .08,
				strokeWidth: arc.width,
				strokeLinecap: "round"
			}, `arc-${i}`)),
			chords.map((c, i) => {
				const p = polar(100, 100, c.r, c.a);
				const q = polar(100, 100, c.r, c.b);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: p.x,
					y1: p.y,
					x2: q.x,
					y2: q.y,
					stroke: color,
					strokeOpacity: "0.22",
					strokeWidth: "0.8"
				}, `ch-${i}`);
			}),
			letters.map((letter, i) => {
				const p = polar(100, 100, letter.r, letter.ang);
				const outer = polar(100, 100, 96, letter.ang);
				const inner = polar(100, 100, 18 + i % 3 * 8, letter.ang + 8);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: p.x,
						cy: p.y,
						r: letter.size,
						fill: "#070605cc",
						stroke: i % 2 ? color : brass,
						strokeOpacity: "0.7",
						strokeWidth: "1.3"
					}),
					letter.nest ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: p.x,
						cy: p.y,
						r: letter.size * .45,
						fill: "none",
						stroke: brass,
						strokeOpacity: "0.55",
						strokeWidth: "1"
					}) : null,
					Array.from({ length: letter.dots }, (_, d) => {
						const dp = polar(p.x, p.y, letter.size * .62, letter.ang + d * 50);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: dp.x,
							cy: dp.y,
							r: 1.1 + d % 2 * .5,
							fill: d % 2 ? color : brass,
							fillOpacity: "0.85"
						}, d);
					}),
					letter.stem ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: outer.x,
						y1: outer.y,
						x2: inner.x,
						y2: inner.y,
						stroke: i % 2 ? color : brass,
						strokeOpacity: "0.4",
						strokeWidth: "1"
					}) : null
				] }, `let-${i}`);
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "100",
				r: "22",
				fill: "none",
				stroke: color,
				strokeOpacity: "0.45",
				strokeWidth: "1.4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "100",
				r: "14",
				fill: "none",
				stroke: brass,
				strokeOpacity: "0.4",
				strokeWidth: "1",
				strokeDasharray: "3 5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "100",
				cy: "100",
				r: "4",
				fill: color,
				fillOpacity: "0.55"
			})
		]
	});
}
var STARS = (() => {
	const rand = rng(137);
	return Array.from({ length: 72 }, (_, i) => ({
		x: rand() * 1600,
		y: rand() * 900,
		r: i % 11 === 0 ? 2.4 : i % 5 === 0 ? 1.5 : .7 + rand() * .7,
		delay: rand() * 6,
		dur: 3.2 + rand() * 4.8,
		tone: i % 7 === 0 ? "gold" : i % 5 === 0 ? "cyan" : "paper"
	}));
})();
var MOTES = (() => {
	const rand = rng(42);
	return Array.from({ length: 18 }, () => ({
		x: rand() * 100,
		y: rand() * 100,
		s: 2 + rand() * 4,
		delay: rand() * 10,
		dur: 14 + rand() * 16,
		tone: rand() > .55 ? "gold" : rand() > .4 ? "cyan" : "ember"
	}));
})();
function Atmosphere({ skin = "none" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none fixed inset-0 z-0 overflow-hidden",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-void" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
				className: "star-field",
				viewBox: "0 0 1600 900",
				preserveAspectRatio: "xMidYMid slice",
				children: STARS.map((star, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					className: "cw-star",
					cx: star.x,
					cy: star.y,
					r: star.r,
					fill: star.tone === "gold" ? "var(--color-gold)" : star.tone === "cyan" ? "var(--color-cyan)" : "var(--color-fg)",
					style: {
						animationDelay: `${star.delay}s`,
						animationDuration: `${star.dur}s`
					}
				}, i))
			}),
			MOTES.map((mote, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `cw-mote cw-mote-${mote.tone}`,
				style: {
					left: `${mote.x}%`,
					top: `${mote.y}%`,
					width: mote.s,
					height: mote.s,
					animationDelay: `${mote.delay}s`,
					animationDuration: `${mote.dur}s`
				}
			}, i)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "atmosphere-clockwork",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "cw-place cw-place-a cw-wobble",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "cw-spin-slow",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GallifreyDisc, {
								seed: 7,
								accent: "cyan"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "cw-rotor cw-spin-hand",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "cw-place cw-place-b cw-wobble-rev",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "cw-spin-rev",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GallifreyDisc, {
								seed: 19,
								accent: "gold"
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "cw-place cw-place-c",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "cw-spin",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GallifreyDisc, {
								seed: 31,
								accent: "ember"
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gear, {
						teeth: 18,
						className: "cw-gear cw-gear-a cw-spin"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gear, {
						teeth: 14,
						className: "cw-gear cw-gear-b cw-spin-rev",
						brass: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gear, {
						teeth: 10,
						spokes: 4,
						className: "cw-gear cw-gear-c cw-spin-fast"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gear, {
						teeth: 8,
						spokes: 4,
						className: "cw-gear cw-gear-d cw-spin-rev",
						brass: false
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-sand" }),
			skin === "glaum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-glaum" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-glaum-spark" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-glaum-shrimp" })
			] }) : null,
			skin === "waheguru" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-wahe" }) : null,
			skin === "rose" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-rose" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-rose-dust" })] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-vignette" })
		]
	});
}
function AutoplayLamp({ label = "Auto", compact = false }) {
	const autoplay = usePlayerStore((s) => s.autoplay);
	const setAutoplay = usePlayerStore((s) => s.setAutoplay);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => setAutoplay(!autoplay),
		"aria-pressed": autoplay,
		title: autoplay ? "Auto on — start with the station, and keep going" : "Auto off — stay paused on load, stop when this song ends",
		className: "inline-flex h-11 shrink-0 items-center gap-2 px-1.5 font-mono text-[11px] uppercase tracking-[0.14em] sm:px-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "lamp-bezel",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("lamp", autoplay && "lamp-live") })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn(compact ? "hidden sm:inline" : "", autoplay ? "lamp-on" : "text-subtle"),
			children: label
		})]
	});
}
function ListenModeLamp({ compact = false, bare = false }) {
	const listenMode = usePlayerStore((s) => s.listenModeSession ?? s.listenMode);
	const setListenMode = usePlayerStore((s) => s.setListenMode);
	const next = listenMode === "stream" ? "ondemand" : "stream";
	const streaming = listenMode === "stream";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => setListenMode(next),
		"aria-pressed": streaming,
		"aria-label": listenModeLabel(listenMode),
		title: listenModeHint(listenMode),
		className: "inline-flex h-11 shrink-0 items-center gap-2 px-1.5 font-mono text-[11px] uppercase tracking-[0.14em] sm:px-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "lamp-bezel",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("lamp", streaming && "lamp-live") })
		}), bare ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn(streaming ? "lamp-on" : "text-subtle"),
			children: compact ? streaming ? "Stream" : "Demand" : listenModeLabel(listenMode)
		})]
	});
}
function EnterGate() {
	const enterGate = usePlayerStore((s) => s.enterGate);
	const listenMode = usePlayerStore((s) => s.listenModeSession ?? s.listenMode);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 grid place-items-center bg-bg/95 px-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "filigree-frame w-full max-w-md rounded-xl bg-bg-elevated/80 px-6 py-8 shadow-[var(--shadow-filigree)]",
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
					className: "mt-4 text-pretty text-muted",
					children: "Tune in to open the default station. Shared station and song links skip this page and start on their own."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-7 flex flex-wrap items-center justify-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListenModeLamp, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutoplayLamp, { label: "Keep playing" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-center text-sm text-muted",
					children: listenModeHint(listenMode)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-7",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => enterGate(),
						className: "inline-flex h-12 w-full items-center justify-center rounded-md bg-fg px-6 font-mono text-[12px] uppercase tracking-[0.16em] text-bg",
						children: "Tune in"
					})
				})
			]
		})
	});
}
var radioSessionMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-nKCa1E1y.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { resolveRadioUser } = await import("./sso.server-NSJ3vLzw.mjs").then((n) => n.p);
	return next({ context: { user: await resolveRadioUser(context.bearerToken) } });
});
var listGlaumWords = createServerFn({ method: "GET" }).handler(createSsrRpc("26893775ee356fdf5d12240d58a031a5dec729df95aa4ce90905470656552d1a"));
var addGuestGlaumWordFn = createServerFn({ method: "POST" }).middleware([radioSessionMiddleware]).validator((input) => object({ word: string().min(1).max(48) }).parse(input)).handler(createSsrRpc("76fc65498ac00f10a1e5229b52aa0c1267908ee9bdd34049ace69c68c0225c41"));
var addAdminGlaumWordFn = createServerFn({ method: "POST" }).middleware([radioSessionMiddleware]).validator((input) => object({ word: string().min(1).max(64) }).parse(input)).handler(createSsrRpc("aac5d28e1fc5864e8830505713c59008fee0591dd6fc1b3d59c3871d5dfc62f1"));
var hideGlaumWordFn = createServerFn({ method: "POST" }).middleware([radioSessionMiddleware]).validator((input) => object({
	id: number().int().positive().optional(),
	word: string().optional()
}).parse(input)).handler(createSsrRpc("d996ff8bdab3183a7d117e9ee91b5c2b479c7298eba46fb4195eef1a1de2cc4d"));
var seq = 1;
function pick(pool) {
	return pool[Math.floor(Math.random() * pool.length)] || "glåüm";
}
function rand(min, max) {
	return min + Math.random() * (max - min);
}
function pickWeather(prev) {
	const roll = Math.random();
	if (prev === "storm") return roll < .74 ? "hush" : "trickle";
	if (prev === "hush") {
		if (roll < .42) return "storm";
		if (roll < .82) return "trickle";
		return "hush";
	}
	if (roll < .26) return "storm";
	if (roll < .62) return "hush";
	return "trickle";
}
function weatherMs(kind, mobile) {
	if (kind === "storm") return mobile ? rand(1600, 4800) : rand(2200, 7200);
	if (kind === "trickle") return mobile ? rand(7e3, 16e3) : rand(9e3, 22e3);
	return mobile ? rand(18e3, 58e3) : rand(24e3, 9e4);
}
function spawnGap(kind, mobile) {
	if (kind === "storm") return mobile ? rand(200, 720) : rand(120, 520);
	if (kind === "trickle") return mobile ? rand(5500, 15e3) : rand(7e3, 2e4);
	return mobile ? rand(16e3, 52e3) : rand(22e3, 8e4);
}
function glaumFromPath(pathname) {
	if (pathname.startsWith("/channel/")) {
		const slug = pathname.slice(9).split("/")[0] || "";
		const channel = getChannel(slug);
		return Boolean(channel && stationSkin(channel) === "glaum");
	}
	const alias = pathname.replace(/^\/+/, "").split("/")[0] || "";
	if (!alias || alias === "player" || alias === "desk") return false;
	const station = getStationByAlias(alias);
	return Boolean(station && stationSkin(station) === "glaum") || isGlaumDesk(alias);
}
function musicPlaying() {
	return usePlayerStore.getState().status === "playing";
}
function LoveLayer() {
	const slug = usePlayerStore((s) => s.channelSlug);
	const status = usePlayerStore((s) => s.status);
	const collect = usePlayerStore((s) => s.collectGlaumule);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const channel = slug ? getChannel(slug) : void 0;
	const skin = channel ? stationSkin(channel) : "none";
	const glaumDesk = Boolean(channel && (channel.loveBubbles || channel.glaumules || skin === "glaum"));
	const pageGlaum = glaumFromPath(pathname);
	const onGlaum = glaumDesk || pageGlaum;
	const spawning = status === "playing" && onGlaum;
	const [orbs, setOrbs] = (0, import_react.useState)([]);
	const poolRef = (0, import_react.useRef)(GLAUM_DEFAULT_WORDS);
	const expireRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		let alive = true;
		const pull = () => {
			listGlaumWords().then((data) => {
				if (alive && data.pool.length) poolRef.current = data.pool;
			}).catch(() => {});
		};
		pull();
		const timer = window.setInterval(pull, 45e3);
		return () => {
			alive = false;
			window.clearInterval(timer);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		return () => {
			for (const id of expireRef.current) window.clearTimeout(id);
			expireRef.current.clear();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (spawning || orbs.length === 0) return;
		const id = window.setTimeout(() => setOrbs([]), 420);
		return () => window.clearTimeout(id);
	}, [spawning, orbs.length]);
	(0, import_react.useEffect)(() => {
		if (!spawning) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const mobile = window.matchMedia("(max-width: 640px)").matches;
		const maxOrbs = mobile ? 7 : 14;
		const timeouts = /* @__PURE__ */ new Set();
		const later = (fn, ms) => {
			const id = window.setTimeout(() => {
				timeouts.delete(id);
				fn();
			}, ms);
			timeouts.add(id);
			return id;
		};
		const spawn = (kind, label) => {
			if (!musicPlaying() || document.hidden) return;
			const id = seq++;
			const orb = {
				id,
				left: mobile ? 6 + Math.random() * 72 : 4 + Math.random() * 88,
				label: label || pick(poolRef.current),
				kind,
				drift: (Math.random() * 2 - 1) * (mobile ? 18 : 28),
				size: mobile ? 2.6 + Math.random() * 1.3 : 3.2 + Math.random() * 2.4,
				dur: kind === "pop" ? 1.8 : mobile ? 6 + Math.random() * 2.5 : 7.5 + Math.random() * 4
			};
			setOrbs((current) => [...current, orb].slice(-maxOrbs));
			const expire = window.setTimeout(() => {
				expireRef.current.delete(expire);
				setOrbs((current) => current.filter((item) => item.id !== id));
			}, orb.dur * 1e3);
			expireRef.current.add(expire);
		};
		let weather = Math.random() < .28 ? "storm" : Math.random() < .5 ? "trickle" : "hush";
		let until = Date.now() + weatherMs(weather, mobile);
		const tick = () => {
			if (!musicPlaying()) return;
			if (document.hidden) {
				later(tick, 900);
				return;
			}
			if (Date.now() >= until) {
				weather = pickWeather(weather);
				until = Date.now() + weatherMs(weather, mobile);
			}
			if (weather === "storm" || weather === "trickle" || Math.random() < .22) spawn("float");
			if (weather === "storm" && Math.random() < (mobile ? .28 : .48)) {
				later(() => spawn("float"), rand(70, 340));
				if (Math.random() < .32) later(() => spawn("float"), rand(180, 560));
			}
			later(tick, spawnGap(weather, mobile));
		};
		if (weather === "storm") {
			spawn("float", "glåüm");
			later(() => spawn("float"), rand(120, 380));
		}
		later(tick, weather === "hush" ? spawnGap("hush", mobile) : spawnGap(weather, mobile));
		const onLove = (event) => {
			if (!musicPlaying()) return;
			const detail = event.detail;
			spawn("pop", detail?.kind === "like" ? "♡" : "glåüm");
			if (Math.random() < .55) spawn("float", pick(poolRef.current));
		};
		window.addEventListener("radio-love", onLove);
		return () => {
			for (const id of timeouts) window.clearTimeout(id);
			timeouts.clear();
			window.removeEventListener("radio-love", onLove);
		};
	}, [spawning]);
	if (!onGlaum && orbs.length === 0) return null;
	if (!spawning && orbs.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: spawning ? "love-layer" : "love-layer love-layer-still",
		"aria-hidden": true,
		children: orbs.map((orb) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: orb.kind === "pop" ? "love-orb love-orb-pop love-orb-glaum" : "love-orb love-orb-glaum",
			style: {
				left: `${orb.left}%`,
				["--orb-drift"]: `${orb.drift}vw`,
				["--orb-size"]: `${orb.size}rem`,
				["--orb-dur"]: `${orb.dur}s`
			},
			onClick: () => {
				if (!musicPlaying()) return;
				collect(1);
				setOrbs((current) => current.filter((item) => item.id !== orb.id));
				window.dispatchEvent(new CustomEvent("radio-love", { detail: { kind: "collect" } }));
			},
			children: orb.label
		}, orb.id))
	});
}
function RenameCutForm({ slug, track, onClose, appearance = "row" }) {
	const [value, setValue] = (0, import_react.useState)(track.title);
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setValue(track.title);
	}, [track.id, track.title]);
	async function save() {
		const next = value.trim();
		if (!next || next === track.title) {
			onClose();
			return;
		}
		setBusy(true);
		try {
			const result = await patchStationTrack({ data: {
				channelSlug: slug,
				trackId: track.id,
				title: next
			} });
			usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
			onClose();
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Could not rename");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: cn("flex min-w-0 items-center gap-1", appearance === "title" ? "w-full" : "w-full basis-full pb-1"),
		onSubmit: (event) => {
			event.preventDefault();
			event.stopPropagation();
			save();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: cn("input h-11 min-w-0 flex-1", appearance === "title" && "font-display text-lg"),
				value,
				autoFocus: true,
				maxLength: 160,
				"aria-label": "Song title",
				onChange: (event) => setValue(event.target.value),
				onKeyDown: (event) => {
					if (event.key === "Escape") {
						event.preventDefault();
						setValue(track.title);
						onClose();
					}
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				disabled: busy,
				className: "inline-flex h-11 shrink-0 items-center rounded-md bg-fg px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-bg",
				children: busy ? "Saving…" : "Save"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => {
					setValue(track.title);
					onClose();
				},
				className: "inline-flex h-11 shrink-0 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
				children: "Cancel"
			})
		]
	});
}
function AdminRename({ slug, track, compact = false }) {
	const { isAdmin, isPending } = useRadioUser();
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setOpen(false);
	}, [track.id]);
	if (isPending || !isAdmin) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: (event) => {
			event.preventDefault();
			event.stopPropagation();
			setOpen((current) => !current);
		},
		"aria-expanded": open,
		"aria-label": "Rename",
		title: "Rename this song",
		className: "inline-flex h-11 shrink-0 items-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5" }), compact ? null : "Rename"]
	}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RenameCutForm, {
		slug,
		track,
		onClose: () => setOpen(false)
	}) : null] });
}
function CoverArt({ src, alt, className, motion = "still", poster }) {
	const resolved = mediaUrl(src);
	const posterSrc = mediaUrl(poster);
	const [failed, setFailed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setFailed(false);
	}, [resolved]);
	if (!resolved) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("bg-bg-elevated", className),
		"aria-hidden": true
	});
	if (isLoopingVisual(resolved) && !failed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
		src: resolved,
		poster: posterSrc && !isLoopingVisual(posterSrc) ? posterSrc : void 0,
		className: cn("h-full w-full object-cover", className),
		muted: true,
		loop: true,
		playsInline: true,
		autoPlay: true,
		preload: motion === "loop" ? "auto" : "metadata",
		"aria-label": alt || void 0,
		onError: () => setFailed(true)
	});
	const still = failed ? posterSrc : resolved;
	if (!still || isLoopingVisual(still)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("bg-bg-elevated", className),
		"aria-hidden": true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: still,
		alt,
		loading: "lazy",
		decoding: "async",
		className: cn("h-full w-full object-cover", className)
	});
}
/**
* One iOS-safe file input: the <input> IS the tap target (opacity overlay),
* never a hidden input clicked from JS. Combined accept lets Photos, the
* camera roll, Files, and the desktop chooser all flow through one control.
*/
function PhoneArtPicker({ disabled, onFile, label = "Choose file" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: cn("relative inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md px-3 font-mono text-[11px] uppercase tracking-[0.14em]", disabled ? "pointer-events-none opacity-50" : "bg-fg text-bg"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "file",
				accept: ART_ACCEPT,
				disabled,
				className: "absolute inset-0 cursor-pointer opacity-0",
				onChange: (event) => {
					const file = event.target.files?.[0];
					event.target.value = "";
					if (file) onFile(file);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
				className: "size-4",
				"aria-hidden": true
			}),
			label
		]
	});
}
var IMAGE_NAME = /\.(jpe?g|png|webp|gif|avif|heic|heif|heics)$/i;
var VIDEO_NAME = /\.(mp4|webm|mov|m4v)$/i;
var MAX_EDGE = 1600;
function classifyArt(file) {
	const type = (file.type || "").toLowerCase();
	const name = file.name || "";
	if (type.startsWith("video/") || VIDEO_NAME.test(name)) return "video";
	if (type.startsWith("image/") || IMAGE_NAME.test(name)) return "image";
	if (/^image/i.test(name) || type === "application/octet-stream" && IMAGE_NAME.test(name)) return "image";
	return null;
}
function stem(name) {
	return (name.split(/[/\\]/).pop() || "art").replace(/\.[^.]+$/, "").replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 80) || "art";
}
function videoExt(file) {
	const type = (file.type || "").toLowerCase();
	const name = file.name.toLowerCase();
	if (name.endsWith(".webm") || type.includes("webm")) return {
		ext: "webm",
		type: type || "video/webm"
	};
	if (name.endsWith(".mov") || type.includes("quicktime")) return {
		ext: "mov",
		type: type || "video/quicktime"
	};
	if (name.endsWith(".m4v") || type === "video/x-m4v") return {
		ext: "m4v",
		type: type || "video/mp4"
	};
	return {
		ext: "mp4",
		type: type || "video/mp4"
	};
}
function named(file, filename, type) {
	return new File([file], filename, {
		type,
		lastModified: Date.now()
	});
}
async function loadDrawable(file) {
	try {
		if (typeof createImageBitmap === "function") return await createImageBitmap(file, { imageOrientation: "from-image" });
	} catch {}
	return await new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve(img);
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(/* @__PURE__ */ new Error("Could not read that photo. On iPhone, take a screenshot or export as JPEG."));
		};
		img.src = url;
	});
}
async function jpegFromCanvas(canvas, quality) {
	const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
	if (!blob) throw new Error("Could not encode that photo.");
	return blob;
}
async function compressPhoto(file) {
	const source = await loadDrawable(file);
	const scale = Math.min(1, MAX_EDGE / Math.max(source.width, source.height, 1));
	const width = Math.max(1, Math.round(source.width * scale));
	const height = Math.max(1, Math.round(source.height * scale));
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not read that photo.");
	ctx.fillStyle = "#111";
	ctx.fillRect(0, 0, width, height);
	ctx.drawImage(source, 0, 0, width, height);
	source.close?.();
	let quality = .86;
	let blob = await jpegFromCanvas(canvas, quality);
	while (blob.size > 2097152 && quality > .48) {
		quality -= .1;
		blob = await jpegFromCanvas(canvas, quality);
	}
	if (blob.size > 2097152) throw new Error("Photo is still too heavy after shrinking. Try a screenshot.");
	return named(blob, `${stem(file.name)}.jpg`, "image/jpeg");
}
/** Turn a phone photo/video into something the art API will accept. */
async function prepareArtFile(file) {
	const kind = classifyArt(file);
	if (!kind) throw new Error("Need a photo or a short video (JPEG, HEIC, PNG, MP4, or MOV).");
	if (kind === "video") {
		if (file.size > 25165824) throw new Error(`Keep looping videos under ${Math.round(MEDIA_MAX_VIDEO / 1048576)} MB.`);
		const { ext, type } = videoExt(file);
		if ((file.name.split(".").pop() || "").toLowerCase() === ext && file.type) return file;
		return named(file, `${stem(file.name)}.${ext}`, type);
	}
	if (file.size > 25165824) throw new Error(`Photo is over ${Math.round(MEDIA_MAX_IMAGE_PICK / 1048576)} MB.`);
	return compressPhoto(file);
}
async function putFileToR2(putUrl, file, contentType) {
	const res = await fetch(putUrl, {
		method: "PUT",
		body: file,
		headers: { "Content-Type": contentType }
	});
	if (!res.ok) throw new Error(res.status === 403 ? "R2 rejected the upload (CORS or expired link). Try again." : "Upload to storage failed");
}
async function directDeskUpload(input) {
	const minted = await mintDeskUpload({ data: {
		kind: input.kind,
		slug: input.slug,
		filename: input.file.name,
		contentType: input.file.type || void 0,
		size: input.file.size,
		trackId: input.trackId
	} });
	await putFileToR2(minted.putUrl, input.file, minted.contentType);
	return completeDeskUpload({ data: {
		kind: input.kind,
		slug: input.slug,
		key: minted.key,
		title: input.title,
		coverUrl: input.coverUrl,
		trackId: input.trackId,
		contentType: minted.contentType,
		durationSec: input.durationSec
	} });
}
function HeroArtSheet({ channel, track, open, onClose }) {
	const [tab, setTab] = (0, import_react.useState)("song");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [hint, setHint] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open) {
			setHint("");
			setBusy(false);
			return;
		}
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = prev;
			window.removeEventListener("keydown", onKey);
		};
	}, [open, onClose]);
	if (!open) return null;
	async function upload(file) {
		setBusy(true);
		setHint(`Preparing ${file.name || "file"}…`);
		try {
			const ready = await prepareArtFile(file);
			setHint(`Uploading ${ready.name}…`);
			const result = await directDeskUpload({
				kind: "art",
				slug: channel.slug,
				file: ready,
				trackId: tab === "song" ? track.id : void 0
			});
			if (result.tracks) usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations ?? []));
			setHint(result.kind === "video" || ready.type.startsWith("video/") ? "Looping video saved" : "Photo saved");
			usePlayerStore.setState({ deckHint: "Art updated" });
			window.setTimeout(onClose, 600);
		} catch (error) {
			setHint(error instanceof Error ? error.message : "Upload failed");
		} finally {
			setBusy(false);
		}
	}
	const preview = tab === "song" ? visualSrc(track, channel) : visualSrc(null, channel);
	const mb = Math.round(MEDIA_MAX_VIDEO / 1048576);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "hero-art-overlay",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Replace art",
		onClick: onClose,
		onDragOver: (event) => event.preventDefault(),
		onDrop: (event) => {
			event.preventDefault();
			const file = event.dataTransfer.files?.[0];
			if (file) upload(file);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hero-art-panel",
			onClick: (event) => event.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "hero-art-x",
					"aria-label": "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						className: "size-5",
						strokeWidth: 2.25
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "hero-art-kicker",
					children: "Hero visual"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex shrink-0 gap-1",
					children: ["song", "station"].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTab(id),
						className: cn("inline-flex h-11 flex-1 items-center justify-center font-mono text-[11px] uppercase tracking-[0.14em]", tab === id ? "bg-fg text-bg" : "text-gold"),
						children: id === "song" ? "This song" : "Station"
					}, id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hero-art-preview",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
						src: preview,
						alt: "",
						className: "size-full",
						motion: "loop"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 shrink-0 text-xs leading-snug text-muted",
					children: hint || `Photos, HEIC, or a looping clip under ${mb} MB. Audio keeps playing.`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneArtPicker, {
						disabled: busy,
						onFile: (file) => void upload(file),
						label: busy ? "Working…" : "Choose file"
					})
				})
			]
		})
	});
}
function MarqueeTitle({ text, className }) {
	const wrapRef = (0, import_react.useRef)(null);
	const probeRef = (0, import_react.useRef)(null);
	const [run, setRun] = (0, import_react.useState)(false);
	const [dur, setDur] = (0, import_react.useState)(14);
	(0, import_react.useLayoutEffect)(() => {
		const wrap = wrapRef.current;
		const probe = probeRef.current;
		if (!wrap || !probe) return;
		const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const check = () => {
			if (reduce) {
				setRun(false);
				return;
			}
			const room = wrap.clientWidth;
			if (room < 8) return;
			const need = probe.scrollWidth - room > 2;
			setRun(need);
			if (need) setDur(Math.min(42, Math.max(8, probe.scrollWidth / 30)));
		};
		check();
		document.fonts?.ready?.then(check);
		const ro = new ResizeObserver(check);
		ro.observe(wrap);
		ro.observe(probe);
		window.addEventListener("resize", check);
		return () => {
			ro.disconnect();
			window.removeEventListener("resize", check);
		};
	}, [text]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		ref: wrapRef,
		className: cn("marquee", run && "marquee-overflow", run && "marquee-run", className),
		style: { ["--marquee-dur"]: `${dur}s` },
		title: text,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "marquee-static",
				children: text
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				ref: probeRef,
				className: "marquee-probe",
				"aria-hidden": true,
				children: text
			}),
			run ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "marquee-track",
				"aria-hidden": true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "marquee-copy",
					children: text
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "marquee-copy",
					children: text
				})]
			}) : null
		]
	});
}
function makePetal(rand = Math.random) {
	return {
		x: rand(),
		y: rand(),
		vx: (rand() - .5) * .04,
		vy: .018 + rand() * .02,
		rot: rand() * Math.PI * 2,
		spin: (rand() - .5) * .6,
		size: 10 + rand() * 16,
		tilt: rand() * Math.PI
	};
}
function paintPetal(ctx, size, fill, vein) {
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.bezierCurveTo(size * .55, -size * .15, size * .42, -size * .82, 0, -size);
	ctx.bezierCurveTo(-size * .42, -size * .82, -size * .55, -size * .15, 0, 0);
	ctx.closePath();
	ctx.fillStyle = fill;
	ctx.fill();
	ctx.strokeStyle = vein;
	ctx.lineWidth = Math.max(.6, size * .035);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(0, -size * .08);
	ctx.quadraticCurveTo(size * .04, -size * .5, 0, -size * .92);
	ctx.stroke();
}
function paintRose(ctx, radius, turn, open, pale) {
	(pale ? [
		{
			n: 7,
			scale: 1,
			fill: "rgba(251, 247, 243, 0.42)",
			vein: "rgba(196, 92, 106, 0.7)"
		},
		{
			n: 6,
			scale: .68,
			fill: "rgba(255, 244, 236, 0.62)",
			vein: "rgba(196, 92, 106, 0.8)"
		},
		{
			n: 5,
			scale: .4,
			fill: "rgba(255, 250, 246, 0.86)",
			vein: "rgba(201, 163, 106, 0.9)"
		}
	] : [
		{
			n: 7,
			scale: 1,
			fill: "rgba(244, 228, 196, 0.28)",
			vein: "rgba(201, 163, 106, 0.5)"
		},
		{
			n: 6,
			scale: .66,
			fill: "rgba(255, 236, 210, 0.4)",
			vein: "rgba(201, 163, 106, 0.62)"
		},
		{
			n: 5,
			scale: .38,
			fill: "rgba(255, 248, 236, 0.62)",
			vein: "rgba(201, 163, 106, 0.8)"
		}
	]).forEach((layer, index) => {
		const spin = turn * (index % 2 === 0 ? 1 : -1) * (.15 + index * .05);
		for (let i = 0; i < layer.n; i++) {
			ctx.save();
			ctx.rotate(Math.PI * 2 * i / layer.n + spin);
			paintPetal(ctx, radius * layer.scale * open, layer.fill, layer.vein);
			ctx.restore();
		}
	});
	ctx.beginPath();
	ctx.fillStyle = pale ? "rgba(255, 214, 170, 0.85)" : "rgba(232, 196, 122, 0.8)";
	ctx.arc(0, 0, Math.max(2.5, radius * .07), 0, Math.PI * 2);
	ctx.fill();
}
function PlayerMastRose({ pale = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		className: "player-mast-rose",
		viewBox: "0 0 64 64",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			transform: "translate(32 36)",
			children: [
				[
					0,
					60,
					120,
					180,
					240,
					300
				].map((deg) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
					cx: "0",
					cy: "-12",
					rx: "7.5",
					ry: "14",
					transform: `rotate(${deg})`,
					fill: pale ? "#fbf7f3" : "#f4e4c4",
					stroke: pale ? "#c45c6a" : "#c9a36a",
					strokeWidth: "0.8"
				}, deg)),
				[
					30,
					90,
					150,
					210,
					270,
					330
				].map((deg) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
					cx: "0",
					cy: "-8",
					rx: "5.2",
					ry: "10",
					transform: `rotate(${deg})`,
					fill: pale ? "#fffaf6" : "#fff6e8",
					stroke: pale ? "#e8a8b0" : "#e7c98a",
					strokeWidth: "0.7"
				}, deg)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "0",
					cy: "0",
					r: "3.2",
					fill: pale ? "#ffd6aa" : "#e8c47a"
				})
			]
		})
	});
}
function PlayerBloom({ playing, time, skin }) {
	const canvasRef = (0, import_react.useRef)(null);
	const timeRef = (0, import_react.useRef)(time);
	const playingRef = (0, import_react.useRef)(playing);
	timeRef.current = time;
	playingRef.current = playing;
	const rose = skin === "rose";
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		const parent = canvas?.parentElement;
		if (!canvas || !parent) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const petals = Array.from({ length: 16 }, () => makePetal());
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		let raf = 0;
		let w = 0;
		let h = 0;
		const fit = () => {
			const rect = parent.getBoundingClientRect();
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			w = Math.max(1, rect.width);
			h = Math.max(1, rect.height);
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		const draw = (now) => {
			const t = reduce ? 0 : now / 1e3;
			const clock = timeRef.current;
			const live = playingRef.current && !reduce;
			const kick = live ? Math.max(0, Math.sin(clock * Math.PI * 1.9)) ** 6 : .08;
			ctx.clearRect(0, 0, w, h);
			const glow = ctx.createRadialGradient(w * .32, h * .42, 10, w * .45, h * .5, Math.max(w, h) * .72);
			if (rose) {
				glow.addColorStop(0, `rgba(255, 214, 196, ${.16 + kick * .12})`);
				glow.addColorStop(.45, "rgba(196, 92, 106, 0.05)");
				glow.addColorStop(1, "rgba(0, 0, 0, 0)");
			} else {
				glow.addColorStop(0, `rgba(201, 163, 106, ${.12 + kick * .1})`);
				glow.addColorStop(1, "rgba(0, 0, 0, 0)");
			}
			ctx.fillStyle = glow;
			ctx.fillRect(0, 0, w, h);
			for (const roseAt of [{
				x: .74,
				y: .42,
				s: .22
			}, {
				x: .18,
				y: .22,
				s: .1
			}]) {
				ctx.save();
				ctx.translate(w * roseAt.x, h * roseAt.y);
				paintRose(ctx, Math.min(w, h) * roseAt.s, t * .15, .92 + kick * .08, rose);
				ctx.restore();
			}
			for (let i = 0; i < 3; i++) {
				const p = (t * .18 + i / 3) % 1;
				ctx.beginPath();
				ctx.strokeStyle = rose ? `rgba(251, 247, 243, ${.28 * (1 - p)})` : `rgba(201, 163, 106, ${.24 * (1 - p)})`;
				ctx.lineWidth = 1.25;
				ctx.ellipse(w * .74, h * .42, 36 + p * Math.min(w, h) * .34, 24 + p * Math.min(w, h) * .2, t * .05, 0, Math.PI * 2);
				ctx.stroke();
			}
			const dt = 1 / 60;
			for (const petal of petals) {
				if (live) {
					petal.x += petal.vx * dt + Math.sin(t * .7 + petal.tilt) * 8e-4;
					petal.y += (petal.vy + kick * .01) * dt * 8;
					petal.rot += petal.spin * dt;
					if (petal.y > 1.08) {
						petal.y = -.08;
						petal.x = Math.random();
					}
				}
				ctx.save();
				ctx.translate(petal.x * w, petal.y * h);
				ctx.rotate(petal.rot);
				ctx.globalAlpha = .72;
				paintPetal(ctx, petal.size, rose ? "rgba(251, 247, 243, 0.55)" : "rgba(244, 228, 196, 0.4)", rose ? "rgba(196, 92, 106, 0.45)" : "rgba(201, 163, 106, 0.4)");
				ctx.restore();
			}
			if (!reduce) raf = requestAnimationFrame(draw);
		};
		fit();
		const ro = new ResizeObserver(fit);
		ro.observe(parent);
		raf = requestAnimationFrame(draw);
		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
		};
	}, [rose]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		className: "player-bloom",
		"aria-hidden": true
	});
}
function nativeShareOk() {
	if (typeof navigator === "undefined" || typeof navigator.share !== "function") return false;
	const ua = navigator.userAgent;
	if (/iPhone|iPad|iPod|Android/i.test(ua)) return true;
	return navigator.maxTouchPoints > 1 && window.matchMedia("(pointer: coarse)").matches;
}
function ShareLink({ path, title, compact = false }) {
	const hrefPath = path.startsWith("/") ? path : `/${path}`;
	const [href, setHref] = (0, import_react.useState)(hrefPath);
	const [copied, setCopied] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setHref(`${window.location.origin}${hrefPath}`);
	}, [hrefPath]);
	async function share() {
		const url = href.startsWith("http") ? href : `${window.location.origin}${hrefPath}`;
		if (nativeShareOk()) try {
			await navigator.share({
				title,
				url,
				text: title
			});
			return;
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") return;
		}
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2200);
		} catch {
			window.prompt("Copy this link", url);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1",
		children: [
			compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "hidden min-w-0 flex-1 truncate font-mono text-[11px] text-subtle sm:block",
				title: href,
				children: href
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => void share(),
				className: "inline-flex h-11 shrink-0 items-center gap-2 px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), "Share"]
			}),
			copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[10px] uppercase tracking-[0.14em] text-muted",
				children: "URL copied"
			}) : null
		]
	});
}
function ShuffleToggle({ channel, compact = false }) {
	const slug = usePlayerStore((s) => s.channelSlug);
	const shuffleBySlug = usePlayerStore((s) => s.shuffleBySlug);
	const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
	const mode = normalizeShuffle(channel.shuffle);
	const mixing = shuffleActive(channel, Boolean(shuffleBySlug[channel.slug]));
	const locked = mode === "off" || mode === "on";
	if (compact) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		disabled: locked,
		onClick: () => toggleShuffle(channel.slug),
		"aria-pressed": mixing,
		title: locked ? shuffleHint(mode) : mixing ? "Shuffle on — next song is mixed" : "Shuffle off — playlist order",
		className: cn("inline-flex h-11 shrink-0 items-center gap-2 px-2 font-mono text-[11px] uppercase tracking-[0.14em]", locked && "opacity-60"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: cn("size-4", mixing ? "text-gold" : "text-subtle") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn(mixing ? "text-gold" : "text-subtle"),
			children: mixing ? "Mix" : "Order"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "Listening order"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: shuffleHint(mode)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: mode === "on",
					onClick: () => {
						if (mixing) toggleShuffle(channel.slug);
					},
					className: cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", !mixing ? "bg-fg text-bg" : "text-gold", mode === "on" && "opacity-50"),
					children: "Playlist order"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					disabled: mode === "off",
					onClick: () => {
						if (!mixing) toggleShuffle(channel.slug);
					},
					className: cn("inline-flex h-11 items-center gap-2 px-3 font-mono text-[11px] uppercase tracking-[0.14em]", mixing ? "bg-fg text-bg" : "text-gold", mode === "off" && "opacity-50"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-3.5" }), "Shuffle"]
				})]
			}),
			slug === channel.slug ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
				children: [
					mixing ? "Next song is mixed." : "Next song follows the list.",
					" ",
					locked ? `Desk lock: ${shuffleLabel(mode)}.` : ""
				]
			}) : null
		]
	});
}
function useKeptOnDevice(trackId) {
	const gen = (0, import_react.useSyncExternalStore)(subscribeAudioCache, audioCacheGeneration, () => 0);
	const [kept, setKept] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let live = true;
		hasCachedAudio(trackId).then((value) => {
			if (live) setKept(value);
		});
		return () => {
			live = false;
		};
	}, [trackId, gen]);
	return kept;
}
function TrackActions({ trackId, compact = false }) {
	const liked = usePlayerStore((s) => s.liked.includes(trackId));
	const favorite = usePlayerStore((s) => s.favorites.includes(trackId));
	const likes = usePlayerStore((s) => s.likeCounts[trackId] ?? 0);
	const views = usePlayerStore((s) => s.views[trackId] ?? 0);
	const toggleLike = usePlayerStore((s) => s.toggleLike);
	const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);
	const kept = useKeptOnDevice(trackId);
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
			kept ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: (event) => {
					event.preventDefault();
					event.stopPropagation();
					forgetCachedAudio(trackId);
				},
				className: "inline-flex h-11 items-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
				title: "Remove the copy kept on this device",
				"aria-label": "Remove device copy",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HardDrive, { className: "size-4" }), compact ? "" : "On device"]
			}) : null,
			views > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
				children: [views, " plays"]
			}) : null
		]
	});
}
function UnallocateControl({ channel, track }) {
	const { isAdmin, isPending } = useRadioUser();
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending || !isAdmin) return null;
	async function run() {
		if (!window.confirm(`Remove from ${channel.name}? File stays on R2. Lands in Desk → Review. Other stations untouched.`)) return;
		setBusy(true);
		try {
			const result = await unallocateStationTrack({ data: {
				channelSlug: channel.slug,
				trackId: track.id,
				audioUrl: track.audioUrl,
				title: track.title,
				artist: track.artist,
				coverUrl: track.coverUrl
			} });
			usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
			usePlayerStore.setState({ deckHint: "Sent to Review." });
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Could not unallocate");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		disabled: busy,
		onClick: () => void run(),
		title: "Remove from this station into Desk Review",
		className: "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
		children: busy ? "Sending…" : "To review"
	});
}
function DeviceCacheLine() {
	const gen = (0, import_react.useSyncExternalStore)(subscribeAudioCache, audioCacheGeneration, () => 0);
	const [usage, setUsage] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let live = true;
		cacheUsage().then((value) => {
			if (live) setUsage(value);
		});
		return () => {
			live = false;
		};
	}, [gen]);
	if (!usage || usage.count < 1) return null;
	const mb = Math.max(1, Math.round(usage.used / 1048576));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => void clearCachedAudio(),
		className: "inline-flex h-11 items-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle hover:text-gold",
		title: "Clear copies kept on this device",
		children: [
			usage.count,
			" kept · ",
			mb,
			" MB · clear"
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
function Scrubber({ currentTime, duration, compact = false, health = false }) {
	const seek = usePlayerStore((s) => s.seek);
	const hitRef = (0, import_react.useRef)(null);
	const dragging = (0, import_react.useRef)(false);
	const unbind = (0, import_react.useRef)(null);
	const maxRef = (0, import_react.useRef)(0);
	const seekRef = (0, import_react.useRef)(seek);
	const [preview, setPreview] = (0, import_react.useState)(null);
	seekRef.current = seek;
	const max = Math.max(duration, 0);
	maxRef.current = max;
	const shown = preview ?? currentTime;
	const progress = max > 0 ? Math.min(100, shown / max * 100) : 0;
	const remaining = Math.max(0, max - shown);
	(0, import_react.useEffect)(() => () => unbind.current?.(), []);
	function timeAt(clientX) {
		const el = hitRef.current;
		const span = maxRef.current;
		if (!el || span <= 0) return 0;
		const rect = el.getBoundingClientRect();
		return Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(rect.width, 1))) * span;
	}
	function onPointerDown(event) {
		event.preventDefault();
		event.stopPropagation();
		dragging.current = true;
		try {
			event.currentTarget.setPointerCapture(event.pointerId);
		} catch {}
		const next = timeAt(event.clientX);
		setPreview(next);
		seekRef.current(next);
		unbind.current?.();
		const move = (e) => {
			if (!dragging.current) return;
			const t = timeAt(e.clientX);
			setPreview(t);
			seekRef.current(t);
		};
		const up = (e) => {
			if (!dragging.current) return;
			dragging.current = false;
			seekRef.current(timeAt(e.clientX));
			setPreview(null);
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
			window.removeEventListener("pointercancel", up);
			unbind.current = null;
		};
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", up);
		window.addEventListener("pointercancel", up);
		unbind.current = () => {
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
			window.removeEventListener("pointercancel", up);
		};
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("deck-scrub", compact && "deck-scrub-dock", health && "deck-scrub-hp"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: hitRef,
			role: "slider",
			tabIndex: 0,
			"aria-valuemin": 0,
			"aria-valuemax": Math.round(max),
			"aria-valuenow": Math.round(shown),
			"aria-label": health ? "Song health" : "Seek",
			className: "deck-scrub-hit",
			onPointerDown,
			onKeyDown: (event) => {
				if (event.key === "ArrowRight" || event.key === "ArrowUp") {
					event.preventDefault();
					seek(Math.min(max, currentTime + 5));
				} else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
					event.preventDefault();
					seek(Math.max(0, currentTime - 5));
				} else if (event.key === "Home") {
					event.preventDefault();
					seek(0);
				} else if (event.key === "End") {
					event.preventDefault();
					seek(max);
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "deck-scrub-track",
					"aria-hidden": true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "deck-scrub-fill",
						style: { width: `${progress}%` }
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "deck-scrub-thumb",
					style: { left: `${progress}%` },
					"aria-hidden": true
				}),
				preview !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "deck-scrub-tip",
					style: { left: `${progress}%` },
					"aria-hidden": true,
					children: formatClock(preview, { floor: true })
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "deck-scrub-times",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatClock(shown, { floor: true }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: compact ? formatClock(max) : `-${formatClock(remaining, { floor: true })}` })]
		})]
	});
}
function VolumeControl({ compact = false, className }) {
	const volume = usePlayerStore((s) => s.volume);
	const muted = usePlayerStore((s) => s.muted);
	const setVolume = usePlayerStore((s) => s.setVolume);
	const toggleMute = usePlayerStore((s) => s.toggleMute);
	const hitRef = (0, import_react.useRef)(null);
	const dragging = (0, import_react.useRef)(false);
	const unbind = (0, import_react.useRef)(null);
	const setRef = (0, import_react.useRef)(setVolume);
	const [preview, setPreview] = (0, import_react.useState)(null);
	setRef.current = setVolume;
	const shown = preview ?? volume;
	const progress = Math.min(100, Math.max(0, shown * 100));
	const silent = muted && preview === null;
	const Icon = silent || shown <= 0 ? VolumeX : shown < .4 ? Volume1 : Volume2;
	(0, import_react.useEffect)(() => () => unbind.current?.(), []);
	function levelAt(clientX) {
		const el = hitRef.current;
		if (!el) return 0;
		const rect = el.getBoundingClientRect();
		return Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(rect.width, 1)));
	}
	function onPointerDown(event) {
		event.preventDefault();
		event.stopPropagation();
		dragging.current = true;
		try {
			event.currentTarget.setPointerCapture(event.pointerId);
		} catch {}
		const next = levelAt(event.clientX);
		setPreview(next);
		setRef.current(next);
		unbind.current?.();
		const move = (e) => {
			if (!dragging.current) return;
			const t = levelAt(e.clientX);
			setPreview(t);
			setRef.current(t);
		};
		const up = (e) => {
			if (!dragging.current) return;
			dragging.current = false;
			setRef.current(levelAt(e.clientX));
			setPreview(null);
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
			window.removeEventListener("pointercancel", up);
			unbind.current = null;
		};
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", up);
		window.addEventListener("pointercancel", up);
		unbind.current = () => {
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
			window.removeEventListener("pointercancel", up);
		};
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("deck-volume", compact && "deck-volume-dock", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: (event) => {
				event.stopPropagation();
				toggleMute();
			},
			className: "grid size-11 shrink-0 place-items-center text-gold",
			"aria-label": silent ? "Unmute" : "Mute",
			title: silent ? "Unmute" : "Mute",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: hitRef,
			role: "slider",
			tabIndex: 0,
			"aria-valuemin": 0,
			"aria-valuemax": 100,
			"aria-valuenow": Math.round(silent ? 0 : progress),
			"aria-valuetext": silent ? "muted" : `${Math.round(shown * 100)} percent`,
			"aria-label": "Volume",
			className: "deck-volume-hit",
			onPointerDown,
			onKeyDown: (event) => {
				if (event.key === "ArrowRight" || event.key === "ArrowUp") {
					event.preventDefault();
					setVolume(Math.min(1, volume + .05));
				} else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
					event.preventDefault();
					setVolume(Math.max(0, volume - .05));
				} else if (event.key === "Home") {
					event.preventDefault();
					setVolume(0);
				} else if (event.key === "End") {
					event.preventDefault();
					setVolume(1);
				} else if (event.key === "m" || event.key === "M") {
					event.preventDefault();
					toggleMute();
				}
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("deck-volume-track", silent && "deck-volume-muted"),
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "deck-volume-fill",
					style: { width: `${progress}%` }
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "deck-volume-thumb",
				style: { left: `${progress}%` },
				"aria-hidden": true
			})]
		})]
	});
}
function TransportButtons({ playing, skipHint, large = false }) {
	const togglePlay = usePlayerStore((s) => s.togglePlay);
	const next = usePlayerStore((s) => s.next);
	const prev = usePlayerStore((s) => s.prev);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("player-stage-transport", !large && "player-dock-transport"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void prev(),
				title: skipHint || "Previous",
				className: cn("grid shrink-0 place-items-center text-gold", large ? "size-14" : "size-11"),
				"aria-label": "Previous",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: large ? "size-7" : "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void togglePlay(),
				className: cn("grid shrink-0 place-items-center rounded-full bg-fg text-bg", large ? "size-16" : "size-12"),
				"aria-label": playing ? "Pause" : "Play",
				children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: large ? "size-7" : "size-6" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: large ? "size-7 ml-0.5" : "size-6 ml-0.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void next("user"),
				title: skipHint || "Next",
				className: cn("grid shrink-0 place-items-center text-gold", large ? "size-14" : "size-11"),
				"aria-label": "Next",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: large ? "size-7" : "size-5" })
			})
		]
	});
}
function RoseRiteOrnament() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "player-rose-ornament",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				className: "player-rose-antlers",
				src: "/experiences/rose/antlers.jpg",
				alt: ""
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				className: "player-rose-sword is-left",
				src: "/experiences/rose/elven-sword.jpg",
				alt: ""
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				className: "player-rose-sword is-right",
				src: "/experiences/rose/elven-sword.jpg",
				alt: ""
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "player-rose-sand" })
		]
	});
}
function MiniPlayer() {
	const track = usePlayerStore((s) => s.track);
	const status = usePlayerStore((s) => s.status);
	const slug = usePlayerStore((s) => s.channelSlug);
	const currentTime = usePlayerStore((s) => s.currentTime);
	const duration = usePlayerStore((s) => s.duration);
	const collapsed = usePlayerStore((s) => s.playerCollapsed);
	const hidden = usePlayerStore((s) => s.playerHidden);
	const buffering = usePlayerStore((s) => s.buffering);
	const deckHint = usePlayerStore((s) => s.deckHint);
	const elsewhere = usePlayerStore((s) => s.elsewhere);
	const listenMode = usePlayerStore((s) => s.listenModeSession ?? s.listenMode);
	const setPlayerCollapsed = usePlayerStore((s) => s.setPlayerCollapsed);
	const setPlayerHidden = usePlayerStore((s) => s.setPlayerHidden);
	const jumpToLive = usePlayerStore((s) => s.jumpToLive);
	const { isAdmin } = useRadioUser();
	const [artOpen, setArtOpen] = (0, import_react.useState)(false);
	const [renaming, setRenaming] = (0, import_react.useState)(false);
	const channel = slug ? getChannel(slug) : void 0;
	const ios = (0, import_react.useMemo)(() => typeof navigator !== "undefined" && (/iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1), []);
	(0, import_react.useEffect)(() => {
		setRenaming(false);
	}, [track?.id]);
	(0, import_react.useEffect)(() => {
		if (collapsed || hidden) return;
		const onKey = (event) => {
			if (event.key !== "Escape") return;
			event.preventDefault();
			setPlayerCollapsed(true);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		collapsed,
		hidden,
		setPlayerCollapsed
	]);
	if (!track || !channel) return null;
	const playing = status === "playing";
	const skin = stationSkin(channel);
	const overlay = isOnDemandOverlay(channel, listenMode);
	const deskKind = normalizeKind(channel.kind || channel.mode);
	const liveSync = listenMode === "stream" && deskKind === "live" && !overlay;
	const art = visualSrc(track, channel);
	const statusLine = status === "loading" ? "Tuning…" : buffering ? "Buffering…" : elsewhere ? "Playing in another tab" : deckHint ? deckHint : overlay ? "On demand" : liveSync ? "Live" : playing ? "Playing" : "Paused";
	const skipHint = liveSync ? "Leaves streaming" : void 0;
	const progress = duration > 0 ? Math.min(100, Math.max(0, currentTime / duration * 100)) : 0;
	const shell = cn(skin === "glaum" && "player-shell-glaum", skin === "waheguru" && "player-shell-wahe", skin === "rose" && "player-shell-rose");
	const extras = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "player-stage-extras",
		children: [
			overlay ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => void jumpToLive(),
				className: "inline-flex h-11 items-center justify-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3.5" }), "Live"]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListenModeLamp, { compact: true }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutoplayLamp, { compact: true }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShuffleToggle, {
				channel,
				compact: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackActions, {
				trackId: track.id,
				compact: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeviceCacheLine, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnallocateControl, {
				channel,
				track
			}),
			isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setRenaming((value) => !value),
				"aria-expanded": renaming,
				className: "inline-flex h-11 items-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5" }), "Rename"]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareLink, {
				path: songPath(track),
				title: track.title,
				compact: true
			})
		]
	});
	const artSheet = isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroArtSheet, {
		channel,
		track,
		open: artOpen,
		onClose: () => setArtOpen(false)
	}) : null;
	if (hidden) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: cn("player-dock player-sliver", shell),
		onClick: () => setPlayerHidden(false),
		"aria-label": "Open player",
		title: "Open player",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "player-sliver-rail",
			"aria-hidden": true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "player-sliver-fill",
				style: { width: `${progress}%` }
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "player-sliver-mark size-4" })]
	});
	if (!collapsed) {
		const pale = skin === "rose";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("player-stage", shell),
			role: "dialog",
			"aria-label": "Now playing",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("player-stage-sheet", pale && "is-rose"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerBloom, {
						playing,
						time: currentTime,
						skin
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "player-stage-chrome player-stage-mast",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setPlayerCollapsed(true),
								className: "grid size-11 shrink-0 place-items-center text-gold",
								"aria-label": "Collapse player",
								title: "Collapse player",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "player-stage-mast-copy",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerMastRose, { pale }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "player-stage-kicker",
										children: "Now playing"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: cn("player-stage-mast-name", pale && "is-rose"),
										children: pale ? "White Rose" : channel.name
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "player-stage-mast-status",
								children: statusLine
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setPlayerHidden(true),
								className: "grid size-11 shrink-0 place-items-center text-subtle hover:text-fg",
								"aria-label": "Hide player",
								title: "Hide player",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "player-stage-body",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "player-stage-art",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "player-stage-art-frame",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => isAdmin && setArtOpen(true),
									className: "block size-full",
									"aria-label": isAdmin ? "Replace this song’s art" : track.title,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
										src: art,
										alt: "",
										className: "size-full",
										motion: "loop"
									})
								}), isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setArtOpen(true),
									className: "absolute right-2 top-2 inline-flex size-11 items-center justify-center rounded-md bg-bg/85 text-gold",
									"aria-label": "Replace art",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-4" })
								}) : null]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "player-stage-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 text-center md:text-left",
									children: [isAdmin && renaming ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RenameCutForm, {
										slug: channel.slug,
										track,
										appearance: "title",
										onClose: () => setRenaming(false)
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: cn("min-w-0 font-display text-2xl font-semibold leading-tight sm:text-3xl", skin === "glaum" && "glaum-title", pale && "rose-title"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarqueeTitle, { text: track.title })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 truncate text-sm text-muted",
										children: [track.artist || "Unknown", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-subtle",
											children: [" · ", channel.name]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "player-stage-vu flex justify-center md:justify-start",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VuMeter, {
										playing,
										skin
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransportButtons, {
									playing,
									skipHint,
									large: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scrubber, {
									currentTime,
									duration,
									health: pale
								}),
								!ios ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeControl, { className: "w-full max-w-sm md:max-w-none" }) : null,
								extras,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "player-stage-desk text-center font-mono text-[10px] uppercase tracking-[0.12em] text-subtle md:text-left",
									children: [
										"Desk: ",
										kindLabel(deskKind),
										" · You: ",
										listenModeLabel(listenMode)
									]
								})
							]
						})]
					})
				]
			}), artSheet]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("player-dock fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur-sm", shell),
		children: [
			skin === "rose" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoseRiteOrnament, {}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-6xl px-3 pt-1 sm:px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setPlayerCollapsed(false),
							className: "grid size-11 shrink-0 place-items-center text-gold",
							"aria-label": "Expand player",
							title: "Expand player",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0 flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scrubber, {
								currentTime,
								duration,
								compact: true,
								health: skin === "rose"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setPlayerHidden(true),
							className: "grid size-11 shrink-0 place-items-center text-subtle hover:text-fg",
							"aria-label": "Hide player",
							title: "Hide player",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 sm:gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setPlayerCollapsed(false),
							className: "flex min-w-0 flex-1 items-center gap-2.5 text-left",
							"aria-label": "Expand player",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
								src: art,
								alt: "",
								className: "size-12 shrink-0 overflow-hidden rounded-md",
								motion: "still"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1 overflow-hidden",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarqueeTitle, {
									text: track.title,
									className: cn("min-w-0 w-full font-display text-base leading-tight", skin === "glaum" && "glaum-title", skin === "rose" && "rose-title")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
									children: [track.artist ? `${track.artist} · ` : "", statusLine]
								})]
							})]
						}),
						overlay ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void jumpToLive(),
							className: "inline-flex h-11 shrink-0 items-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
							title: "Jump to the station clock",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Live"
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransportButtons, {
							playing,
							skipHint
						}),
						!ios ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeControl, { compact: true }) : null
					]
				})]
			}),
			artSheet
		]
	});
}
var subscribeToNothing = () => () => {};
function AuthSlot() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { user, isAdmin, isPending } = useRadioUser();
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, () => false);
	const next = pathname && pathname !== "/login" ? pathname : "/";
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 w-16 shrink-0 animate-pulse rounded-md bg-bg-elevated sm:w-24" });
	if (!user) {
		if (gateSession) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
			children: "Signed in"
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: `/login?next=${encodeURIComponent(next)}`,
			className: "inline-flex h-11 shrink-0 items-center px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
			children: "Sign in"
		});
	}
	const label = user.email || user.name || "Signed in";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 shrink-0 items-center gap-1 sm:gap-2",
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
				className: "hidden max-w-[10rem] truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted xl:inline",
				children: label
			}),
			gateSession ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "/logout",
				className: "hidden h-11 items-center font-mono text-[10px] uppercase tracking-[0.12em] text-subtle hover:text-fg sm:inline-flex",
				children: "Sign out"
			})
		]
	});
}
var HUB = "https://www.terrainfinity.ca";
var HUB_PNG = "https://www.terrainfinity.ca/brand/ti-logo.png";
var HUB_WEBM = "https://www.terrainfinity.ca/brand/ti-logo-click.webm";
var LOCAL_PNG = "/brand/ti-logo.png";
var LOCAL_WEBM = "/brand/ti-logo-click.webm";
var HOLD_MS = 320;
function prefersReducedMotion() {
	return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function hasFineHover() {
	return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
function TiNetworkMark({ size = 48, className }) {
	const videoRef = (0, import_react.useRef)(null);
	const holdRef = (0, import_react.useRef)(0);
	const suppressClick = (0, import_react.useRef)(false);
	const [png, setPng] = (0, import_react.useState)(HUB_PNG);
	const [webm, setWebm] = (0, import_react.useState)(HUB_WEBM);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => () => window.clearTimeout(holdRef.current), []);
	function playAnim() {
		if (prefersReducedMotion()) return;
		const video = videoRef.current;
		if (!video) return;
		video.muted = true;
		video.playsInline = true;
		video.loop = false;
		video.playbackRate = 2;
		try {
			video.currentTime = 0;
		} catch {}
		const play = video.play();
		if (play) play.then(() => setPlaying(true)).catch(() => setPlaying(false));
	}
	function goHub() {
		window.location.assign(HUB);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href: HUB,
		"aria-label": "Terra Infinity home",
		className,
		style: {
			position: "relative",
			display: "inline-flex",
			width: size,
			height: size,
			flexShrink: 0,
			overflow: "hidden"
		},
		onClick: (event) => {
			if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
			event.preventDefault();
			if (suppressClick.current) {
				suppressClick.current = false;
				return;
			}
			goHub();
		},
		onMouseEnter: () => {
			if (hasFineHover()) playAnim();
		},
		onPointerDown: (event) => {
			if (event.pointerType === "mouse") return;
			window.clearTimeout(holdRef.current);
			holdRef.current = window.setTimeout(() => {
				playAnim();
				suppressClick.current = true;
			}, HOLD_MS);
		},
		onPointerUp: () => window.clearTimeout(holdRef.current),
		onPointerCancel: () => window.clearTimeout(holdRef.current),
		onContextMenu: (event) => event.preventDefault(),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: png,
			alt: "",
			draggable: false,
			style: {
				position: "absolute",
				inset: 0,
				width: "100%",
				height: "100%",
				objectFit: "contain",
				pointerEvents: "none",
				opacity: playing ? 0 : 1,
				transition: "opacity 150ms ease"
			},
			onError: () => {
				if (png !== LOCAL_PNG) setPng(LOCAL_PNG);
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
			ref: videoRef,
			src: webm,
			muted: true,
			playsInline: true,
			preload: "metadata",
			"aria-hidden": true,
			disablePictureInPicture: true,
			disableRemotePlayback: true,
			loop: false,
			style: {
				position: "absolute",
				inset: 0,
				width: "100%",
				height: "100%",
				objectFit: "contain",
				pointerEvents: "none",
				opacity: playing ? 1 : 0,
				transition: "opacity 150ms ease"
			},
			onEnded: () => {
				const video = videoRef.current;
				if (video) {
					video.pause();
					try {
						video.currentTime = 0;
					} catch {}
				}
				setPlaying(false);
			},
			onError: () => {
				if (webm !== LOCAL_WEBM) setWebm(LOCAL_WEBM);
			}
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
		label: "Stations",
		match: (path) => path === "/" || path.startsWith("/channel/")
	},
	{
		href: "/player",
		label: "Songs",
		match: (path) => path === "/player" || path.startsWith("/player/") || path === "/library"
	},
	{
		href: "/experiences",
		label: "Experiences",
		match: (path) => path.startsWith("/experiences")
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
	const visited = usePlayerStore((s) => s.visited);
	const { isAdmin, user } = useRadioUser();
	const channel = slug ? getChannel(slug) : void 0;
	const onGlaum = Boolean(channel && stationSkin(channel) === "glaum");
	const navigate = useNavigate();
	const [q, setQ] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setOpen(false);
	}, [pathname]);
	function goSearch(event) {
		event.preventDefault();
		const next = q.trim();
		setOpen(false);
		navigate({
			to: "/",
			search: { q: next || void 0 }
		});
	}
	const gold = driving?.own ? "text-buzz" : "text-gold";
	function NavLinks({ onPick }) {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [links.map((link) => {
			const active = link.match(pathname);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: link.href,
				onClick: onPick,
				className: cn("inline-flex h-11 shrink-0 items-center px-2.5 font-mono text-[11px] uppercase tracking-[0.14em]", active ? gold : "text-muted hover:text-fg"),
				children: link.label
			}, link.href);
		}), isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/desk",
			onClick: onPick,
			className: cn("inline-flex h-11 shrink-0 items-center px-2.5 font-mono text-[11px] uppercase tracking-[0.14em]", pathname.startsWith("/desk") ? "text-gold" : "text-muted hover:text-fg"),
			children: "Desk"
		}) : null] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 shrink-0 items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TiNetworkMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "min-w-0",
						onClick: () => setOpen(false),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("mark-radio font-display text-base font-semibold leading-none tracking-[0.28em] sm:text-lg", gold),
							children: "Radio"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "ml-2 hidden min-w-0 items-center md:flex",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: goSearch,
					className: "relative hidden min-w-0 max-w-52 flex-1 lg:block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input h-10 pl-8 text-sm",
						value: q,
						onChange: (event) => setQ(event.target.value),
						placeholder: "Search",
						type: "search",
						"aria-label": "Search songs and stations"
					})]
				}),
				ready && visited ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle xl:block",
					children: [
						points,
						" pts",
						onGlaum || glaumules > 0 ? ` · ${glaumules} glåümules` : ""
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListenModeLamp, { compact: true }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutoplayLamp, { compact: true }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "inline-flex size-11 shrink-0 items-center justify-center text-gold md:hidden",
					"aria-expanded": open,
					"aria-label": open ? "Close menu" : "Open menu",
					onClick: () => setOpen((value) => !value),
					children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
				})
			]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-line bg-bg px-3 py-3 md:hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex flex-col",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, { onPick: () => setOpen(false) })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: goSearch,
					className: "relative mt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input h-11 pl-8 text-sm",
						value: q,
						onChange: (event) => setQ(event.target.value),
						placeholder: "Songs, stations",
						type: "search",
						"aria-label": "Search songs and stations"
					})]
				}),
				user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/logout",
					className: "mt-2 inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-subtle",
					children: "Sign out"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: `/login?next=${encodeURIComponent(pathname || "/")}`,
					className: "mt-2 inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
					children: "Sign in"
				})
			]
		}) : null]
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
	const visited = usePlayerStore((s) => s.visited);
	const slug = usePlayerStore((s) => s.channelSlug);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const search = useRouterState({ select: (s) => s.location.searchStr });
	const hash = useRouterState({ select: (s) => s.location.hash });
	const applyListenQuery = usePlayerStore((s) => s.applyListenQuery);
	const channel = slug ? getChannel(slug) : void 0;
	const skin = channel ? stationSkin(channel) : "none";
	const showGate = ready && !visited && isLandingLocation(pathname, search);
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	(0, import_react.useEffect)(() => {
		applyListenQuery(search, hash);
	}, [
		applyListenQuery,
		search,
		hash
	]);
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
					ready && !showGate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniPlayer, {}) : null
				]
			}),
			showGate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnterGate, {}) : null
		]
	});
}
var styles_default = "/assets/styles-DPH-ljDl.css";
var APP_NAME = "Radio";
var Route$21 = createRootRoute({
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
				content: "Welcome to the Light Ages. A chaos primer in relative time — a radio of frequencies."
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
var $$splitComponentImporter$12 = () => import("./routes-EW8SRgCS.mjs");
var Route$20 = createFileRoute("/")({
	component: lazyRouteComponent($$splitComponentImporter$12, "component"),
	validateSearch: qSearch,
	head: () => ({ meta: [{ title: "Radio" }] })
});
var $$splitComponentImporter$11 = () => import("../_alias-2K26nAsE.mjs");
var Route$19 = createFileRoute("/$alias")({
	beforeLoad: async ({ params }) => {
		if (isReservedPublicPath(params.alias)) return;
		try {
			await ensureLiveCatalog();
		} catch {}
	},
	component: lazyRouteComponent($$splitComponentImporter$11, "component"),
	head: ({ params }) => {
		const song = getSongByAlias(params.alias);
		if (song) return { meta: [{ title: `${song.track.title} · Radio` }] };
		const station = getStationByAlias(params.alias);
		if (station) return { meta: [{ title: `${station.name} · Radio` }] };
		return { meta: [{ title: `/${params.alias} · Radio` }] };
	}
});
var $$splitComponentImporter$10 = () => import("./about-yOkU6JsD.mjs");
var Route$18 = createFileRoute("/about")({
	beforeLoad: () => {
		throw redirect({
			to: "/",
			replace: true
		});
	},
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./desk-CuF9uspS.mjs");
var Route$17 = createFileRoute("/desk")({
	component: lazyRouteComponent($$splitComponentImporter$9, "component"),
	head: () => ({ meta: [{ title: "Station desk · Radio" }] })
});
var $$splitComponentImporter$8 = () => import("./experiences-BrjnMISV.mjs");
var Route$16 = createFileRoute("/experiences")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./library-DVrJhvoV.mjs");
var Route$15 = createFileRoute("/library")({
	beforeLoad: () => {
		throw redirect({
			to: "/player",
			replace: true
		});
	},
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./login-C8Mz1hR0.mjs");
var Route$14 = createFileRoute("/login")({
	component: lazyRouteComponent($$splitComponentImporter$6, "component"),
	head: () => ({ meta: [{ title: "Sign in · Radio" }] })
});
var $$splitComponentImporter$5 = () => import("./logout-BZ_w7rU3.mjs");
var Route$13 = createFileRoute("/logout")({
	server: { handlers: {
		GET: async ({ request }) => {
			const { clearSsoCookie, logoutLocation } = await import("./sso.server-NSJ3vLzw.mjs").then((n) => n.p);
			return new Response(null, {
				status: 302,
				headers: {
					Location: logoutLocation(request),
					"Set-Cookie": clearSsoCookie(request)
				}
			});
		},
		POST: async ({ request }) => {
			const { clearSsoCookie, logoutLocation } = await import("./sso.server-NSJ3vLzw.mjs").then((n) => n.p);
			return new Response(null, {
				status: 302,
				headers: {
					Location: logoutLocation(request),
					"Set-Cookie": clearSsoCookie(request)
				}
			});
		}
	} },
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("../_slug-D6vlVhTV.mjs");
var Route$12 = createFileRoute("/channel/$slug")({
	beforeLoad: async () => {
		try {
			await ensureLiveCatalog();
		} catch {}
	},
	component: lazyRouteComponent($$splitComponentImporter$4, "component"),
	head: ({ params }) => {
		return { meta: [{ title: `${getChannel(params.slug)?.name ?? "Station"} · Radio` }] };
	}
});
var $$splitComponentImporter$3 = () => import("./experiences-CoXL0zAS.mjs");
var Route$11 = createFileRoute("/experiences/")({
	component: lazyRouteComponent($$splitComponentImporter$3, "component"),
	head: () => ({ meta: [{ title: "Experiences · Radio" }] })
});
var $$splitComponentImporter$2 = () => import("../_slug-CNwsAoC0.mjs");
var Route$10 = createFileRoute("/experiences/$slug")({
	beforeLoad: async () => {
		try {
			await ensureLiveCatalog();
		} catch {}
	},
	component: lazyRouteComponent($$splitComponentImporter$2, "component"),
	head: ({ params }) => {
		return { meta: [{ title: `${getExperience(params.slug, getCatalog())?.title ?? "Experience"} · Radio` }] };
	}
});
var $$splitComponentImporter$1 = () => import("./player-CQ1UTinS.mjs");
var Route$9 = createFileRoute("/player/")({
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	validateSearch: qSearch,
	head: () => ({ meta: [{ title: "Songs · Radio" }] })
});
var $$splitComponentImporter = () => import("../_id-Df9WS15L.mjs");
var Route$8 = createFileRoute("/player/$id")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	beforeLoad: async ({ params }) => {
		try {
			await ensureLiveCatalog();
		} catch {}
		const catalog = getCatalog();
		const byAlias = findSongByAlias(catalog, params.id);
		const song = getSong(params.id);
		if (byAlias && songKey(byAlias.track) !== params.id) throw redirect({
			to: "/$alias",
			params: { alias: params.id },
			replace: true
		});
		if (!song) return;
		const canonical = songKey(song.track);
		if (params.id !== canonical) throw redirect({
			to: "/player/$id",
			params: { id: canonical },
			replace: true
		});
	},
	head: ({ params }) => {
		const song = getSong(params.id);
		if (!song || song.locked) return { meta: [{ title: "Locked song · Radio" }] };
		return { meta: [{ title: `${song.track.title} · Radio` }] };
	}
});
var Route$7 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var MAX_BYTES = 83886080;
var Route$6 = createFileRoute("/api/desk/upload")({ server: { handlers: { POST: async ({ request }) => {
	try {
		assertSameSiteRequest();
		const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || void 0;
		const user = await requireAdmin(bearer);
		if (!r2Configured()) return Response.json({ error: "R2 keys are not set" }, { status: 400 });
		const form = await request.formData();
		const slug = String(form.get("slug") || "").trim();
		const replaceId = String(form.get("trackId") || "").trim();
		const file = form.get("file");
		if (!slug || !(file instanceof File)) return Response.json({ error: "Need a station slug and a file" }, { status: 400 });
		if (file.size > MAX_BYTES) return Response.json({ error: "File is larger than 80 MB" }, { status: 400 });
		const name = sanitizeUploadName(file.name);
		if (!/\.(mp3|wav|flac|m4a|ogg|aac)$/i.test(name)) return Response.json({ error: "Audio only (mp3, wav, flac, m4a, ogg, aac)" }, { status: 400 });
		const key = `${defaultPrefixForSlug(slug)}${replaceId ? `${replaceId}-` : ""}${name}`;
		const bytes = new Uint8Array(await file.arrayBuffer());
		const object = await putR2Object(key, bytes, file.type || "audio/mpeg");
		const title = String(form.get("title") || "").trim() || name.replace(/\.[^.]+$/, "");
		const coverUrl = String(form.get("coverUrl") || "").trim() || void 0;
		const edit = replaceId ? await patchTrack(user, {
			channelSlug: slug,
			trackId: replaceId,
			audioUrl: object.url,
			coverUrl
		}) : await addTrack(user, {
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
var IMAGE = /\.(jpe?g|png|webp|gif|avif|heic|heif)$/i;
var VIDEO = /\.(mp4|webm|mov|m4v)$/i;
var MIME_EXT = {
	"image/jpeg": "jpg",
	"image/jpg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
	"image/gif": "gif",
	"image/avif": "avif",
	"image/heic": "heic",
	"image/heif": "heic",
	"image/heic-sequence": "heic",
	"video/mp4": "mp4",
	"video/webm": "webm",
	"video/quicktime": "mov",
	"video/x-m4v": "m4v"
};
function artMeta(file) {
	const type = (file.type || "").toLowerCase();
	let name = sanitizeUploadName(file.name);
	if (name === "track.mp3" || !/\.[A-Za-z0-9]+$/.test(name)) {
		const ext = MIME_EXT[type];
		name = ext ? `art.${ext}` : name;
	}
	const video = VIDEO.test(name) || type.startsWith("video/");
	const image = IMAGE.test(name) || type.startsWith("image/");
	return {
		name,
		video,
		image,
		type: type || (video ? "video/mp4" : image ? "image/jpeg" : type)
	};
}
var Route$5 = createFileRoute("/api/desk/upload-art")({ server: { handlers: { POST: async ({ request }) => {
	try {
		assertSameSiteRequest();
		const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || void 0;
		const user = await requireAdmin(bearer);
		if (!r2Configured()) return Response.json({ error: "R2 keys are not set" }, { status: 400 });
		const form = await request.formData();
		const slug = String(form.get("slug") || "").trim();
		const trackId = String(form.get("trackId") || "").trim();
		const file = form.get("file");
		if (!slug || !(file instanceof File)) return Response.json({ error: "Need a station slug and a file" }, { status: 400 });
		const meta = artMeta(file);
		if (/\.(heic|heif)$/i.test(meta.name) || meta.type.includes("heic") || meta.type.includes("heif")) return Response.json({ error: "Use Photo — iPhone HEIC is converted on the phone before upload" }, { status: 400 });
		if (!meta.video && !meta.image) return Response.json({ error: "Art only (photo or a short mp4 / mov)" }, { status: 400 });
		if (meta.video && file.size > 25165824) return Response.json({ error: `Keep looping videos under ${Math.round(MEDIA_MAX_VIDEO / 1048576)} MB` }, { status: 400 });
		if (meta.image && file.size > 2097152) return Response.json({ error: "Keep stills under 2 MB — the phone picker shrinks them first" }, { status: 400 });
		const key = `${trackId ? `radio/art/${slug}/${trackId}` : `radio/art/${slug}`}/${Date.now()}-${meta.name}`;
		const bytes = new Uint8Array(await file.arrayBuffer());
		const object = await putR2Object(key, bytes, meta.type);
		if (trackId) await patchTrack(user, {
			channelSlug: slug,
			trackId,
			coverUrl: object.url
		});
		else if (meta.video) await upsertStation(user, {
			slug,
			animationUrl: object.url,
			videoUrl: object.url
		});
		else await upsertStation(user, {
			slug,
			cover: object.url
		});
		const tracks = await listEdits();
		const stations = await listStationEdits();
		return Response.json({
			ok: true,
			object,
			kind: meta.video ? "video" : "image",
			tracks,
			stations
		});
	} catch (error) {
		const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 500;
		return Response.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: status || 500 });
	}
} } } });
var Route$4 = createFileRoute("/api/media/download")({ server: { handlers: { GET: async ({ request }) => {
	const id = new URL(request.url).searchParams.get("id")?.trim() || "";
	if (!id) return Response.json({ error: "Missing song" }, { status: 400 });
	let catalog = getSeedCatalog();
	try {
		catalog = applyCatalogEdits(getSeedCatalog(), await listEdits(), await listStationEdits());
	} catch {}
	let hit = null;
	for (const channel of catalog.channels) {
		const track = channel.tracks.find((item) => item.id === id && item.enabled !== false);
		if (track?.audioUrl) {
			hit = {
				track,
				channel
			};
			break;
		}
	}
	if (!hit) return Response.json({ error: "Song not found" }, { status: 404 });
	if (isAdultTrack(hit.track) && !isChannelNsfw(hit.channel)) {
		if (!await resolveRadioUser()) return Response.json({ error: "Sign in to download this song" }, { status: 401 });
	}
	const src = mediaUrl(hit.track.audioUrl);
	if (!src) return Response.json({ error: "No file" }, { status: 404 });
	return Response.redirect(src, 302);
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
var IndexRoute = Route$20.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$21
});
var AliasRoute = Route$19.update({
	id: "/$alias",
	path: "/$alias",
	getParentRoute: () => Route$21
});
var AboutRoute = Route$18.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => Route$21
});
var DeskRoute = Route$17.update({
	id: "/desk",
	path: "/desk",
	getParentRoute: () => Route$21
});
var ExperiencesRoute = Route$16.update({
	id: "/experiences",
	path: "/experiences",
	getParentRoute: () => Route$21
});
var LibraryRoute = Route$15.update({
	id: "/library",
	path: "/library",
	getParentRoute: () => Route$21
});
var LoginRoute = Route$14.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$21
});
var LogoutRoute = Route$13.update({
	id: "/logout",
	path: "/logout",
	getParentRoute: () => Route$21
});
var ChannelSlugRoute = Route$12.update({
	id: "/channel/$slug",
	path: "/channel/$slug",
	getParentRoute: () => Route$21
});
var ExperiencesIndexRoute = Route$11.update({
	id: "/",
	path: "/",
	getParentRoute: () => ExperiencesRoute
});
var ExperiencesSlugRoute = Route$10.update({
	id: "/$slug",
	path: "/$slug",
	getParentRoute: () => ExperiencesRoute
});
var PlayerIndexRoute = Route$9.update({
	id: "/player/",
	path: "/player/",
	getParentRoute: () => Route$21
});
var PlayerIdRoute = Route$8.update({
	id: "/player/$id",
	path: "/player/$id",
	getParentRoute: () => Route$21
});
var ApiAuthSplatRoute = Route$7.update({
	id: "/api/auth/$",
	path: "/api/auth/$",
	getParentRoute: () => Route$21
});
var ApiDeskUploadRoute = Route$6.update({
	id: "/api/desk/upload",
	path: "/api/desk/upload",
	getParentRoute: () => Route$21
});
var ApiDeskUploadArtRoute = Route$5.update({
	id: "/api/desk/upload-art",
	path: "/api/desk/upload-art",
	getParentRoute: () => Route$21
});
var ApiMediaDownloadRoute = Route$4.update({
	id: "/api/media/download",
	path: "/api/media/download",
	getParentRoute: () => Route$21
});
var ApiSsoConsumeRoute = Route$3.update({
	id: "/api/sso/consume",
	path: "/api/sso/consume",
	getParentRoute: () => Route$21
});
var ApiSsoLoginRoute = Route$2.update({
	id: "/api/sso/login",
	path: "/api/sso/login",
	getParentRoute: () => Route$21
});
var ApiSsoLogoutRoute = Route$1.update({
	id: "/api/sso/logout",
	path: "/api/sso/logout",
	getParentRoute: () => Route$21
});
var ApiSsoMeRoute = Route.update({
	id: "/api/sso/me",
	path: "/api/sso/me",
	getParentRoute: () => Route$21
});
var ExperiencesRouteChildren = {
	ExperiencesSlugRoute,
	ExperiencesIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AliasRoute,
	AboutRoute,
	DeskRoute,
	ExperiencesRoute: ExperiencesRoute._addFileChildren(ExperiencesRouteChildren),
	LibraryRoute,
	LoginRoute,
	LogoutRoute,
	ChannelSlugRoute,
	PlayerIdRoute,
	PlayerIndexRoute,
	ApiAuthSplatRoute,
	ApiDeskUploadRoute,
	ApiDeskUploadArtRoute,
	ApiMediaDownloadRoute,
	ApiSsoConsumeRoute,
	ApiSsoLoginRoute,
	ApiSsoLogoutRoute,
	ApiSsoMeRoute
};
var routeTree = Route$21._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { reorderStationTracks as $, addStationTrack as A, importR2Tracks as B, listGlaumWords as C, useRadioUser as D, ssoLoginHref as E, dismissReviewItemFn as F, mergeStationCuts as G, listReviewQueue as H, dissolveStationCut as I, patchStationTrack as J, mintDeskUpload as K, getRadioSession as L, deleteR2Object as M, deleteStationFile as N, ensureLiveCatalog as O, desk_api_exports as P, renameStationFile as Q, hideStationTrack as R, hideGlaumWordFn as S, searchDial as T, listStationR2 as U, listCutSkips as V, mergeStationCutClusters as W, placeStationTrack as X, pingServices as Y, rehomeReviewItemFn as Z, CoverArt as _, Route$12 as a, unallocateStationTrack as at, addAdminGlaumWordFn as b, UnallocateControl as c, ShareLink as d, restoreReviewItemFn as et, MarqueeTitle as f, PhoneArtPicker as g, prepareArtFile as h, Route$10 as i, skipSimilarCuts as it, completeDeskUpload as j, live_catalog_exports as k, TrackActions as l, directDeskUpload as m, Route$8 as n, saveStation as nt, Route$19 as o, unmergeStationCut as ot, HeroArtSheet as p, moveR2Object as q, Route$9 as r, setFeaturedRail as rt, Route$20 as s, router_exports as t, restoreStationTrack as tt, ShuffleToggle as u, AdminRename as v, downloadName as w, addGuestGlaumWordFn as x, RenameCutForm as y, hideStationTracks as z };
