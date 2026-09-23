import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { StationVisual } from "@/components/station-visual";
import { usePlayerStore } from "@/lib/player-store";
import type { DialRow } from "@/components/dial-list";

export function FeatureBoard({ rows }: { rows: DialRow[] }) {
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const lead = rows[0];
  if (!lead) return null;
  const side = rows.slice(1);
  return (
    <section className="mt-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">Featured</p>
      <div className={side.length ? "mt-3 grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(16rem,0.9fr)]" : "mt-3"}>
        <FeatureFace row={lead} large onPlay={() => void tuneIn(lead.stationSlug, { forcePlay: true })} />
        {side.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {side.map((row) => (
              <FeatureFace key={`${row.kind}-${row.slug}`} row={row} onPlay={() => void tuneIn(row.stationSlug, { forcePlay: true })} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function FeatureFace({ row, large, onPlay }: { row: DialRow; large?: boolean; onPlay: () => void }) {
  return (
    <article className="group relative isolate min-h-52 overflow-hidden rounded-2xl bg-bg-elevated shadow-[var(--shadow-filigree)]">
      <Link to={row.href} params={{ slug: row.slug }} aria-label={`Open ${row.title}`} className="absolute inset-0 z-0">
        {row.channel ? (
          <StationVisual channel={row.channel} size={large ? "hero" : "card"} className="absolute inset-0 size-full" />
        ) : (
          <img src={row.cover} alt="" className="absolute inset-0 size-full object-cover" />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
      </Link>
      <div className="pointer-events-none relative z-10 flex h-full min-h-52 flex-col justify-end p-5 sm:p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
          {row.kind === "experience" ? "Experience" : "Station"}
          {row.kicker ? ` · ${row.kicker}` : ""}
        </p>
        <h2 className={large ? "mt-2 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl" : "mt-1 font-display text-2xl font-semibold text-white"}>
          {row.title}
        </h2>
        {row.line ? <p className="mt-1 max-w-prose font-glaum text-lg text-gold">{row.line}</p> : null}
        <div className="pointer-events-auto mt-4 flex gap-2">
          <button
            type="button"
            onClick={onPlay}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-black"
          >
            <Play className="size-3.5" />
            Play
          </button>
          <Link
            to={row.href}
            params={{ slug: row.slug }}
            className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white"
          >
            Open
          </Link>
        </div>
      </div>
    </article>
  );
}
