import { ChevronDown, ChevronUp, Pause, Play, SkipForward } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { getChannel } from "@/lib/catalog";
import { cn, formatClock } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";

export function MiniPlayer() {
  const track = usePlayerStore((s) => s.track);
  const status = usePlayerStore((s) => s.status);
  const slug = usePlayerStore((s) => s.channelSlug);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const collapsed = usePlayerStore((s) => s.playerCollapsed);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const setPlayerCollapsed = usePlayerStore((s) => s.setPlayerCollapsed);
  const skipAllowed = usePlayerStore((s) => s.skipAllowed);
  const channel = slug ? getChannel(slug) : undefined;
  if (!track || !channel) return null;
  const playing = status === "playing";
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
      <div className="h-0.5 bg-line">
        <div className="h-full bg-ember" style={{ width: `${pct}%` }} />
      </div>
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        <CoverArt src={track.coverUrl || channel.cover} alt="" className="size-11 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg leading-none">{track.title}</p>
          {!collapsed ? (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
              {channel.name} · {formatClock(currentTime)} / {formatClock(duration)}
            </p>
          ) : null}
        </div>
        <button type="button" onClick={() => void togglePlay()} className="grid size-11 place-items-center text-gold" aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
        </button>
        <button
          type="button"
          disabled={!skipAllowed(channel.slug)}
          onClick={() => void next("user")}
          className={cn("grid size-11 place-items-center text-gold", !skipAllowed(channel.slug) && "opacity-40")}
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
    </div>
  );
}
