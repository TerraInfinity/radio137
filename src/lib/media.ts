/** Public media origin. Flip VITE_MEDIA_PUBLIC_BASE to move buckets without rewriting catalog URLs. */
export const DEFAULT_MEDIA_BASE = "https://r2.terrainfinity.ca";
export const MEDIA_MAX_IMAGE = 2 * 1024 * 1024;
export const MEDIA_MAX_VIDEO = 10 * 1024 * 1024;

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
  return /\.(mp4|webm|mov)$/.test(path);
}
