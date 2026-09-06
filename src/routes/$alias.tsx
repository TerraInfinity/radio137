import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { getSong } from "@/lib/catalog";
import { ensureLiveCatalog } from "@/lib/live-catalog";
import { isReservedPublicPath, songKey } from "@/lib/song-url";

export const Route = createFileRoute("/$alias")({
  beforeLoad: async ({ params }) => {
    if (isReservedPublicPath(params.alias)) return;
    try {
      await ensureLiveCatalog();
    } catch {
      /* seed catalog is enough when the desk is unreachable */
    }
    const song = getSong(params.alias);
    if (!song) return;
    throw redirect({
      to: "/player/$id",
      params: { id: songKey(song.track) },
      replace: true,
    });
  },
  component: AliasMiss,
  head: ({ params }) => ({ meta: [{ title: `/${params.alias} · Radio` }] }),
});

function AliasMiss() {
  const { alias } = Route.useParams();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember">Unknown cut</p>
      <h1 className="mt-3 font-display text-4xl font-semibold">/{alias}</h1>
      <p className="mt-4 text-muted">No song uses that ending. Stations live under /channel/…</p>
      <Link to="/" className="mt-6 inline-flex h-12 items-center font-mono text-[12px] uppercase tracking-[0.16em] text-gold">
        Back to stations
      </Link>
    </div>
  );
}
