import { Link } from "@tanstack/react-router";
import { CoverArt } from "@/components/cover-art";
import { TrackActions } from "@/components/track-actions";
import { UnallocateControl } from "@/components/unallocate-control";
import { isAdultTrack, isChannelNsfw, kindLabel, normalizeKind } from "@/lib/catalog";
import { isOnDemandOverlay, listenModeLabel } from "@/lib/listen-mode";
import { songKey } from "@/lib/song-url";
import { usePlayerStore } from "@/lib/player-store";
import { useRadioUser } from "@/lib/radio-user";
import { HeroArtSheet } from "@/components/hero-art-sheet";
import { useState } from "react";
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
  const lockedCut = Boolean(track && isAdultTrack(track) && !isChannelNsfw(channel));
  const overlay = isOnDemandOverlay(channel, listenMode) && slug === channel.slug;
  if (!track || lockedCut) {
    return (
      <section className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Now playing</p>
        <p className="mt-3 font-display text-xl text-fg">{lockedCut ? "Locked cut" : statusLabel}</p>
      </section>
    );
  }
  return (
    <section className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ember">Now playing</p>
      <button
        type="button"
        onClick={() => isAdmin && setArtOpen(true)}
        className="mt-3 block w-full overflow-hidden rounded-lg"
        aria-label={isAdmin ? "Replace this cut’s art" : track.title}
      >
        <CoverArt src={track.coverUrl || channel.cover} alt="" className="aspect-square w-full max-h-80 object-cover" motion="loop" />
      </button>
      <div className="mt-4 min-w-0">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
          <Link to="/player/$id" params={{ id: songKey(track) }}>
            {track.title}
          </Link>
        </h2>
        <p className="mt-1 text-muted">{track.artist}</p>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
          Desk: {kindLabel(normalizeKind(channel.kind || channel.mode))} · You: {listenModeLabel(listenMode)}
        </p>
        <TrackActions trackId={track.id} />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {overlay ? (
            <button type="button" onClick={() => void jumpToLive()} className="inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              Jump to live
            </button>
          ) : null}
          <UnallocateControl channel={channel} track={track} />
        </div>
      </div>
      {isAdmin ? <HeroArtSheet channel={channel} track={track} open={artOpen} onClose={() => setArtOpen(false)} /> : null}
    </section>
  );
}