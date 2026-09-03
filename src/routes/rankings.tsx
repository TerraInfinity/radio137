import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CoverArt } from "@/components/cover-art";
import { isChannelNsfw, listChannels, listPublicSongs } from "@/lib/catalog";
import { listenerLabel, sortByPopularity } from "@/lib/popularity";
import { usePresenceStore } from "@/lib/presence-store";
import { loadRanks, voteRank } from "@/lib/ranks";
import { loadFavorites } from "@/lib/favorites";

export const Route = createFileRoute("/rankings")({
  component: RankingsPage,
  head: () => ({ meta: [{ title: "Rankings · Radio" }] }),
});

function RankingsPage() {
  const presence = usePresenceStore((s) => s.snapshot);
  const [tick, setTick] = useState(0);
  const ranks = useMemo(() => {
    void tick;
    return loadRanks();
  }, [tick]);
  const favorites = useMemo(() => loadFavorites(), [tick]);
  const channels = useMemo(
    () =>
      sortByPopularity(
        listChannels().filter((channel) => channel.enabled || isChannelNsfw(channel)),
        presence,
        favorites,
        ranks.channels,
      ),
    [favorites, presence, ranks.channels],
  );
  const songs = useMemo(() => {
    return listPublicSongs()
      .map((row) => ({ ...row, score: ranks.songs[row.track.id] ?? 0 }))
      .sort((a, b) => b.score - a.score || a.track.title.localeCompare(b.track.title))
      .slice(0, 24);
  }, [ranks.songs]);

  const vote = (kind: "channels" | "songs", id: string, delta: 1 | -1) => {
    voteRank(kind, id, delta);
    setTick((n) => n + 1);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Dial</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Rankings</h1>
      <section className="mt-8">
        <h2 className="font-display text-2xl">Stations</h2>
        <ul className="mt-3 divide-y divide-line">
          {channels.map((channel, index) => {
            const live = presence?.live[channel.slug] ?? 0;
            const listens = presence?.listens[channel.slug] ?? 0;
            const viewers = presence?.viewers[channel.slug] ?? 0;
            const views = presence?.views[channel.slug] ?? 0;
            const label = listenerLabel(live, listens, viewers, views);
            return (
              <li key={channel.slug} className="flex min-h-16 items-center gap-3 py-2">
                <span className="w-8 font-mono text-[11px] text-subtle">{index + 1}</span>
                <CoverArt
                  src={channel.cover}
                  alt=""
                  dimmed={!channel.enabled}
                  className="size-12 shrink-0 rounded-md"
                />
                <div className="min-w-0 flex-1">
                  <Link to="/channel/$slug" params={{ slug: channel.slug }} className="block truncate font-display text-lg">
                    {channel.skin === "glaum" ? "Glåüm" : channel.name}
                  </Link>
                  <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                    {channel.enabled ? label || channel.energy : isChannelNsfw(channel) ? "18+ · Locked" : "Off air"}
                  </p>
                </div>
                <span className="w-8 text-right font-mono text-[11px] tabular-nums text-gold">
                  {ranks.channels[channel.slug] ?? 0}
                </span>
                {channel.enabled ? (
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => vote("channels", channel.slug, 1)}
                      className="inline-flex size-11 items-center justify-center font-mono text-[12px] text-muted"
                      aria-label={`Upvote ${channel.name}`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => vote("channels", channel.slug, -1)}
                      className="inline-flex size-11 items-center justify-center font-mono text-[12px] text-muted"
                      aria-label={`Downvote ${channel.name}`}
                    >
                      −
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="font-display text-2xl">Songs</h2>
        <ul className="mt-3 divide-y divide-line">
          {songs.map(({ track, channel, score }) => (
            <li key={track.id} className="flex min-h-14 items-center gap-3 py-2">
              <div className="min-w-0 flex-1">
                <Link to="/player/$id" params={{ id: track.id }} className="block truncate font-display text-lg">
                  {track.title}
                </Link>
                <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{channel.name}</p>
              </div>
              <span className="w-8 text-right font-mono text-[11px] tabular-nums text-gold">{score}</span>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => vote("songs", track.id, 1)}
                  className="inline-flex size-11 items-center justify-center font-mono text-[12px] text-muted"
                  aria-label={`Upvote ${track.title}`}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => vote("songs", track.id, -1)}
                  className="inline-flex size-11 items-center justify-center font-mono text-[12px] text-muted"
                  aria-label={`Downvote ${track.title}`}
                >
                  −
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
