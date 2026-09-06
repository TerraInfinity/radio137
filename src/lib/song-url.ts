import { slugify } from "@/lib/cn";
import type { Catalog, Channel, Track } from "@/lib/types";

function asKey(value: string | null | undefined): string {
  return slugify(value || "").slice(0, 80);
}

/** First-path segments that must stay app routes / static files — never song aliases. */
export const RESERVED_PUBLIC_PATHS = [
  "about",
  "admin",
  "api",
  "assets",
  "auth",
  "channel",
  "channels",
  "covers",
  "cut",
  "cuts",
  "desk",
  "download",
  "favicon",
  "grok",
  "health",
  "home",
  "index",
  "install",
  "library",
  "login",
  "logout",
  "manifest",
  "og",
  "player",
  "public",
  "radio",
  "robots",
  "search",
  "share",
  "sitemap",
  "song",
  "songs",
  "sso",
  "static",
  "station",
  "stations",
  "status",
  "well-known",
  "www",
] as const;

const reserved = new Set<string>(RESERVED_PUBLIC_PATHS);

export function isReservedPublicPath(value: string): boolean {
  const key = asKey(value);
  return !key || key.startsWith("_") || reserved.has(key);
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

/** Public URL ending for a cut: custom slug, else the song title — never a reserved path. */
export function songKey(track: Track): string {
  const slug = asKey(track.slug);
  if (slug && !isReservedPublicPath(slug)) return slug;
  const title = titleKey(track);
  if (title && !isReservedPublicPath(title)) return title;
  return track.id;
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
  if (isReservedPublicPath(want)) return true;
  for (const channel of catalog.channels) {
    for (const track of channel.tracks) {
      if (track.id === exceptTrackId) continue;
      if (trackKeys(track).includes(want)) return true;
    }
  }
  return false;
}
