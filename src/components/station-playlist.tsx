import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  GripVertical,
  Lock,
  MoreHorizontal,
  Search,
  Shuffle,
} from "lucide-react";
import { AdminRename } from "@/components/admin-rename";
import { AdminTrackTools } from "@/components/admin-track-tools";
import { CoverArt } from "@/components/cover-art";
import { GhostCleaner } from "@/components/ghost-cleaner";
import { MarqueeTitle } from "@/components/marquee-title";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getPlayableTracks, getSeedCatalog, normalizeShuffle, shuffleActive } from "@/lib/catalog";
import { cn, formatClock } from "@/lib/cn";
import { stationCopies } from "@/lib/cuts";
import { listCutSkips, patchStationTrack, reorderStationTracks, saveStation } from "@/lib/desk-api";
import { effectiveKind } from "@/lib/listen-mode";
import { songPortrait } from "@/lib/media";
import { durationOf } from "@/lib/playback";
import { useDurationClock } from "@/lib/duration-probe";
import { playlistDuplicateHints } from "@/lib/similar-cuts";
import { ghostDropIds } from "@/lib/playlist-ghosts";
import { isPreviewTag, PHENOMENA, previewTrackOf, sceneFromTags } from "@/lib/phenomena";
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

function stillCover(track: Track, channel: Channel): string {
  return songPortrait(track, channel);
}

export function StationPlaylist({
  channel,
  locked = false,
  onUnlock,
  startOpen = false,
}: {
  channel: Channel;
  locked?: boolean;
  onUnlock?: () => void;
  startOpen?: boolean;
}) {
  const { isAdmin } = useRadioUser();
  const sealed = Boolean(locked && !isAdmin);
  const cueTrack = usePlayerStore((s) => s.cueTrack);
  const nowId = usePlayerStore((s) => (s.channelSlug === channel.slug ? s.track?.id : null));
  const playing = usePlayerStore((s) => s.channelSlug === channel.slug && s.status === "playing");
  const listenMode = usePlayerStore((s) => s.listenModeSession ?? s.listenMode);
  const shufflePref = usePlayerStore((s) => Boolean(s.shuffleBySlug[channel.slug]));
  const cutGroups = usePlayerStore((s) => s.cutGroups);
  const tracks = getPlayableTracks(channel);
  const mixing = shuffleActive(channel, shufflePref);
  const [busy, setBusy] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [arrange, setArrange] = useState(false);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(startOpen);
  const [toolId, setToolId] = useState<string | null>(null);
  const [span, setSpan] = useState<{ mode: SpanMode; custom: number }>({ mode: "5", custom: 8 });
  const [skipKeys, setSkipKeys] = useState<string[]>([]);
  const wrap = effectiveKind(channel, listenMode) !== "fixed";
  const upcoming = useMemo(() => upcomingFrom(tracks, nowId ?? null, wrap), [tracks, nowId, wrap]);
  const totalSec = tracks.reduce((sum, track) => sum + durationOf(track), 0);
  const remainSec = upcoming.reduce((sum, track) => sum + durationOf(track), 0);
  const ghosts = useMemo(() => (isAdmin ? ghostDropIds(channel.tracks) : new Set<string>()), [channel.tracks, isAdmin]);

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
    setOpen(startOpen);
    setArrange(false);
    setFilter("");
    setToolId(null);
  }, [channel.slug, startOpen]);

  function pickSpan(mode: SpanMode, custom = span.custom) {
    const next = { mode, custom };
    setSpan(next);
    saveSpan(next);
    if (mode !== "all") setArrange(false);
  }

  const needle = filter.trim().toLowerCase();
  const browse = open && (span.mode === "all" || mixing);
  const showAll = browse;
  const limit = !open
    ? 1
    : span.mode === "all"
      ? tracks.length
      : span.mode === "custom"
        ? Math.min(Math.max(1, span.custom), tracks.length)
        : Math.min(Number(span.mode), tracks.length);
  const source = showAll ? tracks : upcoming;
  const filtered = useMemo(() => {
    if (!showAll || !needle) return source;
    return source.filter((track) => `${track.title} ${track.artist}`.toLowerCase().includes(needle));
  }, [needle, showAll, source]);
  const visible = showAll ? filtered.slice(0, span.mode === "all" || needle ? filtered.length : limit) : source.slice(0, Math.max(0, limit));
  const hiddenCount = showAll && !needle && span.mode !== "all" ? Math.max(0, filtered.length - visible.length) : !showAll && open ? Math.max(0, upcoming.length - visible.length) : 0;

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

  const canArrange = Boolean(isAdmin && open && span.mode === "all" && !needle);
  const nowTrack = nowId ? tracks.find((item) => item.id === nowId) ?? null : null;
  const nextTrack = mixing ? null : upcoming[0];
  useDurationClock(open ? visible : [nowTrack, nextTrack].filter(Boolean) as Track[]);

  if (sealed) {
    return (
      <section className="mt-6 overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-border)]">
        <div className="rose-desk-lock">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
            <Lock className="size-3.5" />
            Playlist sealed
          </p>
          <p className="font-display text-xl text-fg">Playlist sealed until the rite begins.</p>
          <p className="text-sm text-muted">Start from the first song on the stage. Cinema does not open the playlist.</p>
          {onUnlock ? (
            <button type="button" onClick={onUnlock} className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              Begin the rite on the stage
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-border)]">
      <div className="flex items-center gap-2 px-3 py-1">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              {open ? "Playlist" : mixing ? "Up next · mixed" : "Up next"}
            </span>
            <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              {busy
                ? "Saving…"
                : open
                  ? [
                      `${tracks.length} song${tracks.length === 1 ? "" : "s"}`,
                      tracks.length ? formatClock(totalSec) : null,
                      mixing ? "mix on" : null,
                      !showAll && upcoming.length ? `${visible.length} next` : null,
                      needle ? `${visible.length} match` : null,
                      isAdmin && dupes.size > 0 ? `${dupes.size} possible duplicates` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")
                  : mixing
                    ? `${tracks.length} in the mix`
                    : nextTrack
                      ? `${upcoming.length} left · ${formatClock(remainSec)}`
                      : tracks.length
                        ? "Last song"
                        : "No songs yet"}
            </span>
          </span>
          <ChevronDown className={cn("size-4 shrink-0 text-gold transition-transform duration-200", open && "rotate-180")} />
        </button>
        {isAdmin && open && span.mode === "all" ? (
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
      {open ? (
        <div className="flex flex-wrap items-center gap-2 px-3 pb-2">
          <div className="playlist-span" role="group" aria-label="How many songs to show">
            {PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={span.mode === String(n)}
                onClick={() => pickSpan(String(n) as SpanMode)}
                className="inline-flex h-11 min-w-11 items-center justify-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={span.mode === "all"}
              onClick={() => pickSpan("all")}
              className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
            >
              All
            </button>
            <button
              type="button"
              aria-pressed={span.mode === "custom"}
              onClick={() => pickSpan("custom")}
              className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
            >
              Custom
            </button>
          </div>
          {span.mode === "custom" ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center font-mono text-gold"
                aria-label="Fewer songs"
                onClick={() => pickSpan("custom", Math.max(1, span.custom - 1))}
              >
                −
              </button>
              <input
                className="input h-11 w-14 px-2 text-center"
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
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center font-mono text-gold"
                aria-label="More songs"
                onClick={() => pickSpan("custom", Math.min(99, span.custom + 1))}
              >
                +
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      {open && showAll && tracks.length > 6 ? (
        <div className="px-3 pb-2">
          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-subtle" />
            <input
              className="input pl-9"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Find a song"
              type="search"
              aria-label="Find a song in this playlist"
            />
          </label>
        </div>
      ) : null}
      {isAdmin && open ? <div className="px-3 pb-2"><GhostCleaner channel={channel} compact /></div> : null}
      {canArrange && arrange ? <AdminShufflePolicy channel={channel} /> : null}
      {tracks.length === 0 ? (
        <p className="px-3 pb-3 text-sm text-muted">Nothing in this playlist yet.</p>
      ) : !open && mixing ? (
        <button type="button" onClick={() => setOpen(true)} className="playlist-next text-left">
          <span className="grid size-12 shrink-0 place-items-center rounded-md bg-bg text-gold">
            <Shuffle className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-base font-semibold text-fg">Next song is mixed</span>
            <span className="mt-0.5 block text-sm text-muted">Open the playlist to browse or pick one.</span>
          </span>
        </button>
      ) : !open && (nowId || nextTrack) ? (
        <div className="playlist-peek">
          {nowTrack ? (
            <button type="button" onClick={() => void cueTrack(channel.slug, nowTrack.id)} className="playlist-next is-now">
              <span className="playlist-next-art">
                <CoverArt src={stillCover(nowTrack, channel)} alt="" className="size-full" motion="still" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-gold">{playing ? "Now playing" : "On the needle"}</span>
                <MarqueeTitle text={nowTrack.title} className="font-display text-lg font-semibold text-fg" />
                <span className="mt-0.5 block truncate text-sm text-muted">
                  {nowTrack.artist || "Unknown"} · {formatClock(durationOf(nowTrack))}
                </span>
              </span>
            </button>
          ) : null}
          {nextTrack ? (
            <div className="playlist-next-wrap">
              <button type="button" onClick={() => void cueTrack(channel.slug, nextTrack.id)} className="playlist-next">
                <span className="playlist-next-art">
                  <CoverArt src={stillCover(nextTrack, channel)} alt="" className="size-full" motion="still" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                    Up next{upcoming.length > 1 ? ` · ${upcoming.length} left · ${formatClock(remainSec)}` : ""}
                  </span>
                  <MarqueeTitle text={nextTrack.title} className="font-display text-base font-semibold text-fg" />
                  <span className="mt-0.5 block truncate text-sm text-muted">
                    {nextTrack.artist || "Unknown"} · {formatClock(durationOf(nextTrack))}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-gold">Play</span>
              </button>
              {isAdmin ? <AdminTrackTools slug={channel.slug} track={nextTrack} compact /> : null}
            </div>
          ) : nowTrack ? (
            <p className="px-3 pb-3 text-sm text-muted">Last song. Open the playlist to go back through the list.</p>
          ) : null}
          {upcoming.length > 1 ? (
            <div className="playlist-strip">
              {upcoming.slice(1, 5).map((track, i) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => void cueTrack(channel.slug, track.id)}
                  className="playlist-strip-item"
                  title={track.title}
                >
                  <CoverArt src={stillCover(track, channel)} alt="" className="size-full" motion="still" />
                  <span>{i + 2}</span>
                </button>
              ))}
              {upcoming.length > 5 ? (
                <button type="button" onClick={() => setOpen(true)} className="playlist-strip-more">
                  +{upcoming.length - 5}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : !open && !nextTrack ? (
        <p className="px-3 pb-3 text-sm text-muted">Last song. Open the playlist to go back through the list.</p>
      ) : visible.length === 0 ? (
        <p className="px-3 pb-3 text-sm text-muted">{needle ? "No songs match that name." : "Last song."}</p>
      ) : (
        <ol className={cn("border-t border-line px-2 py-1", visible.length > 7 && "playlist-scroller")}>
          {visible.map((track, queueIndex) => {
            const index = tracks.findIndex((item) => item.id === track.id);
            return (
              <PlaylistRow
                key={track.id}
                channel={channel}
                track={track}
                index={showAll ? index : queueIndex}
                current={nowId === track.id}
                playing={playing && nowId === track.id}
                admin={Boolean(isAdmin)}
                arrange={canArrange && arrange}
                tools={Boolean(isAdmin && (arrange || toolId === track.id))}
                dragging={dragId === track.id}
                onCue={() => void cueTrack(channel.slug, track.id)}
                onUp={() => move(index, -1)}
                onDown={() => move(index, 1)}
                onDragStart={() => setDragId(track.id)}
                onDrop={() => dropOn(track.id)}
                onDragEnd={() => setDragId(null)}
                onTools={() => setToolId((id) => (id === track.id ? null : track.id))}
                duplicate={isAdmin ? dupes.get(track.id) : undefined}
                ghost={isAdmin ? ghosts.has(track.id) : false}
              />
            );
          })}
        </ol>
      )}
      {open && hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => pickSpan("all")}
          className="flex h-11 w-full items-center justify-center border-t border-line font-mono text-[10px] uppercase tracking-[0.14em] text-gold"
        >
          +{hiddenCount} more
        </button>
      ) : null}
    </section>
  );
}

function PlaylistRow({
  channel,
  track,
  index,
  current,
  playing,
  admin,
  arrange,
  tools,
  dragging,
  onCue,
  onUp,
  onDown,
  onDragStart,
  onDrop,
  onDragEnd,
  onTools,
  duplicate,
  ghost,
}: {
  channel: Channel;
  track: Track;
  index: number;
  current: boolean;
  playing: boolean;
  admin: boolean;
  arrange: boolean;
  tools: boolean;
  dragging: boolean;
  onCue: () => void;
  onUp: () => void;
  onDown: () => void;
  onDragStart: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
  onTools: () => void;
  duplicate?: string;
  ghost?: boolean;
}) {
  const scene = sceneFromTags(track.tags);
  const sceneLabel = scene?.phenomenon ? PHENOMENA.find((item) => item.id === scene.phenomenon)?.label : null;
  const arrival = previewTrackOf(getPlayableTracks(channel))?.id === track.id;
  const [arrivalBusy, setArrivalBusy] = useState(false);
  async function setArrival() {
    if (!admin || arrivalBusy) return;
    setArrivalBusy(true);
    try {
      const playable = getPlayableTracks(channel);
      let last: { tracks: Parameters<typeof applySnapshot>[0]; stations: Parameters<typeof applySnapshot>[1] } | null = null;
      if (!arrival) {
        for (const other of playable) {
          if (other.id === track.id || !(other.tags ?? []).some(isPreviewTag)) continue;
          const tags = (other.tags ?? []).filter((tag) => !isPreviewTag(tag)).join(", ");
          const result = await patchStationTrack({ data: { channelSlug: channel.slug, trackId: other.id, tags } });
          last = result;
        }
      }
      const nextTags = arrival
        ? (track.tags ?? []).filter((tag) => !isPreviewTag(tag))
        : [...(track.tags ?? []).filter((tag) => !isPreviewTag(tag)), "preview"];
      const result = await patchStationTrack({ data: { channelSlug: channel.slug, trackId: track.id, tags: nextTags.join(", ") } });
      last = result;
      if (last) applySnapshot(last.tracks, last.stations);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not set the arrival preview");
    } finally {
      setArrivalBusy(false);
    }
  }
  return (
    <li
      className={cn("playlist-row", current && "playlist-row-now", ghost && "playlist-row-ghost", dragging && "opacity-40")}
      aria-current={current ? "true" : undefined}
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
      ) : playing ? (
        <span className="vu-meter vu-meter-on w-7 shrink-0 justify-center" aria-hidden>
          <span />
          <span />
          <span />
        </span>
      ) : (
        <span className="w-7 shrink-0 text-center font-mono text-[10px] tabular-nums text-subtle">{String(index + 1).padStart(2, "0")}</span>
      )}
      <button type="button" onClick={onCue} className="flex min-w-0 flex-1 basis-40 items-center gap-3 overflow-hidden py-1 text-left">
        <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-bg">
          <CoverArt src={stillCover(track, channel)} alt="" className="size-full" motion="still" />
          {admin && (duplicate || ghost) ? (
            <span
              className="playlist-dupe absolute top-0.5 right-0.5 inline-flex size-4 items-center justify-center rounded-full bg-bg"
              title={ghost ? "Ghost copy — extra row of a song already here" : `Possible duplicate · ${duplicate}`}
              aria-label={ghost ? "Ghost copy" : `Possible duplicate: ${duplicate}`}
            >
              <CircleAlert className="size-3.5" />
            </span>
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <MarqueeTitle text={track.title} className={cn("text-sm font-medium", current && "text-gold")} />
          <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.1em] text-subtle">
            {[track.artist || "Unknown", sceneLabel, arrival ? "arrival preview" : null, ghost ? "ghost copy" : duplicate ? "possible duplicate" : null]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
        <span className="min-w-14 shrink-0 text-right font-mono text-[11px] tabular-nums text-muted">{formatClock(durationOf(track))}</span>
      </button>
      <Link
        to="/player/$id"
        params={{ id: songKey(track) }}
        aria-label={`Open ${track.title}`}
        className="inline-flex size-11 shrink-0 items-center justify-center text-gold"
      >
        <ChevronRight className="size-4" />
      </Link>
      {admin && !arrange ? (
        <>
          <button
            type="button"
            onClick={() => void setArrival()}
            disabled={arrivalBusy}
            aria-pressed={arrival}
            className={cn(
              "inline-flex h-11 shrink-0 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em]",
              arrival ? "text-gold" : "text-subtle",
            )}
          >
            {arrival ? "Arrival" : "Set arrival"}
          </button>
          <AdminTrackTools slug={channel.slug} track={track} compact />
          <button
            type="button"
            onClick={onTools}
            aria-expanded={tools}
            aria-label="Song tools"
            className="inline-flex size-11 shrink-0 items-center justify-center text-gold"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </>
      ) : null}
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
      {admin && tools ? (
        <div className="flex w-full flex-wrap items-center justify-end gap-1 pb-1">
          <AdminRename slug={channel.slug} track={track} compact />
        </div>
      ) : null}
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
