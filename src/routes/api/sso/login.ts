import { createFileRoute } from "@tanstack/react-router";
import { loginLocation, safeNext } from "@/lib/sso.server";

export const Route = createFileRoute("/api/sso/login")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        const next = safeNext(url.searchParams.get("next"));
        const { location, nextCookie } = loginLocation(request, next);
        return new Response(null, {
          status: 302,
          headers: {
            Location: location,
            "Set-Cookie": nextCookie,
          },
        });
      },
    },
  },
});
