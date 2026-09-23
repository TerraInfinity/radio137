import { mediaKeyFromUrl } from "@/lib/media";
import type { Channel } from "@/lib/types";

export function r2KeyFromAudioUrl(url: string): string | null {
  return mediaKeyFromUrl(url);
}

export function fileLocationLabel(url: string): string {
  const key = r2KeyFromAudioUrl(url);
  if (key) return key;
  if (!url) return "—";
  try {
    const parsed = new URL(url);
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, "")) || parsed.hostname;
  } catch {
    return url;
  }
}

export function audioPathParts(url: string): { folder: string; filename: string; stem: string } {
  const path = fileLocationLabel(url);
  const slash = path.lastIndexOf("/");
  const filename = (slash >= 0 ? path.slice(slash + 1) : path) || path;
  const folder = slash >= 0 ? path.slice(0, slash) : "";
  const stem = filename.replace(/\.[a-z0-9]{2,5}$/i, "").replace(/-\d{4,}$/, "");
  return { folder, filename, stem };
}

export function isAudioKey(key: string): boolean {
  return /\.(mp3|wav|flac|m4a|ogg|aac)$/i.test(key.split("?")[0]);
}

export function audioExtension(urlOrName: string): string {
  const path = (urlOrName || "").split("?")[0]?.split("#")[0] ?? "";
  const name = path.split("/").pop() || "";
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "";
  return name.slice(dot + 1).toLowerCase();
}

export function normalizeR2Key(key: string): string {
  const cleaned = key.replace(/^\/+/, "").replace(/\\/g, "/");
  try {
    return decodeURIComponent(cleaned);
  } catch {
    return cleaned;
  }
}

export function titleFromR2Key(key: string): string {
  const name = normalizeR2Key(key).split("/").pop() || key;
  return name.replace(/\.[a-z0-9]{2,5}$/i, "").replace(/\s+/g, " ").trim() || "Untitled";
}

export function formatBytes(size: number): string {
  if (!Number.isFinite(size) || size <= 0) return "";
  if (size < 1024) return `${Math.round(size)} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function desksHoldingKey(channels: Channel[], key: string): string[] {
  const want = normalizeR2Key(key);
  if (!want) return [];
  const hits: string[] = [];
  for (const channel of channels) {
    const on = channel.tracks.some((track) => {
      if (track.enabled === false) return false;
      const have = normalizeR2Key(r2KeyFromAudioUrl(track.audioUrl) || "");
      return Boolean(have) && have === want;
    });
    if (on) hits.push(channel.slug);
  }
  return hits;
}

/** One pass over the catalog so R2 rows can look up desks in O(1). */
export function buildDeskKeyIndex(channels: Channel[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const channel of channels) {
    for (const track of channel.tracks) {
      if (track.enabled === false) continue;
      const key = normalizeR2Key(r2KeyFromAudioUrl(track.audioUrl) || "");
      if (!key) continue;
      const list = map.get(key);
      if (list) {
        if (!list.includes(channel.slug)) list.push(channel.slug);
      } else {
        map.set(key, [channel.slug]);
      }
    }
  }
  return map;
}

export function desksForKey(index: Map<string, string[]>, key: string): string[] {
  return index.get(normalizeR2Key(key)) ?? [];
}
