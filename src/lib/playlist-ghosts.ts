import { sceneFromTags } from "./phenomena.ts";
import type { Track } from "./types.ts";

export type GhostPlan = {
  keep: Track;
  drop: Track[];
  why: string;
  inheritScene: boolean;
};

function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compact(value: string): string {
  return fold(value).replace(/\s+/g, "");
}

export function audioKey(url: string): string {
  let raw = (url || "").trim();
  try {
    raw = decodeURIComponent(new URL(raw).pathname);
  } catch {
    raw = raw.split("?")[0] ?? raw;
    try {
      raw = decodeURIComponent(raw);
    } catch {
      /* keep */
    }
  }
  return raw.toLowerCase().replace(/\\/g, "/").replace(/\/{2,}/g, "/");
}

function fileStem(url: string): string {
  const path = audioKey(url);
  const slash = path.lastIndexOf("/");
  const filename = slash >= 0 ? path.slice(slash + 1) : path;
  return filename.replace(/\.[a-z0-9]{2,5}$/i, "").replace(/-\d{4,}$/, "");
}

function dice(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i < a.length - 1; i += 1) left.push(a.slice(i, i + 2));
  for (let i = 0; i < b.length - 1; i += 1) right.push(b.slice(i, i + 2));
  const bag = new Map<string, number>();
  for (const gram of left) bag.set(gram, (bag.get(gram) ?? 0) + 1);
  let inter = 0;
  for (const gram of right) {
    const n = bag.get(gram) ?? 0;
    if (n) {
      inter += 1;
      bag.set(gram, n - 1);
    }
  }
  return (2 * inter) / (left.length + right.length);
}

function titlesClose(a: Track, b: Track): boolean {
  return dice(fold(a.title), fold(b.title)) >= 0.62;
}

function voiceLane(title: string): string | null {
  const t = fold(title);
  if (!t.startsWith("voice")) return null;
  const rest = t.slice(5).trim();
  if (rest.startsWith("check") || rest.startsWith("m8")) return "check";
  if (rest.startsWith("cocy") || rest.startsWith("coc y")) return "cocy";
  if (rest.startsWith("coc")) return "coc";
  if (rest.startsWith("co")) return "co";
  if (rest.startsWith("no")) return "no";
  if (rest.startsWith("on")) return "on";
  if (rest === "c" || rest.startsWith("c ")) return "c";
  return rest.split(" ")[0] || "voice";
}

function prettyLane(title: string): string | null {
  const t = fold(title);
  if (!/\bpretty\b/.test(t)) return null;
  if (t.includes("sweetie")) return "sweetie";
  if (t.includes("wolf")) return "wolf";
  if (t.includes("avatar") || t.includes("river")) return "avatar";
  return "pretty";
}

function rememberLane(title: string): string | null {
  const t = fold(title);
  if (!t.includes("remember")) return null;
  if (/\b2\b/.test(t)) return "remember2";
  return "remember";
}

function promLane(title: string): string | null {
  const t = fold(title);
  if (!t.includes("shrimp") && !t.includes("prom") && !t.includes("bootie")) return null;
  if (t.includes("bootie") || t.includes("copter") || t.includes("shake")) return "bootie";
  if (t.includes("swoon")) return "swoon";
  return "prom";
}

function lanesAgree(a: Track, b: Track): boolean {
  const checks: Array<(title: string) => string | null> = [voiceLane, prettyLane, rememberLane, promLane];
  for (const lane of checks) {
    const left = lane(a.title);
    const right = lane(b.title);
    if (left || right) return left === right;
  }
  return true;
}

function clocksClose(a: Track, b: Track): boolean {
  const left = Math.max(0, a.durationSec || 0);
  const right = Math.max(0, b.durationSec || 0);
  if (!left || !right) return false;
  return Math.abs(left - right) <= 10;
}

function similarTitle(a: Track, b: Track): boolean {
  if (!lanesAgree(a, b)) return false;
  const left = fold(a.title);
  const right = fold(b.title);
  if (!left || !right) return false;
  if (left === right || compact(a.title) === compact(b.title)) return true;
  const score = dice(left, right);
  if (score >= 0.86) return true;
  if (score >= 0.74 && clocksClose(a, b)) return true;
  return false;
}

function keeperScore(track: Track): number {
  const file = fold(fileStem(track.audioUrl));
  const title = fold(track.title);
  const overlap = dice(title, file);
  const duration = Math.max(0, track.durationSec || 0);
  const stubClock = duration === 240 || duration === 60 || duration === 180;
  const art = track.coverUrl?.includes("/experiences/") ? 6 : 0;
  return overlap * 120 + Math.min(80, duration / 12) + (stubClock ? -35 : 0) + (sceneFromTags(track.tags) ? 8 : 0) + art;
}

function pickKeeper(group: Track[]): Track {
  return [...group].sort((a, b) => keeperScore(b) - keeperScore(a) || a.id.localeCompare(b.id))[0]!;
}

function pushPlan(plans: GhostPlan[], group: Track[], why: string) {
  if (group.length < 2) return;
  const keep = pickKeeper(group);
  const drop = group.filter((track) => track.id !== keep.id);
  if (drop.length === 0) return;
  plans.push({
    keep,
    drop,
    why,
    inheritScene: drop.some((track) => titlesClose(keep, track) && sceneFromTags(track.tags) && !sceneFromTags(keep.tags)),
  });
}

function taken(plans: GhostPlan[]): Set<string> {
  const ids = new Set<string>();
  for (const plan of plans) {
    ids.add(plan.keep.id);
    for (const track of plan.drop) ids.add(track.id);
  }
  return ids;
}

function cluster(tracks: Track[], alike: (a: Track, b: Track) => boolean): Track[][] {
  const parent = tracks.map((_, i) => i);
  const find = (i: number): number => {
    let cur = i;
    while (parent[cur] !== cur) {
      parent[cur] = parent[parent[cur]!]!;
      cur = parent[cur]!;
    }
    return cur;
  };
  for (let i = 0; i < tracks.length; i += 1) {
    for (let j = i + 1; j < tracks.length; j += 1) {
      if (alike(tracks[i]!, tracks[j]!)) {
        const a = find(i);
        const b = find(j);
        if (a !== b) parent[b] = a;
      }
    }
  }
  const groups = new Map<number, Track[]>();
  tracks.forEach((track, i) => {
    const root = find(i);
    const list = groups.get(root) ?? [];
    list.push(track);
    groups.set(root, list);
  });
  return [...groups.values()].filter((group) => group.length > 1);
}

/** Same audio, or a near-copy of a title that was added as an animation stub. */
export function ghostPlans(tracks: Track[]): GhostPlan[] {
  const live = tracks.filter((track) => track.enabled !== false && track.audioUrl);
  const plans: GhostPlan[] = [];

  const byUrl = new Map<string, Track[]>();
  for (const track of live) {
    const key = audioKey(track.audioUrl);
    if (!key) continue;
    const list = byUrl.get(key) ?? [];
    list.push(track);
    byUrl.set(key, list);
  }
  for (const group of byUrl.values()) pushPlan(plans, group, "same audio file");

  const rest = live.filter((track) => !taken(plans).has(track.id));
  const byStem = new Map<string, Track[]>();
  for (const track of rest) {
    const stem = fileStem(track.audioUrl);
    if (stem.length < 8) continue;
    const list = byStem.get(stem) ?? [];
    list.push(track);
    byStem.set(stem, list);
  }
  for (const group of byStem.values()) pushPlan(plans, group, "same file name");

  const leftover = live.filter((track) => !taken(plans).has(track.id));
  for (const group of cluster(leftover, similarTitle)) pushPlan(plans, group, "same song, extra row");

  return plans.sort((a, b) => a.keep.title.localeCompare(b.keep.title));
}

export function ghostDropCount(plans: GhostPlan[]): number {
  return plans.reduce((sum, plan) => sum + plan.drop.length, 0);
}

export function ghostDropIds(tracks: Track[]): Set<string> {
  const ids = new Set<string>();
  for (const plan of ghostPlans(tracks)) {
    for (const track of plan.drop) ids.add(track.id);
  }
  return ids;
}
