import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DialSearch } from "@/components/dial-search";
import { TrackActions } from "@/components/track-actions";
import { getSong, listPublicSongs, publicChannels } from "@/lib/catalog";
import { collapseByCanonical, listCutCopies } from "@/lib/cuts";
import { formatClock } from "@/lib/cn";
import { qSearch } from "@/lib/search";
import { songKey } from "@/lib/song-url";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/library")({
  component: Library,
  validateSearch: qSearch,
  head: () => ({ meta: [{ title: "Library · Radio" }] }),
});

function Library() {
  const catalog = usePlayerStore((s) => s.catalog);
  const groups = usePlayerStore((s) => s.cutGroups);
  const favorites = usePlayerStore((s) => s.favorites);
  const cueTrack = usePlayerStore((s) => s.cueTrack);
  const { q = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [tab, setTab] = useState<"stations" | "cuts" | "saved">("cuts");
  const searching = q.trim().length >= 2;
  const channels = (catalog.channels.length ? catalog.channels : publicChannels()).filter((channel) => channel.enabled && !channel.nsfw);
  const songs = useMemo(() => collapseByCanonical(listPublicSongs(catalog), listCutCopies(catalog), groups), [catalog, groups]);
  const saved = favorites.flatMap((id) => {
    const row = getSong(id);
    return row && !row.locked ? [row] : [];
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-44">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Library</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Desk archive</h1>
      <div className="mt-6">
        <DialSearch
          catalog={catalog}
          query={q}
          onQuery={(next) => void navigate({ search: { q: next.trim() ? next : undefined }, replace: true })}
          heading="Find a cut or a station"
        />
      </div>
      {searching ? null : (
        <>
          <div className="mt-8 flex flex-wrap gap-1">
            {(
              [
                ["stations", "Stations"],
                ["cuts", "Cuts"],
                ["saved", "Favorites"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] ${tab === id ? "bg-fg text-bg" : "text-gold"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {tab === "stations" ? (
            <ul className="mt-6 divide-y divide-line">
              {channels.map((channel) => (
                <li key={channel.slug} className="py-3">
                  <Link to="/channel/$slug" params={{ slug: channel.slug }} className="font-display text-xl">
                    {channel.name}
                  </Link>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                    {channel.kind} · {channel.tracks.filter((track) => track.enabled !== false).length} cuts
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
          {tab === "cuts" ? (
            <>
              <p className="mt-4 text-sm text-muted">{songs.length} public cuts. Search above to open any one of them by title, artist, tag, or filename.</p>
              <ul className="mt-4 divide-y divide-line">
              {songs.slice(0, 80).map(({ track, channel }) => (
                <li key={track.id} className="py-3">
                  <div className="flex items-center gap-3">
                    <Link to="/player/$id" params={{ id: songKey(track) }} className="min-w-0 flex-1 truncate font-display text-lg">
                      {track.title}
                    </Link>
                    <button type="button" onClick={() => void cueTrack(channel.slug, track.id)} className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                      Play
                    </button>
                    <span className="hidden truncate text-sm text-muted sm:inline">{channel.name}</span>
                    <span className="font-mono text-[11px] text-subtle">{formatClock(track.durationSec)}</span>
                  </div>
                  <TrackActions trackId={track.id} compact />
                </li>
              ))}
              </ul>
            </>
          ) : null}
          {tab === "saved" ? (
            <ul className="mt-6 divide-y divide-line">
              {saved.length === 0 ? <li className="py-3 text-muted">Star a cut from the player to keep it here.</li> : null}
              {saved.map((row) => (
                <li key={row.track.id} className="py-3">
                  <div className="flex items-center gap-3">
                    <Link to="/player/$id" params={{ id: songKey(row.track) }} className="min-w-0 flex-1 truncate font-display text-lg">
                      {row.track.title}
                    </Link>
                    <Link to="/channel/$slug" params={{ slug: row.channel.slug }} className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                      {row.channel.name}
                    </Link>
                  </div>
                  <TrackActions trackId={row.track.id} compact />
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </div>
  );
}
