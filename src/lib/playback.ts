import { hashString } from "@/lib/cn";
import { getPlayableTracks } from "@/lib/catalog";
import type { Channel, Track } from "@/lib/types";

export function liveCursor(tracks: Track[], serverNowMs: number, slug: string) {
  const playable = tracks.filter((track) => track.durationSec > 0 && track.audioUrl);
  const totalSec = playable.reduce((sum, track) => sum + track.durationSec, 0);
  if (totalSec <= 0 || playable.length === 0) return null;
  const seed = hashString(slug) % totalSec;
  const elapsed = (((Math.floor(serverNowMs / 1000) + seed) % totalSec) + totalSec) % totalSec;
  let acc = 0;
  for (let index = 0; index < playable.length; index++) {
    const track = playable[index];
    if (elapsed < acc + track.durationSec) {
      return { track, index, offsetSec: elapsed - acc, totalSec };
    }
    acc += track.durationSec;
  }
  return { track: playable[0], index: 0, offsetSec: 0, totalSec };
}

export function upcomingTracks(channel: Channel, currentId: string | null, count = 12): Track[] {
  const playable = getPlayableTracks(channel);
  if (playable.length === 0) return [];
  const currentIndex = Math.max(0, playable.findIndex((track) => track.id === currentId));
  const out: Track[] = [];
  for (let i = 1; i <= count && i < playable.length; i++) {
    out.push(playable[(currentIndex + i) % playable.length]);
  }
  return out;
}

export function neighborTrack(tracks: Track[], currentId: string | null, direction: 1 | -1): Track | null {
  if (tracks.length === 0) return null;
  const index = tracks.findIndex((track) => track.id === currentId);
  if (index < 0) return tracks[0];
  return tracks[(index + direction + tracks.length) % tracks.length];
}
