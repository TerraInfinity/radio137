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

export function lookForTrack(base: RoseLook, track: Track | null | undefined, index: number): RoseLook {
  const scene = sceneFromTags(track?.tags);
  const phenomenon = scene?.phenomenon || phenomenonAt(index, base.phenomenon);
  return normalizeLook({
    ...base,
    ...scene,
    phenomenon,
    captions: scene?.captions?.length ? scene.captions : base.captions,
    stillUrls: scene?.stillUrls?.length ? scene.stillUrls : base.stillUrls,
    loopUrl: scene?.loopUrl || base.loopUrl,
  });
}
