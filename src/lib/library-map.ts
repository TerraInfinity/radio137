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
