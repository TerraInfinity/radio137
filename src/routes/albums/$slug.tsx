import { Link, createFileRoute } from "@tanstack/react-router";
import { albumBySlug, albumPlayback } from "@/lib/albums";
import { useShrimp } from "@/components/shrimp-context";

export const Route = createFileRoute("/albums/$slug")({
  component: AlbumPage,
  head: ({ params }) => {
    const album = albumBySlug(params.slug);
    return { meta: [{ title: `${album?.title ?? "Album"} · Radio` }] };
  },
});

function AlbumPage() {
  const { slug } = Route.useParams();
  const shrimp = useShrimp();
  const album = albumBySlug(slug);
  if (!album) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-4xl font-semibold">No such album</h1>
        <Link to="/albums" className="mt-4 inline-flex h-11 items-center text-gold">
          All albums
        </Link>
      </div>
    );
  }
  const playback = albumPlayback(album);
  return (
    <div className={shrimp ? "album-stage is-shrimp" : "album-stage"}>
      <div className="mx-auto max-w-3xl px-4 py-10 pb-52">
        <Link to="/albums" className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold">
          Albums
        </Link>
        <div className="mt-4 overflow-hidden rounded-2xl shadow-[var(--shadow-filigree)]">
          <img src={album.artwork} alt="" className="aspect-square w-full object-cover" />
        </div>
        <h1 className="mt-6 font-glaum text-4xl font-medium leading-tight sm:text-5xl">{album.title}</h1>
        <p className="mt-2 text-muted">{album.line}</p>
        <div className="album-player mt-6 overflow-hidden rounded-xl shadow-[var(--shadow-filigree)]">
          {playback.kind === "r2" ? (
            <audio src={playback.src} controls preload="none" className="w-full" />
          ) : (
            <iframe
              title={album.title}
              src={playback.src}
              width="100%"
              height="380"
              scrolling="no"
              frameBorder="0"
              allow="autoplay; encrypted-media"
            />
          )}
        </div>
      </div>
    </div>
  );
}
