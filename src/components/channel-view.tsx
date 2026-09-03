import { AdminStationEdit } from "@/components/admin-track-tools";
import { ClaimBooth } from "@/components/claim-booth";
import { ModePill } from "@/components/mode-pill";
import { NowPlayingCard } from "@/components/now-playing-card";
import { StationVisual } from "@/components/station-visual";
import { UpcomingList } from "@/components/upcoming-list";
import { getPlayableTracks, kindHint, normalizeKind, stationSkin } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { liveCursor } from "@/lib/playback";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel } from "@/lib/types";

export function ChannelView({ channel }: { channel: Channel }) {
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const slug = usePlayerStore((s) => s.channelSlug);
  const track = usePlayerStore((s) => s.track);
  const status = usePlayerStore((s) => s.status);
  const playable = getPlayableTracks(channel);
  const kind = normalizeKind(channel.kind || channel.mode);
  const live = kind === "live";
  const here = slug === channel.slug;
  const now = here ? track : live ? liveCursor(playable, Date.now(), channel.slug)?.track ?? playable[0] : playable[0];
  const upcoming = playable.filter((item) => item.id !== now?.id);
  const skin = stationSkin(channel);
  const statusLabel = !channel.enabled ? "Off air" : playable.length === 0 ? "Empty desk" : here ? status : kindHint(kind);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-44">
      <div className="overflow-hidden rounded-xl shadow-[var(--shadow-filigree)]">
        <StationVisual channel={channel} size="hero" className="aspect-[4/3] w-full sm:aspect-auto sm:h-64" />
      </div>
      <p className={cn("mt-6 font-mono text-[11px] uppercase tracking-[0.2em]", skin === "glaum" ? "glaum-kicker" : "text-gold")}>
        {channel.category} · {channel.tags.join(" · ")}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className={cn("font-display text-4xl font-semibold tracking-tight", skin === "glaum" && "glaum-title")}>{channel.name}</h1>
        <ModePill kind={channel.kind} mode={channel.mode} enabled={channel.enabled} nsfw={channel.nsfw} />
      </div>
      <p className="mt-3 max-w-prose text-muted">{channel.description}</p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">{kindHint(kind)}</p>
      <div className="mt-4">
        <button
          type="button"
          onClick={() => void tuneIn(channel.slug, { forcePlay: true })}
          className="inline-flex h-12 min-w-36 items-center justify-center rounded-md bg-fg px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-bg"
        >
          Tune in
        </button>
      </div>
      <div className="mt-8">
        <NowPlayingCard channel={channel} track={now ?? null} statusLabel={statusLabel} />
      </div>
      <UpcomingList slug={channel.slug} upcoming={upcoming} live={live} cover={channel.cover} />
      <ClaimBooth channel={channel} />
      <AdminStationEdit channel={channel} />
    </div>
  );
}
