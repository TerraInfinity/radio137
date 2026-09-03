import { useEffect, useMemo, useRef, useState } from "react";
import { CoverArt } from "@/components/cover-art";
import { cn, hashString } from "@/lib/cn";
import { resolveMediaUrl } from "@/lib/media";
import type { Channel } from "@/lib/types";

type Size = "thumb" | "card" | "hero";

export function StationVisual({
  channel,
  className,
  dimmed = false,
  size = "card",
}: {
  channel: Pick<Channel, "slug" | "name" | "cover" | "animationUrl" | "enabled" | "skin">;
  className?: string;
  dimmed?: boolean;
  size?: Size;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const seed = useMemo(() => hashString(channel.slug), [channel.slug]);
  const pattern = seed % 4;
  const animation = resolveMediaUrl(channel.animationUrl);
  const [reduce, setReduce] = useState(false);
  const skin = channel.skin && channel.skin !== "none" ? channel.skin : null;

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !animation || reduce) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) void video.play().catch(() => {});
          else video.pause();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [animation, reduce]);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-bg-subtle shadow-[var(--shadow-border)]",
        dimmed && "opacity-55 grayscale",
        className,
      )}
    >
      <CoverArt src={channel.cover} alt="" className="absolute inset-0 size-full rounded-none shadow-none" />
      {animation && !reduce ? (
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 size-full object-cover",
            size === "thumb" ? "opacity-80" : size === "card" ? "opacity-90" : "opacity-100",
          )}
          src={animation}
          poster={resolveMediaUrl(channel.cover) || undefined}
          muted
          loop
          playsInline
          preload={size === "hero" ? "auto" : "metadata"}
          aria-hidden
        />
      ) : (
        <div
          className={cn(
            "station-motion pointer-events-none absolute inset-0",
            `station-motion-${pattern}`,
            size === "hero" ? "station-motion-hero" : size === "thumb" ? "station-motion-thumb" : "station-motion-card",
          )}
          style={{
            ["--station-turn" as string]: `${28 + (seed % 40)}s`,
            ["--station-drift" as string]: `${10 + (seed % 14)}s`,
            ["--station-shift" as string]: `${(seed % 360).toString()}deg`,
          }}
          aria-hidden
        />
      )}
      {skin === "glaum" ? (
        <>
          <div className="station-glaum pointer-events-none absolute inset-0" aria-hidden />
          <div className="station-glaum-sequins pointer-events-none absolute inset-0" aria-hidden />
          {size !== "thumb" ? (
            <div className="station-glaum-shrimp pointer-events-none absolute inset-0" aria-hidden />
          ) : null}
        </>
      ) : null}
      {skin === "waheguru" ? (
        <div className="station-wahe pointer-events-none absolute inset-0" aria-hidden />
      ) : null}
      {size === "hero" ? (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
      ) : null}
    </div>
  );
}
