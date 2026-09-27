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

/** Grok / Vercel preview deploys that must not appear in hub SSO returnTo. */
export function isEphemeralDeployHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  if (!host) return false;
  if (host.endsWith("-xai-org.vercel.app")) return true;
  // One-off preview URLs like 01a04c14-….vercel.app (not radio137.vercel.app).
  if (host.endsWith(".vercel.app") && host !== "radio137.vercel.app") return true;
  return false;
}

export function isStableRadioPublicHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  if (!host) return false;
  if (host === "radio.terrainfinity.ca" || host.endsWith(".radio.terrainfinity.ca")) return true;
  if (host === "radio.cyber-athens.ca" || host.endsWith(".radio.cyber-athens.ca")) return true;
  if (host === "radio137.grok.me") return true;
  if (host.endsWith(".grok.me") || host.endsWith(".grok-sandbox.com")) return true;
  if (host === "radio137.vercel.app") return true;
  return false;
}

/**
 * Public site origin for SSO returnTo / cookies.
 * Prefer stable radio / grok.me hosts; never hand the hub an ephemeral *.vercel.app preview host.
 */
export function publicOriginFromHost(hostHeader: string, proto: string, fallbackOrigin?: string | null): string {
  const host = hostHeader.trim().split(",")[0]?.trim() || "localhost";
  const hostname = hostnameOf(host);
  if (hostname === "radio.terrainfinity.ca" || hostname.endsWith(".radio.terrainfinity.ca")) {
    return "https://radio.terrainfinity.ca";
  }
  if (hostname === "radio.cyber-athens.ca" || hostname.endsWith(".radio.cyber-athens.ca")) {
    return "https://radio.cyber-athens.ca";
  }
  if (hostname === "radio137.grok.me") {
    return "https://radio137.grok.me";
  }
  if (hostname.endsWith(".grok.me") || hostname.endsWith(".grok-sandbox.com")) {
    return `https://${hostname}`;
  }
  if (hostname === "radio137.vercel.app") {
    return "https://radio.terrainfinity.ca";
  }
  if (isEphemeralDeployHost(hostname)) {
    const raw = (fallbackOrigin ?? "").trim();
    if (raw) {
      try {
        return new URL(raw.includes("://") ? raw : `https://${raw}`).origin;
      } catch {
        /* fall through */
      }
    }
    return "https://radio137.grok.me";
  }
  const scheme = proto.split(",")[0]?.trim() === "https" ? "https" : "http";
  return `${scheme}://${host}`;
}

/** Prefer a stable public host when proxies advertise both grok.me and an ephemeral deploy host. */
export function pickPublicHostHeader(candidates: Array<string | null | undefined>): string {
  const cleaned = candidates
    .flatMap((value) => String(value || "").split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  const stable = cleaned.find((value) => isStableRadioPublicHost(hostnameOf(value)));
  if (stable) return stable;
  const nonEphemeral = cleaned.find((value) => !isEphemeralDeployHost(hostnameOf(value)));
  return nonEphemeral || cleaned[0] || "localhost";
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
