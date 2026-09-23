import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/device-sync")({
  component: () => <Navigate to="/sync/$slug" params={{ slug: "rose" }} replace />,
});
