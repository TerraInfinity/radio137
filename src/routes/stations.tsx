import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { DialList } from "@/components/dial-list";
import { OnAirLamp } from "@/components/shrimp-ornaments";
import { useShrimp } from "@/components/shrimp-context";
import { publicChannels } from "@/lib/catalog";
import { stationRows } from "@/lib/feature-rows";
import { GLAUM_STATION } from "@/lib/shrimpify";
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
  const shrimp = useShrimp();
  const shown = shrimp ? rows.filter((row) => row.slug === GLAUM_STATION) : rows;
  if (shrimp) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 pb-52">
        <div className="shrimp-rule pb-4">
          <OnAirLamp />
          <p className="mt-4 font-glaum text-3xl italic text-fg sm:text-4xl">You are listening to Glåüm Radio.</p>
        </div>
        <h1 className="mt-6 font-glaum text-5xl font-medium tracking-tight">Official Glaum Frequency</h1>
        <p className="mt-3 max-w-prose text-muted">One station. The broadcast stays where it is.</p>
        {shown.length ? (
          <DialList title="On the air" rows={shown} />
        ) : (
          <Link
            to="/channel/$slug"
            params={{ slug: GLAUM_STATION }}
            className="mt-6 block rounded-xl bg-bg-elevated p-4 font-glaum text-2xl shadow-[var(--shadow-filigree)]"
          >
            Official Glaum Frequency
          </Link>
        )}
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Lane</p>
      <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight">Stations</h1>
      <p className="mt-3 max-w-prose text-muted">Desks and frequencies. Experiences live in their own lane.</p>
      <DialList title="Stations" rows={rows} collapsed={8} />
    </div>
  );
}
