import { kindLabel, normalizeKind } from "@/lib/catalog";
import { cn } from "@/lib/cn";

export function ModePill({
  kind,
  mode,
  enabled = true,
  nsfw = false,
}: {
  kind: string;
  mode?: string;
  enabled?: boolean;
  nsfw?: boolean;
}) {
  if (nsfw || !enabled) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
        <span className="lamp" />
        {nsfw ? "18+" : "Off air"}
      </span>
    );
  }
  const k = normalizeKind(kind || mode);
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-gold">
      <span className={cn("lamp", k === "live" ? "lamp-live" : "")} />
      {kindLabel(k)}
    </span>
  );
}
