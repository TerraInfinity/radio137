import { ChevronDown, ChevronUp, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { AutoplayLamp } from "@/components/autoplay-lamp";
import { CoverArt } from "@/components/cover-art";
import { ShuffleToggle } from "@/components/shuffle-toggle";
import { TrackActions } from "@/components/track-actions";
import { getChannel, stationSkin } from "@/lib/catalog";
import { cn, formatClock } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";

function VuMeter({ playing, skin }: { playing: boolean; skin: string }) {
  return (
    <div className={cn("vu-meter", playing && "vu-meter-on", skin === "glaum" && "vu-meter-glaum")} aria-hidden>
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} style={{ animationDelay: `${i * 0.07}s` }} />
      ))}
    </div>
  );
}

export function MiniPlayer() {
  const track = usePlayerStore((s) => s.track);
  const status = usePlayerStore((s) => s.status);
  const slug = usePlayerStore((s) => s.channelSlug);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const collapsed = usePlayerStore((s) => s.playerCollapsed);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const seek = usePlayerStore((s) => s.seek);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const setPlayerCollapsed = usePlayerStore((s) => s.setPlayerCollapsed);
  const skipAllowed = usePlayerStore((s) => s.skipAllowed);
  const channel = slug ? getChannel(slug) : undefined;
  if (!track || !channel) return null;
  const playing = status === "playing";
  const canSkip = skipAllowed(channel.slug);
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const skin = stationSkin(channel);
  const remaining = Math.max(0, duration - currentTime);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm",
        skin === "glaum" && "player-shell-glaum",
        skin === "waheguru" && "player-shell-wahe",
      )}
    >
      <div className="h-0.5 bg-line">
        <div
          className={cn("h-full bg-ember", skin === "glaum" && "player-bar-glaum", skin === "waheguru" && "player-bar-wahe")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-2">
        <div className="flex items-center gap-3">
          <CoverArt src={track.coverUrl || channel.cover} alt="" className={cn("shrink-0 rounded-md", collapsed ? "size-11" : "size-14")} />
          <div className="min-w-0 flex-1">
            <p className={cn("truncate font-display leading-none", collapsed ? "text-lg" : "text-xl", skin === "glaum" && "glaum-title")}>{track.title}</p>
            <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
              {track.artist ? `${track.artist} · ` : ""}
              {channel.name}
              {" · "}
              {formatClock(currentTime)} / {formatClock(duration)}
            </p>
          </div>
          <AutoplayLamp />
          {channel ? <ShuffleToggle channel={channel} compact /> : null}
          <button
            type="button"
            disabled={!canSkip}
            onClick={() => void prev()}
            className={cn("hidden size-11 place-items-center text-gold sm:grid", !canSkip && "opacity-40")}
            aria-label="Previous"
          >
            <SkipBack className="size-5" />
          </button>
          <button type="button" onClick={() => void togglePlay()} className="grid size-11 place-items-center text-gold" aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause className="size-5" /> : <Play className="size-5 ml-0.5" />}
          </button>
          <button
            type="button"
            disabled={!canSkip}
            onClick={() => void next("user")}
            className={cn("grid size-11 place-items-center text-gold", !canSkip && "opacity-40")}
            aria-label="Skip"
          >
            <SkipForward className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setPlayerCollapsed(!collapsed)}
            className="grid size-11 place-items-center text-subtle"
            aria-label={collapsed ? "Expand player" : "Collapse player"}
          >
            {collapsed ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
          </button>
        </div>
        {!collapsed ? (
          <div className="mt-2 space-y-2">
            <VuMeter playing={playing} skin={skin} />
            <label className="flex items-center gap-3">
              <span className="w-10 shrink-0 font-mono text-[10px] tabular-nums text-subtle">{formatClock(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={Math.max(1, duration)}
                step={0.25}
                value={Math.min(currentTime, duration || 0)}
                disabled={!canSkip}
                onChange={(event) => seek(Number(event.target.value))}
                className="h-11 w-full"
                aria-label="Seek"
              />
              <span className="w-10 shrink-0 text-right font-mono text-[10px] tabular-nums text-subtle">-{formatClock(remaining)}</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex min-w-40 flex-1 items-center gap-2">
                <Volume2 className="size-4 text-subtle" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  className="h-11 w-full"
                  aria-label="Volume"
                />
              </label>
              <TrackActions trackId={track.id} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
