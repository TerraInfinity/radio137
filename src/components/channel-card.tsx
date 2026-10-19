import { Link } from "@tanstack/react-router";
import { BambiMark } from "@/components/bambi-mark";
import { ModePill } from "@/components/mode-pill";
import { StationVisual } from "@/components/station-visual";
import { getPlayableTracks, isChannelNsfw, kindHint, stationSkin } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { experienceFromChannel } from "@/lib/experiences";
import { Pause, Play } from "lucide-react";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel } from "@/lib/types";

export function ChannelCard({ channel }: { channel: Channel }) {
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const channelSlug = usePlayerStore((s) => s.channelSlug);
  const status = usePlayerStore((s) => s.status);
  const currentTrack = usePlayerStore((s) => s.track);
  const isCurrent = Boolean(currentTrack) && channelSlug === channel.slug;
  const isPlaying = isCurrent && status === "playing";
  const locked = isChannelNsfw(channel) || !channel.enabled;
  const playable = getPlayableTracks(channel);
  const skin = stationSkin(channel);
  const experience = experienceFromChannel(channel);
  return (
    <article className={cn("overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-filigree)]", skin === "glaum" && "skin-glaum", locked && "opacity-60")}>
      <Link to="/channel/$slug" params={{ slug: channel.slug }} className="block">
        <StationVisual channel={channel} className="aspect-[4/3] w-full" />
      </Link>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className={cn("min-w-0 truncate font-display text-xl font-semibold", skin === "glaum" && "glaum-title")}>
            <Link to="/channel/$slug" params={{ slug: channel.slug }}>
              <BambiMark name={channel.name} />
            </Link>
          </h2>
          <ModePill kind={channel.kind} mode={channel.mode} enabled={channel.enabled} nsfw={channel.nsfw} />
        </div>
        <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
          {channel.energy} · {kindHint(channel.kind)}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{channel.description}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={locked || playable.length === 0}
            onClick={() => void (isCurrent ? togglePlay() : tuneIn(channel.slug, { forcePlay: true }))}
            aria-label={isCurrent ? `${isPlaying ? "Pause" : "Play"} ${channel.name}` : `Play ${channel.name}`}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-60"
          >
            {isCurrent && isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {isCurrent ? (isPlaying ? "Pause" : "Play") : "Play"}
          </button>
          {isCurrent ? <span className="inline-flex h-11 items-center text-xs text-gold" aria-live="off">{isPlaying ? "Playing now" : "Paused"}</span> : null}
          <Link to="/channel/$slug" params={{ slug: channel.slug }} className="inline-flex h-11 items-center px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
            Open
          </Link>
          {experience ? (
            <Link to="/experiences/$slug" params={{ slug: experience.slug }} className="inline-flex h-11 items-center px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              Experience
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
