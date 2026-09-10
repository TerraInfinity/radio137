import { cn } from "@/lib/cn";
import { listenModeHint, listenModeLabel, type ListenMode } from "@/lib/listen-mode";
import { usePlayerStore } from "@/lib/player-store";

export function ListenModeLamp({ compact = false }: { compact?: boolean }) {
  const listenMode = usePlayerStore((s) => s.listenModeSession ?? s.listenMode);
  const setListenMode = usePlayerStore((s) => s.setListenMode);
  const next: ListenMode = listenMode === "stream" ? "ondemand" : "stream";
  const streaming = listenMode === "stream";
  return (
    <button
      type="button"
      onClick={() => setListenMode(next)}
      aria-pressed={streaming}
      title={listenModeHint(listenMode)}
      className="inline-flex h-11 shrink-0 items-center gap-2 px-1.5 font-mono text-[11px] uppercase tracking-[0.14em] sm:px-2"
    >
      <span className="lamp-bezel">
        <span className={cn("lamp", streaming && "lamp-live")} />
      </span>
      <span className={cn(streaming ? "lamp-on" : "text-subtle")}>
        {compact ? (streaming ? "Stream" : "Demand") : listenModeLabel(listenMode)}
      </span>
    </button>
  );
}

export function ListenModePicker({ compact = false }: { compact?: boolean }) {
  const listenMode = usePlayerStore((s) => s.listenModeSession ?? s.listenMode);
  const setListenMode = usePlayerStore((s) => s.setListenMode);
  if (compact) {
    return <ListenModeLamp compact />;
  }
  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      {(["ondemand", "stream"] as const).map((mode) => {
        const on = listenMode === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => setListenMode(mode)}
            aria-pressed={on}
            className="inline-flex h-11 items-center gap-2 px-2 font-mono text-[11px] uppercase tracking-[0.14em]"
          >
            <span className="lamp-bezel">
              <span className={cn("lamp", on && mode === "stream" && "lamp-live")} />
            </span>
            <span className={on ? "lamp-on" : "text-subtle"}>{listenModeLabel(mode)}</span>
          </button>
        );
      })}
    </div>
  );
}
