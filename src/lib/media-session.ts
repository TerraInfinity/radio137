/**
 * Lock-screen / headset controls for the single HTMLAudioElement deck.
 * iOS Safari is best-effort; Chrome/Brave/Android is the primary win.
 * Media Session attaches after the first user-gesture unlocked play.
 */
import { getChannel } from "@/lib/catalog";
import { isLoopingVisual, mediaUrl } from "@/lib/media";
import { radioEngine } from "@/lib/radio-engine";
import type { Channel, Track } from "@/lib/types";

type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "missing" | "off-air";

type Snapshot = {
  track: Track | null;
  channelSlug: string | null;
  status: PlayerStatus;
  currentTime: number;
  duration: number;
  skipAllowed: boolean;
  seekAllowed: boolean;
};

let lastArtwork = "";
let lastTitle = "";
let lastSkip: boolean | null = null;
let lastPosAt = 0;
let bound = false;

function session(): MediaSession | null {
  if (typeof navigator === "undefined") return null;
  return navigator.mediaSession ?? null;
}

function absoluteArt(src?: string | null): string {
  const url = mediaUrl(src);
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window === "undefined") return "";
  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return "";
  }
}

function artworkList(track: Track, channel: Channel | undefined): MediaImage[] {
  const cover = track.coverUrl || channel?.cover;
  const still = isLoopingVisual(cover) ? channel?.cover : cover;
  const href = absoluteArt(still && !isLoopingVisual(still) ? still : cover);
  if (!href || !/^https?:\/\//i.test(href)) return [];
  return [
    { src: href, sizes: "96x96", type: "image/jpeg" },
    { src: href, sizes: "256x256", type: "image/jpeg" },
    { src: href, sizes: "512x512", type: "image/jpeg" },
  ];
}

function playbackState(status: PlayerStatus): MediaSessionPlaybackState {
  if (status === "playing") return "playing";
  if (status === "paused" || status === "loading") return "paused";
  return "none";
}

export function bindMediaSession(getSnapshot: () => Snapshot, actions: {
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
}) {
  const ms = session();
  if (!ms || bound) return;
  bound = true;

  const run = (fn: () => void) => {
    try {
      fn();
    } catch {
      /* ignore */
    }
  };

  const handle = (name: MediaSessionAction, fn: MediaSessionActionHandler | null) => {
    try {
      ms.setActionHandler(name, fn);
    } catch {
      /* unsupported action */
    }
  };

  handle("play", () => run(actions.play));
  handle("pause", () => run(actions.pause));
  handle("stop", () => run(actions.pause));

  const applySkipHandlers = (allowed: boolean) => {
    handle("nexttrack", allowed ? () => run(actions.next) : null);
    handle("previoustrack", allowed ? () => run(actions.prev) : null);
    handle(
      "seekto",
      allowed
        ? (details) => {
            if (typeof details.seekTime === "number") run(() => actions.seek(details.seekTime as number));
          }
        : null,
    );
    handle(
      "seekbackward",
      allowed
        ? (details) => {
            const off = details.seekOffset || 10;
            const snap = getSnapshot();
            run(() => actions.seek(Math.max(0, snap.currentTime - off)));
          }
        : null,
    );
    handle(
      "seekforward",
      allowed
        ? (details) => {
            const off = details.seekOffset || 10;
            const snap = getSnapshot();
            run(() => actions.seek(snap.currentTime + off));
          }
        : null,
    );
  };

  applySkipHandlers(false);

  const sync = () => {
    const snap = getSnapshot();
    const channel = snap.channelSlug ? getChannel(snap.channelSlug) : undefined;
    ms.playbackState = playbackState(snap.status);
    if (snap.track) {
      const title = snap.track.title;
      const art = (snap.track.coverUrl || channel?.cover || "") + title;
      if (title !== lastTitle || art !== lastArtwork) {
        lastTitle = title;
        lastArtwork = art;
        try {
          ms.metadata = new MediaMetadata({
            title: snap.track.title,
            artist: snap.track.artist || channel?.name || "Radio",
            album: channel?.name || "Radio",
            artwork: artworkList(snap.track, channel),
          });
        } catch {
          /* MediaMetadata missing */
        }
      }
    }
    const skip = snap.skipAllowed && snap.seekAllowed;
    if (lastSkip !== skip) {
      lastSkip = skip;
      applySkipHandlers(skip);
    }
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    if (now - lastPosAt < 900) return;
    lastPosAt = now;
    const duration = snap.duration;
    const position = snap.currentTime;
    if (duration >= 0.5 && Number.isFinite(duration) && Number.isFinite(position) && position >= 0) {
      try {
        ms.setPositionState({ duration, playbackRate: 1, position: Math.min(position, duration) });
      } catch {
        /* ignore */
      }
    }
  };

  (bindMediaSession as unknown as { _sync?: () => void })._sync = sync;
  sync();
}

export function syncMediaSession() {
  (bindMediaSession as unknown as { _sync?: () => void })._sync?.();
}

export function flushMediaSession() {
  lastPosAt = 0;
  lastArtwork = "";
  lastTitle = "";
  lastSkip = null;
  syncMediaSession();
}

export function rebindMediaSession() {
  bound = false;
  lastArtwork = "";
  lastTitle = "";
  lastSkip = null;
}

/** Never pause the deck just because the screen went dark. */
export function ignoreHidePause() {
  if (typeof document === "undefined") return;
  document.addEventListener("visibilitychange", () => {
    /* keep playing — Media Session + the HTMLAudioElement hold audio focus */
    void radioEngine.snapshot();
  });
  window.addEventListener("pagehide", () => {
    /* do not pause */
  });
  window.addEventListener("pageshow", () => {
    rebindMediaSession();
  });
}
