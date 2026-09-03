const KEY = "radio.persist.v2";

export type Persisted = {
  autoplay: boolean;
  lastSlug: string | null;
  visited: boolean;
  playerCollapsed: boolean;
  volume: number;
  identityName: string | null;
};

const empty: Persisted = {
  autoplay: true,
  lastSlug: null,
  visited: false,
  playerCollapsed: true,
  volume: 0.85,
  identityName: null,
};

export function loadPersisted(): Persisted {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...(JSON.parse(raw) as Partial<Persisted>) };
  } catch {
    return empty;
  }
}

export function savePersisted(next: Persisted) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
