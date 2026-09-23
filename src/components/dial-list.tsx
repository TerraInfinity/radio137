import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useMemo, useState } from "react";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel } from "@/lib/types";

export type DialRow = {
  kind: "station" | "experience";
  slug: string;
  stationSlug: string;
  title: string;
  kicker: string;
  line: string;
  cover: string;
  href: "/channel/$slug" | "/experiences/$slug";
  weight: number;
  featured: boolean;
  channel?: Channel;
};

export function DialList({
  title,
  rows,
  collapsed = 6,
}: {
  title: string;
  rows: DialRow[];
  collapsed?: number;
}) {
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (needle.length < 2) return rows;
    return rows.filter((row) => `${row.title} ${row.kicker} ${row.line}`.toLowerCase().includes(needle));
  }, [q, rows]);
  const shown = open || q.trim().length >= 2 ? filtered : filtered.slice(0, collapsed);
  const more = filtered.length - shown.length;
  if (rows.length === 0) return null;
  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">{title}</p>
          <p className="mt-1 text-sm text-muted">Newer and most heard stay near the top.</p>
        </div>
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Filter"
          aria-label={`Filter ${title}`}
          className="input h-10 w-40 text-sm"
        />
      </div>
      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl bg-bg-elevated shadow-[var(--shadow-filigree)]">
        {shown.map((row) => (
          <li key={`${row.kind}-${row.slug}`} className="flex items-center gap-3 px-3 py-2.5">
            <Link to={row.href} params={{ slug: row.slug }} className="size-14 shrink-0 overflow-hidden rounded-lg">
              <img src={row.cover || "/covers/ember-frequency.jpg"} alt="" className="size-full object-cover" />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                {row.kind === "experience" ? "Experience" : "Station"}
                {row.featured ? " · featured" : ""}
              </p>
              <Link to={row.href} params={{ slug: row.slug }} className="block truncate font-display text-xl font-semibold">
                {row.title}
              </Link>
              {row.line ? <p className="truncate text-sm text-muted">{row.line}</p> : null}
            </div>
            <button
              type="button"
              aria-label={`Play ${row.title}`}
              onClick={() => void tuneIn(row.stationSlug, { forcePlay: true })}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-fg text-bg"
            >
              <Play className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      {more > 0 || (open && filtered.length > collapsed) ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="mt-3 inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.16em] text-gold"
        >
          {open ? "Show less" : `Show the rest · ${more}`}
        </button>
      ) : null}
    </section>
  );
}
