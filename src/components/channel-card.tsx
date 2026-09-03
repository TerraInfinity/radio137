import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Pause, Play, Star } from "lucide-react";
import { ModePill } from "@/components/mode-pill";
import { StationVisual } from "@/components/station-visual";
import { isAdultTrack, isChannelNsfw } from "@/lib/catalog";
import { heldClaim } from "@/lib/claim";
import { cn } from "@/lib/cn";
import { loadFavorites, toggleFavorite } from "@/lib/favorites";
import { listenerLabel } from "@/lib/popularity";
import { usePresenceStore } from "@/lib/presence-store";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel } from "@/lib/types";

export function ChannelCard({ channel }: { channel: Channel }) {
  const [fav, setFav] = useState(() => loadFavorites().includes(channel.slug));
  const presence = usePresenceStore((s) => s.snapshot);
  const channelSlug = usePlayerStore((s) => s.channelSlug);
  const status = usePlayerStore((s) => s.status);
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const claims = usePlayerStore((s) => s.claims);
  const identity = usePlayerStore((s) => s.identity);
  const driving = heldClaim(claims, identity);
  const live = presence?.live[channel.slug] ?? 0;
  const listens = presence?.listens[channel.slug] ?? 0;
  const viewers = presence?.viewers[channel.slug] ?? 0;
  const views = presence?.views[channel.slug] ?? 0;
  const host = presence?.host?.slug === channel.slug;
  const here = channelSlug === channel.slug;
  const playingHere = here && status === "playing";
  const spotlight = channel.spotlightTrackId
    ? channel.tracks.find((track) => track.id === channel.spotlightTrackId && !isAdultTrack(track))
    : null;
  const label = listenerLabel(live, listens, viewers, views);
  const skin = channel.skin !== "none" && channel.enabled ? channel.skin : null;
  const locked = !channel.enabled;
  const nsfw = isChannelNsfw(channel);

  function onPlay(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (locked) return;
    if (playingHere) void togglePlay();
    else void tuneIn(channel.slug, { forcePlay: true });
  }

  return (
    <div
      className={cn(
        "filigree-frame group relative rounded-xl p-2 shadow-[var(--shadow-filigree)] transition-[box-shadow] duration-150 ease-[var(--ease-out-smooth)] hover:shadow-[var(--shadow-border-hover)]",
        skin === "glaum" && "skin-glaum shadow-[var(--shadow-glaum)]",
        skin === "waheguru" && "skin-waheguru",
        driving?.slug === channel.slug && "card-buzz",
        locked && "opacity-70",
      )}
    >
      <div className="relative">
        <Link to="/channel/$slug" params={{ slug: channel.slug }} className="block">
          <StationVisual
            channel={channel}
            dimmed={locked}
            size="card"
            className="aspect-square w-full rounded-lg"
          />
        </Link>
        {locked ? null : (
          <button
            type="button"
            onClick={onPlay}
            className={cn(
              "absolute bottom-3 left-3 z-10 inline-flex size-11 items-center justify-center rounded-full bg-fg text-bg shadow-[var(--shadow-border)]",
              playingHere && "ring-2 ring-lamp",
            )}
            aria-label={playingHere ? `Pause ${channel.name}` : `Play ${channel.name}`}
          >
            {playingHere ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
          </button>
        )}
        <button
          type="button"
          onClick={() => setFav(toggleFavorite(channel.slug).includes(channel.slug))}
          className="absolute right-3 top-3 z-10 inline-flex size-11 items-center justify-center rounded-full bg-bg/70"
          aria-pressed={fav}
          aria-label={fav ? "Remove favorite" : "Add favorite"}
        >
          <Star className={cn("size-4", fav ? "fill-gold text-gold" : "text-muted")} />
        </button>
      </div>
      <div className="px-1 pb-2 pt-3">
        <Link to="/channel/$slug" params={{ slug: channel.slug }} className="block">
          <div className="flex items-start justify-between gap-2">
            <h2
              className={cn(
                "font-display text-xl font-semibold tracking-tight text-fg",
                skin === "glaum" && "glaum-title text-[1.35rem]",
              )}
            >
              {skin === "glaum" ? "Glåüm" : channel.name}
            </h2>
            {locked ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">Locked</span>
            ) : driving?.slug === channel.slug ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-buzz">
                {driving.own ? "Your booth" : "DJ held"}
              </span>
            ) : channel.claimable ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-buzz/80">Open booth</span>
            ) : host ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-glaum-soft">Grooving</span>
            ) : channel.featured ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">Featured</span>
            ) : null}
          </div>
          {locked && nsfw ? (
            <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">18+ frequency</p>
          ) : skin === "glaum" ? (
            <p className="glaum-sponsor mt-0.5 font-mono text-[10px] uppercase">Sponsored by Shrimp™</p>
          ) : (
            <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{channel.energy}</p>
          )}
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ModePill kind={channel.kind} mode={channel.mode} enabled={channel.enabled} nsfw={nsfw} />
          {locked ? null : label ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{label}</span>
          ) : null}
          {!locked && here ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-lamp">You</span>
          ) : null}
          {!locked && fav ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">Fav</span>
          ) : null}
        </div>
        {locked ? (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
            {nsfw ? "Playlist hidden" : "Off the dial"}
          </p>
        ) : spotlight ? (
          <p className="mt-2 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
            Proud pick · {spotlight.title}
          </p>
        ) : channel.tags.length > 0 ? (
          <p className="mt-2 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
            {channel.tags.join(" · ")}
          </p>
        ) : null}
        {locked ? null : (
          <button
            type="button"
            onClick={onPlay}
            className="mt-3 inline-flex h-11 items-center gap-2 rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.16em] text-bg"
          >
            {playingHere ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {playingHere ? "Pause" : "Play"}
          </button>
        )}
      </div>
    </div>
  );
}
