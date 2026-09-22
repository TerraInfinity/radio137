import { n as createMiddleware, r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desk-api-DSDDuLLL.js
var radioSessionMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
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
var getRadioSession_createServerFn_handler = createServerRpc({
	id: "d9e89e6e17ea4381b3ec922098d3fcb3e864b4b3b07789c439e701ed259ef683",
	name: "getRadioSession",
	filename: "src/lib/desk-api.ts"
}, (opts) => getRadioSession.__executeServer(opts));
var getRadioSession = createServerFn({ method: "GET" }).middleware([radioSessionMiddleware]).handler(getRadioSession_createServerFn_handler, async ({ context }) => ({
	user: context.user,
	r2Configured: context.r2Configured,
	lamps: context.user?.isAdmin ? context.lamps : []
}));
var listCatalogEdits_createServerFn_handler = createServerRpc({
	id: "ce752a9c60416a0748de8ae86a006017f54ced857f2581ba1a9f7cfcce8bb3a9",
	name: "listCatalogEdits",
	filename: "src/lib/desk-api.ts"
}, (opts) => listCatalogEdits.__executeServer(opts));
var listCatalogEdits = createServerFn({ method: "GET" }).handler(listCatalogEdits_createServerFn_handler, async () => {
	const now = Date.now();
	if (catalogEditCache && now - catalogEditCache.at < 2e4) return catalogEditCache.payload;
	const { listEdits, listStationEdits } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	const payload = {
		tracks: await listEdits(),
		stations: await listStationEdits()
	};
	catalogEditCache = {
		at: now,
		payload
	};
	return payload;
});
var trackRef = object({
	channelSlug: string().min(1),
	trackId: string().min(1),
	audioUrl: string().optional()
});
var catalogEditCache = null;
async function snapshot() {
	catalogEditCache = null;
	const { listEdits, listStationEdits } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	return {
		tracks: await listEdits(),
		stations: await listStationEdits()
	};
}
var hideStationTrack_createServerFn_handler = createServerRpc({
	id: "a0f574ca851bffce43b4e3ba655b29babab6d5b0703b3873a41409a03e7b9a6a",
	name: "hideStationTrack",
	filename: "src/lib/desk-api.ts"
}, (opts) => hideStationTrack.__executeServer(opts));
var hideStationTrack = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => trackRef.parse(input)).handler(hideStationTrack_createServerFn_handler, async ({ context, data }) => {
	const { hideTrack } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	return {
		edit: await hideTrack(context.user, data.channelSlug, data.trackId, data.audioUrl),
		...await snapshot()
	};
});
var hideStationTracks_createServerFn_handler = createServerRpc({
	id: "f2dace1869b4b93bdcb91d67211a80767c66904df25ea5f8e992e05d96283a2a",
	name: "hideStationTracks",
	filename: "src/lib/desk-api.ts"
}, (opts) => hideStationTracks.__executeServer(opts));
var hideStationTracks = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	channelSlug: string().min(1),
	tracks: array(trackRef.extend({ audioUrl: string().optional() })).min(1).max(80)
}).parse(input)).handler(hideStationTracks_createServerFn_handler, async ({ context, data }) => {
	const { hideTrack } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	for (const item of data.tracks) await hideTrack(context.user, data.channelSlug, item.trackId, item.audioUrl);
	return snapshot();
});
var unallocateStationTrack_createServerFn_handler = createServerRpc({
	id: "90fd962caebe299f7527d82a153d8a20a3717fbdcf226f5c3a6f12c720d8f4fd",
	name: "unallocateStationTrack",
	filename: "src/lib/desk-api.ts"
}, (opts) => unallocateStationTrack.__executeServer(opts));
var unallocateStationTrack = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => trackRef.extend({
	title: string().optional(),
	artist: string().optional(),
	coverUrl: string().optional()
}).parse(input)).handler(unallocateStationTrack_createServerFn_handler, async ({ context, data }) => {
	const { unallocateTrack } = await import("./review.server-Dl4_mnUk.mjs");
	return {
		edit: await unallocateTrack(context.user, data),
		...await snapshot()
	};
});
var listReviewQueue_createServerFn_handler = createServerRpc({
	id: "6394d77b68adc7de38f7d5b92074423b52e5b7be42a911ba3de73f04918268ac",
	name: "listReviewQueue",
	filename: "src/lib/desk-api.ts"
}, (opts) => listReviewQueue.__executeServer(opts));
var listReviewQueue = createServerFn({ method: "GET" }).middleware([adminMiddleware]).handler(listReviewQueue_createServerFn_handler, async () => {
	const { listReviewQueue: list, countOpenReview } = await import("./review.server-Dl4_mnUk.mjs");
	return {
		items: await list("open"),
		open: await countOpenReview()
	};
});
var restoreReviewItemFn_createServerFn_handler = createServerRpc({
	id: "595cc028164bced834212e5cbe6c60a901bce2ed87db2abd1ed37525bb3f50e3",
	name: "restoreReviewItemFn",
	filename: "src/lib/desk-api.ts"
}, (opts) => restoreReviewItemFn.__executeServer(opts));
var restoreReviewItemFn = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({ id: number().int().positive() }).parse(input)).handler(restoreReviewItemFn_createServerFn_handler, async ({ context, data }) => {
	const { restoreReviewItem } = await import("./review.server-Dl4_mnUk.mjs");
	await restoreReviewItem(context.user, data.id);
	return snapshot();
});
var dismissReviewItemFn_createServerFn_handler = createServerRpc({
	id: "2adf9a5e205af9c1d15d19e63fe2f106c7f5a6330edf5fc760537317911ed9b7",
	name: "dismissReviewItemFn",
	filename: "src/lib/desk-api.ts"
}, (opts) => dismissReviewItemFn.__executeServer(opts));
var dismissReviewItemFn = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	id: number().int().positive(),
	status: _enum([
		"dismissed",
		"merged",
		"rehomed"
	]).optional()
}).parse(input)).handler(dismissReviewItemFn_createServerFn_handler, async ({ data }) => {
	const { setReviewStatus } = await import("./review.server-Dl4_mnUk.mjs");
	await setReviewStatus(data.id, data.status ?? "dismissed");
	return { ok: true };
});
var rehomeReviewItemFn_createServerFn_handler = createServerRpc({
	id: "789391bd697359317c296e3f37247ff55aa67af199a6b74ba94c7d4f8decd163",
	name: "rehomeReviewItemFn",
	filename: "src/lib/desk-api.ts"
}, (opts) => rehomeReviewItemFn.__executeServer(opts));
var rehomeReviewItemFn = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	id: number().int().positive(),
	toSlug: string().min(1),
	mode: _enum(["copy", "move"]).optional()
}).parse(input)).handler(rehomeReviewItemFn_createServerFn_handler, async ({ context, data }) => {
	const { getReviewItem, setReviewStatus } = await import("./review.server-Dl4_mnUk.mjs");
	const item = await getReviewItem(data.id);
	if (!item) throw new Error("Review item missing");
	if (!item.audioUrl) throw new Error("No audio URL on this review item");
	const { getSeedCatalog } = await import("./catalog-DmckmNNR.mjs").then((n) => n.t);
	const { applyCatalogEdits } = await import("./catalog-edits-B7ACZ19x.mjs").then((n) => n.n);
	const { listEdits, listStationEdits, addTrack } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	const dest = applyCatalogEdits(getSeedCatalog(), await listEdits(), await listStationEdits()).channels.find((channel) => channel.slug === data.toSlug);
	if (!dest) throw new Error("Station not found");
	if (!dest.tracks.some((track) => track.enabled !== false && track.audioUrl === item.audioUrl)) await addTrack(context.user, {
		channelSlug: data.toSlug,
		trackId: item.trackId,
		title: item.title || "Untitled",
		artist: item.artist || void 0,
		audioUrl: item.audioUrl,
		coverUrl: item.coverUrl || void 0,
		r2Key: item.r2Key || void 0
	});
	await setReviewStatus(data.id, "rehomed");
	return snapshot();
});
var restoreStationTrack_createServerFn_handler = createServerRpc({
	id: "e4f922a88d85017fd6365e5b5442c3930c1905e0e4755d162c604c57f6992e91",
	name: "restoreStationTrack",
	filename: "src/lib/desk-api.ts"
}, (opts) => restoreStationTrack.__executeServer(opts));
var restoreStationTrack = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => trackRef.parse(input)).handler(restoreStationTrack_createServerFn_handler, async ({ context, data }) => {
	const { restoreTrack } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	return {
		edit: await restoreTrack(context.user, data.channelSlug, data.trackId),
		...await snapshot()
	};
});
var addStationTrack_createServerFn_handler = createServerRpc({
	id: "08659e0d0d60384b044868cdfd6b5d78aac7aba6ca3e76a712a57aac1b061266",
	name: "addStationTrack",
	filename: "src/lib/desk-api.ts"
}, (opts) => addStationTrack.__executeServer(opts));
var addStationTrack = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	channelSlug: string().min(1),
	title: string().min(1),
	artist: string().optional(),
	durationSec: number().optional(),
	audioUrl: string().min(8),
	coverUrl: string().optional(),
	r2Key: string().optional()
}).parse(input)).handler(addStationTrack_createServerFn_handler, async ({ context, data }) => {
	const { addTrack } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	return {
		edit: await addTrack(context.user, data),
		...await snapshot()
	};
});
var patchStationTrack_createServerFn_handler = createServerRpc({
	id: "da98c26cacb974e0e1405aa77e85814e3a2aec5b3a4e0b9e2e42c4119a20f587",
	name: "patchStationTrack",
	filename: "src/lib/desk-api.ts"
}, (opts) => patchStationTrack.__executeServer(opts));
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
}).parse(input)).handler(patchStationTrack_createServerFn_handler, async ({ context, data }) => {
	const { patchTrack } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	return {
		edit: await patchTrack(context.user, data),
		...await snapshot()
	};
});
var renameStationFile_createServerFn_handler = createServerRpc({
	id: "800fe0eb6f64b76196232f5cc031243f8f0f09e2cdca82e2c8251647814fe247",
	name: "renameStationFile",
	filename: "src/lib/desk-api.ts"
}, (opts) => renameStationFile.__executeServer(opts));
var renameStationFile = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	channelSlug: string().min(1),
	trackId: string().min(1),
	toKey: string().min(1)
}).parse(input)).handler(renameStationFile_createServerFn_handler, async ({ context, data }) => {
	const { renameTrackFile } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	return {
		object: await renameTrackFile(context.user, data),
		...await snapshot()
	};
});
var reorderStationTracks_createServerFn_handler = createServerRpc({
	id: "86faca5244608013bd67686cf60e5d0459a82e02de3fa9da95267f70f32d0bd4",
	name: "reorderStationTracks",
	filename: "src/lib/desk-api.ts"
}, (opts) => reorderStationTracks.__executeServer(opts));
var reorderStationTracks = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	channelSlug: string().min(1),
	trackIds: array(string().min(1)).min(1)
}).parse(input)).handler(reorderStationTracks_createServerFn_handler, async ({ context, data }) => {
	const { reorderTracks } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	await reorderTracks(context.user, data.channelSlug, data.trackIds);
	return snapshot();
});
var placeStationTrack_createServerFn_handler = createServerRpc({
	id: "d2882a2b429e6c16019d84a0522a03cc982ad7b92d32eff9362b05d04d93cd1e",
	name: "placeStationTrack",
	filename: "src/lib/desk-api.ts"
}, (opts) => placeStationTrack.__executeServer(opts));
var placeStationTrack = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	fromSlug: string().min(1),
	trackId: string().min(1),
	toSlug: string().min(1),
	mode: _enum(["copy", "move"])
}).parse(input)).handler(placeStationTrack_createServerFn_handler, async ({ context, data }) => {
	const { placeTrack } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	await placeTrack(context.user, data);
	return snapshot();
});
var setFeaturedRail_createServerFn_handler = createServerRpc({
	id: "144c9e43196ca6bf0a596c59ad5c3095bc07d2aa8f85cd097d593121f0a2ec34",
	name: "setFeaturedRail",
	filename: "src/lib/desk-api.ts"
}, (opts) => setFeaturedRail.__executeServer(opts));
var setFeaturedRail = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({ slugs: array(string()) }).parse(input)).handler(setFeaturedRail_createServerFn_handler, async ({ context, data }) => {
	const { setFeaturedOrder } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	await setFeaturedOrder(context.user, data.slugs);
	return snapshot();
});
var deleteStationFile_createServerFn_handler = createServerRpc({
	id: "d9c9172f364a7e534585135887b704f2b3b59298313c4af8e00a092debec0967",
	name: "deleteStationFile",
	filename: "src/lib/desk-api.ts"
}, (opts) => deleteStationFile.__executeServer(opts));
var deleteStationFile = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	channelSlug: string().min(1),
	trackId: string().min(1),
	audioUrl: string().min(1),
	r2Key: string().optional(),
	alsoDeleteR2: boolean()
}).parse(input)).handler(deleteStationFile_createServerFn_handler, async ({ context, data }) => {
	const { r2KeyFromAudioUrl } = await import("./file-path-C0hfvhIH.mjs").then((n) => n.a).then((n) => n.a);
	const key = data.r2Key || r2KeyFromAudioUrl(data.audioUrl);
	if (data.alsoDeleteR2) {
		if (!key) throw new Error("No R2 key for this file");
		const { deleteR2Key } = await import("./r2.server-BMj6CRvu.mjs").then((n) => n.i).then((n) => n.i);
		await deleteR2Key(key);
	}
	const { markDeletedR2, hideTrack } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	return {
		edit: data.alsoDeleteR2 && key ? await markDeletedR2(context.user, data.channelSlug, data.trackId, data.audioUrl, key) : await hideTrack(context.user, data.channelSlug, data.trackId, data.audioUrl),
		...await snapshot(),
		deletedR2: Boolean(data.alsoDeleteR2 && key)
	};
});
var saveStation_createServerFn_handler = createServerRpc({
	id: "cc74c64dc2667ff889d7baf82b14c6704c54a443ca298f5c60de9cf63700e054",
	name: "saveStation",
	filename: "src/lib/desk-api.ts"
}, (opts) => saveStation.__executeServer(opts));
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
}).parse(input)).handler(saveStation_createServerFn_handler, async ({ context, data }) => {
	const { upsertStation } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	return {
		station: await upsertStation(context.user, {
			...data,
			mode: data.kind
		}),
		...await snapshot()
	};
});
var listStationR2_createServerFn_handler = createServerRpc({
	id: "df9d243e1b860c4496bba86a34cad4e87c50b6b7b199b0acf683fa5bc37e5c1f",
	name: "listStationR2",
	filename: "src/lib/desk-api.ts"
}, (opts) => listStationR2.__executeServer(opts));
var listStationR2 = createServerFn({ method: "GET" }).middleware([adminMiddleware]).validator((input) => object({
	prefix: string().optional(),
	slug: string().optional(),
	maxKeys: number().int().positive().optional()
}).parse(input)).handler(listStationR2_createServerFn_handler, async ({ data }) => {
	const { listR2Prefix, defaultPrefixForSlug, r2PublicBase, r2Configured } = await import("./r2.server-BMj6CRvu.mjs").then((n) => n.i).then((n) => n.i);
	if (!r2Configured()) return {
		ok: false,
		prefix: data.prefix || "",
		base: "",
		objects: [],
		error: "R2 keys are not set"
	};
	try {
		const prefix = data.prefix || (data.slug ? defaultPrefixForSlug(data.slug) : "radio/");
		const objects = await listR2Prefix(prefix, data.maxKeys ?? 2500);
		return {
			ok: true,
			prefix,
			base: r2PublicBase(),
			objects
		};
	} catch (error) {
		return {
			ok: false,
			prefix: data.prefix || "radio/",
			base: "",
			objects: [],
			error: error instanceof Error ? error.message : "R2 list failed"
		};
	}
});
var importR2Tracks_createServerFn_handler = createServerRpc({
	id: "92be32e04773b72416ff5451aa424abf58edefa82028323d6a5f1d02f061a0bb",
	name: "importR2Tracks",
	filename: "src/lib/desk-api.ts"
}, (opts) => importR2Tracks.__executeServer(opts));
var importR2Tracks = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	channelSlugs: array(string().min(1)).min(1),
	items: array(object({
		key: string().min(1),
		url: string().min(8),
		title: string().optional(),
		durationSec: number().optional()
	})).min(1)
}).parse(input)).handler(importR2Tracks_createServerFn_handler, async ({ context, data }) => {
	const { addTrack } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	const { getSeedCatalog } = await import("./catalog-DmckmNNR.mjs").then((n) => n.t);
	const { applyCatalogEdits } = await import("./catalog-edits-B7ACZ19x.mjs").then((n) => n.n);
	const { listEdits, listStationEdits } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	const { titleFromR2Key } = await import("./file-path-C0hfvhIH.mjs").then((n) => n.a).then((n) => n.a);
	const catalog = applyCatalogEdits(getSeedCatalog(), await listEdits(), await listStationEdits());
	let added = 0;
	let skipped = 0;
	for (const slug of data.channelSlugs) {
		const dest = catalog.channels.find((channel) => channel.slug === slug);
		if (!dest) throw new Error(`Station not found: ${slug}`);
		for (const item of data.items) try {
			await addTrack(context.user, {
				channelSlug: slug,
				title: (item.title || titleFromR2Key(item.key)).slice(0, 180),
				audioUrl: item.url,
				coverUrl: dest.cover,
				r2Key: item.key,
				durationSec: item.durationSec
			});
			added += 1;
		} catch (error) {
			const message = error instanceof Error ? error.message : "";
			if (/already on/i.test(message)) {
				skipped += 1;
				continue;
			}
			throw error;
		}
	}
	return {
		added,
		skipped,
		...await snapshot()
	};
});
var moveR2Object_createServerFn_handler = createServerRpc({
	id: "6419abad04b105db7e36894252b6619b53542483e9295a713c9ad8fd0458c6d0",
	name: "moveR2Object",
	filename: "src/lib/desk-api.ts"
}, (opts) => moveR2Object.__executeServer(opts));
var moveR2Object = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	from: string().min(1),
	to: string().min(1)
}).parse(input)).handler(moveR2Object_createServerFn_handler, async ({ data }) => {
	const { moveR2Key } = await import("./r2.server-BMj6CRvu.mjs").then((n) => n.i).then((n) => n.i);
	return {
		ok: true,
		object: await moveR2Key(data.from, data.to)
	};
});
var deleteR2Object_createServerFn_handler = createServerRpc({
	id: "b9c9fe0cca0befd3ae8bedbf69fee8d4a08b690b7d33de85aa2f47a155c3c7f0",
	name: "deleteR2Object",
	filename: "src/lib/desk-api.ts"
}, (opts) => deleteR2Object.__executeServer(opts));
var deleteR2Object = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({ key: string().min(1) }).parse(input)).handler(deleteR2Object_createServerFn_handler, async ({ data }) => {
	const { deleteR2Key } = await import("./r2.server-BMj6CRvu.mjs").then((n) => n.i).then((n) => n.i);
	await deleteR2Key(data.key);
	return { ok: true };
});
var listCutGroups_createServerFn_handler = createServerRpc({
	id: "82a76a214c21f04ee0c704c6bf2329e4b5b8a9152b58b7d4ab524b5d1dc64843",
	name: "listCutGroups",
	filename: "src/lib/desk-api.ts"
}, (opts) => listCutGroups.__executeServer(opts));
var listCutGroups = createServerFn({ method: "GET" }).handler(listCutGroups_createServerFn_handler, async () => {
	const { listCutGroups: list } = await import("./cuts.server-DljvaoBP.mjs");
	return { groups: await list() };
});
var mergeStationCuts_createServerFn_handler = createServerRpc({
	id: "d86c18414a468e5882fe82b035766d562e4179ae03a7965f0b06cb986a1cec7a",
	name: "mergeStationCuts",
	filename: "src/lib/desk-api.ts"
}, (opts) => mergeStationCuts.__executeServer(opts));
var mergeStationCuts = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	canonicalId: string().min(1),
	memberIds: array(string().min(1)).min(1)
}).parse(input)).handler(mergeStationCuts_createServerFn_handler, async ({ context, data }) => {
	const { mergeCuts } = await import("./cuts.server-DljvaoBP.mjs");
	return {
		groups: await mergeCuts(context.user, data.canonicalId, data.memberIds),
		...await snapshot()
	};
});
var mergeStationCutClusters_createServerFn_handler = createServerRpc({
	id: "4312dafe79054c46e754cd9b8607c11bb2607d5c3a3f8a59ff3aa0a9123febe4",
	name: "mergeStationCutClusters",
	filename: "src/lib/desk-api.ts"
}, (opts) => mergeStationCutClusters.__executeServer(opts));
var mergeStationCutClusters = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({ clusters: array(object({
	canonicalId: string().min(1),
	memberIds: array(string().min(1)).min(1)
})).min(1) }).parse(input)).handler(mergeStationCutClusters_createServerFn_handler, async ({ context, data }) => {
	const { mergeCutClusters } = await import("./cuts.server-DljvaoBP.mjs");
	return {
		groups: await mergeCutClusters(context.user, data.clusters),
		...await snapshot()
	};
});
var unmergeStationCut_createServerFn_handler = createServerRpc({
	id: "7e0e63ee3f7f7eca955516fee0d48f5605e9338c3859b4a9d175aeb5f96c54bd",
	name: "unmergeStationCut",
	filename: "src/lib/desk-api.ts"
}, (opts) => unmergeStationCut.__executeServer(opts));
var unmergeStationCut = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({ memberId: string().min(1) }).parse(input)).handler(unmergeStationCut_createServerFn_handler, async ({ context, data }) => {
	const { unmergeCut } = await import("./cuts.server-DljvaoBP.mjs");
	return { groups: await unmergeCut(context.user, data.memberId) };
});
var dissolveStationCut_createServerFn_handler = createServerRpc({
	id: "ef8d1ed7626b299fba3a7d71b3c1354edca25d308009b62e5bdb0ce70327bb2d",
	name: "dissolveStationCut",
	filename: "src/lib/desk-api.ts"
}, (opts) => dissolveStationCut.__executeServer(opts));
var dissolveStationCut = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({ canonicalId: string().min(1) }).parse(input)).handler(dissolveStationCut_createServerFn_handler, async ({ data }) => {
	const { dissolveCut } = await import("./cuts.server-DljvaoBP.mjs");
	return { groups: await dissolveCut(data.canonicalId) };
});
var listCutSkips_createServerFn_handler = createServerRpc({
	id: "f9a90fefbce8c7877d112d09bb33465d0ac179e6127dd5c0e438fa0d59f78fd6",
	name: "listCutSkips",
	filename: "src/lib/desk-api.ts"
}, (opts) => listCutSkips.__executeServer(opts));
var listCutSkips = createServerFn({ method: "GET" }).middleware([adminMiddleware]).handler(listCutSkips_createServerFn_handler, async () => {
	const { listCutSkips: list } = await import("./cuts.server-DljvaoBP.mjs");
	return { keys: await list() };
});
var skipSimilarCuts_createServerFn_handler = createServerRpc({
	id: "1c7e2a4bf243ecec1748ddd3254f51bf34a1be3c8c0aaded4b4d41b322685c35",
	name: "skipSimilarCuts",
	filename: "src/lib/desk-api.ts"
}, (opts) => skipSimilarCuts.__executeServer(opts));
var skipSimilarCuts = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({ memberIds: array(string().min(1)).min(2) }).parse(input)).handler(skipSimilarCuts_createServerFn_handler, async ({ context, data }) => {
	const { skipCutPairs } = await import("./cuts.server-DljvaoBP.mjs");
	return { keys: await skipCutPairs(context.user, data.memberIds) };
});
var pingServices_createServerFn_handler = createServerRpc({
	id: "ad177eb156e0e962cf763c344be8866b84009abc7a6c31f2269e1048d8e105ad",
	name: "pingServices",
	filename: "src/lib/desk-api.ts"
}, (opts) => pingServices.__executeServer(opts));
var pingServices = createServerFn({ method: "GET" }).middleware([adminMiddleware]).handler(pingServices_createServerFn_handler, async () => {
	const { hubOrigin } = await import("./sso.server-NSJ3vLzw.mjs").then((n) => n.p);
	const origin = hubOrigin();
	let hubStatus = 0;
	let hubOk = false;
	let hubNote = "";
	try {
		const res = await fetch(origin, {
			method: "GET",
			redirect: "manual"
		});
		hubStatus = res.status;
		hubOk = res.status > 0 && res.status < 500;
		hubNote = res.status === 0 ? "no response" : `HTTP ${res.status}`;
	} catch (error) {
		hubOk = false;
		hubNote = error instanceof Error ? error.message : "hub unreachable";
	}
	const { r2Configured, listR2Prefix } = await import("./r2.server-BMj6CRvu.mjs").then((n) => n.i).then((n) => n.i);
	let r2Ok = false;
	let r2Note = "keys missing";
	let r2Sample = 0;
	if (r2Configured()) try {
		const objects = await listR2Prefix("radio/", 8);
		r2Ok = true;
		r2Sample = objects.length;
		r2Note = `${objects.length} object${objects.length === 1 ? "" : "s"} under radio/`;
	} catch (error) {
		r2Note = error instanceof Error ? error.message : "R2 list failed";
	}
	return {
		hub: {
			origin,
			status: hubStatus,
			ok: hubOk,
			note: hubNote
		},
		r2: {
			ok: r2Ok,
			note: r2Note,
			sample: r2Sample
		}
	};
});
var AUDIO_NAME = /\.(mp3|wav|flac|m4a|ogg|aac)$/i;
var ART_NAME = /\.(jpe?g|png|webp|gif|avif|mp4|webm|mov|m4v)$/i;
var AUDIO_MAX = 83886080;
var mintDeskUpload_createServerFn_handler = createServerRpc({
	id: "be4f0c5d004d01180e478be884f3b7aa2de4cdbc95ddf46f1ff3a37c72cbe9c1",
	name: "mintDeskUpload",
	filename: "src/lib/desk-api.ts"
}, (opts) => mintDeskUpload.__executeServer(opts));
var mintDeskUpload = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	kind: _enum(["audio", "art"]),
	slug: string().min(1),
	filename: string().min(1),
	contentType: string().optional(),
	size: number().int().nonnegative().optional(),
	trackId: string().optional()
}).parse(input)).handler(mintDeskUpload_createServerFn_handler, async ({ data }) => {
	const { defaultPrefixForSlug, presignR2Put, r2Configured, sanitizeUploadName } = await import("./r2.server-BMj6CRvu.mjs").then((n) => n.i).then((n) => n.i);
	const { MEDIA_MAX_IMAGE, MEDIA_MAX_VIDEO } = await import("./media-ChlF6fRc.mjs").then((n) => n.s).then((n) => n.c);
	if (!r2Configured()) throw new Error("R2 keys are not set");
	const name = sanitizeUploadName(data.filename);
	const type = (data.contentType || "").toLowerCase();
	const size = data.size ?? 0;
	if (data.kind === "audio") {
		if (!AUDIO_NAME.test(name)) throw new Error("Audio only (mp3, wav, flac, m4a, ogg, aac)");
		if (size > AUDIO_MAX) throw new Error("File is larger than 80 MB");
	} else {
		if (!ART_NAME.test(name) && !type.startsWith("image/") && !type.startsWith("video/")) throw new Error("Art only (photo or a short mp4 / webm / mov)");
		const video = /\.(mp4|webm|mov|m4v)$/i.test(name) || type.startsWith("video/");
		if (video && size > MEDIA_MAX_VIDEO) throw new Error(`Keep looping videos under ${Math.round(MEDIA_MAX_VIDEO / 1048576)} MB`);
		if (!video && size > MEDIA_MAX_IMAGE) throw new Error("Keep stills under 2 MB — the picker shrinks them first");
	}
	const key = `${data.kind === "audio" ? `${defaultPrefixForSlug(data.slug)}${data.trackId ? `${data.trackId}-` : ""}` : data.trackId ? `radio/art/${data.slug}/${data.trackId}` : `radio/art/${data.slug}`}${data.kind === "audio" ? name : `/${Date.now()}-${name}`}`.replace(/\/+/g, "/");
	const contentType = type || (data.kind === "audio" ? "audio/mpeg" : "application/octet-stream");
	const signed = await presignR2Put(key, contentType);
	return {
		putUrl: signed.putUrl,
		key: signed.key,
		publicUrl: signed.url,
		contentType
	};
});
var completeDeskUpload_createServerFn_handler = createServerRpc({
	id: "1f9b8aaec0e2a3610687481c510ceeb3159aa9d36fbbc8714870d1ad5c4128a6",
	name: "completeDeskUpload",
	filename: "src/lib/desk-api.ts"
}, (opts) => completeDeskUpload.__executeServer(opts));
var completeDeskUpload = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => object({
	kind: _enum(["audio", "art"]),
	slug: string().min(1),
	key: string().min(1),
	title: string().optional(),
	coverUrl: string().optional(),
	trackId: string().optional(),
	contentType: string().optional(),
	durationSec: number().optional()
}).parse(input)).handler(completeDeskUpload_createServerFn_handler, async ({ context, data }) => {
	const { publicUrlForKey } = await import("./r2.server-BMj6CRvu.mjs").then((n) => n.i).then((n) => n.i);
	const { addTrack, patchTrack, upsertStation } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	const key = data.key.replace(/^\/+/, "");
	const audioPrefix = `radio/${data.slug}/`;
	const artPrefix = `radio/art/${data.slug}/`;
	if (data.kind === "audio" && !key.startsWith(audioPrefix)) throw new Error("Key does not belong to this station");
	if (data.kind === "art" && !key.startsWith(artPrefix)) throw new Error("Key does not belong to this station");
	const url = publicUrlForKey(key);
	const video = /\.(mp4|webm|mov|m4v)$/i.test(key) || (data.contentType || "").startsWith("video/");
	if (data.kind === "audio") {
		const title = (data.title || "").trim() || key.split("/").pop()?.replace(/\.[^.]+$/, "") || "Untitled";
		const edit = data.trackId ? await patchTrack(context.user, {
			channelSlug: data.slug,
			trackId: data.trackId,
			audioUrl: url,
			coverUrl: data.coverUrl,
			durationSec: data.durationSec
		}) : await addTrack(context.user, {
			channelSlug: data.slug,
			title,
			audioUrl: url,
			coverUrl: data.coverUrl,
			r2Key: key,
			durationSec: data.durationSec
		});
		return {
			ok: true,
			object: {
				key,
				url
			},
			kind: "audio",
			edit,
			...await snapshot()
		};
	}
	if (data.trackId) await patchTrack(context.user, {
		channelSlug: data.slug,
		trackId: data.trackId,
		coverUrl: url
	});
	else if (video) await upsertStation(context.user, {
		slug: data.slug,
		animationUrl: url,
		videoUrl: url
	});
	else await upsertStation(context.user, {
		slug: data.slug,
		cover: url
	});
	return {
		ok: true,
		object: {
			key,
			url
		},
		kind: video ? "video" : "image",
		...await snapshot()
	};
});
//#endregion
export { addStationTrack_createServerFn_handler, completeDeskUpload_createServerFn_handler, deleteR2Object_createServerFn_handler, deleteStationFile_createServerFn_handler, dismissReviewItemFn_createServerFn_handler, dissolveStationCut_createServerFn_handler, getRadioSession_createServerFn_handler, hideStationTrack_createServerFn_handler, hideStationTracks_createServerFn_handler, importR2Tracks_createServerFn_handler, listCatalogEdits_createServerFn_handler, listCutGroups_createServerFn_handler, listCutSkips_createServerFn_handler, listReviewQueue_createServerFn_handler, listStationR2_createServerFn_handler, mergeStationCutClusters_createServerFn_handler, mergeStationCuts_createServerFn_handler, mintDeskUpload_createServerFn_handler, moveR2Object_createServerFn_handler, patchStationTrack_createServerFn_handler, pingServices_createServerFn_handler, placeStationTrack_createServerFn_handler, rehomeReviewItemFn_createServerFn_handler, renameStationFile_createServerFn_handler, reorderStationTracks_createServerFn_handler, restoreReviewItemFn_createServerFn_handler, restoreStationTrack_createServerFn_handler, saveStation_createServerFn_handler, setFeaturedRail_createServerFn_handler, skipSimilarCuts_createServerFn_handler, unallocateStationTrack_createServerFn_handler, unmergeStationCut_createServerFn_handler };
