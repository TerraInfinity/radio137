import { createFileRoute, Link } from "@tanstack/react-router";
import { SongCut } from "@/components/song-cut";
import { getSongByAlias } from "@/lib/catalog";
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
    const hit = getSongByAlias(params.alias);
    if (!hit) return { meta: [{ title: `/${params.alias} · Radio` }] };
    return { meta: [{ title: `${hit.track.title} · Radio` }] };
  },
});

function AliasPage() {
  const { alias } = Route.useParams();
  usePlayerStore((s) => s.catalog);
  usePlayerStore((s) => s.cutGroups);
  const hit = isReservedPublicPath(alias) ? null : getSongByAlias(alias);
  if (!hit) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember">Unknown cut</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">/{alias}</h1>
        <p className="mt-4 text-muted">No song uses that short link. Stations live under /channel/…</p>
        <Link to="/" className="mt-6 inline-flex h-12 items-center font-mono text-[12px] uppercase tracking-[0.16em] text-gold">
          Back to stations
        </Link>
      </div>
    );
  }
  return <SongCut track={hit.track} channel={hit.channel} locked={hit.locked} sharePath={aliasPath(alias)} />;
}
