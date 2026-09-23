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

/** Ask the browser to treat this tab as music, so a dark screen does not drop the song. */
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
