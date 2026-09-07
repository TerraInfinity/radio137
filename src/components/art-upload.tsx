import { useState } from "react";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { CoverArt } from "@/components/cover-art";
import { getBearerToken } from "@/lib/auth/client";
import { getSeedCatalog } from "@/lib/catalog";
import { MEDIA_MAX_VIDEO } from "@/lib/media";
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
    setHint(`Uploading ${file.name}…`);
    try {
      const body = new FormData();
      body.set("slug", slug);
      if (trackId) body.set("trackId", trackId);
      body.set("file", file);
      const token = getBearerToken();
      const res = await fetch("/api/desk/upload-art", {
        method: "POST",
        body,
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = (await res.json()) as Snapshot;
      if (!res.ok) throw new Error(json.error || "Upload failed");
      if (json.tracks) {
        usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), json.tracks, json.stations ?? []));
      }
      if (json.object?.url) onUrl?.(json.object.url);
      setHint(file.name.toLowerCase().endsWith(".mp4") || file.name.toLowerCase().endsWith(".webm") ? "Looping video saved" : "Still saved");
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
      <label className="block cursor-pointer rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Upload art</span>
        <p className="mt-1 text-sm text-muted">
          {r2Configured
            ? `Jpg, png, webp, or a short looping mp4 under ${Math.round(MEDIA_MAX_VIDEO / (1024 * 1024))} MB. Cards stay still; the open station or song page loops it.`
            : "R2 keys are dark — paste a URL instead."}
        </p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm"
          disabled={busy || !r2Configured}
          className="mt-2 block w-full text-sm text-muted file:mr-3 file:h-11 file:rounded-md file:border-0 file:bg-fg file:px-3 file:font-mono file:text-[11px] file:uppercase file:tracking-[0.14em] file:text-bg"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void upload(file);
          }}
        />
      </label>
      {hint ? <p className="text-sm text-muted">{hint}</p> : null}
    </div>
  );
}
