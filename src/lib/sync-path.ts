export type SyncPath = "apple" | "android" | "computer";
export type SyncTab = "offline" | "radio";

export function parseSyncPath(value: unknown): SyncPath | undefined {
  return value === "apple" || value === "android" || value === "computer" ? value : undefined;
}

export function parseSyncTab(value: unknown): SyncTab | undefined {
  return value === "offline" || value === "radio" ? value : undefined;
}

export function detectSyncPath(ua: string): SyncPath {
  if (/iPhone|iPad|iPod/i.test(ua)) return "apple";
  if (/Android/i.test(ua)) return "android";
  return "computer";
}

/** The only address a camera should open. It is a page, not the feed. */
export function syncAddUrl(origin: string, slug: string): string {
  const root = origin.replace(/\/$/, "") || "https://radio.terrainfinity.ca";
  return `${root}/sync/${encodeURIComponent(slug)}/add`;
}

/** Page a phone should open. Never the feed. */
export function syncPageUrl(origin: string, slug: string, path?: SyncPath, tab?: SyncTab): string {
  const root = origin.replace(/\/$/, "") || "https://radio.terrainfinity.ca";
  const page = `${root}/sync/${encodeURIComponent(slug)}`;
  const params = new URLSearchParams();
  if (path) params.set("path", path);
  if (tab === "radio") params.set("tab", "radio");
  const query = params.toString();
  return query ? `${page}?${query}` : page;
}
