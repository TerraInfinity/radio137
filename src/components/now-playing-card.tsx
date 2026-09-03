import { Link } from "@tanstack/react-router";
import { AdminTrackTools } from "@/components/admin-track-tools";
import { CoverArt } from "@/components/cover-art";
import { isAdultTrack, isChannelNsfw } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { Channel, Track } from "@/lib/types";

export function NowPlayingCard({
  channel,
  track,
  statusLabel,
  driving = false,
  held = false,
}: {
  channel: Channel;
  track: Track | null;
  statusLabel: string;
  driving?: boolean;
  held?: boolean;
}) {
  const lockedCut = Boolean(track && isAdultTrack(track) && !isChannelNsfw(channel));
  if (!track || lockedCut) {
    return (
      <section className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Now playing</p>
        <p className="mt-3 font-display text-xl text-fg">{lockedCut ? "Locked cut" : statusLabel}</p>
      </section>
    );
  }

  return (
    <section className={cn("rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]", (driving || held) && "booth-live")}>
      <p className={cn("font-mono text-[10px] uppercase tracking-[0.18em]", driving || held ? "text-buzz" : "text-ember")}>
        {driving ? "Driving" : held ? "DJ held" : "Now playing"}
      </p>
      <div className="mt-3 flex gap-4">
        <CoverArt src={track.coverUrl || channel.cover} alt="" className="size-24 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            <Link to="/player/$id" params={{ id: track.id }}>
              {track.title}
            </Link>
          </h2>
          <p className="mt-1 text-muted">{track.artist}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">{channel.name}</p>
        </div>
      </div>
      <AdminTrackTools slug={channel.slug} track={track} />
    </section>
  );
}
