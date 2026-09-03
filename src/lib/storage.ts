const KEY = "radio.persist.v3";

export type Persisted = {
  autoplay: boolean;
  lastSlug: string | null;
  visited: boolean;
  playerCollapsed: boolean;
  volume: number;
  identityName: string | null;
};

const defaults: Persisted = {
  autoplay: true,
  lastSlug: null,
  visited: false,
  playerCollapsed: true,
  volume: 0.85,
  identityName: null,
};

export function loadPersisted(): Persisted {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return { ...defaults, ...parsed };
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
