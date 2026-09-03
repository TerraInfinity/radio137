import seed from "@/data/catalog.json";
import type { Catalog, Channel, StationKind, Track } from "@/lib/types";

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

export function normalizeKind(value: string | null | undefined): StationKind {
  const raw = (value ?? "").toLowerCase().replace(/[\s_]+/g, "-");
  if (raw === "fixed" || raw === "linear" || raw === "album" || raw === "experience") return "fixed";
  if (raw === "ondemand" || raw === "on-demand" || raw === "vault" || raw === "demand") return "ondemand";
  return "live";
}

export function kindLabel(kind: string): string {
  const k = normalizeKind(kind);
  if (k === "fixed") return "Fixed";
  if (k === "ondemand") return "On demand";
  return "Live";
}

export function kindHint(kind: string): string {
  const k = normalizeKind(kind);
  if (k === "fixed") return "Start-to-finish. Plays the list in order.";
  if (k === "ondemand") return "Vault. Pick any cut.";
  return "Clockwork. Shared station clock.";
}

export function listChannels(): Channel[] {
  return catalog.channels;
}

export function publicChannels(): Channel[] {
  return catalog.channels.filter((channel) => channel.enabled && !isChannelNsfw(channel));
}

export function featuredChannels(): Channel[] {
  return publicChannels()
    .filter((channel) => channel.featured)
    .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99) || a.name.localeCompare(b.name));
}

export function getChannel(slug: string): Channel | undefined {
  const direct = catalog.channels.find((channel) => channel.slug === slug);
  if (direct) return direct;
  return catalog.channels.find((channel) => channel.slug.startsWith(`${slug}-`) || channel.slug.endsWith(`-${slug}`));
}

export function isAdultTrack(track: Track): boolean {
  return Boolean(track.nsfw);
}

export function isChannelNsfw(channel: Channel): boolean {
  return channel.nsfw || /18\+|nsfw|explict|explicit/.test(`${channel.slug} ${channel.name} ${channel.category}`);
}

export function channelIsLive(channel: Channel): boolean {
  return channel.enabled && normalizeKind(channel.kind || channel.mode) === "live";
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
    if (track) return { track, channel, locked: isAdultTrack(track) && !isChannelNsfw(channel) };
  }
  return null;
}

export function stationSkin(channel: Channel): "glaum" | "waheguru" | "buzz" | "none" {
  if (channel.skin === "glaum" || channel.glaumules || /glaum|glåüm|glaom/i.test(channel.slug + channel.name)) return "glaum";
  if (channel.skin === "waheguru" || /waheguru/i.test(channel.slug + channel.name)) return "waheguru";
  return "none";
}
