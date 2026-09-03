import { createFileRoute } from "@tanstack/react-router";
import { hubOrigin, mintNextCookie, requestOrigin, safeNext } from "@/lib/sso.server";

export const Route = createFileRoute("/api/sso/login")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        const next = safeNext(url.searchParams.get("next"));
        const origin = requestOrigin(request);
        const consume = new URL("/api/sso/consume", origin);
        consume.searchParams.set("next", next);
        const start = new URL("/api/sso/start", hubOrigin());
        start.searchParams.set("returnTo", consume.toString());
        return new Response(null, {
          status: 302,
          headers: {
            Location: start.toString(),
            "Set-Cookie": mintNextCookie(next, request),
          },
        });
      },
    },
  },
});
