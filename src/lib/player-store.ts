import { create } from "zustand";
import {
  getCatalog,
  getChannel,
  getPlayableTracks,
  getSeedCatalog,
  isAdultTrack,
  isChannelNsfw,
  normalizeKind,
  setLiveCatalog,
} from "@/lib/catalog";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { liveCursor, neighborTrack } from "@/lib/playback";
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
  hydrate: () => void;
  enterGate: () => void;
  tuneIn: (slug: string, opts?: { forcePlay?: boolean }) => Promise<void>;
  cueTrack: (slug: string, trackId: string) => Promise<void>;
  togglePlay: () => Promise<void>;
  next: (reason?: "user" | "ended") => Promise<void>;
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
};

let audio: HTMLAudioElement | null = null;

function getAudio() {
  if (typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio();
    audio.preload = "auto";
    audio.addEventListener("timeupdate", () => {
      usePlayerStore.setState({
        currentTime: audio?.currentTime ?? 0,
        duration: Number.isFinite(audio?.duration) ? audio!.duration : usePlayerStore.getState().duration,
      });
    });
    audio.addEventListener("ended", () => {
      void usePlayerStore.getState().next("ended");
    });
    audio.addEventListener("error", () => {
      usePlayerStore.getState().next();
    });
  }
  return audio;
}

function persist() {
  const s = usePlayerStore.getState();
  savePersisted({
    autoplay: s.autoplay,
    lastSlug: s.lastSlug,
    visited: s.visited,
    playerCollapsed: s.playerCollapsed,
    volume: s.volume,
    identityName: s.identity?.name ?? null,
  });
}

function channelOf(slug: string | null): Channel | undefined {
  if (!slug) return undefined;
  return getChannel(slug);
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

  hydrate: () => {
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
    });
    const el = getAudio();
    if (el) el.volume = p.volume;
    if (p.visited && p.lastSlug) void get().tuneIn(p.lastSlug);
    void import("@/lib/desk-api")
      .then(({ listCatalogEdits }) => listCatalogEdits())
      .then((data) => {
        get().replaceCatalog(applyCatalogEdits(getSeedCatalog(), data.tracks, data.stations));
      })
      .catch(() => {
        /* seed is enough */
      });
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
      getAudio()?.pause();
      return;
    }
    const playable = getPlayableTracks(channel);
    if (playable.length === 0) {
      set({ channelSlug: slug, track: null, status: "off-air" });
      return;
    }
    if (opts?.forcePlay) set({ autoplay: true });
    const kind = normalizeKind(channel.kind || channel.mode);
    if (kind === "live") {
      const live = liveCursor(playable, Date.now(), slug);
      const track = live?.track ?? playable[0];
      const offset = live?.offsetSec ?? 0;
      await loadTrack(slug, track, offset, get().autoplay || Boolean(opts?.forcePlay), set);
    } else {
      await loadTrack(slug, playable[0], 0, get().autoplay || Boolean(opts?.forcePlay), set);
    }
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
  },

  togglePlay: async () => {
    const el = getAudio();
    const state = get();
    if (state.status === "playing") {
      el?.pause();
      set({ status: "paused" });
      return;
    }
    if (state.track && el) {
      try {
        await el.play();
        set({ status: "playing" });
      } catch {
        set({ status: "paused" });
      }
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
    if (kind === "live" && reason === "ended") {
      const live = liveCursor(playable, Date.now(), slug);
      if (live) await loadTrack(slug, live.track, live.offsetSec, get().autoplay, set);
      return;
    }
    if (kind === "fixed" && reason === "ended") {
      const nxt = current ? neighborTrack(playable, current.id, 1) : playable[0];
      if (nxt) await loadTrack(slug, nxt, 0, true, set);
      else {
        getAudio()?.pause();
        set({ status: "paused" });
      }
      return;
    }
    if (!get().skipAllowed(slug) && reason === "user") return;
    const nxt = current ? neighborTrack(playable, current.id, 1) : playable[0];
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
    const prev = current ? neighborTrack(playable, current.id, -1) : playable[0];
    if (prev) await loadTrack(slug, prev, 0, true, set);
  },

  seek: (seconds) => {
    const el = getAudio();
    if (!el) return;
    el.currentTime = Math.max(0, seconds);
    set({ currentTime: el.currentTime });
  },

  setVolume: (volume) => {
    const el = getAudio();
    const next = Math.min(1, Math.max(0, volume));
    if (el) el.volume = next;
    set({ volume: next, muted: next === 0 });
    persist();
  },

  toggleMute: () => {
    const el = getAudio();
    const muted = !get().muted;
    if (el) el.muted = muted;
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
}));

async function loadTrack(
  slug: string,
  track: Track,
  offset: number,
  play: boolean,
  set: (partial: Partial<PlayerState>) => void,
) {
  const el = getAudio();
  set({ channelSlug: slug, track, status: "loading", currentTime: offset, duration: track.durationSec });
  if (!el) return;
  el.src = track.audioUrl;
  el.currentTime = offset;
  if (!play) {
    set({ status: "paused" });
    return;
  }
  try {
    await el.play();
    set({ status: "playing" });
  } catch {
    set({ status: "paused" });
  }
}
