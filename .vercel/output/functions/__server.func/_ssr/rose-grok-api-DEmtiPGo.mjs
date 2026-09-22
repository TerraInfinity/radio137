import { d as normalizeLook } from "./phenomena-DIQMhlVR.mjs";
import { n as createMiddleware, r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { i as roseGrokSystemPrompt, n as lookSnapshot, r as parseGrokLookResponse } from "./rose-grok-BU1OT2-C.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rose-grok-api-DEmtiPGo.js
var adminMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-nKCa1E1y.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-B5IRAOYQ.mjs").then((n) => n.n);
	const { requireAdmin } = await import("./sso.server-NSJ3vLzw.mjs").then((n) => n.p);
	assertSameSiteRequest();
	return next({ context: { user: await requireAdmin(context.bearerToken) } });
});
var lookShape = object({
	bpm: number(),
	fly: number(),
	intensity: number(),
	stills: number(),
	loop: number(),
	stars: number(),
	glyphs: number(),
	rings: number(),
	petals: boolean(),
	bolts: boolean(),
	box: boolean(),
	phenomenon: string(),
	captions: array(string()),
	stillUrls: array(string()),
	loopUrl: string()
});
var inputShape = object({
	prompt: string().trim().min(1).max(1200),
	stationSlug: string().min(1).max(80),
	trackId: string().max(120).optional(),
	trackTitle: string().max(200).optional(),
	artist: string().max(160).optional(),
	look: lookShape,
	history: array(object({
		role: _enum(["user", "assistant"]),
		content: string().max(1600)
	})).max(10).optional()
});
var directRoseLook_createServerFn_handler = createServerRpc({
	id: "6d9a4c36e4fa94358d626ce6220b0261d71242f3bc3a9bdacc4770f584b1c569",
	name: "directRoseLook",
	filename: "src/lib/rose-grok-api.ts"
}, (opts) => directRoseLook.__executeServer(opts));
var directRoseLook = createServerFn({ method: "POST" }).middleware([adminMiddleware]).validator((input) => inputShape.parse(input)).handler(directRoseLook_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "Grok is not available in this environment."
	};
	const current = normalizeLook(data.look);
	const history = (data.history ?? []).slice(-8).map((item) => ({
		role: item.role,
		content: item.content.slice(0, 1200)
	}));
	const userBlock = [
		`Station: ${data.stationSlug}`,
		data.trackTitle ? `Now playing: ${data.trackTitle}${data.artist ? ` — ${data.artist}` : ""}` : "No song playing yet — direct the station look.",
		data.trackId ? `Track id: ${data.trackId}` : "",
		`Current look: ${JSON.stringify(lookSnapshot(current))}`,
		`Admin: ${data.prompt.trim()}`
	].filter(Boolean).join("\n");
	const payload = {
		model: "grok-4.5",
		temperature: .45,
		max_tokens: 700,
		response_format: { type: "json_object" },
		messages: [
			{
				role: "system",
				content: roseGrokSystemPrompt()
			},
			...history,
			{
				role: "user",
				content: userBlock
			}
		]
	};
	let res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify(payload)
	});
	if (res.status === 400) {
		const retry = { ...payload };
		delete retry.response_format;
		res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify(retry)
		});
	}
	if (!res.ok) return {
		ok: false,
		error: `Grok could not direct this cut (${res.status}).`
	};
	const text = (await res.json()).choices?.[0]?.message?.content ?? "";
	const turn = parseGrokLookResponse(text, current);
	return {
		ok: true,
		reply: turn.reply,
		look: turn.look,
		changed: turn.changed,
		pin: turn.pin
	};
});
//#endregion
export { directRoseLook_createServerFn_handler };
