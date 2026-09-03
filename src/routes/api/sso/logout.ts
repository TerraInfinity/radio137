import { createFileRoute } from "@tanstack/react-router";
import { clearSsoCookie, logoutLocation } from "@/lib/sso.server";

function logout(request: Request) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: logoutLocation(request),
      "Set-Cookie": clearSsoCookie(request),
    },
  });
}

export const Route = createFileRoute("/api/sso/logout")({
  server: {
    handlers: {
      GET: ({ request }) => logout(request),
      POST: ({ request }) => logout(request),
    },
  },
});
