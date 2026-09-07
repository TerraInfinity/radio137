import { useEffect } from "react";
import { AdminStationEdit } from "@/components/admin-track-tools";
import { ClaimBooth } from "@/components/claim-booth";
import { ModePill } from "@/components/mode-pill";
import { NowPlayingCard } from "@/components/now-playing-card";
import { ShuffleToggle } from "@/components/shuffle-toggle";
import { ShareLink } from "@/components/share-link";
import { StationChat } from "@/components/station-chat";
import { StationPlaylist } from "@/components/station-playlist";
import { StationVisual } from "@/components/station-visual";
import { getPlayableTracks, kindHint, normalizeKind, stationSkin } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { resolveLivePlayhead } from "@/lib/playback";
import { stationPath } from "@/lib/song-url";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel } from "@/lib/types";

export function ChannelView({ channel, sharePath }: { channel: Channel; sharePath?: string }) {
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const ready = usePlayerStore((s) => s.ready);
  const slug = usePlayerStore((s) => s.channelSlug);
  const track = usePlayerStore((s) => s.track);
  const status = usePlayerStore((s) => s.status);
  const glaumules = usePlayerStore((s) => s.glaumules);
  const playable = getPlayableTracks(channel);
  const kind = normalizeKind(channel.kind || channel.mode);
  const live = kind === "live";
  const here = slug === channel.slug;
  const now = here ? track : live ? resolveLivePlayhead(playable, Date.now(), channel.slug)?.track ?? playable[0] : playable[0];
  const skin = stationSkin(channel);
  const statusLabel = !channel.enabled ? "Off air" : playable.length === 0 ? "Empty desk" : here ? status : kindHint(kind);

  useEffect(() => {
    if (!ready || !channel.enabled || playable.length === 0) return;
    void tuneIn(channel.slug, { forcePlay: true });
  }, [ready, channel.slug, channel.enabled, playable.length, tuneIn]);

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
      {skin === "glaum" ? <p className="glaum-sponsor mt-2 font-mono text-[10px] uppercase">Sponsored by Shrimp™</p> : null}
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">{kindHint(kind)}</p>
      {channel.glaumules ? (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-glaum">
          {glaumules} glåümules collected · tap the purple bubbles
        </p>
      ) : null}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => void tuneIn(channel.slug, { forcePlay: true })}
          className={cn(
            "inline-flex h-12 min-w-36 items-center justify-center rounded-md bg-fg px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-bg",
            skin === "glaum" && "btn-glaum",
          )}
        >
          Tune in
        </button>
      </div>
      <div className="mt-4">
        <ShareLink path={sharePath || stationPath(channel)} title={channel.name} />
      </div>
      <div className="mt-6">
        <ShuffleToggle channel={channel} />
      </div>
      <div className="mt-8">
        <NowPlayingCard channel={channel} track={now ?? null} statusLabel={statusLabel} />
      </div>
      <StationPlaylist channel={channel} />
      <StationChat slug={channel.slug} />
      <ClaimBooth channel={channel} />
      <AdminStationEdit channel={channel} />
    </div>
  );
}
