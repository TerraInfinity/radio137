import { Link } from "@tanstack/react-router";
import { Download, Play } from "lucide-react";
import { AdminTrackTools } from "@/components/admin-track-tools";
import { AdminMergeBox, SongCopies } from "@/components/desk-directory";
import { CoverArt } from "@/components/cover-art";
import { ShareLink } from "@/components/share-link";
import { TrackActions } from "@/components/track-actions";
import { stationsForSong } from "@/lib/catalog";
import { formatClock } from "@/lib/cn";
import { downloadName } from "@/lib/search";
import { ssoLoginHref, useRadioUser } from "@/lib/radio-user";
import { aliasPath, songPath } from "@/lib/song-url";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel, Track } from "@/lib/types";

export function SongCut({
  track,
  channel,
  locked,
  sharePath,
}: {
  track: Track;
  channel: Channel;
  locked: boolean;
  sharePath: string;
}) {
  const cueTrack = usePlayerStore((s) => s.cueTrack);
  const status = usePlayerStore((s) => s.status);
  const trackNow = usePlayerStore((s) => s.track);
  const bumpView = usePlayerStore((s) => s.bumpView);
  const { isAdmin } = useRadioUser();

  if (locked) {
    const href = ssoLoginHref(sharePath);
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

  const playingHere = trackNow?.id === track.id && status === "playing";
  const alsoOn = stationsForSong(track.id).filter((item) => item.slug !== channel.slug);
  const filename = downloadName(track);
  const canonical = songPath(track);
  const aliases = track.aliases ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-44">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Cut</p>
      <div className="mt-6 flex gap-5">
        <CoverArt src={track.coverUrl || channel.cover} alt="" className="size-32 shrink-0 rounded-lg sm:size-40" />
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-semibold tracking-tight">{track.title}</h1>
          <p className="mt-2 text-muted">{track.artist}</p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">{formatClock(track.durationSec)}</p>
          {track.tags && track.tags.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-1">
              {track.tags.map((tag) => (
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
          <TrackActions trackId={track.id} />
        </div>
      </div>
      <div className="mt-4">
        <ShareLink path={sharePath} title={track.title} />
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
        Player{" "}
        <a href={canonical} className="text-gold">
          {canonical}
        </a>
        {aliases.length > 0 ? (
          <>
            {" "}
            · Short{" "}
            {aliases.map((alias, index) => (
              <span key={alias}>
                {index ? " · " : ""}
                <a href={aliasPath(alias)} className="text-gold">
                  /{alias}
                </a>
              </span>
            ))}
          </>
        ) : null}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            bumpView(track.id);
            void cueTrack(channel.slug, track.id);
          }}
          className="inline-flex h-12 min-w-36 items-center justify-center gap-2 rounded-md bg-fg px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-bg"
        >
          <Play className="size-4 ml-0.5" />
          {playingHere ? "Playing" : "Play"}
        </button>
        {track.audioUrl ? (
          <a
            href={track.audioUrl}
            download={filename}
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
          >
            <Download className="size-4" />
            Download
          </a>
        ) : null}
        <Link to="/channel/$slug" params={{ slug: channel.slug }} className="inline-flex h-12 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          {channel.name}
        </Link>
      </div>
      {alsoOn.length > 0 ? (
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
          Also on{" "}
          {alsoOn.map((item, index) => (
            <span key={item.slug}>
              {index ? " · " : ""}
              <Link to="/channel/$slug" params={{ slug: item.slug }} className="text-gold">
                {item.name}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
      <SongCopies trackId={track.id} />
      <AdminTrackTools
        key={`${channel.slug}:${track.id}:${track.audioUrl}:${track.slug ?? ""}:${aliases.join(",")}:${(track.tags ?? []).join(",")}`}
        slug={channel.slug}
        track={track}
      />
      {isAdmin ? <AdminMergeBox trackId={track.id} /> : null}
    </div>
  );
}
