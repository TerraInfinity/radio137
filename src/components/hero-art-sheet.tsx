import { useState } from "react";
import { CoverArt } from "@/components/cover-art";
import { PhoneArtPicker } from "@/components/phone-art-picker";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getBearerToken } from "@/lib/auth/client";
import { getSeedCatalog } from "@/lib/catalog";
import { MEDIA_MAX_VIDEO, visualSrc } from "@/lib/media";
import { prepareArtFile } from "@/lib/prepare-art";
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
  if (!open) return null;

  async function upload(file: File) {
    setBusy(true);
    setHint(`Preparing ${file.name || "file"}…`);
    try {
      const ready = await prepareArtFile(file);
      setHint(`Uploading ${ready.name}…`);
      const body = new FormData();
      body.set("slug", channel.slug);
      if (tab === "song") body.set("trackId", track.id);
      body.set("file", ready);
      const token = getBearerToken();
      const res = await fetch("/api/desk/upload-art", {
        method: "POST",
        body,
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const raw = await res.text();
      let json: {
        tracks?: Parameters<typeof applyCatalogEdits>[1];
        stations?: Parameters<typeof applyCatalogEdits>[2];
        error?: string;
      } = {};
      try {
        json = raw ? (JSON.parse(raw) as typeof json) : {};
      } catch {
        throw new Error(res.status === 413 ? "That clip is too large. Try a shorter video." : "Upload failed");
      }
      if (!res.ok) throw new Error(json.error || "Upload failed");
      if (json.tracks) {
        usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), json.tracks, json.stations ?? []));
      }
      setHint(ready.type.startsWith("video/") ? "Looping video saved" : "Photo saved");
      usePlayerStore.setState({ deckHint: "Art updated" });
      window.setTimeout(onClose, 600);
    } catch (error) {
      setHint(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const preview = tab === "song" ? visualSrc(track, channel) : visualSrc(null, channel);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-bg/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:place-items-center"
      role="dialog"
      aria-label="Replace art"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) void upload(file);
      }}
    >
      <div className="w-full max-w-md rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">C · hero visual</p>
        <div className="mt-3 flex gap-1">
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
        <CoverArt src={preview} alt="" className="mt-3 aspect-square w-full rounded-lg" motion="loop" />
        <p className="mt-3 text-sm text-muted">
          Phone photos (including HEIC) shrink automatically. Short looping mp4 or mov under {Math.round(MEDIA_MAX_VIDEO / (1024 * 1024))} MB. Audio keeps playing.
        </p>
        <div className="mt-4 space-y-2">
          <PhoneArtPicker disabled={busy} onFile={(file) => void upload(file)} />
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
            Close
          </button>
        </div>
        {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
      </div>
    </div>
  );
}
