import type { CutCopy } from "@/lib/cuts";

export const LIBRARY_ROOT = "radio/library";

function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function libraryFileName(title: string): string {
  const stem = title.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim() || "track";
  return `${stem}.mp3`;
}

export function libraryKeyFor(title: string): string {
  return `${LIBRARY_ROOT}/${libraryFileName(title)}`;
}

export type LibraryCopy = {
  trackId: string;
  title: string;
  slug: string;
  name: string;
  folder: string;
  filename: string;
  audioUrl: string;
};

export type LibraryRow = {
  id: string;
  title: string;
  copies: LibraryCopy[];
  playlists: { slug: string; name: string }[];
  files: number;
  libraryKey: string;
  shelved: boolean;
};

export function mapLibrary(copies: CutCopy[]): LibraryRow[] {
  const bags = new Map<string, CutCopy[]>();
  for (const copy of copies) {
    const id = fold(copy.track.title) || copy.track.id;
    const bag = bags.get(id);
    if (bag) bag.push(copy);
    else bags.set(id, [copy]);
  }
  const rows: LibraryRow[] = [];
  for (const [id, group] of bags) {
    const title = group[0]?.track.title || id;
    const playlists: { slug: string; name: string }[] = [];
    const seen = new Set<string>();
    const files = new Set<string>();
    const mapped: LibraryCopy[] = group.map((copy) => {
      if (!seen.has(copy.channel.slug)) {
        seen.add(copy.channel.slug);
        playlists.push({ slug: copy.channel.slug, name: copy.channel.name });
      }
      files.add(copy.track.audioUrl.split("?")[0] ?? copy.track.audioUrl);
      return {
        trackId: copy.track.id,
        title: copy.track.title,
        slug: copy.channel.slug,
        name: copy.channel.name,
        folder: copy.folder,
        filename: copy.filename,
        audioUrl: copy.track.audioUrl,
      };
    });
    const shelved = mapped.length > 0 && mapped.every((copy) => copy.folder === LIBRARY_ROOT || copy.folder.startsWith(`${LIBRARY_ROOT}/`));
    rows.push({
      id,
      title,
      copies: mapped,
      playlists,
      files: files.size,
      libraryKey: libraryKeyFor(title),
      shelved,
    });
  }
  return rows.sort((a, b) => b.playlists.length - a.playlists.length || b.files - a.files || a.title.localeCompare(b.title));
}

export function libraryByTrack(rows: LibraryRow[]): Map<string, LibraryRow> {
  const map = new Map<string, LibraryRow>();
  for (const row of rows) for (const copy of row.copies) map.set(copy.trackId, row);
  return map;
}

function keeperScore(copy: LibraryCopy): number {
  const file = copy.filename.toLowerCase();
  const folder = copy.folder.toLowerCase();
  let score = 0;
  if (folder === LIBRARY_ROOT || folder.startsWith(`${LIBRARY_ROOT}/`)) score += 100;
  if (file.endsWith(".mp3")) score += 40;
  else if (file.endsWith(".wav")) score -= 30;
  if (folder.includes("official")) score += 8;
  if (folder.startsWith("radio/rose")) score += 4;
  score -= Math.min(folder.length, 80) / 100;
  return score;
}

export function pickKeeper(copies: LibraryCopy[]): LibraryCopy {
  return [...copies].sort((a, b) => keeperScore(b) - keeperScore(a) || a.filename.localeCompare(b.filename))[0] ?? copies[0];
}

export function keeperReason(copy: LibraryCopy): string {
  const file = copy.filename.toLowerCase();
  const folder = copy.folder.toLowerCase();
  const parts: string[] = [];
  if (folder === LIBRARY_ROOT || folder.startsWith(`${LIBRARY_ROOT}/`)) parts.push("already in the library");
  if (file.endsWith(".mp3")) parts.push("mp3");
  else if (file.endsWith(".wav")) parts.push("wav, no mp3 to prefer");
  if (folder.includes("official")) parts.push("official station copy");
  else if (folder.startsWith("radio/rose")) parts.push("Rose copy");
  return parts.join(" · ") || "first copy";
}

export type LibraryPlan = {
  row: LibraryRow;
  keep: LibraryCopy;
  because: string;
  left: LibraryCopy[];
};

/** Songs that still have more than one file. One keeper. The others stay on R2. */
export function consolidationPlans(rows: LibraryRow[]): LibraryPlan[] {
  const plans: LibraryPlan[] = [];
  for (const row of rows) {
    if (row.files < 2) continue;
    const keep = pickKeeper(row.copies);
    const keepUrl = keep.audioUrl.split("?")[0];
    const left = row.copies.filter((copy) => copy.audioUrl.split("?")[0] !== keepUrl);
    if (left.length === 0) continue;
    plans.push({ row, keep, because: keeperReason(keep), left });
  }
  return plans;
}
