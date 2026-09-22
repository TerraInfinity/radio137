import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/experiences")({
  component: () => <Outlet />,
});
