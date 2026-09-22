import { d as normalizeLook, t as PHENOMENA } from "./phenomena-DIQMhlVR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rose-grok-BU1OT2-C.js
var ROSE_GROK_STARTERS = [
	"This cut should feel like a quiet snowfall of white petals.",
	"Time war — faster fly, more rings, keep the box.",
	"Ken Burns stills only. Hide the vortex.",
	"Match a slower BPM and make the laser eyes rarer.",
	"1950s prom drama — gymnasium last dance, hide the box.",
	"Voice ON — time vortex, tea still hot on red red land."
];
function lookSnapshot(look) {
	return {
		bpm: look.bpm,
		fly: look.fly,
		intensity: look.intensity,
		stills: look.stills,
		loop: look.loop,
		stars: look.stars,
		glyphs: look.glyphs,
		rings: look.rings,
		petals: look.petals,
		bolts: look.bolts,
		box: look.box,
		phenomenon: look.phenomenon,
		captions: look.captions
	};
}
function roseGrokSystemPrompt() {
	return `You are the live director for Radio137's Rose experience (Bad Wolf Opera). You talk to the station admin in short, concrete stage notes, then return a look patch that the page applies immediately.

Phenomena (pick one id):
${PHENOMENA.map((item) => `${item.id}: ${item.label} — ${item.hint}`).join("\n")}

Look knobs (only send fields you want to change):
- bpm: 0 follows the song tag, else 70–180
- fly 0–2, intensity 0–2
- stills 0–1 (photo opacity), loop 0–1 (video opacity)
- stars 20–200, glyphs 0–32, rings 0–36
- petals, bolts, box: booleans
- captions: up to 6 short lines that walk with the musical phrase

Never invent new phenomenon ids. Never clear stillUrls or loopUrl unless the admin asked to change art. Do not write code.

Reply as a JSON object:
{"reply":"one or two sentences","look":{...partial look...},"pin":false}
Set pin true only if they asked to save, pin, lock, or keep this song's look.`;
}
function extractJson(text) {
	const raw = (text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? text).trim();
	const start = raw.indexOf("{");
	const end = raw.lastIndexOf("}");
	if (start < 0 || end <= start) return null;
	try {
		return JSON.parse(raw.slice(start, end + 1));
	} catch {
		return null;
	}
}
function mergeLookPatch(current, patch) {
	const src = patch ?? {};
	const captions = Array.isArray(src.captions) ? src.captions.map((line) => String(line ?? "").trim()).filter(Boolean).slice(0, 6) : current.captions;
	const stillUrls = Array.isArray(src.stillUrls) && src.stillUrls.length ? src.stillUrls : current.stillUrls;
	const loopUrl = src.loopUrl != null && String(src.loopUrl).trim() ? String(src.loopUrl).trim() : current.loopUrl;
	const phenomenon = src.phenomenon ?? current.phenomenon;
	return normalizeLook({
		...current,
		...src,
		captions,
		stillUrls,
		loopUrl,
		phenomenon
	});
}
function parseGrokLookResponse(text, current) {
	const parsed = extractJson(text);
	if (!parsed || typeof parsed !== "object") return {
		reply: text.trim() || "I heard you, but I could not shape a look from that.",
		look: current,
		changed: false,
		pin: false
	};
	const look = mergeLookPatch(current, parsed.look ?? parsed.scene ?? {});
	const reply = String(parsed.reply ?? "").trim() || "Applied.";
	const pin = parsed.pin === true;
	return {
		reply,
		look,
		changed: JSON.stringify(lookSnapshot(look)) !== JSON.stringify(lookSnapshot(current)),
		pin
	};
}
function threadStorageKey(stationSlug, trackId) {
	return `radio.rose.grok.v1.${stationSlug}.${trackId || "station"}`;
}
//#endregion
export { threadStorageKey as a, roseGrokSystemPrompt as i, lookSnapshot as n, parseGrokLookResponse as r, ROSE_GROK_STARTERS as t };
