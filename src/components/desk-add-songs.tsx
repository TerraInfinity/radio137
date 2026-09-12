import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link2, Plus, Search, Upload } from "lucide-react";
import { getBearerToken } from "@/lib/auth/client";
import { applyCatalogEdits, type CatalogEdit, type StationEdit } from "@/lib/catalog-edits";
import { getSeedCatalog } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { desksHoldingKey, formatBytes, isAudioKey, titleFromR2Key } from "@/lib/file-path";
import { addStationTrack, importR2Tracks, listStationR2, placeStationTrack } from "@/lib/desk-api";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel, Track } from "@/lib/types";

type R2Hit = { key: string; size: number; url: string };

const r2Cache = new Map<string, { at: number; objects: R2Hit[] }>();
const R2_TTL = 90_000;

function applySnapshot(tracks: CatalogEdit[], stations: StationEdit[]) {
  usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}

function fail(error: unknown) {
  window.alert(error instanceof Error ? error.message : "Desk save failed");
}

async function loadR2Prefix(prefix: string): Promise<R2Hit[]> {
  const hit = r2Cache.get(prefix);
  if (hit && Date.now() - hit.at < R2_TTL) return hit.objects;
  const result = await listStationR2({ data: { prefix, maxKeys: 2500 } });
  if (!result.ok) throw new Error(result.error || "Could not list R2");
  const objects = result.objects.filter((item) => isAudioKey(item.key));
  r2Cache.set(prefix, { at: Date.now(), objects });
  return objects;
}

function scoreText(hay: string, q: string): number {
  const n = hay.toLowerCase();
  if (n === q) return 100;
  if (n.startsWith(q)) return 80;
  const idx = n.indexOf(q);
  if (idx >= 0) return Math.max(30, 70 - idx);
  return 0;
}

export function AddSongsPanel({
  channel,
  channels,
  r2Configured,
}: {
  channel: Channel;
  channels: Channel[];
  r2Configured: boolean;
}) {
  const [query, setQuery] = useState("");
  const [r2Objects, setR2Objects] = useState<R2Hit[]>([]);
  const [r2Status, setR2Status] = useState<"idle" | "loading" | "ready" | "error">(r2Configured ? "loading" : "idle");
  const [r2Error, setR2Error] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const [title, setTitle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [urlBusy, setUrlBusy] = useState(false);
  const [uploads, setUploads] = useState<Array<{ name: string; state: "up" | "ok" | "err"; detail?: string }>>([]);
  const [hot, setHot] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const stationPrefix = `radio/${channel.slug}/`;
  const others = useMemo(() => channels.filter((item) => item.slug !== channel.slug), [channels, channel.slug]);

  useEffect(() => {
    if (!r2Configured) return;
    let live = true;
    setR2Status("loading");
    setR2Error("");
    void loadR2Prefix(stationPrefix)
      .then(async (stationFiles) => {
        if (!live) return;
        setR2Objects(stationFiles);
        setR2Status("ready");
        try {
          const all = await loadR2Prefix("radio/");
          if (!live) return;
          const byKey = new Map(stationFiles.map((item) => [item.key, item]));
          for (const item of all) if (!byKey.has(item.key)) byKey.set(item.key, item);
          setR2Objects([...byKey.values()]);
        } catch {
          /* station folder is enough */
        }
      })
      .catch((error: unknown) => {
        if (!live) return;
        setR2Status("error");
        setR2Error(error instanceof Error ? error.message : "Could not list R2");
      });
    return () => {
      live = false;
    };
  }, [r2Configured, stationPrefix]);

  const needle = query.trim().toLowerCase();
  const r2Hits = useMemo(() => {
    const rows = r2Objects.map((object) => {
      const name = titleFromR2Key(object.key);
      const desks = desksHoldingKey(channels, object.key);
      const here = desks.includes(channel.slug);
      const inFolder = object.key.startsWith(stationPrefix);
      const q = needle;
      const points = q
        ? Math.max(scoreText(name, q), scoreText(object.key, q), inFolder && name.toLowerCase().includes(q) ? 10 : 0)
        : inFolder && !here
          ? 20
          : 0;
      return { ...object, name, desks, here, inFolder, points };
    });
    const filtered = needle
      ? rows.filter((item) => item.points > 0)
      : rows.filter((item) => item.inFolder && !item.here);
    filtered.sort((a, b) => b.points - a.points || Number(a.here) - Number(b.here) || a.name.localeCompare(b.name));
    return filtered.slice(0, 40);
  }, [r2Objects, channels, channel.slug, stationPrefix, needle]);

  const libraryHits = useMemo(() => {
    if (needle.length < 2) return [];
    const rows: Array<{ station: Channel; track: Track; points: number }> = [];
    for (const station of others) {
      for (const track of station.tracks) {
        if (track.enabled === false) continue;
        const points = Math.max(
          scoreText(track.title, needle),
          scoreText(track.artist || "", needle),
          scoreText(station.name, needle),
        );
        if (points <= 0) continue;
        const already = channel.tracks.some((item) => item.enabled !== false && item.audioUrl === track.audioUrl);
        if (already) continue;
        rows.push({ station, track, points });
        if (rows.length >= 80) break;
      }
    }
    rows.sort((a, b) => b.points - a.points || a.track.title.localeCompare(b.track.title));
    return rows.slice(0, 20);
  }, [needle, others, channel.tracks]);

  async function addR2(hit: R2Hit, name: string) {
    setBusyKey(hit.key);
    setHint("Adding…");
    try {
      const result = await importR2Tracks({
        data: { channelSlugs: [channel.slug], items: [{ key: hit.key, url: hit.url, title: name }] },
      });
      applySnapshot(result.tracks, result.stations);
      r2Cache.delete(stationPrefix);
      r2Cache.delete("radio/");
      setHint(result.added ? `Added ${name}` : "Already on this station");
    } catch (error) {
      fail(error);
      setHint("");
    } finally {
      setBusyKey(null);
    }
  }

  async function addLibrary(station: Channel, track: Track) {
    const key = `${station.slug}:${track.id}`;
    setBusyKey(key);
    setHint("Adding…");
    try {
      const result = await placeStationTrack({
        data: { fromSlug: station.slug, trackId: track.id, toSlug: channel.slug, mode: "copy" },
      });
      applySnapshot(result.tracks, result.stations);
      setHint(`Added ${track.title}`);
    } catch (error) {
      fail(error);
      setHint("");
    } finally {
      setBusyKey(null);
    }
  }

  async function addUrl(event: FormEvent) {
    event.preventDefault();
    const url = audioUrl.trim();
    if (!url) return;
    const nextTitle = title.trim() || titleFromR2Key(url);
    setUrlBusy(true);
    setHint("Adding…");
    try {
      const result = await addStationTrack({
        data: { channelSlug: channel.slug, title: nextTitle, audioUrl: url, coverUrl: channel.cover },
      });
      applySnapshot(result.tracks, result.stations);
      setTitle("");
      setAudioUrl("");
      setHint(`Added ${nextTitle}`);
    } catch (error) {
      fail(error);
      setHint("");
    } finally {
      setUrlBusy(false);
    }
  }

  async function sendFiles(files: File[]) {
    const audio = files.filter((file) => isAudioKey(file.name) || file.type.startsWith("audio/"));
    if (!audio.length) {
      setHint("Audio only (mp3, wav, flac, m4a, ogg, aac)");
      return;
    }
    setUploads(audio.map((file) => ({ name: file.name, state: "up" })));
    for (let i = 0; i < audio.length; i++) {
      const file = audio[i];
      setHint(`Uploading ${file.name}…`);
      try {
        const body = new FormData();
        body.set("slug", channel.slug);
        body.set("coverUrl", channel.cover);
        body.set("file", file);
        const token = getBearerToken();
        const res = await fetch("/api/desk/upload", {
          method: "POST",
          body,
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const raw = await res.text();
        let json: { error?: string; tracks?: CatalogEdit[]; stations?: StationEdit[] } = {};
        try {
          json = raw ? (JSON.parse(raw) as typeof json) : {};
        } catch {
          throw new Error(res.status === 413 ? "File is too large (80 MB max)." : res.status === 401 ? "Sign in again to upload." : "Upload failed");
        }
        if (!res.ok) throw new Error(json.error || "Upload failed");
        if (json.tracks) applySnapshot(json.tracks, json.stations ?? []);
        r2Cache.delete(stationPrefix);
        r2Cache.delete("radio/");
        setUploads((current) => current.map((item, index) => (index === i ? { ...item, state: "ok" } : item)));
      } catch (error) {
        const detail = error instanceof Error ? error.message : "Upload failed";
        setUploads((current) => current.map((item, index) => (index === i ? { ...item, state: "err", detail } : item)));
        setHint(detail);
      }
    }
    setHint((current) => (current.startsWith("Uploading") ? "Upload finished" : current));
  }

  const searching = needle.length >= 2;
  const showR2 = r2Configured && (searching || r2Hits.length > 0);
  const emptySearch = searching && r2Hits.length === 0 && libraryHits.length === 0 && r2Status !== "loading";

  return (
    <section className="mt-8 border-t border-line pt-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Add songs</p>
      <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">Put a cut on {channel.name}</h3>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Search the bucket or another desk, drop a file from this device, or paste a URL. Files already sitting on R2 stay off-air until you add them here.
      </p>

      <label className="relative mt-4 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
        <input
          className="input pl-10"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search R2 or other stations"
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
        {r2Status === "loading"
          ? "Reading R2…"
          : r2Status === "error"
            ? r2Error
            : !r2Configured
              ? "R2 keys are dark — search other desks or paste a URL."
              : searching
                ? `${r2Hits.length + libraryHits.length} matches`
                : r2Hits.length
                  ? `${r2Hits.length} new in this folder — type to search the rest`
                  : "No new audio in this folder. Search all of R2, or upload."}
      </p>

      {showR2 || libraryHits.length > 0 ? (
        <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto rounded-lg bg-bg p-2">
          {r2Hits.map((hit) => {
            const desks = hit.desks.map((slug) => channels.find((item) => item.slug === slug)?.name || slug);
            return (
              <li key={hit.key} className="flex items-center gap-2 rounded-md px-2 py-1.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{hit.name}</span>
                  <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                    R2 · {formatBytes(hit.size)}
                    {hit.inFolder ? "" : ` · ${hit.key.replace(/^radio\//, "")}`}
                    {desks.length ? ` · on ${desks.join(", ")}` : " · not on a station"}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={Boolean(busyKey) || hit.here}
                  onClick={() => void addR2(hit, hit.name)}
                  className="inline-flex h-11 shrink-0 items-center gap-1.5 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
                >
                  <Plus className="size-3.5" />
                  {hit.here ? "On this station" : busyKey === hit.key ? "Adding…" : "Add"}
                </button>
              </li>
            );
          })}
          {libraryHits.map(({ station, track }) => {
            const key = `${station.slug}:${track.id}`;
            return (
              <li key={key} className="flex items-center gap-2 rounded-md px-2 py-1.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{track.title}</span>
                  <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                    On {station.name}
                    {track.artist ? ` · ${track.artist}` : ""}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={Boolean(busyKey)}
                  onClick={() => void addLibrary(station, track)}
                  className="inline-flex h-11 shrink-0 items-center gap-1.5 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
                >
                  <Plus className="size-3.5" />
                  {busyKey === key ? "Adding…" : "Add"}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {emptySearch ? <p className="mt-3 text-sm text-muted">No matches. Try another spelling, or upload / paste a URL below.</p> : null}

      {r2Configured ? (
        <div
          className={cn("desk-add-drop mt-5", hot && "desk-add-drop-hot")}
          onDragOver={(event) => {
            event.preventDefault();
            setHot(true);
          }}
          onDragLeave={() => setHot(false)}
          onDrop={(event) => {
            event.preventDefault();
            setHot(false);
            const files = [...event.dataTransfer.files];
            if (files.length) void sendFiles(files);
          }}
        >
          <Upload className="size-4 text-gold" />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">From this device</p>
            <p className="mt-1 text-sm text-muted">Drop mp3 / wav / flac / m4a here, or choose files. They land in this station’s folder and on the playlist.</p>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-11 shrink-0 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg"
          >
            Choose files
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="audio/mpeg,audio/wav,audio/flac,audio/mp4,audio/ogg,audio/aac,.mp3,.wav,.flac,.m4a,.ogg,.aac"
            className="sr-only"
            onChange={(event) => {
              const files = [...(event.target.files ?? [])];
              event.target.value = "";
              if (files.length) void sendFiles(files);
            }}
          />
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted">Uploads need R2 keys — use the Services tab.</p>
      )}
      {uploads.length > 0 ? (
        <ul className="mt-2 space-y-1 font-mono text-[11px] uppercase tracking-[0.12em]">
          {uploads.map((item) => (
            <li key={item.name} className={item.state === "err" ? "text-ember" : item.state === "ok" ? "text-gold" : "text-subtle"}>
              {item.state === "up" ? "Uploading" : item.state === "ok" ? "Added" : "Failed"} · {item.name}
              {item.detail ? ` — ${item.detail}` : ""}
            </li>
          ))}
        </ul>
      ) : null}

      <form className="mt-5 grid gap-2 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_auto]" onSubmit={(event) => void addUrl(event)}>
        <p className="sm:col-span-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
          <Link2 className="size-3.5" />
          From a URL
        </p>
        <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title (optional)" autoComplete="off" />
        <input className="input" value={audioUrl} onChange={(event) => setAudioUrl(event.target.value)} placeholder="https://…" autoComplete="off" spellCheck={false} />
        <button type="submit" disabled={urlBusy || !audioUrl.trim()} className="inline-flex h-11 items-center justify-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
          {urlBusy ? "Adding…" : "Add URL"}
        </button>
      </form>
      {hint ? <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-gold">{hint}</p> : null}
    </section>
  );
}
