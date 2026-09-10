/** Single HTMLAudioElement radio deck. Never seek before metadata. Watch for end-loops. */
import { mediaUrl } from "@/lib/media";

export type EngineLoad = {
  url: string;
  offsetSec: number;
  play: boolean;
  volume: number;
  muted: boolean;
};

export type EngineResult =
  | { kind: "ready"; duration: number; currentTime: number }
  | { kind: "skip"; leftover: number; duration: number }
  | { kind: "error" }
  | { kind: "stale" };

type Handlers = {
  onTime: (currentTime: number, duration: number) => void;
  onEnded: (measuredDuration: number, fileDuration: number) => void;
  onError: () => void;
  onPause?: () => void;
  onPlay?: () => void;
  onBuffering?: (value: boolean) => void;
};

export function endPad(duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0.35;
  if (duration < 4) return Math.min(0.28, duration * 0.1);
  if (duration < 15) return 0.4;
  return Math.min(1, Math.max(0.35, duration * 0.008));
}

function waitFor(el: HTMLAudioElement, event: string, gen: number, ms: number, currentGen: () => number): Promise<"ok" | "error" | "timeout" | "stale"> {
  return new Promise((resolve) => {
    const finish = (result: "ok" | "error" | "timeout" | "stale") => {
      el.removeEventListener(event, onOk);
      el.removeEventListener("error", onErr);
      clearTimeout(timer);
      resolve(result);
    };
    const onOk = () => finish(gen === currentGen() ? "ok" : "stale");
    const onErr = () => finish(gen === currentGen() ? "error" : "stale");
    const timer = window.setTimeout(() => finish(gen === currentGen() ? "timeout" : "stale"), ms);
    el.addEventListener(event, onOk, { once: true });
    el.addEventListener("error", onErr, { once: true });
  });
}

export class RadioEngine {
  private el: HTMLAudioElement | null = null;
  private gen = 0;
  private ending = false;
  private loading = false;
  private buffering = false;
  private highWater = 0;
  private lastAdvanceAt = 0;
  private watchdog: number | null = null;
  private handlers: Handlers | null = null;
  private warmer: HTMLAudioElement | null = null;
  private warmUrl = "";

  attach(handlers: Handlers) {
    this.handlers = handlers;
    this.ensure();
  }

  generation() {
    return this.gen;
  }

  snapshot() {
    const el = this.el;
    return {
      gen: this.gen,
      ending: this.ending,
      loading: this.loading,
      buffering: this.buffering,
      highWater: this.highWater,
      currentTime: el?.currentTime ?? 0,
      duration: el && Number.isFinite(el.duration) ? el.duration : 0,
      paused: el?.paused ?? true,
      src: el?.currentSrc || el?.src || "",
      readyState: el?.readyState ?? 0,
    };
  }

  pause() {
    try {
      this.el?.pause();
    } catch {
      /* ignore */
    }
  }

  async resume(): Promise<boolean> {
    const el = this.ensure();
    if (!el?.src) return false;
    try {
      await el.play();
      this.armWatchdog();
      return true;
    } catch {
      return false;
    }
  }

  seek(seconds: number) {
    const el = this.el;
    if (!el || !Number.isFinite(el.duration) || el.duration <= 0) return;
    const max = Math.max(0, el.duration - endPad(el.duration));
    el.currentTime = Math.min(max, Math.max(0, seconds));
    this.highWater = el.currentTime;
    this.lastAdvanceAt = performance.now();
    this.handlers?.onTime(el.currentTime, el.duration);
  }

  setGain(volume: number, muted: boolean) {
    const el = this.ensure();
    if (!el) return;
    el.volume = muted ? 0 : volume;
    el.muted = muted;
  }

  /** Decode the next cut in the background so the handoff starts at 0:00, not mid-file. */
  warm(url: string) {
    const src = mediaUrl(url);
    if (typeof window === "undefined" || !src || src === this.warmUrl) return;
    this.warmUrl = src;
    if (!this.warmer) {
      this.warmer = new Audio();
      this.warmer.preload = "auto";
      this.warmer.muted = true;
      this.warmer.volume = 0;
      this.warmer.setAttribute("playsinline", "true");
      try {
        (this.warmer as HTMLAudioElement & { disableRemotePlayback?: boolean }).disableRemotePlayback = true;
      } catch {
        /* ignore */
      }
    }
    try {
      this.warmer.src = src;
      this.warmer.load();
    } catch {
      /* ignore */
    }
  }

  async load(opts: EngineLoad): Promise<EngineResult> {
    const el = this.ensure();
    if (!el) return { kind: "stale" };
    const gen = ++this.gen;
    this.ending = false;
    this.loading = true;
    this.buffering = false;
    this.highWater = 0;
    this.lastAdvanceAt = performance.now();
    this.disarmWatchdog();
    try {
      el.pause();
    } catch {
      /* ignore */
    }
    el.loop = false;
    el.autoplay = false;
    el.preload = "auto";
    el.removeAttribute("src");
    try {
      el.load();
    } catch {
      /* ignore */
    }
    el.src = mediaUrl(opts.url);
    el.load();
    this.setGain(opts.volume, opts.muted);
    const ready = await waitFor(el, "loadedmetadata", gen, 10_000, () => this.gen);
    if (gen !== this.gen) return { kind: "stale" };
    if (ready === "error") {
      this.loading = false;
      return { kind: "error" };
    }
    const duration = Number.isFinite(el.duration) && el.duration > 0.2 ? el.duration : 0;
    const pad = endPad(duration || opts.offsetSec);
    const joinOffset = Math.max(0, opts.offsetSec);
    // Never skip a fresh start (offset 0) — leftover from the previous file must not eat this one.
    if (joinOffset > 0.2 && duration > 0 && joinOffset >= duration - pad) {
      this.loading = false;
      return { kind: "skip", leftover: Math.max(0, joinOffset - duration), duration };
    }
    const target = joinOffset <= 0.05 ? 0 : Math.max(0, Math.min(joinOffset, Math.max(0, (duration || joinOffset) - pad)));
    const parked = await this.park(el, gen, target, duration);
    if (parked === "stale") {
      this.loading = false;
      return { kind: "stale" };
    }
    if (parked.kind === "skip") {
      this.loading = false;
      return parked;
    }
    this.highWater = el.currentTime || 0;
    this.lastAdvanceAt = performance.now();
    this.handlers?.onTime(el.currentTime || 0, duration || el.duration || 0);
    this.loading = false;
    if (!opts.play) {
      return { kind: "ready", duration: duration || opts.offsetSec, currentTime: el.currentTime || 0 };
    }
    try {
      await el.play();
    } catch (error) {
      if (gen !== this.gen) return { kind: "stale" };
      const name = error instanceof DOMException ? error.name : "";
      if (name === "AbortError") {
        try {
          if (gen !== this.gen) return { kind: "stale" };
          await el.play();
        } catch (retry) {
          if (gen !== this.gen) return { kind: "stale" };
          const retryName = retry instanceof DOMException ? retry.name : "";
          if (retryName === "AbortError") return { kind: "stale" };
          if (retryName === "NotAllowedError") {
            return { kind: "ready", duration: duration || 0, currentTime: el.currentTime || 0 };
          }
          return { kind: "error" };
        }
      } else if (name === "NotAllowedError") {
        return { kind: "ready", duration: duration || 0, currentTime: el.currentTime || 0 };
      } else {
        return { kind: "error" };
      }
    }
    if (gen !== this.gen) return { kind: "stale" };
    // Last guard: a late seek from the previous file must not leave us mid-cut.
    if (target <= 0.05 && (el.currentTime || 0) > 0.4) {
      try {
        el.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
    this.armWatchdog();
    return { kind: "ready", duration: duration || 0, currentTime: el.currentTime || 0 };
  }

  private async park(
    el: HTMLAudioElement,
    gen: number,
    target: number,
    duration: number,
  ): Promise<"stale" | { kind: "ok" } | { kind: "skip"; leftover: number; duration: number }> {
    try {
      el.currentTime = target;
    } catch {
      /* some engines reject until canplay */
    }
    await waitFor(el, "seeked", gen, 800, () => this.gen);
    if (gen !== this.gen) return "stale";
    const got = el.currentTime || 0;
    if (target <= 0.05 && got > 0.35) {
      try {
        el.currentTime = 0;
      } catch {
        /* ignore */
      }
      await waitFor(el, "seeked", gen, 500, () => this.gen);
      if (gen !== this.gen) return "stale";
    }
    if (target > 0.05 && target - got > 0.75) {
      const measured = Math.max(0.25, got);
      return { kind: "skip", leftover: Math.max(0, target - measured), duration: measured || duration };
    }
    return { kind: "ok" };
  }

  private ensure(): HTMLAudioElement | null {
    if (typeof window === "undefined") return null;
    if (this.el) return this.el;
    const el = new Audio();
    el.preload = "auto";
    el.loop = false;
    el.setAttribute("playsinline", "true");
    el.addEventListener("timeupdate", () => this.onTimeupdate());
    el.addEventListener("ended", () => {
      if (this.loading) return;
      this.finish("ended");
    });
    el.addEventListener("error", () => {
      if (this.ending || this.loading) return;
      this.handlers?.onError();
    });
    el.addEventListener("waiting", () => {
      this.buffering = true;
      this.handlers?.onBuffering?.(true);
    });
    el.addEventListener("playing", () => {
      this.buffering = false;
      this.lastAdvanceAt = performance.now();
      this.handlers?.onBuffering?.(false);
      this.handlers?.onPlay?.();
    });
    el.addEventListener("canplay", () => {
      this.buffering = false;
      this.handlers?.onBuffering?.(false);
    });
    el.addEventListener("pause", () => {
      if (this.ending || this.loading) return;
      this.handlers?.onPause?.();
    });
    this.el = el;
    if (!(window as unknown as { __radioEngine?: unknown }).__radioEngine) {
      Object.defineProperty(window, "__radioEngine", {
        configurable: true,
        get: () => this.snapshot(),
      });
    }
    return el;
  }

  private onTimeupdate() {
    const el = this.el;
    if (!el || this.ending || this.loading) return;
    const duration = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 0;
    const t = el.currentTime || 0;
    this.handlers?.onTime(t, duration);
    if (el.paused) return;
    if (t > this.highWater + 0.02) {
      this.highWater = t;
      this.lastAdvanceAt = performance.now();
    }
    if (this.shouldFinish(t, duration)) this.finish("ended");
  }

  private armWatchdog() {
    this.disarmWatchdog();
    const gen = this.gen;
    this.watchdog = window.setInterval(() => this.tick(gen), 220);
  }

  private disarmWatchdog() {
    if (this.watchdog != null) {
      window.clearInterval(this.watchdog);
      this.watchdog = null;
    }
  }

  private tick(gen: number) {
    if (gen !== this.gen || this.ending || this.loading) return;
    const el = this.el;
    if (!el || el.paused) return;
    const t = el.currentTime || 0;
    const duration = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 0;
    const now = performance.now();
    if (t > this.highWater + 0.02) {
      this.highWater = t;
      this.lastAdvanceAt = now;
    }
    if (this.shouldFinish(t, duration)) this.finish("ended");
  }

  /** End-of-file only. A mid-song stall or timeupdate jitter must not kill the cut. */
  private shouldFinish(t: number, duration: number): boolean {
    const pad = endPad(duration);
    const remaining = duration > 0 ? duration - t : Number.POSITIVE_INFINITY;
    const nearEnd = duration > 0.5 && remaining <= Math.max(pad, 0.5) && t > 0.12;
    if (nearEnd) return true;
    if (t + 0.25 < this.highWater && this.highWater > 0.4) {
      const looped = t < 0.2;
      const clampedAtEnd = remaining < 1.75 || this.highWater >= duration - 0.6;
      return looped || clampedAtEnd;
    }
    if (this.buffering) return false;
    const el = this.el;
    if (!el) return false;
    const stuckFor = performance.now() - this.lastAdvanceAt;
    const hasData = el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;
    return Boolean(hasData && stuckFor > 700 && this.highWater > 0.15 && remaining <= Math.max(pad * 3, 1.4));
  }

  private finish(reason: "ended" | "error") {
    if (this.ending || this.loading) return;
    this.ending = true;
    this.disarmWatchdog();
    const el = this.el;
    try {
      el?.pause();
    } catch {
      /* stop the last-granule loop immediately */
    }
    const measured = Math.max(this.highWater, el?.currentTime || 0);
    const fileDuration = el && Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 0;
    if (reason === "ended") this.handlers?.onEnded(measured, fileDuration);
    else this.handlers?.onError();
  }
}

export const radioEngine = new RadioEngine();
