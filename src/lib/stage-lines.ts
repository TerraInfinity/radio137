/** Short lines for the stage, cut from a song's lyrics. */

import { ROSE_LYRIC_BANK } from "./rose-lyric-bank.ts";

export const LYRICS_HAND = "lines:hand";
export const LYRICS_SRC = "lyricssrc:";
export const DEFAULT_LYRICS_URL = "https://suno.com/playlist/7d00e6dd-8c95-4460-97d2-858797b6e928";

export function normTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function titleScore(a: string, b: string): number {
  const left = new Set(normTitle(a).split(" ").filter((word) => word.length > 2));
  const right = new Set(normTitle(b).split(" ").filter((word) => word.length > 2));
  if (!left.size || !right.size) return 0;
  let hit = 0;
  for (const word of left) if (right.has(word)) hit += 1;
  return hit / Math.min(left.size, right.size);
}

function splitLong(line: string): string[] {
  if (line.length <= 72) return [line];
  const parts = line.split(/(?<=[,;:—–])\s+/).map((part) => part.trim()).filter((part) => part.length > 2);
  if (parts.length > 1 && parts.every((part) => part.length <= 80)) return parts;
  const mid = line.lastIndexOf(" ", 64);
  if (mid > 18) {
    const rest = line.slice(mid).trim();
    return [line.slice(0, mid).trim(), ...(rest.length > 72 ? splitLong(rest) : rest ? [rest] : [])];
  }
  return [line.slice(0, 72).trim()];
}

export function stageLinesFromLyrics(raw: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const rawLine of raw.split(/\r?\n/)) {
    let line = rawLine.replace(/\*\*/g, "").replace(/[*_]/g, "").trim();
    if (!line) continue;
    if (/^\[[^\]]+\]$/.test(line)) continue;
    if (/^\([^)]*\)$/.test(line)) continue;
    if (/^[-–—•]+\s*$/.test(line)) continue;
    line = line.replace(/^[-–—•]\s*/, "").replace(/\s+/g, " ").trim();
    if (line.length < 3 || !/[a-z0-9]/i.test(line)) continue;
    for (const chunk of splitLong(line)) {
      const key = chunk.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(chunk);
      if (out.length >= 40) return out;
    }
  }
  return out;
}

export function sameLines(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((line, index) => line === b[index]);
}

export function lyricsSourceFromTags(tags?: string[] | null): string {
  const tag = (tags ?? []).find((item) => item.startsWith(LYRICS_SRC));
  return tag ? tag.slice(LYRICS_SRC.length) : DEFAULT_LYRICS_URL;
}

export function withLyricsSource(tags: string[] | undefined, url: string): string {
  const rest = (tags ?? []).filter((tag) => !tag.startsWith(LYRICS_SRC));
  const clean = url.trim();
  return [...rest, clean ? `${LYRICS_SRC}${clean}` : ""].filter(Boolean).join(", ");
}

export function sunoPlaylistId(url: string): string | null {
  const match = url.match(/playlist\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  return match?.[1] ?? null;
}

export type LyricClip = { title: string; lyrics: string };

export function pairLyrics<T extends { id: string; title: string; tags?: string[] }>(
  tracks: T[],
  clips: LyricClip[],
  force = false,
): { track: T; lines: string[] }[] {
  const pool = clips
    .map((clip) => ({ title: clip.title, lines: stageLinesFromLyrics(clip.lyrics) }))
    .filter((clip) => clip.lines.length > 0);
  const used = new Set<number>();
  const pairs: { track: T; lines: string[] }[] = [];
  for (const track of tracks) {
    if (!force && (track.tags ?? []).includes(LYRICS_HAND)) continue;
    let best = -1;
    let score = 0;
    pool.forEach((clip, index) => {
      if (used.has(index)) return;
      const next = titleScore(track.title, clip.title);
      if (next > score) {
        score = next;
        best = index;
      }
    });
    if (best < 0 || score < 0.5) continue;
    used.add(best);
    const clip = pool[best];
    if (clip) pairs.push({ track, lines: clip.lines });
  }
  return pairs;
}

export function lyricsForTitle(title?: string | null): string[] | null {
  if (!title) return null;
  const exact = ROSE_LYRIC_BANK[normTitle(title)];
  if (exact?.length) return exact;
  let best: string[] | null = null;
  let score = 0;
  for (const [name, lines] of Object.entries(ROSE_LYRIC_BANK)) {
    const next = titleScore(title, name);
    if (next > score) {
      score = next;
      best = lines;
    }
  }
  return score >= 0.55 ? best : null;
}
