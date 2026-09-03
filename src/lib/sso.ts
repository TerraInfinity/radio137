/** Pure SSO client helpers. Hub owns Google; Radio only consumes a one-time code. */

export const DEFAULT_SSO_HUB = "https://www.terrainfinity.ca";

export function isRelativeNext(next: string | null | undefined): next is string {
  if (!next) return false;
  if (!next.startsWith("/")) return false;
  if (next.startsWith("//") || next.includes("\\")) return false;
  if (next.includes("://")) return false;
  return true;
}

export function safeNext(next: string | null | undefined): string {
  return isRelativeNext(next) ? next : "/";
}

export function normalizeHubOrigin(raw?: string | null): string {
  const fallback = DEFAULT_SSO_HUB;
  const value = (raw ?? "").trim().replace(/\/$/, "");
  if (!value) return fallback;
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    if (url.hostname === "terrainfinity.ca") url.hostname = "www.terrainfinity.ca";
    url.pathname = url.pathname.replace(/\/$/, "") || "";
    url.search = "";
    url.hash = "";
    return url.origin;
  } catch {
    return fallback;
  }
}

export function hostnameOf(hostHeader: string): string {
  return hostHeader.trim().toLowerCase().split(",")[0]?.trim().split(":")[0] ?? "";
}

export function publicOriginFromHost(hostHeader: string, proto: string): string {
  const host = hostHeader.trim().split(",")[0]?.trim() || "localhost";
  const hostname = hostnameOf(host);
  if (hostname === "radio.terrainfinity.ca" || hostname.endsWith(".radio.terrainfinity.ca")) {
    return "https://radio.terrainfinity.ca";
  }
  if (hostname === "radio.cyber-athens.ca" || hostname.endsWith(".radio.cyber-athens.ca")) {
    return "https://radio.cyber-athens.ca";
  }
  const scheme = proto.split(",")[0]?.trim() === "https" ? "https" : "http";
  return `${scheme}://${host}`;
}

export function ssoCookieDomain(hostHeader: string, configured?: string | null): string | undefined {
  const hostname = hostnameOf(hostHeader);
  if (!hostname) return undefined;
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]") return undefined;
  if (hostname.endsWith(".grok.me") || hostname.endsWith(".grok-sandbox.com") || hostname.endsWith(".grok.com")) {
    return undefined;
  }
  if (hostname === "cyber-athens.ca" || hostname.endsWith(".cyber-athens.ca")) return undefined;
  const underTerrainfinity = hostname === "terrainfinity.ca" || hostname.endsWith(".terrainfinity.ca");
  if (!underTerrainfinity) return undefined;
  const wanted = (configured ?? "").trim() || ".terrainfinity.ca";
  return wanted;
}

export function consumeReturnTo(origin: string, next = "/"): string {
  const url = new URL("/api/sso/consume", origin);
  url.searchParams.set("next", safeNext(next));
  return url.toString();
}

export function hubStartUrl(hub: string, returnTo: string): string {
  const url = new URL("/api/sso/start", hub);
  url.searchParams.set("returnTo", returnTo);
  return url.toString();
}

export function consumeHandoffHref(code: string, next = "/"): string {
  const url = new URL("/api/sso/consume", "https://radio.invalid");
  url.searchParams.set("code", code);
  url.searchParams.set("next", safeNext(next));
  return `${url.pathname}${url.search}`;
}
