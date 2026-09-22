/** Catalog slots that were never read from the file. */
export function isStubDuration(seconds: number): boolean {
  if (!Number.isFinite(seconds) || seconds <= 0) return true;
  return seconds <= 15 || seconds === 60;
}

/** `duration_sec` is an integer column. Audio probes return fractions like 376.520167. */
export function wholeSeconds(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value) || value <= 0) return null;
  return Math.max(1, Math.round(value));
}
