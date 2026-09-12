import { useEffect, useMemo, useState } from "react";
import { CoverArt } from "@/components/cover-art";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getCatalog, getSeedCatalog } from "@/lib/catalog";
import { copiesOf } from "@/lib/cuts";
import {
  deleteStationFile,
  dismissReviewItemFn,
  listReviewQueue,
  mergeStationCuts,
  rehomeReviewItemFn,
  restoreReviewItemFn,
} from "@/lib/desk-api";
import { audioPathParts } from "@/lib/file-path";
import { mediaUrl } from "@/lib/media";
import { usePlayerStore } from "@/lib/player-store";
import { Link } from "@tanstack/react-router";

type Item = {
  id: number;
  trackId: string;
  channelSlug: string;
  audioUrl: string | null;
  title: string | null;
  artist: string | null;
  r2Key: string | null;
  coverUrl: string | null;
  editorEmail: string | null;
  createdAt: string;
};

export function DeskReview() {
  const catalog = usePlayerStore((s) => s.catalog);
  const groups = usePlayerStore((s) => s.cutGroups);
  const channels = catalog.channels.length ? catalog.channels : getCatalog().channels;
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const [dupId, setDupId] = useState<number | null>(null);
  const [toSlug, setToSlug] = useState(channels[0]?.slug ?? "");

  function applySnap(tracks: Parameters<typeof applyCatalogEdits>[1], stations: Parameters<typeof applyCatalogEdits>[2]) {
    usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
  }

  async function refresh() {
    const data = await listReviewQueue();
    setItems(data.items as Item[]);
  }

  useEffect(() => {
    void refresh().catch(() => setItems([]));
  }, []);

  const source = catalog.channels.length ? catalog : getCatalog();

  return (
    <section className="mt-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Review queue</p>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Songs unallocated from a station. Files stay on R2. Cousins on other desks stay on air until you merge or move them.
      </p>
      {items.length === 0 ? <p className="mt-6 text-muted">Nothing to review.</p> : null}
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <ReviewRow
            key={item.id}
            item={item}
            channels={channels.map((channel) => ({ slug: channel.slug, name: channel.name }))}
            toSlug={toSlug}
            setToSlug={setToSlug}
            busy={busy === item.id}
            showDups={dupId === item.id}
            copies={copiesOf(source, item.trackId, groups, true)}
            onDup={() => setDupId(dupId === item.id ? null : item.id)}
            onRestore={async () => {
              setBusy(item.id);
              try {
                const snap = await restoreReviewItemFn({ data: { id: item.id } });
                applySnap(snap.tracks, snap.stations);
                await refresh();
              } catch (error) {
                window.alert(error instanceof Error ? error.message : "Restore failed");
              } finally {
                setBusy(null);
              }
            }}
            onMove={async () => {
              if (!toSlug) return;
              setBusy(item.id);
              try {
                const snap = await rehomeReviewItemFn({ data: { id: item.id, toSlug, mode: "move" } });
                applySnap(snap.tracks, snap.stations);
                await refresh();
              } catch (error) {
                window.alert(error instanceof Error ? error.message : "Move failed");
              } finally {
                setBusy(null);
              }
            }}
            onDismiss={async () => {
              setBusy(item.id);
              try {
                await dismissReviewItemFn({ data: { id: item.id, status: "dismissed" } });
                await refresh();
              } finally {
                setBusy(null);
              }
            }}
            onMerge={async (canonicalId, memberIds) => {
              setBusy(item.id);
              try {
                const result = await mergeStationCuts({ data: { canonicalId, memberIds } });
                usePlayerStore.getState().replaceCutGroups(result.groups);
                await dismissReviewItemFn({ data: { id: item.id, status: "merged" } });
                await refresh();
              } catch (error) {
                window.alert(error instanceof Error ? error.message : "Merge failed");
              } finally {
                setBusy(null);
              }
            }}
            onDestroy={async () => {
              if (!item.audioUrl) return;
              if (!window.confirm(`Permanently delete this file from R2?\n${item.r2Key || item.audioUrl}`)) return;
              setBusy(item.id);
              try {
                const snap = await deleteStationFile({
                  data: {
                    channelSlug: item.channelSlug,
                    trackId: item.trackId,
                    audioUrl: item.audioUrl,
                    r2Key: item.r2Key ?? undefined,
                    alsoDeleteR2: true,
                  },
                });
                applySnap(snap.tracks, snap.stations);
                await dismissReviewItemFn({ data: { id: item.id, status: "dismissed" } });
                await refresh();
              } catch (error) {
                window.alert(error instanceof Error ? error.message : "Delete failed");
              } finally {
                setBusy(null);
              }
            }}
          />
        ))}
      </ul>
    </section>
  );
}

function ReviewRow({
  item,
  channels,
  toSlug,
  setToSlug,
  busy,
  showDups,
  copies,
  onDup,
  onRestore,
  onMove,
  onDismiss,
  onMerge,
  onDestroy,
}: {
  item: Item;
  channels: Array<{ slug: string; name: string }>;
  toSlug: string;
  setToSlug: (slug: string) => void;
  busy: boolean;
  showDups: boolean;
  copies: ReturnType<typeof copiesOf>;
  onDup: () => void;
  onRestore: () => Promise<void>;
  onMove: () => Promise<void>;
  onDismiss: () => Promise<void>;
  onMerge: (canonicalId: string, memberIds: string[]) => Promise<void>;
  onDestroy: () => Promise<void>;
}) {
  const parts = item.audioUrl ? audioPathParts(item.audioUrl) : { folder: "", filename: "", stem: "" };
  const cousins = useMemo(() => copies.filter((copy) => copy.track.id !== item.trackId || copy.channel.slug !== item.channelSlug), [copies, item]);
  return (
    <li className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
      <div className="flex gap-3">
        <CoverArt src={item.coverUrl} alt="" className="size-16 shrink-0 overflow-hidden rounded-md" motion="still" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl">{item.title || item.trackId}</p>
          <p className="mt-1 truncate text-sm text-muted">{item.artist || "Unknown"} · from {item.channelSlug}</p>
          <p className="mt-1 break-all font-mono text-[10px] text-subtle">
            {parts.folder ? `${parts.folder}/` : ""}
            {parts.filename || item.r2Key || "—"}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
            {item.editorEmail || "desk"} · {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      {item.audioUrl ? (
        <audio className="mt-3 w-full" controls preload="none" src={mediaUrl(item.audioUrl)} />
      ) : null}
      {item.trackId ? (
        <Link to="/player/$id" params={{ id: item.trackId }} className="mt-2 inline-flex h-11 items-center font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
          Open song
        </Link>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => void onRestore()} className="inline-flex h-11 items-center rounded-md bg-fg px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
          Restore
        </button>
        <select className="input max-w-xs" value={toSlug} onChange={(event) => setToSlug(event.target.value)}>
          {channels.map((channel) => (
            <option key={channel.slug} value={channel.slug}>
              {channel.name}
            </option>
          ))}
        </select>
        <button type="button" disabled={busy || !toSlug} onClick={() => void onMove()} className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          Move
        </button>
        <button type="button" disabled={busy} onClick={onDup} className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          Find duplicates
        </button>
        <button type="button" disabled={busy} onClick={() => void onDismiss()} className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
          Keep hidden
        </button>
        <button type="button" disabled={busy} onClick={() => void onDestroy()} className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ember">
          Delete on R2
        </button>
      </div>
      {showDups ? (
        <div className="mt-3 border-t border-line pt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">Cousins</p>
          {cousins.length === 0 ? <p className="mt-2 text-sm text-muted">No other stations carry this stem or title.</p> : null}
          <ul className="mt-2 space-y-1">
            {cousins.map((copy) => (
              <li key={`${copy.channel.slug}:${copy.track.id}`} className="text-sm text-muted">
                {copy.track.title} · {copy.channel.name} · {copy.folder || "radio"}/{copy.filename}
              </li>
            ))}
          </ul>
          {cousins.length > 0 ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onMerge(item.trackId, cousins.map((copy) => copy.track.id))}
              className="mt-2 inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
            >
              Merge into song group
            </button>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
