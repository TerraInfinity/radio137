import { createFileRoute } from "@tanstack/react-router";
import { DeviceSync } from "@/components/device-sync";
import { parseSyncPath, parseSyncTab, type SyncPath, type SyncTab } from "@/lib/sync-path";

function syncSearch(search: Record<string, unknown>): { path?: SyncPath; tab?: SyncTab } {
  const path = parseSyncPath(search.path);
  const tab = parseSyncTab(search.tab);
  return { ...(path ? { path } : {}), ...(tab ? { tab } : {}) };
}

export const Route = createFileRoute("/sync/$slug")({
  validateSearch: syncSearch,
  component: SyncPage,
  head: ({ params }) => ({ meta: [{ title: `${params.slug === "rose" ? "Rose" : params.slug} · Device Sync` }] }),
});

function SyncPage() {
  const { slug } = Route.useParams();
  const { path, tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <DeviceSync
      slug={slug}
      path={path}
      tab={tab}
      onPath={(next) => void navigate({ search: (prev) => ({ ...prev, path: next }), replace: true })}
      onTab={(next) => void navigate({ search: (prev) => ({ ...prev, path: prev.path ?? "apple", tab: next === "radio" ? "radio" : undefined }), replace: true })}
    />
  );
}
