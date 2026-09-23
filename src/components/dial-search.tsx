import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo } from "react";
import { CoverArt } from "@/components/cover-art";
import { formatClock } from "@/lib/cn";
import { durationOf } from "@/lib/playback";
import { experienceFromChannel } from "@/lib/experiences";
import { searchDial } from "@/lib/search";
import { songKey } from "@/lib/song-url";
import { usePlayerStore } from "@/lib/player-store";
import type { Catalog } from "@/lib/types";

export function DialSearch({
  catalog,
  query,
  onQuery,
  autoFocus = false,
  heading = "Search",
}: {
  catalog: Catalog;
  query: string;
  onQuery: (next: string) => void;
  autoFocus?: boolean;
  heading?: string;
}) {
  const cueTrack = usePlayerStore((s) => s.cueTrack);
  const groups = usePlayerStore((s) => s.cutGroups);
  const needle = query.trim();
  const results = useMemo(() => (needle.length >= 2 ? searchDial(catalog, needle, false, groups) : { stations: [], songs: [] }), [catalog, groups, needle]);
  const searching = needle.length >= 2;

  return (
    <div>
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">{heading}</span>
        <span className="relative mt-1 block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
          <input
            className="input pl-10"
            value={query}
            autoFocus={autoFocus}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Song, artist, tag, station, filename"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
          />
        </span>
      </label>
      {needle.length === 1 ? <p className="mt-2 text-sm text-subtle">Type one more letter.</p> : null}
      {searching && results.stations.length === 0 && results.songs.length === 0 ? (
        <p className="mt-4 text-muted">Nothing on the dial matches “{needle}”.</p>
      ) : null}
      {results.stations.length > 0 ? (
        <section className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">Stations · {results.stations.length}</p>
          <ul className="mt-2 divide-y divide-line">
            {results.stations.map(({ channel }) => {
              const experience = experienceFromChannel(channel);
              const open = experience
                ? { to: "/experiences/$slug" as const, slug: experience.slug }
                : { to: "/channel/$slug" as const, slug: channel.slug };
              return (
              <li key={channel.slug} className="py-3">
                <Link to={open.to} params={{ slug: open.slug }} className="flex items-center gap-3">
                  <CoverArt src={channel.cover} alt="" className="size-12 shrink-0 rounded-md" />
                  <span className="min-w-0">
                    <span className="block truncate font-display text-lg">{channel.name}</span>
                    <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                      {channel.kind} · {channel.energy}
                      {channel.tags?.length ? ` · ${channel.tags.slice(0, 4).join(" · ")}` : ""}
                    </span>
                  </span>
                </Link>
              </li>
              );
            })}
          </ul>
        </section>
      ) : null}
      {results.songs.length > 0 ? (
        <section className="mt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">Songs · {results.songs.length}</p>
          <ul className="mt-2 divide-y divide-line">
            {results.songs.map(({ track, channel, copies }) => (
              <li key={track.id} className="py-3">
                <div className="flex items-center gap-3">
                  <CoverArt src={track.coverUrl || channel.cover} alt="" className="size-12 shrink-0 rounded-md" />
                  <Link to="/player/$id" params={{ id: songKey(track) }} className="min-w-0 flex-1">
                    <span className="block truncate font-display text-lg">{track.title}</span>
                    <span className="block truncate text-sm text-muted">
                      {track.artist}
                      <span className="text-subtle"> · {channel.name}</span>
                      {copies > 1 ? <span className="text-subtle"> · {copies} copies</span> : null}
                    </span>
                    {track.tags && track.tags.length > 0 ? (
                      <span className="mt-1 block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                        {track.tags.join(" · ")}
                      </span>
                    ) : null}
                  </Link>
                  <span className="hidden font-mono text-[11px] tabular-nums text-subtle sm:inline">{formatClock(durationOf(track))}</span>
                  <button
                    type="button"
                    onClick={() => void cueTrack(channel.slug, track.id)}
                    className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
                  >
                    Play
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

