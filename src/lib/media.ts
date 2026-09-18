/** Public media origin. Flip VITE_MEDIA_PUBLIC_BASE to move buckets without rewriting catalog URLs. */
export const DEFAULT_MEDIA_BASE = "https://r2.terrainfinity.ca";
export const MEDIA_MAX_IMAGE = 2 * 1024 * 1024;
export const MEDIA_MAX_IMAGE_PICK = 24 * 1024 * 1024;
export const MEDIA_MAX_VIDEO = 24 * 1024 * 1024;
export const ART_ACCEPT =
  "image/*,video/*,image/heic,image/heif,image/heic-sequence,video/quicktime,video/mp4,video/webm,.heic,.heif,.jpg,.jpeg,.png,.webp,.gif,.avif,.mp4,.webm,.mov,.m4v";

const HOST_SUFFIXES = [".r2.dev", ".r2.cloudflarestorage.com"];
const HOSTS = new Set(["r2.terrainfinity.ca"]);

function readEnv(name: string): string {
  try {
    const meta = import.meta as { env?: Record<string, string | undefined> };
    return String(meta.env?.[name] ?? "").trim();
  } catch {
    return "";
  }
}

export function mediaPublicBase(): string {
  return (readEnv("VITE_MEDIA_PUBLIC_BASE") || DEFAULT_MEDIA_BASE).replace(/\/$/, "");
}

function extraLegacyBases(): string[] {
  return readEnv("VITE_MEDIA_LEGACY_BASES")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isManagedMediaHost(host: string): boolean {
  const h = host.toLowerCase();
  if (HOSTS.has(h)) return true;
  if (HOST_SUFFIXES.some((suffix) => h.endsWith(suffix))) return true;
  try {
    if (new URL(mediaPublicBase()).hostname.toLowerCase() === h) return true;
  } catch {
    /* ignore */
  }
  for (const base of extraLegacyBases()) {
    try {
      if (new URL(base).hostname.toLowerCase() === h) return true;
    } catch {
      /* ignore */
    }
  }
  return false;
}

export function mediaKeyFromUrl(url: string): string | null {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    const parsed = new URL(url);
    if (!isManagedMediaHost(parsed.hostname)) return null;
    const key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
    return key || null;
  } catch {
    return null;
  }
}

/** Resolve a stored cover/audio URL against the current public base. */
export function mediaUrl(src?: string | null): string {
  if (!src) return "";
  if (src.startsWith("/") && !src.startsWith("//")) return src;
  const key = mediaKeyFromUrl(src);
  if (!key) return src;
  return `${mediaPublicBase()}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export function isLoopingVisual(src?: string | null): boolean {
  if (!src) return false;
  const path = src.split("?")[0].toLowerCase();
  return /\.(mp4|webm|mov|m4v)$/.test(path);
}

export function downloadPath(trackId: string): string {
  return `/api/media/download?id=${encodeURIComponent(trackId)}`;
}

function firstUrl(...urls: Array<string | null | undefined>): string {
  for (const url of urls) {
    if (url && url.trim()) return url.trim();
  }
  return "";
}

/** Station card / hero base layer: motion first, still as fallback. */
export function stationVisualSrc(channel?: { cover?: string; animationUrl?: string; videoUrl?: string } | null): string {
  return firstUrl(channel?.videoUrl, channel?.animationUrl, channel?.cover);
}

/** Still or looping visual for a song, falling back through station motion fields. */
export function visualSrc(track?: { coverUrl?: string | null } | null, channel?: { cover?: string; animationUrl?: string; videoUrl?: string } | null): string {
  return firstUrl(track?.coverUrl, stationVisualSrc(channel));
}
