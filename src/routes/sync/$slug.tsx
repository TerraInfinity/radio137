import { createFileRoute } from "@tanstack/react-router";
import { DeviceSync } from "@/components/device-sync";
import { parseSyncPath, type SyncPath } from "@/lib/sync-path";

function syncSearch(search: Record<string, unknown>): { path?: SyncPath } {
  const path = parseSyncPath(search.path);
  return path ? { path } : {};
}

export const Route = createFileRoute("/sync/$slug")({
  validateSearch: syncSearch,
  component: SyncPage,
  head: ({ params }) => ({ meta: [{ title: `${params.slug === "rose" ? "Rose" : params.slug} · Device Sync` }] }),
});

function SyncPage() {
  const { slug } = Route.useParams();
  const { path } = Route.useSearch();
  const navigate = Route.useNavigate();
  return <DeviceSync slug={slug} path={path} onPath={(next) => void navigate({ search: { path: next }, replace: true })} />;
}
