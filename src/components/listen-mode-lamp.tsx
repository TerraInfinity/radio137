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
      className={cn(
        "inline-flex h-11 shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em]",
        compact ? "px-1.5" : "px-2",
      )}
    >
      <span className="lamp-bezel">
        <span className={cn("lamp", streaming && "lamp-live")} />
      </span>
      <span className={cn(streaming ? "lamp-on" : "text-subtle")}>{listenModeLabel(listenMode)}</span>
    </button>
  );
}

export function ListenModePicker({ compact = false }: { compact?: boolean }) {
  const listenMode = usePlayerStore((s) => s.listenModeSession ?? s.listenMode);
  const setListenMode = usePlayerStore((s) => s.setListenMode);
  return (
    <div className={cn("flex flex-wrap justify-center gap-2", compact && "justify-start")}>
      {(["ondemand", "stream"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => setListenMode(mode)}
          aria-pressed={listenMode === mode}
          className={cn(
            "inline-flex h-11 items-center gap-2 px-3 font-mono text-[11px] uppercase tracking-[0.14em]",
            listenMode === mode ? "bg-fg text-bg" : "text-gold",
          )}
        >
          <span className="lamp-bezel">
            <span className={cn("lamp", listenMode === mode && mode === "stream" && "lamp-live")} />
          </span>
          {listenModeLabel(mode)}
        </button>
      ))}
    </div>
  );
}
