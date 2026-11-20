/** Hosts this app is allowed to fetch on the server. Everything else is refused. */

const NAMED = ["r2.terrainfinity.ca"];

function configuredHosts(): string[] {
  const hosts: string[] = [];
  for (const raw of [process.env.MEDIA_PUBLIC_BASE, process.env.VITE_MEDIA_PUBLIC_BASE, process.env.R2_PUBLIC_BASE_URL]) {
    const value = raw?.trim();
    if (!value) continue;
    try {
      hosts.push(new URL(value).hostname.toLowerCase());
    } catch {
      /* ignore a bad env value */
    }
  }
  return hosts;
}

export function allowedMediaUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return false;
  if (host.includes(":") || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return false;
  return NAMED.includes(host) || configuredHosts().includes(host);
}
