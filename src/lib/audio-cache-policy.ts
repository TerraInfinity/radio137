export const KEEP_LISTEN_RATIO = 0.72;
export const AUTO_CACHE_BYTES_TIGHT = 8 * 1024 * 1024;
export const AUTO_CACHE_BYTES_ROOMY = 16 * 1024 * 1024;
export const FORCE_CACHE_BYTES = 48 * 1024 * 1024;
export const BUDGET_TIGHT = 120 * 1024 * 1024;
export const BUDGET_ROOMY = 400 * 1024 * 1024;
export const MAX_TRACKS_TIGHT = 8;
export const MAX_TRACKS_ROOMY = 20;

export type CacheEntry = { id: string; lastUsed: number; size: number; pinned?: boolean };

export function isFiniteAudioUrl(url?: string | null): boolean {
  if (!url) return false;
  const raw = url.trim();
  if (!raw || raw.startsWith("blob:") || raw.startsWith("data:")) return false;
  const path = raw.split(/[?#]/)[0].toLowerCase();
  if (/\.(m3u8|mpd|m3u)$/.test(path)) return false;
  if (/(^|\/)(icy|icecast|hls|livestream)(\/|$)/.test(path)) return false;
  if (/\/stream(?:\.|\/|$)/.test(path)) return false;
  if (/\.(mp3|m4a|aac|ogg|opus|wav|flac|mp4)$/.test(path)) return true;
  try {
    const host = new URL(raw, "https://r2.terrainfinity.ca").hostname.toLowerCase();
    if (host.endsWith(".r2.dev") || host.endsWith(".r2.cloudflarestorage.com") || host === "r2.terrainfinity.ca") return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function isDataSaverConnection(conn?: { saveData?: boolean; type?: string } | null): boolean {
  if (!conn) return false;
  if (conn.saveData) return true;
  return String(conn.type || "").toLowerCase() === "cellular";
}

export function isTightStorage(opts: { ua?: string; width?: number; saveData?: boolean; type?: string } = {}): boolean {
  if (opts.saveData || String(opts.type || "").toLowerCase() === "cellular") return true;
  if ((opts.width ?? 9999) <= 700) return true;
  const ua = (opts.ua ?? "").toLowerCase();
  return /iphone|ipod|ipad|android|mobile|watch/.test(ua);
}

export function cacheBudgetBytes(quota: number | undefined, tight: boolean): number {
  const cap = tight ? BUDGET_TIGHT : BUDGET_ROOMY;
  const frac = tight ? 0.18 : 0.35;
  if (!quota || !Number.isFinite(quota) || quota <= 0) return cap;
  return Math.max(8 * 1024 * 1024, Math.min(cap, Math.floor(quota * frac)));
}

export function maxCachedTracks(tight: boolean): number {
  return tight ? MAX_TRACKS_TIGHT : MAX_TRACKS_ROOMY;
}

export function maxKeepBytes(opts: { force?: boolean; tight?: boolean }): number {
  if (opts.force) return FORCE_CACHE_BYTES;
  return opts.tight ? AUTO_CACHE_BYTES_TIGHT : AUTO_CACHE_BYTES_ROOMY;
}

export function shouldHoldAutoAdvance(dataSaver: boolean, nextCached: boolean): boolean {
  return dataSaver && !nextCached;
}

export function shouldAutoKeep(opts: {
  force?: boolean;
  dataSaver?: boolean;
  bytes?: number;
  tight?: boolean;
  listenedRatio?: number;
}): boolean {
  if (opts.force) {
    return opts.bytes == null || opts.bytes <= FORCE_CACHE_BYTES;
  }
  if (opts.dataSaver) return false;
  if (opts.listenedRatio != null && opts.listenedRatio < KEEP_LISTEN_RATIO) return false;
  if (opts.bytes != null && opts.bytes > maxKeepBytes({ tight: opts.tight })) return false;
  return true;
}

function cacheOrder(a: CacheEntry, b: CacheEntry) {
  const ap = a.pinned ? 1 : 0;
  const bp = b.pinned ? 1 : 0;
  if (ap !== bp) return ap - bp;
  return a.lastUsed - b.lastUsed;
}

export function lruVictims(entries: CacheEntry[], need: number): string[] {
  if (need <= 0) return [];
  const ordered = [...entries].sort(cacheOrder);
  const out: string[] = [];
  let freed = 0;
  for (const row of ordered) {
    out.push(row.id);
    freed += row.size;
    if (freed >= need) break;
  }
  return out;
}

export function overflowVictims(entries: CacheEntry[], maxCount: number): string[] {
  if (entries.length <= maxCount) return [];
  const ordered = [...entries].sort(cacheOrder);
  return ordered.slice(0, entries.length - maxCount).map((row) => row.id);
}
