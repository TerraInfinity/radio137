import type { Track } from "@/lib/types";

function hashSlug(slug: string): number {
  let n = 0;
  for (let i = 0; i < slug.length; i++) n = (n * 31 + slug.charCodeAt(i)) >>> 0;
  return n;
}

export function liveCursor(tracks: Track[], now = Date.now(), slug = ""): { track: Track; index: number; offsetSec: number } | null {
  if (tracks.length === 0) return null;
  const total = tracks.reduce((sum, track) => sum + Math.max(1, track.durationSec), 0);
  if (total <= 0) return { track: tracks[0], index: 0, offsetSec: 0 };
  const day = Math.floor(now / 1000) + (hashSlug(slug) % 3600);
  let cursor = ((day % total) + total) % total;
  for (let i = 0; i < tracks.length; i++) {
    const dur = Math.max(1, tracks[i].durationSec);
    if (cursor < dur) return { track: tracks[i], index: i, offsetSec: cursor };
    cursor -= dur;
  }
  return { track: tracks[0], index: 0, offsetSec: 0 };
}

export function neighborTrack(tracks: Track[], id: string, dir: 1 | -1): Track | null {
  const index = tracks.findIndex((track) => track.id === id);
  if (index < 0) return tracks[0] ?? null;
  const next = index + dir;
  if (next < 0 || next >= tracks.length) return null;
  return tracks[next];
}
