const KEY = "radio.glaumules.v1";
export const GLAUMULE_EVENT = "radio:glaumules";

export function loadGlaumules(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(window.localStorage.getItem(KEY) || 0) || 0;
  } catch {
    return 0;
  }
}

export function addGlaumules(n: number): number {
  const next = loadGlaumules() + n;
  try {
    window.localStorage.setItem(KEY, String(next));
    window.dispatchEvent(new CustomEvent(GLAUMULE_EVENT, { detail: next }));
  } catch {
    /* ignore */
  }
  return next;
}
