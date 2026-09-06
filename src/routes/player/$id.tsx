import { createFileRoute, Link, Navigate, redirect } from "@tanstack/react-router";
import { SongCut } from "@/components/song-cut";
import { getCatalog, getSong } from "@/lib/catalog";
import { ensureLiveCatalog } from "@/lib/live-catalog";
import { findSongByAlias, songKey, songPath } from "@/lib/song-url";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/player/$id")({
  component: SongPage,
  beforeLoad: async ({ params }) => {
    try {
      await ensureLiveCatalog();
    } catch {
      /* seed catalog */
    }
    const catalog = getCatalog();
    const byAlias = findSongByAlias(catalog, params.id);
    const song = getSong(params.id);
    if (byAlias && songKey(byAlias.track) !== params.id) {
      throw redirect({ to: "/$alias", params: { alias: params.id }, replace: true });
    }
    if (!song) return;
    const canonical = songKey(song.track);
    if (params.id !== canonical) {
      throw redirect({ to: "/player/$id", params: { id: canonical }, replace: true });
    }
  },
  head: ({ params }) => {
    const song = getSong(params.id);
    if (!song || song.locked) return { meta: [{ title: "Locked cut · Radio" }] };
    return { meta: [{ title: `${song.track.title} · Radio` }] };
  },
});

function SongPage() {
  const { id } = Route.useParams();
  usePlayerStore((s) => s.catalog);
  usePlayerStore((s) => s.cutGroups);
  const song = getSong(id);
  const canonical = song ? songKey(song.track) : "";
  if (song && id !== canonical) {
    return <Navigate to="/player/$id" params={{ id: canonical }} replace />;
  }
  if (!song) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember">Missing cut</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">No such song</h1>
        <p className="mt-4 text-muted">It may have been taken off a desk. Search the archive.</p>
        <Link to="/player" search={{ q: id }} className="mt-6 inline-flex h-12 items-center font-mono text-[12px] uppercase tracking-[0.16em] text-gold">
          Search cuts
        </Link>
      </div>
    );
  }
  return <SongCut track={song.track} channel={song.channel} locked={song.locked} sharePath={songPath(song.track)} />;
}
