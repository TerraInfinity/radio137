import { useRef, useState } from "react";
import { CoverArt } from "@/components/cover-art";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getBearerToken } from "@/lib/auth/client";
import { getSeedCatalog } from "@/lib/catalog";
import { MEDIA_MAX_IMAGE, MEDIA_MAX_VIDEO } from "@/lib/media";
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
  const [tab, setTab] = useState<"cut" | "station">("cut");
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  if (!open) return null;

  async function upload(file: File) {
    const isVideo = /\.(mp4|webm)$/i.test(file.name) || file.type.startsWith("video/");
    const cap = isVideo ? MEDIA_MAX_VIDEO : MEDIA_MAX_IMAGE;
    if (file.size > cap) {
      setHint(`Too large — ${isVideo ? "video" : "image"} max ${Math.round(cap / (1024 * 1024))} MB`);
      return;
    }
    setBusy(true);
    setHint(`Uploading ${file.name}…`);
    try {
      const body = new FormData();
      body.set("slug", channel.slug);
      if (tab === "cut") body.set("trackId", track.id);
      body.set("file", file);
      const token = getBearerToken();
      const res = await fetch("/api/desk/upload-art", {
        method: "POST",
        body,
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = (await res.json()) as {
        tracks?: Parameters<typeof applyCatalogEdits>[1];
        stations?: Parameters<typeof applyCatalogEdits>[2];
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || "Upload failed");
      if (json.tracks) {
        usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), json.tracks, json.stations ?? []));
      }
      setHint(isVideo ? "Looping video saved" : "Still saved");
      usePlayerStore.setState({ deckHint: "Art updated" });
      window.setTimeout(onClose, 600);
    } catch (error) {
      setHint(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const preview = tab === "cut" ? track.coverUrl || channel.cover : channel.cover;

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-bg/80 p-4 sm:place-items-center" role="dialog" aria-label="Replace art">
      <div className="w-full max-w-md rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">C · hero visual</p>
        <div className="mt-3 flex gap-1">
          {(["cut", "station"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex h-11 flex-1 items-center justify-center font-mono text-[11px] uppercase tracking-[0.14em]",
                tab === id ? "bg-fg text-bg" : "text-gold",
              )}
            >
              {id === "cut" ? "This cut" : "Station"}
            </button>
          ))}
        </div>
        <CoverArt src={preview} alt="" className="mt-3 aspect-square w-full rounded-lg" motion="loop" />
        <p className="mt-3 text-sm text-muted">
          Jpg, png, webp, or a short looping mp4 under {Math.round(MEDIA_MAX_VIDEO / (1024 * 1024))} MB. Audio keeps playing.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void upload(file);
          }}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg"
          >
            {busy ? "Uploading…" : "Choose file"}
          </button>
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
            Close
          </button>
        </div>
        {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
      </div>
    </div>
  );
}
