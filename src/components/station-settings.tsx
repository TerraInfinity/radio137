import { useState } from "react";
import { ArtUpload } from "@/components/art-upload";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getSeedCatalog, kindHint, kindLabel, normalizeKind, normalizeShuffle, shuffleHint, shuffleLabel } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { saveStation } from "@/lib/desk-api";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel, ShuffleMode, StationKind } from "@/lib/types";

function applySnapshot(tracks: Parameters<typeof applyCatalogEdits>[1], stations: Parameters<typeof applyCatalogEdits>[2]) {
  usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}

export function StationSettingsForm({ channel, compact = false }: { channel: Channel; compact?: boolean }) {
  const [name, setName] = useState(channel.name);
  const [description, setDescription] = useState(channel.description);
  const [kind, setKind] = useState<StationKind>(normalizeKind(channel.kind || channel.mode));
  const [shuffle, setShuffle] = useState<ShuffleMode>(normalizeShuffle(channel.shuffle));
  const [category, setCategory] = useState(channel.category ?? "");
  const [energy, setEnergy] = useState(channel.energy ?? "");
  const [tags, setTags] = useState(channel.tags.join(", "));
  const [cover, setCover] = useState(channel.cover ?? "");
  const [nsfw, setNsfw] = useState(Boolean(channel.nsfw));
  const [claimable, setClaimable] = useState(Boolean(channel.claimable));
  const [featured, setFeatured] = useState(Boolean(channel.featured));
  const [busy, setBusy] = useState(false);

  return (
    <form
      className={cn("space-y-3", compact ? "" : "rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]")}
      onSubmit={(event) => {
        event.preventDefault();
        setBusy(true);
        void saveStation({
          data: {
            slug: channel.slug,
            name: name.trim() || channel.name,
            description,
            kind,
            shuffle,
            category: category.trim() || undefined,
            energy: energy.trim() || undefined,
            tags: tags.trim() || undefined,
            cover: cover.trim() || undefined,
            nsfw,
            claimable,
            featured,
          },
        })
          .then((result) => applySnapshot(result.tracks, result.stations))
          .catch((error: unknown) => window.alert(error instanceof Error ? error.message : "Save failed"))
          .finally(() => setBusy(false));
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Station settings</p>
      <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
      <textarea className="input" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" />
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Type</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["live", "ondemand", "fixed"] as const).map((value) => (
            <label key={value} className={cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", kind === value ? "bg-fg text-bg" : "text-gold")}>
              <input type="radio" className="sr-only" checked={kind === value} onChange={() => setKind(value)} />
              {kindLabel(value)}
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">{kindHint(kind)}</p>
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Shuffle</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["off", "optional", "on"] as const).map((value) => (
            <label key={value} className={cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", shuffle === value ? "bg-fg text-bg" : "text-gold")}>
              <input type="radio" className="sr-only" checked={shuffle === value} onChange={() => setShuffle(value)} />
              {shuffleLabel(value)}
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">{shuffleHint(shuffle)}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Category</span>
          <input className="input mt-1" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Temple, vault…" />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Energy</span>
          <input className="input mt-1" value={energy} onChange={(event) => setEnergy(event.target.value)} placeholder="clock, start to finish…" />
        </label>
      </div>
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Tags</span>
        <input className="input mt-1" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="comma separated" />
      </label>
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Art URL</span>
        <input className="input mt-1" value={cover} onChange={(event) => setCover(event.target.value)} placeholder="https://… jpg or mp4" />
        <span className="mt-1 block text-sm text-muted">Still under 2 MB, or a looping mp4 under 10 MB. Cards stay still so the free plan does not stream every loop.</span>
      </label>
      <ArtUpload slug={channel.slug} current={cover} onUrl={setCover} />
      <div className="flex flex-wrap gap-4">
        <label className="inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
          Featured
        </label>
        <label className="inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          <input type="checkbox" checked={claimable} onChange={(event) => setClaimable(event.target.checked)} />
          DJ booth
        </label>
        <label className="inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          <input type="checkbox" checked={nsfw} onChange={(event) => setNsfw(event.target.checked)} />
          18+
        </label>
      </div>
      <button type="submit" disabled={busy} className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
        {busy ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
