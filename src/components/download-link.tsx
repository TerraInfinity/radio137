import { Download } from "lucide-react";
import { downloadAudio } from "@/lib/audio-cache";
import { mediaUrl } from "@/lib/media";
import { downloadName } from "@/lib/search";
import { cn } from "@/lib/cn";
import type { Track } from "@/lib/types";

export function DownloadLink({
  track,
  label = "Download",
  className,
}: {
  track: Track;
  label?: string;
  className?: string;
}) {
  if (!track.audioUrl) return null;
  const name = downloadName(track);
  return (
    <a
      href={mediaUrl(track.audioUrl)}
      download={name}
      className={cn("inline-flex h-12 items-center gap-2 px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold", className)}
      onClick={(event) => {
        event.preventDefault();
        void downloadAudio(track, name);
      }}
    >
      <Download className="size-4" />
      {label}
    </a>
  );
}