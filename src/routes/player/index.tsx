import { createFileRoute, Link } from "@tanstack/react-router";
import { listPublicSongs } from "@/lib/catalog";
import { formatClock } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/player/")({
  component: PlayerIndex,
  head: () => ({ meta: [{ title: "Player · Radio" }] }),
});

function PlayerIndex() {
  const songs = listPublicSongs();
  const cueTrack = usePlayerStore((s) => s.cueTrack);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Cuts</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Player</h1>
      <p className="mt-3 text-muted">Public songs on the dial. 18+ cuts stay off this list.</p>
      <ul className="mt-6 divide-y divide-line">
        {songs.map(({ track, channel }) => (
          <li key={track.id} className="flex items-center gap-3 py-3">
            <Link to="/player/$id" params={{ id: track.id }} className="min-w-0 flex-1">
              <p className="truncate font-display text-lg font-semibold">{track.title}</p>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                {formatClock(track.durationSec)} · {channel.name}
              </p>
            </Link>
            <button
              type="button"
              onClick={() => void cueTrack(channel.slug, track.id)}
              className="inline-flex h-11 items-center px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
            >
              Play
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
