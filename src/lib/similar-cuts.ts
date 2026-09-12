import type { CutCluster, CutCopy, CutGroup } from "./cuts.ts";

const GENERIC = new Set([
  "a",
  "an",
  "and",
  "at",
  "audio",
  "by",
  "feat",
  "for",
  "from",
  "ft",
  "glados",
  "hd",
  "hq",
  "in",
  "lyric",
  "lyrics",
  "mp3",
  "of",
  "official",
  "on",
  "song",
  "the",
  "to",
  "track",
  "video",
  "wav",
  "with",
]);

const VERSION = new Set([
  "acoustic",
  "bonus",
  "cover",
  "demo",
  "edit",
  "extended",
  "instrumental",
  "interlude",
  "intro",
  "karaoke",
  "live",
  "mashup",
  "mix",
  "nightcore",
  "outro",
  "preview",
  "radio",
  "remaster",
  "remastered",
  "remix",
  "reprise",
  "reverb",
  "slowed",
  "snippet",
  "sped",
  "version",
]);

export function skipPairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function clusterSkipKeys(ids: string[]): string[] {
  const unique = [...new Set(ids.filter(Boolean))].sort();
  const keys: string[] = [];
  for (let i = 0; i < unique.length; i += 1) {
    for (let j = i + 1; j < unique.length; j += 1) {
      keys.push(`${unique[i]}|${unique[j]}`);
    }
  }
  return keys;
}

function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(value: string): string[] {
  return fold(value).split(" ").filter(Boolean);
}

function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function playlistStripped(value: string): string {
  return fold(value).replace(/^\d{1,2}\s+/, "");
}

function stripNoise(value: string, extra: string[] = []): string {
  const drop = new Set(
    [...GENERIC, ...extra.flatMap((item) => fold(item).split(" ").filter(Boolean))],
  );
  return tokens(playlistStripped(value))
    .filter((token) => !drop.has(token))
    .join(" ");
}

function compact(value: string): string {
  return fold(value).replace(/\s+/g, "");
}

function stripSequel(value: string): string {
  return playlistStripped(value)
    .replace(/\bv\s*\d+$/g, "")
    .replace(/\b(pt|part|vol|volume)\s*\d+$/g, "")
    .replace(/\s+\d+$/g, "")
    .trim();
}

function identityNumbers(value: string): string[] {
  return tokens(playlistStripped(value)).filter((token) => /^\d+$/.test(token) || /^v\d+$/.test(token));
}

function distinctive(value: string): string[] {
  return tokens(value).filter((token) => !GENERIC.has(token) && !/^\d+$/.test(token));
}

const DUP_EXTRA = new Set(["copy", "duplicate", "dup", "alt", "take"]);

function extraMeaningful(small: string[], large: string[]): string[] {
  const have = new Set(small);
  return large.filter((token) => !have.has(token) && !DUP_EXTRA.has(token) && !/^\d+$/.test(token));
}

function isCreditSuffix(shorter: string, longer: string): boolean {
  const a = compact(shorter);
  const b = compact(longer);
  if (a.length < 8 || b.length <= a.length) return false;
  return b.startsWith(a) && b.length - a.length <= 18;
}

function versionTokens(value: string): Set<string> {
  return new Set(tokens(value).filter((token) => VERSION.has(token)));
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const left = a.slice(0, 80);
  const right = b.slice(0, 80);
  if (!left.length) return right.length;
  if (!right.length) return left.length;
  const prev = new Array<number>(right.length + 1);
  const curr = new Array<number>(right.length + 1);
  for (let j = 0; j <= right.length; j += 1) prev[j] = j;
  for (let i = 1; i <= left.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      curr[j] = Math.min((curr[j - 1] ?? 0) + 1, (prev[j] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
    }
    for (let j = 0; j <= right.length; j += 1) prev[j] = curr[j] ?? 0;
  }
  return prev[right.length] ?? 0;
}

function ratio(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const longest = Math.max(a.length, b.length);
  if (!longest) return 1;
  return 1 - levenshtein(a, b) / longest;
}

function dice(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
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

function jaccard(a: string[], b: string[]): number {
  if (!a.length && !b.length) return 1;
  const left = new Set(a);
  const right = new Set(b);
  let inter = 0;
  for (const token of left) if (right.has(token)) inter += 1;
  const union = left.size + right.size - inter;
  return union ? inter / union : 0;
}

function artistKey(copy: CutCopy): string {
  const artist = fold(copy.track.artist);
  if (!artist) return "";
  if (artist === fold(copy.channel.name)) return "";
  if (artist === "default" || artist === "unknown" || artist === "various" || artist === "va") return "";
  return artist;
}

function coreOf(copy: CutCopy): { title: string; stem: string; compact: string; raw: string } {
  const extra = [copy.track.artist, copy.channel.name];
  const title = stripNoise(copy.track.title, extra);
  const stem = stripNoise(copy.stem || copy.filename, extra);
  const best = title.length >= stem.length ? title : stem || title;
  const drop = new Set(["glados", ...extra.flatMap((item) => fold(item).split(" ").filter(Boolean))]);
  const raw = compact(tokens(playlistStripped(copy.track.title)).filter((token) => !drop.has(token)).join(" "));
  return { title: title || fold(copy.track.title), stem: stem || fold(copy.stem), compact: compact(best), raw };
}

function durationClose(a: number, b: number): boolean {
  if (!(a > 0) || !(b > 0)) return false;
  const delta = Math.abs(a - b);
  const floor = Math.min(a, b);
  if (floor < 20) return delta <= 1;
  return delta <= Math.max(2, floor * 0.03);
}

function isSequelPair(a: string, b: string): boolean {
  const left = playlistStripped(a);
  const right = playlistStripped(b);
  if (!left || !right || left === right) return false;
  const strippedLeft = stripSequel(left);
  const strippedRight = stripSequel(right);
  return Boolean(strippedLeft) && strippedLeft === strippedRight;
}

function lastTokenClash(a: string[], b: string[]): boolean {
  const left = a[a.length - 1] ?? "";
  const right = b[b.length - 1] ?? "";
  if (!left || !right || left === right) return false;
  if (left.length < 4 || right.length < 4) return false;
  return ratio(left, right) < 0.5;
}

function exactTitleShownElsewhere(a: CutCopy, b: CutCopy): boolean {
  const key = fold(a.track.title);
  if (!key || key !== fold(b.track.title)) return false;
  const parts = key.split(" ").filter(Boolean);
  return key.length >= 12 || parts.length >= 3;
}

function exactFilename(a: CutCopy, b: CutCopy): boolean {
  const left = fold(a.stem || a.filename);
  const right = fold(b.stem || b.filename);
  return Boolean(left) && left === right;
}

function preferOne(copies: CutCopy[]): CutCopy {
  const ranked = [...copies].sort((a, b) => {
    const ao = /official|default/.test(a.channel.slug) ? 0 : 1;
    const bo = /official|default/.test(b.channel.slug) ? 0 : 1;
    if (ao !== bo) return ao - bo;
    if (a.folder.length !== b.folder.length) return a.folder.length - b.folder.length;
    return a.track.title.localeCompare(b.track.title) || a.track.id.localeCompare(b.track.id);
  });
  return ranked[0] ?? copies[0]!;
}

type ScoredPair = {
  left: CutCopy;
  right: CutCopy;
  score: number;
  why: string[];
};

function scorePair(left: CutCopy, right: CutCopy): ScoredPair | null {
  if (left.track.id === right.track.id) return null;
  if (left.track.audioUrl && left.track.audioUrl === right.track.audioUrl) return null;
  if (exactFilename(left, right)) return null;
  if (!durationClose(left.track.durationSec, right.track.durationSec)) return null;
  if (exactTitleShownElsewhere(left, right)) return null;
  if (isSequelPair(left.track.title, right.track.title) || isSequelPair(left.stem, right.stem)) return null;

  const numsLeft = identityNumbers(left.track.title).sort().join();
  const numsRight = identityNumbers(right.track.title).sort().join();
  if (numsLeft !== numsRight) return null;

  const coreLeft = coreOf(left);
  const coreRight = coreOf(right);
  if (!coreLeft.compact || !coreRight.compact) return null;

  const versionsLeft = versionTokens(`${left.track.title} ${left.stem}`);
  const versionsRight = versionTokens(`${right.track.title} ${right.stem}`);
  for (const token of versionsLeft) if (!versionsRight.has(token)) return null;
  for (const token of versionsRight) if (!versionsLeft.has(token)) return null;

  const titleRatio = ratio(coreLeft.title, coreRight.title);
  const stemRatio = ratio(coreLeft.stem, coreRight.stem);
  const cross = Math.max(ratio(coreLeft.title, coreRight.stem), ratio(coreLeft.stem, coreRight.title));
  const packed = Math.max(
    ratio(coreLeft.compact, coreRight.compact),
    ratio(coreLeft.raw, coreRight.raw),
    dice(coreLeft.compact, coreRight.compact),
    dice(coreLeft.raw, coreRight.raw),
  );
  const leftTokens = distinctive(coreLeft.title);
  const rightTokens = distinctive(coreRight.title);
  const overlap = leftTokens.length || rightTokens.length ? jaccard(leftTokens, rightTokens) : 0;
  const disjoint = leftTokens.length > 0 && rightTokens.length > 0 && overlap === 0;
  const extra =
    leftTokens.length <= rightTokens.length
      ? extraMeaningful(leftTokens, rightTokens)
      : extraMeaningful(rightTokens, leftTokens);
  const credit =
    isCreditSuffix(coreLeft.title, coreRight.title) || isCreditSuffix(coreRight.title, coreLeft.title);
  if (extra.length > 0 && !credit && packed < 0.9) return null;

  let score = Math.max(titleRatio, stemRatio, cross, packed, overlap);
  if (lastTokenClash(leftTokens, rightTokens)) score -= 0.18;
  if (credit) score = Math.max(score, 0.9);

  const artist = artistKey(left);
  const sameArtist = Boolean(artist) && artist === artistKey(right);
  if (sameArtist) score += 0.05;
  const sameSource = Boolean(left.track.originalUrl) && left.track.originalUrl === right.track.originalUrl;
  if (sameSource) score += 0.12;

  const short = Math.min(left.track.durationSec, right.track.durationSec) < 30;
  const sameStation = left.channel.slug === right.channel.slug;
  const compactEnough =
    Math.min(Math.max(coreLeft.compact.length, coreLeft.raw.length), Math.max(coreRight.compact.length, coreRight.raw.length)) >= 8;
  const pass =
    (packed >= 0.9 && compactEnough) ||
    credit ||
    (overlap >= 0.72 && score >= 0.7 && extra.length === 0) ||
    (score >= (short ? 0.9 : 0.86) && extra.length === 0);
  if (!pass) return null;
  if (sameStation && extra.length > 0 && !credit && packed < 0.96) return null;
  if (disjoint && packed < 0.9) return null;

  const why: string[] = [];
  if (credit) why.push("close titles");
  else if (packed >= 0.9 || titleRatio >= 0.82) why.push("close titles");
  else if (stemRatio >= 0.82) why.push("close filenames");
  else why.push("similar names");
  const leftClock = clock(left.track.durationSec);
  const rightClock = clock(right.track.durationSec);
  why.push(leftClock === rightClock ? `same length ${leftClock}` : `${leftClock} / ${rightClock}`);
  if (sameArtist) why.push("same artist");
  if (sameSource) why.push("same source");
  return { left, right, score, why };
}

function representatives(copies: CutCopy[], groups: CutGroup[]): CutCopy[] {
  const map = new Map<string, string>();
  for (const group of groups) {
    for (const id of group.memberIds) map.set(id, group.canonicalId);
    map.set(group.canonicalId, group.canonicalId);
  }
  const bags = new Map<string, CutCopy[]>();
  for (const copy of copies) {
    const canonical = map.get(copy.track.id) ?? copy.track.id;
    const list = bags.get(canonical) ?? [];
    list.push(copy);
    bags.set(canonical, list);
  }
  return [...bags.values()].map((list) => preferOne(list));
}

export function similarClusters(copies: CutCopy[], groups: CutGroup[], skipKeys: Iterable<string> = []): CutCluster[] {
  const skipped = new Set(skipKeys);
  const reps = representatives(copies, groups);
  const buckets = new Map<number, CutCopy[]>();
  for (const copy of reps) {
    const dur = Math.round(copy.track.durationSec);
    if (!(dur > 0)) continue;
    const list = buckets.get(dur) ?? [];
    list.push(copy);
    buckets.set(dur, list);
  }

  const seen = new Set<string>();
  const hits: ScoredPair[] = [];
  const durations = [...buckets.keys()].sort((a, b) => a - b);
  for (const dur of durations) {
    const pool = [
      ...(buckets.get(dur) ?? []),
      ...(buckets.get(dur + 1) ?? []),
      ...(buckets.get(dur - 1) ?? []),
      ...(dur >= 20 ? (buckets.get(dur + 2) ?? []) : []),
      ...(dur >= 20 ? (buckets.get(dur - 2) ?? []) : []),
    ];
    const unique = [...new Map(pool.map((copy) => [copy.track.id, copy])).values()];
    for (let i = 0; i < unique.length; i += 1) {
      const left = unique[i];
      if (!left) continue;
      for (let j = i + 1; j < unique.length; j += 1) {
        const right = unique[j];
        if (!right) continue;
        const key = skipPairKey(left.track.id, right.track.id);
        if (skipped.has(key) || seen.has(key)) continue;
        seen.add(key);
        const hit = scorePair(left, right);
        if (hit) hits.push(hit);
      }
    }
  }

  const parent = new Map<string, string>();
  const find = (id: string): string => {
    let cur = id;
    while (parent.get(cur) && parent.get(cur) !== cur) cur = parent.get(cur) ?? cur;
    return cur;
  };
  const union = (a: string, b: string) => {
    const pa = find(a);
    const pb = find(b);
    if (pa !== pb) parent.set(pa, pb);
  };
  const byId = new Map<string, CutCopy>();
  const whyByRoot = new Map<string, string[]>();
  const scoreByRoot = new Map<string, number>();
  for (const hit of hits) {
    byId.set(hit.left.track.id, hit.left);
    byId.set(hit.right.track.id, hit.right);
    if (!parent.has(hit.left.track.id)) parent.set(hit.left.track.id, hit.left.track.id);
    if (!parent.has(hit.right.track.id)) parent.set(hit.right.track.id, hit.right.track.id);
    union(hit.left.track.id, hit.right.track.id);
  }
  for (const hit of hits) {
    const root = find(hit.left.track.id);
    const why = whyByRoot.get(root) ?? [];
    for (const item of hit.why) if (!why.includes(item)) why.push(item);
    whyByRoot.set(root, why);
    scoreByRoot.set(root, Math.max(scoreByRoot.get(root) ?? 0, hit.score));
  }

  const bags = new Map<string, CutCopy[]>();
  for (const id of parent.keys()) {
    const root = find(id);
    const copy = byId.get(id);
    if (!copy) continue;
    const list = bags.get(root) ?? [];
    list.push(copy);
    bags.set(root, list);
  }

  const clusters: CutCluster[] = [];
  for (const [root, list] of bags) {
    const unique = [...new Map(list.map((copy) => [copy.track.id, copy])).values()];
    if (unique.length < 2) continue;
    unique.sort((a, b) => a.track.title.localeCompare(b.track.title) || a.track.id.localeCompare(b.track.id));
    clusters.push({
      key: unique.map((copy) => copy.track.id).sort().join("|"),
      reason: "similar",
      copies: unique,
      why: whyByRoot.get(root),
      score: scoreByRoot.get(root),
    });
  }
  return clusters.sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || a.key.localeCompare(b.key));
}

/** Track ids on one station that look like the same song as another row on that list. */
export function playlistDuplicateHints(
  copies: CutCopy[],
  groups: CutGroup[] = [],
  skipKeys: Iterable<string> = [],
): Map<string, string> {
  const skip = new Set(skipKeys);
  const marks = new Map<string, string>();
  const mark = (ids: string[], why: string) => {
    for (const id of ids) {
      const partners = ids.filter((other) => other !== id && !skip.has(skipPairKey(id, other)));
      if (partners.length === 0) continue;
      if (!marks.has(id)) marks.set(id, why);
    }
  };
  for (const group of groups) {
    const here = copies.filter((copy) => copy.track.id === group.canonicalId || group.memberIds.includes(copy.track.id));
    if (here.length >= 2) mark(here.map((copy) => copy.track.id), "already merged");
  }
  for (const cluster of similarClusters(copies, groups, skip)) {
    mark(cluster.copies.map((copy) => copy.track.id), cluster.why?.join(" · ") || "similar names");
  }
  const byStem = new Map<string, string[]>();
  const byTitle = new Map<string, string[]>();
  const byUrl = new Map<string, string[]>();
  for (const copy of copies) {
    const stem = fold(copy.stem || copy.filename);
    if (stem) {
      const list = byStem.get(stem) ?? [];
      list.push(copy.track.id);
      byStem.set(stem, list);
    }
    const title = fold(copy.track.title);
    const tokens = title.split(" ").filter(Boolean);
    if (title && (title.length >= 12 || tokens.length >= 3)) {
      const list = byTitle.get(title) ?? [];
      list.push(copy.track.id);
      byTitle.set(title, list);
    }
    const url = copy.track.audioUrl;
    if (url) {
      const list = byUrl.get(url) ?? [];
      list.push(copy.track.id);
      byUrl.set(url, list);
    }
  }
  for (const ids of byStem.values()) mark(ids, "same filename");
  for (const ids of byTitle.values()) mark(ids, "same title");
  for (const ids of byUrl.values()) mark(ids, "same file");
  return marks;
}
