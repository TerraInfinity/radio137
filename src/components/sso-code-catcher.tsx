import { useLayoutEffect } from "react";
import { consumeHandoffHref, isRelativeNext, safeNext } from "@/lib/sso";

/** Hub may land on this origin with ?code= after Google. Never hit consume without a code. */
export function SsoCodeCatcher() {
  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code")?.trim();
    if (!code) return;
    const path = window.location.pathname;
    if (path.startsWith("/api/sso/")) return;
    const nextParam = params.get("next");
    const next = isRelativeNext(nextParam) ? nextParam : safeNext(path || "/");
    window.location.replace(consumeHandoffHref(code, next));
  }, []);
  return null;
}
