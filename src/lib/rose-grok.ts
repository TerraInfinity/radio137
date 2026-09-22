import { normalizeLook, type RoseLook } from "./rose-look.ts";
import { PHENOMENA, type PhenomenonId } from "./phenomena.ts";

export type GrokChatMessage = { role: "user" | "assistant"; content: string };

export type GrokLookTurn = {
  reply: string;
  look: RoseLook;
  changed: boolean;
  pin: boolean;
};

export const ROSE_GROK_STARTERS = [
  "This cut should feel like a quiet snowfall of white petals.",
  "Time war — faster fly, more rings, keep the box.",
  "Ken Burns stills only. Hide the vortex.",
  "Match a slower BPM and make the laser eyes rarer.",
];

export function lookSnapshot(look: RoseLook) {
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
    captions: look.captions,
  };
}

export function roseGrokSystemPrompt() {
  const phenomena = PHENOMENA.map((item) => `${item.id}: ${item.label} — ${item.hint}`).join("\n");
  return `You are the live director for Radio137's Rose experience (Bad Wolf Opera). You talk to the station admin in short, concrete stage notes, then return a look patch that the page applies immediately.

Phenomena (pick one id):
${phenomena}

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

function extractJson(text: string): unknown {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fence?.[1] ?? text).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

export function mergeLookPatch(current: RoseLook, patch: Partial<RoseLook> | null | undefined): RoseLook {
  const src = patch ?? {};
  const captions = Array.isArray(src.captions)
    ? src.captions.map((line) => String(line ?? "").trim()).filter(Boolean).slice(0, 6)
    : current.captions;
  const stillUrls = Array.isArray(src.stillUrls) && src.stillUrls.length ? src.stillUrls : current.stillUrls;
  const loopUrl = src.loopUrl != null && String(src.loopUrl).trim() ? String(src.loopUrl).trim() : current.loopUrl;
  const phenomenon = (src.phenomenon ?? current.phenomenon) as PhenomenonId;
  return normalizeLook({
    ...current,
    ...src,
    captions,
    stillUrls,
    loopUrl,
    phenomenon,
  });
}

export function parseGrokLookResponse(text: string, current: RoseLook): GrokLookTurn {
  const parsed = extractJson(text) as {
    reply?: unknown;
    look?: Partial<RoseLook>;
    scene?: Partial<RoseLook>;
    pin?: unknown;
  } | null;
  if (!parsed || typeof parsed !== "object") {
    const reply = text.trim() || "I heard you, but I could not shape a look from that.";
    return { reply, look: current, changed: false, pin: false };
  }
  const patch = parsed.look ?? parsed.scene ?? {};
  const look = mergeLookPatch(current, patch);
  const reply = String(parsed.reply ?? "").trim() || "Applied.";
  const pin = parsed.pin === true;
  const changed = JSON.stringify(lookSnapshot(look)) !== JSON.stringify(lookSnapshot(current));
  return { reply, look, changed, pin };
}

export function threadStorageKey(stationSlug: string, trackId: string | null | undefined) {
  return `radio.rose.grok.v1.${stationSlug}.${trackId || "station"}`;
}
