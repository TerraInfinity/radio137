import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminTrackTools } from "@/components/admin-track-tools";
import { AdminMergeBox, SongCopies } from "@/components/desk-directory";
import { CoverArt } from "@/components/cover-art";
import { DownloadLink } from "@/components/download-link";
import { FoldSection } from "@/components/fold-section";
import { ShareLink } from "@/components/share-link";
import { SignInChoices } from "@/components/sign-in-choices";
import { TrackActions } from "@/components/track-actions";
import { getPlayableTracks, stationsForSong } from "@/lib/catalog";
import { formatClock } from "@/lib/cn";
import { durationOf } from "@/lib/playback";
import { useRadioUser } from "@/lib/radio-user";
import { aliasPath, songKey, songPath } from "@/lib/song-url";
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
  const ready = usePlayerStore((s) => s.ready);
  const { isAdmin } = useRadioUser();

  useEffect(() => {
    if (!ready || locked) return;
    const now = usePlayerStore.getState();
    if (now.track?.id === track.id && (now.status === "playing" || now.status === "loading")) return;
    bumpView(track.id);
    void cueTrack(channel.slug, track.id);
  }, [ready, locked, track.id, channel.slug, bumpView, cueTrack]);

  if (locked) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">18+ · Locked</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">This song is off the public dial</h1>
        <p className="mt-4 max-w-prose text-muted">Sign in with Google or X to open 18+ rooms. Google still lives on the Terrainfinity hub.</p>
        <div className="mt-8">
          <SignInChoices next={sharePath} />
        </div>
      </div>
    );
  }

  const playingHere = trackNow?.id === track.id && status === "playing";
  const alsoOn = stationsForSong(track.id).filter((item) => item.slug !== channel.slug);
  const canonical = songPath(track);
  const aliases = track.aliases ?? [];
  const tags = track.tags ?? [];
  const playable = getPlayableTracks(channel);
  const hereIndex = playable.findIndex((item) => item.id === track.id);
  const more =
    hereIndex < 0
      ? playable.filter((item) => item.id !== track.id).slice(0, 8)
      : [...playable.slice(hereIndex + 1), ...playable.slice(0, hereIndex)].slice(0, 8);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Song</p>
      <div className="mt-6 flex gap-5">
        <CoverArt src={track.coverUrl || channel.cover} alt="" className="size-32 shrink-0 rounded-lg sm:size-40" motion="loop" />
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-semibold tracking-tight">{track.title}</h1>
          <p className="mt-2 text-muted">{track.artist}</p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">{formatClock(track.durationSec)}</p>
          {tags.length > 0 ? <SongTags tags={tags} /> : null}
          <TrackActions trackId={track.id} />
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2">
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
        <DownloadLink track={track} />
        <Link to="/channel/$slug" params={{ slug: channel.slug }} className="inline-flex h-12 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          {channel.name}
        </Link>
        <ShareLink path={sharePath} title={track.title} compact />
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
      {aliases.length > 0 || canonical ? (
        <FoldSection title="Addresses" hint="Links">
          <p className="break-all font-mono text-[11px] text-subtle">
            Player{" "}
            <a href={canonical} className="text-gold">
              {canonical}
            </a>
          </p>
          {aliases.length > 0 ? (
            <p className="mt-2 font-mono text-[11px] text-subtle">
              Short{" "}
              {aliases.map((alias, index) => (
                <span key={alias}>
                  {index ? " · " : ""}
                  <a href={aliasPath(alias)} className="text-gold">
                    /{alias}
                  </a>
                </span>
              ))}
            </p>
          ) : null}
        </FoldSection>
      ) : null}
      {more.length > 0 ? (
        <FoldSection title={`More on ${channel.name}`} hint="Open">
          <ol className="divide-y divide-line">
            {more.map((item, index) => (
              <li key={item.id} className="flex items-center gap-2 py-2">
                <span className="w-7 shrink-0 text-center font-mono text-[10px] tabular-nums text-subtle">
                  {String((hereIndex < 0 ? index : (hereIndex + 1 + index) % playable.length) + 1).padStart(2, "0")}
                </span>
                <Link to="/player/$id" params={{ id: songKey(item) }} className="min-w-0 flex-1 truncate text-sm">
                  {item.title}
                </Link>
                <span className="w-10 shrink-0 text-right font-mono text-[10px] tabular-nums text-subtle">
                  {formatClock(durationOf(item))}
                </span>
                <button
                  type="button"
                  onClick={() => void cueTrack(channel.slug, item.id)}
                  className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
                >
                  Play
                </button>
              </li>
            ))}
          </ol>
        </FoldSection>
      ) : null}
      <SongCopies trackId={track.id} />
      {isAdmin ? (
        <FoldSection title="Edit this song" hint="Edit" titleClassName="text-gold">
          <AdminTrackTools
            key={`${channel.slug}:${track.id}:${track.audioUrl}:${track.slug ?? ""}:${aliases.join(",")}:${(track.tags ?? []).join(",")}`}
            slug={channel.slug}
            track={track}
          />
        </FoldSection>
      ) : null}
      {isAdmin ? (
        <FoldSection title="Merge copies" hint="Open" titleClassName="text-gold">
          <AdminMergeBox trackId={track.id} />
        </FoldSection>
      ) : null}
    </div>
  );
}

function SongTags({ tags }: { tags: string[] }) {
  const [open, setOpen] = useState(false);
  const shown = open ? tags : tags.slice(0, 4);
  return (
    <ul className="mt-3 flex flex-wrap gap-1">
      {shown.map((tag) => (
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
      {tags.length > 4 ? (
        <li>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-8 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle"
          >
            {open ? "Less" : `+${tags.length - 4}`}
          </button>
        </li>
      ) : null}
    </ul>
  );
}
