import { ChevronDown, ChevronUp, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { GlaumuleChip } from "@/components/love-bubbles";
import { cn, formatClock, formatRemaining } from "@/lib/cn";
import { heldClaim } from "@/lib/claim";
import { usePlayerStore } from "@/lib/player-store";

export function MiniPlayer() {
  const status = usePlayerStore((s) => s.status);
  const track = usePlayerStore((s) => s.track);
  const channelSlug = usePlayerStore((s) => s.channelSlug);
  const catalog = usePlayerStore((s) => s.catalog);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const collapsed = usePlayerStore((s) => s.playerCollapsed);
  const identity = usePlayerStore((s) => s.identity);
  const claims = usePlayerStore((s) => s.claims);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const setPlayerCollapsed = usePlayerStore((s) => s.setPlayerCollapsed);
  const skipAllowed = usePlayerStore((s) => (s.channelSlug ? s.skipAllowed(s.channelSlug) : true));
  const channel = catalog.channels.find((item) => item.slug === channelSlug);
  const playing = status === "playing";
  const empty = !track || status === "idle" || status === "off-air";
  const claim = channelSlug ? claims[channelSlug] : undefined;
  const held = heldClaim(claims, identity);
  const driving = Boolean(held?.own && held.slug === channelSlug);
  const elapsed = driving && claim?.claimedAt ? Date.now() - claim.claimedAt : 0;
  const remaining = driving && claim?.expiresAt ? claim.expiresAt - Date.now() : 0;
  const progress = duration > 0 ? currentTime / duration : 0;
  const skin = channel?.skin && channel.skin !== "none" ? channel.skin : null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur-sm",
        driving && "player-shell-buzz",
        !driving && skin === "glaum" && "player-shell-glaum",
        !driving && skin === "waheguru" && "player-shell-wahe",
      )}
    >
      {!empty ? (
        <div className="h-0.5 bg-line" aria-hidden>
          <div
            className={cn(
              "h-full",
              driving ? "player-bar-buzz" : skin === "glaum" ? "player-bar-glaum" : skin === "waheguru" ? "player-bar-wahe" : "bg-ember",
            )}
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
      ) : null}
      <div className="mx-auto max-w-6xl px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
        {empty ? (
          <div className="flex min-h-12 items-center justify-between gap-3">
            <p className="truncate font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              {status === "off-air" ? "Off air — choose another channel" : "The network is quiet. Open a channel."}
            </p>
            <Collapse collapsed={collapsed} onToggle={() => setPlayerCollapsed(!collapsed)} />
          </div>
        ) : collapsed ? (
          <div className="flex min-h-14 items-center gap-2">
            <button
              type="button"
              onClick={() => setPlayerCollapsed(false)}
              className="min-w-0 flex-1 text-left"
              aria-label="Expand player"
            >
              <p className="truncate font-display text-sm font-semibold">{track.title}</p>
              <p className="truncate font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                {track.artist}
                {channel ? ` · ${channel.name}` : ""}
              </p>
            </button>
            {driving ? (
              <span className="lamp-pink font-mono text-[10px] uppercase tracking-[0.12em] tabular-nums">
                {formatRemaining(elapsed)}
              </span>
            ) : (
              <GlaumuleChip />
            )}
            <button type="button" aria-label="Previous" disabled={!skipAllowed} onClick={() => void prev()} className="inline-flex size-11 items-center justify-center disabled:text-subtle">
              <SkipBack className="size-4" />
            </button>
            <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={() => void togglePlay()} className="inline-flex size-11 items-center justify-center">
              {playing ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
            </button>
            <button type="button" aria-label="Next" disabled={!skipAllowed} onClick={() => void next()} className="inline-flex size-11 items-center justify-center disabled:text-subtle">
              <SkipForward className="size-4" />
            </button>
            <Collapse collapsed onToggle={() => setPlayerCollapsed(false)} />
          </div>
        ) : (
          <div className="py-2">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <Link
                  to="/player/$id"
                  params={{ id: track.id }}
                  className="truncate font-display text-lg font-semibold"
                >
                  {track.title}
                </Link>
                <p className="truncate text-sm text-muted">
                  {track.artist}
                  {channel ? ` · ${channel.name}` : ""}
                </p>
              </div>
              {driving ? (
                <span className="lamp-pink font-mono text-[10px] uppercase tracking-[0.12em] tabular-nums">
                  {formatRemaining(elapsed)} · {formatRemaining(remaining)} left
                </span>
              ) : null}
              <Collapse collapsed={false} onToggle={() => setPlayerCollapsed(true)} />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="w-10 font-mono text-[10px] tabular-nums text-subtle">{formatClock(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={Math.max(duration, 1)}
                value={currentTime}
                onChange={(event) => usePlayerStore.getState().seek(Number(event.target.value))}
                className="h-11 flex-1 accent-ember"
              />
              <span className="w-10 text-right font-mono text-[10px] tabular-nums text-subtle">
                {formatClock(duration)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-center gap-2">
              <button type="button" aria-label="Previous" disabled={!skipAllowed} onClick={() => void prev()} className="inline-flex size-11 items-center justify-center disabled:text-subtle">
                <SkipBack className="size-4" />
              </button>
              <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={() => void togglePlay()} className="inline-flex size-12 items-center justify-center rounded-full bg-fg text-bg">
                {playing ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
              </button>
              <button type="button" aria-label="Next" disabled={!skipAllowed} onClick={() => void next()} className="inline-flex size-11 items-center justify-center disabled:text-subtle">
                <SkipForward className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Collapse({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button type="button" aria-label={collapsed ? "Expand player" : "Collapse player"} onClick={onToggle} className="inline-flex size-11 items-center justify-center text-muted">
      {collapsed ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
    </button>
  );
}
