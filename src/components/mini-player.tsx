import { useMemo, useState } from "react";
import { Camera, ChevronDown, ChevronUp, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { AutoplayLamp } from "@/components/autoplay-lamp";
import { CoverArt } from "@/components/cover-art";
import { HeroArtSheet } from "@/components/hero-art-sheet";
import { ListenModeLamp } from "@/components/listen-mode-lamp";
import { ShuffleToggle } from "@/components/shuffle-toggle";
import { TrackActions } from "@/components/track-actions";
import { UnallocateControl } from "@/components/unallocate-control";
import { getChannel, kindLabel, normalizeKind, stationSkin } from "@/lib/catalog";
import { cn, formatClock } from "@/lib/cn";
import { isOnDemandOverlay, listenModeLabel } from "@/lib/listen-mode";
import { visualSrc } from "@/lib/media";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";

function VuMeter({ playing, skin }: { playing: boolean; skin: string }) {
  return (
    <div className={cn("vu-meter", playing && "vu-meter-on", skin === "glaum" && "vu-meter-glaum")} aria-hidden>
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} style={{ animationDelay: `${i * 0.07}s` }} />
      ))}
    </div>
  );
}

function Scrubber({
  currentTime,
  duration,
  disabled,
  reason,
}: {
  currentTime: number;
  duration: number;
  disabled: boolean;
  reason?: string;
}) {
  const seek = usePlayerStore((s) => s.seek);
  const remaining = Math.max(0, duration - currentTime);
  return (
    <label className="flex items-center gap-2">
      <span className="w-9 shrink-0 font-mono text-[10px] tabular-nums text-subtle">{formatClock(currentTime)}</span>
      <span className="deck-scrub min-w-0 flex-1">
        <span className="deck-scrub-track" aria-hidden>
          <span className="deck-scrub-fill" style={{ width: `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%` }} />
        </span>
        <input
          type="range"
          min={0}
          max={Math.max(1, duration)}
          step={0.25}
          value={Math.min(currentTime, duration || 0)}
          disabled={disabled}
          title={disabled ? reason : "Seek"}
          onChange={(event) => seek(Number(event.target.value))}
          aria-label={disabled ? reason || "Seek locked" : "Seek"}
        />
      </span>
      <span className="w-10 shrink-0 text-right font-mono text-[10px] tabular-nums text-subtle">-{formatClock(remaining)}</span>
    </label>
  );
}

export function MiniPlayer() {
  const track = usePlayerStore((s) => s.track);
  const status = usePlayerStore((s) => s.status);
  const slug = usePlayerStore((s) => s.channelSlug);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const collapsed = usePlayerStore((s) => s.playerCollapsed);
  const buffering = usePlayerStore((s) => s.buffering);
  const deckHint = usePlayerStore((s) => s.deckHint);
  const listenMode = usePlayerStore((s) => s.listenModeSession ?? s.listenMode);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const setPlayerCollapsed = usePlayerStore((s) => s.setPlayerCollapsed);
  const skipAllowed = usePlayerStore((s) => s.skipAllowed);
  const jumpToLive = usePlayerStore((s) => s.jumpToLive);
  const { isAdmin } = useRadioUser();
  const [artOpen, setArtOpen] = useState(false);
  const channel = slug ? getChannel(slug) : undefined;
  const ios = useMemo(
    () =>
      typeof navigator !== "undefined" &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)),
    [],
  );
  if (!track || !channel) return null;
  const playing = status === "playing";
  const canSkip = skipAllowed(channel.slug);
  const skin = stationSkin(channel);
  const overlay = isOnDemandOverlay(channel, listenMode);
  const deskKind = normalizeKind(channel.kind || channel.mode);
  const skipReason = canSkip ? undefined : overlay ? undefined : "Streaming — skip locked";
  const claimed = !canSkip && deskKind === "live" && !overlay;
  const lockTitle = claimed ? "Desk claimed" : skipReason;
  const art = visualSrc(track, channel);
  const statusLine =
    status === "loading"
      ? "Tuning…"
      : buffering
        ? "Buffering…"
        : deckHint
          ? deckHint
          : playing
            ? overlay
              ? "On demand"
              : listenMode === "stream" && deskKind === "live"
                ? "Live sync"
                : "Playing"
            : "Paused";

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm",
        skin === "glaum" && "player-shell-glaum",
        skin === "waheguru" && "player-shell-wahe",
      )}
    >
      {collapsed ? (
        <div className="deck-scrub h-11">
          <span className="deck-scrub-track deck-scrub-track-thin" aria-hidden>
            <span
              className={cn("deck-scrub-fill", skin === "glaum" && "player-bar-glaum", skin === "waheguru" && "player-bar-wahe")}
              style={{ width: `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%` }}
            />
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(1, duration)}
            step={0.25}
            value={Math.min(currentTime, duration || 0)}
            disabled={!canSkip}
            title={lockTitle || "Seek"}
            onChange={(event) => usePlayerStore.getState().seek(Number(event.target.value))}
            aria-label={canSkip ? "Seek" : lockTitle || "Seek locked"}
          />
        </div>
      ) : null}
      <div className="mx-auto max-w-6xl px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setPlayerCollapsed(false)}
            className="shrink-0"
            aria-label="Expand player"
          >
            <CoverArt src={art} alt="" className={cn("rounded-md", collapsed ? "size-11" : "size-14")} motion={collapsed ? "still" : "loop"} />
          </button>
          <div className="min-w-0 flex-1">
            <p className={cn("truncate font-display leading-none", collapsed ? "text-base" : "text-xl", skin === "glaum" && "glaum-title")}>{track.title}</p>
            <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
              {track.artist ? `${track.artist} · ` : ""}
              {channel.name}
              {" · "}
              {formatClock(currentTime)}
              {collapsed ? ` · -${formatClock(Math.max(0, duration - currentTime))}` : ` / ${formatClock(duration)}`}
            </p>
            <div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {statusLine}
              {collapsed && overlay ? (
                <>
                  {" · "}
                  <button type="button" onClick={() => void jumpToLive()} className="uppercase tracking-[0.12em] text-gold">
                    Jump to live
                  </button>
                </>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            disabled={!canSkip}
            onClick={() => void prev()}
            title={lockTitle || "Previous"}
            className={cn("grid size-11 shrink-0 place-items-center text-gold", !canSkip && "opacity-40")}
            aria-label={canSkip ? "Previous" : lockTitle || "Previous locked"}
          >
            <SkipBack className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => void togglePlay()}
            className="grid size-12 shrink-0 place-items-center rounded-full bg-fg text-bg"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="size-6" /> : <Play className="size-6 ml-0.5" />}
          </button>
          <button
            type="button"
            disabled={!canSkip}
            onClick={() => void next("user")}
            title={lockTitle || "Next"}
            className={cn("grid size-11 shrink-0 place-items-center text-gold", !canSkip && "opacity-40")}
            aria-label={canSkip ? "Next" : lockTitle || "Next locked"}
          >
            <SkipForward className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setPlayerCollapsed(!collapsed)}
            className="grid size-11 shrink-0 place-items-center text-subtle"
            aria-label={collapsed ? "Expand player" : "Collapse player"}
          >
            {collapsed ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
          </button>
        </div>
        {!collapsed ? (
          <div className="mt-3 space-y-3">
            <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-xl shadow-[var(--shadow-filigree)]">
              <button
                type="button"
                onClick={() => isAdmin && setArtOpen(true)}
                className="block w-full"
                aria-label={isAdmin ? "Replace this cut’s art" : track.title}
              >
                <CoverArt src={art} alt="" className="aspect-square w-full" motion="loop" />
              </button>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => setArtOpen(true)}
                  className="absolute right-2 top-2 inline-flex size-11 items-center justify-center rounded-md bg-bg/80 text-gold"
                  aria-label="Replace art"
                >
                  <Camera className="size-4" />
                </button>
              ) : null}
            </div>
            <VuMeter playing={playing} skin={skin} />
            <Scrubber currentTime={currentTime} duration={duration} disabled={!canSkip} reason={lockTitle} />
            {!canSkip ? (
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ember">{lockTitle}</p>
            ) : null}
            {overlay ? (
              <button
                type="button"
                onClick={() => void jumpToLive()}
                className="inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
              >
                Jump to live
              </button>
            ) : null}
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
              Desk: {kindLabel(deskKind)} · You: {listenModeLabel(listenMode)}
            </p>
            <div className="flex flex-wrap items-center gap-1">
              <ListenModeLamp compact />
              <AutoplayLamp compact />
              <ShuffleToggle channel={channel} compact />
              <TrackActions trackId={track.id} />
              <UnallocateControl channel={channel} track={track} />
            </div>
            {!ios ? (
              <label className="flex min-w-40 items-center gap-2">
                <Volume2 className="size-4 text-subtle" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  className="h-11 w-full"
                  aria-label="Volume"
                />
              </label>
            ) : null}
          </div>
        ) : null}
      </div>
      {isAdmin ? <HeroArtSheet channel={channel} track={track} open={artOpen} onClose={() => setArtOpen(false)} /> : null}
    </div>
  );
}
