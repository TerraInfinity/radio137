import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpDown } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { FoldSection } from "@/components/fold-section";
import { ModePill } from "@/components/mode-pill";
import { StationSettingsForm } from "@/components/station-settings";
import {
  addStationTrack,
  deleteStationFile,
  hideStationTrack,
  patchStationTrack,
  placeStationTrack,
  reorderStationTracks,
  restoreStationTrack,
  saveStation,
  setFeaturedRail,
} from "@/lib/desk-api";
import { applyCatalogEdits, type CatalogEdit, type StationEdit } from "@/lib/catalog-edits";
import { getSeedCatalog, kindHint, kindLabel, normalizeKind } from "@/lib/catalog";
import { cn, formatClock, slugify } from "@/lib/cn";
import { fileLocationLabel, r2KeyFromAudioUrl } from "@/lib/file-path";
import { songKey } from "@/lib/song-url";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel, StationKind, Track } from "@/lib/types";

function applySnapshot(tracks: CatalogEdit[], stations: StationEdit[]) {
  usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}

function fail(error: unknown) {
  window.alert(error instanceof Error ? error.message : "Desk save failed");
}

function readDeskStation(): string | null {
  try {
    return window.localStorage.getItem("radio.desk.station");
  } catch {
    return null;
  }
}

export function DeskStations({ channels, r2Configured }: { channels: Channel[]; r2Configured: boolean }) {
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "live" | "ondemand" | "fixed" | "featured" | "off" | "empty">("all");
  const [open, setOpen] = useState<string | null>(null);
  const playingSlug = usePlayerStore((s) => s.channelSlug);
  const selected = channels.find((channel) => channel.slug === open) ?? null;
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return channels.filter((channel) => {
      const liveCount = channel.tracks.filter((track) => track.enabled !== false).length;
      if (kindFilter === "live" && normalizeKind(channel.kind) !== "live") return false;
      if (kindFilter === "ondemand" && normalizeKind(channel.kind) !== "ondemand") return false;
      if (kindFilter === "fixed" && normalizeKind(channel.kind) !== "fixed") return false;
      if (kindFilter === "featured" && !channel.featured) return false;
      if (kindFilter === "off" && channel.enabled) return false;
      if (kindFilter === "empty" && liveCount > 0) return false;
      if (!needle) return true;
      if (`${channel.name} ${channel.slug} ${channel.kind}`.toLowerCase().includes(needle)) return true;
      return channel.tracks.some((track) => track.enabled !== false && `${track.title} ${track.artist}`.toLowerCase().includes(needle));
    });
  }, [channels, query, kindFilter]);
  const songHits = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];
    const rows: Array<{ station: Channel; track: Track }> = [];
    for (const channel of channels) {
      for (const track of channel.tracks) {
        if (track.enabled === false) continue;
        if (!`${track.title} ${track.artist}`.toLowerCase().includes(needle)) continue;
        rows.push({ station: channel, track });
        if (rows.length >= 12) return rows;
      }
    }
    return rows;
  }, [channels, query]);

  useEffect(() => {
    const saved = readDeskStation();
    if (saved && channels.some((channel) => channel.slug === saved)) setOpen(saved);
  }, [channels]);

  function pick(slug: string) {
    setOpen(slug);
    try {
      window.localStorage.setItem("radio.desk.station", slug);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <NewStationForm />
      <FeaturedRail channels={channels} />
      <section className="grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <div>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Stations</span>
            <input className="input mt-1" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Station or song" />
          </label>
          <div className="mt-2 flex flex-wrap gap-1">
            {(
              [
                ["all", "All"],
                ["live", "Live"],
                ["ondemand", "On demand"],
                ["fixed", "Fixed"],
                ["featured", "Featured"],
                ["off", "Off air"],
                ["empty", "Empty"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setKindFilter(id)}
                className={cn(
                  "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em]",
                  kindFilter === id ? "bg-fg text-bg" : "text-gold",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {playingSlug && channels.some((channel) => channel.slug === playingSlug) ? (
            <button
              type="button"
              onClick={() => pick(playingSlug)}
              className="mt-2 inline-flex h-11 items-center font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
            >
              Open what’s playing
            </button>
          ) : null}
          {songHits.length > 0 ? (
            <ul className="mt-2 space-y-1 rounded-lg bg-bg p-2">
              {songHits.map(({ station, track }) => (
                <li key={`${station.slug}:${track.id}`}>
                  <button type="button" onClick={() => pick(station.slug)} className="flex w-full items-center gap-2 py-1 text-left">
                    <span className="min-w-0 flex-1 truncate text-sm">{track.title}</span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{station.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <ul className="mt-3 max-h-[36rem] space-y-1 overflow-y-auto rounded-xl bg-bg-elevated p-2 shadow-[var(--shadow-filigree)]">
            {visible.map((channel) => {
              const songs = channel.tracks.filter((track) => track.enabled !== false).length;
              return (
                <li key={channel.slug}>
                  <button
                    type="button"
                    onClick={() => pick(channel.slug)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg p-2 text-left",
                      open === channel.slug ? "bg-bg shadow-[var(--shadow-filigree)]" : "hover:bg-bg",
                    )}
                  >
                    <CoverArt src={channel.cover} alt="" className="size-11 shrink-0 rounded-md" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-base font-semibold">{channel.name}</span>
                      <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                        {kindLabel(channel.kind)} · {songs} {songs === 1 ? "song" : "songs"}
                        {channel.featured ? " · featured" : ""}
                        {channel.enabled ? "" : " · off air"}
                        {songs === 0 ? " · empty" : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        {selected ? (
          <StationWorkspace key={selected.slug} channel={selected} channels={channels} r2Configured={r2Configured} />
        ) : (
          <p className="self-start rounded-xl bg-bg-elevated p-6 text-sm text-muted shadow-[var(--shadow-border)]">
            Pick a station to edit its playlist. Add songs from another desk, upload files, or drop in a URL.
          </p>
        )}
      </section>
    </div>
  );
}

function FeaturedRail({ channels }: { channels: Channel[] }) {
  const [busy, setBusy] = useState(false);
  const [pick, setPick] = useState("");
  const featured = useMemo(
    () =>
      [...channels]
        .filter((channel) => channel.featured)
        .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99) || a.name.localeCompare(b.name)),
    [channels],
  );
  const rest = channels.filter((channel) => !channel.featured);
  const slugs = featured.map((channel) => channel.slug);

  async function commit(next: string[]) {
    setBusy(true);
    try {
      const result = await setFeaturedRail({ data: { slugs: next } });
      applySnapshot(result.tracks, result.stations);
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <FoldSection title={`Featured rail · ${featured.length}`} hint="Edit" className="mt-0">
      <p className="text-sm text-muted">This is the homepage rail. Move, remove, or add a station here — you do not need to open the station first.</p>
      {featured.length === 0 ? <p className="mt-3 text-sm text-subtle">Nothing on the rail yet.</p> : null}
      <ul className="mt-3 space-y-2">
        {featured.map((channel, index) => (
          <li key={channel.slug} className="flex flex-wrap items-center gap-2 rounded-lg bg-bg p-2">
            <CoverArt src={channel.cover} alt="" className="size-12 shrink-0 rounded-md" />
            <span className="w-6 font-mono text-[11px] tabular-nums text-subtle">{index + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-display text-lg font-semibold">{channel.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{kindLabel(channel.kind)}</span>
            </span>
            <button
              type="button"
              disabled={busy || index === 0}
              onClick={() => {
                const next = [...slugs];
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                void commit(next);
              }}
              className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold disabled:opacity-40"
            >
              Up
            </button>
            <button
              type="button"
              disabled={busy || index === featured.length - 1}
              onClick={() => {
                const next = [...slugs];
                [next[index + 1], next[index]] = [next[index], next[index + 1]];
                void commit(next);
              }}
              className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold disabled:opacity-40"
            >
              Down
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void commit(slugs.filter((slug) => slug !== channel.slug))}
              className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ember"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-4 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!pick) return;
          void commit([...slugs, pick]).then(() => setPick(""));
        }}
      >
        <select className="input min-w-56 flex-1" value={pick} onChange={(event) => setPick(event.target.value)} disabled={busy}>
          <option value="">Add a station to the rail</option>
          {rest.map((channel) => (
            <option key={channel.slug} value={channel.slug}>
              {channel.name}
            </option>
          ))}
        </select>
        <button type="submit" disabled={busy || !pick} className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-50">
          Add to rail
        </button>
      </form>
    </FoldSection>
  );
}

function NewStationForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [kind, setKind] = useState<StationKind>("fixed");
  const [featured, setFeatured] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <FoldSection title="New station" hint="Create" className="mt-0">
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const nextSlug = slugify(slug || name);
        if (!name.trim() || !nextSlug) return;
        setBusy(true);
        void saveStation({
          data: {
            slug: nextSlug,
            added: true,
            name: name.trim(),
            kind,
            featured,
            enabled: true,
            energy: kind === "fixed" ? "start to finish" : kind === "ondemand" ? "on demand" : "clock",
            category: "Custom",
          },
        })
          .then((result) => {
            applySnapshot(result.tracks, result.stations);
            setName("");
            setSlug("");
            setFeatured(false);
          })
          .catch(fail)
          .finally(() => setBusy(false));
      }}
    >
      <p className="text-sm text-muted">Fixed plays start to finish. Live joins a shared clock. On demand waits until you pick a song.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
        <input className="input" value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="slug (optional)" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(["live", "ondemand", "fixed"] as const).map((value) => (
          <label key={value} className={cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", kind === value ? "bg-fg text-bg" : "text-gold")}>
            <input type="radio" className="sr-only" checked={kind === value} onChange={() => setKind(value)} />
            {kindLabel(value)}
          </label>
        ))}
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{kindHint(kind)}</p>
      <label className="mt-3 inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
        Put on featured rail
      </label>
      <div className="mt-2">
        <button type="submit" disabled={busy} className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
          {busy ? "Creating…" : "Create station"}
        </button>
      </div>
    </form>
    </FoldSection>
  );
}

function StationWorkspace({
  channel,
  channels,
  r2Configured,
}: {
  channel: Channel;
  channels: Channel[];
  r2Configured: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [addMode, setAddMode] = useState<"library" | "upload" | "url">("library");
  const others = channels.filter((item) => item.slug !== channel.slug);

  return (
    <div className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Editing</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight">{channel.name}</h2>
        </div>
        <ModePill kind={channel.kind} mode={channel.mode} enabled={channel.enabled} nsfw={channel.nsfw} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to="/channel/$slug"
            params={{ slug: channel.slug }}
            className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
          >
            View station
          </Link>
          <button
            type="button"
            onClick={() => void usePlayerStore.getState().tuneIn(channel.slug, { forcePlay: true })}
            className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
          >
            Listen
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              const featured = channels.filter((item) => item.featured).sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99));
              const slugs = featured.map((item) => item.slug);
              const next = channel.featured ? slugs.filter((slug) => slug !== channel.slug) : [...slugs, channel.slug];
              setBusy(true);
              void setFeaturedRail({ data: { slugs: next } })
                .then((result) => applySnapshot(result.tracks, result.stations))
                .catch(fail)
                .finally(() => setBusy(false));
            }}
            className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
          >
            {channel.featured ? "Remove from featured" : "Add to featured"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              const nextHidden = channel.enabled;
              if (nextHidden && !window.confirm(`Take “${channel.name}” off air?`)) return;
              setBusy(true);
              void saveStation({ data: { slug: channel.slug, hidden: nextHidden, enabled: !nextHidden } })
                .then((result) => applySnapshot(result.tracks, result.stations))
                .finally(() => setBusy(false));
            }}
            className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ember"
          >
            {channel.enabled ? "Take off air" : "Restore to air"}
          </button>
      </div>
      <FoldSection title="Station settings" hint="Edit" className="mt-4" titleClassName="text-gold">
        <StationSettingsForm key={`${channel.slug}:${channel.shuffle}:${channel.kind}`} channel={channel} compact />
      </FoldSection>

      <FoldSection title="Add songs" hint="Open" className="mt-8" titleClassName="text-gold">
        <div className="flex flex-wrap gap-1">
          {(
            [
              ["library", "From another station"],
              ["upload", "Upload files"],
              ["url", "From URL"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setAddMode(id)}
              className={cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", addMode === id ? "bg-fg text-bg" : "text-gold")}
            >
              {label}
            </button>
          ))}
        </div>
        {addMode === "library" ? <LibraryPicker channel={channel} others={others} /> : null}
        {addMode === "upload" ? r2Configured ? <UploadDrop slug={channel.slug} cover={channel.cover} /> : <p className="mt-3 text-sm text-muted">R2 keys are dark — use the Services tab.</p> : null}
        {addMode === "url" ? <UrlAddForm channel={channel} /> : null}
      </FoldSection>

      <Playlist channel={channel} others={others} r2Configured={r2Configured} />
    </div>
  );
}

function UrlAddForm({ channel }: { channel: Channel }) {
  const [title, setTitle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="mt-3 flex flex-wrap gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim() || !audioUrl.trim()) return;
        setBusy(true);
        void addStationTrack({ data: { channelSlug: channel.slug, title: title.trim(), audioUrl: audioUrl.trim(), coverUrl: channel.cover } })
          .then((result) => {
            applySnapshot(result.tracks, result.stations);
            setTitle("");
            setAudioUrl("");
          })
          .catch(fail)
          .finally(() => setBusy(false));
      }}
    >
      <input className="input max-w-xs" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
      <input className="input min-w-64 flex-1" value={audioUrl} onChange={(event) => setAudioUrl(event.target.value)} placeholder="https://…" />
      <button type="submit" disabled={busy} className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
        Add URL
      </button>
    </form>
  );
}

function LibraryPicker({ channel, others }: { channel: Channel; others: Channel[] }) {
  const [needle, setNeedle] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const hits = useMemo(() => {
    const q = needle.trim().toLowerCase();
    if (q.length < 2) return [];
    const rows: Array<{ station: Channel; track: Track }> = [];
    for (const station of others) {
      for (const track of station.tracks) {
        if (track.enabled === false) continue;
        if (!`${track.title} ${track.artist} ${station.name}`.toLowerCase().includes(q)) continue;
        rows.push({ station, track });
        if (rows.length >= 40) return rows;
      }
    }
    return rows;
  }, [needle, others]);

  async function place(station: Channel, track: Track, mode: "copy" | "move") {
    const key = `${mode}:${track.id}`;
    setBusy(key);
    try {
      const result = await placeStationTrack({
        data: { fromSlug: station.slug, trackId: track.id, toSlug: channel.slug, mode },
      });
      applySnapshot(result.tracks, result.stations);
    } catch (error) {
      fail(error);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-3">
      <input className="input" value={needle} onChange={(event) => setNeedle(event.target.value)} placeholder="Search titles across other stations" />
      {needle.trim().length < 2 ? (
        <p className="mt-2 text-sm text-subtle">Type two letters to find a song on another desk, then copy or move it here.</p>
      ) : hits.length === 0 ? (
        <p className="mt-2 text-sm text-subtle">No matching songs.</p>
      ) : (
        <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-lg bg-bg p-2">
          {hits.map(({ station, track }) => (
            <li key={`${station.slug}:${track.id}`} className="flex flex-wrap items-center gap-2 py-1">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{track.title}</span>
                <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                  {station.name} · {track.artist}
                </span>
              </span>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => void place(station, track, "copy")}
                className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
              >
                {busy === `copy:${track.id}` ? "…" : "Copy here"}
              </button>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => void place(station, track, "move")}
                className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
              >
                {busy === `move:${track.id}` ? "…" : "Move here"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Playlist({ channel, others, r2Configured }: { channel: Channel; others: Channel[]; r2Configured: boolean }) {
  const [filter, setFilter] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [arrange, setArrange] = useState(false);
  const [busy, setBusy] = useState(false);
  const nowId = usePlayerStore((s) => (s.channelSlug === channel.slug ? s.track?.id : null));
  const live = channel.tracks.filter((track) => track.enabled !== false);
  const hidden = channel.tracks.filter((track) => track.enabled === false);
  const totalSec = live.reduce((sum, track) => sum + (track.durationSec || 0), 0);
  const visible = useMemo(() => {
    const source = showHidden ? channel.tracks : live;
    const q = filter.trim().toLowerCase();
    if (!q) return source;
    return source.filter((track) => `${track.title} ${track.artist}`.toLowerCase().includes(q));
  }, [channel.tracks, filter, live, showHidden]);
  const alsoOn = useMemo(() => {
    const titles = new Map<string, Set<string>>();
    for (const desk of [channel, ...others]) {
      for (const track of desk.tracks) {
        if (track.enabled === false) continue;
        const key = track.title.trim().toLowerCase();
        const set = titles.get(key) ?? new Set<string>();
        set.add(desk.slug);
        titles.set(key, set);
      }
    }
    const map = new Map<string, number>();
    for (const track of channel.tracks) {
      const set = titles.get(track.title.trim().toLowerCase());
      map.set(track.id, Math.max(0, (set?.size ?? 1) - 1));
    }
    return map;
  }, [channel, others]);

  useEffect(() => {
    if (!nowId) return;
    document.getElementById(`desk-track-${nowId}`)?.scrollIntoView({ block: "nearest" });
  }, [nowId]);

  async function move(indexInChannel: number, dir: -1 | 1) {
    const ids = channel.tracks.map((item) => item.id);
    const next = indexInChannel + dir;
    if (next < 0 || next >= ids.length) return;
    [ids[indexInChannel], ids[next]] = [ids[next], ids[indexInChannel]];
    setBusy(true);
    try {
      const result = await reorderStationTracks({ data: { channelSlug: channel.slug, trackIds: ids } });
      applySnapshot(result.tracks, result.stations);
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Playlist</p>
          <p className="text-sm text-muted">
            {live.length} on air · {formatClock(totalSec)}
            {hidden.length ? ` · ${hidden.length} removed` : ""}
            {busy ? " · Saving…" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setArrange((value) => !value)}
            aria-pressed={arrange}
            className="inline-flex h-11 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-gold"
          >
            <ArrowUpDown className="size-3.5" />
            {arrange ? "Done" : "Arrange"}
          </button>
          <label className="inline-flex h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            <input type="checkbox" checked={showHidden} onChange={(event) => setShowHidden(event.target.checked)} />
            Show removed
          </label>
        </div>
      </div>
      <input className="input mt-3" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter this playlist" />
      <ul className="mt-3 max-h-[28rem] divide-y divide-line overflow-y-auto rounded-lg bg-bg">
        {visible.length === 0 ? <li className="p-4 text-sm text-subtle">No songs match.</li> : null}
        {visible.map((track) => {
          const index = channel.tracks.findIndex((item) => item.id === track.id);
          return (
            <DeskTrackRow
              key={track.id}
              channel={channel}
              track={track}
              index={index}
              others={others}
              r2Configured={r2Configured}
              editing={editing === track.id}
              arrange={arrange}
              playing={nowId === track.id}
              alsoOn={alsoOn.get(track.id) ?? 0}
              onToggleEdit={() => setEditing((current) => (current === track.id ? null : track.id))}
              onMove={(dir) => void move(index, dir)}
              busy={busy}
            />
          );
        })}
      </ul>
    </div>
  );
}

function DeskTrackRow({
  channel,
  track,
  index,
  others,
  r2Configured,
  editing,
  arrange,
  playing,
  alsoOn,
  onToggleEdit,
  onMove,
  busy,
}: {
  channel: Channel;
  track: Track;
  index: number;
  others: Channel[];
  r2Configured: boolean;
  editing: boolean;
  arrange: boolean;
  playing: boolean;
  alsoOn: number;
  onToggleEdit: () => void;
  onMove: (dir: -1 | 1) => void;
  busy: boolean;
}) {
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [tags, setTags] = useState((track.tags ?? []).join(", "));
  const [dest, setDest] = useState("");
  const [localBusy, setLocalBusy] = useState(false);
  const location = fileLocationLabel(track.audioUrl);
  const key = r2KeyFromAudioUrl(track.audioUrl);
  const hidden = track.enabled === false;
  const locked = busy || localBusy;

  async function saveMeta() {
    setLocalBusy(true);
    try {
      const result = await patchStationTrack({
        data: {
          channelSlug: channel.slug,
          trackId: track.id,
          title: title.trim() || track.title,
          artist: artist.trim() || track.artist,
          tags: (tags || "").trim(),
        },
      });
      applySnapshot(result.tracks, result.stations);
      onToggleEdit();
    } catch (error) {
      fail(error);
    } finally {
      setLocalBusy(false);
    }
  }

  async function place(mode: "copy" | "move") {
    if (!dest) return;
    if (mode === "move" && !window.confirm(`Move “${track.title}” to that station? It leaves this playlist.`)) return;
    setLocalBusy(true);
    try {
      const result = await placeStationTrack({ data: { fromSlug: channel.slug, trackId: track.id, toSlug: dest, mode } });
      applySnapshot(result.tracks, result.stations);
      setDest("");
    } catch (error) {
      fail(error);
    } finally {
      setLocalBusy(false);
    }
  }

  return (
    <li id={`desk-track-${track.id}`} className={cn("p-3", hidden && "opacity-50", playing && "bg-bg")}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-8 font-mono text-[11px] tabular-nums text-subtle">{String(index + 1).padStart(2, "0")}</span>
        <CoverArt src={track.coverUrl || channel.cover} alt="" className="size-10 shrink-0 rounded-md" />
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate", playing && "text-gold")}>{track.title}</span>
          <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
            {track.artist} · {location}
            {alsoOn > 0 ? ` · also ${alsoOn}` : ""}
          </span>
        </span>
        <span className="font-mono text-[11px] tabular-nums text-subtle">{formatClock(track.durationSec)}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <button
          type="button"
          disabled={locked}
          onClick={() => void usePlayerStore.getState().cueTrack(channel.slug, track.id)}
          className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
        >
          Play
        </button>
        <Link
          to="/player/$id"
          params={{ id: songKey(track) }}
          className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
        >
          Open
        </Link>
        {arrange ? (
          <>
            <button type="button" disabled={locked} onClick={() => onMove(-1)} className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              Up
            </button>
            <button type="button" disabled={locked} onClick={() => onMove(1)} className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              Down
            </button>
          </>
        ) : null}
        <button type="button" disabled={locked} onClick={onToggleEdit} className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
          {editing ? "Close" : "Edit"}
        </button>
        {hidden ? (
          <button
            type="button"
            disabled={locked}
            onClick={() => {
              setLocalBusy(true);
              void restoreStationTrack({ data: { channelSlug: channel.slug, trackId: track.id } })
                .then((result) => applySnapshot(result.tracks, result.stations))
                .finally(() => setLocalBusy(false));
            }}
            className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
          >
            Restore
          </button>
        ) : null}
      </div>
      {editing ? (
        <div className="mt-3 space-y-2 rounded-lg bg-bg-elevated p-3">
          <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} />
          <input className="input" value={artist} onChange={(event) => setArtist(event.target.value)} />
          <input className="input" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Tags, comma separated" />
          <button type="button" disabled={locked} onClick={() => void saveMeta()} className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
            Save names
          </button>
          <div className="flex flex-wrap gap-2 pt-2">
            <select className="input min-w-52 flex-1" value={dest} onChange={(event) => setDest(event.target.value)}>
              <option value="">Move or copy to another station</option>
              {others.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <button type="button" disabled={locked || !dest} onClick={() => void place("copy")} className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              Copy there
            </button>
            <button type="button" disabled={locked || !dest} onClick={() => void place("move")} className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              Move there
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {hidden ? null : (
              <button
                type="button"
                disabled={locked}
                onClick={() => {
                  if (!window.confirm(`Remove “${track.title}” from this station? File stays on R2.`)) return;
                  setLocalBusy(true);
                  void hideStationTrack({ data: { channelSlug: channel.slug, trackId: track.id, audioUrl: track.audioUrl } })
                    .then((result) => applySnapshot(result.tracks, result.stations))
                    .finally(() => setLocalBusy(false));
                }}
                className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
              >
                Remove from station
              </button>
            )}
            <button
              type="button"
              disabled={locked || !r2Configured || !key}
              onClick={() => {
                if (!key || !window.confirm(`Delete on R2?\n${key}`)) return;
                setLocalBusy(true);
                void deleteStationFile({
                  data: { channelSlug: channel.slug, trackId: track.id, audioUrl: track.audioUrl, r2Key: key, alsoDeleteR2: true },
                })
                  .then((result) => applySnapshot(result.tracks, result.stations))
                  .finally(() => setLocalBusy(false));
              }}
              className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ember"
            >
              Delete file
            </button>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function UploadDrop({ slug, cover }: { slug: string; cover: string }) {
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");
  async function send(file: File) {
    setBusy(true);
    setHint(`Uploading ${file.name}…`);
    try {
      const body = new FormData();
      body.set("slug", slug);
      body.set("coverUrl", cover);
      body.set("file", file);
      const res = await fetch("/api/desk/upload", { method: "POST", body });
      const json = (await res.json()) as { error?: string; tracks?: CatalogEdit[]; stations?: StationEdit[] };
      if (!res.ok) throw new Error(json.error || "Upload failed");
      if (json.tracks) applySnapshot(json.tracks, json.stations ?? []);
      setHint(`Added ${file.name}`);
    } catch (error) {
      setHint(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  async function sendMany(files: File[]) {
    for (const file of files) await send(file);
  }
  return (
    <label
      className="mt-3 block cursor-pointer rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const files = [...event.dataTransfer.files];
        if (files.length) void sendMany(files);
      }}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Upload to this station</span>
      <p className="mt-1 text-sm text-muted">{hint || "Drop mp3 / wav / flac / m4a here. Multiple files are fine."}</p>
      <input
        type="file"
        multiple
        accept="audio/mpeg,audio/wav,audio/flac,audio/mp4,audio/ogg,audio/aac,.mp3,.wav,.flac,.m4a,.ogg,.aac"
        disabled={busy}
        className="mt-2 block w-full text-sm text-muted file:mr-3 file:h-11 file:rounded-md file:border-0 file:bg-fg file:px-3 file:font-mono file:text-[11px] file:uppercase file:tracking-[0.14em] file:text-bg"
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = "";
          if (files.length) void sendMany(files);
        }}
      />
    </label>
  );
}
