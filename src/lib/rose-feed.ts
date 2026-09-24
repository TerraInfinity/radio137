import type { Catalog, Track } from "./types.ts";

export const ROSE_FEED_PATH = "/feeds/rose.xml";
const MEDIA_BASE = "https://r2.terrainfinity.ca";

export function roseFeedUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}${ROSE_FEED_PATH}`;
}

/** Apple Podcasts subscribe link. The Watch copies episodes from the phone. */
export function applePodcastUrl(feedUrl: string): string {
  return `podcast:${feedUrl}`;
}

function xml(value: string): string {
  return value
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;")
    .replace(/'/g, "&" + "apos;");
}

export const ROSE_COVER_PATH = "/experiences/rose/cover-rose-3000.jpg";
export const ROSE_OWNER = { name: "Terrainfinity Radio", email: "career@terrainfinity.ca" };

export type RoseFeedFact = { bytes: number; durationSec: number };

function foldTitle(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function isRoseMp3(url: string): boolean {
  return url.split("?")[0].toLowerCase().endsWith(".mp3");
}

export function roseFeedCandidates(catalog: Catalog): Track[] {
  const channel = catalog.channels.find((item) => item.slug === "rose");
  if (!channel || channel.enabled === false) return [];
  const adult = Boolean(channel.nsfw);
  return channel.tracks.filter((track) => track.enabled !== false && Boolean(track.audioUrl) && (adult || !track.nsfw));
}

/** MP3s only. One row per title, or per identical size and length. Rite order wins. */
export function selectRoseFeed(tracks: Track[], facts: Record<string, RoseFeedFact> = {}): Track[] {
  const mp3s = tracks.filter((track) => isRoseMp3(track.audioUrl));
  const kept: Track[] = [];
  for (const track of mp3s) {
    const title = foldTitle(track.title);
    const fact = facts[track.id];
    const duplicate = kept.some((other) => {
      if (title && foldTitle(other.title) === title) return true;
      const previous = facts[other.id];
      if (!fact || !previous || fact.bytes < 1 || previous.bytes < 1) return false;
      return fact.bytes === previous.bytes && Math.abs(fact.durationSec - previous.durationSec) <= 1;
    });
    if (!duplicate) kept.push(track);
  }
  return kept;
}

export function roseDuplicateLabel(track: Track, tracks: Track[], facts: Record<string, RoseFeedFact> = {}): string {
  const title = foldTitle(track.title);
  const fact = facts[track.id];
  const siblings = tracks.filter((other) => {
    if (other.id === track.id) return false;
    if (title && foldTitle(other.title) === title) return true;
    const otherFact = facts[other.id];
    return Boolean(fact && otherFact && fact.bytes > 0 && fact.bytes === otherFact.bytes && Math.abs(fact.durationSec - otherFact.durationSec) <= 1);
  });
  if (siblings.length === 0) return "";
  return title || "same file";
}

function absolute(origin: string, src: string): string {
  if (!src) return "";
  if (src.startsWith("/") && !src.startsWith("//")) return `${origin.replace(/\/$/, "")}${src}`;
  try {
    const parsed = new URL(src);
    const host = parsed.hostname.toLowerCase();
    const managed = host === "r2.terrainfinity.ca" || host.endsWith(".r2.dev") || host.endsWith(".r2.cloudflarestorage.com");
    const path = parsed.pathname
      .split("/")
      .filter(Boolean)
      .map((part) => encodeURIComponent(decodeURIComponent(part)))
      .join("/");
    if (managed) return `${MEDIA_BASE}/${path}${parsed.search}`;
    return parsed.toString();
  } catch {
    return src;
  }
}

function clock(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function item(track: Track, episode: number, origin: string, fact: RoseFeedFact): string {
  const file = absolute(origin, track.audioUrl);
  const when = new Date(Date.UTC(2026, 0, episode)).toUTCString();
  const guid = `tag:radio.terrainfinity.ca,2026:rose:${track.id}`;
  return `    <item>
      <title>${xml(track.title)}</title>
      <itunes:title>${xml(track.title)}</itunes:title>
      <itunes:episode>${episode}</itunes:episode>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:author>${xml(track.artist || "Rose")}</itunes:author>
      <itunes:duration>${clock(fact.durationSec)}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
      <guid isPermaLink="false">${xml(guid)}</guid>
      <pubDate>${when}</pubDate>
      <enclosure url="${xml(file)}" length="${Math.round(fact.bytes)}" type="audio/mpeg" />
    </item>`;
}

/** RSS for Apple Podcasts. Only probed mp3s are enclosed. Guids stay on the track id. */
export function roseFeedXml(catalog: Catalog, origin: string, facts: Record<string, RoseFeedFact> = {}): string {
  const root = origin.replace(/\/$/, "") || "https://radio.terrainfinity.ca";
  const channel = catalog.channels.find((item) => item.slug === "rose");
  const tracks = selectRoseFeed(roseFeedCandidates(catalog), facts).flatMap((track) => {
    const fact = facts[track.id];
    const durationSec = fact && fact.durationSec > 1 ? fact.durationSec : track.durationSec;
    const bytes = fact?.bytes ?? 0;
    if (!(bytes > 0 && durationSec > 0)) return [];
    return [{ track, fact: { bytes, durationSec } }];
  });
  const self = roseFeedUrl(root);
  const page = `${root}/experiences/rose`;
  const image = absolute(root, ROSE_COVER_PATH);
  const summary = channel?.description || "Rose is a fixed-order rite. Send it to Podcasts. The phone keeps the list. The Watch copies from the phone while it charges.";
  const title = "Rose";
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(title)}</title>
    <link>${xml(page)}</link>
    <atom:link href="${xml(self)}" rel="self" type="application/rss+xml" />
    <language>en</language>
    <description>${xml(summary)}</description>
    <itunes:author>${xml(ROSE_OWNER.name)}</itunes:author>
    <itunes:owner>
      <itunes:name>${xml(ROSE_OWNER.name)}</itunes:name>
      <itunes:email>${xml(ROSE_OWNER.email)}</itunes:email>
    </itunes:owner>
    <itunes:summary>${xml(summary)}</itunes:summary>
    <itunes:type>serial</itunes:type>
    <itunes:explicit>false</itunes:explicit>
    <itunes:image href="${xml(image)}" />
    <itunes:category text="Music" />
    <image>
      <url>${xml(image)}</url>
      <title>${xml(title)}</title>
      <link>${xml(page)}</link>
    </image>
${tracks.map((row, index) => item(row.track, index + 1, root, row.fact)).join("\n")}
  </channel>
</rss>
`;
}
