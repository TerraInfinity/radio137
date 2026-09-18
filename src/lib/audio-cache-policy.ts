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

export function shouldHoldAutoAdvance(dataSaver: boolean, nextCached: boolean): boolean {
  return dataSaver && !nextCached;
}

export function lruVictims(entries: Array<{ id: string; lastUsed: number; size: number }>, need: number): string[] {
  if (need <= 0) return [];
  const ordered = [...entries].sort((a, b) => a.lastUsed - b.lastUsed);
  const out: string[] = [];
  let freed = 0;
  for (const row of ordered) {
    out.push(row.id);
    freed += row.size;
    if (freed >= need) break;
  }
  return out;
}
