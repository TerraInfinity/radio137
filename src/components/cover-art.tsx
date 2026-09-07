import { cn } from "@/lib/cn";
import { isLoopingVisual, mediaUrl } from "@/lib/media";

export function CoverArt({
  src,
  alt,
  className,
  motion = "still",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  motion?: "still" | "loop";
}) {
  const resolved = mediaUrl(src);
  if (!resolved) return <div className={cn("bg-bg-elevated", className)} aria-hidden />;
  const looping = isLoopingVisual(resolved);
  if (looping && motion !== "loop") {
    return (
      <div className={cn("relative bg-bg-elevated", className)} aria-hidden>
        <span className="absolute inset-0 grid place-items-center font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Loop</span>
      </div>
    );
  }
  if (looping) {
    return (
      <video
        src={resolved}
        className={cn("h-full w-full object-cover", className)}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-label={alt || undefined}
      />
    );
  }
  return <img src={resolved} alt={alt} className={cn("h-full w-full object-cover", className)} />;
}
