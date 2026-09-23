import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { DialList } from "@/components/dial-list";
import { DialSearch } from "@/components/dial-search";
import { FeatureBoard } from "@/components/feature-board";
import { publicChannels } from "@/lib/catalog";
import { featuredFaces, mixedRows } from "@/lib/feature-rows";
import { qSearch } from "@/lib/search";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/")({
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
  const rows = useMemo(() => mixedRows(channels, views), [channels, views]);
  const faces = useMemo(() => featuredFaces(rows), [rows]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Welcome to the Light Ages</p>
      <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight">Radio</h1>
      <p className="mt-3 max-w-prose text-muted">
        Featured frequencies and rites. Newer and most heard stay near the top. Stations and experiences each keep their own lane.
      </p>
      <div className="mt-8 max-w-3xl">
        <DialSearch
          catalog={catalog.channels.length ? catalog : { ...catalog, channels }}
          query={q}
          onQuery={(next) => void navigate({ search: { q: next.trim() ? next : undefined }, replace: true })}
          heading="Search songs & stations"
        />
      </div>
      {searching ? null : <FeatureBoard rows={faces} />}
      {searching ? null : <DialList title="On the dial" rows={rows} />}
      <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
        <Link to="/stations" className="text-gold">Stations</Link>
        {" · "}
        <Link to="/experiences" className="text-gold">Experiences</Link>
      </p>
    </div>
  );
}
