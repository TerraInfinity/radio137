import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CoverArt } from "@/components/cover-art";
import { usePlayerStore } from "@/lib/player-store";
import { isLoopingVisual, stationVisualSrc } from "@/lib/media";
import type { DialRow } from "@/components/dial-list";

export function FeatureBoard({ rows }: { rows: DialRow[] }) {
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);
  const drag = useRef(0);
  const count = rows.length;
  const safe = count === 0 ? 0 : index % count;

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (count < 2 || paused || reduce) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setIndex((current) => (current + 1) % count);
    }, 8000);
    return () => window.clearInterval(id);
  }, [count, paused, reduce, safe]);

  if (!count) return null;

  function go(next: number) {
    setIndex((next + count) % count);
  }

  return (
    <section
      className="mt-10"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="flex items-end justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">Featured</p>
        {count > 1 ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
            {safe + 1} / {count}
          </p>
        ) : null}
      </div>
      <div
        className="relative mt-3 overflow-hidden rounded-3xl bg-black shadow-[var(--shadow-filigree)]"
        onPointerDown={(event) => {
          drag.current = event.clientX;
        }}
        onPointerUp={(event) => {
          const dx = event.clientX - drag.current;
          drag.current = Math.abs(dx) > 48 ? dx : 0;
          if (dx > 48) go(safe - 1);
          if (dx < -48) go(safe + 1);
        }}
        onClickCapture={(event) => {
          if (Math.abs(drag.current) > 48) {
            event.preventDefault();
            event.stopPropagation();
            drag.current = 0;
          }
        }}
      >
        <div className="relative aspect-[4/5] max-h-[78dvh] w-full sm:aspect-[16/9]">
          {rows.map((row, i) => (
            <FeatureSlide
              key={`${row.kind}-${row.slug}`}
              row={row}
              active={i === safe}
              reduce={reduce}
              onPlay={() => void tuneIn(row.stationSlug, { forcePlay: true })}
            />
          ))}
        </div>
        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(safe - 1)}
              className="absolute top-1/2 left-3 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm"
              aria-label="Previous feature"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(safe + 1)}
              className="absolute top-1/2 right-3 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm"
              aria-label="Next feature"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute right-4 bottom-4 z-20 flex gap-1.5" role="tablist" aria-label="Featured slides">
              {rows.map((row, i) => (
                <button
                  key={`${row.kind}-${row.slug}-dot`}
                  type="button"
                  role="tab"
                  aria-selected={i === safe}
                  aria-label={`${row.title}, slide ${i + 1}`}
                  onClick={() => go(i)}
                  className={i === safe ? "h-1.5 w-6 rounded-full bg-white" : "size-1.5 rounded-full bg-white/45"}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

function FeatureSlide({ row, active, reduce, onPlay }: { row: DialRow; active: boolean; reduce: boolean; onPlay: () => void }) {
  const src = row.channel ? stationVisualSrc(row.channel) : row.cover;
  const poster = row.cover && !isLoopingVisual(row.cover) ? row.cover : row.channel?.cover;
  return (
    <article className={active ? "absolute inset-0" : "pointer-events-none absolute inset-0 opacity-0"} aria-hidden={!active}>
      <Link to={row.href} params={{ slug: row.slug }} aria-label={`Open ${row.title}`} className="absolute inset-0">
        <CoverArt
          src={src || poster}
          poster={poster}
          alt=""
          fit="cover"
          motion={active && !reduce ? "loop" : "still"}
          className="absolute inset-0 size-full"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/15" />
      </Link>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-5 pr-24 pb-14 sm:p-8 sm:pr-36 sm:pb-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
          {row.kind === "experience" ? "Experience" : "Station"}
          {row.kicker ? ` · ${row.kicker}` : ""}
        </p>
        <h2 className="mt-2 max-w-3xl font-display text-4xl font-semibold tracking-tight text-white sm:text-6xl">{row.title}</h2>
        {row.line ? <p className="mt-2 line-clamp-2 max-w-xl font-glaum text-lg text-gold sm:text-xl">{row.line}</p> : null}
        <div className="pointer-events-auto mt-5 flex gap-2">
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
            className="inline-flex h-11 items-center rounded-md px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white"
          >
            Open
          </Link>
        </div>
      </div>
    </article>
  );
}
