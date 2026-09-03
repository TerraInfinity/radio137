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
  stationSkin,
} from "@/lib/catalog";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { durationOf, neighborTrack, rememberDuration, resolveLivePlayhead, walkFrom } from "@/lib/playback";
import { radioEngine } from "@/lib/radio-engine";
import { loadPersisted, savePersisted } from "@/lib/storage";
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
  setPlayerCollapsed: (value: boolean) => void;
  setIdentityName: (name: string) => void;
  claimChannel: (slug: string, minutes: number) => void;
  releaseClaim: (slug: string) => void;
  skipAllowed: (slug: string) => boolean;
  replaceCatalog: (catalog: Catalog) => void;
  toggleLike: (trackId: string) => void;
  toggleFavorite: (trackId: string) => void;
  collectGlaumule: (amount?: number) => void;
  bumpView: (trackId: string) => void;
};

let consecutiveErrors = 0;
let loadLock: Promise<void> | null = null;
let engineBound = false;
let justEndedId: string | null = null;
let localDetour = false;
const viewed = new Set<string>();

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

function bindEngine() {
  if (engineBound || typeof window === "undefined") return;
  engineBound = true;
  radioEngine.attach({
    onTime: (currentTime, duration) => {
      const status = usePlayerStore.getState().status;
      if (status === "loading") return;
      usePlayerStore.setState({
        currentTime,
        duration: duration > 0 ? duration : usePlayerStore.getState().duration,
      });
    },
    onEnded: (measured) => {
      const track = usePlayerStore.getState().track;
      if (track && measured > 0.25) {
        rememberDuration(track.id, measured);
        patchTrackDuration(track.id, measured);
        justEndedId = track.id;
      }
      void usePlayerStore.getState().next("ended");
    },
    onError: () => {
      void usePlayerStore.getState().next("error");
    },
  });
}

async function loadTrack(
  slug: string,
  track: Track,
  offset: number,
  play: boolean,
  set: (partial: Partial<PlayerState>) => void,
  hops = 0,
) {
  bindEngine();
  if (justEndedId && track.id === justEndedId && hops === 0) {
    const channel = channelOf(slug);
    const playable = getPlayableTracks(channel);
    const kind = channel ? normalizeKind(channel.kind || channel.mode) : "live";
    if (kind === "live" && !drivingDesk(slug)) {
      const head = resolveLivePlayhead(playable, Date.now(), slug, justEndedId);
      if (head && head.track.id !== track.id) {
        await loadTrack(slug, head.track, head.offsetSec, play, set, hops + 1);
        return;
      }
    }
    const nxt = neighborTrack(playable, track.id, 1, true);
    if (nxt && nxt.id !== track.id) {
      await loadTrack(slug, nxt, 0, play, set, hops + 1);
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
    rememberDuration(track.id, result.duration);
    patchTrackDuration(track.id, result.duration);
    if (hops >= 16) {
      const channel = channelOf(slug);
      const playable = getPlayableTracks(channel);
      const nxt = neighborTrack(playable, track.id, 1, true);
      if (nxt && nxt.id !== track.id) {
        await loadTrack(slug, nxt, 0, play, set, hops + 1);
        return;
      }
      set({ status: play ? "playing" : "paused", duration: result.duration });
      return;
    }
    const leftover = result.leftover;
    const channel = channelOf(slug);
    const playable = getPlayableTracks(channel);
    const walked = walkFrom(playable, track.id, leftover, justEndedId);
    if (walked && walked.track.id !== track.id) {
      await loadTrack(slug, walked.track, walked.offsetSec, play, set, hops + 1);
      return;
    }
    const nxt = neighborTrack(playable, track.id, 1, true);
    if (nxt && nxt.id !== track.id) {
      await loadTrack(slug, nxt, 0, play, set, hops + 1);
      return;
    }
    set({ status: "paused", duration: result.duration });
    return;
  }
  rememberDuration(track.id, result.duration);
  patchTrackDuration(track.id, result.duration);
  consecutiveErrors = 0;
  if (justEndedId && track.id !== justEndedId) justEndedId = null;
  const playing = play && !radioEngine.snapshot().paused;
  set({
    status: playing ? "playing" : "paused",
    currentTime: result.currentTime,
    duration: result.duration,
  });
  if (playing) usePlayerStore.getState().bumpView(track.id);
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
  gateOpen: true,
  playerCollapsed: true,
  identity: null,
  claims: {},
  points: 0,
  glaumules: 0,
  liked: [],
  favorites: [],
  views: {},
  likeCounts: {},

  hydrate: () => {
    bindEngine();
    const p = loadPersisted();
    const identity = p.identityName ? { id: `guest:${p.identityName.toLowerCase()}`, name: p.identityName } : null;
    set({
      autoplay: p.autoplay,
      lastSlug: p.lastSlug,
      visited: p.visited,
      playerCollapsed: p.playerCollapsed,
      volume: p.volume,
      identity,
      gateOpen: !p.visited,
      ready: true,
      points: p.points,
      glaumules: p.glaumules,
      liked: p.liked,
      favorites: p.favorites,
    });
    radioEngine.setGain(p.volume, false);
    if (p.visited && p.lastSlug) void get().tuneIn(p.lastSlug);
    void import("@/lib/desk-api")
      .then(({ listCatalogEdits }) => listCatalogEdits())
      .then((data) => {
        get().replaceCatalog(applyCatalogEdits(getSeedCatalog(), data.tracks, data.stations));
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
            justEndedId,
            localDetour,
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
      set({ channelSlug: slug, track: null, status: "off-air" });
      radioEngine.pause();
      return;
    }
    const playable = getPlayableTracks(channel);
    if (playable.length === 0) {
      set({ channelSlug: slug, track: null, status: "off-air" });
      return;
    }
    if (opts?.forcePlay) set({ autoplay: true });
    const play = get().autoplay || Boolean(opts?.forcePlay);
    const kind = normalizeKind(channel.kind || channel.mode);
    localDetour = false;
    const run = async () => {
      if (kind === "live") {
        const head = resolveLivePlayhead(playable, Date.now(), slug, justEndedId);
        const track = head?.track ?? playable[0];
        const offset = head?.offsetSec ?? 0;
        await loadTrack(slug, track, offset, play, set);
      } else {
        await loadTrack(slug, playable[0], 0, play, set);
      }
    };
    loadLock = run();
    await loadLock;
    set({ lastSlug: slug, visited: true, gateOpen: false });
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
    await loadTrack(slug, track, 0, true, set);
    localDetour = true;
  },

  togglePlay: async () => {
    const state = get();
    if (state.status === "playing") {
      radioEngine.pause();
      set({ status: "paused" });
      return;
    }
    if (state.track) {
      const ok = await radioEngine.resume();
      set({ status: ok ? "playing" : "paused" });
      return;
    }
    if (state.channelSlug) await get().tuneIn(state.channelSlug, { forcePlay: true });
  },

  next: async (reason) => {
    const slug = get().channelSlug;
    if (!slug) return;
    const channel = channelOf(slug);
    if (!channel) return;
    const playable = getPlayableTracks(channel);
    const current = get().track;
    const kind = normalizeKind(channel.kind || channel.mode);
    if (reason === "error") {
      consecutiveErrors += 1;
      if (consecutiveErrors > 8) {
        set({ status: "missing" });
        return;
      }
      const nxt = current ? neighborTrack(playable, current.id, 1, true) : playable[0];
      if (nxt) await loadTrack(slug, nxt, 0, true, set);
      return;
    }
    if (kind === "live" && reason === "ended") {
      const play = get().autoplay;
      if (drivingDesk(slug)) {
        const nxt = current ? neighborTrack(playable, current.id, 1, true) : playable[0];
        if (nxt && nxt.id !== current?.id) {
          await loadTrack(slug, nxt, 0, play, set);
          return;
        }
      }
      localDetour = false;
      const head = resolveLivePlayhead(playable, Date.now(), slug, current?.id ?? justEndedId);
      if (head) await loadTrack(slug, head.track, head.offsetSec, play, set);
      return;
    }
    if (kind === "fixed" && reason === "ended") {
      const nxt = current ? neighborTrack(playable, current.id, 1, false) : playable[0];
      if (nxt) await loadTrack(slug, nxt, 0, true, set);
      else {
        radioEngine.pause();
        set({ status: "paused" });
      }
      return;
    }
    if (!get().skipAllowed(slug) && reason === "user") return;
    if (reason === "user") localDetour = true;
    const wrap = kind !== "fixed";
    const nxt = current ? neighborTrack(playable, current.id, 1, wrap) : playable[0];
    if (nxt) await loadTrack(slug, nxt, 0, true, set);
    else if (playable[0]) await loadTrack(slug, playable[0], 0, true, set);
  },

  prev: async () => {
    const slug = get().channelSlug;
    if (!slug || !get().skipAllowed(slug)) return;
    const channel = channelOf(slug);
    if (!channel) return;
    const playable = getPlayableTracks(channel);
    const current = get().track;
    const wrap = normalizeKind(channel.kind || channel.mode) !== "fixed";
    const prev = current ? neighborTrack(playable, current.id, -1, wrap) : playable[0];
    if (prev) {
      localDetour = true;
      await loadTrack(slug, prev, 0, true, set);
    }
  },

  seek: (seconds) => {
    const slug = get().channelSlug;
    if (!slug) return;
    const channel = channelOf(slug);
    const live = channel ? normalizeKind(channel.kind || channel.mode) === "live" : false;
    if (live && !get().skipAllowed(slug)) return;
    radioEngine.seek(seconds);
    const snap = radioEngine.snapshot();
    set({ currentTime: snap.currentTime, duration: snap.duration || get().duration });
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
    const kind = channel ? normalizeKind(channel.kind || channel.mode) : "live";
    if (kind !== "live") return true;
    const claim = get().claims[slug];
    if (!claim?.claimantId || (claim.expiresAt ?? 0) < Date.now()) return true;
    return claim.claimantId === get().identity?.id;
  },

  replaceCatalog: (catalog) => {
    setLiveCatalog(catalog);
    set({ catalog });
  },

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
