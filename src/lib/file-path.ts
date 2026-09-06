const ABSOLUTE = /^https?:\/\//i;

export function r2KeyFromAudioUrl(url: string): string | null {
  if (!url || !ABSOLUTE.test(url)) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host === "r2.terrainfinity.ca" || host.endsWith(".r2.dev") || host.endsWith(".r2.cloudflarestorage.com")) {
      const key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
      return key || null;
    }
  } catch {
    return null;
  }
  return null;
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
