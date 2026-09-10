import { create } from "zustand";
import {
  getCatalog,
  getChannel,
  getPlayableTracks,
  getSeedCatalog,
  isAdultTrack,
  isChannelNsfw,
  normalizeKind,
  patchTrackDuration,
  setLiveCatalog,
  shuffleActive,
  stationSkin,
  normalizeShuffle,
} from "@/lib/catalog";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import type { CutGroup } from "@/lib/cuts";
import { durationOf, neighborTrack, nextForward, nextShuffled, rememberDuration, resolveLivePlayhead, walkFrom } from "@/lib/playback";
import { endPad, radioEngine } from "@/lib/radio-engine";
import { effectiveKind, listenModeFromLocation, type ListenMode } from "@/lib/listen-mode";
import { bindMediaSession, flushMediaSession, ignoreHidePause, rebindMediaSession, syncMediaSession } from "@/lib/media-session";
import { loadPersisted, savePersisted } from "@/lib/storage";
import { isLandingLocation } from "@/lib/landing";
import type { Catalog, Channel, ClaimRecord, Identity, Track } from "@/lib/types";

export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "missing" | "off-air";

type PlayerState = {
  catalog: Catalog;
  ready: boolean;
  channelSlug: string | null;
  track: Track | null;
  status: PlayerStatus;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  autoplay: boolean;
  lastSlug: string | null;
  visited: boolean;
  gateOpen: boolean;
  playerCollapsed: boolean;
  identity: Identity | null;
  claims: Record<string, ClaimRecord>;
  points: number;
  glaumules: number;
  liked: string[];
  favorites: string[];
  views: Record<string, number>;
  likeCounts: Record<string, number>;
  shuffle: boolean;
  shuffleBySlug: Record<string, boolean>;
  cutGroups: CutGroup[];
  listenMode: ListenMode;
  listenModeSession: ListenMode | null;
  buffering: boolean;
  deckHint: string;
  hydrate: () => void;
  enterGate: () => void;
  tuneIn: (slug: string, opts?: { forcePlay?: boolean }) => Promise<void>;
  cueTrack: (slug: string, trackId: string) => Promise<void>;
  togglePlay: () => Promise<void>;
  next: (reason?: "user" | "ended" | "error") => Promise<void>;
  prev: () => Promise<void>;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setAutoplay: (value: boolean) => void;
  setListenMode: (value: ListenMode) => void;
  applyListenQuery: (search?: string, hash?: string) => void;
  jumpToLive: () => Promise<void>;
  toggleShuffle: (slug?: string) => void;
  setPlayerCollapsed: (value: boolean) => void;
  setIdentityName: (name: string) => void;
  claimChannel: (slug: string, minutes: number) => void;
  releaseClaim: (slug: string) => void;
  skipAllowed: (slug: string) => boolean;
  replaceCatalog: (catalog: Catalog) => void;
  replaceCutGroups: (groups: CutGroup[]) => void;
  toggleLike: (trackId: string) => void;
  toggleFavorite: (trackId: string) => void;
  collectGlaumule: (amount?: number) => void;
  bumpView: (trackId: string) => void;
};

let consecutiveErrors = 0;
let loadLock: Promise<void> | null = null;
let engineBound = false;
let justEndedId: string | null = null;
let userPaused = false;
const viewed = new Set<string>();
const recents: string[] = [];

function persist() {
  const s = usePlayerStore.getState();
  savePersisted({
    autoplay: s.autoplay,
    lastSlug: s.lastSlug,
    visited: s.visited,
    playerCollapsed: s.playerCollapsed,
    volume: s.volume,
    identityName: s.identity?.name ?? null,
    points: s.points,
    glaumules: s.glaumules,
    liked: s.liked,
    favorites: s.favorites,
    shuffleBySlug: s.shuffleBySlug,
    listenMode: s.listenMode,
  });
}

function channelOf(slug: string | null): Channel | undefined {
  if (!slug) return undefined;
  return getChannel(slug);
}

function drivingDesk(slug: string | null): boolean {
  if (!slug) return false;
  const state = usePlayerStore.getState();
  const claim = state.claims[slug];
  if (!claim?.claimantId || (claim.expiresAt ?? 0) < Date.now()) return false;
  return claim.claimantId === state.identity?.id;
}

function rememberRecent(id: string) {
  if (recents[recents.length - 1] === id) return;
  recents.push(id);
  if (recents.length > 40) recents.splice(0, recents.length - 40);
}

function pickNext(channel: Channel | undefined, playable: Track[], currentId: string | null | undefined): Track | null {
  const pref = channel ? Boolean(usePlayerStore.getState().shuffleBySlug[channel.slug]) : false;
  if (channel && shuffleActive(channel, pref)) {
    return nextShuffled(playable, currentId, recents);
  }
  return nextForward(playable, currentId, justEndedId);
}

function listenOf(state?: PlayerState): ListenMode {
  const s = state ?? usePlayerStore.getState();
  return s.listenModeSession ?? s.listenMode;
}

function setHint(message: string) {
  usePlayerStore.setState({ deckHint: message });
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    if (usePlayerStore.getState().deckHint === message) usePlayerStore.setState({ deckHint: "" });
  }, 3200);
}

function bindEngine() {
  if (engineBound || typeof window === "undefined") return;
  engineBound = true;
  ignoreHidePause();
  radioEngine.attach({
    onTime: (currentTime, duration) => {
      const status = usePlayerStore.getState().status;
      if (status === "loading") return;
      usePlayerStore.setState({
        currentTime,
        duration: duration > 0 ? duration : usePlayerStore.getState().duration,
      });
      syncMediaSession();
    },
    onEnded: (measured, fileDuration) => {
      const track = usePlayerStore.getState().track;
      const known = fileDuration > 0 ? fileDuration : measured;
      const tail = Math.max(endPad(known), known < 6 ? 0.15 : 0.35);
      if (track && known > 0 && measured >= known - tail && measured > 0.2) {
        rememberDuration(track.id, known);
        patchTrackDuration(track.id, known);
      }
      if (track) justEndedId = track.id;
      void usePlayerStore.getState().next("ended");
    },
    onError: () => {
      void usePlayerStore.getState().next("error");
    },
    onPause: () => {
      const s = usePlayerStore.getState();
      if (s.status === "playing") usePlayerStore.setState({ status: "paused" });
      syncMediaSession();
    },
    onPlay: () => {
      const s = usePlayerStore.getState();
      if (s.status === "paused" || s.status === "loading") {
        userPaused = false;
        usePlayerStore.setState({ status: "playing", buffering: false });
      }
      syncMediaSession();
    },
    onBuffering: (value) => {
      usePlayerStore.setState({ buffering: value });
    },
  });
  bindMediaSession(
    () => {
      const s = usePlayerStore.getState();
      const allowed = s.channelSlug ? s.skipAllowed(s.channelSlug) : true;
      return {
        track: s.track,
        channelSlug: s.channelSlug,
        status: s.status,
        currentTime: s.currentTime,
        duration: s.duration,
        skipAllowed: allowed,
        seekAllowed: allowed,
      };
    },
    {
      play: () => {
        const s = usePlayerStore.getState();
        if (s.status === "playing") void radioEngine.resume();
        else void s.togglePlay();
      },
      pause: () => {
        const s = usePlayerStore.getState();
        if (s.status === "playing") void s.togglePlay();
      },
      next: () => {
        void usePlayerStore.getState().next("user");
      },
      prev: () => {
        void usePlayerStore.getState().prev();
      },
      seek: (seconds) => {
        usePlayerStore.getState().seek(seconds);
      },
    },
  );
  window.addEventListener("pageshow", () => {
    rebindMediaSession();
    bindEngine();
    bindMediaSession(
      () => {
        const s = usePlayerStore.getState();
        const allowed = s.channelSlug ? s.skipAllowed(s.channelSlug) : true;
        return {
          track: s.track,
          channelSlug: s.channelSlug,
          status: s.status,
          currentTime: s.currentTime,
          duration: s.duration,
          skipAllowed: allowed,
          seekAllowed: allowed,
        };
      },
      {
        play: () => {
          const s = usePlayerStore.getState();
          if (s.status === "playing") void radioEngine.resume();
          else void s.togglePlay();
        },
        pause: () => {
          const s = usePlayerStore.getState();
          if (s.status === "playing") void s.togglePlay();
        },
        next: () => void usePlayerStore.getState().next("user"),
        prev: () => void usePlayerStore.getState().prev(),
        seek: (seconds) => usePlayerStore.getState().seek(seconds),
      },
    );
    syncMediaSession();
  });
}

async function loadTrack(
  slug: string,
  track: Track,
  offset: number,
  play: boolean,
  set: (partial: Partial<PlayerState>) => void,
  hops = 0,
  mode: "join" | "flow" = "flow",
) {
  bindEngine();
  if (justEndedId && track.id === justEndedId && hops === 0 && mode !== "join") {
    const channel = channelOf(slug);
    const playable = getPlayableTracks(channel);
    const nxt = pickNext(channel, playable, track.id);
    if (nxt && nxt.id !== track.id) {
      await loadTrack(slug, nxt, 0, play, set, hops + 1, "flow");
      return;
    }
  }
  set({ channelSlug: slug, track, status: "loading", currentTime: Math.max(0, offset), duration: durationOf(track) });
  const state = usePlayerStore.getState();
  const result = await radioEngine.load({
    url: track.audioUrl,
    offsetSec: offset,
    play,
    volume: state.volume,
    muted: state.muted,
  });
  if (result.kind === "stale") return;
  if (result.kind === "error") {
    await usePlayerStore.getState().next("error");
    return;
  }
  if (result.kind === "skip") {
    if (result.duration > 0.25) {
      rememberDuration(track.id, result.duration);
      patchTrackDuration(track.id, result.duration);
    }
    if (!usePlayerStore.getState().autoplay && mode !== "join") {
      radioEngine.pause();
      set({ status: "paused", duration: result.duration });
      return;
    }
    const channel = channelOf(slug);
    const playable = getPlayableTracks(channel);
    if (hops >= 16) {
    const nxt = pickNext(channel, playable, track.id);
    if (nxt && nxt.id !== track.id) {
      await loadTrack(slug, nxt, 0, play, set, hops + 1, "flow");
      return;
    }
    set({ status: play ? "playing" : "paused", duration: result.duration });
    return;
    }
    if (mode === "join") {
      const walked = walkFrom(playable, track.id, result.leftover, justEndedId);
      if (walked && walked.track.id !== track.id) {
        await loadTrack(slug, walked.track, walked.offsetSec, play, set, hops + 1, "join");
        return;
      }
    }
    const nxt = pickNext(channel, playable, track.id);
    if (nxt && nxt.id !== track.id) {
      await loadTrack(slug, nxt, 0, play, set, hops + 1, "flow");
      return;
    }
    set({ status: "paused", duration: result.duration });
    return;
  }
  rememberDuration(track.id, result.duration);
  patchTrackDuration(track.id, result.duration);
  consecutiveErrors = 0;
  if (justEndedId && track.id !== justEndedId) justEndedId = null;
  const autoOff = !usePlayerStore.getState().autoplay && userPaused;
  const playing = play && !autoOff && !radioEngine.snapshot().paused;
  if (autoOff) radioEngine.pause();
  if (playing) userPaused = false;
  rememberRecent(track.id);
  set({
    status: playing ? "playing" : "paused",
    currentTime: result.currentTime,
    duration: result.duration,
  });
  if (playing) usePlayerStore.getState().bumpView(track.id);
  const channel = channelOf(slug);
  const playable = getPlayableTracks(channel);
  const kind = effectiveKind(channel, listenOf());
  const nxt =
    kind === "live"
      ? playable[(Math.max(0, playable.findIndex((item) => item.id === track.id)) + 1) % Math.max(playable.length, 1)]
      : pickNext(channel, playable, track.id);
  if (nxt?.audioUrl && nxt.id !== track.id) radioEngine.warm(nxt.audioUrl);
  flushMediaSession();
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  catalog: getCatalog(),
  ready: false,
  channelSlug: null,
  track: null,
  status: "idle",
  currentTime: 0,
  duration: 0,
  volume: 0.85,
  muted: false,
  autoplay: true,
  lastSlug: null,
  visited: false,
  gateOpen: false,
  playerCollapsed: true,
  identity: null,
  claims: {},
  points: 0,
  glaumules: 0,
  liked: [],
  favorites: [],
  views: {},
  likeCounts: {},
  shuffle: false,
  shuffleBySlug: {},
  cutGroups: [],
  listenMode: "ondemand",
  listenModeSession: null,
  buffering: false,
  deckHint: "",

  hydrate: () => {
    bindEngine();
    const p = loadPersisted();
    const identity = p.identityName ? { id: `guest:${p.identityName.toLowerCase()}`, name: p.identityName } : null;
    const landing =
      typeof window !== "undefined" && isLandingLocation(window.location.pathname, window.location.search);
    const showGate = landing && !p.visited;
    const visited = p.visited || !landing;
    set({
      autoplay: p.autoplay,
      lastSlug: p.lastSlug,
      visited,
      playerCollapsed: p.playerCollapsed,
      volume: p.volume,
      identity,
      gateOpen: showGate,
      ready: true,
      points: p.points,
      glaumules: p.glaumules,
      liked: p.liked,
      favorites: p.favorites,
      shuffleBySlug: p.shuffleBySlug,
      listenMode: p.listenMode,
      listenModeSession: typeof window !== "undefined" ? listenModeFromLocation(window.location.search, window.location.hash) : null,
    });
    radioEngine.setGain(p.volume, false);
    if (visited && !p.visited) persist();
    void import("@/lib/desk-api")
      .then(({ listCatalogEdits, listCutGroups }) => Promise.all([listCatalogEdits(), listCutGroups()]))
      .then(([data, cuts]) => {
        get().replaceCatalog(applyCatalogEdits(getSeedCatalog(), data.tracks, data.stations));
        get().replaceCutGroups(cuts.groups);
      })
      .catch(() => {
        /* seed is enough */
      });
    if (typeof window !== "undefined") {
      (window as unknown as { __radioDebug?: unknown }).__radioDebug = {
        state: () => {
          const s = usePlayerStore.getState();
          return {
            title: s.track?.title ?? null,
            id: s.track?.id ?? null,
            status: s.status,
            currentTime: Math.round(s.currentTime * 100) / 100,
            duration: Math.round(s.duration * 100) / 100,
            slug: s.channelSlug,
            points: s.points,
            glaumules: s.glaumules,
            autoplay: s.autoplay,
            listenMode: s.listenModeSession ?? s.listenMode,
            justEndedId,
            userPaused,
            driving: drivingDesk(s.channelSlug),
          };
        },
        engine: () => radioEngine.snapshot(),
        seekNearEnd: () => {
          const s = usePlayerStore.getState();
          const t = Math.max(0, s.duration - 0.85);
          s.seek(t);
          return { sought: t, title: s.track?.title ?? null, id: s.track?.id ?? null };
        },
        cueSting: async () => {
          const channel = getChannel("official-glaum-frequency");
          const sting = channel?.tracks.find((item) => /glados/i.test(item.title) && item.enabled !== false);
          if (!sting) return { ok: false };
          await usePlayerStore.getState().cueTrack("official-glaum-frequency", sting.id);
          return { ok: true, id: sting.id, title: sting.title, catalogDur: sting.durationSec };
        },
      };
    }
    if (typeof window !== "undefined" && !(window as unknown as { __radioListenTick?: number }).__radioListenTick) {
      (window as unknown as { __radioListenTick?: number }).__radioListenTick = window.setInterval(() => {
        const s = usePlayerStore.getState();
        if (s.status !== "playing" || !s.track) return;
        const channel = channelOf(s.channelSlug);
        const skin = channel ? stationSkin(channel) : "none";
        const nextPoints = s.points + 1;
        const nextGlaum = s.glaumules + (skin === "glaum" || channel?.glaumules ? 1 : 0);
        usePlayerStore.setState({ points: nextPoints, glaumules: nextGlaum });
        persist();
      }, 20_000);
    }
  },

  enterGate: () => {
    const last = get().lastSlug || get().catalog.defaultSlug;
    set({ gateOpen: false, visited: true, lastSlug: last });
    persist();
    void get().tuneIn(last, { forcePlay: true });
  },

  tuneIn: async (slug, opts) => {
    const channel = channelOf(slug);
    if (!channel) {
      set({ status: "idle" });
      return;
    }
    if (!channel.enabled) {
      set({ channelSlug: slug, track: null, status: "off-air", visited: true, gateOpen: false });
      radioEngine.pause();
      persist();
      return;
    }
    const playable = getPlayableTracks(channel);
    if (playable.length === 0) {
      set({ channelSlug: slug, track: null, status: "off-air", visited: true, gateOpen: false });
      persist();
      return;
    }
    const alreadyHere =
      get().channelSlug === slug && (get().status === "playing" || get().status === "loading") && get().track;
    if (alreadyHere) {
      set({ visited: true, gateOpen: false, lastSlug: slug });
      persist();
      return;
    }
    if (opts?.forcePlay) {
      userPaused = false;
    }
    const play = !userPaused && (get().autoplay || Boolean(opts?.forcePlay));
    const kind = effectiveKind(channel, listenOf(get()));
    const mixing = shuffleActive(channel, Boolean(get().shuffleBySlug[slug]));
    if (slug !== get().channelSlug) justEndedId = null;
    const run = async () => {
      if (kind === "live") {
        const head = resolveLivePlayhead(playable, Date.now(), slug, justEndedId);
        const track = head?.track ?? playable[0];
        const offset = head?.offsetSec ?? 0;
        await loadTrack(slug, track, offset, play, set, 0, "join");
      } else if (mixing) {
        const track = nextShuffled(playable, null, recents) ?? playable[0];
        await loadTrack(slug, track, 0, play, set, 0, "flow");
      } else {
        await loadTrack(slug, playable[0], 0, play, set, 0, "flow");
      }
    };
    loadLock = Promise.resolve(loadLock).then(run, run);
    await loadLock;
    set({ lastSlug: slug, visited: true, gateOpen: false, shuffle: mixing });
    persist();
  },

  cueTrack: async (slug, trackId) => {
    if (!get().skipAllowed(slug)) return;
    const channel = channelOf(slug);
    const track = channel?.tracks.find((item) => item.id === trackId);
    if (!channel || !track || (isAdultTrack(track) && !isChannelNsfw(channel))) {
      await get().tuneIn(slug);
      return;
    }
    await loadTrack(slug, track, 0, true, set, 0, "flow");
    userPaused = false;
    set({ lastSlug: slug, visited: true, gateOpen: false });
    persist();
  },

  togglePlay: async () => {
    const state = get();
    if (state.status === "playing") {
      userPaused = true;
      radioEngine.pause();
      set({ status: "paused" });
      flushMediaSession();
      return;
    }
    userPaused = false;
    if (state.track) {
      const ok = await radioEngine.resume();
      set({ status: ok ? "playing" : "paused" });
      flushMediaSession();
      return;
    }
    if (state.channelSlug) await get().tuneIn(state.channelSlug, { forcePlay: true });
  },

  next: async (reason) => {
    const run = async () => {
      const slug = get().channelSlug;
      if (!slug) return;
      const channel = channelOf(slug);
      if (!channel) return;
      const playable = getPlayableTracks(channel);
      const current = get().track;
      const kind = effectiveKind(channel, listenOf(get()));
      if (reason === "error") {
        consecutiveErrors += 1;
        if (consecutiveErrors > 8) {
          set({ status: "missing" });
          return;
        }
        const nxt = pickNext(channel, playable, current?.id);
        if (nxt) await loadTrack(slug, nxt, 0, true, set, 0, "flow");
        return;
      }
      const mixing = shuffleActive(channel, Boolean(get().shuffleBySlug[slug]));
      if (reason === "ended") {
        if (!get().autoplay || userPaused) {
          radioEngine.pause();
          set({ status: "paused" });
          flushMediaSession();
          return;
        }
        const play = true;
        if (kind === "live") {
          const head = resolveLivePlayhead(playable, Date.now(), slug, justEndedId);
          if (head) await loadTrack(slug, head.track, head.offsetSec, play, set, 0, "join");
          return;
        }
        if (!mixing && kind === "fixed") {
          const nxt = current ? neighborTrack(playable, current.id, 1, false) : playable[0];
          if (nxt) await loadTrack(slug, nxt, 0, true, set, 0, "flow");
          else {
            radioEngine.pause();
            set({ status: "paused" });
          }
          return;
        }
        const nxt = pickNext(channel, playable, current?.id);
        if (nxt) await loadTrack(slug, nxt, 0, play, set, 0, "flow");
        return;
      }
      if (!get().skipAllowed(slug) && reason === "user") return;
      if (reason === "user") userPaused = false;
      const nxt = pickNext(channel, playable, current?.id);
      if (nxt) await loadTrack(slug, nxt, 0, true, set, 0, "flow");
      else if (playable[0]) await loadTrack(slug, playable[0], 0, true, set, 0, "flow");
    };
    loadLock = Promise.resolve(loadLock).then(run, run);
    await loadLock;
  },

  prev: async () => {
    const slug = get().channelSlug;
    if (!slug || !get().skipAllowed(slug)) return;
    const channel = channelOf(slug);
    if (!channel) return;
    const playable = getPlayableTracks(channel);
    const current = get().track;
    const mixing = shuffleActive(channel, Boolean(get().shuffleBySlug[slug]));
    if (mixing && recents.length > 1) {
      const currentId = current?.id;
      let prior = recents.length - 1;
      if (recents[prior] === currentId) prior -= 1;
      const id = prior >= 0 ? recents[prior] : null;
      const prevTrack = id ? playable.find((item) => item.id === id) : null;
      if (prevTrack) {
        userPaused = false;
        recents.splice(prior + 1);
        await loadTrack(slug, prevTrack, 0, true, set, 0, "flow");
        return;
      }
    }
    const wrap = effectiveKind(channel, listenOf(get())) !== "fixed";
    const prev = current ? neighborTrack(playable, current.id, -1, wrap) : playable[0];
    if (prev) {
      userPaused = false;
      await loadTrack(slug, prev, 0, true, set, 0, "flow");
    }
  },

  seek: (seconds) => {
    const slug = get().channelSlug;
    if (!slug) return;
    if (!get().skipAllowed(slug)) return;
    radioEngine.seek(seconds);
    const snap = radioEngine.snapshot();
    set({ currentTime: snap.currentTime, duration: snap.duration || get().duration });
    flushMediaSession();
  },

  setVolume: (volume) => {
    const next = Math.min(1, Math.max(0, volume));
    const muted = next === 0 ? true : get().muted && next === 0;
    radioEngine.setGain(next, muted);
    set({ volume: next, muted });
    persist();
  },

  toggleMute: () => {
    const muted = !get().muted;
    radioEngine.setGain(get().volume, muted);
    set({ muted });
  },

  setAutoplay: (value) => {
    set({ autoplay: value });
    persist();
  },

  setListenMode: (value) => {
    set({ listenMode: value, listenModeSession: null });
    persist();
    const slug = get().channelSlug;
    const channel = channelOf(slug);
    if (value === "stream" && channel && normalizeKind(channel.kind || channel.mode) === "live") {
      void get().jumpToLive();
    } else {
      flushMediaSession();
    }
  },

  applyListenQuery: (search, hash) => {
    if (typeof window === "undefined") return;
    const forced = listenModeFromLocation(search ?? window.location.search, hash ?? window.location.hash);
    if (!forced || get().listenModeSession === forced) return;
    set({ listenModeSession: forced });
    const channel = channelOf(get().channelSlug);
    if (forced === "stream" && channel && normalizeKind(channel.kind || channel.mode) === "live") {
      void get().jumpToLive();
    } else {
      flushMediaSession();
    }
  },

  jumpToLive: async () => {
    const slug = get().channelSlug;
    const channel = channelOf(slug);
    if (!slug || !channel) return;
    const playable = getPlayableTracks(channel);
    if (playable.length === 0) return;
    const play = !userPaused && (get().status === "playing" || get().autoplay);
    userPaused = false;
    const head = resolveLivePlayhead(playable, Date.now(), slug, justEndedId);
    const track = head?.track ?? playable[0];
    const offset = head?.offsetSec ?? 0;
    const run = async () => {
      await loadTrack(slug, track, offset, play || true, set, 0, "join");
    };
    loadLock = Promise.resolve(loadLock).then(run, run);
    await loadLock;
    setHint("Back on the station clock.");
    flushMediaSession();
  },

  toggleShuffle: (slugArg) => {
    const slug = slugArg || get().channelSlug;
    const channel = channelOf(slug);
    if (!channel || !slug) return;
    const mode = normalizeShuffle(channel.shuffle);
    if (mode === "off" || mode === "on") return;
    const next = !shuffleActive(channel, Boolean(get().shuffleBySlug[slug]));
    const shuffleBySlug = { ...get().shuffleBySlug, [slug]: next };
    if (get().channelSlug === slug) set({ shuffle: next, shuffleBySlug });
    else set({ shuffleBySlug });
    persist();
  },

  setPlayerCollapsed: (value) => {
    set({ playerCollapsed: value });
    persist();
  },

  setIdentityName: (name) => {
    const trimmed = name.trim().slice(0, 24);
    set({ identity: trimmed ? { id: `guest:${trimmed.toLowerCase()}`, name: trimmed } : null });
    persist();
  },

  claimChannel: (slug, minutes) => {
    const identity = get().identity;
    if (!identity) return;
    set({
      claims: {
        ...get().claims,
        [slug]: { claimantId: identity.id, name: identity.name, expiresAt: Date.now() + minutes * 60_000 },
      },
    });
  },

  releaseClaim: (slug) => {
    const next = { ...get().claims };
    delete next[slug];
    set({ claims: next });
  },

  skipAllowed: (slug) => {
    const channel = channelOf(slug);
    const kind = effectiveKind(channel, listenOf(get()));
    if (kind !== "live") return true;
    const claim = get().claims[slug];
    if (!claim?.claimantId || (claim.expiresAt ?? 0) < Date.now()) return true;
    return claim.claimantId === get().identity?.id;
  },

  replaceCatalog: (catalog) => {
    setLiveCatalog(catalog);
    const slug = get().channelSlug;
    const channel = slug ? catalog.channels.find((item) => item.slug === slug) : undefined;
    const playingId = get().track?.id ?? null;
    const playable = getPlayableTracks(channel);
    const still = playingId ? playable.find((item) => item.id === playingId) : null;
    set({
      catalog,
      shuffle: shuffleActive(channel, Boolean(slug && get().shuffleBySlug[slug])),
      track: still ?? get().track,
    });
    if (playingId && !still) void get().next("ended");
    flushMediaSession();
  },

  replaceCutGroups: (groups) => set({ cutGroups: groups }),

  toggleLike: (trackId) => {
    const liked = new Set(get().liked);
    const counts = { ...get().likeCounts };
    if (liked.has(trackId)) {
      liked.delete(trackId);
      counts[trackId] = Math.max(0, (counts[trackId] ?? 1) - 1);
    } else {
      liked.add(trackId);
      counts[trackId] = (counts[trackId] ?? 0) + 1;
      const channel = channelOf(get().channelSlug);
      if (channel && (stationSkin(channel) === "glaum" || channel.loveBubbles)) {
        window.dispatchEvent(new CustomEvent("radio-love", { detail: { kind: "like" } }));
      }
    }
    set({ liked: [...liked], likeCounts: counts });
    persist();
    void import("@/lib/social-api")
      .then(({ bumpTrackLike }) => bumpTrackLike({ data: { trackId, liked: liked.has(trackId) } }))
      .catch(() => {
        /* local is enough */
      });
  },

  toggleFavorite: (trackId) => {
    const favorites = new Set(get().favorites);
    if (favorites.has(trackId)) favorites.delete(trackId);
    else favorites.add(trackId);
    set({ favorites: [...favorites] });
    persist();
    void import("@/lib/social-api")
      .then(({ toggleFavoriteTrack }) => toggleFavoriteTrack({ data: { trackId } }))
      .catch(() => {
        /* local is enough */
      });
  },

  collectGlaumule: (amount = 1) => {
    set({ glaumules: get().glaumules + amount, points: get().points + amount });
    persist();
  },

  bumpView: (trackId) => {
    if (viewed.has(trackId)) return;
    viewed.add(trackId);
    set({ views: { ...get().views, [trackId]: (get().views[trackId] ?? 0) + 1 } });
    void import("@/lib/social-api")
      .then(({ bumpTrackView }) => bumpTrackView({ data: { trackId } }))
      .then((row) => {
        if (row) {
          usePlayerStore.setState((s) => ({
            views: { ...s.views, [trackId]: row.views },
            likeCounts: { ...s.likeCounts, [trackId]: row.likes },
          }));
        }
      })
      .catch(() => {
        /* local is enough */
      });
  },
}));
