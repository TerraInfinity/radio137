import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { StationVisual } from "@/components/station-visual";
import { channelIsLive, getPlayableTracks } from "@/lib/catalog";
import { liveCursor } from "@/lib/playback";
import { heldClaim } from "@/lib/claim";
import { listenerLabel } from "@/lib/popularity";
import { usePresenceStore } from "@/lib/presence-store";
import { cn } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";

export function LiveNowStrip() {
  const catalog = usePlayerStore((s) => s.catalog);
  const ready = usePlayerStore((s) => s.ready);
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const presence = usePresenceStore((s) => s.snapshot);
  const claims = usePlayerStore((s) => s.claims);
  const identity = usePlayerStore((s) => s.identity);
  const driving = heldClaim(claims, identity);

  if (!ready) {
    return (
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 w-56 shrink-0 animate-pulse rounded-lg bg-bg-elevated" />
        ))}
      </div>
    );
  }

  const now = Date.now();
  const live = catalog.channels
    .filter((channel) => channel.enabled && channelIsLive(channel))
    .sort((a, b) => (presence?.live[b.slug] ?? 0) - (presence?.live[a.slug] ?? 0));

  if (live.length === 0) {
    return <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">No live desks</p>;
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {live.map((channel) => {
        const playable = getPlayableTracks(channel);
        const cursor = liveCursor(playable, now, channel.slug);
        const title = cursor?.track.title ?? (playable[0]?.title || "Signal idle");
        const label = listenerLabel(
          presence?.live[channel.slug] ?? 0,
          presence?.listens[channel.slug] ?? 0,
          presence?.viewers[channel.slug] ?? 0,
          presence?.views[channel.slug] ?? 0,
        );
        return (
          <div
            key={channel.slug}
            className={cn(
              "flex min-h-20 min-w-72 shrink-0 items-center gap-3 rounded-lg bg-bg-elevated px-3 py-3 shadow-[var(--shadow-filigree)]",
              driving?.slug === channel.slug && "card-buzz",
            )}
          >
            <Link
              to="/channel/$slug"
              params={{ slug: channel.slug }}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <StationVisual channel={channel} size="thumb" className="size-14 shrink-0 rounded-md" />
              <div className="min-w-0">
                <p className={cn("font-mono text-[10px] uppercase tracking-[0.18em]", driving?.slug === channel.slug ? "text-buzz" : "text-ember")}>
                  {driving?.slug === channel.slug ? (driving.own ? "Your booth" : "DJ held") : "Live now"}
                </p>
                <p className="truncate font-display text-base font-semibold text-fg">{channel.name}</p>
                <p className="truncate font-mono text-[11px] text-muted">{title}</p>
                {label ? (
                  <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{label}</p>
                ) : null}
              </div>
            </Link>
            <button
              type="button"
              aria-label={`Play ${channel.name}`}
              onClick={() => void tuneIn(channel.slug, { forcePlay: true })}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-fg text-bg"
            >
              <Play className="size-4 ml-0.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
