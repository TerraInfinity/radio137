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
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {(["ondemand", "stream"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setListenMode(mode)}
            aria-pressed={listenMode === mode}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-md font-mono text-[11px] uppercase tracking-[0.14em]",
              listenMode === mode ? "bg-fg text-bg" : "text-gold shadow-[var(--shadow-border)]",
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
  return (
    <div className="grid gap-2">
      {(["ondemand", "stream"] as const).map((mode) => {
        const on = listenMode === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => setListenMode(mode)}
            aria-pressed={on}
            className={cn("listen-card text-left", on && "listen-card-on")}
          >
            <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
              <span className="lamp-bezel">
                <span className={cn("lamp", on && mode === "stream" && "lamp-live")} />
              </span>
              <span className={on ? "text-fg" : "text-gold"}>{listenModeLabel(mode)}</span>
            </span>
            <span className="mt-1.5 block text-sm leading-snug text-muted">{listenModeHint(mode)}</span>
          </button>
        );
      })}
    </div>
  );
}
