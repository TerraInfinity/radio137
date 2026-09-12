import type { ListenMode } from "@/lib/listen-mode";
import { parseListenMode } from "@/lib/listen-mode";

const KEY = "radio.persist.v4";
const LEGACY = "radio.persist.v3";

export type Persisted = {
  autoplay: boolean;
  lastSlug: string | null;
  lastTrackId: string | null;
  lastOffsetSec: number;
  visited: boolean;
  playerCollapsed: boolean;
  volume: number;
  identityName: string | null;
  points: number;
  glaumules: number;
  liked: string[];
  favorites: string[];
  shuffleBySlug: Record<string, boolean>;
  listenMode: ListenMode;
};

const defaults: Persisted = {
  autoplay: true,
  lastSlug: null,
  lastTrackId: null,
  lastOffsetSec: 0,
  visited: false,
  playerCollapsed: true,
  volume: 0.85,
  identityName: null,
  points: 0,
  glaumules: 0,
  liked: [],
  favorites: [],
  shuffleBySlug: {},
  listenMode: "ondemand",
};

export function loadPersisted(): Persisted {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(KEY) || window.localStorage.getItem(LEGACY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      ...defaults,
      ...parsed,
      liked: Array.isArray(parsed.liked) ? parsed.liked : [],
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      shuffleBySlug:
        parsed.shuffleBySlug && typeof parsed.shuffleBySlug === "object" ? parsed.shuffleBySlug : {},
      points: Number.isFinite(parsed.points) ? Number(parsed.points) : 0,
      glaumules: Number.isFinite(parsed.glaumules) ? Number(parsed.glaumules) : 0,
      lastTrackId: typeof parsed.lastTrackId === "string" && parsed.lastTrackId ? parsed.lastTrackId : null,
      lastOffsetSec: Number.isFinite(parsed.lastOffsetSec) ? Math.max(0, Number(parsed.lastOffsetSec)) : 0,
      listenMode: parseListenMode(parsed.listenMode) ?? "ondemand",
    };
  } catch {
    return defaults;
  }
}

export function savePersisted(value: Persisted) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}
