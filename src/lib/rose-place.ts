const KEY = "radio.rose.place.v1";

export type RosePlace = {
  trackId: string;
  offset: number;
  roseRite: boolean;
};

let leftThisDocument = false;
let unloading = false;
let claimed = false;

/** A refresh may resume. A later visit in the same tab, or any other arrival, may not. */
export function roseResumeAllowed(navType: string | undefined, left: boolean): boolean {
  if (left) return false;
  return navType === "reload";
}

function navType(): string | undefined {
  if (typeof performance === "undefined") return undefined;
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  return nav?.type;
}

export function saveRosePlace(place: RosePlace) {
  if (typeof window === "undefined" || !place.trackId) return;
  try {
    window.sessionStorage.setItem(
      KEY,
      JSON.stringify({
        trackId: place.trackId,
        offset: Math.max(0, place.offset || 0),
        roseRite: place.roseRite === true,
      }),
    );
  } catch {
    /* ignore */
  }
}

export function clearRosePlace() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function readRosePlace(): RosePlace | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RosePlace>;
    if (typeof parsed.trackId !== "string" || !parsed.trackId) return null;
    return {
      trackId: parsed.trackId,
      offset: Number.isFinite(parsed.offset) ? Math.max(0, Number(parsed.offset)) : 0,
      roseRite: parsed.roseRite === true,
    };
  } catch {
    return null;
  }
}

export function armRoseUnload() {
  if (typeof window === "undefined") return;
  const flag = window as unknown as { __roseUnload?: boolean };
  if (flag.__roseUnload) return;
  flag.__roseUnload = true;
  const mark = () => {
    unloading = true;
  };
  window.addEventListener("beforeunload", mark);
  window.addEventListener("pagehide", mark);
}

/** SPA leave. A refresh sets unloading first, so the saved place stays for that reload. */
export function markRoseLeft() {
  if (unloading) return;
  leftThisDocument = true;
  clearRosePlace();
}

/** First arrival after a reload can take the place. Every later open in this document starts over. */
export function takeRoseResume(): RosePlace | null {
  if (leftThisDocument || claimed) return null;
  claimed = true;
  if (!roseResumeAllowed(navType(), leftThisDocument)) {
    clearRosePlace();
    return null;
  }
  return readRosePlace();
}
