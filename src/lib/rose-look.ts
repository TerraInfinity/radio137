import type { Channel } from "@/lib/types";
import type { RadioExperience } from "@/lib/experiences";
import type { PhenomenonId } from "@/lib/phenomena";

export type RoseLook = {
  bpm: number;
  fly: number;
  intensity: number;
  stills: number;
  loop: number;
  stars: number;
  glyphs: number;
  rings: number;
  petals: boolean;
  bolts: boolean;
  box: boolean;
  phenomenon: PhenomenonId;
  captions: string[];
  stillUrls: string[];
  loopUrl: string;
};

export const ROSE_LOOK_DEFAULT: RoseLook = {
  bpm: 0,
  fly: 1,
  intensity: 1,
  stills: 0.72,
  loop: 0.55,
  stars: 110,
  glyphs: 18,
  rings: 22,
  petals: true,
  bolts: true,
  box: true,
  phenomenon: "vortex",
  captions: [],
  stillUrls: [],
  loopUrl: "",
};

export const ROSE_LOOK_PRESETS: { id: string; label: string; patch: Partial<RoseLook> }[] = [
  { id: "rite", label: "Rite", patch: { fly: 1, intensity: 1, stars: 110, glyphs: 18, rings: 22, petals: true, bolts: true, box: true, stills: 0.72, loop: 0.55 } },
  { id: "quiet", label: "Quiet", patch: { fly: 0.45, intensity: 0.55, stars: 48, glyphs: 8, rings: 12, petals: false, bolts: false, box: true, stills: 0.85, loop: 0.35 } },
  { id: "war", label: "Time war", patch: { fly: 1.55, intensity: 1.45, stars: 160, glyphs: 22, rings: 28, petals: true, bolts: true, box: true, stills: 0.5, loop: 0.7 } },
  { id: "screen", label: "Screensaver", patch: { fly: 0.7, intensity: 0.8, stars: 90, glyphs: 14, rings: 18, petals: true, bolts: false, box: true, stills: 0.6, loop: 0.45 } },
];

const PREFIX = "look.v1.";

function asPhenomenon(value: unknown): PhenomenonId {
  const id = String(value ?? "");
  if (id === "vortex" || id === "aurora" || id === "glyphs" || id === "petals" || id === "still-rite" || id === "void" || id === "prom" || id === "twist" || id === "remember" || id === "vow" || id === "firewall" || id === "allocate" || id === "wolf" || id === "current" || id === "sweetie" || id === "halo" || id === "choir" || id === "badend" || id === "recall" || id === "obay" || id === "copter" || id === "stillhot" || id === "arrival" || id === "manual" || id === "shiny" || id === "timeshare" || id === "elevate" || id === "shell") return id;
  return "vortex";
}

function clamp(n: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function normalizeLook(raw?: Partial<RoseLook> | null): RoseLook {
  const src = raw ?? {};
  return {
    bpm: src.bpm ? clamp(Number(src.bpm), 0, 200, 0) : 0,
    fly: clamp(Number(src.fly ?? ROSE_LOOK_DEFAULT.fly), 0, 2, 1),
    intensity: clamp(Number(src.intensity ?? ROSE_LOOK_DEFAULT.intensity), 0, 2, 1),
    stills: clamp(Number(src.stills ?? ROSE_LOOK_DEFAULT.stills), 0, 1, 0.72),
    loop: clamp(Number(src.loop ?? ROSE_LOOK_DEFAULT.loop), 0, 1, 0.55),
    stars: Math.round(clamp(Number(src.stars ?? ROSE_LOOK_DEFAULT.stars), 20, 200, 110)),
    glyphs: Math.round(clamp(Number(src.glyphs ?? ROSE_LOOK_DEFAULT.glyphs), 0, 32, 18)),
    rings: Math.round(clamp(Number(src.rings ?? ROSE_LOOK_DEFAULT.rings), 0, 36, 22)),
    petals: src.petals !== false,
    bolts: src.bolts !== false,
    box: src.box !== false,
    phenomenon: asPhenomenon(src.phenomenon),
    captions: Array.isArray(src.captions) ? src.captions.map((line) => String(line ?? "").trim()).filter(Boolean).slice(0, 48) : [],
    stillUrls: Array.isArray(src.stillUrls) ? src.stillUrls.map((url) => String(url ?? "").trim()).filter(Boolean).slice(0, 4) : [],
    loopUrl: String(src.loopUrl ?? "").trim(),
  };
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

export function encodeLookTag(look: RoseLook): string {
  return PREFIX + toB64(JSON.stringify(normalizeLook(look)));
}

export function decodeLookTag(tag: string | undefined | null): RoseLook | null {
  if (!tag || !tag.startsWith(PREFIX)) return null;
  try {
    const parsed = JSON.parse(fromB64(tag.slice(PREFIX.length))) as Partial<RoseLook>;
    return normalizeLook(parsed);
  } catch {
    return null;
  }
}

export function lookFromTags(tags?: string[] | null): RoseLook | null {
  if (!tags) return null;
  for (const tag of tags) {
    const look = decodeLookTag(tag);
    if (look) return look;
  }
  return null;
}

export function mergeLookTags(tags: string[] | undefined, look: RoseLook): string {
  const rest = (tags ?? []).filter((tag) => !tag.startsWith(PREFIX));
  return [encodeLookTag(look), ...rest].join(", ");
}

export function lookFromStation(experience: RadioExperience, channel?: Channel | null): RoseLook {
  const saved = lookFromTags(channel?.tags);
  const stillUrls = saved?.stillUrls?.length ? saved.stillUrls : experience.stills.map((item) => item.src);
  const loopUrl = saved?.loopUrl || channel?.videoUrl || channel?.animationUrl || experience.loop;
  const captions = saved?.captions?.length ? saved.captions : experience.captions;
  return normalizeLook({
    ...ROSE_LOOK_DEFAULT,
    ...saved,
    stillUrls,
    loopUrl,
    captions,
    phenomenon: saved?.phenomenon || experience.phenomenon || "vortex",
  });
}

export function looksEqual(a: RoseLook, b: RoseLook): boolean {
  return JSON.stringify(normalizeLook(a)) === JSON.stringify(normalizeLook(b));
}
