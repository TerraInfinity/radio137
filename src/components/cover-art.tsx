import { cn } from "@/lib/cn";

function isLoopingVisual(src?: string | null): boolean {
  if (!src) return false;
  const path = src.split("?")[0].toLowerCase();
  return /\.(mp4|webm|mov)$/.test(path);
}

export function CoverArt({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  if (!src) return <div className={cn("bg-bg-elevated", className)} aria-hidden />;
  if (isLoopingVisual(src)) {
    return (
      <video
        src={src}
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
  return <img src={src} alt={alt} className={cn("h-full w-full object-cover", className)} />;
}
