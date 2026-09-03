import { createFileRoute } from "@tanstack/react-router";
import {
  clearNextCookie,
  exchangeSsoCode,
  mintSsoCookie,
  readNextFromCookie,
  safeNext,
} from "@/lib/sso.server";

function escapeHtml(message: string) {
  return message.replace(/[&<>"]/g, (char) => {
    if (char === "&") return "\u0026amp;";
    if (char === "<") return "\u0026lt;";
    if (char === ">") return "\u0026gt;";
    return "\u0026quot;";
  });
}

function errorPage(message: string) {
  const safe = escapeHtml(message);
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Sign in · Radio</title>
<style>body{margin:0;min-height:100dvh;background:#070605;color:#e8e2d6;font-family:"IBM Plex Sans",sans-serif;display:grid;place-items:center;padding:2rem}a{color:#c9a36a}</style>
</head><body><main><p>Frequency</p><h1>Sign-in missed</h1><p>${safe}</p><p><a href="/">Back to stations</a></p></main></body></html>`,
    { status: 400, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export const Route = createFileRoute("/api/sso/consume")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const next = safeNext(url.searchParams.get("next") || readNextFromCookie(request));
        if (!code) return errorPage("Missing code from the hub.");
        try {
          const user = await exchangeSsoCode(code);
          const cookie = await mintSsoCookie(user, request);
          const resolved = new URL(next, request.url);
          const safeLocation =
            resolved.pathname.startsWith("/") && !resolved.pathname.startsWith("//")
              ? `${resolved.pathname}${resolved.search}`
              : "/";
          const headers = new Headers({ Location: safeLocation });
          headers.append("Set-Cookie", cookie);
          headers.append("Set-Cookie", clearNextCookie(request));
          return new Response(null, { status: 302, headers });
        } catch (error) {
          return errorPage(error instanceof Error ? error.message : "Hub exchange failed.");
        }
      },
    },
  },
});
