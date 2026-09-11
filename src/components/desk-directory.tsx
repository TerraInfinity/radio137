import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FoldSection } from "@/components/fold-section";
import {
  copiesOf,
  filenameClusters,
  listCutCopies,
  mergedClusters,
  preferCanonical,
  titleClusters,
  type CutCluster,
  type CutCopy,
  type CutGroup,
} from "@/lib/cuts";
import { dissolveStationCut, mergeStationCutClusters, mergeStationCuts, unmergeStationCut } from "@/lib/desk-api";
import { formatClock } from "@/lib/cn";
import { DownloadLink } from "@/components/download-link";
import { songKey } from "@/lib/song-url";
import { usePlayerStore } from "@/lib/player-store";
import type { Catalog } from "@/lib/types";

function saveGroups(groups: CutGroup[]) {
  usePlayerStore.getState().replaceCutGroups(groups);
}

function fail(error: unknown) {
  window.alert(error instanceof Error ? error.message : "Directory save failed");
}

export function DeskDirectory({ catalog }: { catalog: Catalog }) {
  const groups = usePlayerStore((s) => s.cutGroups);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"file" | "title" | "merged">("file");
  const [busy, setBusy] = useState(false);
  const copies = useMemo(() => listCutCopies(catalog, true), [catalog]);
  const files = useMemo(() => filenameClusters(copies), [copies]);
  const merged = useMemo(() => mergedClusters(copies, groups), [copies, groups]);
  const skipIds = useMemo(() => {
    const ids = new Set(groups.flatMap((group) => group.memberIds));
    for (const cluster of files) for (const copy of cluster.copies) ids.add(copy.track.id);
    return ids;
  }, [files, groups]);
  const titles = useMemo(() => titleClusters(copies, skipIds), [copies, skipIds]);
  const needle = query.trim().toLowerCase();

  const visible = (tab === "file" ? files : tab === "title" ? titles : merged).filter((cluster) => {
    if (!needle) return true;
    return cluster.copies.some((copy) => `${copy.track.title} ${copy.channel.name} ${copy.filename} ${copy.folder}`.toLowerCase().includes(needle));
  });

  async function mergeOne(cluster: CutCluster, canonicalId?: string) {
    const keep = canonicalId || preferCanonical(cluster.copies).track.id;
    setBusy(true);
    try {
      const result = await mergeStationCuts({ data: { canonicalId: keep, memberIds: cluster.copies.map((copy) => copy.track.id) } });
      saveGroups(result.groups);
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  }

  async function mergeAllFiles() {
    if (!window.confirm(`Merge ${files.length} filename clusters into one directory row each?\n\nR2 files stay. Station playlists keep their copies. Search will show one song.`)) return;
    setBusy(true);
    try {
      const result = await mergeStationCutClusters({
        data: {
          clusters: files.map((cluster) => {
            const keep = preferCanonical(cluster.copies);
            return { canonicalId: keep.track.id, memberIds: cluster.copies.map((copy) => copy.track.id) };
          }),
        },
      });
      saveGroups(result.groups);
      setTab("merged");
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Directory</p>
      <h2 className="mt-1 font-display text-2xl font-semibold">One song, many folders</h2>
      <p className="mt-2 max-w-prose text-muted">
        Copies in different R2 folders stay put. Merge them here so search lists one song. Station desks still play their own file.
      </p>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
        {copies.length} copies · {files.length} same filename · {titles.length} same title · {merged.length} merged
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || files.length === 0}
          onClick={() => void mergeAllFiles()}
          className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-50"
        >
          {busy ? "Merging…" : `Merge ${files.length} filename clusters`}
        </button>
      </div>
      <input className="input mt-4" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter title, station, or folder" />
      <div className="mt-4 flex flex-wrap gap-1">
        {(
          [
            ["file", `Filename · ${files.length}`],
            ["title", `Title · ${titles.length}`],
            ["merged", `Merged · ${merged.length}`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] ${tab === id ? "bg-fg text-bg" : "text-gold"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {visible.length === 0 ? <p className="mt-6 text-muted">Nothing in this list.</p> : null}
      <ul className="mt-4 space-y-3">
        {visible.slice(0, 80).map((cluster) => (
          <ClusterCard key={`${cluster.reason}:${cluster.key}`} cluster={cluster} busy={busy} onMerge={mergeOne} />
        ))}
      </ul>
    </div>
  );
}

function ClusterCard({
  cluster,
  busy,
  onMerge,
}: {
  cluster: CutCluster;
  busy: boolean;
  onMerge: (cluster: CutCluster, canonicalId?: string) => Promise<void>;
}) {
  const preferred = preferCanonical(cluster.copies);
  const [keep, setKeep] = useState(preferred.track.id);
  return (
    <li className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg">{preferred.track.title}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
            {cluster.copies.length} copies · {cluster.reason === "file" ? "same filename" : cluster.reason === "title" ? "same title" : "merged"}
          </p>
        </div>
        {cluster.reason === "merged" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (!window.confirm("Split this directory row back into separate songs? Files stay.")) return;
              void dissolveStationCut({ data: { canonicalId: cluster.key } })
                .then((result) => saveGroups(result.groups))
                .catch(fail);
            }}
            className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
          >
            Split
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void onMerge(cluster, keep)}
            className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg"
          >
            Merge
          </button>
        )}
      </div>
      <ul className="mt-3 space-y-2">
        {cluster.copies.map((copy) => (
          <CopyRow
            key={`${copy.channel.slug}:${copy.track.id}`}
            copy={copy}
            keep={keep}
            onKeep={setKeep}
            merged={cluster.reason === "merged"}
            group={cluster.key}
          />
        ))}
      </ul>
    </li>
  );
}

function CopyRow({
  copy,
  keep,
  onKeep,
  merged,
  group,
}: {
  copy: CutCopy;
  keep: string;
  onKeep: (id: string) => void;
  merged: boolean;
  group: string;
}) {
  return (
    <li className="flex flex-wrap items-center gap-2">
      {merged ? null : (
        <label className="inline-flex h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          <input type="radio" name={`keep-${group}`} checked={keep === copy.track.id} onChange={() => onKeep(copy.track.id)} />
          Directory
        </label>
      )}
      <span className="min-w-0 flex-1">
        <Link to="/player/$id" params={{ id: songKey(copy.track) }} className="block truncate text-sm">
          {copy.track.title}
        </Link>
        <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
          {copy.channel.name} · {formatClock(copy.track.durationSec)} · {copy.folder || copy.filename}
        </span>
      </span>
      {merged ? (
        <button
          type="button"
          onClick={() => {
            void unmergeStationCut({ data: { memberId: copy.track.id } })
              .then((result) => saveGroups(result.groups))
              .catch(fail);
          }}
          className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
        >
          Unmerge
        </button>
      ) : null}
    </li>
  );
}

export function SongCopies({ trackId }: { trackId: string }) {
  const catalog = usePlayerStore((s) => s.catalog);
  const groups = usePlayerStore((s) => s.cutGroups);
  const cueTrack = usePlayerStore((s) => s.cueTrack);
  const copies = copiesOf(catalog, trackId, groups, false);
  if (copies.length <= 1) return null;
  return (
    <FoldSection title={`Copies · ${copies.length}`} hint="Open">
      <p className="text-sm text-muted">Same song on {copies.length} desks. Each folder keeps its file.</p>
      <ul className="mt-3 divide-y divide-line">
        {copies.map((copy) => (
          <li key={`${copy.channel.slug}:${copy.track.id}`} className="flex flex-wrap items-center gap-2 py-3">
            <span className="min-w-0 flex-1">
              <Link to="/channel/$slug" params={{ slug: copy.channel.slug }} className="block truncate">
                {copy.channel.name}
              </Link>
              <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                {formatClock(copy.track.durationSec)} · {copy.folder || copy.filename}
              </span>
            </span>
            <button
              type="button"
              onClick={() => void cueTrack(copy.channel.slug, copy.track.id)}
              className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
            >
              Play this copy
            </button>
            {copy.track.audioUrl ? <DownloadLink track={copy.track} label="File" className="h-11 text-[10px] tracking-[0.12em]" /> : null}
          </li>
        ))}
      </ul>
    </FoldSection>
  );
}

export function AdminMergeBox({ trackId }: { trackId: string }) {
  const catalog = usePlayerStore((s) => s.catalog);
  const groups = usePlayerStore((s) => s.cutGroups);
  const [needle, setNeedle] = useState("");
  const [busy, setBusy] = useState(false);
  const copies = useMemo(() => listCutCopies(catalog, true), [catalog]);
  const hits = useMemo(() => {
    const q = needle.trim().toLowerCase();
    if (q.length < 2) return [];
    const already = new Set(copiesOf(catalog, trackId, groups, true).map((copy) => copy.track.id));
    return copies
      .filter((copy) => !already.has(copy.track.id) && `${copy.track.title} ${copy.channel.name} ${copy.filename}`.toLowerCase().includes(q))
      .slice(0, 12);
  }, [catalog, copies, groups, needle, trackId]);

  async function mergeWith(id: string) {
    setBusy(true);
    try {
      const result = await mergeStationCuts({ data: { canonicalId: trackId, memberIds: [trackId, id] } });
      saveGroups(result.groups);
      setNeedle("");
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Treat as the same song</p>
      <p className="mt-1 text-sm text-muted">Search another title or filename. Merge does not delete R2 files.</p>
      <input className="input mt-2" value={needle} onChange={(event) => setNeedle(event.target.value)} placeholder="Other title or filename" />
      {hits.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {hits.map((copy) => (
            <li key={copy.track.id} className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm">
                {copy.track.title}
                <span className="text-subtle"> · {copy.channel.name}</span>
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => void mergeWith(copy.track.id)}
                className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
              >
                Merge
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
