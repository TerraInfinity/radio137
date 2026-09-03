import { CoverArt } from "@/components/cover-art";
import { stationSkin } from "@/lib/catalog";
import { cn } from "@/lib/cn";
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
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <CoverArt src={channel.cover} alt="" className="size-full" />
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
    </div>
  );
}
