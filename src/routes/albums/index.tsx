import { Link, createFileRoute } from "@tanstack/react-router";
import { ALBUMS } from "@/lib/albums";
import { useShrimp } from "@/components/shrimp-context";

export const Route = createFileRoute("/albums/")({
  component: AlbumsIndex,
  head: () => ({ meta: [{ title: "Albums · Radio" }] }),
});

function AlbumsIndex() {
  const shrimp = useShrimp();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">{shrimp ? "Glåüm Radio" : "Lane"}</p>
      <h1 className={shrimp ? "mt-2 font-glaum text-5xl font-medium tracking-tight" : "mt-2 font-display text-5xl font-semibold tracking-tight"}>
        Albums
      </h1>
      <p className="mt-3 max-w-prose text-muted">
        Sets and albums from Azeirf on SoundCloud. Playlists count too. They play here, in the frame.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {ALBUMS.map((album) => (
          <li key={album.slug} id={album.slug}>
            <Link to="/albums/$slug" params={{ slug: album.slug }} className="album-card">
              <img src={album.artwork} alt="" className="aspect-square w-full object-cover" />
              <span className="block p-4">
                <span className="block font-glaum text-2xl leading-tight">{album.title}</span>
                <span className="mt-1 block text-sm text-muted">{album.line}</span>
                <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                  {album.source === "soundcloud" ? "SoundCloud set" : "House copy"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
