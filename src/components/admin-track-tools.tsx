import { useState } from "react";
import { addStationTrack, deleteStationFile, hideStationTrack } from "@/lib/desk-api";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { fileLocationLabel, r2KeyFromAudioUrl } from "@/lib/file-path";
import { getSeedCatalog } from "@/lib/catalog";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";
import { cn } from "@/lib/cn";
import type { Track } from "@/lib/types";

function applyEditsAndMaybeSkip(edits: Parameters<typeof applyCatalogEdits>[1], playingId: string | null, next: () => void) {
  const catalog = applyCatalogEdits(getSeedCatalog(), edits);
  usePlayerStore.getState().replaceCatalog(catalog);
  const still = catalog.channels
    .flatMap((channel) => channel.tracks)
    .find((track) => track.id === playingId && track.enabled !== false);
  if (playingId && !still) void next();
}

export function AdminTrackTools({
  slug,
  track,
  compact = false,
}: {
  slug: string;
  track: Track;
  compact?: boolean;
}) {
  const { isAdmin, r2Configured, isPending } = useRadioUser();
  const [busy, setBusy] = useState<"hide" | "r2" | null>(null);
  const next = usePlayerStore((s) => s.next);
  const playingId = usePlayerStore((s) => s.track?.id ?? null);
  if (isPending || !isAdmin) return null;
  const location = fileLocationLabel(track.audioUrl);
  const key = r2KeyFromAudioUrl(track.audioUrl);

  async function hide() {
    if (!window.confirm(`Remove “${track.title}” from this station? The file stays on R2.`)) return;
    setBusy("hide");
    try {
      const result = await hideStationTrack({ data: { channelSlug: slug, trackId: track.id, audioUrl: track.audioUrl } });
      applyEditsAndMaybeSkip(result.edits, playingId, next);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not remove");
    } finally {
      setBusy(null);
    }
  }

  async function destroy() {
    if (!key) {
      window.alert("No R2 key on this file.");
      return;
    }
    if (
      !window.confirm(
        `Permanently delete this file from R2?\n${key}\nIt will drop off every station that points at it.`,
      )
    ) {
      return;
    }
    setBusy("r2");
    try {
      const result = await deleteStationFile({
        data: {
          channelSlug: slug,
          trackId: track.id,
          audioUrl: track.audioUrl,
          r2Key: key,
          alsoDeleteR2: true,
        },
      });
      applyEditsAndMaybeSkip(result.edits, playingId, next);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not delete from R2");
    } finally {
      setBusy(null);
    }
  }

  if (compact) {
    return (
      <span className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void hide();
          }}
          className="inline-flex h-7 items-center px-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-gold"
        >
          {busy === "hide" ? "…" : "Remove"}
        </button>
      </span>
    );
  }

  return (
    <div className="mt-3 rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">C desk</p>
      <p className="mt-1 break-all font-mono text-[11px] text-subtle" title={track.audioUrl}>
        {location}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void hide()}
          className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
        >
          {busy === "hide" ? "Removing…" : "Remove from station"}
        </button>
        <button
          type="button"
          disabled={Boolean(busy) || !r2Configured}
          onClick={() => void destroy()}
          className={cn(
            "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]",
            r2Configured ? "text-ember" : "text-subtle",
          )}
          title={r2Configured ? "Delete the object on R2" : "Set R2 keys to delete objects"}
        >
          {busy === "r2" ? "Deleting…" : "Delete on R2"}
        </button>
      </div>
    </div>
  );
}

export function AdminAddTrack({ slug, cover }: { slug: string; cover: string }) {
  const { isAdmin, isPending } = useRadioUser();
  const [title, setTitle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [busy, setBusy] = useState(false);
  if (isPending || !isAdmin) return null;

  return (
    <form
      className="mt-4 flex flex-wrap gap-2 px-3 pb-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim() || !audioUrl.trim()) return;
        setBusy(true);
        void addStationTrack({
          data: {
            channelSlug: slug,
            title: title.trim(),
            audioUrl: audioUrl.trim(),
            coverUrl: cover,
          },
        })
          .then((result) => {
            usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.edits));
            setTitle("");
            setAudioUrl("");
          })
          .catch((error: unknown) => {
            window.alert(error instanceof Error ? error.message : "Could not add");
          })
          .finally(() => setBusy(false));
      }}
    >
      <input className="input max-w-xs" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
      <input
        className="input max-w-md"
        value={audioUrl}
        onChange={(event) => setAudioUrl(event.target.value)}
        placeholder="https://r2.terrainfinity.ca/radio/…"
      />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg"
      >
        {busy ? "Adding…" : "Add to station"}
      </button>
    </form>
  );
}
