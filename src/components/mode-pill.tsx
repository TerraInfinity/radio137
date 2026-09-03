import { cn } from "@/lib/cn";
import type { ChannelKind, ChannelMode } from "@/lib/types";

export function ModePill({
  mode,
  kind,
  enabled,
  nsfw = false,
}: {
  mode: ChannelMode;
  kind?: ChannelKind;
  enabled: boolean;
  nsfw?: boolean;
}) {
  const label = !enabled
    ? "Off air"
    : kind === "experience"
      ? "Experience"
      : kind === "fixed"
        ? "Fixed"
        : kind === "on-demand" || mode === "on-demand"
          ? "On demand"
          : "Live";
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={cn(
          "inline-flex h-7 items-center rounded-full px-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em]",
          !enabled && "bg-bg-subtle text-muted ring-1 ring-line",
          enabled && label === "Live" && "bg-ember/15 text-ember ring-1 ring-ember/40",
          enabled && label === "On demand" && "bg-cyan/10 text-cyan ring-1 ring-cyan/35",
          enabled && label === "Fixed" && "bg-gold/10 text-gold ring-1 ring-gold/35",
          enabled && label === "Experience" && "bg-gold/15 text-gold ring-1 ring-gold/40",
        )}
      >
        {label}
      </span>
      {nsfw ? (
        <span className="inline-flex h-7 items-center rounded-full px-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-gold ring-1 ring-gold/40">
          18+
        </span>
      ) : null}
    </div>
  );
}
