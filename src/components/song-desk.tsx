import { useEffect, useMemo, useState } from "react";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getSeedCatalog } from "@/lib/catalog";
import { listCutCopies } from "@/lib/cuts";
import { renameSongCopies, shelveLibrarySong } from "@/lib/desk-api";
import { libraryByTrack, mapLibrary, consolidationPlans, type LibraryCopy, type LibraryPlan, type LibraryRow } from "@/lib/library-map";
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

const SKIP_KEY = "radio.library.skipped";

function readSkips(): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SKIP_KEY) || "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function LibraryShelf({ rows }: { rows: LibraryRow[] }) {
  const dupes = rows.filter((row) => row.files > 1);
  const shelved = rows.filter((row) => row.shelved).length;
  const [review, setReview] = useState(false);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [choice, setChoice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const plans = useMemo(() => consolidationPlans(rows).filter((plan) => !skipped.includes(plan.row.id)), [rows, skipped]);
  const plan = plans[0];
  const keep = plan?.row.copies.find((copy) => copy.trackId === choice) ?? plan?.keep;

  useEffect(() => {
    setSkipped(readSkips());
  }, []);

  function skip(id: string) {
    const next = [...skipped, id];
    setSkipped(next);
    setChoice(null);
    window.localStorage.setItem(SKIP_KEY, JSON.stringify(next));
  }

  async function approve(current: LibraryPlan, keeper: LibraryCopy) {
    setBusy(true);
    try {
      const result = await shelveLibrarySong({
        data: {
          channelSlug: keeper.slug,
          trackId: keeper.trackId,
          members: current.row.copies.map((copy) => ({ channelSlug: copy.slug, trackId: copy.trackId })),
        },
      });
      take(result);
      setChoice(null);
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl bg-bg-elevated p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Library</p>
      <h2 className="mt-1 font-display text-2xl font-semibold">One file, every playlist</h2>
      <p className="mt-2 max-w-prose text-sm text-muted">
        {rows.length} songs · {shelved} already in radio/library · {dupes.length} still split across folders. Nothing is deleted.
      </p>
      <button
        type="button"
        onClick={() => {
          setReview((value) => !value);
          setChoice(null);
        }}
        className="mt-4 inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg"
      >
        {review ? "Leave review" : `Review duplicates${dupes.length ? ` · ${dupes.length}` : ""}`}
      </button>
      {review ? (
        plan && keep ? (
          <article className="mt-4 rounded-xl bg-bg p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">{plans.length} waiting</p>
            <h3 className="mt-1 font-display text-2xl">{plan.row.title}</h3>
            <p className="mt-2 text-sm text-muted">
              Use <span className="text-fg">{keep.filename}</span> for {plan.row.playlists.map((item) => item.name).join(", ")}. Copy it to {plan.row.libraryKey}. The other files stay.
            </p>
            <p className="mt-2 text-sm text-subtle">{keep.trackId === plan.keep.trackId ? plan.because : "You picked a different copy."}</p>
            <ul className="mt-3 grid gap-1">
              {plan.row.copies
                .filter((copy, index, all) => all.findIndex((item) => item.audioUrl.split("?")[0] === copy.audioUrl.split("?")[0]) === index)
                .map((copy) => (
                  <li key={copy.trackId}>
                    <button
                      type="button"
                      onClick={() => setChoice(copy.trackId)}
                      className={`text-left font-mono text-[10px] uppercase tracking-[0.06em] ${copy.trackId === keep.trackId ? "text-gold" : "text-subtle"}`}
                    >
                      {copy.trackId === keep.trackId ? "Keep · " : "Use instead · "}
                      {copy.folder}/{copy.filename}
                    </button>
                  </li>
                ))}
            </ul>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => void approve(plan, keep)}
                className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-40"
              >
                {busy ? "Saving…" : "Approve"}
              </button>
              <button type="button" disabled={busy} onClick={() => skip(plan.row.id)} className="inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
                Skip
              </button>
            </div>
          </article>
        ) : (
          <p className="mt-4 text-sm text-muted">No split songs left in this pass. The old files are still on R2 until you decide to remove them.</p>
        )
      ) : null}
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
