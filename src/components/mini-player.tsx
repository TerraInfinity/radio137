import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from "react";
import { Camera, ChevronDown, ChevronUp, Pause, Pencil, Play, Radio, SkipBack, SkipForward, Volume1, Volume2, VolumeX, X } from "lucide-react";
import { AutoplayLamp } from "@/components/autoplay-lamp";
import { RenameCutForm } from "@/components/admin-rename";
import { CoverArt } from "@/components/cover-art";
import { HeroArtSheet } from "@/components/hero-art-sheet";
import { ListenModeLamp } from "@/components/listen-mode-lamp";
import { MarqueeTitle } from "@/components/marquee-title";
import { PlayerBloom, PlayerMastRose } from "@/components/player-bloom";
import { ShareLink } from "@/components/share-link";
import { ShuffleToggle } from "@/components/shuffle-toggle";
import { TrackActions } from "@/components/track-actions";
import { UnallocateControl } from "@/components/unallocate-control";
import { getChannel, kindLabel, normalizeKind, stationSkin } from "@/lib/catalog";
import { cn, formatClock } from "@/lib/cn";
import { isOnDemandOverlay, listenModeLabel } from "@/lib/listen-mode";
import { songPortrait, visualSrc } from "@/lib/media";
import { useRadioUser } from "@/lib/radio-user";
import { songPath } from "@/lib/song-url";
import { cacheUsage, clearCachedAudio, subscribeAudioCache, audioCacheGeneration } from "@/lib/audio-cache";
import { usePlayerStore } from "@/lib/player-store";

function DeviceCacheLine() {
  const gen = useSyncExternalStore(subscribeAudioCache, audioCacheGeneration, () => 0);
  const [usage, setUsage] = useState<{ used: number; count: number; budget: number } | null>(null);
  useEffect(() => {
    let live = true;
    void cacheUsage().then((value) => {
      if (live) setUsage(value);
    });
    return () => {
      live = false;
    };
  }, [gen]);
  if (!usage || usage.count < 1) return null;
  const mb = Math.max(1, Math.round(usage.used / (1024 * 1024)));
  return (
    <button
      type="button"
      onClick={() => void clearCachedAudio()}
      className="inline-flex h-11 items-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle hover:text-gold"
      title="Clear copies kept on this device"
    >
      {usage.count} kept · {mb} MB · clear
    </button>
  );
}

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
  health = false,
}: {
  currentTime: number;
  duration: number;
  compact?: boolean;
  health?: boolean;
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
    <div className={cn("deck-scrub", compact && "deck-scrub-dock", health && "deck-scrub-hp")}>
      <div
        ref={hitRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={Math.round(max)}
        aria-valuenow={Math.round(shown)}
        aria-label={health ? "Song health" : "Seek"}
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
            {formatClock(preview, { floor: true })}
          </span>
        ) : null}
      </div>
      <div className="deck-scrub-times">
        <span>{formatClock(shown, { floor: true })}</span>
        <span>
          {compact ? formatClock(max) : `-${formatClock(remaining, { floor: true })}`}
        </span>
      </div>
    </div>
  );
}

function VolumeControl({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const hitRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const unbind = useRef<(() => void) | null>(null);
  const setRef = useRef(setVolume);
  const [preview, setPreview] = useState<number | null>(null);
  setRef.current = setVolume;
  const shown = preview ?? volume;
  const progress = Math.min(100, Math.max(0, shown * 100));
  const silent = muted && preview === null;
  const Icon = silent || shown <= 0 ? VolumeX : shown < 0.4 ? Volume1 : Volume2;

  useEffect(() => () => unbind.current?.(), []);

  function levelAt(clientX: number) {
    const el = hitRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(rect.width, 1)));
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
    const next = levelAt(event.clientX);
    setPreview(next);
    setRef.current(next);

    unbind.current?.();
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      const t = levelAt(e.clientX);
      setPreview(t);
      setRef.current(t);
    };
    const up = (e: PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      setRef.current(levelAt(e.clientX));
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
    <div className={cn("deck-volume", compact && "deck-volume-dock", className)}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          toggleMute();
        }}
        className="grid size-11 shrink-0 place-items-center text-gold"
        aria-label={silent ? "Unmute" : "Mute"}
        title={silent ? "Unmute" : "Mute"}
      >
        <Icon className="size-5" />
      </button>
      <div
        ref={hitRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(silent ? 0 : progress)}
        aria-valuetext={silent ? "muted" : `${Math.round(shown * 100)} percent`}
        aria-label="Volume"
        className="deck-volume-hit"
        onPointerDown={onPointerDown}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            setVolume(Math.min(1, volume + 0.05));
          } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            setVolume(Math.max(0, volume - 0.05));
          } else if (event.key === "Home") {
            event.preventDefault();
            setVolume(0);
          } else if (event.key === "End") {
            event.preventDefault();
            setVolume(1);
          } else if (event.key === "m" || event.key === "M") {
            event.preventDefault();
            toggleMute();
          }
        }}
      >
        <span className={cn("deck-volume-track", silent && "deck-volume-muted")} aria-hidden>
          <span className="deck-volume-fill" style={{ width: `${progress}%` }} />
        </span>
        <span
          className="deck-volume-thumb"
          style={{ left: `${progress}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

function TransportButtons({
  playing,
  skipHint,
  large = false,
}: {
  playing: boolean;
  skipHint?: string;
  large?: boolean;
}) {
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  return (
    <div className={cn("player-stage-transport", !large && "player-dock-transport")}>
      <button
        type="button"
        onClick={() => void prev()}
        title={skipHint || "Previous"}
        className={cn("grid shrink-0 place-items-center text-gold", large ? "size-14" : "size-11")}
        aria-label="Previous"
      >
        <SkipBack className={large ? "size-7" : "size-5"} />
      </button>
      <button
        type="button"
        onClick={() => void togglePlay()}
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-fg text-bg",
          large ? "size-16" : "size-12",
        )}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? (
          <Pause className={large ? "size-7" : "size-6"} />
        ) : (
          <Play className={large ? "size-7 ml-0.5" : "size-6 ml-0.5"} />
        )}
      </button>
      <button
        type="button"
        onClick={() => void next("user")}
        title={skipHint || "Next"}
        className={cn("grid shrink-0 place-items-center text-gold", large ? "size-14" : "size-11")}
        aria-label="Next"
      >
        <SkipForward className={large ? "size-7" : "size-5"} />
      </button>
    </div>
  );
}

function RoseRiteOrnament() {
  return (
    <span className="player-rose-ornament" aria-hidden>
      <img className="player-rose-antlers" src="/experiences/rose/antlers.jpg" alt="" />
      <img className="player-rose-sword is-left" src="/experiences/rose/elven-sword.jpg" alt="" />
      <img className="player-rose-sword is-right" src="/experiences/rose/elven-sword.jpg" alt="" />
      <span className="player-rose-sand" />
    </span>
  );
}

export function MiniPlayer() {
  const track = usePlayerStore((s) => s.track);
  const status = usePlayerStore((s) => s.status);
  const slug = usePlayerStore((s) => s.channelSlug);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const collapsed = usePlayerStore((s) => s.playerCollapsed);
  const hidden = usePlayerStore((s) => s.playerHidden);
  const buffering = usePlayerStore((s) => s.buffering);
  const deckHint = usePlayerStore((s) => s.deckHint);
  const elsewhere = usePlayerStore((s) => s.elsewhere);
  const listenMode = usePlayerStore((s) => s.listenModeSession ?? s.listenMode);
  const setPlayerCollapsed = usePlayerStore((s) => s.setPlayerCollapsed);
  const setPlayerHidden = usePlayerStore((s) => s.setPlayerHidden);
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
  useEffect(() => {
    if (collapsed || hidden) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setPlayerCollapsed(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [collapsed, hidden, setPlayerCollapsed]);
  if (!track || !channel) return null;
  const playing = status === "playing";
  const skin = stationSkin(channel);
  const overlay = isOnDemandOverlay(channel, listenMode);
  const deskKind = normalizeKind(channel.kind || channel.mode);
  const liveSync = listenMode === "stream" && deskKind === "live" && !overlay;
  const art = visualSrc(track, channel);
  const statusLine = status === "loading"
    ? "Tuning…"
    : buffering
      ? "Buffering…"
      : elsewhere
        ? "Playing in another tab"
        : deckHint
          ? deckHint
          : overlay
            ? "On demand"
            : liveSync
              ? "Live"
              : playing
                ? "Playing"
                : "Paused";
  const skipHint = liveSync ? "Leaves streaming" : undefined;
  const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const shell = cn(skin === "glaum" && "player-shell-glaum", skin === "waheguru" && "player-shell-wahe", skin === "rose" && "player-shell-rose");

  const extras = (
    <div className="player-stage-extras">
      {overlay ? (
        <button
          type="button"
          onClick={() => void jumpToLive()}
          className="inline-flex h-11 items-center justify-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
        >
          <Radio className="size-3.5" />
          Live
        </button>
      ) : null}
      <ListenModeLamp compact />
      <AutoplayLamp compact />
      <ShuffleToggle channel={channel} compact />
      <TrackActions trackId={track.id} compact />
      <DeviceCacheLine />
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
      <ShareLink path={songPath(track)} title={track.title} compact />
    </div>
  );

  const artSheet = isAdmin ? <HeroArtSheet channel={channel} track={track} open={artOpen} onClose={() => setArtOpen(false)} /> : null;

  if (hidden) {
    return (
      <button
        type="button"
        className={cn("player-dock player-sliver", shell)}
        onClick={() => setPlayerHidden(false)}
        aria-label="Open player"
        title="Open player"
      >
        <span className="player-sliver-rail" aria-hidden>
          <span className="player-sliver-fill" style={{ width: `${progress}%` }} />
        </span>
        <ChevronUp className="player-sliver-mark size-4" />
      </button>
    );
  }

  if (!collapsed) {
    const pale = skin === "rose";
    return (
      <div className={cn("player-stage", shell)} role="dialog" aria-label="Now playing">
        <div className={cn("player-stage-sheet", pale && "is-rose")}>
          <PlayerBloom playing={playing} time={currentTime} skin={skin} />
          <div className="player-stage-chrome player-stage-mast">
            <button
              type="button"
              onClick={() => setPlayerCollapsed(true)}
              className="grid size-11 shrink-0 place-items-center text-gold"
              aria-label="Collapse player"
              title="Collapse player"
            >
              <ChevronDown className="size-5" />
            </button>
            <div className="player-stage-mast-copy">
              <PlayerMastRose pale={pale} />
              <div className="min-w-0">
                <p className="player-stage-kicker">Now playing</p>
                <p className={cn("player-stage-mast-name", pale && "is-rose")}>{pale ? "White Rose" : channel.name}</p>
              </div>
            </div>
            <p className="player-stage-mast-status">{statusLine}</p>
            <button
              type="button"
              onClick={() => setPlayerHidden(true)}
              className="grid size-11 shrink-0 place-items-center text-subtle hover:text-fg"
              aria-label="Hide player"
              title="Hide player"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="player-stage-body">
            <div className="player-stage-art">
              <div className="player-stage-art-frame">
                <button
                  type="button"
                  onClick={() => isAdmin && setArtOpen(true)}
                  className="block size-full"
                  aria-label={isAdmin ? "Replace this song’s art" : track.title}
                >
                  <CoverArt src={art} alt="" className="size-full" motion="loop" />
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
            </div>
            <div className="player-stage-copy">
              <div className="min-w-0 text-center md:text-left">
                {isAdmin && renaming ? (
                  <RenameCutForm slug={channel.slug} track={track} appearance="title" onClose={() => setRenaming(false)} />
                ) : (
                  <p className={cn("min-w-0 font-display text-2xl font-semibold leading-tight sm:text-3xl", skin === "glaum" && "glaum-title", pale && "rose-title")}>
                    <MarqueeTitle text={track.title} />
                  </p>
                )}
                <p className="mt-1 truncate text-sm text-muted">
                  {track.artist || "Unknown"}
                  <span className="text-subtle"> · {channel.name}</span>
                </p>
              </div>
              <div className="player-stage-vu flex justify-center md:justify-start">
                <VuMeter playing={playing} skin={skin} />
              </div>
              <TransportButtons playing={playing} skipHint={skipHint} large />
              <Scrubber currentTime={currentTime} duration={duration} health={pale} />
              {!ios ? <VolumeControl className="w-full max-w-sm md:max-w-none" /> : null}
              {extras}
              {skin === "rose" ? null : (
                <p className="player-stage-desk text-center font-mono text-[10px] uppercase tracking-[0.12em] text-subtle md:text-left">
                  Desk: {kindLabel(deskKind)} · You: {listenModeLabel(listenMode)}
                </p>
              )}
            </div>
          </div>
        </div>
        {artSheet}
      </div>
    );
  }

  return (
    <div className={cn("player-dock fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur-sm", shell)}>
      {skin === "rose" ? <RoseRiteOrnament /> : null}
      <div className="mx-auto max-w-6xl px-3 pt-1 sm:px-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPlayerCollapsed(false)}
            className="grid size-11 shrink-0 place-items-center text-gold"
            aria-label="Expand player"
            title="Expand player"
          >
            <ChevronUp className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <Scrubber currentTime={currentTime} duration={duration} compact health={skin === "rose"} />
          </div>
          <button
            type="button"
            onClick={() => setPlayerHidden(true)}
            className="grid size-11 shrink-0 place-items-center text-subtle hover:text-fg"
            aria-label="Hide player"
            title="Hide player"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setPlayerCollapsed(false)}
            className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
            aria-label="Expand player"
          >
            <CoverArt src={songPortrait(track, channel) || art} alt="" className="size-12 shrink-0 overflow-hidden rounded-md" motion="still" />
            <span className="min-w-0 flex-1 overflow-hidden">
              <MarqueeTitle
                text={track.title}
                className={cn("min-w-0 w-full font-display text-base leading-tight", skin === "glaum" && "glaum-title", skin === "rose" && "rose-title")}
              />
              <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                {track.artist ? `${track.artist} · ` : ""}
                {statusLine}
              </span>
            </span>
          </button>
          {overlay ? (
            <button
              type="button"
              onClick={() => void jumpToLive()}
              className="inline-flex h-11 shrink-0 items-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
              title="Jump to the station clock"
            >
              <Radio className="size-3.5" />
              <span className="hidden sm:inline">Live</span>
            </button>
          ) : null}
          <TransportButtons playing={playing} skipHint={skipHint} />
          {!ios ? <VolumeControl compact /> : null}
        </div>
      </div>
      {artSheet}
    </div>
  );
}
