import { useLayoutEffect } from "react";

const TRIED_KEY = "radio_sso_quiet_tried";
const QUIET_HOSTS = new Set(["radio.terrainfinity.ca", "www.shrimpify.ca"]);

/** One silent hub resume per tab, only when SSO_QUIET_RESUME is on and there is no radio user. */
export function SsoQuietResume() {
  useLayoutEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/api/") || path === "/login" || path === "/logout") return;
    if (new URLSearchParams(window.location.search).has("code")) return;
    try {
      if (sessionStorage.getItem(TRIED_KEY)) return;
    } catch {
      return;
    }
    if (!QUIET_HOSTS.has(window.location.hostname)) return;

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/sso/me", { credentials: "include" });
        if (!res.ok || cancelled) return;
        const body = (await res.json()) as { user?: unknown; quietResume?: boolean };
        if (cancelled || body.user || body.quietResume !== true) return;
        try {
          sessionStorage.setItem(TRIED_KEY, "1");
        } catch {
          return;
        }
        const next = `${window.location.pathname}${window.location.search}`;
        window.location.assign(`/api/sso/quiet?next=${encodeURIComponent(next)}`);
      } catch {
        // Leave the page. Do not mark the one-shot or bounce guests.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
