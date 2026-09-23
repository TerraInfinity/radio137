import type { Track } from "./types.ts";

export type MediaHead = {
  readyState: number;
  duration: number;
  buffered: { length: number; end: (index: number) => number };
};

export type GateLane = {
  id: string;
  label: string;
  /** 0–1, from a real load event. Never invent a finished bar. */
  progress: number;
};

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** Equal-weight mean. One stalled lane holds the preview back. */
export function mergeLaneProgress(lanes: GateLane[]): number {
  if (lanes.length === 0) return 0;
  const sum = lanes.reduce((total, lane) => total + clamp01(lane.progress), 0);
  return sum / lanes.length;
}

/**
 * How much of a media element is safe to start.
 * The preview only needs the opening, not the whole file.
 */
export function bufferHead(el: MediaHead): number {
  if (el.readyState >= 3) return 1;
  const duration = el.duration;
  if (Number.isFinite(duration) && duration > 0 && el.buffered.length > 0) {
    const end = el.buffered.end(el.buffered.length - 1);
    const need = Math.min(duration, 8);
    return clamp01(end / need) * 0.92;
  }
  if (el.readyState >= 1) return 0.28;
  return 0;
}

export const ROSE_OPENING_PLATES = [
  "/experiences/rose/vortex-tunnel.jpg?v=5",
  "/experiences/rose/white-rose.png",
  "/experiences/rose/tardis-chase.png",
] as const;

/** How soon a skipped song may show a cue. Faster flips cancel this and never wait. */
export const CUE_SETTLE_MS = 320;

export function cueProgress(audio: number, plates: number): number {
  return (clamp01(audio) + clamp01(plates)) / 2;
}

const plateCache = new Map<string, HTMLImageElement>();

/** 1 when every picture is decoded. A broken file does not hold the song. */
export function plateProgress(urls: string[]): number {
  if (urls.length === 0) return 1;
  if (typeof Image === "undefined") return 1;
  let ready = 0;
  for (const src of urls) {
    let img = plateCache.get(src);
    if (!img) {
      img = new Image();
      img.decoding = "async";
      img.src = src;
      plateCache.set(src, img);
    }
    if (img.complete) ready += 1;
  }
  return ready / urls.length;
}

export function songAudioProgress(opts: {
  audioUrl: string | null;
  status: string;
  src: string;
  readyState: number;
  duration: number;
  buffered: MediaHead["buffered"];
  loading: boolean;
}): number {
  if (!opts.audioUrl || opts.status === "missing") return 1;
  const named = opts.audioUrl.split("/").pop() || opts.audioUrl;
  const onDeck = opts.src.includes(named) || opts.src.includes(encodeURIComponent(named));
  if (!onDeck) return opts.loading || opts.status === "loading" ? 0.12 : 0.45;
  return bufferHead(opts);
}

const ROSE_SCENE_PLATES: Record<string, string[]> = {
  vortex: ["/experiences/rose/vortex-tunnel.jpg?v=5", "/experiences/rose/tardis-chase.png"],
  arrival: ["/experiences/rose/allocate-fairy.jpg", "/experiences/rose/vortex-tunnel.jpg?v=5"],
  prom: ["/experiences/rose/prom-dance.jpg", "/experiences/rose/prom-gym.jpg"],
  twist: ["/experiences/rose/twist-cubicle.jpg", "/experiences/rose/twist-hall.jpg"],
  remember: ["/experiences/rose/remember-wide.jpg?v=1", "/experiences/rose/remember-doors.jpg?v=1"],
  vow: ["/experiences/rose/eyes.jpg", "/experiences/rose/remember-doors.jpg?v=1"],
  firewall: ["/experiences/rose/firewall-rose.jpg", "/experiences/rose/firewall-river.jpg"],
  allocate: ["/experiences/rose/allocate-queen.jpg", "/experiences/rose/allocate-cleo.jpg"],
  wolf: ["/experiences/rose/wolf-eyes.jpg", "/experiences/rose/wolf-rose.jpg"],
  current: ["/experiences/rose/current-queen.jpg", "/experiences/rose/current-room.jpg"],
  sweetie: ["/experiences/rose/sweetie-operator.jpg", "/experiences/rose/sweetie-tardis.jpg"],
  halo: ["/experiences/rose/halo-queen.jpg", "/experiences/rose/halo-ring.jpg"],
  choir: ["/experiences/rose/choir-god.jpg", "/experiences/rose/choir-sun.jpg"],
  badend: ["/experiences/rose/badend-queen.jpg", "/experiences/rose/badend-sun.jpg"],
  recall: ["/experiences/rose/recall-rose.jpg", "/experiences/rose/recall-temple.jpg"],
  obay: ["/experiences/rose/obay-brat.jpg", "/experiences/rose/obay-pirate.jpg"],
  copter: ["/experiences/rose/copter-lady.jpg", "/experiences/rose/copter-captain.jpg"],
  stillhot: ["/experiences/rose/stillhot-land.jpg", "/experiences/rose/stillhot-tea.jpg"],
  manual: ["/experiences/rose/allocate-glyphs.jpg", "/experiences/rose/allocate-cleo.jpg", "/experiences/rose/white-rose.png"],
  shiny: ["/experiences/rose/timewar.jpg", "/experiences/rose/eyes.jpg"],
  timeshare: ["/experiences/rose/allocate-copter.jpg", "/experiences/rose/remember-shrimp.jpg?v=1"],
  elevate: ["/experiences/rose/rose-bloom.jpg", "/experiences/rose/white-rose.png"],
  shell: ["/experiences/rose/sweetie-cat.jpg", "/experiences/rose/white-rose.png"],
};

/** Pictures this song's scene needs before the audio should be alone on stage. */
export function scenePlates(slug: string, phenomenon: string): string[] {
  if (slug !== "rose") return [];
  return ROSE_SCENE_PLATES[phenomenon] ?? [];
}
/** The next cuts in playlist order. Stops instead of circling back onto the song that is playing. */
export function upcomingFrom(tracks: Track[], currentId: string | null | undefined, count = 2): Track[] {
  const ahead: Track[] = [];
  const seen = new Set<string>();
  if (currentId) seen.add(currentId);
  const start = currentId ? tracks.findIndex((track) => track.id === currentId) : -1;
  if (tracks.length === 0) return ahead;
  for (let n = 1; n <= tracks.length && ahead.length < count; n++) {
    const track = tracks[(Math.max(start, 0) + (start < 0 ? n - 1 : n)) % tracks.length];
    if (!track || seen.has(track.id)) break;
    seen.add(track.id);
    ahead.push(track);
  }
  return ahead;
}

const filmCache = new Map<string, HTMLVideoElement>();

/** Decode the next scene's pictures, and its film only when one is coming. */
export function warmAhead(urls: string[]) {
  const pictures: string[] = [];
  const films: string[] = [];
  for (const src of urls) {
    if (!src) continue;
    if (/\.(mp4|webm|mov)(\?|$)/i.test(src)) films.push(src);
    else pictures.push(src);
  }
  plateProgress([...new Set(pictures)]);
  if (typeof document === "undefined") return;
  for (const src of films) {
    if (filmCache.has(src)) continue;
    const video = document.createElement("video");
    video.muted = true;
    video.preload = "auto";
    video.playsInline = true;
    video.src = src;
    try {
      video.load();
    } catch {
      /* a film that cannot warm must not block the song */
    }
    filmCache.set(src, video);
  }
}

/** Pictures the opening look paints first. Later experiences pass their own list. */
export function openingPlates(slug: string, cover: string, stills: string[]): string[] {
  if (slug === "rose") return [...ROSE_OPENING_PLATES];
  const next = [cover, ...stills].map((src) => src.trim()).filter(Boolean);
  return [...new Set(next)].slice(0, 3);
}
