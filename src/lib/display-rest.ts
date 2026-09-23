/** The phone display is off, or the page is frozen. Graphics should stop. Audio should not. */
export function displayAsleep(): boolean {
  if (typeof document === "undefined") return false;
  return document.visibilityState === "hidden";
}

export function onDisplayRest(rest: () => void, wake: () => void): () => void {
  if (typeof document === "undefined") return () => undefined;
  const vis = () => (displayAsleep() ? rest() : wake());
  document.addEventListener("visibilitychange", vis);
  document.addEventListener("freeze", rest);
  document.addEventListener("resume", wake);
  return () => {
    document.removeEventListener("visibilitychange", vis);
    document.removeEventListener("freeze", rest);
    document.removeEventListener("resume", wake);
  };
}

/** The deck looks busy but is not actually playing. A tap should wake it, not pause it. */
export function deckIsStalled(snap: { paused: boolean; readyState: number; buffering: boolean }): boolean {
  return snap.buffering || snap.paused || snap.readyState < 2;
}
export function claimPlaybackSession() {
  if (typeof navigator === "undefined") return;
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
  if (!session) return;
  try {
    session.type = "playback";
  } catch {
    /* the platform decides */
  }
}
