import { Link } from "@tanstack/react-router";
import { BambiMark } from "@/components/bambi-mark";
import { Pause, Play } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { usePlayerStore } from "@/lib/player-store";
import { cn } from "@/lib/cn";
import { getPlayableTracks } from "@/lib/catalog";
import { experienceFromChannel } from "@/lib/experiences";
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

function usePlayState(stationSlug: string) {
  const track = usePlayerStore((s) => s.track);
  const channelSlug = usePlayerStore((s) => s.channelSlug);
  const status = usePlayerStore((s) => s.status);
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const current = Boolean(track) && stationSlug === channelSlug;
  const playing = current && status === "playing";
  const label = status === "playing" ? "Playing now" : status === "loading" ? "Tuning…" : "Paused";
  return { current, playing, label, tuneIn, togglePlay };
}

function PlayButton({ title, stationSlug }: { title: string; stationSlug: string }) {
  const { current, playing, tuneIn, togglePlay } = usePlayState(stationSlug);
  return (
    <button
      type="button"
      aria-label={current && playing ? `Pause ${title}` : `Play ${title}`}
      onClick={() => {
        if (current) void togglePlay();
        else void tuneIn(stationSlug, { forcePlay: true });
      }}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-fg text-bg"
    >
      {current && playing ? <Pause className="size-4" /> : <Play className="size-4" />}
    </button>
  );
}

export function DialPlay({ title, stationSlug }: { title: string; stationSlug: string }) {
  return (
    <span className="mt-3 flex flex-wrap items-center gap-2">
      <PlayButton title={title} stationSlug={stationSlug} />
      <NowLine stationSlug={stationSlug} title={title} />
    </span>
  );
}

function NowLine({ stationSlug, title }: { stationSlug: string; title: string }) {
  const { current, playing, label } = usePlayState(stationSlug);
  if (!current) return null;
  return (
    <p className="mt-0.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-gold" aria-live="off" aria-label={`${label}: ${title}`}>
      <span className={cn("vu-meter", playing && "vu-meter-on")} aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </span>
      {label}
    </p>
  );
}

export function DialList({ rows }: { rows: DialRow[] }) {
  if (rows.length === 0) return null;
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-bg-elevated shadow-[var(--shadow-filigree)]">
      {rows.map((row) => (
        <DialRowItem key={`${row.kind}-${row.slug}`} row={row} />
      ))}
    </ul>
  );
}

function DialRowItem({ row }: { row: DialRow }) {
  const count = row.channel ? getPlayableTracks(row.channel).length : 0;
  const { current } = usePlayState(row.stationSlug);
  return (
    <li className={cn("flex items-center gap-3 px-3 py-2.5", current && "bg-gold/10")}>
      <Link to={row.href} params={{ slug: row.slug }} className="relative size-14 shrink-0 overflow-hidden rounded-lg" aria-label={`Open ${row.title}`}>
        <CoverArt src={row.cover || "/covers/ember-frequency.jpg"} alt="" className="size-full" />
      </Link>
      <Link to={row.href} params={{ slug: row.slug }} className="min-w-0 flex-1 py-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
          {row.kind === "experience" ? "Experience" : "Station"}
          {row.kicker ? ` · ${row.kicker}` : ""}
          {count ? ` · ${count} tracks` : ""}
        </p>
        <span className="block truncate font-display text-xl font-semibold">
          <BambiMark name={row.title} />
        </span>
        {row.line ? <span className="block truncate text-sm text-muted">{row.line}</span> : null}
        <NowLine stationSlug={row.stationSlug} title={row.title} />
      </Link>
      <PlayButton title={row.title} stationSlug={row.stationSlug} />
    </li>
  );
}

export function StationCards({ rows }: { rows: DialRow[] }) {
  if (rows.length === 0) return null;
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {rows.map((row) => (
        <StationCard key={`${row.kind}-${row.slug}`} row={row} />
      ))}
    </ul>
  );
}

function StationCard({ row }: { row: DialRow }) {
  const experience = row.channel ? experienceFromChannel(row.channel) : undefined;
  const count = row.channel ? getPlayableTracks(row.channel).length : 0;
  return (
    <li className="overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-filigree)]">
      <Link to={row.href} params={{ slug: row.slug }} className="relative block aspect-[4/3]" aria-label={`Open ${row.title}`}>
        <CoverArt src={row.cover || "/covers/ember-frequency.jpg"} alt="" fit="cover" className="absolute inset-0 size-full" />
      </Link>
      <div className="p-3">
        <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
          {row.kicker || (row.kind === "experience" ? "Experience" : "Station")}
          {count ? ` · ${count}` : ""}
        </p>
        <Link to={row.href} params={{ slug: row.slug }} className="mt-1 block truncate font-display text-xl font-semibold">
          <BambiMark name={row.title} />
        </Link>
        {row.line ? <p className="mt-2 line-clamp-2 text-sm text-muted">{row.line}</p> : null}
        <NowLine stationSlug={row.stationSlug} title={row.title} />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <PlayButton title={row.title} stationSlug={row.stationSlug} />
          <Link to={row.href} params={{ slug: row.slug }} className="inline-flex h-11 items-center px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
            Open
          </Link>
          {experience && row.href !== "/experiences/$slug" ? (
            <Link to="/experiences/$slug" params={{ slug: experience.slug }} className="inline-flex h-11 items-center px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              Experience
            </Link>
          ) : null}
        </div>
      </div>
    </li>
  );
}
