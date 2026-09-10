import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Camera, ChevronDown, Pause, Pencil, Play, Radio, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { AutoplayLamp } from "@/components/autoplay-lamp";
import { RenameCutForm } from "@/components/admin-rename";
import { CoverArt } from "@/components/cover-art";
import { HeroArtSheet } from "@/components/hero-art-sheet";
import { ListenModeLamp } from "@/components/listen-mode-lamp";
import { MarqueeTitle } from "@/components/marquee-title";
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
  compact = false,
}: {
  currentTime: number;
  duration: number;
  compact?: boolean;
}) {
  const seek = usePlayerStore((s) => s.seek);
  const hitRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const unbind = useRef<(() => void) | null>(null);
  const maxRef = useRef(0);
  const seekRef = useRef(seek);
  const [preview, setPreview] = useState<number | null>(null);
  seekRef.current = seek;
  const max = Math.max(duration, 0);
  maxRef.current = max;
  const shown = preview ?? currentTime;
  const progress = max > 0 ? Math.min(100, (shown / max) * 100) : 0;
  const remaining = Math.max(0, max - shown);

  useEffect(() => () => unbind.current?.(), []);

  function timeAt(clientX: number) {
    const el = hitRef.current;
    const span = maxRef.current;
    if (!el || span <= 0) return 0;
    const rect = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(rect.width, 1)));
    return x * span;
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    dragging.current = true;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* iOS may ignore capture */
    }
    const next = timeAt(event.clientX);
    setPreview(next);
    seekRef.current(next);

    unbind.current?.();
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      const t = timeAt(e.clientX);
      setPreview(t);
      seekRef.current(t);
    };
    const up = (e: PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      seekRef.current(timeAt(e.clientX));
      setPreview(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      unbind.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    unbind.current = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }

  return (
    <div className={cn("deck-scrub", compact && "deck-scrub-dock")}>
      <div
        ref={hitRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={Math.round(max)}
        aria-valuenow={Math.round(shown)}
        aria-label="Seek"
        className="deck-scrub-hit"
        onPointerDown={onPointerDown}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            seek(Math.min(max, currentTime + 5));
          } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            seek(Math.max(0, currentTime - 5));
          } else if (event.key === "Home") {
            event.preventDefault();
            seek(0);
          } else if (event.key === "End") {
            event.preventDefault();
            seek(max);
          }
        }}
      >
        <span className="deck-scrub-track" aria-hidden>
          <span className="deck-scrub-fill" style={{ width: `${progress}%` }} />
        </span>
        <span className="deck-scrub-thumb" style={{ left: `${progress}%` }} aria-hidden />
        {preview !== null ? (
          <span className="deck-scrub-tip" style={{ left: `${progress}%` }} aria-hidden>
            {formatClock(preview)}
          </span>
        ) : null}
      </div>
      <div className="deck-scrub-times">
        <span>{formatClock(shown)}</span>
        <span>-{formatClock(remaining)}</span>
      </div>
    </div>
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
  const jumpToLive = usePlayerStore((s) => s.jumpToLive);
  const { isAdmin } = useRadioUser();
  const [artOpen, setArtOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const channel = slug ? getChannel(slug) : undefined;
  const ios = useMemo(
    () =>
      typeof navigator !== "undefined" &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)),
    [],
  );
  useEffect(() => {
    setRenaming(false);
  }, [track?.id]);
  if (!track || !channel) return null;
  const playing = status === "playing";
  const skin = stationSkin(channel);
  const overlay = isOnDemandOverlay(channel, listenMode);
  const deskKind = normalizeKind(channel.kind || channel.mode);
  const liveSync = listenMode === "stream" && deskKind === "live" && !overlay;
  const art = visualSrc(track, channel);
  const statusLine = status === "loading" ? "Tuning…" : buffering ? "Buffering…" : deckHint ? deckHint : overlay ? "On demand" : liveSync ? "Live" : playing ? "Playing" : "Paused";
  const skipHint = liveSync ? "Leaves streaming" : undefined;

  return (
    <div
      className={cn(
        "player-dock fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur-sm",
        !collapsed && "player-sheet",
        skin === "glaum" && "player-shell-glaum",
        skin === "waheguru" && "player-shell-wahe",
      )}
    >
      <div className="mx-auto max-w-6xl px-3 pt-1 sm:px-4">
        {collapsed ? <Scrubber currentTime={currentTime} duration={duration} compact /> : null}
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <button
              type="button"
              onClick={() => collapsed && setPlayerCollapsed(false)}
              className="flex w-full min-w-0 items-center gap-2.5 text-left"
              aria-label={collapsed ? "Expand player" : track.title}
            >
              <CoverArt src={art} alt="" className="size-12 shrink-0 overflow-hidden rounded-md" motion="still" />
              {collapsed ? (
                <span className="min-w-0 flex-1 overflow-hidden">
                  <MarqueeTitle
                    text={track.title}
                    className={cn("min-w-0 w-full font-display text-base leading-tight", skin === "glaum" && "glaum-title")}
                  />
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
          {collapsed ? <ListenModeLamp compact bare /> : null}
          <button
            type="button"
            onClick={() => void prev()}
            title={skipHint || "Previous"}
            className="grid size-11 shrink-0 place-items-center text-gold"
            aria-label="Previous"
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
            onClick={() => void next("user")}
            title={skipHint || "Next"}
            className="grid size-11 shrink-0 place-items-center text-gold"
            aria-label="Next"
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
                aria-label={isAdmin ? "Replace this song’s art" : track.title}
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
            <div className="min-w-0 text-center">
              {isAdmin && renaming ? (
                <RenameCutForm slug={channel.slug} track={track} appearance="title" onClose={() => setRenaming(false)} />
              ) : (
                <p className={cn("min-w-0 font-display text-2xl font-semibold leading-tight", skin === "glaum" && "glaum-title")}>
                  <MarqueeTitle text={track.title} />
                </p>
              )}
              <p className="mt-1 text-sm text-muted">
                {track.artist || "Unknown"}
                <span className="text-subtle"> · {channel.name}</span>
              </p>
            </div>
            <VuMeter playing={playing} skin={skin} />
            <Scrubber currentTime={currentTime} duration={duration} />
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
            <div className="flex flex-wrap items-center justify-center gap-1">
              <ListenModeLamp />
              <AutoplayLamp compact />
              <ShuffleToggle channel={channel} compact />
              <TrackActions trackId={track.id} compact />
              <UnallocateControl channel={channel} track={track} />
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => setRenaming((value) => !value)}
                  aria-expanded={renaming}
                  className="inline-flex h-11 items-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
                >
                  <Pencil className="size-3.5" />
                  Rename
                </button>
              ) : null}
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
