import { n as createMiddleware, r as createServerFn } from "./ssr.mjs";
import { A as boolean, F as object, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/social-api-LQ4WgPKx.js
var radioSessionMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-nKCa1E1y.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { resolveRadioUser } = await import("./sso.server-NSJ3vLzw.mjs").then((n) => n.p);
	return next({ context: { user: await resolveRadioUser(context.bearerToken) } });
});
var listStationChat_createServerFn_handler = createServerRpc({
	id: "1bad9c20212fb739ea13d7879e0b1c774851aade5573e4f7ca52fcedd500d550",
	name: "listStationChat",
	filename: "src/lib/social-api.ts"
}, (opts) => listStationChat.__executeServer(opts));
var listStationChat = createServerFn({ method: "GET" }).validator((input) => object({ slug: string().min(1) }).parse(input)).handler(listStationChat_createServerFn_handler, async ({ data }) => {
	const { listChat } = await import("./social.server-DLqPYrF6.mjs");
	return listChat(data.slug);
});
var postStationChat_createServerFn_handler = createServerRpc({
	id: "b249dd9adefe7c79e424e8c9c31771aadfe41f573346771cb1adaaca54c53616",
	name: "postStationChat",
	filename: "src/lib/social-api.ts"
}, (opts) => postStationChat.__executeServer(opts));
var postStationChat = createServerFn({ method: "POST" }).middleware([radioSessionMiddleware]).validator((input) => object({
	slug: string().min(1).max(80),
	author: string().min(1).max(24),
	body: string().min(1).max(280)
}).parse(input)).handler(postStationChat_createServerFn_handler, async ({ context, data }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-B5IRAOYQ.mjs").then((n) => n.n);
	assertSameSiteRequest();
	const author = (context.user?.name || context.user?.email || data.author).trim().slice(0, 24);
	const body = data.body.trim().slice(0, 280);
	if (!author || !body) throw new Error("Need a handle and a line.");
	const { insertChat, listChat } = await import("./social.server-DLqPYrF6.mjs");
	await insertChat(data.slug, author, body, context.user?.id ?? null);
	return listChat(data.slug);
});
var bumpTrackView_createServerFn_handler = createServerRpc({
	id: "33b02d65bba8d133fa56e02858c9d159e244ea83c4eb483cd2c2b6dd0b10bb63",
	name: "bumpTrackView",
	filename: "src/lib/social-api.ts"
}, (opts) => bumpTrackView.__executeServer(opts));
var bumpTrackView = createServerFn({ method: "POST" }).validator((input) => object({ trackId: string().min(1) }).parse(input)).handler(bumpTrackView_createServerFn_handler, async ({ data }) => {
	const { bumpView } = await import("./social.server-DLqPYrF6.mjs");
	return bumpView(data.trackId);
});
var bumpTrackLike_createServerFn_handler = createServerRpc({
	id: "bd429980c9d23aa02b69708d64446997683f3214c7b2ddc527fd991042d50b4d",
	name: "bumpTrackLike",
	filename: "src/lib/social-api.ts"
}, (opts) => bumpTrackLike.__executeServer(opts));
var bumpTrackLike = createServerFn({ method: "POST" }).validator((input) => object({
	trackId: string().min(1),
	liked: boolean()
}).parse(input)).handler(bumpTrackLike_createServerFn_handler, async ({ data }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-B5IRAOYQ.mjs").then((n) => n.n);
	assertSameSiteRequest();
	const { bumpLike } = await import("./social.server-DLqPYrF6.mjs");
	return bumpLike(data.trackId, data.liked);
});
var toggleFavoriteTrack_createServerFn_handler = createServerRpc({
	id: "613b8c42e93a79bb0b67e0ea6912b9473afa49225fd950065b80b3dc2be5f2c4",
	name: "toggleFavoriteTrack",
	filename: "src/lib/social-api.ts"
}, (opts) => toggleFavoriteTrack.__executeServer(opts));
var toggleFavoriteTrack = createServerFn({ method: "POST" }).middleware([radioSessionMiddleware]).validator((input) => object({ trackId: string().min(1) }).parse(input)).handler(toggleFavoriteTrack_createServerFn_handler, async ({ context, data }) => {
	if (!context.user) return {
		favorites: [],
		persisted: false
	};
	const { assertSameSiteRequest } = await import("./isolation.server-B5IRAOYQ.mjs").then((n) => n.n);
	assertSameSiteRequest();
	const { toggleFavorite } = await import("./social.server-DLqPYrF6.mjs");
	return {
		favorites: await toggleFavorite(context.user.id, data.trackId),
		persisted: true
	};
});
var listMyFavorites_createServerFn_handler = createServerRpc({
	id: "039455f170174f83176030122752131d5c9de179f843bd66bcc7f975a4720bf0",
	name: "listMyFavorites",
	filename: "src/lib/social-api.ts"
}, (opts) => listMyFavorites.__executeServer(opts));
var listMyFavorites = createServerFn({ method: "GET" }).middleware([radioSessionMiddleware]).handler(listMyFavorites_createServerFn_handler, async ({ context }) => {
	if (!context.user) return [];
	const { listFavorites } = await import("./social.server-DLqPYrF6.mjs");
	return listFavorites(context.user.id);
});
//#endregion
export { bumpTrackLike_createServerFn_handler, bumpTrackView_createServerFn_handler, listMyFavorites_createServerFn_handler, listStationChat_createServerFn_handler, postStationChat_createServerFn_handler, toggleFavoriteTrack_createServerFn_handler };
