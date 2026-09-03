import { createFileRoute, Link } from "@tanstack/react-router";
import { listPublicSongs } from "@/lib/catalog";
import { formatClock } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/player/")({
  component: PlayerIndex,
  head: () => ({ meta: [{ title: "Player · Radio" }] }),
});

function PlayerIndex() {
  usePlayerStore((s) => s.catalog);
  const songs = listPublicSongs();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-44">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Directory</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Cuts</h1>
      <ul className="mt-6 divide-y divide-line">
        {songs.slice(0, 80).map(({ track, channel }) => (
          <li key={track.id} className="flex items-center gap-3 py-3">
            <Link to="/player/$id" params={{ id: track.id }} className="min-w-0 flex-1 truncate font-display text-lg">
              {track.title}
            </Link>
            <span className="hidden truncate text-sm text-muted sm:inline">{channel.name}</span>
            <span className="font-mono text-[11px] text-subtle">{formatClock(track.durationSec)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
