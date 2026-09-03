import seed from "@/data/catalog.json";
import type { Catalog, Channel, Track } from "@/lib/types";

const seedCatalog = seed as Catalog;
let catalog = seedCatalog;

export function getSeedCatalog(): Catalog {
  return seedCatalog;
}

export function getCatalog(): Catalog {
  return catalog;
}

export function setLiveCatalog(next: Catalog) {
  catalog = next;
}

export function listChannels(): Channel[] {
  return catalog.channels;
}

export function getChannel(slug: string): Channel | undefined {
  const direct = catalog.channels.find((channel) => channel.slug === slug);
  if (direct) return direct;
  const coverHit = catalog.channels.find((channel) => {
    const file = channel.cover.split("/").pop()?.replace(/\.jpg$/i, "");
    return file === slug;
  });
  if (coverHit) return coverHit;
  return catalog.channels.find(
    (channel) => channel.slug === `${slug}-frequency` || channel.slug.startsWith(`${slug}-`) || channel.slug.endsWith(`-${slug}`),
  );
}

export function isAdultTrack(track: Track): boolean {
  return Boolean(track.nsfw);
}

export function isChannelNsfw(channel: Channel): boolean {
  return (
    channel.nsfw ||
    /18\+|nsfw|explict|explicit/.test(`${channel.slug} ${channel.name} ${channel.category}`)
  );
}

export function channelIsLive(channel: Channel): boolean {
  return channel.enabled && (channel.kind === "live" || channel.mode === "live");
}

export function getPlayableTracks(channel: Channel | undefined | null): Track[] {
  if (!channel || channel.enabled === false) return [];
  const adult = isChannelNsfw(channel);
  return channel.tracks.filter(
    (track) =>
      track.enabled !== false &&
      track.durationSec > 0 &&
      Boolean(track.audioUrl) &&
      (adult || !isAdultTrack(track)),
  );
}

export function listPublicSongs(): Array<{ track: Track; channel: Channel }> {
  const rows: Array<{ track: Track; channel: Channel }> = [];
  const seen = new Set<string>();
  for (const channel of catalog.channels) {
    if (!channel.enabled || isChannelNsfw(channel)) continue;
    for (const track of getPlayableTracks(channel)) {
      if (seen.has(track.id)) continue;
      seen.add(track.id);
      rows.push({ track, channel });
    }
  }
  return rows.sort((a, b) => a.track.title.localeCompare(b.track.title));
}

export function getSong(id: string) {
  for (const channel of catalog.channels) {
    const track = channel.tracks.find((item) => item.id === id);
    if (!track) continue;
    if (!channel.enabled || isChannelNsfw(channel) || isAdultTrack(track)) {
      return { track, channel, locked: true as const };
    }
    return { track, channel, locked: false as const };
  }
  return undefined;
}
