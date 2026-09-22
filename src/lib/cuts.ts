import { getPlayableTracks, isAdultTrack, isChannelNsfw } from "@/lib/catalog";
import { audioPathParts } from "@/lib/file-path";
import type { Catalog, Channel, Track } from "@/lib/types";

export type CutGroup = {
  canonicalId: string;
  memberIds: string[];
};

export type CutCopy = {
  track: Track;
  channel: Channel;
  folder: string;
  filename: string;
  stem: string;
};

export type CutCluster = {
  key: string;
  reason: "file" | "title" | "merged" | "similar";
  copies: CutCopy[];
  why?: string[];
  score?: number;
};

function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function listCutCopies(catalog: Catalog, includeNsfw = false): CutCopy[] {
  const rows: CutCopy[] = [];
  for (const channel of catalog.channels) {
    if (!channel.enabled) continue;
    if (!includeNsfw && isChannelNsfw(channel)) continue;
    for (const track of getPlayableTracks(channel)) {
      if (!includeNsfw && isAdultTrack(track) && !isChannelNsfw(channel)) continue;
      const parts = audioPathParts(track.audioUrl);
      rows.push({ track, channel, folder: parts.folder, filename: parts.filename, stem: parts.stem });
    }
  }
  return rows;
}

export function memberMap(groups: CutGroup[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const group of groups) {
    for (const id of group.memberIds) map.set(id, group.canonicalId);
    map.set(group.canonicalId, group.canonicalId);
  }
  return map;
}

function fileKey(copy: CutCopy): string {
  return fold(copy.stem || copy.filename);
}

function titleKey(copy: CutCopy): string {
  return fold(copy.track.title);
}

export function preferCanonical(copies: CutCopy[]): CutCopy {
  const ranked = [...copies].sort((a, b) => {
    const ao = /official|default/.test(a.channel.slug) ? 0 : 1;
    const bo = /official|default/.test(b.channel.slug) ? 0 : 1;
    if (ao !== bo) return ao - bo;
    if (a.folder.length !== b.folder.length) return a.folder.length - b.folder.length;
    return a.track.title.localeCompare(b.track.title) || a.track.id.localeCompare(b.track.id);
  });
  return ranked[0] ?? copies[0];
}

function groupBy(copies: CutCopy[], keyOf: (copy: CutCopy) => string): CutCluster[] {
  const bags = new Map<string, CutCopy[]>();
  for (const copy of copies) {
    const key = keyOf(copy);
    if (!key) continue;
    const list = bags.get(key) ?? [];
    list.push(copy);
    bags.set(key, list);
  }
  const clusters: CutCluster[] = [];
  for (const [key, list] of bags) {
    const unique = [...new Map(list.map((item) => [item.track.id, item])).values()];
    if (unique.length < 2) continue;
    clusters.push({ key, reason: "file", copies: unique.sort((a, b) => a.channel.name.localeCompare(b.channel.name)) });
  }
  return clusters.sort((a, b) => b.copies.length - a.copies.length || a.key.localeCompare(b.key));
}

export function filenameClusters(copies: CutCopy[]): CutCluster[] {
  return groupBy(copies, fileKey).map((cluster) => ({ ...cluster, reason: "file" as const }));
}

export function titleClusters(copies: CutCopy[], skipIds: Set<string>): CutCluster[] {
  const rest = copies.filter((copy) => !skipIds.has(copy.track.id));
  return groupBy(rest, (copy) => {
    const key = titleKey(copy);
    const tokens = key.split(" ").filter(Boolean);
    if (key.length < 12 && tokens.length < 3) return "";
    return key;
  }).map((cluster) => ({ ...cluster, reason: "title" as const }));
}

export function mergedClusters(copies: CutCopy[], groups: CutGroup[]): CutCluster[] {
  const byId = new Map(copies.map((copy) => [copy.track.id, copy]));
  const clusters: CutCluster[] = [];
  for (const group of groups) {
    const list = [...new Set(group.memberIds)].map((id) => byId.get(id)).filter((item): item is CutCopy => Boolean(item));
    if (list.length === 0) continue;
    clusters.push({ key: group.canonicalId, reason: "merged", copies: list });
  }
  return clusters;
}

export function autoCanonicalMap(copies: CutCopy[], groups: CutGroup[]): Map<string, string> {
  const map = memberMap(groups);
  for (const cluster of filenameClusters(copies)) {
    const keep = preferCanonical(cluster.copies);
    for (const copy of cluster.copies) {
      if (!map.has(copy.track.id)) map.set(copy.track.id, keep.track.id);
    }
  }
  return map;
}

export function idsShareSong(a: string, b: string, groups: CutGroup[]): boolean {
  if (a === b) return true;
  const map = memberMap(groups);
  return (map.get(a) ?? a) === (map.get(b) ?? b);
}

/** Keep one row per station. Extra members of a merge group are hidden, not deleted. */
export function extrasToHideOnStation(tracks: Track[], memberIds: string[], canonicalId: string): Track[] {
  const group = new Set(memberIds.filter(Boolean));
  const hits = tracks.filter((track) => track.enabled !== false && group.has(track.id));
  if (hits.length < 2) return [];
  const keep = hits.find((track) => track.id === canonicalId) ?? hits[0];
  return hits.filter((track) => track.id !== keep.id);
}

export function stationCopies(channel: Channel): CutCopy[] {
  return getPlayableTracks(channel).map((track) => {
    const parts = audioPathParts(track.audioUrl);
    return { track, channel, folder: parts.folder, filename: parts.filename, stem: parts.stem };
  });
}

export function copiesOf(catalog: Catalog, trackId: string, groups: CutGroup[], includeNsfw = false): CutCopy[] {
  const copies = listCutCopies(catalog, includeNsfw);
  const map = autoCanonicalMap(copies, groups);
  const canonical = map.get(trackId) ?? trackId;
  return copies.filter((copy) => (map.get(copy.track.id) ?? copy.track.id) === canonical);
}

export function collapseByCanonical<T extends { track: Track }>(rows: T[], copies: CutCopy[], groups: CutGroup[]): T[] {
  const map = autoCanonicalMap(copies, groups);
  const byId = new Map(rows.map((row) => [row.track.id, row]));
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    const canonical = map.get(row.track.id) ?? row.track.id;
    if (seen.has(canonical)) continue;
    seen.add(canonical);
    out.push(byId.get(canonical) ?? row);
  }
  return out;
}
