export type SyncPath = "apple" | "android" | "computer";

export function parseSyncPath(value: unknown): SyncPath | undefined {
  return value === "apple" || value === "android" || value === "computer" ? value : undefined;
}

export function detectSyncPath(ua: string): SyncPath {
  if (/iPhone|iPad|iPod/i.test(ua)) return "apple";
  if (/Android/i.test(ua)) return "android";
  return "computer";
}

/** Page a phone should open. Never the feed. */
export function syncPageUrl(origin: string, slug: string, path?: SyncPath): string {
  const root = origin.replace(/\/$/, "") || "https://radio.terrainfinity.ca";
  const page = `${root}/sync/${encodeURIComponent(slug)}`;
  return path ? `${page}?path=${path}` : page;
}
