import { slugify } from "@/lib/cn";
import type { Catalog, Channel, Track } from "@/lib/types";

function asKey(value: string | null | undefined): string {
  return slugify(value || "").slice(0, 80);
}

export function parseAliases(raw: string | string[] | null | undefined): string[] {
  const parts = Array.isArray(raw) ? raw : String(raw || "").split(/[,;\n]+/);
  const out: string[] = [];
  for (const part of parts) {
    const slug = asKey(part);
    if (slug && !out.includes(slug)) out.push(slug);
  }
  return out;
}

export function titleKey(track: Pick<Track, "title">): string {
  return asKey(track.title);
}

/** Public URL ending for a cut: custom slug, else the song title — never the station-index id. */
export function songKey(track: Track): string {
  return asKey(track.slug) || titleKey(track) || track.id;
}

export function songPath(track: Track): string {
  return `/player/${songKey(track)}`;
}

export function stationPath(channel: Channel): string {
  return `/channel/${channel.slug}`;
}

export function trackKeys(track: Track): string[] {
  const keys = [track.id, track.slug, titleKey(track), songKey(track), ...(track.aliases ?? [])];
  return [...new Set(keys.map((key) => asKey(key) || (key || "").trim()).filter(Boolean))];
}

function explicitKeys(track: Track): string[] {
  return [track.id, track.slug, ...(track.aliases ?? [])]
    .map((key) => (asKey(key) || (key || "").trim()).toLowerCase())
    .filter(Boolean);
}

export function findSong(catalog: Catalog, needle: string): { track: Track; channel: Channel } | null {
  const want = (asKey(needle) || needle.trim()).toLowerCase();
  if (!want) return null;
  let byTitle: { track: Track; channel: Channel } | null = null;
  for (const channel of catalog.channels) {
    for (const track of channel.tracks) {
      if (explicitKeys(track).includes(want)) return { track, channel };
      if (!byTitle && titleKey(track) === want) byTitle = { track, channel };
    }
  }
  return byTitle;
}

export function slugTaken(catalog: Catalog, slug: string, exceptTrackId: string): boolean {
  const want = asKey(slug);
  if (!want) return false;
  for (const channel of catalog.channels) {
    for (const track of channel.tracks) {
      if (track.id === exceptTrackId) continue;
      if (trackKeys(track).includes(want)) return true;
    }
  }
  return false;
}
