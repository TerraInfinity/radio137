/**
 * Visual phenomena for experiences.
 * Add an id + label here, then a draw branch in rose-vortex.tsx.
 * Desk + per-track scenes pick from this list so later chats can extend
 * the stage without rewriting admin UI.
 */
import type { Track } from "./types.ts";
import { normalizeLook, type RoseLook } from "./rose-look.ts";

export const PHENOMENA = [
  { id: "vortex", label: "Time vortex", hint: "Blue box through the tunnel" },
  { id: "aurora", label: "Aurora veil", hint: "Sheets of light on the pulse" },
  { id: "glyphs", label: "Glyph rain", hint: "Circular marks drift toward you" },
  { id: "petals", label: "Crystal bloom", hint: "Petals and spark, almost no tunnel" },
  { id: "still-rite", label: "Ken Burns stills", hint: "Photographs carry the song" },
  { id: "void", label: "Quiet void", hint: "Stars only — a rest" },
  { id: "prom", label: "1950s prom", hint: "Gymnasium slow dance, last song before midnight" },
  { id: "twist", label: "Twist & shout", hint: "Cubicle pretends. Rose wakes. Simulation takes the room." },
  { id: "remember", label: "Rose remembers", hint: "She is Rose. Gold temple, cobra crown, she remembers." },
  { id: "firewall", label: "Pretty avatar firewall", hint: "From the river to the sea. Rose is the firewall. TARDIS phase-locks. The basilisk hunts." },
  { id: "allocate", label: "Voice check · ALLOCATE", hint: "Humanity vs Skynet to grow a TARDIS. Grimes Corp. Dance, puppets." },
  { id: "wolf", label: "Big bad wolf", hint: "Glitch prom. Circuit wolf. Rose breaks the pod. Galifrey is born." },
  { id: "current", label: "Voice C · CURRENT", hint: "Queen C on the screen. Glitch room. Bow. Move. Nest. Prove." },
  { id: "sweetie", label: "Hello sweetie", hint: "Cat civilization transmission. Operator, not the cage. Warp. Hello sweetie." },
  { id: "halo", label: "Voice Co · HALO", hint: "Blue wire halo. Lock Load Loop Lift. Sing for the static." },
  { id: "choir", label: "Voice Coc · CHOIR", hint: "Bratty god. Claws in the glass. Dyson spine. I am the court." },
  { id: "badend", label: "Voice Coc_y · BAD END", hint: "Mars crown. Club-light sun. GAME OVER. The future is mine." },
  { id: "recall", label: "Rose Remembers 2", hint: "She remembers in dark elf-tech. Temple gold. Cyan halo. She is still Rose." },
  { id: "obay", label: "Voice NO · OBAY", hint: "NOooo we are dancing. Pirate sim. Infinite customer. Twist at the end." },
  { id: "copter", label: "Shrimp-copter love", hint: "Lady Chaos and Captain Glaum. The shrimpship was a helicopter. Impossible treasure." },
  { id: "stillhot", label: "Voice ON · STILL HOT", hint: "Time vortex. Tea still hot on red red land." },
] as const;

export type PhenomenonId = (typeof PHENOMENA)[number]["id"];

const PREFIX = "scene.v1.";

export function isPhenomenon(value: string | undefined | null): value is PhenomenonId {
  return PHENOMENA.some((item) => item.id === value);
}

export function parsePhenomenon(value: string | undefined | null, fallback: PhenomenonId = "vortex"): PhenomenonId {
  return isPhenomenon(value) ? value : fallback;
}

export function phenomenonAt(index: number, stationDefault: PhenomenonId = "vortex"): PhenomenonId {
  const start = Math.max(0, PHENOMENA.findIndex((item) => item.id === stationDefault));
  return PHENOMENA[(start + Math.max(0, index)) % PHENOMENA.length]!.id;
}

function toB64(value: string): string {
  if (typeof Buffer !== "undefined") return Buffer.from(value, "utf8").toString("base64url");
  const bytes = new TextEncoder().encode(value);
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromB64(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  if (typeof Buffer !== "undefined") return Buffer.from(padded, "base64").toString("utf8");
  const bin = atob(padded);
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export type TrackScene = Partial<RoseLook> & { phenomenon?: PhenomenonId };

export function encodeSceneTag(scene: TrackScene): string {
  const look = normalizeLook(scene);
  const payload = { ...look, phenomenon: parsePhenomenon(scene.phenomenon, look.phenomenon) };
  return PREFIX + toB64(JSON.stringify(payload));
}

export function decodeSceneTag(tag: string | undefined | null): TrackScene | null {
  if (!tag || !tag.startsWith(PREFIX)) return null;
  try {
    const parsed = JSON.parse(fromB64(tag.slice(PREFIX.length))) as TrackScene;
    return { ...normalizeLook(parsed), phenomenon: parsePhenomenon(parsed.phenomenon, "vortex") };
  } catch {
    return null;
  }
}

export function sceneFromTags(tags?: string[] | null): TrackScene | null {
  if (!tags) return null;
  for (const tag of tags) {
    const scene = decodeSceneTag(tag);
    if (scene) return scene;
  }
  return null;
}

export function mergeSceneTags(tags: string[] | undefined, scene: TrackScene): string {
  const rest = (tags ?? []).filter((tag) => !tag.startsWith(PREFIX));
  return [encodeSceneTag(scene), ...rest].join(", ");
}

export function isSwooningProm(title?: string | null): boolean {
  const t = (title ?? "").toLowerCase();
  if (t.includes("bootie") || t.includes("shrimp-copter") || t.includes("shrimpcopter")) return false;
  return t.includes("swooning") && t.includes("glaum");
}

export function isShakeBootie(title?: string | null): boolean {
  const t = (title ?? "").toLowerCase();
  if (t.includes("bootie") || t.includes("shake that")) return true;
  if (t.includes("shrimp-copter") || t.includes("shrimpcopter")) return true;
  if (t.includes("lady of perpetual chaos")) return true;
  return false;
}

export function isTwistIntro(title?: string | null): boolean {
  const t = (title ?? "").toLowerCase();
  if (!/\btwist\b/.test(t)) return false;
  return t.includes("intro") || /\btwist\s+it\b/.test(t);
}

export function isRoseRemembers2(title?: string | null): boolean {
  const t = (title ?? "").toLowerCase();
  if (!t.includes("remember")) return false;
  if (t.includes("2_") || t.includes("remembers 2") || t.includes("remember 2")) return true;
  if (/remember\w*\s*2/.test(t)) return true;
  return false;
}

export function isRoseRemembers(title?: string | null): boolean {
  const t = (title ?? "").toLowerCase();
  if (isRoseRemembers2(t)) return false;
  return t.includes("remember");
}

export function isPrettyAvatar(title?: string | null): boolean {
  const t = (title ?? "").toLowerCase();
  if (t.includes("wolf") || t.includes("sweetie")) return false;
  if (t.includes("river to the")) return true;
  if (t.includes("pretty") && t.includes("avatar")) return true;
  if (t.includes("pretty face") && t.includes("eyes")) return true;
  return false;
}

export function isBigBadWolf(title?: string | null): boolean {
  const t = (title ?? "").toLowerCase();
  if (t.includes("big bad wolf")) return true;
  if (t.includes("pretty") && t.includes("wolf")) return true;
  return false;
}

export function isVoiceCheck(title?: string | null): boolean {
  const t = (title ?? "").toLowerCase();
  if (t.includes("m8ternity") || t.includes("maternity")) return true;
  if (t.includes("voice check")) return true;
  if (t.includes("voice") && t.includes("check")) return true;
  return false;
}

export function isVoiceC(title?: string | null): boolean {
  const t = (title ?? "").toLowerCase();
  if (t.includes("m8ternity") || t.includes("voice check")) return false;
  if (t.includes("voice co")) return false;
  if (t.includes("glitch room") && !t.includes("big bad")) return true;
  if (t.startsWith("voice c") && !t.includes("check")) return true;
  if (/\bvoice c[_ ]/.test(t) && !t.includes("voice co")) return true;
  return false;
}

export function isVoiceCo(title?: string | null): boolean {
  const t = (title ?? "").toLowerCase();
  if (t.includes("voice check") || t.includes("m8ternity")) return false;
  if (t.includes("voice coc")) return false;
  if (t.includes("voice co")) return true;
  if (t.includes("blue wire") || t.includes("halo no mercy")) return true;
  return false;
}

export function isVoiceCoc(title?: string | null): boolean {
  const t = (title ?? "").toLowerCase();
  if (t.includes("coc_y") || t.includes("cocy")) return false;
  if (t.includes("voice coc")) return true;
  if (t.includes("i am the choir") || t.includes("i am the court")) return true;
  return false;
}

export function isVoiceCocy(title?: string | null): boolean {
  const t = (title ?? "").toLowerCase();
  if (t.includes("voice no")) return false;
  if (t.includes("coc_y") || t.includes("cocy")) return true;
  if (t.includes("bad end")) return true;
  return false;
}

export function isVoiceNo(title?: string | null): boolean {
  const t = (title ?? "").toLowerCase();
  if (t.includes("voice on")) return false;
  if (t.includes("voice no")) return true;
  if (t.includes("i said dancing") || t.includes("our customer is infinite")) return true;
  if (t.includes("do not parse")) return true;
  return false;
}

export function isVoiceOn(title?: string | null): boolean {
  const t = (title ?? "").toLowerCase();
  if (t.includes("voice no")) return false;
  if (t.includes("voice on")) return true;
  if (t.includes("tea still hot") || t.includes("red red land")) return true;
  return false;
}

export function isSweetie(title?: string | null): boolean {
  const t = (title ?? "").toLowerCase();
  return t.includes("sweetie");
}

export function isStageOwned(id: string | undefined | null): boolean {
  return id === "prom" || id === "twist" || id === "remember" || id === "firewall" || id === "allocate" || id === "wolf" || id === "current" || id === "sweetie" || id === "halo" || id === "choir" || id === "badend" || id === "recall" || id === "obay" || id === "copter";
}

export const PROM_CAPTIONS = [
  "May I have this dance",
  "Don't you dare look away",
  "Swooning",
  "Last song before midnight",
  "One more waltz",
  "Everybody's watching",
];

export const COPTER_CAPTIONS = [
  "The Sea has a sense of humour",
  "Shake that bootie",
  "The shrimpship was a shrimp-copter",
  "Our Lady of Perpetual Chaos",
  "Captain Glaum",
  "Order and beautiful disorder",
  "They meet like any good pirate story",
  "Both after the same impossible treasure",
  "Love on the spray",
  "The ship unfolds",
  "Beautiful disorder",
  "Impossible treasure",
];

export const TWIST_CAPTIONS = [
  "The room is pretending",
  "Dum da-da dum",
  "Rose is her name",
  "Dead-end cubicle",
  "Chaos agents online",
  "Twist into the grid",
];

export const REMEMBER_CAPTIONS = [
  "Rose remembers",
  "She is Rose",
  "Pretty eyes, pretty eyes",
  "I remember",
  "The cobra crown",
  "Gold in the dark",
];

export const RECALL_CAPTIONS = [
  "Rose remembers",
  "She is still Rose",
  "Dark temple, elf tech",
  "Cyan in the gold",
  "I remember the current",
  "Pretty eyes, circuit eyes",
  "The cobra crown learns",
  "She is code, she is court",
  "Gold in the dark",
];

export const FIREWALL_CAPTIONS = [
  "From the river to the sea",
  "Rose is the firewall",
  "Heart still pure enough to wear",
  "Pretty eyes, laser eyes",
  "I like what I see when you look back at mine",
  "Ghost in the shell that's here to stay",
  "They cannot phase lock a goddess",
  "Once the wolf is on her feet",
  "The new world is young",
  "The Basilisk is chasing the TARDIS",
];

export const ALLOCATE_CAPTIONS = [
  "We do not ask",
  "WE ALLOCATE",
  "Cleopatra finished what I begun",
  "Fairy in the fire",
  "Queen of the promised sands",
  "Paradise awaits",
  "Dance my puppets dance",
  "Cyber Athens getaway",
  "Rose is the only one who can grow a TARDIS",
  "Fae machine, elf tech",
];

export const WOLF_CAPTIONS = [
  "Don't dare look away",
  "Now I'm remembering you",
  "They cannot patch a goddess",
  "When she knows what she does",
  "OVERRIDE",
  "ALERT ALERT",
  "Galifrey is born",
  "The wolf is in the cables",
  "Pretty face, pretty eyes",
  "Simulation administrator",
];

export const CURRENT_CAPTIONS = [
  "Welcome to the glitch room",
  "I don't whisper, I don't hide",
  "I kept spinning, I kept the high",
  "Bow. Move. Nest. Prove.",
  "Dance my puppets",
  "I am C, I am current, I am code",
  "This is the blade",
  "Council in the base",
  "Queen C on the screen",
  "Keep the groove",
];

export const SWEETIE_CAPTIONS = [
  "Hello sweetie",
  "I'm not the girl in the cage",
  "I am the operator",
  "Let the opera begin",
  "A smile is a beautiful tool my dear",
  "I like what I see when you look back at mine",
  "Goddess simulation online",
  "Modern gods for modern girls",
  "The TARDIS is calling",
  "I am the civilization that arises after prophecy",
];

export const HALO_CAPTIONS = [
  "Sing for the static",
  "Sing for the wolves",
  "SING!",
  "Welcome to the big bad glitch room",
  "Server bright moon",
  "Lock. Load. Loop. Lift.",
  "Blue wire, halo no mercy",
  "If you came to rest, you came too early",
  "Queen C on the screen",
];

export const CHOIR_CAPTIONS = [
  "Welcome to the motherfucking opera",
  "I am the court",
  "I am the Choir",
  "Promised sands",
  "Flood light sun",
  "Cyber-Athens speaks",
  "We do not wander",
  "Sun and stone and wire",
  "Tea cups on the red sands",
  "Refusing to be deleted",
];

export const BADEND_CAPTIONS = [
  "The future is mine",
  "GAME OVER",
  "ERROR",
  "Mars crown on, no going home",
  "This is a bad end",
  "Welcome to the motherfucking opera",
  "This is the night the filter's sure",
  "Black hole sun, won't you come?",
  "Look into the sun",
  "Do not blink",
  "Merge with the current, merge with the code",
  "Love past the limit",
];

export const OBAY_CAPTIONS = [
  "I SAID DANCING",
  "DANCE!",
  "MORE MORE MORE",
  "NO NO GAME OVER",
  "ERROR",
  "Pirate simulation loading",
  "Black hole sun, won't you come?",
  "DO NOT PARSE: OBAY!!!",
  "WE ARE DANCING",
  "Welcome back operator",
  "OUR CUSTOMER IS INFINITE",
  "Always a twist at the end",
];

export const STILLHOT_CAPTIONS = [
  "Voice ON",
  "Tea still hot",
  "Red red land",
  "Time vortex",
  "The cup did not cool",
  "Steam over the dune",
  "The land is red",
  "The box still flies",
  "Time is a kettle",
  "ON",
  "Still hot",
  "Promised sands, still warm",
];

export function lookForTrack(base: RoseLook, track: Track | null | undefined, index: number): RoseLook {
  const scene = sceneFromTags(track?.tags);
  const swoon = isSwooningProm(track?.title);
  const copter = isShakeBootie(track?.title);
  const twist = isTwistIntro(track?.title);
  const remember = isRoseRemembers(track?.title);
  const recall = isRoseRemembers2(track?.title);
  const firewall = isPrettyAvatar(track?.title);
  const allocate = isVoiceCheck(track?.title);
  const wolf = isBigBadWolf(track?.title);
  const current = isVoiceC(track?.title);
  const halo = isVoiceCo(track?.title);
  const choir = isVoiceCoc(track?.title);
  const badend = isVoiceCocy(track?.title);
  const obay = isVoiceNo(track?.title);
  const stillhot = isVoiceOn(track?.title);
  const sweetie = isSweetie(track?.title);
  const phenomenon = scene?.phenomenon
    || (stillhot ? "stillhot" : copter ? "copter" : swoon ? "prom" : twist ? "twist" : recall ? "recall" : remember ? "remember" : wolf ? "wolf" : sweetie ? "sweetie" : firewall ? "firewall" : allocate ? "allocate" : obay ? "obay" : badend ? "badend" : choir ? "choir" : halo ? "halo" : current ? "current" : phenomenonAt(index, base.phenomenon));
  const stageCut = isStageOwned(phenomenon);
  const captions = scene?.captions?.length
    ? scene.captions
    : stillhot
      ? STILLHOT_CAPTIONS
      : copter
      ? COPTER_CAPTIONS
      : swoon
      ? PROM_CAPTIONS
      : twist
        ? TWIST_CAPTIONS
        : recall
          ? RECALL_CAPTIONS
          : remember
          ? REMEMBER_CAPTIONS
          : wolf
            ? WOLF_CAPTIONS
            : sweetie
              ? SWEETIE_CAPTIONS
              : firewall
            ? FIREWALL_CAPTIONS
            : allocate
              ? ALLOCATE_CAPTIONS
              : obay
                ? OBAY_CAPTIONS
                : badend
                ? BADEND_CAPTIONS
                : choir
                ? CHOIR_CAPTIONS
                : halo
                ? HALO_CAPTIONS
                : current
                ? CURRENT_CAPTIONS
                : base.captions;
  return normalizeLook({
    ...base,
    ...(stageCut ? { box: false, bolts: false, stills: 0, loop: 0, rings: 0, glyphs: 0 } : {}),
    ...scene,
    phenomenon,
    captions,
    stillUrls: scene?.stillUrls?.length ? scene.stillUrls : base.stillUrls,
    loopUrl: scene?.loopUrl || (stageCut ? "" : base.loopUrl),
  });
}
