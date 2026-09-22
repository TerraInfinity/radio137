import { Link } from "@tanstack/react-router";
import { ModePill } from "@/components/mode-pill";
import { StationVisual } from "@/components/station-visual";
import { getPlayableTracks, isChannelNsfw, kindHint, stationSkin } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { experienceFromChannel } from "@/lib/experiences";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel } from "@/lib/types";

export function ChannelCard({ channel }: { channel: Channel }) {
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const locked = isChannelNsfw(channel) || !channel.enabled;
  const playable = getPlayableTracks(channel);
  const skin = stationSkin(channel);
  const experience = experienceFromChannel(channel);
  const open = experience
    ? { to: "/experiences/$slug" as const, slug: experience.slug }
    : { to: "/channel/$slug" as const, slug: channel.slug };
  return (
    <article className={cn("overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-filigree)]", skin === "glaum" && "skin-glaum", locked && "opacity-60")}>
      <Link to={open.to} params={{ slug: open.slug }} className="block">
        <StationVisual channel={channel} className="aspect-[4/3] w-full" />
      </Link>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className={cn("min-w-0 truncate font-display text-xl font-semibold", skin === "glaum" && "glaum-title")}>
            <Link to={open.to} params={{ slug: open.slug }}>
              {channel.name}
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
            onClick={() => void tuneIn(channel.slug, { forcePlay: true })}
            className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-60"
          >
            Play
          </button>
          <Link to={open.to} params={{ slug: open.slug }} className="inline-flex h-11 items-center px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
            Open
          </Link>
        </div>
      </div>
    </article>
  );
}
