import { CoverArt } from "@/components/cover-art";
import { stationSkin } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { isLoopingVisual, stationVisualSrc } from "@/lib/media";
import type { Channel } from "@/lib/types";

export function StationVisual({
  channel,
  className,
  size = "card",
}: {
  channel: Channel;
  className?: string;
  size?: "thumb" | "card" | "hero";
}) {
  const skin = stationSkin(channel);
  const src = stationVisualSrc(channel);
  const poster = channel.cover && !isLoopingVisual(channel.cover) && src !== channel.cover ? channel.cover : undefined;
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <CoverArt src={src} poster={poster} alt="" className="size-full" motion="loop" />
      <div
        className={cn(
          "station-motion pointer-events-none absolute inset-0",
          size === "thumb" && "station-motion-thumb",
          size === "card" && "station-motion-card",
          size === "hero" && "station-motion-hero",
          skin === "glaum" && "station-glaum",
        )}
      />
      {skin === "glaum" ? (
        <>
          <div className="station-glaum-sequins pointer-events-none absolute inset-0" />
          <div className="station-glaum-shrimp pointer-events-none absolute inset-0" />
        </>
      ) : null}
      {skin === "waheguru" ? <div className="station-wahe pointer-events-none absolute inset-0" /> : null}
      {skin === "rose" ? <div className="station-rose pointer-events-none absolute inset-0" /> : null}
    </div>
  );
}