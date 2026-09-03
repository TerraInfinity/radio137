import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TrackActions } from "@/components/track-actions";
import { getSong, listPublicSongs, publicChannels } from "@/lib/catalog";
import { formatClock } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/library")({
  component: Library,
  head: () => ({ meta: [{ title: "Library · Radio" }] }),
});

function Library() {
  const catalog = usePlayerStore((s) => s.catalog);
  const favorites = usePlayerStore((s) => s.favorites);
  const cueTrack = usePlayerStore((s) => s.cueTrack);
  const [tab, setTab] = useState<"stations" | "cuts" | "saved">("stations");
  const channels = (catalog.channels.length ? catalog.channels : publicChannels()).filter((channel) => channel.enabled && !channel.nsfw);
  const songs = useMemo(() => listPublicSongs(), [catalog]);
  const saved = favorites.flatMap((id) => {
    const row = getSong(id);
    return row && !row.locked ? [row] : [];
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-44">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Library</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Desk archive</h1>
      <div className="mt-6 flex flex-wrap gap-1">
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
        <ul className="mt-6 divide-y divide-line">
          {songs.slice(0, 80).map(({ track, channel }) => (
            <li key={track.id} className="py-3">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => void cueTrack(channel.slug, track.id)} className="min-w-0 flex-1 truncate text-left font-display text-lg">
                  {track.title}
                </button>
                <span className="hidden truncate text-sm text-muted sm:inline">{channel.name}</span>
                <span className="font-mono text-[11px] text-subtle">{formatClock(track.durationSec)}</span>
              </div>
              <TrackActions trackId={track.id} compact />
            </li>
          ))}
        </ul>
      ) : null}
      {tab === "saved" ? (
        <ul className="mt-6 divide-y divide-line">
          {saved.length === 0 ? <li className="py-3 text-muted">Star a cut from the player to keep it here.</li> : null}
          {saved.map((row) => (
            <li key={row.track.id} className="py-3">
              <div className="flex items-center gap-3">
                <Link to="/player/$id" params={{ id: row.track.id }} className="min-w-0 flex-1 truncate font-display text-lg">
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
    </div>
  );
}
