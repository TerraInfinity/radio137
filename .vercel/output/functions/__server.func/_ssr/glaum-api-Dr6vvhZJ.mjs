import { n as createMiddleware, r as createServerFn } from "./ssr.mjs";
import { F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/glaum-api-Dr6vvhZJ.js
var radioSessionMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-nKCa1E1y.mjs").then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { resolveRadioUser } = await import("./sso.server-NSJ3vLzw.mjs").then((n) => n.p);
	return next({ context: { user: await resolveRadioUser(context.bearerToken) } });
});
var listGlaumWords_createServerFn_handler = createServerRpc({
	id: "26893775ee356fdf5d12240d58a031a5dec729df95aa4ce90905470656552d1a",
	name: "listGlaumWords",
	filename: "src/lib/glaum-api.ts"
}, (opts) => listGlaumWords.__executeServer(opts));
var listGlaumWords = createServerFn({ method: "GET" }).handler(listGlaumWords_createServerFn_handler, async () => {
	const { listGlaumLexicon } = await import("./glaum-words.server-DPLPKuaM.mjs");
	return listGlaumLexicon();
});
var addGuestGlaumWordFn_createServerFn_handler = createServerRpc({
	id: "76fc65498ac00f10a1e5229b52aa0c1267908ee9bdd34049ace69c68c0225c41",
	name: "addGuestGlaumWordFn",
	filename: "src/lib/glaum-api.ts"
}, (opts) => addGuestGlaumWordFn.__executeServer(opts));
var addGuestGlaumWordFn = createServerFn({ method: "POST" }).middleware([radioSessionMiddleware]).validator((input) => object({ word: string().min(1).max(48) }).parse(input)).handler(addGuestGlaumWordFn_createServerFn_handler, async ({ context, data }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-B5IRAOYQ.mjs").then((n) => n.n);
	assertSameSiteRequest();
	if (!context.user) throw new Error("Sign in to add a lantern word.");
	const { addGuestGlaumWord, listGlaumLexicon } = await import("./glaum-words.server-DPLPKuaM.mjs");
	await addGuestGlaumWord(context.user, data.word);
	return listGlaumLexicon();
});
var addAdminGlaumWordFn_createServerFn_handler = createServerRpc({
	id: "aac5d28e1fc5864e8830505713c59008fee0591dd6fc1b3d59c3871d5dfc62f1",
	name: "addAdminGlaumWordFn",
	filename: "src/lib/glaum-api.ts"
}, (opts) => addAdminGlaumWordFn.__executeServer(opts));
var addAdminGlaumWordFn = createServerFn({ method: "POST" }).middleware([radioSessionMiddleware]).validator((input) => object({ word: string().min(1).max(64) }).parse(input)).handler(addAdminGlaumWordFn_createServerFn_handler, async ({ context, data }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-B5IRAOYQ.mjs").then((n) => n.n);
	assertSameSiteRequest();
	if (!context.user?.isAdmin) throw new Error("C only.");
	const { addAdminGlaumWord, listGlaumLexicon } = await import("./glaum-words.server-DPLPKuaM.mjs");
	await addAdminGlaumWord(context.user, data.word);
	return listGlaumLexicon();
});
var hideGlaumWordFn_createServerFn_handler = createServerRpc({
	id: "d996ff8bdab3183a7d117e9ee91b5c2b479c7298eba46fb4195eef1a1de2cc4d",
	name: "hideGlaumWordFn",
	filename: "src/lib/glaum-api.ts"
}, (opts) => hideGlaumWordFn.__executeServer(opts));
var hideGlaumWordFn = createServerFn({ method: "POST" }).middleware([radioSessionMiddleware]).validator((input) => object({
	id: number().int().positive().optional(),
	word: string().optional()
}).parse(input)).handler(hideGlaumWordFn_createServerFn_handler, async ({ context, data }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-B5IRAOYQ.mjs").then((n) => n.n);
	assertSameSiteRequest();
	if (!context.user?.isAdmin) throw new Error("C only.");
	const { hideGlaumWord, hideGlaumDefault, listGlaumLexicon } = await import("./glaum-words.server-DPLPKuaM.mjs");
	if (data.id) await hideGlaumWord(data.id);
	else if (data.word) await hideGlaumDefault(data.word);
	else throw new Error("Need a word to remove");
	return listGlaumLexicon();
});
//#endregion
export { addAdminGlaumWordFn_createServerFn_handler, addGuestGlaumWordFn_createServerFn_handler, hideGlaumWordFn_createServerFn_handler, listGlaumWords_createServerFn_handler };
