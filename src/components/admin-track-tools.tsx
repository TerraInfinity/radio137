import { useState } from "react";
import { addStationTrack, deleteStationFile, hideStationTrack, patchStationTrack, saveStation } from "@/lib/desk-api";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { fileLocationLabel, r2KeyFromAudioUrl } from "@/lib/file-path";
import { getSeedCatalog, kindHint, kindLabel, normalizeKind } from "@/lib/catalog";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";
import { cn } from "@/lib/cn";
import type { Channel, StationKind, Track } from "@/lib/types";

function applySnapshot(
  tracks: Parameters<typeof applyCatalogEdits>[1],
  stations: Parameters<typeof applyCatalogEdits>[2],
  playingId: string | null,
  next: () => void,
) {
  const catalog = applyCatalogEdits(getSeedCatalog(), tracks, stations);
  usePlayerStore.getState().replaceCatalog(catalog);
  const still = catalog.channels.flatMap((channel) => channel.tracks).find((track) => track.id === playingId && track.enabled !== false);
  if (playingId && !still) void next();
}

export function AdminTrackTools({ slug, track, compact = false }: { slug: string; track: Track; compact?: boolean }) {
  const { isAdmin, r2Configured, isPending } = useRadioUser();
  const [busy, setBusy] = useState<"hide" | "r2" | "save" | null>(null);
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
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
      applySnapshot(result.tracks, result.stations, playingId, next);
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
    if (!window.confirm(`Permanently delete this file from R2?\n${key}`)) return;
    setBusy("r2");
    try {
      const result = await deleteStationFile({
        data: { channelSlug: slug, trackId: track.id, audioUrl: track.audioUrl, r2Key: key, alsoDeleteR2: true },
      });
      applySnapshot(result.tracks, result.stations, playingId, next);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not delete from R2");
    } finally {
      setBusy(null);
    }
  }

  async function saveMeta() {
    setBusy("save");
    try {
      const result = await patchStationTrack({
        data: { channelSlug: slug, trackId: track.id, title: title.trim() || track.title, artist: artist.trim() || track.artist },
      });
      applySnapshot(result.tracks, result.stations, playingId, next);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not save");
    } finally {
      setBusy(null);
    }
  }

  if (compact) {
    return (
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
    );
  }

  return (
    <div className="mt-3 rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">C desk</p>
      <p className="mt-1 break-all font-mono text-[11px] text-subtle" title={track.audioUrl}>
        {location}
      </p>
      <form
        className="mt-3 grid gap-2 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          void saveMeta();
        }}
      >
        <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
        <input className="input" value={artist} onChange={(event) => setArtist(event.target.value)} placeholder="Artist" />
        <div className="sm:col-span-2">
          <button type="submit" disabled={Boolean(busy)} className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
            {busy === "save" ? "Saving…" : "Save details"}
          </button>
        </div>
      </form>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" disabled={Boolean(busy)} onClick={() => void hide()} className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          {busy === "hide" ? "Removing…" : "Remove from station"}
        </button>
        <button
          type="button"
          disabled={Boolean(busy) || !r2Configured}
          onClick={() => void destroy()}
          className={cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", r2Configured ? "text-ember" : "text-subtle")}
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
        void addStationTrack({ data: { channelSlug: slug, title: title.trim(), audioUrl: audioUrl.trim(), coverUrl: cover } })
          .then((result) => {
            usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
            setTitle("");
            setAudioUrl("");
          })
          .catch((error: unknown) => window.alert(error instanceof Error ? error.message : "Could not add"))
          .finally(() => setBusy(false));
      }}
    >
      <input className="input max-w-xs" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
      <input className="input max-w-md" value={audioUrl} onChange={(event) => setAudioUrl(event.target.value)} placeholder="https://r2.terrainfinity.ca/radio/…" />
      <button type="submit" disabled={busy} className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
        {busy ? "Adding…" : "Add to station"}
      </button>
    </form>
  );
}

export function AdminStationEdit({ channel }: { channel: Channel }) {
  const { isAdmin, isPending } = useRadioUser();
  const [kind, setKind] = useState<StationKind>(normalizeKind(channel.kind || channel.mode));
  const [featured, setFeatured] = useState(Boolean(channel.featured));
  const [rank, setRank] = useState(String(channel.featuredRank ?? 99));
  const [name, setName] = useState(channel.name);
  const [description, setDescription] = useState(channel.description);
  const [busy, setBusy] = useState(false);
  if (isPending || !isAdmin) return null;
  return (
    <form
      className="mt-4 rounded-xl bg-bg-elevated p-3 shadow-[var(--shadow-filigree)]"
      onSubmit={(event) => {
        event.preventDefault();
        setBusy(true);
        const featuredRank = Number.parseInt(rank, 10);
        void saveStation({
          data: {
            slug: channel.slug,
            name: name.trim() || channel.name,
            description,
            kind,
            featured,
            featuredRank: Number.isFinite(featuredRank) ? featuredRank : 99,
          },
        })
          .then((result) => {
            usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
          })
          .catch((error: unknown) => window.alert(error instanceof Error ? error.message : "Save failed"))
          .finally(() => setBusy(false));
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">C · Station</p>
      <input className="input mt-3" value={name} onChange={(event) => setName(event.target.value)} />
      <textarea className="input mt-2" value={description} onChange={(event) => setDescription(event.target.value)} />
      <div className="mt-3 flex flex-wrap gap-2">
        {(["live", "ondemand", "fixed"] as const).map((value) => (
          <label
            key={value}
            className={cn(
              "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]",
              kind === value ? "bg-fg text-bg" : "text-gold",
            )}
          >
            <input type="radio" className="sr-only" name="kind" checked={kind === value} onChange={() => setKind(value)} />
            {kindLabel(value)}
          </label>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted">{kindHint(kind)}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
          Featured rail
        </label>
        <label className="inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          Rank
          <input
            className="input w-20"
            inputMode="numeric"
            value={rank}
            onChange={(event) => setRank(event.target.value)}
          />
        </label>
      </div>
      <div className="mt-2">
        <button type="submit" disabled={busy} className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
          {busy ? "Saving…" : "Save station"}
        </button>
      </div>
    </form>
  );
}
