import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { isLoopingVisual, mediaUrl } from "@/lib/media";

export function CoverArt({
  src,
  alt,
  className,
  motion = "still",
  poster,
  fit = "contain",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  motion?: "still" | "loop";
  poster?: string | null;
  fit?: "contain" | "cover";
}) {
  const resolved = mediaUrl(src);
  const posterSrc = mediaUrl(poster);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [resolved]);
  if (!resolved) return <div className={cn("cover-art", fit === "cover" && "is-cover", className)} aria-hidden />;
  const frame = cn("cover-art", fit === "cover" && "is-cover", className);
  const looping = isLoopingVisual(resolved) && !failed;
  const still = failed ? posterSrc : resolved;
  if (!looping) {
    if (!still || isLoopingVisual(still)) return <div className={frame} aria-hidden />;
    return (
      <span className={frame}>
        {fit === "cover" ? null : <img src={still} alt="" aria-hidden className="cover-art-wash" />}
        <img src={still} alt={alt} loading="lazy" decoding="async" className="cover-art-fit" />
      </span>
    );
  }
  const wash = posterSrc && !isLoopingVisual(posterSrc) ? posterSrc : "";
  if (motion !== "loop" && wash) {
    return (
      <span className={frame}>
        <img src={wash} alt="" aria-hidden className="cover-art-wash" />
        <img src={wash} alt={alt} loading="lazy" decoding="async" className="cover-art-fit" />
      </span>
    );
  }
  if (motion !== "loop") {
    return (
      <span className={frame}>
        <StillFilm src={resolved} alt={alt} onError={() => setFailed(true)} />
      </span>
    );
  }
  return (
    <span className={frame}>
      {fit === "cover" || !wash ? null : <img src={wash} alt="" aria-hidden className="cover-art-wash" />}
      <video
        src={resolved}
        poster={wash || undefined}
        className="cover-art-fit"
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-label={alt || undefined}
        onError={() => setFailed(true)}
      />
    </span>
  );
}

function StillFilm({ src, alt, onError }: { src: string; alt: string; onError: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const paint = () => {
      try {
        if (el.currentTime < 0.04) el.currentTime = 0.04;
      } catch {
        /* not seekable yet */
      }
      el.pause();
    };
    el.addEventListener("loadeddata", paint);
    return () => el.removeEventListener("loadeddata", paint);
  }, [src]);
  return (
    <video
      ref={ref}
      src={src}
      className="cover-art-fit"
      muted
      playsInline
      preload="metadata"
      aria-label={alt || undefined}
      onError={onError}
    />
  );
}
