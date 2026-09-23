import type { Catalog, Channel, Track } from "./types.ts";

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

function playable(channel: Channel | undefined): Track[] {
  if (!channel || channel.enabled === false) return [];
  const adult = Boolean(channel.nsfw);
  return channel.tracks.filter(
    (track) => track.enabled !== false && track.durationSec > 0 && Boolean(track.audioUrl) && (adult || !track.nsfw),
  );
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

function audioType(url: string): string {
  const path = url.split("?")[0].toLowerCase();
  if (path.endsWith(".m4a") || path.endsWith(".aac")) return "audio/mp4";
  if (path.endsWith(".wav")) return "audio/wav";
  return "audio/mpeg";
}

function clock(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function item(track: Track, episode: number, origin: string): string {
  const file = absolute(origin, track.audioUrl);
  const when = new Date(Date.UTC(2026, 0, episode)).toUTCString();
  const guid = `tag:radio.terrainfinity.ca,2026:rose:${track.id}`;
  return `    <item>
      <title>${xml(track.title)}</title>
      <itunes:title>${xml(track.title)}</itunes:title>
      <itunes:episode>${episode}</itunes:episode>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:author>${xml(track.artist || "Rose")}</itunes:author>
      <itunes:duration>${clock(track.durationSec)}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
      <guid isPermaLink="false">${xml(guid)}</guid>
      <pubDate>${when}</pubDate>
      <enclosure url="${xml(file)}" length="0" type="${audioType(file)}" />
    </item>`;
}

/** RSS for Apple Podcasts. Track order is the catalog order, which is the rite. */
export function roseFeedXml(catalog: Catalog, origin: string): string {
  const root = origin.replace(/\/$/, "") || "https://radio.terrainfinity.ca";
  const channel = catalog.channels.find((item) => item.slug === "rose");
  const tracks = playable(channel);
  const self = roseFeedUrl(root);
  const image = absolute(root, channel?.cover || "/covers/rose.jpg");
  const summary = channel?.description || "A fixed-order rite. Subscribe on the phone. The Watch copies the episodes from the phone.";
  const title = channel?.name || "Rose";
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(title)}</title>
    <link>${xml(self)}</link>
    <atom:link href="${xml(self)}" rel="self" type="application/rss+xml" />
    <language>en</language>
    <description>${xml(summary)}</description>
    <itunes:author>Rose</itunes:author>
    <itunes:summary>${xml(summary)}</itunes:summary>
    <itunes:type>serial</itunes:type>
    <itunes:explicit>false</itunes:explicit>
    <itunes:image href="${xml(image)}" />
    <itunes:category text="Music" />
    <image>
      <url>${xml(image)}</url>
      <title>${xml(title)}</title>
      <link>${xml(self)}</link>
    </image>
${tracks.map((track, index) => item(track, index + 1, root)).join("\n")}
  </channel>
</rss>
`;
}
