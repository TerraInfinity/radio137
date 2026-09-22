import type { Track } from "@/lib/types";
import { endPad } from "@/lib/radio-engine";

const DUR_KEY = "radio.durations.v1";
const measured = new Map<string, number>();
let persistTimer: number | null = null;
let hydrated = false;
let durationGen = 0;
const durationListeners = new Set<() => void>();

export function subscribeDurations(listener: () => void) {
  durationListeners.add(listener);
  return () => {
    durationListeners.delete(listener);
  };
}

export function durationGeneration() {
  return durationGen;
}

function emitDurations() {
  durationGen += 1;
  durationListeners.forEach((listener) => listener());
}

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
  if (!Number.isFinite(seconds) || seconds < 0.2) return;
  const prev = measured.get(trackId);
  if (prev && Math.abs(prev - seconds) < 0.05) return;
  measured.set(trackId, seconds);
  emitDurations();
  schedulePersist();
}

export function hasMeasuredDuration(trackId: string): boolean {
  hydrateDurations();
  return measured.has(trackId);
}

export function durationOf(track: Track): number {
  hydrateDurations();
  return measured.get(track.id) ?? slotDuration(track);
}

/** Published program-log length. Shared by every tuner; must not change when we measure a file. */
export function slotDuration(track: Track): number {
  return Math.max(1, track.durationSec || 1);
}

/**
 * Join the clock with a duration we can trust.
 * A 3-second probe on a 12-minute cut must not skip into the next song on refresh.
 */
export function joinDuration(track: Track): number {
  const slot = slotDuration(track);
  const actual = durationOf(track);
  if (actual >= slot * 0.45 || slot <= 40) return actual;
  return slot;
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
    const actual = joinDuration(track);
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

/** Next cut in playlist order. Never returns `fromId` unless the desk has only one playable. */
export function nextForward(tracks: Track[], fromId: string | null | undefined, avoidId?: string | null): Track | null {
  if (tracks.length === 0) return null;
  const start = fromId ? tracks.findIndex((track) => track.id === fromId) : -1;
  for (let n = 1; n <= tracks.length; n++) {
    const track = tracks[(Math.max(start, 0) + n) % tracks.length];
    if (!track) continue;
    if (track.id === fromId && tracks.length > 1) continue;
    if (avoidId && track.id === avoidId && tracks.length > 1) continue;
    return track;
  }
  return tracks[0] ?? null;
}

/** Random next cut. Avoids the current id and a short recent window so a mix does not stutter. */
export function nextShuffled(tracks: Track[], fromId: string | null | undefined, recent: readonly string[] = []): Track | null {
  if (tracks.length === 0) return null;
  if (tracks.length === 1) return tracks[0];
  const hold = Math.min(Math.max(1, Math.floor(tracks.length / 4)), 8);
  const banned = new Set<string>();
  if (fromId) banned.add(fromId);
  for (const id of recent.slice(-hold)) banned.add(id);
  const pool = tracks.filter((track) => !banned.has(track.id));
  const source = pool.length > 0 ? pool : tracks.filter((track) => track.id !== fromId);
  const pick = source.length > 0 ? source : tracks;
  return pick[Math.floor(Math.random() * pick.length)] ?? tracks[0];
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
