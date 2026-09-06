import { createFileRoute, Link, Navigate, redirect } from "@tanstack/react-router";
import { Download, Play } from "lucide-react";
import { AdminTrackTools } from "@/components/admin-track-tools";
import { AdminMergeBox, SongCopies } from "@/components/desk-directory";
import { CoverArt } from "@/components/cover-art";
import { ShareLink } from "@/components/share-link";
import { TrackActions } from "@/components/track-actions";
import { getSong, stationsForSong } from "@/lib/catalog";
import { formatClock } from "@/lib/cn";
import { ensureLiveCatalog } from "@/lib/live-catalog";
import { downloadName } from "@/lib/search";
import { ssoLoginHref, useRadioUser } from "@/lib/radio-user";
import { songKey, songPath } from "@/lib/song-url";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/player/$id")({
  component: SongPage,
  beforeLoad: async ({ params }) => {
    try {
      await ensureLiveCatalog();
    } catch {
      /* seed catalog */
    }
    const song = getSong(params.id);
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
  const cueTrack = usePlayerStore((s) => s.cueTrack);
  const status = usePlayerStore((s) => s.status);
  const trackNow = usePlayerStore((s) => s.track);
  const bumpView = usePlayerStore((s) => s.bumpView);
  const { isAdmin } = useRadioUser();

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
  if (song.locked) {
    const href = ssoLoginHref(songPath(song.track));
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">18+ · Locked</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">This cut is off the public dial</h1>
        <p className="mt-4 max-w-prose text-muted">Sign in through the Terrainfinity hub to open 18+ rooms. Google stays on the hub.</p>
        <a href={href} className="mt-8 inline-flex h-12 min-w-44 items-center justify-center rounded-md bg-fg px-6 font-mono text-[12px] uppercase tracking-[0.16em] text-bg">
          Sign in with Google
        </a>
      </div>
    );
  }
  const playingHere = trackNow?.id === song.track.id && status === "playing";
  const alsoOn = stationsForSong(song.track.id).filter((channel) => channel.slug !== song.channel.slug);
  const filename = downloadName(song.track);
  const canonical = songKey(song.track);
  if (id !== canonical) {
    return <Navigate to="/player/$id" params={{ id: canonical }} replace />;
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-44">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Cut</p>
      <div className="mt-6 flex gap-5">
        <CoverArt src={song.track.coverUrl || song.channel.cover} alt="" className="size-32 shrink-0 rounded-lg sm:size-40" />
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-semibold tracking-tight">{song.track.title}</h1>
          <p className="mt-2 text-muted">{song.track.artist}</p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">{formatClock(song.track.durationSec)}</p>
          {song.track.tags && song.track.tags.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-1">
              {song.track.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    to="/"
                    search={{ q: tag }}
                    className="inline-flex h-8 items-center rounded-md px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold shadow-[var(--shadow-border)]"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <TrackActions trackId={song.track.id} />
        </div>
      </div>
      <div className="mt-4">
        <ShareLink path={songPath(song.track)} title={song.track.title} />
      </div>
      {song.track.aliases && song.track.aliases.length > 0 ? (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
          Short links{" "}
          {song.track.aliases.map((alias, index) => (
            <span key={alias}>
              {index ? " · " : ""}
              <a href={`/${alias}`} className="text-gold">
                /{alias}
              </a>
            </span>
          ))}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            bumpView(song.track.id);
            void cueTrack(song.channel.slug, song.track.id);
          }}
          className="inline-flex h-12 min-w-36 items-center justify-center gap-2 rounded-md bg-fg px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-bg"
        >
          <Play className="size-4 ml-0.5" />
          {playingHere ? "Playing" : "Play"}
        </button>
        {song.track.audioUrl ? (
          <a
            href={song.track.audioUrl}
            download={filename}
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
          >
            <Download className="size-4" />
            Download
          </a>
        ) : null}
        <Link to="/channel/$slug" params={{ slug: song.channel.slug }} className="inline-flex h-12 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          {song.channel.name}
        </Link>
      </div>
      {alsoOn.length > 0 ? (
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
          Also on{" "}
          {alsoOn.map((channel, index) => (
            <span key={channel.slug}>
              {index ? " · " : ""}
              <Link to="/channel/$slug" params={{ slug: channel.slug }} className="text-gold">
                {channel.name}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
      <SongCopies trackId={song.track.id} />
      <AdminTrackTools key={`${song.channel.slug}:${song.track.id}:${song.track.audioUrl}:${song.track.slug ?? ""}:${(song.track.aliases ?? []).join(",")}:${(song.track.tags ?? []).join(",")}`} slug={song.channel.slug} track={song.track} />
      {isAdmin ? <AdminMergeBox trackId={song.track.id} /> : null}
    </div>
  );
}
