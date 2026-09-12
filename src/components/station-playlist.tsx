import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpDown, ChevronRight, CircleAlert, GripVertical } from "lucide-react";
import { AdminRename } from "@/components/admin-rename";
import { AdminTrackTools } from "@/components/admin-track-tools";
import { MarqueeTitle } from "@/components/marquee-title";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getPlayableTracks, getSeedCatalog, normalizeShuffle } from "@/lib/catalog";
import { cn, formatClock } from "@/lib/cn";
import { stationCopies } from "@/lib/cuts";
import { listCutSkips, reorderStationTracks, saveStation } from "@/lib/desk-api";
import { effectiveKind } from "@/lib/listen-mode";
import { durationOf } from "@/lib/playback";
import { playlistDuplicateHints } from "@/lib/similar-cuts";
import { useRadioUser } from "@/lib/radio-user";
import { songKey } from "@/lib/song-url";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel, ShuffleMode, Track } from "@/lib/types";

function applySnapshot(tracks: Parameters<typeof applyCatalogEdits>[1], stations: Parameters<typeof applyCatalogEdits>[2]) {
  usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}

const SPAN_KEY = "radio.playlist.span.v1";
const PRESETS = [3, 5, 10] as const;
type SpanMode = "3" | "5" | "10" | "all" | "custom";

function loadSpan(): { mode: SpanMode; custom: number } {
  if (typeof window === "undefined") return { mode: "5", custom: 8 };
  try {
    const raw = window.localStorage.getItem(SPAN_KEY);
    if (!raw) return { mode: "5", custom: 8 };
    const parsed = JSON.parse(raw) as { mode?: string; custom?: number };
    const mode: SpanMode =
      parsed.mode === "3" || parsed.mode === "5" || parsed.mode === "10" || parsed.mode === "all" || parsed.mode === "custom"
        ? parsed.mode
        : "5";
    const custom = Number.isFinite(parsed.custom) ? Math.min(99, Math.max(1, Math.round(Number(parsed.custom)))) : 8;
    return { mode, custom };
  } catch {
    return { mode: "5", custom: 8 };
  }
}

function saveSpan(next: { mode: SpanMode; custom: number }) {
  try {
    window.localStorage.setItem(SPAN_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function upcomingFrom(tracks: Track[], nowId: string | null, wrap: boolean): Track[] {
  if (tracks.length === 0) return [];
  const index = nowId ? tracks.findIndex((track) => track.id === nowId) : -1;
  if (index < 0) return tracks;
  const rest = tracks.slice(index + 1);
  return wrap ? rest.concat(tracks.slice(0, index)) : rest;
}

export function StationPlaylist({ channel }: { channel: Channel }) {
  const { isAdmin } = useRadioUser();
  const cueTrack = usePlayerStore((s) => s.cueTrack);
  const nowId = usePlayerStore((s) => (s.channelSlug === channel.slug ? s.track?.id : null));
  const listenMode = usePlayerStore((s) => s.listenModeSession ?? s.listenMode);
  const cutGroups = usePlayerStore((s) => s.cutGroups);
  const tracks = getPlayableTracks(channel);
  const [busy, setBusy] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [arrange, setArrange] = useState(false);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [span, setSpan] = useState<{ mode: SpanMode; custom: number }>({ mode: "5", custom: 8 });
  const [skipKeys, setSkipKeys] = useState<string[]>([]);
  const wrap = effectiveKind(channel, listenMode) !== "fixed";
  const upcoming = useMemo(() => upcomingFrom(tracks, nowId ?? null, wrap), [tracks, nowId, wrap]);
  const totalSec = tracks.reduce((sum, track) => sum + durationOf(track), 0);
  const dupes = useMemo(() => {
    if (!isAdmin) return new Map<string, string>();
    return playlistDuplicateHints(stationCopies(channel), cutGroups, skipKeys);
  }, [channel, cutGroups, isAdmin, skipKeys, tracks]);

  useEffect(() => {
    setSpan(loadSpan());
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    void listCutSkips()
      .then((data) => setSkipKeys(data.keys))
      .catch(() => setSkipKeys([]));
  }, [isAdmin]);

  useEffect(() => {
    setOpen(false);
    setArrange(false);
    setFilter("");
  }, [channel.slug]);

  function pickSpan(mode: SpanMode, custom = span.custom) {
    const next = { mode, custom };
    setSpan(next);
    saveSpan(next);
    if (mode !== "all") setArrange(false);
  }

  const needle = filter.trim().toLowerCase();
  const showAll = open && span.mode === "all";
  const limit = !open
    ? 1
    : span.mode === "all"
      ? tracks.length
      : span.mode === "custom"
        ? Math.min(Math.max(1, span.custom), upcoming.length || tracks.length)
        : Math.min(Number(span.mode), upcoming.length || tracks.length);
  const source = showAll ? tracks : upcoming;
  const filtered = useMemo(() => {
    if (!showAll || !needle) return source;
    return source.filter((track) => `${track.title} ${track.artist}`.toLowerCase().includes(needle));
  }, [needle, showAll, source]);
  const visible = showAll ? filtered : source.slice(0, Math.max(0, limit));

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

  const canArrange = Boolean(isAdmin && open && showAll && !needle);
  const nextTrack = upcoming[0];

  return (
    <section className="mt-6 overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-border)]">
      <div className="flex items-center gap-2 px-3 py-1">
        <h2 className="min-w-0 flex-1 truncate py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
          {open ? "Playlist" : "Up next"}
          {open
            ? ` · ${tracks.length}${tracks.length ? ` · ${formatClock(totalSec)}` : ""}`
            : nextTrack
              ? ` · ${upcoming.length} remain`
              : ""}
          {open && !showAll ? ` · ${visible.length} shown` : ""}
          {open && needle ? ` · ${visible.length} match` : ""}
          {isAdmin && open && dupes.size > 0 ? ` · ${dupes.size} possible duplicates` : ""}
          {busy ? " · Saving…" : ""}
        </h2>
        {isAdmin && open && showAll ? (
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
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="inline-flex h-11 shrink-0 items-center font-mono text-[10px] uppercase tracking-[0.14em] text-gold"
        >
          {open ? "Close" : "Open"}
        </button>
      </div>
      {open ? (
        <div className="flex flex-wrap items-center gap-1 px-3 pb-2">
          {PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => pickSpan(String(n) as SpanMode)}
              className={cn(
                "inline-flex h-11 min-w-11 items-center justify-center px-3 font-mono text-[10px] uppercase tracking-[0.12em]",
                span.mode === String(n) ? "bg-fg text-bg" : "text-gold",
              )}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => pickSpan("all")}
            className={cn(
              "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em]",
              span.mode === "all" ? "bg-fg text-bg" : "text-gold",
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => pickSpan("custom")}
            className={cn(
              "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em]",
              span.mode === "custom" ? "bg-fg text-bg" : "text-gold",
            )}
          >
            Custom
          </button>
          {span.mode === "custom" ? (
            <input
              className="input h-11 w-16 px-2 text-center"
              type="number"
              min={1}
              max={99}
              value={span.custom}
              aria-label="Custom playlist length"
              onChange={(event) => {
                const n = Math.min(99, Math.max(1, Number(event.target.value) || 1));
                pickSpan("custom", n);
              }}
            />
          ) : null}
        </div>
      ) : null}
      {open && showAll && tracks.length > 8 ? (
        <div className="px-3 pb-2">
          <input
            className="input"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter this playlist"
          />
        </div>
      ) : null}
      {canArrange && arrange ? <AdminShufflePolicy channel={channel} /> : null}
      {tracks.length === 0 ? (
        <p className="px-3 pb-3 text-sm text-muted">Empty desk.</p>
      ) : !open && !nextTrack ? (
        <p className="px-3 pb-3 text-sm text-muted">Last song on the desk.</p>
      ) : visible.length === 0 ? (
        <p className="px-3 pb-3 text-sm text-muted">{needle ? "No songs match." : "Last song on the desk."}</p>
      ) : (
        <ol className="border-t border-line px-2 py-1">
          {visible.map((track) => {
            const index = tracks.findIndex((item) => item.id === track.id);
            return (
              <PlaylistRow
                key={track.id}
                slug={channel.slug}
                track={track}
                index={index}
                current={nowId === track.id}
                admin={Boolean(isAdmin)}
                arrange={canArrange && arrange}
                dragging={dragId === track.id}
                onCue={() => void cueTrack(channel.slug, track.id)}
                onUp={() => move(index, -1)}
                onDown={() => move(index, 1)}
                onDragStart={() => setDragId(track.id)}
                onDrop={() => dropOn(track.id)}
                onDragEnd={() => setDragId(null)}
                duplicate={isAdmin ? dupes.get(track.id) : undefined}
              />
            );
          })}
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
  duplicate,
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
  duplicate?: string;
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
        <span className="w-7 shrink-0 text-center font-mono text-[10px] tabular-nums text-subtle">{String(index + 1).padStart(2, "0")}</span>
      )}
      <button
        type="button"
        onClick={onCue}
        className="flex min-w-0 flex-1 basis-0 items-center gap-2 overflow-hidden py-2 text-left"
      >
        {admin && duplicate ? (
          <span
            className="playlist-dupe inline-flex size-7 shrink-0 items-center justify-center"
            title={`Possible duplicate · ${duplicate}`}
            aria-label={`Possible duplicate: ${duplicate}`}
          >
            <CircleAlert className="size-4" />
          </span>
        ) : null}
        <MarqueeTitle text={track.title} className={cn("min-w-0 w-0 flex-1 text-sm", current && "text-gold")} />
        <span className="w-10 shrink-0 text-right font-mono text-[10px] tabular-nums text-subtle">{formatClock(durationOf(track))}</span>
      </button>
      <Link
        to="/player/$id"
        params={{ id: songKey(track) }}
        aria-label={`Open ${track.title}`}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center font-mono text-[10px] uppercase tracking-[0.12em] text-gold sm:w-auto sm:px-2"
      >
        <span className="hidden sm:inline">Open</span>
        <ChevronRight className="size-4 sm:hidden" />
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
      {admin && !arrange ? <AdminRename slug={slug} track={track} compact={!current} /> : null}
      {admin ? <AdminTrackTools slug={slug} track={track} compact /> : null}
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
