import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { DialList } from "@/components/dial-list";
import { publicChannels } from "@/lib/catalog";
import { stationRows } from "@/lib/feature-rows";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/stations")({
  component: StationsPage,
  head: () => ({ meta: [{ title: "Stations · Radio" }] }),
});

function StationsPage() {
  const catalog = usePlayerStore((s) => s.catalog);
  const views = usePlayerStore((s) => s.views);
  const channels = catalog.channels.length ? catalog.channels : publicChannels();
  const rows = useMemo(() => stationRows(channels, views), [channels, views]);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Lane</p>
      <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight">Stations</h1>
      <p className="mt-3 max-w-prose text-muted">Desks and frequencies. Experiences live in their own lane.</p>
      <DialList title="Stations" rows={rows} collapsed={8} />
    </div>
  );
}
