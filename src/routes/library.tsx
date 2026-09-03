import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { listPublicSongs } from "@/lib/catalog";
import { formatClock } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/library")({
  component: LibraryPage,
  head: () => ({ meta: [{ title: "Library · Radio" }] }),
});

function LibraryPage() {
  const [query, setQuery] = useState("");
  const cueTrack = usePlayerStore((s) => s.cueTrack);
  const songs = useMemo(() => listPublicSongs(), []);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return songs;
    return songs.filter(({ track, channel }) =>
      `${track.title} ${track.artist} ${channel.name} ${track.id}`.toLowerCase().includes(needle),
    );
  }, [query, songs]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Vault</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Library</h1>
      <p className="mt-3 text-muted">Public cuts on the dial. 18+ stays off this list.</p>
      <label className="mt-6 block" htmlFor="library-q">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Search</span>
        <input
          id="library-q"
          className="input mt-1"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Title, artist, channel"
        />
      </label>
      {visible.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No cuts match.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line">
          {visible.map(({ track, channel }) => (
            <li key={track.id} className="flex min-h-14 items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <Link to="/player/$id" params={{ id: track.id }} className="block truncate font-display text-lg font-semibold">
                  {track.title}
                </Link>
                <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                  {track.artist} ·{" "}
                  <Link to="/channel/$slug" params={{ slug: channel.slug }}>
                    {channel.name}
                  </Link>
                </p>
              </div>
              <span className="hidden shrink-0 font-mono text-[11px] tabular-nums text-subtle sm:inline">
                {formatClock(track.durationSec)}
              </span>
              {track.originalUrl ? (
                <a
                  href={track.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-cyan sm:inline"
                >
                  Source
                </a>
              ) : null}
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
      )}
    </div>
  );
}
