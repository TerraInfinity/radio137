import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { AdminTrackTools } from "@/components/admin-track-tools";
import { CoverArt } from "@/components/cover-art";
import { getSong } from "@/lib/catalog";
import { formatClock } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/player/$id")({
  component: SongPage,
  head: ({ params }) => {
    const song = getSong(params.id);
    if (!song || song.locked) return { meta: [{ title: "Locked cut · Radio" }] };
    return { meta: [{ title: `${song.track.title} · Radio` }] };
  },
});

function SongPage() {
  const { id } = Route.useParams();
  const song = getSong(id);
  const cueTrack = usePlayerStore((s) => s.cueTrack);
  const status = usePlayerStore((s) => s.status);
  const trackNow = usePlayerStore((s) => s.track);

  if (!song) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember">Missing cut</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">No such song</h1>
      </div>
    );
  }
  if (song.locked) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">18+ · Locked</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">This cut is off the public dial</h1>
      </div>
    );
  }
  const playingHere = trackNow?.id === song.track.id && status === "playing";
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-44">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Player</p>
      <div className="mt-6 flex gap-5">
        <CoverArt src={song.track.coverUrl || song.channel.cover} alt="" className="size-32 shrink-0 rounded-lg sm:size-40" />
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-semibold tracking-tight">{song.track.title}</h1>
          <p className="mt-2 text-muted">{song.track.artist}</p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">{formatClock(song.track.durationSec)}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void cueTrack(song.channel.slug, song.track.id)}
          className="inline-flex h-12 min-w-36 items-center justify-center gap-2 rounded-md bg-fg px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-bg"
        >
          <Play className="size-4" />
          {playingHere ? "Playing" : "Play"}
        </button>
        <Link to="/channel/$slug" params={{ slug: song.channel.slug }} className="inline-flex h-12 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          {song.channel.name}
        </Link>
      </div>
      <AdminTrackTools slug={song.channel.slug} track={song.track} />
    </div>
  );
}
