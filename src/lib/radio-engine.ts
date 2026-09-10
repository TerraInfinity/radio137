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
  if (!Number.isFinite(duration) || duration <= 0) return 0.08;
  // Short stings are the whole file — do not reserve a half-second tail.
  if (duration < 3) return Math.min(0.05, duration * 0.03);
  if (duration < 8) return 0.1;
  if (duration < 20) return 0.25;
  return Math.min(0.7, Math.max(0.25, duration * 0.006));
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
  private hangTimer: number | null = null;
  private startedAt = 0;

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
    this.startedAt = performance.now() - el.currentTime * 1000;
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
    this.clearHang();
    this.ending = false;
    this.loading = true;
    this.buffering = false;
    this.highWater = 0;
    this.lastAdvanceAt = performance.now();
    this.startedAt = performance.now();
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
    const duration = Number.isFinite(el.duration) && el.duration > 0.05 ? el.duration : 0;
    const pad = endPad(duration || opts.offsetSec);
    let joinOffset = Math.max(0, opts.offsetSec);
    // Tiny leftovers and the first slice of a sting must not skip the attack.
    if (joinOffset <= 0.12) joinOffset = 0;
    if (duration > 0 && duration < 10 && joinOffset < Math.max(0.2, duration * 0.12)) joinOffset = 0;
    if (joinOffset > 0.2 && duration > 0 && joinOffset >= duration - pad) {
      this.loading = false;
      return { kind: "skip", leftover: Math.max(0, joinOffset - duration), duration };
    }
    const target = joinOffset;
    if (target > 0) {
      const parked = await this.park(el, gen, target, duration);
      if (parked === "stale") {
        this.loading = false;
        return { kind: "stale" };
      }
      if (parked.kind === "skip") {
        this.loading = false;
        return parked;
      }
    } else {
      // Never assign currentTime = 0 — a seek-to-zero on a short MP3 drops the first frames.
      const primed = duration > 0 && duration < 8 ? "canplaythrough" : "canplay";
      await waitFor(el, primed, gen, 3500, () => this.gen);
      if (gen !== this.gen) return { kind: "stale" };
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
    this.armWatchdog();
    this.startedAt = performance.now();
    return { kind: "ready", duration: duration || 0, currentTime: el.currentTime || 0 };
  }

  private async park(
    el: HTMLAudioElement,
    gen: number,
    target: number,
    duration: number,
  ): Promise<"stale" | { kind: "ok" } | { kind: "skip"; leftover: number; duration: number }> {
    if (target <= 0.02) return { kind: "ok" };
    try {
      el.currentTime = target;
    } catch {
      /* some engines reject until canplay */
    }
    await waitFor(el, "seeked", gen, 800, () => this.gen);
    if (gen !== this.gen) return "stale";
    const got = el.currentTime || 0;
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

  /** End-of-file only. Short stings must play all the way out — native `ended` is the truth. */
  private shouldFinish(t: number, duration: number): boolean {
    if (!Number.isFinite(duration) || duration <= 0) return false;
    const remaining = duration - t;
    const heard = Math.max(t, this.highWater);
    const pad = endPad(duration);
    const stuckFor = performance.now() - this.lastAdvanceAt;
    const playedFor = performance.now() - this.startedAt;

    // Time jumped back to the start after we had already heard the cut — last-granule loop.
    if (t + 0.3 < this.highWater && t < 0.15 && heard >= duration * 0.7) return true;

    // Wall-clock safety for short files: wait the full length plus a breath, then advance.
    if (duration < 8 && !this.buffering && this.startedAt > 0) {
      if (playedFor >= duration * 1000 + 900 && (remaining <= 0.2 || heard >= duration * 0.9)) return true;
      if (playedFor >= duration * 1000 + 1600) return true;
    }

    if (this.buffering) return false;

    // Stuck on the last granule (no native ended). Require being actually at the tail.
    const atTail =
      remaining <= Math.max(pad, duration < 6 ? 0.08 : 0.12) && heard >= duration - Math.max(pad, duration < 6 ? 0.1 : 0.18);
    if (atTail && stuckFor > (duration < 6 ? 400 : 900)) return true;

    return false;
  }

  private clearHang() {
    if (this.hangTimer != null) {
      window.clearTimeout(this.hangTimer);
      this.hangTimer = null;
    }
  }

  private finish(reason: "ended" | "error") {
    if (this.ending || this.loading) return;
    this.ending = true;
    this.disarmWatchdog();
    this.clearHang();
    const el = this.el;
    try {
      el?.pause();
    } catch {
      /* stop the last-granule loop immediately */
    }
    const measured = Math.max(this.highWater, el?.currentTime || 0);
    const fileDuration = el && Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 0;
    const fire = () => {
      this.hangTimer = null;
      if (reason === "ended") this.handlers?.onEnded(measured, fileDuration);
      else this.handlers?.onError();
    };
    // A short breath so a 1–2s sting is heard in full before the next src swap.
    const hang = reason === "ended" ? (fileDuration > 0 && fileDuration < 8 ? 280 : 80) : 0;
    if (hang > 0) this.hangTimer = window.setTimeout(fire, hang);
    else fire();
  }
}

export const radioEngine = new RadioEngine();
