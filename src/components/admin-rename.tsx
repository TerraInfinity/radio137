import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getSeedCatalog } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { patchStationTrack } from "@/lib/desk-api";
import { usePlayerStore } from "@/lib/player-store";
import { useRadioUser } from "@/lib/radio-user";
import type { Track } from "@/lib/types";

export function RenameCutForm({
  slug,
  track,
  onClose,
  appearance = "row",
}: {
  slug: string;
  track: Track;
  onClose: () => void;
  appearance?: "row" | "title";
}) {
  const [value, setValue] = useState(track.title);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setValue(track.title);
  }, [track.id, track.title]);

  async function save() {
    const next = value.trim();
    if (!next || next === track.title) {
      onClose();
      return;
    }
    setBusy(true);
    try {
      const result = await patchStationTrack({
        data: { channelSlug: slug, trackId: track.id, title: next },
      });
      usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
      onClose();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not rename");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className={cn("flex min-w-0 items-center gap-1", appearance === "title" ? "w-full" : "w-full basis-full pb-1")}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void save();
      }}
    >
      <input
        className={cn("input h-11 min-w-0 flex-1", appearance === "title" && "font-display text-lg")}
        value={value}
        autoFocus
        maxLength={160}
        aria-label="Song title"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setValue(track.title);
            onClose();
          }
        }}
      />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-11 shrink-0 items-center rounded-md bg-fg px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-bg"
      >
        {busy ? "Saving…" : "Save"}
      </button>
      <button
        type="button"
        onClick={() => {
          setValue(track.title);
          onClose();
        }}
        className="inline-flex h-11 shrink-0 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle"
      >
        Cancel
      </button>
    </form>
  );
}

export function AdminRename({
  slug,
  track,
  compact = false,
}: {
  slug: string;
  track: Track;
  compact?: boolean;
}) {
  const { isAdmin, isPending } = useRadioUser();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [track.id]);

  if (isPending || !isAdmin) return null;

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        aria-expanded={open}
        aria-label="Rename"
        title="Rename this song"
        className="inline-flex h-11 shrink-0 items-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
      >
        <Pencil className="size-3.5" />
        {compact ? null : "Rename"}
      </button>
      {open ? <RenameCutForm slug={slug} track={track} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
