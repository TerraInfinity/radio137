import { createFileRoute, Link } from "@tanstack/react-router";
import { DialSearch } from "@/components/dial-search";
import { listPublicSongs } from "@/lib/catalog";
import { collapseByCanonical, listCutCopies } from "@/lib/cuts";
import { formatClock } from "@/lib/cn";
import { durationOf } from "@/lib/playback";
import { qSearch } from "@/lib/search";
import { songKey } from "@/lib/song-url";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/player/")({
  component: PlayerIndex,
  validateSearch: qSearch,
  head: () => ({ meta: [{ title: "Songs · Radio" }] }),
});

function PlayerIndex() {
  const catalog = usePlayerStore((s) => s.catalog);
  const groups = usePlayerStore((s) => s.cutGroups);
  const { q = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const searching = q.trim().length >= 2;
  const songs = collapseByCanonical(listPublicSongs(catalog), listCutCopies(catalog), groups);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Library</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Songs</h1>
      <p className="mt-2 max-w-prose text-muted">Every public song has its own page. Open one to play, share, or download.</p>
      <div className="mt-6">
        <DialSearch
          catalog={catalog}
          query={q}
          onQuery={(next) => void navigate({ search: { q: next.trim() ? next : undefined }, replace: true })}
          heading="Find a song"
        />
      </div>
      {searching ? null : (
        <>
          <p className="mt-6 text-sm text-muted">{songs.length} public songs.</p>
          <ul className="mt-4 divide-y divide-line">
            {songs.map(({ track, channel }) => (
              <li key={track.id} className="flex items-center gap-3 py-3">
                <Link to="/player/$id" params={{ id: songKey(track) }} className="min-w-0 flex-1 truncate font-display text-lg">
                  {track.title}
                </Link>
                <span className="hidden truncate text-sm text-muted sm:inline">{channel.name}</span>
                <span className="font-mono text-[11px] tabular-nums text-subtle">{formatClock(durationOf(track))}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
