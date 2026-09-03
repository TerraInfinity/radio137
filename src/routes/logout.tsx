import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

async function logoutResponse(request: Request) {
  const { clearSsoCookie, logoutLocation } = await import("@/lib/sso.server");
  return new Response(null, {
    status: 302,
    headers: {
      Location: logoutLocation(request),
      "Set-Cookie": clearSsoCookie(request),
    },
  });
}

export const Route = createFileRoute("/logout")({
  server: {
    handlers: {
      GET: ({ request }) => logoutResponse(request),
      POST: ({ request }) => logoutResponse(request),
    },
  },
  component: LogoutFallback,
});

function LogoutFallback() {
  useEffect(() => {
    window.location.replace("/api/sso/logout");
  }, []);
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">Frequency</p>
      <h1 className="mt-3 font-display text-4xl font-semibold">Sign out</h1>
      <p className="mt-4 text-muted">Clearing the local session, then the hub.</p>
    </div>
  );
}
