import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { DialSearch } from "@/components/dial-search";
import { FeatureBoard } from "@/components/feature-board";
import { useSetShrimp } from "@/components/shrimp-context";
import { publicChannels } from "@/lib/catalog";
import { hostWantsShrimp } from "@/lib/shrimpify";
import { homeFeatured } from "@/lib/feature-rows";
import { qSearch } from "@/lib/search";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const host = typeof window !== "undefined" ? window.location.hostname : await (await import("@/lib/shrimp-visit")).readVisitHost();
    if (hostWantsShrimp(host)) throw redirect({ to: "/stations", replace: true });
  },
  component: Home,
  validateSearch: qSearch,
  head: () => ({ meta: [{ title: "Radio" }] }),
});

function Home() {
  const catalog = usePlayerStore((s) => s.catalog);
  const views = usePlayerStore((s) => s.views);
  const channels = catalog.channels.length ? catalog.channels : publicChannels();
  const { q = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const searching = q.trim().length >= 2;
  const setShrimp = useSetShrimp();
  const faces = useMemo(() => homeFeatured(channels, views), [channels, views]);

  useEffect(() => {
    setShrimp(false);
  }, [setShrimp]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Welcome to the Light Ages</p>
      <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight">Radio</h1>
      <p className="mt-3 max-w-prose text-muted">Featured rites and stations, and whatever is on the air. The full directories stay in their lanes.</p>
      {searching ? null : <FeatureBoard rows={faces} />}
      <div className="mt-8 max-w-3xl">
        <DialSearch
          catalog={catalog.channels.length ? catalog : { ...catalog, channels }}
          query={q}
          onQuery={(next) => void navigate({ search: { q: next.trim() ? next : undefined }, replace: true })}
          heading="Search songs & stations"
        />
      </div>
      <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
        <Link to="/stations" className="text-gold">
          Stations
        </Link>
        {" · "}
        <Link to="/experiences" className="text-gold">
          Experiences
        </Link>
        {" · "}
        <Link to="/albums" className="text-gold">
          Albums
        </Link>
      </p>
    </div>
  );
}

