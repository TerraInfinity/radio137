import type { Track } from "@/lib/types";
import { endPad } from "@/lib/radio-engine";

const DUR_KEY = "radio.durations.v1";
const measured = new Map<string, number>();
let persistTimer: number | null = null;
let hydrated = false;

function hydrateDurations() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(DUR_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, number>;
    for (const [id, seconds] of Object.entries(parsed)) {
      if (Number.isFinite(seconds) && seconds >= 0.25) measured.set(id, seconds);
    }
  } catch {
    /* ignore */
  }
}

function schedulePersist() {
  if (typeof window === "undefined") return;
  if (persistTimer != null) window.clearTimeout(persistTimer);
  persistTimer = window.setTimeout(() => {
    persistTimer = null;
    try {
      const obj: Record<string, number> = {};
      for (const [id, seconds] of measured) obj[id] = Math.round(seconds * 100) / 100;
      window.localStorage.setItem(DUR_KEY, JSON.stringify(obj));
    } catch {
      /* ignore */
    }
  }, 400);
}

/** Real file length. Used to play and to skip a dead tail — never to move the station clock. */
export function rememberDuration(trackId: string, seconds: number) {
  hydrateDurations();
  if (!Number.isFinite(seconds) || seconds < 0.25) return;
  const prev = measured.get(trackId);
  const next = prev && prev > 0 ? Math.min(prev, seconds) : seconds;
  if (prev && Math.abs(prev - next) < 0.05) return;
  measured.set(trackId, next);
  schedulePersist();
}

export function durationOf(track: Track): number {
  hydrateDurations();
  return measured.get(track.id) ?? slotDuration(track);
}

/** Published program-log length. Shared by every tuner; must not change when we measure a file. */
export function slotDuration(track: Track): number {
  return Math.max(1, track.durationSec || 1);
}

function hashSlug(slug: string): number {
  let n = 0;
  for (let i = 0; i < slug.length; i++) n = (n * 31 + slug.charCodeAt(i)) >>> 0;
  return n;
}

export type Playhead = { track: Track; index: number; offsetSec: number };

/**
 * Station clock. Same wall-clock second + slug ⇒ same cut and offset for every listener.
 * Uses published slot lengths so one person's measured MP3 cannot spin the wheel.
 */
export function liveCursor(tracks: Track[], now = Date.now(), slug = ""): Playhead | null {
  if (tracks.length === 0) return null;
  const total = tracks.reduce((sum, track) => sum + slotDuration(track), 0);
  if (total <= 0) return { track: tracks[0], index: 0, offsetSec: 0 };
  const day = Math.floor(now / 1000) + (hashSlug(slug) % 3600);
  let cursor = ((day % total) + total) % total;
  for (let i = 0; i < tracks.length; i++) {
    const dur = slotDuration(tracks[i]);
    if (cursor < dur) return { track: tracks[i], index: i, offsetSec: cursor };
    cursor -= dur;
  }
  return { track: tracks[0], index: 0, offsetSec: 0 };
}

/**
 * Turn a clock position into something we can actually play.
 * Short files (header 8s, audio 3s) have a dead tail — walk into the next cut
 * instead of seeking into the last granule. `avoidId` is the cut we just finished
 * so a still-open slot can never restart it.
 */
export function resolveLivePlayhead(
  tracks: Track[],
  now = Date.now(),
  slug = "",
  avoidId?: string | null,
): Playhead | null {
  const clock = liveCursor(tracks, now, slug);
  if (!clock) return null;
  return realizePlayhead(tracks, clock.index, clock.offsetSec, avoidId);
}

export function realizePlayhead(
  tracks: Track[],
  startIndex: number,
  startOffset: number,
  avoidId?: string | null,
): Playhead | null {
  if (tracks.length === 0) return null;
  let index = ((startIndex % tracks.length) + tracks.length) % tracks.length;
  let offset = Math.max(0, startOffset);
  for (let n = 0; n < tracks.length; n++) {
    const track = tracks[index];
    const actual = durationOf(track);
    const pad = endPad(actual);
    const banned = Boolean(avoidId && track.id === avoidId);
    if (!banned && actual > pad && offset < actual - pad) {
      return { track, index, offsetSec: offset };
    }
    offset = Math.max(0, offset - actual);
    index = (index + 1) % tracks.length;
  }
  const fallback = tracks.find((track) => track.id !== avoidId) ?? tracks[0];
  return { track: fallback, index: Math.max(0, tracks.findIndex((track) => track.id === fallback.id)), offsetSec: 0 };
}

export function neighborTrack(tracks: Track[], id: string, dir: 1 | -1, wrap = false): Track | null {
  if (tracks.length === 0) return null;
  const index = tracks.findIndex((track) => track.id === id);
  if (index < 0) return tracks[0] ?? null;
  const next = index + dir;
  if (next < 0) return wrap ? tracks[tracks.length - 1] : null;
  if (next >= tracks.length) return wrap ? tracks[0] : null;
  return tracks[next];
}

/** Walk forward from a cut when this file's audio is spent but leftover seconds remain. */
export function walkFrom(
  tracks: Track[],
  startId: string,
  leftoverSec: number,
  avoidId?: string | null,
): Playhead | null {
  if (tracks.length === 0) return null;
  let index = tracks.findIndex((track) => track.id === startId);
  if (index < 0) index = 0;
  return realizePlayhead(tracks, index + 1, Math.max(0, leftoverSec), avoidId ?? startId);
}
