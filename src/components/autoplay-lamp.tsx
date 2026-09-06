import { cn } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";

export function AutoplayLamp({ label = "Auto" }: { label?: string }) {
  const autoplay = usePlayerStore((s) => s.autoplay);
  const setAutoplay = usePlayerStore((s) => s.setAutoplay);
  return (
    <button
      type="button"
      onClick={() => setAutoplay(!autoplay)}
      aria-pressed={autoplay}
      title={autoplay ? "Autoplay on — next cut starts itself" : "Autoplay off"}
      className="inline-flex h-11 shrink-0 items-center gap-2 px-2 font-mono text-[11px] uppercase tracking-[0.14em]"
    >
      <span className="lamp-bezel">
        <span className={cn("lamp", autoplay && "lamp-live")} />
      </span>
      <span className={cn(autoplay ? "lamp-on" : "text-subtle")}>{label}</span>
    </button>
  );
}
