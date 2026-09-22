import { useState } from "react";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { CoverArt } from "@/components/cover-art";
import { PhoneArtPicker } from "@/components/phone-art-picker";
import { getSeedCatalog } from "@/lib/catalog";
import { directDeskUpload } from "@/lib/direct-upload";
import { MEDIA_MAX_VIDEO, isLoopingVisual } from "@/lib/media";
import { prepareArtFile } from "@/lib/prepare-art";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";

export function ArtUpload({
  slug,
  trackId,
  current,
  onUrl,
}: {
  slug: string;
  trackId?: string;
  current?: string;
  onUrl?: (url: string, kind: "image" | "video") => void;
}) {
  const { r2Configured, isAdmin, isPending } = useRadioUser();
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");
  if (isPending || !isAdmin) return null;

  async function upload(file: File) {
    setBusy(true);
    setHint(`Preparing ${file.name || "file"}…`);
    try {
      const ready = await prepareArtFile(file);
      setHint(`Uploading ${ready.name}…`);
      const result = await directDeskUpload({
        kind: "art",
        slug,
        file: ready,
        trackId,
      });
      if (result.tracks) {
        usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations ?? []));
      }
      const kind = result.kind === "video" || isLoopingVisual(result.object.url) ? "video" : "image";
      onUrl?.(result.object.url, kind);
      setHint(kind === "video" ? "Looping video saved" : "Photo saved");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Upload failed");
      setHint("");
    } finally {
      setBusy(false);
    }
  }

  const mb = Math.round(MEDIA_MAX_VIDEO / (1024 * 1024));

  return (
    <div className="space-y-2">
      {current ? <CoverArt src={current} alt="" className="h-28 w-full rounded-lg" motion="loop" /> : null}
      <div className="rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Upload art</span>
        <p className="mt-1 text-sm text-muted">
          {r2Configured
            ? `Photos, HEIC, or a looping clip under ${mb} MB. Cards and the station page both play motion.`
            : "R2 keys are dark — paste a URL instead."}
        </p>
        {r2Configured ? (
          <div className="mt-3">
            <PhoneArtPicker disabled={busy} onFile={(file) => void upload(file)} label={busy ? "Working…" : "Choose file"} />
          </div>
        ) : null}
      </div>
      {hint ? <p className="text-sm text-muted">{hint}</p> : null}
    </div>
  );
}