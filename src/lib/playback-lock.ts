export const PLAYBACK_LOCK_KEY = "radio.playback.leader";
export const PLAYBACK_CHANNEL = "radio137.playback";
export const LEADER_TTL_MS = 8000;
export const LEADER_HEARTBEAT_MS = 2500;

export type PlaybackPeer = {
  tabId: string;
  at: number;
  trackId?: string | null;
  title?: string | null;
  slug?: string | null;
};

type PlaybackMsg =
  | { kind: "claim"; peer: PlaybackPeer }
  | { kind: "release"; tabId: string; at: number }
  | { kind: "probe"; tabId: string; at: number }
  | { kind: "here"; peer: PlaybackPeer };

export function parseLeader(raw: string | null | undefined): PlaybackPeer | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PlaybackPeer>;
    if (!parsed || typeof parsed.tabId !== "string" || !parsed.tabId) return null;
    if (!Number.isFinite(Number(parsed.at))) return null;
    return {
      tabId: parsed.tabId,
      at: Number(parsed.at),
      trackId: typeof parsed.trackId === "string" ? parsed.trackId : null,
      title: typeof parsed.title === "string" ? parsed.title : null,
      slug: typeof parsed.slug === "string" ? parsed.slug : null,
    };
  } catch {
    return null;
  }
}

export function leaderIsOther(peer: PlaybackPeer | null | undefined, selfId: string, now: number, ttl = LEADER_TTL_MS): boolean {
  if (!peer || peer.tabId === selfId) return false;
  return now - peer.at < ttl;
}

export function thisTabOwnsClock(isLeader: boolean, heldElsewhere: boolean): boolean {
  return isLeader || !heldElsewhere;
}

function makeTabId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

type Handlers = {
  onYield: (peer: PlaybackPeer) => void;
  onReleased: (fromTabId: string) => void;
};

class PlaybackLock {
  readonly tabId = typeof window === "undefined" ? "ssr" : makeTabId();
  private channel: BroadcastChannel | null = null;
  private beat: number | null = null;
  private leading = false;
  private meta: Omit<PlaybackPeer, "tabId" | "at"> = {};
  private handlers: Handlers | null = null;
  private started = false;

  start(handlers: Handlers) {
    if (this.started || typeof window === "undefined") return;
    this.started = true;
    this.handlers = handlers;
    try {
      this.channel = new BroadcastChannel(PLAYBACK_CHANNEL);
      this.channel.addEventListener("message", (event) => this.onMessage(event.data as PlaybackMsg));
    } catch {
      this.channel = null;
    }
    window.addEventListener("storage", this.onStorage);
    window.addEventListener("pagehide", this.onPageHide);
    window.addEventListener("beforeunload", this.onPageHide);
    const other = this.otherLeader();
    if (other) handlers.onYield(other);
  }

  isLeader() {
    return this.leading;
  }

  otherLeader(now = Date.now()): PlaybackPeer | null {
    if (typeof window === "undefined") return null;
    const peer = parseLeader(window.localStorage.getItem(PLAYBACK_LOCK_KEY));
    return leaderIsOther(peer, this.tabId, now) ? peer : null;
  }

  claim(meta: Omit<PlaybackPeer, "tabId" | "at"> = {}) {
    if (typeof window === "undefined") return;
    this.meta = meta;
    this.leading = true;
    const peer = this.peer();
    this.write(peer);
    this.post({ kind: "claim", peer });
    this.pulse();
  }

  release() {
    if (!this.leading) return;
    this.leading = false;
    this.stopPulse();
    if (typeof window !== "undefined") {
      const current = parseLeader(window.localStorage.getItem(PLAYBACK_LOCK_KEY));
      if (current?.tabId === this.tabId) window.localStorage.removeItem(PLAYBACK_LOCK_KEY);
    }
    this.post({ kind: "release", tabId: this.tabId, at: Date.now() });
  }

  async probe(ms = 90): Promise<PlaybackPeer | null> {
    const stored = this.otherLeader();
    if (stored) return stored;
    if (!this.channel) return null;
    this.post({ kind: "probe", tabId: this.tabId, at: Date.now() });
    return new Promise((resolve) => {
      const finish = (peer: PlaybackPeer | null) => {
        window.clearTimeout(timer);
        this.channel?.removeEventListener("message", onMsg);
        resolve(peer);
      };
      const onMsg = (event: MessageEvent<PlaybackMsg>) => {
        const msg = event.data;
        if (msg?.kind === "here" && leaderIsOther(msg.peer, this.tabId, Date.now())) finish(msg.peer);
        if (msg?.kind === "claim" && leaderIsOther(msg.peer, this.tabId, Date.now())) finish(msg.peer);
      };
      const timer = window.setTimeout(() => finish(this.otherLeader()), ms);
      this.channel?.addEventListener("message", onMsg);
    });
  }

  private peer(): PlaybackPeer {
    return { tabId: this.tabId, at: Date.now(), ...this.meta };
  }

  private write(peer: PlaybackPeer) {
    try {
      window.localStorage.setItem(PLAYBACK_LOCK_KEY, JSON.stringify(peer));
    } catch {
      /* ignore quota */
    }
  }

  private post(msg: PlaybackMsg) {
    try {
      this.channel?.postMessage(msg);
    } catch {
      /* closed */
    }
  }

  private pulse() {
    this.stopPulse();
    this.beat = window.setInterval(() => {
      if (!this.leading) return;
      const peer = this.peer();
      this.write(peer);
    }, LEADER_HEARTBEAT_MS);
  }

  private stopPulse() {
    if (this.beat != null) window.clearInterval(this.beat);
    this.beat = null;
  }

  private onMessage = (msg: PlaybackMsg) => {
    if (!msg || typeof msg !== "object") return;
    if (msg.kind === "claim" && leaderIsOther(msg.peer, this.tabId, Date.now())) {
      this.leading = false;
      this.stopPulse();
      this.handlers?.onYield(msg.peer);
      return;
    }
    if (msg.kind === "release" && msg.tabId !== this.tabId) {
      this.handlers?.onReleased(msg.tabId);
      return;
    }
    if (msg.kind === "probe" && this.leading && msg.tabId !== this.tabId) {
      this.post({ kind: "here", peer: this.peer() });
    }
  };

  private onStorage = (event: StorageEvent) => {
    if (event.key !== PLAYBACK_LOCK_KEY) return;
    const peer = parseLeader(event.newValue);
    if (leaderIsOther(peer, this.tabId, Date.now())) {
      this.leading = false;
      this.stopPulse();
      this.handlers?.onYield(peer!);
      return;
    }
    if (!peer && event.oldValue) {
      const old = parseLeader(event.oldValue);
      if (old && old.tabId !== this.tabId) this.handlers?.onReleased(old.tabId);
    }
  };

  private onPageHide = (event: Event) => {
    if ("persisted" in event && Boolean((event as PageTransitionEvent).persisted)) return;
    if (this.leading) this.release();
  };
}

export const playbackLock = new PlaybackLock();
