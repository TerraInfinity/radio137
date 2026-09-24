import { useEffect, useMemo, useState } from "react";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getSeedCatalog } from "@/lib/catalog";
import { listCutCopies } from "@/lib/cuts";
import { renameSongCopies, shelveLibrarySong, cleanSongTitles } from "@/lib/desk-api";
import { libraryByTrack, mapLibrary, consolidationPlans, cleanSongTitle, libraryKeyFor, titleFixes, type LibraryCopy, type LibraryPlan, type LibraryRow } from "@/lib/library-map";
import { usePlayerStore } from "@/lib/player-store";
import type { Catalog } from "@/lib/types";

function take(result: { tracks: Parameters<typeof applyCatalogEdits>[1]; stations?: Parameters<typeof applyCatalogEdits>[2] }) {
  usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations ?? []));
}

function paintTitles(members: { channelSlug: string; trackId: string }[], title: string) {
  const catalog = usePlayerStore.getState().catalog;
  usePlayerStore.getState().replaceCatalog({
    ...catalog,
    channels: catalog.channels.map((channel) => ({
      ...channel,
      tracks: channel.tracks.map((track) =>
        members.some((member) => member.channelSlug === channel.slug && member.trackId === track.id) ? { ...track, title } : track,
      ),
    })),
  });
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

function copyKey(copy: LibraryCopy): string {
  return `${copy.slug}:${copy.trackId}`;
}

function NameReview({ rows }: { rows: LibraryRow[] }) {
  const fixes = useMemo(() => titleFixes(rows), [rows]);
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [off, setOff] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  if (fixes.length === 0) return null;
  const chosen = fixes.filter((fix) => !off[fix.id]);

  async function apply() {
    const items = chosen.flatMap((fix) => {
      const title = (drafts[fix.id] ?? fix.to).trim();
      if (!title || title === fix.from) return [];
      return fix.copies.map((copy) => ({ channelSlug: copy.slug, trackId: copy.trackId, title }));
    });
    if (items.length === 0) return;
    const byTitle = new Map<string, { channelSlug: string; trackId: string }[]>();
    for (const item of items) {
      const bag = byTitle.get(item.title) ?? [];
      bag.push({ channelSlug: item.channelSlug, trackId: item.trackId });
      byTitle.set(item.title, bag);
    }
    for (const [title, members] of byTitle) paintTitles(members, title);
    setBusy(true);
    try {
      const result = await cleanSongTitles({ data: { items: items.slice(0, 500) } });
      take(result);
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg"
      >
        {open ? "Close names" : `Review names · ${fixes.length}`}
      </button>
      {open ? (
        <div className="mt-4">
          <p className="max-w-prose text-sm text-muted">
            Playlist numbers, “Azeirf (The Bambi Cloud Podcast)”, (SPOTISAVER), (draft), and a trailing — Azeirf. Uncheck anything that should stay. 3 6 9 is not in this list.
          </p>
          <ul className="mt-3 max-h-[28rem] space-y-2 overflow-y-auto">
            {fixes.map((fix) => (
              <li key={fix.id} className="rounded-lg bg-bg p-2">
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={!off[fix.id]}
                    onChange={() => setOff((current) => ({ ...current, [fix.id]: !current[fix.id] }))}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-subtle line-through">{fix.from}</span>
                    <input
                      className="input mt-1 h-10 w-full"
                      aria-label={`Name for ${fix.from}`}
                      value={drafts[fix.id] ?? fix.to}
                      onChange={(event) => setDrafts((current) => ({ ...current, [fix.id]: event.target.value }))}
                    />
                    <span className="mt-1 block text-subtle">{fix.copies.map((copy) => copy.name).join(" · ")}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={busy || chosen.length === 0}
            onClick={() => void apply()}
            className="mt-3 inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-40"
          >
            {busy ? "Saving…" : `Apply ${chosen.length}`}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function LibraryShelf({ rows }: { rows: LibraryRow[] }) {
  const dupes = rows.filter((row) => row.files > 1);
  const shelved = rows.filter((row) => row.shelved).length;
  const [review, setReview] = useState(false);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [choice, setChoice] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [aside, setAside] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const plans = useMemo(() => consolidationPlans(rows).filter((plan) => !skipped.includes(plan.row.id)), [rows, skipped]);
  const plan = plans[0];

  useEffect(() => {
    setSkipped(readSkips());
  }, []);

  useEffect(() => {
    setTitle(plan?.row.title ?? "");
    setChoice(null);
    setAside({});
  }, [plan?.row.id]);

  function skip(id: string) {
    const next = [...skipped, id];
    setSkipped(next);
    window.localStorage.setItem(SKIP_KEY, JSON.stringify(next));
  }

  function leaveOut(copy: LibraryCopy) {
    const key = copyKey(copy);
    setAside((current) => {
      if (key in current) {
        const next = { ...current };
        delete next[key];
        return next;
      }
      return { ...current, [key]: copy.title };
    });
    if (choice === copy.trackId) setChoice(null);
  }

  async function approve(current: LibraryPlan) {
    const name = title.trim();
    if (!name) return;
    const included = current.row.copies.filter((copy) => !(copyKey(copy) in aside));
    const keeper = included.find((copy) => copy.trackId === choice) ?? included.find((copy) => copy.trackId === current.keep.trackId) ?? included[0];
    setBusy(true);
    try {
      if (included.length > 0) {
        const result = await renameSongCopies({
          data: { title: name, members: included.map((copy) => ({ channelSlug: copy.slug, trackId: copy.trackId })) },
        });
        take(result);
      }
      for (const copy of current.row.copies) {
        const next = aside[copyKey(copy)]?.trim();
        if (!next || next === copy.title) continue;
        const result = await renameSongCopies({
          data: { title: next, members: [{ channelSlug: copy.slug, trackId: copy.trackId }] },
        });
        take(result);
      }
      if (keeper && included.length > 1) {
        const result = await shelveLibrarySong({
          data: {
            channelSlug: keeper.slug,
            trackId: keeper.trackId,
            members: included.map((copy) => ({ channelSlug: copy.slug, trackId: copy.trackId })),
          },
        });
        take(result);
      }
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  }

  const included = plan?.row.copies.filter((copy) => !(copyKey(copy) in aside)) ?? [];
  const keep = included.find((copy) => copy.trackId === choice) ?? included.find((copy) => copy.trackId === plan?.keep.trackId) ?? included[0];
  const libraryKey = libraryKeyFor(title.trim() || plan?.row.title || "track");

  return (
    <section className="mt-8 rounded-2xl bg-bg-elevated p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Library</p>
      <h2 className="mt-1 font-display text-2xl font-semibold">One file, every playlist</h2>
      <p className="mt-2 max-w-prose text-sm text-muted">
        {rows.length} songs · {shelved} already in radio/library · {dupes.length} still split across folders. Nothing is deleted.
      </p>
      <NameReview rows={rows} />
      <button
        type="button"
        onClick={() => setReview((value) => !value)}
        className="mt-4 inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg"
      >
        {review ? "Leave review" : `Review duplicates${dupes.length ? ` · ${dupes.length}` : ""}`}
      </button>
      {review ? (
        plan ? (
          <article className="mt-4 rounded-xl bg-bg p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">{plans.length} waiting</p>
            <label className="mt-3 block text-sm text-muted">
              Song name
              <input className="input mt-1 h-11 w-full" value={title} aria-label="Song name" onChange={(event) => setTitle(event.target.value)} />
            </label>
            <p className="mt-2 text-sm text-muted">
              {keep
                ? `Checked copies become this name and share ${keep.filename}. Left out copies stay their own song. The keeper is copied to ${libraryKey}.`
                : "Leave at least one copy in this song, or name the ones you take out and approve the rename only."}
            </p>
            <ul className="mt-3 grid gap-2">
              {plan.row.copies.map((copy) => {
                const key = copyKey(copy);
                const out = key in aside;
                return (
                  <li key={key} className="rounded-lg bg-bg-elevated p-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => leaveOut(copy)} className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                        {out ? "Include" : "Leave out"}
                      </button>
                      {!out && keep ? (
                        <button
                          type="button"
                          onClick={() => setChoice(copy.trackId)}
                          className={`text-left font-mono text-[10px] uppercase tracking-[0.06em] ${copy.trackId === keep.trackId ? "text-gold" : "text-subtle"}`}
                        >
                          {copy.trackId === keep.trackId ? "Keep" : "Use this file"}
                        </button>
                      ) : null}
                      {out ? <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Not this song</span> : null}
                    </div>
                    <p className="mt-1 text-sm">{copy.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-subtle">
                      {copy.title !== cleanSongTitle(copy.title) ? `${copy.title} · ` : ""}
                      {copy.folder}/{copy.filename}
                    </p>
                    {out ? (
                      <input
                        className="input mt-2 h-10 w-full"
                        value={aside[key]}
                        aria-label={`Name for ${copy.name}`}
                        onChange={(event) => setAside((current) => ({ ...current, [key]: event.target.value }))}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                disabled={busy || (included.length > 0 && !title.trim()) || (included.length === 0 && !plan.row.copies.some((copy) => {
                  const next = aside[copyKey(copy)]?.trim();
                  return Boolean(next && next !== copy.title);
                }))}
                onClick={() => void approve(plan)}
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

export function TitleUse({ title, copies }: { title: string; copies: LibraryCopy[] }) {
  const next = cleanSongTitle(title);
  const [busy, setBusy] = useState(false);
  if (!next || next === title.trim()) return null;
  const targets = copies.filter((copy) => copy.title.trim() === title.trim());

  async function apply() {
    if (targets.length === 0) return;
    const members = targets.map((copy) => ({ channelSlug: copy.slug, trackId: copy.trackId }));
    paintTitles(members, next);
    setBusy(true);
    try {
      const result = await renameSongCopies({ data: { title: next, members } });
      take(result);
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" disabled={busy} onClick={() => void apply()} className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
      {busy ? "Saving…" : `Use “${next}”`}
    </button>
  );
}

export function SongRename({ row }: { row: LibraryRow }) {
  const raw = row.copies.find((copy) => copy.title.trim() !== row.title)?.title ?? row.title;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(raw);
  const [busy, setBusy] = useState(false);

  async function save() {
    const title = value.trim();
    const members = row.copies.map((copy) => ({ channelSlug: copy.slug, trackId: copy.trackId }));
    if (!title || row.copies.every((copy) => copy.title.trim() === title)) {
      setOpen(false);
      return;
    }
    paintTitles(members, title);
    setBusy(true);
    try {
      const result = await renameSongCopies({ data: { title, members } });
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
      <button type="button" onClick={() => { setValue(raw); setOpen(true); }} className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
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
