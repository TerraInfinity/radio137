import seed from "@/data/catalog.json";
import { durationOf, rememberDuration } from "@/lib/playback";
import { findPlayerSong, findSongByAlias, findStation, findStationByAlias } from "@/lib/song-url";
import type { Catalog, Channel, ShuffleMode, StationKind, Track } from "@/lib/types";

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

export function patchTrackDuration(trackId: string, seconds: number) {
  rememberDuration(trackId, seconds);
}

export function trackDuration(track: Track): number {
  return durationOf(track);
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
  if (k === "ondemand") return "On demand. Pick any song.";
  return "Clockwork. Shared station clock.";
}

export function normalizeShuffle(value: string | null | undefined): ShuffleMode {
  const raw = (value ?? "").toLowerCase().trim();
  if (raw === "on" || raw === "always" || raw === "true" || raw === "shuffle") return "on";
  if (raw === "off" || raw === "false" || raw === "none") return "off";
  if (raw === "optional" || raw === "allow" || raw === "listener") return "optional";
  return "optional";
}

export function shuffleLabel(mode: ShuffleMode): string {
  if (mode === "on") return "Always shuffle";
  if (mode === "off") return "Playlist order";
  return "Listeners can shuffle";
}

export function shuffleHint(mode: ShuffleMode): string {
  if (mode === "on") return "Every listener hears a shuffled mix. The next song is never the one that just played.";
  if (mode === "off") return "Locked playlist order — for start-to-finish experiences. No shuffle toggle.";
  return "Guests can flip between playlist order and a mix. Experiences that need a sequence should stay on playlist order.";
}

export function shuffleActive(channel: Channel | undefined | null, listenerPref: boolean): boolean {
  if (!channel) return false;
  const mode = normalizeShuffle(channel.shuffle);
  if (mode === "on") return true;
  if (mode === "off") return false;
  return listenerPref;
}

export function parseTags(value: string | null | undefined): string[] {
  if (!value) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of value.split(/[,;]+/)) {
    const tag = raw.trim().replace(/\s+/g, " ");
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
    if (out.length >= 16) break;
  }
  return out;
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
  return findStation(catalog, slug) ?? undefined;
}

export function getStationByAlias(alias: string): Channel | null {
  return findStationByAlias(catalog, alias);
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
    (track) => track.enabled !== false && track.durationSec > 0 && Boolean(track.audioUrl) && (adult || !isAdultTrack(track)),
  );
}

export function listPublicSongs(source: Catalog = catalog): Array<{ track: Track; channel: Channel }> {
  const rows: Array<{ track: Track; channel: Channel }> = [];
  const seen = new Set<string>();
  for (const channel of source.channels) {
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
  const found = findPlayerSong(catalog, id);
  if (!found) return null;
  return wrapSong(found);
}

export function getSongByAlias(alias: string) {
  const found = findSongByAlias(catalog, alias);
  if (!found) return null;
  return wrapSong(found);
}

function wrapSong(found: { track: Track; channel: Channel }) {
  return { ...found, locked: isAdultTrack(found.track) && !isChannelNsfw(found.channel) };
}

export function stationsForSong(id: string): Channel[] {
  return catalog.channels.filter((channel) => channel.enabled && channel.tracks.some((track) => track.id === id && track.enabled !== false));
}

export function stationSkin(channel: Channel): "glaum" | "waheguru" | "buzz" | "none" {
  if (channel.skin === "glaum" || channel.glaumules || /glaum|glåüm|glaom/i.test(channel.slug + channel.name)) return "glaum";
  if (channel.skin === "waheguru" || /waheguru/i.test(channel.slug + channel.name)) return "waheguru";
  return "none";
}
