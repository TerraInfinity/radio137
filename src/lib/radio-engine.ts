/** Single HTMLAudioElement radio deck. Never seek before metadata. Watch for end-loops. */

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
  onEnded: (measuredDuration: number) => void;
  onError: () => void;
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
    el.src = opts.url;
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
    if (duration > 0 && opts.offsetSec >= duration - pad) {
      this.loading = false;
      return { kind: "skip", leftover: Math.max(0, opts.offsetSec - duration), duration };
    }
    const target = Math.max(0, Math.min(opts.offsetSec, Math.max(0, (duration || opts.offsetSec) - pad)));
    if (target > 0.05) {
      try {
        el.currentTime = target;
      } catch {
        /* some engines reject until canplay */
      }
      await waitFor(el, "seeked", gen, 700, () => this.gen);
      if (gen !== this.gen) return { kind: "stale" };
      const got = el.currentTime || 0;
      // Browser clamped the seek — the file is shorter than the header claimed.
      if (target - got > 0.75) {
        const measured = Math.max(0.25, got);
        this.loading = false;
        return { kind: "skip", leftover: Math.max(0, opts.offsetSec - measured), duration: measured };
      }
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
      if (name === "AbortError") return { kind: "stale" };
      if (name === "NotAllowedError") {
        return { kind: "ready", duration: duration || 0, currentTime: el.currentTime || 0 };
      }
      return { kind: "error" };
    }
    if (gen !== this.gen) return { kind: "stale" };
    this.armWatchdog();
    return { kind: "ready", duration: duration || 0, currentTime: el.currentTime || 0 };
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
    });
    el.addEventListener("playing", () => {
      this.buffering = false;
      this.lastAdvanceAt = performance.now();
    });
    el.addEventListener("canplay", () => {
      this.buffering = false;
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
    if (t + 0.12 < this.highWater && this.highWater > 0.2) {
      this.finish("ended");
      return;
    }
    if (duration > 0.5 && duration - t <= endPad(duration) && t > 0.12) {
      this.finish("ended");
    }
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
    if (t + 0.12 < this.highWater && this.highWater > 0.2) {
      this.finish("ended");
      return;
    }
    if (duration > 0.5 && duration - t <= endPad(duration) && t > 0.12) {
      this.finish("ended");
      return;
    }
    const stuckFor = now - this.lastAdvanceAt;
    const hasData = el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;
    if (!this.buffering && hasData && stuckFor > 700 && this.highWater > 0.2) {
      this.finish("ended");
    }
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
    if (reason === "ended") this.handlers?.onEnded(measured);
    else this.handlers?.onError();
  }
}

export const radioEngine = new RadioEngine();
