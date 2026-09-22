import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { isLoopingVisual, mediaUrl } from "@/lib/media";

export function CoverArt({
  src,
  alt,
  className,
  motion = "still",
  poster,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  motion?: "still" | "loop";
  poster?: string | null;
}) {
  const resolved = mediaUrl(src);
  const posterSrc = mediaUrl(poster);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [resolved]);
  if (!resolved) return <div className={cn("bg-bg-elevated", className)} aria-hidden />;
  const looping = isLoopingVisual(resolved);
  if (looping && !failed) {
    return (
      <video
        src={resolved}
        poster={posterSrc && !isLoopingVisual(posterSrc) ? posterSrc : undefined}
        className={cn("h-full w-full object-cover", className)}
        muted
        loop
        playsInline
        autoPlay
        preload={motion === "loop" ? "auto" : "metadata"}
        aria-label={alt || undefined}
        onError={() => setFailed(true)}
      />
    );
  }
  const still = failed ? posterSrc : resolved;
  if (!still || isLoopingVisual(still)) {
    return <div className={cn("bg-bg-elevated", className)} aria-hidden />;
  }
  return <img src={still} alt={alt} loading="lazy" decoding="async" className={cn("h-full w-full object-cover", className)} />;
}