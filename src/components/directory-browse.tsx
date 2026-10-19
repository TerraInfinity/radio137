import { useEffect, useMemo, useState, type ReactNode } from "react";
import { filterDirectory, parseDirectoryView, type DirectoryFields, type DirectoryView } from "@/lib/directory-search";
import { loadPersisted, savePersisted } from "@/lib/storage";

function useDirectoryView(fallback: DirectoryView): [DirectoryView, (next: DirectoryView) => void] {
  const [view, setView] = useState<DirectoryView>(fallback);
  useEffect(() => {
    const saved = parseDirectoryView(loadPersisted().directoryView);
    if (saved) setView(saved);
  }, []);
  function choose(next: DirectoryView) {
    setView(next);
    savePersisted({ ...loadPersisted(), directoryView: next });
  }
  return [view, choose];
}

export function DirectoryBrowse<T>({
  label,
  defaultView,
  items,
  fields,
  collapsed,
  render,
}: {
  label: string;
  defaultView: DirectoryView;
  items: T[];
  fields: (item: T) => DirectoryFields;
  collapsed?: number;
  render: (shown: T[], view: DirectoryView) => ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [view, setView] = useDirectoryView(defaultView);
  const matches = useMemo(() => filterDirectory(items, query, fields), [items, query, fields]);
  const searching = query.trim().length > 0;
  const shown = searching || !collapsed || open ? matches : matches.slice(0, collapsed);
  const more = matches.length - shown.length;
  return (
    <div className="mt-8">
      <div className="sticky top-14 z-20 -mx-4 flex flex-col gap-2 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search {label}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${label}`}
            aria-label={`Search ${label}`}
            className="input h-11 w-full pr-11 text-sm"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-0 right-0 inline-flex size-11 items-center justify-center text-subtle"
            >
              ×
            </button>
          ) : null}
        </label>
        <div className="flex shrink-0" role="group" aria-label={`${label} layout`}>
          <button
            type="button"
            aria-pressed={view === "cards"}
            onClick={() => setView("cards")}
            className={view === "cards" ? "inline-flex h-11 items-center rounded-l-md bg-fg px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bg" : "inline-flex h-11 items-center rounded-l-md px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted"}
          >
            Cards
          </button>
          <button
            type="button"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
            className={view === "list" ? "inline-flex h-11 items-center rounded-r-md bg-fg px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bg" : "inline-flex h-11 items-center rounded-r-md px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted"}
          >
            List
          </button>
        </div>
      </div>
      {searching && matches.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-bg-elevated px-4 py-8">
          <p className="font-display text-2xl">No matches for “{query.trim()}”</p>
          <button type="button" onClick={() => setQuery("")} className="mt-3 inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.16em] text-gold">
            Clear search
          </button>
        </div>
      ) : (
        <div className="mt-4">{render(shown, view)}</div>
      )}
      {!searching && collapsed && (more > 0 || (open && matches.length > collapsed)) ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="mt-3 inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.16em] text-gold"
        >
          {open ? "Show less" : `Show the rest · ${more}`}
        </button>
      ) : null}
    </div>
  );
}
