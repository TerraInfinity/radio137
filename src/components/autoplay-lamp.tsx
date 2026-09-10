import { cn } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";

export function AutoplayLamp({ label = "Auto", compact = false }: { label?: string; compact?: boolean }) {
  const autoplay = usePlayerStore((s) => s.autoplay);
  const setAutoplay = usePlayerStore((s) => s.setAutoplay);
  return (
    <button
      type="button"
      onClick={() => setAutoplay(!autoplay)}
      aria-pressed={autoplay}
      title={autoplay ? "Autoplay on — this station keeps going" : "Autoplay off — this cut, then stop"}
      className="inline-flex h-11 shrink-0 items-center gap-2 px-1.5 font-mono text-[11px] uppercase tracking-[0.14em] sm:px-2"
    >
      <span className="lamp-bezel">
        <span className={cn("lamp", autoplay && "lamp-live")} />
      </span>
      <span className={cn(compact ? "hidden sm:inline" : "", autoplay ? "lamp-on" : "text-subtle")}>{label}</span>
    </button>
  );
}
