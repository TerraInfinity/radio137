import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { PhoneArtPicker } from "@/components/phone-art-picker";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getSeedCatalog } from "@/lib/catalog";
import { MEDIA_MAX_VIDEO, visualSrc } from "@/lib/media";
import { prepareArtFile } from "@/lib/prepare-art";
import { directDeskUpload } from "@/lib/direct-upload";
import { cn } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel, Track } from "@/lib/types";

export function HeroArtSheet({
  channel,
  track,
  open,
  onClose,
}: {
  channel: Channel;
  track: Track;
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"song" | "station">("song");
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (!open) {
      setHint("");
      setBusy(false);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  async function upload(file: File) {
    setBusy(true);
    setHint(`Preparing ${file.name || "file"}…`);
    try {
      const ready = await prepareArtFile(file);
      setHint(`Uploading ${ready.name}…`);
      const result = await directDeskUpload({
        kind: "art",
        slug: channel.slug,
        file: ready,
        trackId: tab === "song" ? track.id : undefined,
      });
      if (result.tracks) {
        usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations ?? []));
      }
      setHint(result.kind === "video" || ready.type.startsWith("video/") ? "Looping video saved" : "Photo saved");
      usePlayerStore.setState({ deckHint: "Art updated" });
      window.setTimeout(onClose, 600);
    } catch (error) {
      setHint(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const preview = tab === "song" ? visualSrc(track, channel) : visualSrc(null, channel);
  const mb = Math.round(MEDIA_MAX_VIDEO / (1024 * 1024));

  return (
    <div
      className="hero-art-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Replace art"
      onClick={onClose}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) void upload(file);
      }}
    >
      <div className="hero-art-panel" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="hero-art-x"
          aria-label="Close"
        >
          <X className="size-5" strokeWidth={2.25} />
        </button>
        <p className="hero-art-kicker">Hero visual</p>
        <div className="flex shrink-0 gap-1">
          {(["song", "station"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex h-11 flex-1 items-center justify-center font-mono text-[11px] uppercase tracking-[0.14em]",
                tab === id ? "bg-fg text-bg" : "text-gold",
              )}
            >
              {id === "song" ? "This song" : "Station"}
            </button>
          ))}
        </div>
        <div className="hero-art-preview">
          <CoverArt src={preview} alt="" className="size-full" motion="loop" />
        </div>
        <p className="mt-2 shrink-0 text-xs leading-snug text-muted">
          {hint || `Photos, HEIC, or a looping clip under ${mb} MB. Audio keeps playing.`}
        </p>
        <div className="mt-2 shrink-0">
          <PhoneArtPicker disabled={busy} onFile={(file) => void upload(file)} label={busy ? "Working…" : "Choose file"} />
        </div>
      </div>
    </div>
  );
}
