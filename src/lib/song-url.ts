import { slugify } from "@/lib/cn";
import { experienceFromChannel } from "@/lib/experiences";
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
  "device-sync",
  "download",
  "experiences",
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

/** Strip origins, /player/, and leading slashes so “/hari” and pasted URLs become `hari`. */
export function parseAliasToken(part: string): string {
  let raw = part.trim();
  if (!raw) return "";
  raw = raw.replace(/^(https?:\/\/)?((www|radio)\.)?(terrainfinity|cyber-athens)\.ca(?::\d+)?/i, "");
  raw = raw.replace(/^\/+/, "");
  if (/^player\//i.test(raw)) raw = raw.slice("player/".length);
  if (/^channel\//i.test(raw)) raw = raw.slice("channel/".length);
  if (/^stations?\//i.test(raw)) raw = raw.replace(/^stations?\//i, "");
  raw = raw.split(/[/?#]/)[0] || "";
  const slug = asKey(raw);
  return slug;
}

export function parseAliases(raw: string | string[] | null | undefined): string[] {
  const parts = Array.isArray(raw) ? raw : String(raw || "").split(/[,;\n]+/);
  const out: string[] = [];
  for (const part of parts) {
    const slug = parseAliasToken(part);
    if (slug && !out.includes(slug)) out.push(slug);
  }
  return out;
}

export function titleKey(track: Pick<Track, "title">): string {
  return asKey(track.title);
}

/** Public URL ending for a song: custom slug, else the song title — never a reserved path. */
export function songKey(track: Track): string {
  const slug = asKey(track.slug);
  if (slug && !isReservedPublicPath(slug)) return slug;
  const title = titleKey(track);
  if (title && !isReservedPublicPath(title)) return title;
  return track.id;
}

export function stationPublicSlug(channel: Pick<Channel, "slug" | "publicSlug">): string {
  const slug = asKey(channel.publicSlug);
  if (slug && !isReservedPublicPath(slug)) return slug;
  return channel.slug;
}

export function stationPath(channel: Channel): string {
  const experience = experienceFromChannel(channel);
  if (experience) return `/experiences/${experience.slug}`;
  return `/channel/${stationPublicSlug(channel)}`;
}

export function stationKeys(channel: Channel): string[] {
  const keys = [channel.slug, channel.publicSlug, stationPublicSlug(channel), ...(channel.aliases ?? [])];
  return [...new Set(keys.map((key) => asKey(key) || (key || "").trim()).filter(Boolean))];
}

export function findStationByAlias(catalog: Catalog, needle: string): Channel | null {
  const want = parseAliasToken(needle) || asKey(needle);
  if (!want || isReservedPublicPath(want)) return null;
  for (const channel of catalog.channels) {
    if (parseAliases(channel.aliases).includes(want)) return channel;
  }
  return null;
}

export function findStation(catalog: Catalog, needle: string): Channel | null {
  const want = parseAliasToken(needle) || asKey(needle) || needle.trim();
  if (!want) return null;
  return catalog.channels.find((channel) => stationKeys(channel).includes(want) || channel.slug === needle) ?? null;
}

export function songPath(track: Track): string {
  return `/player/${songKey(track)}`;
}

export function aliasPath(alias: string): string {
  const slug = parseAliasToken(alias);
  return slug ? `/${slug}` : "/";
}

export function trackKeys(track: Track): string[] {
  const keys = [track.id, track.slug, titleKey(track), songKey(track), ...(track.aliases ?? [])];
  return [...new Set(keys.map((key) => asKey(key) || (key || "").trim()).filter(Boolean))];
}

export function findSongByAlias(catalog: Catalog, needle: string): { track: Track; channel: Channel } | null {
  const want = parseAliasToken(needle) || asKey(needle);
  if (!want || isReservedPublicPath(want)) return null;
  for (const channel of catalog.channels) {
    for (const track of channel.tracks) {
      if (parseAliases(track.aliases).includes(want)) return { track, channel };
    }
  }
  return null;
}

export function findPlayerSong(catalog: Catalog, needle: string): { track: Track; channel: Channel } | null {
  const want = (asKey(needle) || needle.trim()).toLowerCase();
  if (!want) return null;
  let byTitle: { track: Track; channel: Channel } | null = null;
  for (const channel of catalog.channels) {
    for (const track of channel.tracks) {
      if (asKey(track.id) === want || asKey(track.slug) === want || songKey(track) === want) {
        return { track, channel };
      }
      if (!byTitle && titleKey(track) === want) byTitle = { track, channel };
    }
  }
  return byTitle;
}

/** Player ids, public slugs, titles, and aliases — used for uniqueness checks. */
export function findSong(catalog: Catalog, needle: string): { track: Track; channel: Channel } | null {
  return findPlayerSong(catalog, needle) || findSongByAlias(catalog, needle);
}

export function slugTaken(catalog: Catalog, slug: string, exceptTrackId = "", exceptStationSlug = ""): boolean {
  const want = asKey(slug) || parseAliasToken(slug);
  if (!want) return false;
  if (isReservedPublicPath(want)) return true;
  for (const channel of catalog.channels) {
    if (channel.slug !== exceptStationSlug && stationKeys(channel).includes(want)) return true;
    for (const track of channel.tracks) {
      if (exceptTrackId && track.id === exceptTrackId) continue;
      if (trackKeys(track).includes(want)) return true;
    }
  }
  return false;
}
