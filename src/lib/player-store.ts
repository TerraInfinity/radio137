import { create } from "zustand";
import { getCatalog, getChannel, getPlayableTracks, getSeedCatalog, isAdultTrack, isChannelNsfw, setLiveCatalog } from "@/lib/catalog";
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
let loadGen = 0;

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
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("is-dj", false);
    }
    if (p.visited && p.lastSlug) {
      void get().tuneIn(p.lastSlug);
    }
    void Promise.all([import("@/lib/desk-api"), import("@/lib/catalog-edits")])
      .then(([{ listCatalogEdits }, { applyCatalogEdits }]) =>
        listCatalogEdits().then((edits) => {
          if (!edits.length) return;
          get().replaceCatalog(applyCatalogEdits(getSeedCatalog(), edits));
        }),
      )
      .catch(() => {
        /* catalog seed is enough */
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
    const live = channel.kind === "live" ? liveCursor(playable, Date.now(), slug) : null;
    const track = live?.track ?? playable[0];
    const offset = live?.offsetSec ?? 0;
    await loadTrack(slug, track, offset, get().autoplay || Boolean(opts?.forcePlay), set, get);
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
    await loadTrack(slug, track, 0, true, set, get);
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

  next: async (reason = "user") => {
    const state = get();
    const channel = channelOf(state.channelSlug);
    if (!channel) return;
    if (reason === "user" && !state.skipAllowed(channel.slug)) return;
    const playable = getPlayableTracks(channel);
    const nextTrack = neighborTrack(playable, state.track?.id ?? null, 1);
    if (!nextTrack) return;
    await loadTrack(channel.slug, nextTrack, 0, true, set, get);
  },

  prev: async () => {
    const state = get();
    const channel = channelOf(state.channelSlug);
    if (!channel || !state.skipAllowed(channel.slug)) return;
    if (state.currentTime > 3) {
      const el = getAudio();
      if (el) el.currentTime = 0;
      set({ currentTime: 0 });
      return;
    }
    const playable = getPlayableTracks(channel);
    const prevTrack = neighborTrack(playable, state.track?.id ?? null, -1);
    if (!prevTrack) return;
    await loadTrack(channel.slug, prevTrack, 0, true, set, get);
  },

  seek: (seconds) => {
    const el = getAudio();
    if (!el) return;
    const slug = get().channelSlug;
    if (slug && !get().skipAllowed(slug)) return;
    el.currentTime = seconds;
    set({ currentTime: seconds });
  },

  setVolume: (volume) => {
    const next = Math.min(1, Math.max(0, volume));
    const el = getAudio();
    if (el) el.volume = get().muted ? 0 : next;
    set({ volume: next });
    persist();
  },

  toggleMute: () => {
    const muted = !get().muted;
    const el = getAudio();
    if (el) el.volume = muted ? 0 : get().volume;
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
    const trimmed = name.trim().slice(0, 32);
    if (!trimmed) return;
    set({ identity: { id: `guest:${trimmed.toLowerCase()}`, name: trimmed } });
    persist();
  },

  claimChannel: (slug, minutes) => {
    const identity = get().identity;
    if (!identity) return;
    const channel = channelOf(slug);
    if (!channel?.claimable) return;
    const taken = Object.entries(get().claims).find(([, claim]) => claim.claimantId && (claim.expiresAt ?? 0) > Date.now());
    if (taken && taken[0] !== slug && taken[1].claimantId !== identity.id) {
      /* one claim at a time — release previous owned */
    }
    const claims = { ...get().claims };
    for (const [key, claim] of Object.entries(claims)) {
      if (claim.claimantId === identity.id) claims[key] = { claimantId: null, claimantName: null, claimedAt: null, expiresAt: null };
    }
    claims[slug] = {
      claimantId: identity.id,
      claimantName: identity.name,
      claimedAt: Date.now(),
      expiresAt: Date.now() + minutes * 60_000,
    };
    set({ claims, autoplay: true });
    if (typeof document !== "undefined") document.documentElement.classList.add("is-dj");
    persist();
  },

  releaseClaim: (slug) => {
    const claims = { ...get().claims, [slug]: { claimantId: null, claimantName: null, claimedAt: null, expiresAt: null } };
    set({ claims });
    if (typeof document !== "undefined") document.documentElement.classList.remove("is-dj");
  },

  skipAllowed: (slug) => {
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
  get: () => PlayerState,
) {
  const gen = ++loadGen;
  const channel = channelOf(slug);
  if (isAdultTrack(track) && (!channel || !isChannelNsfw(channel))) {
    set({ track: null, status: "off-air", channelSlug: slug });
    return;
  }
  set({
    channelSlug: slug,
    track,
    status: "loading",
    currentTime: offset,
    duration: track.durationSec,
  });
  const el = getAudio();
  if (!el) return;
  el.src = track.audioUrl;
  el.volume = get().muted ? 0 : get().volume;
  try {
    el.currentTime = offset;
    if (play) await el.play();
    if (gen !== loadGen) return;
    set({
      status: play && !el.paused ? "playing" : "paused",
      duration: Number.isFinite(el.duration) && el.duration > 0 ? el.duration : track.durationSec,
    });
  } catch {
    if (gen !== loadGen) return;
    set({ status: play ? "paused" : "paused" });
  }
}
