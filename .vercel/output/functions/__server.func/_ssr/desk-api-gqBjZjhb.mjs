import { L as string, N as number, P as object, k as boolean } from "../_libs/@better-auth/core+[...].mjs";
import { i as TSS_SERVER_FUNCTION, n as createMiddleware, r as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desk-api-gqBjZjhb.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
var getRadioSession_createServerFn_handler = createServerRpc({
	id: "d9e89e6e17ea4381b3ec922098d3fcb3e864b4b3b07789c439e701ed259ef683",
	name: "getRadioSession",
	filename: "src/lib/desk-api.ts"
}, (opts) => getRadioSession.__executeServer(opts));
var getRadioSession = createServerFn({ method: "GET" }).middleware([radioSessionMiddleware]).handler(getRadioSession_createServerFn_handler, async ({ context }) => ({
	user: context.user,
	r2Configured: context.r2Configured
}));
var listCatalogEdits_createServerFn_handler = createServerRpc({
	id: "ce752a9c60416a0748de8ae86a006017f54ced857f2581ba1a9f7cfcce8bb3a9",
	name: "listCatalogEdits",
	filename: "src/lib/desk-api.ts"
}, (opts) => listCatalogEdits.__executeServer(opts));
var listCatalogEdits = createServerFn({ method: "GET" }).handler(listCatalogEdits_createServerFn_handler, async () => {
	const { listEdits } = await import("./catalog-edits.server-BA-vL_pw.mjs").then((n) => n.n);
	return listEdits();
});
var trackRef = object({
	channelSlug: string().min(1),
	trackId: string().min(1),
	audioUrl: string().optional()
});
var hideStationTrack_createServerFn_handler = createServerRpc({
	id: "a0f574ca851bffce43b4e3ba655b29babab6d5b0703b3873a41409a03e7b9a6a",
	name: "hideStationTrack",
	filename: "src/lib/desk-api.ts"
}, (opts) => hideStationTrack.__executeServer(opts));
var hideStationTrack = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => trackRef.parse(input)).handler(hideStationTrack_createServerFn_handler, async ({ context, data }) => {
	const { hideTrack } = await import("./catalog-edits.server-BA-vL_pw.mjs").then((n) => n.n);
	const edit = await hideTrack(context.user, data.channelSlug, data.trackId, data.audioUrl);
	const { listEdits } = await import("./catalog-edits.server-BA-vL_pw.mjs").then((n) => n.n);
	return {
		edit,
		edits: await listEdits()
	};
});
var restoreStationTrack_createServerFn_handler = createServerRpc({
	id: "e4f922a88d85017fd6365e5b5442c3930c1905e0e4755d162c604c57f6992e91",
	name: "restoreStationTrack",
	filename: "src/lib/desk-api.ts"
}, (opts) => restoreStationTrack.__executeServer(opts));
var restoreStationTrack = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => trackRef.parse(input)).handler(restoreStationTrack_createServerFn_handler, async ({ context, data }) => {
	const { restoreTrack } = await import("./catalog-edits.server-BA-vL_pw.mjs").then((n) => n.n);
	const edit = await restoreTrack(context.user, data.channelSlug, data.trackId);
	const { listEdits } = await import("./catalog-edits.server-BA-vL_pw.mjs").then((n) => n.n);
	return {
		edit,
		edits: await listEdits()
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
	const { addTrack } = await import("./catalog-edits.server-BA-vL_pw.mjs").then((n) => n.n);
	const edit = await addTrack(context.user, data);
	const { listEdits } = await import("./catalog-edits.server-BA-vL_pw.mjs").then((n) => n.n);
	return {
		edit,
		edits: await listEdits()
	};
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
	const { r2KeyFromAudioUrl } = await import("./file-path-B3HtxHuV.mjs").then((n) => n.n).then((n) => n.n);
	const key = data.r2Key || r2KeyFromAudioUrl(data.audioUrl);
	if (data.alsoDeleteR2) {
		if (!key) throw new Error("No R2 key for this file");
		const { deleteR2Key } = await import("./r2.server-YB-_jTkE.mjs").then((n) => n.i).then((n) => n.i);
		await deleteR2Key(key);
	}
	const { markDeletedR2, hideTrack } = await import("./catalog-edits.server-BA-vL_pw.mjs").then((n) => n.n);
	const edit = data.alsoDeleteR2 && key ? await markDeletedR2(context.user, data.channelSlug, data.trackId, data.audioUrl, key) : await hideTrack(context.user, data.channelSlug, data.trackId, data.audioUrl);
	const { listEdits } = await import("./catalog-edits.server-BA-vL_pw.mjs").then((n) => n.n);
	return {
		edit,
		edits: await listEdits(),
		deletedR2: Boolean(data.alsoDeleteR2 && key)
	};
});
var listStationR2_createServerFn_handler = createServerRpc({
	id: "df9d243e1b860c4496bba86a34cad4e87c50b6b7b199b0acf683fa5bc37e5c1f",
	name: "listStationR2",
	filename: "src/lib/desk-api.ts"
}, (opts) => listStationR2.__executeServer(opts));
var listStationR2 = createServerFn({ method: "GET" }).middleware([adminMiddleware]).validator((input) => object({ slug: string().min(1) }).parse(input)).handler(listStationR2_createServerFn_handler, async ({ data }) => {
	const { listR2Prefix, defaultPrefixForSlug, r2PublicBase } = await import("./r2.server-YB-_jTkE.mjs").then((n) => n.i).then((n) => n.i);
	try {
		const prefix = defaultPrefixForSlug(data.slug);
		const objects = await listR2Prefix(prefix);
		return {
			ok: true,
			prefix,
			base: r2PublicBase(),
			objects
		};
	} catch (error) {
		return {
			ok: false,
			prefix: `radio/${data.slug}/`,
			base: "",
			objects: [],
			error: error instanceof Error ? error.message : "R2 list failed"
		};
	}
});
//#endregion
export { addStationTrack_createServerFn_handler, deleteStationFile_createServerFn_handler, getRadioSession_createServerFn_handler, hideStationTrack_createServerFn_handler, listCatalogEdits_createServerFn_handler, listStationR2_createServerFn_handler, restoreStationTrack_createServerFn_handler };
