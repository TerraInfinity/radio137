import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { n as createMiddleware, r as createServerFn } from "./ssr.mjs";
import { A as boolean, F as object, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/social-api-DT7HdRgY.js
var social_api_DT7HdRgY_exports = /* @__PURE__ */ __exportAll({
	n: () => postStationChat,
	r: () => social_api_exports,
	t: () => listStationChat
});
var social_api_exports = /* @__PURE__ */ __exportAll$1({
	bumpTrackLike: () => bumpTrackLike,
	bumpTrackView: () => bumpTrackView,
	listStationChat: () => listStationChat,
	postStationChat: () => postStationChat,
	toggleFavoriteTrack: () => toggleFavoriteTrack
});
var radioSessionMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-nKCa1E1y.mjs").then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { resolveRadioUser } = await import("./sso.server-NSJ3vLzw.mjs").then((n) => n.p);
	return next({ context: { user: await resolveRadioUser(context.bearerToken) } });
});
var listStationChat = createServerFn({ method: "GET" }).validator((input) => object({ slug: string().min(1) }).parse(input)).handler(createSsrRpc("1bad9c20212fb739ea13d7879e0b1c774851aade5573e4f7ca52fcedd500d550"));
var postStationChat = createServerFn({ method: "POST" }).middleware([radioSessionMiddleware]).validator((input) => object({
	slug: string().min(1).max(80),
	author: string().min(1).max(24),
	body: string().min(1).max(280)
}).parse(input)).handler(createSsrRpc("b249dd9adefe7c79e424e8c9c31771aadfe41f573346771cb1adaaca54c53616"));
var bumpTrackView = createServerFn({ method: "POST" }).validator((input) => object({ trackId: string().min(1) }).parse(input)).handler(createSsrRpc("33b02d65bba8d133fa56e02858c9d159e244ea83c4eb483cd2c2b6dd0b10bb63"));
var bumpTrackLike = createServerFn({ method: "POST" }).validator((input) => object({
	trackId: string().min(1),
	liked: boolean()
}).parse(input)).handler(createSsrRpc("bd429980c9d23aa02b69708d64446997683f3214c7b2ddc527fd991042d50b4d"));
var toggleFavoriteTrack = createServerFn({ method: "POST" }).middleware([radioSessionMiddleware]).validator((input) => object({ trackId: string().min(1) }).parse(input)).handler(createSsrRpc("613b8c42e93a79bb0b67e0ea6912b9473afa49225fd950065b80b3dc2be5f2c4"));
createServerFn({ method: "GET" }).middleware([radioSessionMiddleware]).handler(createSsrRpc("039455f170174f83176030122752131d5c9de179f843bd66bcc7f975a4720bf0"));
//#endregion
export { postStationChat as n, social_api_DT7HdRgY_exports as r, listStationChat as t };
