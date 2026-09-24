import { useMemo, useState } from "react";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getSeedCatalog } from "@/lib/catalog";
import { listCutCopies } from "@/lib/cuts";
import { renameSongCopies, shelveLibrarySong } from "@/lib/desk-api";
import { libraryByTrack, mapLibrary, type LibraryRow } from "@/lib/library-map";
import { usePlayerStore } from "@/lib/player-store";
import type { Catalog } from "@/lib/types";

function take(result: { tracks: Parameters<typeof applyCatalogEdits>[1]; stations?: Parameters<typeof applyCatalogEdits>[2] }) {
  usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations ?? []));
}

function fail(error: unknown) {
  window.alert(error instanceof Error ? error.message : "Library save failed");
}

export function useLibrary(catalog: Catalog) {
  return useMemo(() => {
    const rows = mapLibrary(listCutCopies(catalog, true));
    return { rows, byTrack: libraryByTrack(rows) };
  }, [catalog]);
}

export function LibraryShelf({ rows }: { rows: LibraryRow[] }) {
  const dupes = rows.filter((row) => row.files > 1);
  const shelved = rows.filter((row) => row.shelved).length;
  const [busy, setBusy] = useState<string | null>(null);

  async function shelve(row: LibraryRow) {
    const keep = row.copies.find((copy) => copy.filename.toLowerCase().endsWith(".mp3")) ?? row.copies[0];
    if (!keep) return;
    if (!window.confirm(`Copy “${row.title}” into ${row.libraryKey} and point ${row.playlists.length} playlist${row.playlists.length === 1 ? "" : "s"} at it?\n\nThe old files stay.`)) return;
    setBusy(row.id);
    try {
      const result = await shelveLibrarySong({
        data: {
          channelSlug: keep.slug,
          trackId: keep.trackId,
          members: row.copies.map((copy) => ({ channelSlug: copy.slug, trackId: copy.trackId })),
        },
      });
      take(result);
    } catch (error) {
      fail(error);
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mt-8 rounded-2xl bg-bg-elevated p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Library</p>
      <h2 className="mt-1 font-display text-2xl font-semibold">One file, every playlist</h2>
      <p className="mt-2 max-w-prose text-sm text-muted">
        {rows.length} songs · {shelved} already in radio/library · {dupes.length} still split across folders. Shelve copies the mp3 into radio/library and points each playlist at that file. Nothing is deleted.
      </p>
      {dupes.length === 0 ? <p className="mt-4 text-sm text-muted">No split songs in this catalog.</p> : null}
      <ul className="mt-4 space-y-3">
        {dupes.slice(0, 40).map((row) => (
          <li key={row.id} className="rounded-xl bg-bg p-3">
            <p className="font-display text-lg">{row.title}</p>
            <p className="mt-1 text-sm text-muted">{row.playlists.map((item) => item.name).join(" · ")}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">
              {row.files} files · {row.copies.map((copy) => copy.folder || "loose").join(" · ")}
            </p>
            <p className="mt-1 font-mono text-[10px] text-subtle">{row.libraryKey}</p>
            <button
              type="button"
              disabled={busy === row.id}
              onClick={() => void shelve(row)}
              className="mt-2 inline-flex h-10 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold disabled:opacity-40"
            >
              {busy === row.id ? "Shelving…" : "Shelve into library"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SongRename({ row }: { row: LibraryRow }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(row.title);
  const [busy, setBusy] = useState(false);

  async function save() {
    const title = value.trim();
    if (!title || title === row.title) {
      setOpen(false);
      return;
    }
    setBusy(true);
    try {
      const result = await renameSongCopies({
        data: { title, members: row.copies.map((copy) => ({ channelSlug: copy.slug, trackId: copy.trackId })) },
      });
      take(result);
      setOpen(false);
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => { setValue(row.title); setOpen(true); }} className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
        Rename
      </button>
    );
  }

  return (
    <form
      className="flex basis-full items-center gap-1"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <input className="input h-10 min-w-0 flex-1" value={value} autoFocus aria-label="Song title" onChange={(event) => setValue(event.target.value)} />
      <button type="submit" disabled={busy} className="inline-flex h-10 items-center px-2 font-mono text-[10px] uppercase text-gold">
        {busy ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
