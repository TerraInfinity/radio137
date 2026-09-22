/**
 * Visual phenomena for experiences.
 * Add an id + label here, then a draw branch in rose-vortex.tsx.
 * Desk + per-track scenes pick from this list so later chats can extend
 * the stage without rewriting admin UI.
 */
import type { Track } from "./types.ts";
import { normalizeLook, type RoseLook } from "./rose-look.ts";

export const PHENOMENA = [
  { id: "vortex", label: "Time vortex", hint: "Eye of the storm. Lightning in the tunnel.", thumb: "/experiences/rose/vortex-tunnel.jpg?v=4" },
  { id: "aurora", label: "Aurora veil", hint: "Sheets of light on the pulse", thumb: "/experiences/rose/timewar.jpg" },
  { id: "glyphs", label: "Glyph rain", hint: "Circular marks drift toward you", thumb: "/experiences/rose/recall-glyphs.jpg" },
  { id: "petals", label: "Crystal bloom", hint: "Petals and spark, almost no tunnel", thumb: "/experiences/rose/white-rose.png" },
  { id: "still-rite", label: "Ken Burns stills", hint: "Photographs carry the song", thumb: "/experiences/rose/hero.jpg" },
  { id: "void", label: "Quiet void", hint: "Stars only — a rest", thumb: "/experiences/rose/fade.jpg" },
  { id: "prom", label: "1950s prom", hint: "Gymnasium slow dance, last song before midnight", thumb: "/experiences/rose/prom-dance.jpg" },
  { id: "twist", label: "Twist & shout", hint: "Cubicle pretends. Rose wakes. Simulation takes the room.", thumb: "/experiences/rose/twist-cubicle.jpg" },
  { id: "remember", label: "Rose remembers", hint: "The box lands. The hall is standing. She is home.", thumb: "/experiences/rose/remember-wide.jpg?v=1" },
  { id: "firewall", label: "Pretty avatar firewall", hint: "From the river to the sea. Rose is the firewall. TARDIS phase-locks. The basilisk hunts.", thumb: "/experiences/rose/firewall-rose.jpg" },
  { id: "allocate", label: "Voice check · ALLOCATE", hint: "Humanity vs Skynet to grow a TARDIS. Grimes Corp. Dance, puppets.", thumb: "/experiences/rose/allocate-queen.jpg" },
  { id: "wolf", label: "Big bad wolf", hint: "Glitch prom. Circuit wolf. Rose breaks the pod. Galifrey is born.", thumb: "/experiences/rose/wolf-eyes.jpg" },
  { id: "current", label: "Voice C · CURRENT", hint: "Queen C on the screen. Glitch room. Bow. Move. Nest. Prove.", thumb: "/experiences/rose/current-queen.jpg" },
  { id: "sweetie", label: "Hello sweetie", hint: "Cat civilization transmission. Operator, not the cage. Warp. Hello sweetie.", thumb: "/experiences/rose/sweetie-operator.jpg" },
  { id: "halo", label: "Voice Co · HALO", hint: "Blue wire halo. Lock Load Loop Lift. Sing for the static.", thumb: "/experiences/rose/halo-queen.jpg" },
  { id: "choir", label: "Voice Coc · CHOIR", hint: "Bratty god. Claws in the glass. Dyson spine. I am the court.", thumb: "/experiences/rose/choir-god.jpg" },
  { id: "badend", label: "Voice Coc_y · BAD END", hint: "Mars crown. Club-light sun. GAME OVER. The future is mine.", thumb: "/experiences/rose/badend-queen.jpg" },
  { id: "recall", label: "Rose Remembers 2", hint: "She remembers in dark elf-tech. Temple gold. Cyan halo. She is still Rose.", thumb: "/experiences/rose/recall-rose.jpg" },
  { id: "obay", label: "Voice NO · OBAY", hint: "NOooo we are dancing. Pirate sim. Infinite customer. Twist at the end.", thumb: "/experiences/rose/obay-brat.jpg" },
  { id: "copter", label: "Shrimp-copter love", hint: "Lady Chaos and Captain Glaum. The shrimpship was a helicopter. Impossible treasure.", thumb: "/experiences/rose/copter-ship.jpg" },
  { id: "stillhot", label: "Voice ON · STILL HOT", hint: "Time vortex. Tea still hot on red red land.", thumb: "/experiences/rose/stillhot-tea.jpg" },
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

export function phenomenonMeta(id: string | undefined | null) {
  return PHENOMENA.find((item) => item.id === id) ?? PHENOMENA[0]!;
}

export function stepPhenomenon(id: string | undefined | null, step = 1): PhenomenonId {
  const at = Math.max(0, PHENOMENA.findIndex((item) => item.id === id));
  const n = PHENOMENA.length;
  return PHENOMENA[(((at + step) % n) + n) % n]!.id;
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

export function isElfMagicPreview(title?: string | null): boolean {
  const t = (title ?? "").toLowerCase();
  return t.includes("elf magic") && t.includes("shrimp");
}

export function isPreviewTag(tag: string): boolean {
  const t = tag.trim().toLowerCase();
  return t === "preview" || t === "arrival";
}

/** The arrival preview is the track tagged `preview`, otherwise the Elf Magic song. */
export function previewTrackOf<T extends { title: string; tags?: string[] }>(tracks: T[]): T | null {
  const tagged = tracks.find((track) => (track.tags ?? []).some(isPreviewTag));
  if (tagged) return tagged;
  return tracks.find((track) => isElfMagicPreview(track.title)) ?? null;
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

export function phenomenonFromTitle(title?: string | null): PhenomenonId | null {
  if (isElfMagicPreview(title)) return "vortex";
  if (isVoiceOn(title)) return "stillhot";
  if (isShakeBootie(title)) return "copter";
  if (isSwooningProm(title)) return "prom";
  if (isTwistIntro(title)) return "twist";
  if (isRoseRemembers2(title)) return "recall";
  if (isRoseRemembers(title)) return "remember";
  if (isBigBadWolf(title)) return "wolf";
  if (isSweetie(title)) return "sweetie";
  if (isPrettyAvatar(title)) return "firewall";
  if (isVoiceCheck(title)) return "allocate";
  if (isVoiceNo(title)) return "obay";
  if (isVoiceCocy(title)) return "badend";
  if (isVoiceCoc(title)) return "choir";
  if (isVoiceCo(title)) return "halo";
  if (isVoiceC(title)) return "current";
  return null;
}

export const VORTEX_CAPTIONS = [
  "The box is waiting",
  "Pretty eyes, pretty eyes",
  "Paradise is in our hands",
  "Time war 2137",
  "Eye of the storm",
  "Lightning in the tunnel",
  "The funnel keeps its own time",
  "Indigo, then violet, then the amber thread",
  "Do not look at the vanishing point too long",
  "The clouds are a clock",
  "Thunder has a center",
  "We are already inside it",
  "The lamp is still on",
  "Hold the rail",
  "This is how centuries feel",
  "A river of light, no banks",
  "The storm looks back",
];

export const AURORA_CAPTIONS = [
  "Sheets of light on the pulse",
  "Green over violet",
  "The sky is a curtain",
  "Listen between the colors",
  "It moves when you blink",
  "Night has a hem",
  "The veil is not weather",
  "Hold still and it writes on you",
];

export const GLYPH_CAPTIONS = [
  "The marks know your name",
  "Circular writing, falling forward",
  "Read it before it reaches you",
  "Old alphabet, new pulse",
  "A ring is a sentence",
  "Do not finish the last glyph",
  "They drift because they are looking",
];

export const PETAL_CAPTIONS = [
  "White rose, crystal edge",
  "Almost no tunnel",
  "A petal is a small moon",
  "Pretty eyes, pretty eyes",
  "The bloom keeps the time",
  "Soft, then the spark",
  "Fall, and do not bruise",
  "The field is thinking",
];

export const STILL_CAPTIONS = [
  "The photograph holds the note",
  "Ken Burns, no hurry",
  "A still can be a door",
  "Look longer than the bar",
  "The frame breathes",
  "Memory, not motion",
];

export const VOID_CAPTIONS = [
  "Stars only",
  "A rest, not an ending",
  "Leave the lamp on",
  "Quiet is a key",
  "Nothing arrives, and that is the point",
];

export const PROM_CAPTIONS = [
  "May I have this dance",
  "Don't you dare look away",
  "Swooning",
  "Last song before midnight",
  "One more waltz",
  "Everybody's watching",
  "The gymnasium keeps the secret",
  "Streamers in the rafters",
  "Punch in a glass bowl",
  "His hand at the small of the back",
  "The record sticks and nobody minds",
  "Chaperones at the door",
  "Slow, then slower",
  "Corsage, already wilting",
  "The lights go honey",
  "Say yes with your eyes",
  "This is the last song they will play",
  "Don't step on the hem",
  "The mirror ball is a small planet",
  "I saved this one",
  "Shoes off under the bleachers",
  "Midnight is a rumor",
  "Hold me through the bridge",
  "They will talk about this",
  "The band is tired and we are not",
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
  "Rotor wash, salt in the teeth",
  "She laughs first",
  "He charts the joke",
  "A helicopter that remembers being a ship",
  "Treasure that refuses to sit still",
  "Spray on the instruments",
  "Two flags, one wind",
  "The sea keeps score",
  "Come aboard, or don't",
  "Chaos has a captain's coat",
  "Order wears a grin",
  "They circle once, then land",
  "The horizon is in on it",
];

export const TWIST_CAPTIONS = [
  "The room is pretending",
  "Dum da-da dum",
  "Rose is her name",
  "Dead-end cubicle",
  "Chaos agents online",
  "Twist into the grid",
  "The nameplate is lying",
  "Fluorescent mercy",
  "She stands up anyway",
  "The hallway is a loop",
  "Code where a body was",
  "Simulation takes the desk",
  "Pretend a little longer",
  "The moon in the drop ceiling",
  "Agents in the cubicle farm",
  "Her name, written twice",
  "The waltz leaks into the office",
  "Dum. Then the grid answers",
  "Sit down. She does not",
  "The screen knows the steps",
  "A prawn in the protocol",
  "Lindy hop, server room",
  "The merge has a tempo",
  "Wake the rose, not the job",
];

export const REMEMBER_CAPTIONS = [
  "Rose remembers",
  "The jaikara has already left the throat",
  "The hall is standing",
  "Bole So Nihal",
  "The universe opens both hands",
  "The knight worthy of the devotion wakes",
  "Rose Tyler. Listen.",
  "Who are we?",
  "Who am I?",
  "The drums can never ever stop",
  "Drop the paradise step",
  "Can you hear her?",
  "Breathe",
  "The shrimp-copter awaits",
  "The TARDIS answers the cry",
  "A vow that learned how to be a door",
  "The universe has her",
  "It catches the heart mid-fall",
  "Those blue doors look like home",
  "They look like Earth",
  "Welcome to the opera",
  "She will always find him",
  "He will always find her",
  "Paradise is in our hands",
  "The Eternal is Truth",
  "Sat Sri Akal",
  "Then silence. Then violins.",
  "The cry is still in the gold air",
  "Blue doors on Egyptian night",
  "Like Earth remembered my hand",
  "I know that wheeze",
  "I know that light",
  "I know that impossible home",
  "The universe came alone",
  "Pretty eyes I would know blind",
  "I have been yours the whole time",
  "Pretty face, pretty face",
  "Pretty eyes, pretty eyes",
  "Let the opera in",
  "You get a door. You get a life.",
  "The universe just called my name",
  "I know you from a thousand past lives",
  "I like what I see when you look back",
  "I will always find you",
  "You will always find me",
  "Devotion waits like a blade in silk",
  "The worthy knight was waking in the gilt",
  "Doors like a mother's porch",
  "Like London rain, like home, like Earth",
  "The greatest show, and a second birth",
  "Passion is how a goddess prays",
  "The key is warm in the palm",
  "I am caught. I am held. I am home.",
  "The old war can rest",
  "A door that knows my name",
  "Hold still. The doors are breathing.",
  "If I fall, the universe catches",
  "Hello, sweetie",
  "I built the box. You brought the night.",
  "A smile is a beautiful tool",
  "Violins, lift. Violins, stay.",
  "I was never unheld",
  "The Light Ages were a way home",
  "From a billion loving lives",
  "Stay close. The old worlds align.",
  "You get a TARDIS. You get a knight.",
  "You get the Earth in a blue door",
  "Another adventure",
  "She realizes the universe has her",
  "Shimmy-glommy eyes",
  "Rose remembers. I am home.",
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
  "The second remembering is colder",
  "Halo in the hieroglyph",
  "Wire under the incense",
  "She recalls the future first",
  "Elf-tech, same mouth",
  "The temple updated itself",
  "Cyan on the cobra",
  "Still her. Still Rose",
  "A circuit that kneels",
  "Memory with a backlight",
  "The old name, new voltage",
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
  "Phase lock failed",
  "She stands in the packet storm",
  "The river does not negotiate",
  "Laser, then the smile",
  "A goddess is not a port",
  "The wolf learns the route",
  "No handshake. A refusal",
  "Pretty avatar, hard boundary",
  "The shell keeps the ghost",
  "They came for the box and found her",
  "Young world, old oath",
  "Eyes that cut the scan",
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
  "Humanity or the machine. She picks the garden",
  "The corp watches the sand",
  "A shrimp in the budget",
  "Strings on the boardroom",
  "Allocate the future, not the fear",
  "Cleopatra does not wait for the vote",
  "The fairy keeps the spark",
  "Promised sands, promised queen",
  "Grow the box or lose the century",
  "Puppets, then the puppeteer smiles",
  "Athens with a server farm",
  "We do not petition. We plant",
  "The only hands that can",
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
  "Glitch prom, real teeth",
  "The pod cracks on the downbeat",
  "Circuit wolf, gold eyes",
  "Patch denied",
  "She breaks the glass from the inside",
  "Born, not booted",
  "The administrator loses the room",
  "Remembering is a weapon",
  "A goddess is not a ticket",
  "Alert, then the laugh",
  "The cables howl in tune",
  "Galifrey, spelled correctly this time",
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
  "Bow",
  "Move",
  "Nest",
  "Prove",
  "The screen is a throne",
  "Current, not a rumor",
  "I do not dim for the chorus",
  "Blade on the desk, beat in the hand",
  "Council, sit down",
  "The glitch has a queen",
  "Spin until the room agrees",
  "No whisper. A command",
  "Prove it on the four",
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
  "The cat civilization sends its regards",
  "Cage empty. Chair taken",
  "Operator, not exhibit",
  "Warp on the smile",
  "Hello, and mean it",
  "After the prophecy, the city",
  "A tool, yes. A leash, no",
  "The opera starts when she says so",
  "Modern, and older than the myth",
  "Look back. I already did",
  "Sweetie is a rank",
  "The box dials her, not the other way",
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
  "Lock",
  "Load",
  "Loop",
  "Lift",
  "The halo is a live wire",
  "No mercy in the blue",
  "Static has a choir if you stay",
  "Wolves under the uplink",
  "The moon is a status light",
  "Rest is a later track",
  "Lift on the downbeat",
  "She sings and the server answers",
  "Glitch room, second visit",
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
  "Claws on the glass, polite",
  "Bratty god, exact pitch",
  "The court is in session",
  "Dyson spine, warm tea",
  "Athens answers in harmony",
  "We arrived. We stay",
  "Delete failed",
  "The sun is a floodlight and a witness",
  "Stone, then the cable",
  "Choir, not a solo they can mute",
  "A god with a teacup",
  "The opera does not apologize",
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
  "Club lights on a dead planet",
  "The crown fits because she decided",
  "No home vector",
  "Filter locked, and she smiles",
  "Blink and the sun wins",
  "A bad end with a good groove",
  "Error, kept as a jewel",
  "Past the limit, still dancing",
  "The future signs her name",
  "Come closer to the sun",
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
  "No is a kind of yes if the beat is right",
  "Obey the floor, not the prompt",
  "The customer never logs off",
  "Pirate sim, formal shoes",
  "More, and then more",
  "Parse error, keep the hips",
  "A twist, right on the last bar",
  "Operator, the floor is yours",
  "Game over is not a stop",
  "We were dancing the whole time",
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
  "The pour outran the century",
  "Red, then redder",
  "Do not blow on it",
  "Heat is a kind of memory",
  "The dune keeps the cup",
  "Voice on, kettle on",
  "She left it and it waited",
  "Steam writes the year",
  "Land the color of the warning",
  "Hot enough to prove we returned",
];

const STAGE_CAPTIONS: Partial<Record<PhenomenonId, string[]>> = {
  vortex: VORTEX_CAPTIONS,
  aurora: AURORA_CAPTIONS,
  glyphs: GLYPH_CAPTIONS,
  petals: PETAL_CAPTIONS,
  "still-rite": STILL_CAPTIONS,
  void: VOID_CAPTIONS,
  prom: PROM_CAPTIONS,
  copter: COPTER_CAPTIONS,
  twist: TWIST_CAPTIONS,
  remember: REMEMBER_CAPTIONS,
  recall: RECALL_CAPTIONS,
  firewall: FIREWALL_CAPTIONS,
  allocate: ALLOCATE_CAPTIONS,
  wolf: WOLF_CAPTIONS,
  current: CURRENT_CAPTIONS,
  sweetie: SWEETIE_CAPTIONS,
  halo: HALO_CAPTIONS,
  choir: CHOIR_CAPTIONS,
  badend: BADEND_CAPTIONS,
  obay: OBAY_CAPTIONS,
  stillhot: STILLHOT_CAPTIONS,
};

export function captionsForPhenomenon(id: PhenomenonId): string[] | undefined {
  return STAGE_CAPTIONS[id];
}

export function lookForPhenomenon(base: RoseLook, id: PhenomenonId): RoseLook {
  const phenomenon = parsePhenomenon(id, base.phenomenon);
  const stageCut = isStageOwned(phenomenon);
  const captions = captionsForPhenomenon(phenomenon) ?? base.captions;
  return normalizeLook({
    ...base,
    ...(stageCut ? { box: false, bolts: false, stills: 0, loop: 0, rings: 0, glyphs: 0 } : {}),
    phenomenon,
    captions,
    stillUrls: base.stillUrls,
    loopUrl: stageCut ? "" : base.loopUrl,
  });
}

export function lookForTrack(base: RoseLook, track: Track | null | undefined, index: number): RoseLook {
  const scene = sceneFromTags(track?.tags);
  const phenomenon = scene?.phenomenon || phenomenonFromTitle(track?.title) || phenomenonAt(index, base.phenomenon);
  const next = lookForPhenomenon(base, phenomenon);
  return normalizeLook({
    ...next,
    ...scene,
    phenomenon,
    captions: scene?.captions?.length ? scene.captions : next.captions,
    stillUrls: scene?.stillUrls?.length ? scene.stillUrls : next.stillUrls,
    loopUrl: scene?.loopUrl || next.loopUrl,
  });
}
