import { createFileRoute } from "@tanstack/react-router";
import { resolveRadioUser, r2Configured } from "@/lib/sso.server";

export const Route = createFileRoute("/api/sso/me")({
  server: {
    handlers: {
      GET: async () => {
        const user = await resolveRadioUser();
        return Response.json({ user, r2Configured: r2Configured() });
      },
    },
  },
});
