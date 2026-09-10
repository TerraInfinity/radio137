import { useMemo, useState } from "react";
import { Camera, ChevronDown, Pause, Play, Radio, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { AutoplayLamp } from "@/components/autoplay-lamp";
import { CoverArt } from "@/components/cover-art";
import { HeroArtSheet } from "@/components/hero-art-sheet";
import { ListenModePicker } from "@/components/listen-mode-lamp";
import { ShareLink } from "@/components/share-link";
import { ShuffleToggle } from "@/components/shuffle-toggle";
import { TrackActions } from "@/components/track-actions";
import { UnallocateControl } from "@/components/unallocate-control";
import { getChannel, kindLabel, normalizeKind, stationSkin } from "@/lib/catalog";
import { cn, formatClock } from "@/lib/cn";
import { isOnDemandOverlay, listenModeLabel } from "@/lib/listen-mode";
import { visualSrc } from "@/lib/media";
import { useRadioUser } from "@/lib/radio-user";
import { songPath } from "@/lib/song-url";
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
  const liveSync = listenMode === "stream" && deskKind === "live" && !overlay;
  const skipReason = canSkip ? undefined : "Streaming — skip locked";
  const claimed = !canSkip && liveSync;
  const lockTitle = claimed ? "Desk claimed" : skipReason;
  const art = visualSrc(track, channel);
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const statusLine = status === "loading" ? "Tuning…" : buffering ? "Buffering…" : deckHint ? deckHint : overlay ? "On demand" : liveSync ? "Live" : playing ? "Playing" : "Paused";

  return (
    <div
      className={cn(
        "player-dock fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur-sm",
        !collapsed && "player-sheet",
        skin === "glaum" && "player-shell-glaum",
        skin === "waheguru" && "player-shell-wahe",
      )}
    >
      <div className="mx-auto max-w-6xl px-3 pt-2 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            {collapsed ? (
              <div className="player-dock-seek">
                <span className="deck-scrub-track deck-scrub-track-thin" aria-hidden>
                  <span
                    className={cn("deck-scrub-fill", buffering && "player-bar-wait", skin === "glaum" && "player-bar-glaum", skin === "waheguru" && "player-bar-wahe")}
                    style={{ width: `${progress}%` }}
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
            <button
              type="button"
              onClick={() => collapsed && setPlayerCollapsed(false)}
              className="flex w-full min-w-0 items-center gap-2.5 pt-1 text-left"
              aria-label={collapsed ? "Expand player" : track.title}
            >
              <CoverArt src={art} alt="" className="size-12 shrink-0 overflow-hidden rounded-md" motion="still" />
              {collapsed ? (
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate font-display text-base leading-tight", skin === "glaum" && "glaum-title")}>{track.title}</span>
                  <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                    {track.artist ? `${track.artist} · ` : ""}
                    {statusLine}
                  </span>
                </span>
              ) : (
                <span className="min-w-0 flex-1" />
              )}
            </button>
          </div>
          {overlay && collapsed ? (
            <button
              type="button"
              onClick={() => void jumpToLive()}
              className="inline-flex h-11 shrink-0 items-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
              title="Jump to the station clock"
            >
              <Radio className="size-3.5" />
              Live
            </button>
          ) : null}
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
          {!collapsed ? (
            <button
              type="button"
              onClick={() => setPlayerCollapsed(true)}
              className="grid size-11 shrink-0 place-items-center text-subtle"
              aria-label="Collapse player"
            >
              <ChevronDown className="size-5" />
            </button>
          ) : null}
        </div>

        {!collapsed ? (
          <div className="mt-4 space-y-4 pb-2">
            <div className="player-hero relative overflow-hidden rounded-xl shadow-[var(--shadow-filigree)]">
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
                  className="absolute right-2 top-2 inline-flex size-11 items-center justify-center rounded-md bg-bg/85 text-gold"
                  aria-label="Replace art"
                >
                  <Camera className="size-4" />
                </button>
              ) : null}
            </div>
            <div className="text-center">
              <p className={cn("font-display text-2xl font-semibold leading-tight", skin === "glaum" && "glaum-title")}>{track.title}</p>
              <p className="mt-1 text-sm text-muted">
                {track.artist || "Unknown"}
                <span className="text-subtle"> · {channel.name}</span>
              </p>
            </div>
            <VuMeter playing={playing} skin={skin} />
            <Scrubber currentTime={currentTime} duration={duration} disabled={!canSkip} reason={lockTitle} />
            {!canSkip ? <p className="text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ember">{lockTitle}</p> : null}
            {overlay ? (
              <button
                type="button"
                onClick={() => void jumpToLive()}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-md font-mono text-[11px] uppercase tracking-[0.14em] text-gold shadow-[var(--shadow-filigree)]"
              >
                <Radio className="size-4" />
                Jump to live
              </button>
            ) : null}
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
              Desk: {kindLabel(deskKind)} · You: {listenModeLabel(listenMode)}
            </p>
            <ListenModePicker compact />
            <div className="flex flex-wrap items-center justify-center gap-1">
              <AutoplayLamp compact />
              <ShuffleToggle channel={channel} compact />
              <TrackActions trackId={track.id} compact />
              <UnallocateControl channel={channel} track={track} />
            </div>
            <div className="flex justify-center">
              <ShareLink path={songPath(track)} title={track.title} compact />
            </div>
            {!ios ? (
              <label className="mx-auto flex max-w-sm items-center gap-2">
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
