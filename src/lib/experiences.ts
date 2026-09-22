import { parsePhenomenon, type PhenomenonId } from "./phenomena.ts";
import type { Catalog, Channel } from "./types.ts";

export type ExperienceStill = { src: string; caption: string };

export type RadioExperience = {
  slug: string;
  stationSlug: string;
  title: string;
  kicker: string;
  line: string;
  whisper: string;
  summary: string;
  cover: string;
  loop: string;
  stills: ExperienceStill[];
  bpm: number;
  captions: string[];
  phenomenon: PhenomenonId;
};

export type ExperienceDraft = {
  slug?: string;
  title: string;
  kicker: string;
  line: string;
  whisper: string;
  summary: string;
  bpm: number;
  phenomenon: PhenomenonId;
  captions: string[];
};

const XP_PREFIX = "xp.v1.";

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

export function encodeXpTag(draft: ExperienceDraft): string {
  return XP_PREFIX + toB64(JSON.stringify({
    slug: (draft.slug || "").trim(),
    title: draft.title.trim(),
    kicker: draft.kicker.trim(),
    line: draft.line.trim(),
    whisper: draft.whisper.trim(),
    summary: draft.summary.trim(),
    bpm: Number.isFinite(draft.bpm) ? draft.bpm : 120,
    phenomenon: parsePhenomenon(draft.phenomenon),
    captions: (draft.captions ?? []).map((line) => String(line).trim()).filter(Boolean).slice(0, 6),
  }));
}

export function decodeXpTag(tag: string | undefined | null): ExperienceDraft | null {
  if (!tag || !tag.startsWith(XP_PREFIX)) return null;
  try {
    const parsed = JSON.parse(fromB64(tag.slice(XP_PREFIX.length))) as Partial<ExperienceDraft>;
    return {
      slug: String(parsed.slug ?? "").trim(),
      title: String(parsed.title ?? "").trim(),
      kicker: String(parsed.kicker ?? "").trim(),
      line: String(parsed.line ?? "").trim(),
      whisper: String(parsed.whisper ?? "").trim(),
      summary: String(parsed.summary ?? "").trim(),
      bpm: Number.isFinite(Number(parsed.bpm)) ? Number(parsed.bpm) : 120,
      phenomenon: parsePhenomenon(parsed.phenomenon),
      captions: Array.isArray(parsed.captions) ? parsed.captions.map((line) => String(line ?? "").trim()).filter(Boolean).slice(0, 6) : [],
    };
  } catch {
    return null;
  }
}

export function xpFromTags(tags?: string[] | null): ExperienceDraft | null {
  if (!tags) return null;
  for (const tag of tags) {
    const xp = decodeXpTag(tag);
    if (xp) return xp;
  }
  return null;
}

export function mergeXpTags(tags: string[] | undefined, draft: ExperienceDraft): string {
  const rest = (tags ?? []).filter((tag) => !tag.startsWith(XP_PREFIX) && tag !== "experience");
  return [encodeXpTag(draft), "experience", ...rest].join(", ");
}

export const EXPERIENCES: RadioExperience[] = [
  {
    slug: "rose",
    stationSlug: "rose",
    title: "Rose",
    kicker: "Bad Wolf Opera · 2137",
    line: "Paradise is in our hands",
    whisper: "Pretty eyes, pretty eyes…",
    summary:
      "A fixed-order rite. Sailor-crystal neo-elf tech awakens into a Gallifreyan time war. The blue box holds the stage while the opera watches.",
    cover: "/covers/rose.jpg",
    loop: "/experiences/rose/vortex-storm.mp4",
    bpm: 120,
    phenomenon: "vortex",
    captions: [
      "The box is waiting",
      "Pretty eyes, pretty eyes…",
      "Paradise is in our hands",
      "Time war 2137",
    ],
    stills: [
      { src: "/experiences/rose/rose-field.jpg", caption: "White rose field" },
      { src: "/experiences/rose/hero.jpg", caption: "The box takes the stage" },
      { src: "/experiences/rose/eyes.jpg", caption: "Pretty eyes, pretty eyes" },
      { src: "/experiences/rose/timewar.jpg", caption: "Time war 2137" },
    ],
  },
];

export function experienceFromChannel(channel: Channel): RadioExperience | undefined {
  const packed = xpFromTags(channel.tags);
  const seed = EXPERIENCES.find((item) => item.stationSlug === channel.slug || item.slug === channel.slug);
  const flagged = (channel.tags ?? []).some((tag) => tag === "experience" || tag.startsWith(XP_PREFIX));
  if (!packed && !seed && !flagged) return undefined;
  return {
    slug: packed?.slug || seed?.slug || channel.slug,
    stationSlug: channel.slug,
    title: packed?.title || seed?.title || channel.name,
    kicker: packed?.kicker || seed?.kicker || channel.category || "Experience",
    line: packed?.line || seed?.line || channel.energy || "",
    whisper: packed?.whisper || seed?.whisper || "",
    summary: packed?.summary || seed?.summary || channel.description || "",
    cover: channel.cover || seed?.cover || "",
    loop: channel.videoUrl || channel.animationUrl || seed?.loop || "",
    bpm: packed?.bpm || seed?.bpm || 120,
    captions: packed?.captions?.length ? packed.captions : seed?.captions ?? [],
    stills: seed?.stills ?? [],
    phenomenon: packed?.phenomenon || seed?.phenomenon || "vortex",
  };
}

export function listExperiences(catalog?: Catalog): RadioExperience[] {
  const channels = catalog?.channels ?? [];
  const seen = new Set<string>();
  const out: RadioExperience[] = [];
  for (const channel of channels) {
    const xp = experienceFromChannel(channel);
    if (!xp) continue;
    seen.add(xp.slug);
    seen.add(xp.stationSlug);
    out.push(xp);
  }
  for (const seed of EXPERIENCES) {
    if (seen.has(seed.slug) || seen.has(seed.stationSlug)) continue;
    out.push(seed);
  }
  return out;
}

export function getExperience(slug: string | undefined | null, catalog?: Catalog) {
  if (!slug) return undefined;
  const key = slug.toLowerCase();
  return listExperiences(catalog).find((item) => item.slug === key || item.stationSlug === key);
}

export function experienceForStation(slug: string | undefined | null, catalog?: Catalog) {
  if (!slug) return undefined;
  const key = slug.toLowerCase();
  return listExperiences(catalog).find((item) => item.stationSlug === key);
}
