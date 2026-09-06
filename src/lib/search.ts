import { fileLocationLabel } from "@/lib/file-path";
import { getPlayableTracks, isAdultTrack, isChannelNsfw } from "@/lib/catalog";
import { autoCanonicalMap, listCutCopies, type CutGroup } from "@/lib/cuts";
import type { Catalog, Channel, Track } from "@/lib/types";

export type SongHit = { track: Track; channel: Channel; score: number; copies: number };
export type StationHit = { channel: Channel; score: number };

export function foldText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function searchTokens(query: string): string[] {
  return foldText(query)
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

function hay(...parts: Array<string | string[] | undefined | null>): string {
  return foldText(
    parts
      .flatMap((part) => (Array.isArray(part) ? part : part ? [part] : []))
      .join(" "),
  );
}

function scoreField(field: string, tokens: string[], weight: number): number {
  const text = foldText(field);
  if (!text) return 0;
  let score = 0;
  for (const token of tokens) {
    if (text === token) score += weight * 4;
    else if (text.startsWith(token)) score += weight * 2;
    else if (` ${text} `.includes(` ${token} `) || text.includes(token)) score += weight;
  }
  return score;
}

function allTokensIn(haystack: string, tokens: string[]): boolean {
  return tokens.every((token) => haystack.includes(token));
}

export function searchStations(catalog: Catalog, query: string, includeNsfw = false): StationHit[] {
  const tokens = searchTokens(query);
  if (tokens.length === 0) return [];
  const hits: StationHit[] = [];
  for (const channel of catalog.channels) {
    if (!channel.enabled) continue;
    if (!includeNsfw && isChannelNsfw(channel)) continue;
    const blob = hay(channel.name, channel.slug, channel.energy, channel.category, channel.description, channel.tags, channel.kind, channel.mode);
    if (!allTokensIn(blob, tokens)) continue;
    const score =
      scoreField(channel.name, tokens, 12) +
      scoreField(channel.slug, tokens, 8) +
      scoreField((channel.tags ?? []).join(" "), tokens, 7) +
      scoreField(channel.category, tokens, 5) +
      scoreField(channel.energy, tokens, 4) +
      scoreField(channel.description, tokens, 2);
    hits.push({ channel, score });
  }
  return hits.sort((a, b) => b.score - a.score || a.channel.name.localeCompare(b.channel.name)).slice(0, 24);
}

export function searchSongs(catalog: Catalog, query: string, includeNsfw = false, groups: CutGroup[] = []): SongHit[] {
  const tokens = searchTokens(query);
  if (tokens.length === 0) return [];
  const copies = listCutCopies(catalog, includeNsfw);
  const canonical = autoCanonicalMap(copies, groups);
  const copyCount = new Map<string, number>();
  for (const copy of copies) {
    const id = canonical.get(copy.track.id) ?? copy.track.id;
    copyCount.set(id, (copyCount.get(id) ?? 0) + 1);
  }
  const hits: SongHit[] = [];
  const seen = new Set<string>();
  for (const channel of catalog.channels) {
    if (!channel.enabled) continue;
    if (!includeNsfw && isChannelNsfw(channel)) continue;
    for (const track of getPlayableTracks(channel)) {
      if (!includeNsfw && isAdultTrack(track) && !isChannelNsfw(channel)) continue;
      const file = fileLocationLabel(track.audioUrl);
      const blob = hay(track.title, track.artist, track.id, track.slug, track.aliases, track.tags, file, channel.name, channel.slug, channel.tags);
      if (!allTokensIn(blob, tokens)) continue;
      const keepId = canonical.get(track.id) ?? track.id;
      if (seen.has(keepId)) continue;
      seen.add(keepId);
      const keep = copies.find((item) => item.track.id === keepId) ?? { track, channel };
      const score =
        scoreField(keep.track.title, tokens, 14) +
        scoreField(keep.track.artist, tokens, 9) +
        scoreField((keep.track.tags ?? []).join(" "), tokens, 8) +
        scoreField(keep.track.id, tokens, 6) +
        scoreField(keep.track.slug ?? "", tokens, 8) +
        scoreField((keep.track.aliases ?? []).join(" "), tokens, 7) +
        scoreField(file, tokens, 6) +
        scoreField(keep.channel.name, tokens, 3);
      hits.push({ track: keep.track, channel: keep.channel, score, copies: copyCount.get(keepId) ?? 1 });
    }
  }
  return hits.sort((a, b) => b.score - a.score || a.track.title.localeCompare(b.track.title)).slice(0, 60);
}

export function searchDial(catalog: Catalog, query: string, includeNsfw = false, groups: CutGroup[] = []) {
  return {
    stations: searchStations(catalog, query, includeNsfw),
    songs: searchSongs(catalog, query, includeNsfw, groups),
  };
}

export function qSearch(search: Record<string, unknown>): { q?: string } {
  return { q: typeof search.q === "string" && search.q.trim() ? search.q : undefined };
}

export function downloadName(track: Track): string {
  const base = (track.title || "cut").replace(/[<>:"/\\|?*]+/g, "").trim() || "cut";
  const match = track.audioUrl.match(/\.([a-z0-9]{2,5})(?:\?|#|$)/i);
  const ext = match?.[1]?.toLowerCase() || "mp3";
  return `${base}.${ext}`;
}

export { parseTags } from "@/lib/catalog";

