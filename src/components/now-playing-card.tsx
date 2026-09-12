import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Pencil, Radio } from "lucide-react";
import { RenameCutForm } from "@/components/admin-rename";
import { CoverArt } from "@/components/cover-art";
import { HeroArtSheet } from "@/components/hero-art-sheet";
import { MarqueeTitle } from "@/components/marquee-title";
import { UnallocateControl } from "@/components/unallocate-control";
import { AdminTrackTools } from "@/components/admin-track-tools";
import { isAdultTrack, isChannelNsfw } from "@/lib/catalog";
import { isOnDemandOverlay } from "@/lib/listen-mode";
import { visualSrc } from "@/lib/media";
import { songKey } from "@/lib/song-url";
import { usePlayerStore } from "@/lib/player-store";
import { useRadioUser } from "@/lib/radio-user";
import type { Channel, Track } from "@/lib/types";

export function NowPlayingCard({
  channel,
  track,
  statusLabel,
}: {
  channel: Channel;
  track: Track | null;
  statusLabel: string;
}) {
  const listenMode = usePlayerStore((s) => s.listenModeSession ?? s.listenMode);
  const jumpToLive = usePlayerStore((s) => s.jumpToLive);
  const slug = usePlayerStore((s) => s.channelSlug);
  const { isAdmin } = useRadioUser();
  const [artOpen, setArtOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const lockedCut = Boolean(track && isAdultTrack(track) && !isChannelNsfw(channel));
  const overlay = isOnDemandOverlay(channel, listenMode) && slug === channel.slug;

  useEffect(() => {
    setRenaming(false);
  }, [track?.id]);

  if (!track || lockedCut) {
    return (
      <section className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Now playing</p>
        <p className="mt-3 font-display text-xl text-fg">{lockedCut ? "Locked song" : statusLabel}</p>
      </section>
    );
  }
  return (
    <section className="flex gap-3 rounded-xl bg-bg-elevated p-3 shadow-[var(--shadow-filigree)] sm:p-4">
      <button
        type="button"
        onClick={() => isAdmin && setArtOpen(true)}
        className="size-20 shrink-0 overflow-hidden rounded-md sm:size-24"
        aria-label={isAdmin ? "Replace this song’s art" : track.title}
      >
        <CoverArt src={visualSrc(track, channel)} alt="" className="size-full" motion="loop" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ember">Now playing</p>
        <h2 className="mt-1 min-w-0 wrap-normal font-display text-xl font-semibold tracking-tight text-fg sm:text-2xl">
          {isAdmin && renaming ? (
            <RenameCutForm slug={channel.slug} track={track} appearance="title" onClose={() => setRenaming(false)} />
          ) : (
            <Link to="/player/$id" params={{ id: songKey(track) }} className="block min-w-0">
              <MarqueeTitle text={track.title} />
            </Link>
          )}
        </h2>
        <p className="mt-0.5 truncate text-sm text-muted">{track.artist}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {overlay ? (
            <button
              type="button"
              onClick={() => void jumpToLive()}
              className="inline-flex h-11 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
            >
              <Radio className="size-3.5" />
              Jump to live
            </button>
          ) : null}
          <UnallocateControl channel={channel} track={track} />
          {isAdmin ? <AdminTrackTools slug={channel.slug} track={track} compact /> : null}
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setRenaming((value) => !value)}
              aria-expanded={renaming}
              className="inline-flex h-11 items-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
            >
              <Pencil className="size-3.5" />
              Rename
            </button>
          ) : null}
        </div>
      </div>
      {isAdmin ? <HeroArtSheet channel={channel} track={track} open={artOpen} onClose={() => setArtOpen(false)} /> : null}
    </section>
  );
}
