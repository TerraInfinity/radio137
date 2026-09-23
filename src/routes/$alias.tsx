import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ChannelView } from "@/components/channel-view";
import { SongCut } from "@/components/song-cut";
import { getSongByAlias, getStationByAlias } from "@/lib/catalog";
import { experienceFromChannel } from "@/lib/experiences";
import { ensureLiveCatalog } from "@/lib/live-catalog";
import { aliasPath, isReservedPublicPath } from "@/lib/song-url";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/$alias")({
  beforeLoad: async ({ params }) => {
    if (isReservedPublicPath(params.alias)) return;
    try {
      await ensureLiveCatalog();
    } catch {
      /* seed catalog is enough when the desk is unreachable */
    }
  },
  component: AliasPage,
  head: ({ params }) => {
    const song = getSongByAlias(params.alias);
    if (song) return { meta: [{ title: `${song.track.title} · Radio` }] };
    const station = getStationByAlias(params.alias);
    if (station) return { meta: [{ title: `${station.name} · Radio` }] };
    return { meta: [{ title: `/${params.alias} · Radio` }] };
  },
});

function AliasPage() {
  const { alias } = Route.useParams();
  usePlayerStore((s) => s.catalog);
  usePlayerStore((s) => s.cutGroups);
  if (isReservedPublicPath(alias)) {
    return <AliasMiss alias={alias} />;
  }
  const song = getSongByAlias(alias);
  if (song) {
    return <SongCut track={song.track} channel={song.channel} locked={song.locked} sharePath={aliasPath(alias)} />;
  }
  const station = getStationByAlias(alias);
  if (station) {
    const experience = experienceFromChannel(station);
    if (experience) return <Navigate to="/experiences/$slug" params={{ slug: experience.slug }} replace />;
    return <ChannelView channel={station} sharePath={aliasPath(alias)} />;
  }
  return <AliasMiss alias={alias} />;
}

function AliasMiss({ alias }: { alias: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember">Unknown ending</p>
      <h1 className="mt-3 font-display text-4xl font-semibold">/{alias}</h1>
      <p className="mt-4 text-muted">No song or station uses that short link.</p>
      <Link to="/" className="mt-6 inline-flex h-12 items-center font-mono text-[12px] uppercase tracking-[0.16em] text-gold">
        Back to stations
      </Link>
    </div>
  );
}