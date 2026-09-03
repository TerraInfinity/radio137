import { cn } from "@/lib/cn";
import { resolveMediaUrl } from "@/lib/media";

export function CoverArt({
  src,
  alt,
  className,
  dimmed = false,
}: {
  src: string;
  alt: string;
  className?: string;
  dimmed?: boolean;
}) {
  const url = resolveMediaUrl(src);
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-bg-subtle shadow-[var(--shadow-border)]",
        dimmed && "opacity-55 grayscale",
        className,
      )}
    >
      {url ? (
        <img
          src={url}
          alt={alt}
          className="size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
        />
      ) : (
        <div className="size-full bg-[radial-gradient(circle_at_30%_20%,#2a2118,transparent_55%),linear-gradient(180deg,#1b1714,#070605)]" />
      )}
    </div>
  );
}
