import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { DialList, StationCards, type DialRow } from "@/components/dial-list";
import { DirectoryBrowse } from "@/components/directory-browse";
import { GlaumRadioSet } from "@/components/glaum-radio-set";
import { useSetShrimp, useShrimp } from "@/components/shrimp-context";
import { publicChannels } from "@/lib/catalog";
import { stationRows } from "@/lib/feature-rows";
import { hostWantsShrimp } from "@/lib/shrimpify";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/stations")({
  component: StationsPage,
  head: () => ({ meta: [{ title: "Stations · Radio" }] }),
});

function dialFields(row: DialRow) {
  return {
    title: row.title,
    kicker: row.kicker,
    line: row.line,
    category: row.channel?.category,
    tags: row.channel?.tags,
    energy: row.channel?.energy,
    kind: row.channel?.kind,
    mode: row.channel?.mode,
  };
}

function StationsPage() {
  const catalog = usePlayerStore((s) => s.catalog);
  const views = usePlayerStore((s) => s.views);
  const channels = catalog.channels.length ? catalog.channels : publicChannels();
  const rows = useMemo(() => stationRows(channels, views), [channels, views]);
  const shrimp = useShrimp();
  const setShrimp = useSetShrimp();
  useEffect(() => {
    if (typeof window !== "undefined" && hostWantsShrimp(window.location.hostname)) setShrimp(true);
  }, [setShrimp]);
  if (shrimp) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 pb-52">
        <GlaumRadioSet />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Lane</p>
      <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight">Stations</h1>
      <p className="mt-3 max-w-prose text-muted">Desks and frequencies. Experiences live in their own lane.</p>
      <DirectoryBrowse label="stations" defaultView="list" items={rows} fields={dialFields} collapsed={8} render={(shown, view) => (view === "cards" ? <StationCards rows={shown} /> : <DialList rows={shown} />)} />
    </div>
  );
}