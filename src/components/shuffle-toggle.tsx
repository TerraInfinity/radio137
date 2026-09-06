import { Shuffle } from "lucide-react";
import { normalizeShuffle, shuffleActive, shuffleHint, shuffleLabel } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel } from "@/lib/types";

export function ShuffleToggle({ channel, compact = false }: { channel: Channel; compact?: boolean }) {
  const slug = usePlayerStore((s) => s.channelSlug);
  const shuffleBySlug = usePlayerStore((s) => s.shuffleBySlug);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const mode = normalizeShuffle(channel.shuffle);
  const mixing = shuffleActive(channel, Boolean(shuffleBySlug[channel.slug]));
  const locked = mode === "off" || mode === "on";

  if (compact) {
    return (
      <button
        type="button"
        disabled={locked}
        onClick={() => toggleShuffle(channel.slug)}
        aria-pressed={mixing}
        title={locked ? shuffleHint(mode) : mixing ? "Shuffle on — next cut is mixed" : "Shuffle off — playlist order"}
        className={cn("inline-flex h-11 shrink-0 items-center gap-2 px-2 font-mono text-[11px] uppercase tracking-[0.14em]", locked && "opacity-60")}
      >
        <Shuffle className={cn("size-4", mixing ? "text-gold" : "text-subtle")} />
        <span className={cn(mixing ? "text-gold" : "text-subtle")}>{mixing ? "Mix" : "Order"}</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Listening order</p>
      <p className="mt-1 text-sm text-muted">{shuffleHint(mode)}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={mode === "on"}
          onClick={() => {
            if (mixing) toggleShuffle(channel.slug);
          }}
          className={cn(
            "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]",
            !mixing ? "bg-fg text-bg" : "text-gold",
            mode === "on" && "opacity-50",
          )}
        >
          Playlist order
        </button>
        <button
          type="button"
          disabled={mode === "off"}
          onClick={() => {
            if (!mixing) toggleShuffle(channel.slug);
          }}
          className={cn(
            "inline-flex h-11 items-center gap-2 px-3 font-mono text-[11px] uppercase tracking-[0.14em]",
            mixing ? "bg-fg text-bg" : "text-gold",
            mode === "off" && "opacity-50",
          )}
        >
          <Shuffle className="size-3.5" />
          Shuffle
        </button>
      </div>
      {slug === channel.slug ? (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
          {mixing ? "Next cut is mixed." : "Next cut follows the list."} {locked ? `Desk lock: ${shuffleLabel(mode)}.` : ""}
        </p>
      ) : null}
    </div>
  );
}
