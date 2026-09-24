import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CoverArt } from "@/components/cover-art";
import { DialSearch } from "@/components/dial-search";
import { LibraryShelf, SongRename, TitleUse, useLibrary } from "@/components/song-desk";
import { getPlayableTracks, isChannelNsfw, listPublicSongs } from "@/lib/catalog";
import { collapseByCanonical, listCutCopies } from "@/lib/cuts";
import { formatClock } from "@/lib/cn";
import { experienceFromChannel } from "@/lib/experiences";
import { durationOf } from "@/lib/playback";
import { qSearch } from "@/lib/search";
import { songKey } from "@/lib/song-url";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel } from "@/lib/types";

export const Route = createFileRoute("/player/")({
  component: PlayerIndex,
  validateSearch: qSearch,
  head: () => ({ meta: [{ title: "Songs · Radio" }] }),
});

function PlayerIndex() {
  const catalog = usePlayerStore((s) => s.catalog);
  const groups = usePlayerStore((s) => s.cutGroups);
  const { isAdmin } = useRadioUser();
  const { q = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const searching = q.trim().length >= 2;
  const [view, setView] = useState<"stations" | "songs">("stations");
  const songs = collapseByCanonical(listPublicSongs(catalog), listCutCopies(catalog), groups);
  const library = useLibrary(catalog);
  const stations = catalog.channels
    .filter((channel) => channel.enabled && !isChannelNsfw(channel) && getPlayableTracks(channel).length > 0)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (a.featuredRank ?? 99) - (b.featuredRank ?? 99) || a.name.localeCompare(b.name));

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("radio.songs.view");
      if (saved === "songs" || saved === "stations") setView(saved);
    } catch {
      /* ignore */
    }
  }, []);

  function pickView(next: "stations" | "songs") {
    setView(next);
    try {
      window.localStorage.setItem("radio.songs.view", next);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Library</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Songs</h1>
      <p className="mt-2 max-w-prose text-muted">
        Stations stay closed until you open one. An experience and its station play the same list. The experience is the show. The station is the plain player.
      </p>
      <div className="mt-6">
        <DialSearch
          catalog={catalog}
          query={q}
          onQuery={(next) => void navigate({ search: { q: next.trim() ? next : undefined }, replace: true })}
          heading="Find a song"
        />
      </div>
      {isAdmin ? <LibraryShelf rows={library.rows} /> : null}
      {searching ? null : (
        <>
          <div className="mt-6 flex gap-2">
            <ViewPill on={view === "stations"} onClick={() => pickView("stations")}>
              Stations
            </ViewPill>
            <ViewPill on={view === "songs"} onClick={() => pickView("songs")}>
              All songs
            </ViewPill>
          </div>
          {view === "stations" ? (
            <StationShelf stations={stations} />
          ) : (
            <>
              <p className="mt-6 text-sm text-muted">{songs.length} public songs.</p>
              <ul className="mt-4 divide-y divide-line">
                {songs.map(({ track, channel }) => {
                  const mapped = library.byTrack.get(track.id);
                  return (
                    <li key={track.id} className="flex flex-wrap items-center gap-3 py-3">
                      <Link to="/player/$id" params={{ id: songKey(track) }} className="min-w-0 flex-1 truncate font-display text-lg">
                        {track.title}
                      </Link>
                      <span className="hidden truncate text-sm text-muted sm:inline">{channel.name}</span>
                      <span className="font-mono text-[11px] tabular-nums text-subtle">{formatClock(durationOf(track))}</span>
                      {isAdmin && mapped ? (
                        <div className="flex basis-full flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="text-sm text-muted">{mapped.playlists.map((item) => item.name).join(" · ")}</span>
                          <TitleUse title={track.title} copies={mapped.copies} />
                          <SongRename row={mapped} />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ViewPill({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={on ? "inline-flex h-10 items-center rounded-md bg-fg px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bg" : "inline-flex h-10 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"}
    >
      {children}
    </button>
  );
}

function StationShelf({ stations }: { stations: Channel[] }) {
  const [open, setOpen] = useState<string[]>([]);

  useEffect(() => {
    try {
      const slugs = (window.localStorage.getItem("radio.songs.open") || "").split(",").filter(Boolean);
      setOpen(slugs);
    } catch {
      /* ignore */
    }
  }, []);

  function toggle(slug: string) {
    setOpen((prev) => {
      const next = prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug];
      try {
        window.localStorage.setItem("radio.songs.open", next.join(","));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <ul className="mt-4 divide-y divide-line">
      {stations.map((channel) => {
        const xp = experienceFromChannel(channel);
        const tracks = getPlayableTracks(channel);
        const expanded = open.includes(channel.slug);
        return (
          <li key={channel.slug} className="py-1">
            <button type="button" onClick={() => toggle(channel.slug)} className="flex w-full items-center gap-3 py-2 text-left" aria-expanded={expanded}>
              <CoverArt src={channel.cover} alt="" className="size-12 shrink-0 rounded-md" motion="still" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-lg">{xp?.title || channel.name}</span>
                <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                  {tracks.length} {tracks.length === 1 ? "song" : "songs"}
                  {xp ? " · experience" : ""}
                  {channel.featured ? " · featured" : ""}
                </span>
              </span>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-gold">{expanded ? "Close" : "Open"}</span>
            </button>
            {expanded ? (
              <div className="pb-3 pl-[3.75rem]">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {xp ? (
                    <Link to="/experiences/$slug" params={{ slug: xp.slug }} className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
                      Experience
                    </Link>
                  ) : null}
                  <Link to="/channel/$slug" params={{ slug: channel.slug }} className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
                    Station
                  </Link>
                </div>
                <ol className="mt-2 divide-y divide-line">
                  {tracks.map((track, index) => (
                    <li key={track.id}>
                      <Link to="/player/$id" params={{ id: songKey(track) }} className="flex items-center gap-3 py-2">
                        <span className="w-7 shrink-0 font-mono text-[10px] tabular-nums text-subtle">{String(index + 1).padStart(2, "0")}</span>
                        <span className="min-w-0 flex-1 truncate text-sm">{track.title}</span>
                        <span className="shrink-0 font-mono text-[10px] tabular-nums text-subtle">{formatClock(durationOf(track))}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
