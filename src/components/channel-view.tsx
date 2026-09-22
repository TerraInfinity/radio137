import { useEffect } from "react";
import { Navigate } from "@tanstack/react-router";
import { AdminStationEdit } from "@/components/admin-track-tools";
import { FoldSection } from "@/components/fold-section";
import { GlaumWordBooth } from "@/components/glaum-word-booth";
import { ClaimBooth } from "@/components/claim-booth";
import { ModePill } from "@/components/mode-pill";
import { NowPlayingCard } from "@/components/now-playing-card";
import { ShuffleToggle } from "@/components/shuffle-toggle";
import { ShareLink } from "@/components/share-link";
import { StationChat } from "@/components/station-chat";
import { StationPlaylist } from "@/components/station-playlist";
import { StationVisual } from "@/components/station-visual";
import { experienceForStation, experienceFromChannel } from "@/lib/experiences";
import { getPlayableTracks, kindHint, kindLabel, normalizeKind, stationSkin } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { isOnDemandOverlay, listenModeLabel } from "@/lib/listen-mode";
import { resolveLivePlayhead } from "@/lib/playback";
import { stationPath } from "@/lib/song-url";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel } from "@/lib/types";

export function ChannelView({ channel, sharePath }: { channel: Channel; sharePath?: string }) {
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const ready = usePlayerStore((s) => s.ready);
  const catalogReady = usePlayerStore((s) => s.catalogReady);
  const slug = usePlayerStore((s) => s.channelSlug);
  const track = usePlayerStore((s) => s.track);
  const lastTrackId = usePlayerStore((s) => s.lastTrackId);
  const status = usePlayerStore((s) => s.status);
  const glaumules = usePlayerStore((s) => s.glaumules);
  const listenMode = usePlayerStore((s) => s.listenModeSession ?? s.listenMode);
  const { isAdmin } = useRadioUser();
  const playable = getPlayableTracks(channel);
  const kind = normalizeKind(channel.kind || channel.mode);
  const live = kind === "live";
  const here = slug === channel.slug;
  const resume = lastTrackId ? playable.find((item) => item.id === lastTrackId) : undefined;
  const now = here && track
    ? track
    : resume
      ? resume
      : live && listenMode === "stream"
        ? resolveLivePlayhead(playable, Date.now(), channel.slug)?.track ?? playable[0]
        : playable[0];
  const skin = stationSkin(channel);
  const catalog = usePlayerStore((s) => s.catalog);
  const experience = experienceFromChannel(channel) ?? experienceForStation(channel.slug, catalog);
  const statusLabel = !channel.enabled ? "Off air" : playable.length === 0 ? "Empty desk" : here ? status : kindHint(kind);
  const tags = channel.tags ?? [];

  useEffect(() => {
    if (experience) return;
    if (!ready || !catalogReady || !channel.enabled || playable.length === 0) return;
    void tuneIn(channel.slug);
  }, [ready, catalogReady, channel.slug, channel.enabled, experience, playable.length, tuneIn]);

  if (experience) {
    return <Navigate to="/experiences/$slug" params={{ slug: experience.slug }} replace />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-52">
      <div className="overflow-hidden rounded-xl shadow-[var(--shadow-filigree)]">
        <StationVisual channel={channel} size="hero" className="aspect-[4/3] w-full sm:aspect-auto sm:h-64" />
      </div>
      <p className={cn("mt-6 font-mono text-[11px] uppercase tracking-[0.2em]", skin === "glaum" ? "glaum-kicker" : "text-gold")}>
        {channel.category}
        {tags[0] ? ` · ${tags[0]}` : ""}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className={cn("font-display text-4xl font-semibold tracking-tight", skin === "glaum" && "glaum-title")}>{channel.name}</h1>
        <ModePill kind={channel.kind} mode={channel.mode} enabled={channel.enabled} nsfw={channel.nsfw} />
      </div>
      <p className="mt-3 max-w-prose text-muted">{channel.description}</p>
      {skin === "glaum" ? <p className="glaum-sponsor mt-2 font-mono text-[10px] uppercase">Sponsored by Shrimp™</p> : null}
      {channel.glaumules ? (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-glaum">
          {glaumules} glåümules collected · tap the purple bubbles
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-2">
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
        <ShuffleToggle channel={channel} compact />
        <ShareLink path={sharePath || stationPath(channel)} title={channel.name} compact />
      </div>
      <div className="mt-8">
        <NowPlayingCard channel={channel} track={now ?? null} statusLabel={statusLabel} />
      </div>
      {skin === "glaum" ? <GlaumWordBooth nextPath={sharePath || stationPath(channel)} /> : null}
      <StationPlaylist channel={channel} />
      <StationChat slug={channel.slug} />
      <ClaimBooth channel={channel} />
      <FoldSection title="About this frequency" hint="Open">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
          Desk: {kindLabel(kind)} · You: {listenModeLabel(listenMode)}
          {isOnDemandOverlay(channel, listenMode) ? " · overlay" : ""}
        </p>
        <p className="mt-2 text-sm text-muted">{kindHint(kind)}</p>
        {tags.length > 1 ? (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{tags.join(" · ")}</p>
        ) : null}
      </FoldSection>
      {isAdmin ? (
        <FoldSection title="Station settings" hint="Edit" titleClassName="text-gold">
          <AdminStationEdit channel={channel} />
        </FoldSection>
      ) : null}
    </div>
  );
}
