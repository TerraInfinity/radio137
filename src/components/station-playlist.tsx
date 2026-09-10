import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpDown, GripVertical } from "lucide-react";
import { AdminRename } from "@/components/admin-rename";
import { MarqueeTitle } from "@/components/marquee-title";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getPlayableTracks, getSeedCatalog, normalizeShuffle } from "@/lib/catalog";
import { cn, formatClock } from "@/lib/cn";
import { reorderStationTracks, saveStation } from "@/lib/desk-api";
import { durationOf } from "@/lib/playback";
import { useRadioUser } from "@/lib/radio-user";
import { songKey } from "@/lib/song-url";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel, ShuffleMode, Track } from "@/lib/types";

function applySnapshot(tracks: Parameters<typeof applyCatalogEdits>[1], stations: Parameters<typeof applyCatalogEdits>[2]) {
  usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}

export function StationPlaylist({ channel }: { channel: Channel }) {
  const { isAdmin } = useRadioUser();
  const cueTrack = usePlayerStore((s) => s.cueTrack);
  const nowId = usePlayerStore((s) => (s.channelSlug === channel.slug ? s.track?.id : null));
  const tracks = getPlayableTracks(channel);
  const [busy, setBusy] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [arrange, setArrange] = useState(false);

  async function persist(ids: string[]) {
    const hidden = channel.tracks.filter((track) => track.enabled === false).map((track) => track.id);
    setBusy(true);
    try {
      const result = await reorderStationTracks({ data: { channelSlug: channel.slug, trackIds: [...ids, ...hidden] } });
      applySnapshot(result.tracks, result.stations);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not reorder");
    } finally {
      setBusy(false);
    }
  }

  function move(index: number, dir: -1 | 1) {
    const ids = tracks.map((track) => track.id);
    const next = index + dir;
    if (next < 0 || next >= ids.length) return;
    [ids[index], ids[next]] = [ids[next], ids[index]];
    void persist(ids);
  }

  function dropOn(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const ids = tracks.map((track) => track.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) {
      setDragId(null);
      return;
    }
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    setDragId(null);
    void persist(ids);
  }

  return (
    <section className="mt-6 overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-border)]">
      <div className="flex items-center gap-2 px-3 py-1">
        <h2 className="min-w-0 flex-1 truncate py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
          Playlist · {tracks.length}
          {busy ? " · Saving…" : ""}
        </h2>
        {isAdmin ? (
          <button
            type="button"
            onClick={() => setArrange((value) => !value)}
            aria-pressed={arrange}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-gold"
          >
            <ArrowUpDown className="size-3.5" />
            {arrange ? "Done" : "Arrange"}
          </button>
        ) : null}
      </div>
      {isAdmin && arrange ? <AdminShufflePolicy channel={channel} /> : null}
      {tracks.length === 0 ? (
        <p className="px-3 pb-3 text-sm text-muted">Empty desk.</p>
      ) : (
        <ol className="border-t border-line px-2 py-1">
          {tracks.map((track, index) => (
            <PlaylistRow
              key={track.id}
              slug={channel.slug}
              track={track}
              index={index}
              current={nowId === track.id}
              admin={Boolean(isAdmin)}
              arrange={arrange}
              dragging={dragId === track.id}
              onCue={() => void cueTrack(channel.slug, track.id)}
              onUp={() => move(index, -1)}
              onDown={() => move(index, 1)}
              onDragStart={() => setDragId(track.id)}
              onDrop={() => dropOn(track.id)}
              onDragEnd={() => setDragId(null)}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function PlaylistRow({
  slug,
  track,
  index,
  current,
  admin,
  arrange,
  dragging,
  onCue,
  onUp,
  onDown,
  onDragStart,
  onDrop,
  onDragEnd,
}: {
  slug: string;
  track: Track;
  index: number;
  current: boolean;
  admin: boolean;
  arrange: boolean;
  dragging: boolean;
  onCue: () => void;
  onUp: () => void;
  onDown: () => void;
  onDragStart: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  return (
    <li
      className={cn("flex flex-wrap items-center gap-x-1 rounded-md px-1", current && "bg-bg", dragging && "opacity-40")}
      onDragOver={(event) => {
        if (!admin || !arrange) return;
        event.preventDefault();
      }}
      onDrop={(event) => {
        if (!admin || !arrange) return;
        event.preventDefault();
        onDrop();
      }}
    >
      {admin && arrange ? (
        <button
          type="button"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", track.id);
            onDragStart();
          }}
          onDragEnd={onDragEnd}
          aria-label="Drag to reorder"
          className="grid size-11 shrink-0 place-items-center text-subtle"
        >
          <GripVertical className="size-4" />
        </button>
      ) : (
        <span className="w-8 shrink-0 text-center font-mono text-[10px] tabular-nums text-subtle">{String(index + 1).padStart(2, "0")}</span>
      )}
      <button
        type="button"
        onClick={onCue}
        className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden py-2 text-left"
      >
        <MarqueeTitle text={track.title} className={cn("min-w-0 flex-1 text-sm", current && "text-gold")} />
        <span className="shrink-0 font-mono text-[10px] tabular-nums text-subtle">{formatClock(durationOf(track))}</span>
      </button>
      <Link
        to="/player/$id"
        params={{ id: songKey(track) }}
        className="inline-flex h-11 shrink-0 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
      >
        Open
      </Link>
      {admin && arrange ? (
        <>
          <button type="button" onClick={onUp} className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
            Up
          </button>
          <button type="button" onClick={onDown} className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
            Down
          </button>
        </>
      ) : null}
      {admin && !arrange ? <AdminRename slug={slug} track={track} compact /> : null}
    </li>
  );
}

function AdminShufflePolicy({ channel }: { channel: Channel }) {
  const [busy, setBusy] = useState(false);
  const current = normalizeShuffle(channel.shuffle);
  async function setMode(shuffle: ShuffleMode) {
    if (shuffle === current) return;
    setBusy(true);
    try {
      const result = await saveStation({ data: { slug: channel.slug, shuffle } });
      applySnapshot(result.tracks, result.stations);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not save shuffle");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex flex-wrap gap-1 border-t border-line px-3 py-2">
      {(
        [
          ["off", "Fixed order"],
          ["optional", "Guests can toggle"],
          ["on", "Always shuffle"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          disabled={busy}
          onClick={() => void setMode(id)}
          className={cn("inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em]", current === id ? "bg-fg text-bg" : "text-gold")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
