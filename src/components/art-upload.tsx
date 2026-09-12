import { useState } from "react";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { CoverArt } from "@/components/cover-art";
import { PhoneArtPicker } from "@/components/phone-art-picker";
import { getBearerToken } from "@/lib/auth/client";
import { getSeedCatalog } from "@/lib/catalog";
import { MEDIA_MAX_VIDEO } from "@/lib/media";
import { prepareArtFile } from "@/lib/prepare-art";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";

type Snapshot = {
  tracks?: Parameters<typeof applyCatalogEdits>[1];
  stations?: Parameters<typeof applyCatalogEdits>[2];
  object?: { url: string };
  error?: string;
};

export function ArtUpload({
  slug,
  trackId,
  current,
  onUrl,
}: {
  slug: string;
  trackId?: string;
  current?: string;
  onUrl?: (url: string) => void;
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
      const body = new FormData();
      body.set("slug", slug);
      if (trackId) body.set("trackId", trackId);
      body.set("file", ready);
      const token = getBearerToken();
      const res = await fetch("/api/desk/upload-art", {
        method: "POST",
        body,
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const raw = await res.text();
      let json: Snapshot = {};
      try {
        json = raw ? (JSON.parse(raw) as Snapshot) : {};
      } catch {
        throw new Error(res.status === 413 ? "That clip is too large. Try a shorter video." : "Upload failed");
      }
      if (!res.ok) throw new Error(json.error || "Upload failed");
      if (json.tracks) {
        usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), json.tracks, json.stations ?? []));
      }
      if (json.object?.url) onUrl?.(json.object.url);
      setHint(ready.type.startsWith("video/") ? "Looping video saved" : "Photo saved");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Upload failed");
      setHint("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {current ? <CoverArt src={current} alt="" className="h-28 w-full rounded-lg" motion="loop" /> : null}
      <div className="rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Upload art</span>
        <p className="mt-1 text-sm text-muted">
          {r2Configured
            ? `Phone photos shrink automatically. Short looping mp4 or mov under ${Math.round(MEDIA_MAX_VIDEO / (1024 * 1024))} MB. Cards stay still; the open station or song page loops it.`
            : "R2 keys are dark — paste a URL instead."}
        </p>
        {r2Configured ? (
          <div className="mt-3">
            <PhoneArtPicker disabled={busy} onFile={(file) => void upload(file)} />
          </div>
        ) : null}
      </div>
      {hint ? <p className="text-sm text-muted">{hint}</p> : null}
    </div>
  );
}
