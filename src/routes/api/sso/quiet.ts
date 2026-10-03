import { createFileRoute } from "@tanstack/react-router";
import {
  quietLoginLocation,
  quietResumeEnabled,
  readSsoUser,
  safeNext,
  safeRedirectPath,
} from "@/lib/sso.server";

export const Route = createFileRoute("/api/sso/quiet")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!quietResumeEnabled()) {
          return Response.json({ error: "not found" }, { status: 404 });
        }
        const url = new URL(request.url);
        const next = safeNext(url.searchParams.get("next"));
        const existing = await readSsoUser(request);
        if (existing) {
          return new Response(null, {
            status: 302,
            headers: { Location: safeRedirectPath(next, request) },
          });
        }
        const { location, nextCookie } = quietLoginLocation(request, next);
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
