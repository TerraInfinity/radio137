/** Catalog slots that were never read from the file. */
export function isStubDuration(seconds: number): boolean {
  if (!Number.isFinite(seconds) || seconds <= 0) return true;
  return seconds <= 15 || seconds === 60;
}
