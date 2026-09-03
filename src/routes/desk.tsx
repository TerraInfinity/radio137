import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CoverArt } from "@/components/cover-art";
import { ModePill } from "@/components/mode-pill";
import {
  addStationTrack,
  deleteR2Object,
  deleteStationFile,
  hideStationTrack,
  listStationR2,
  moveR2Object,
  patchStationTrack,
  pingServices,
  reorderStationTracks,
  restoreStationTrack,
  saveStation,
} from "@/lib/desk-api";
import { applyCatalogEdits, type CatalogEdit, type StationEdit } from "@/lib/catalog-edits";
import { getCatalog, getSeedCatalog, kindHint, kindLabel, normalizeKind } from "@/lib/catalog";
import { cn, formatClock, slugify } from "@/lib/cn";
import { fileLocationLabel, r2KeyFromAudioUrl } from "@/lib/file-path";
import { ssoLoginHref, useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel, StationKind, Track } from "@/lib/types";
import type { EnvLamp } from "@/lib/env-lamps";

export const Route = createFileRoute("/desk")({
  component: DeskPage,
  head: () => ({ meta: [{ title: "Station desk · Radio" }] }),
});

function applySnapshot(tracks: CatalogEdit[], stations: StationEdit[]) {
  usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}

function DeskPage() {
  const { user, isAdmin, isPending, r2Configured, lamps } = useRadioUser();
  const catalog = usePlayerStore((s) => s.catalog);
  const channels = catalog.channels.length ? catalog.channels : getCatalog().channels;
  const [tab, setTab] = useState<"stations" | "r2" | "services">("stations");

  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Station desk</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Station desk</h1>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Checking the door.</p>
      </div>
    );
  }

  if (!user) return <DeskLocked />;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Station desk</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Clockwork desk</h1>
        <p className="mt-4 text-muted">
          Signed in as {user.email}. This door is for C — career@terrainfinity.ca and c@cyber-athens.ca.
        </p>
        <Link to="/" className="mt-8 inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          Back to stations
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-44">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">C · God desk</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Station desk</h1>
      <p className="mt-3 max-w-prose text-muted">
        Only those two C Google accounts open this room. Change type, featured, playlists, R2 files, and watch which production keys are live.
      </p>
      <div className="mt-6 flex flex-wrap gap-1">
        {(
          [
            ["stations", "Stations"],
            ["r2", "R2"],
            ["services", "Services"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]",
              tab === id ? "bg-fg text-bg" : "text-gold",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "stations" ? <StationBoard channels={channels} r2Configured={r2Configured} /> : null}
      {tab === "r2" ? <R2Board channels={channels} r2Configured={r2Configured} /> : null}
      {tab === "services" ? <ServicesBoard r2Configured={r2Configured} lamps={lamps} /> : null}
    </div>
  );
}

function DeskLocked() {
  const href = ssoLoginHref("/desk");
  useEffect(() => {
    window.location.assign(href);
  }, [href]);
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Station desk</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Unlock</h1>
      <p className="mt-4 text-muted">C accounts sign in through the Terrainfinity hub. Google lives there.</p>
      <a href={href} className="mt-8 inline-flex h-12 items-center rounded-md bg-fg px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-bg">
        Sign in with Google
      </a>
    </div>
  );
}

function StationBoard({ channels, r2Configured }: { channels: Channel[]; r2Configured: boolean }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return channels.filter((channel) => !needle || `${channel.name} ${channel.slug} ${channel.kind}`.toLowerCase().includes(needle));
  }, [channels, query]);

  return (
    <div className="mt-8">
      <NewStationForm />
      <FeaturedRail channels={channels} />
      <label className="mt-8 block">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Search desks</span>
        <input className="input mt-1" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or slug" />
      </label>
      <ul className="mt-4 space-y-3">
        {visible.map((channel) => (
          <li key={channel.slug} className="overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-filigree)]">
            <button type="button" onClick={() => setOpen((current) => (current === channel.slug ? null : channel.slug))} className="flex w-full items-center gap-3 p-3 text-left">
              <CoverArt src={channel.cover} alt="" className="size-14 shrink-0 rounded-md" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-xl font-semibold">{channel.name}</span>
                <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                  {kindLabel(channel.kind)} · {channel.featured ? "featured · " : ""}
                  {channel.tracks.filter((track) => track.enabled !== false).length} cuts
                  {channel.enabled ? "" : " · off air"}
                </span>
              </span>
              <ModePill kind={channel.kind} mode={channel.mode} enabled={channel.enabled} nsfw={channel.nsfw} />
            </button>
            {open === channel.slug ? <DeskEditor channel={channel} r2Configured={r2Configured} /> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeaturedRail({ channels }: { channels: Channel[] }) {
  const featured = useMemo(
    () =>
      [...channels]
        .filter((channel) => channel.featured)
        .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99) || a.name.localeCompare(b.name)),
    [channels],
  );

  function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= featured.length) return;
    const a = featured[index];
    const b = featured[next];
    void saveStation({ data: { slug: a.slug, featured: true, featuredRank: next } })
      .then(() => saveStation({ data: { slug: b.slug, featured: true, featuredRank: index } }))
      .then((result) => applySnapshot(result.tracks, result.stations));
  }

  return (
    <section className="mt-8 rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Featured rail</p>
      <p className="mt-1 text-sm text-muted">Homepage order. Rank 1 sits first. Toggle Featured inside any station to add it.</p>
      {featured.length === 0 ? <p className="mt-3 text-sm text-subtle">No featured rooms yet.</p> : null}
      <ul className="mt-3 space-y-2">
        {featured.map((channel, index) => (
          <li key={channel.slug} className="flex flex-wrap items-center gap-2">
            <span className="w-6 font-mono text-[11px] tabular-nums text-subtle">{index + 1}</span>
            <span className="min-w-0 flex-1 truncate font-display text-lg">{channel.name}</span>
            <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold disabled:opacity-40">
              Up
            </button>
            <button type="button" disabled={index === featured.length - 1} onClick={() => move(index, 1)} className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold disabled:opacity-40">
              Down
            </button>
            <button
              type="button"
              onClick={() => {
                void saveStation({ data: { slug: channel.slug, featured: false } }).then((result) => applySnapshot(result.tracks, result.stations));
              }}
              className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ember"
            >
              Unfeature
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NewStationForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [kind, setKind] = useState<StationKind>("fixed");
  const [featured, setFeatured] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]"
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
            energy: kind === "fixed" ? "start to finish" : kind === "ondemand" ? "vault" : "clock",
            category: "Custom",
          },
        })
          .then((result) => {
            applySnapshot(result.tracks, result.stations);
            setName("");
            setSlug("");
          })
          .catch((error: unknown) => window.alert(error instanceof Error ? error.message : "Could not create"))
          .finally(() => setBusy(false));
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">New station</p>
      <p className="mt-1 text-sm text-muted">For a linear start-to-finish room, pick Fixed, then drop files into its R2 folder.</p>
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
        Featured
      </label>
      <div className="mt-2">
        <button type="submit" disabled={busy} className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
          {busy ? "Creating…" : "Create station"}
        </button>
      </div>
    </form>
  );
}

function DeskEditor({ channel, r2Configured }: { channel: Channel; r2Configured: boolean }) {
  const [kind, setKind] = useState<StationKind>(normalizeKind(channel.kind || channel.mode));
  const [featured, setFeatured] = useState(Boolean(channel.featured));
  const [rank, setRank] = useState(String(channel.featuredRank ?? 99));
  const [name, setName] = useState(channel.name);
  const [description, setDescription] = useState(channel.description);
  const [title, setTitle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="border-t border-line p-3">
      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          setBusy(true);
          const featuredRank = Number.parseInt(rank, 10);
          void saveStation({
            data: {
              slug: channel.slug,
              name,
              description,
              kind,
              featured,
              featuredRank: Number.isFinite(featuredRank) ? featuredRank : 99,
            },
          })
            .then((result) => applySnapshot(result.tracks, result.stations))
            .catch((error: unknown) => window.alert(error instanceof Error ? error.message : "Save failed"))
            .finally(() => setBusy(false));
        }}
      >
        <input className="input" value={name} onChange={(event) => setName(event.target.value)} />
        <textarea className="input" value={description} onChange={(event) => setDescription(event.target.value)} />
        <div className="flex flex-wrap gap-2">
          {(["live", "ondemand", "fixed"] as const).map((value) => (
            <label key={value} className={cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", kind === value ? "bg-fg text-bg" : "text-gold")}>
              <input type="radio" className="sr-only" checked={kind === value} onChange={() => setKind(value)} />
              {kindLabel(value)}
            </label>
          ))}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{kindHint(kind)}</p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
            Featured rail
          </label>
          <label className="inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Rank
            <input className="input w-20" inputMode="numeric" value={rank} onChange={(event) => setRank(event.target.value)} />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={busy} className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
            Save station
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
      </form>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Add a cut</p>
      <form
        className="mt-2 flex flex-wrap gap-2"
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
            .catch((error: unknown) => window.alert(error instanceof Error ? error.message : "Add failed"))
            .finally(() => setBusy(false));
        }}
      >
        <input className="input max-w-xs" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
        <input className="input min-w-64 flex-1" value={audioUrl} onChange={(event) => setAudioUrl(event.target.value)} placeholder="Audio URL" />
        <button type="submit" disabled={busy} className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
          Add URL
        </button>
      </form>
      {r2Configured ? <UploadDrop slug={channel.slug} cover={channel.cover} /> : null}
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Tracks</p>
      <ul className="mt-2 divide-y divide-line">
        {channel.tracks.map((track, index) => (
          <DeskTrackRow
            key={track.id}
            channel={channel}
            track={track}
            index={index}
            r2Configured={r2Configured}
          />
        ))}
      </ul>
    </div>
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
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Upload to R2</span>
      <p className="mt-1 text-sm text-muted">{hint || "Drop mp3 / wav / flac / m4a files onto this station folder. Multiple at once is fine."}</p>
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

function DeskTrackRow({
  channel,
  track,
  index,
  r2Configured,
}: {
  channel: Channel;
  track: Track;
  index: number;
  r2Configured: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const location = fileLocationLabel(track.audioUrl);
  const key = r2KeyFromAudioUrl(track.audioUrl);
  const hidden = track.enabled === false;

  function move(dir: -1 | 1) {
    const ids = channel.tracks.map((item) => item.id);
    const next = index + dir;
    if (next < 0 || next >= ids.length) return;
    const swap = ids[index];
    ids[index] = ids[next];
    ids[next] = swap;
    setBusy(true);
    void reorderStationTracks({ data: { channelSlug: channel.slug, trackIds: ids } })
      .then((result) => applySnapshot(result.tracks, result.stations))
      .finally(() => setBusy(false));
  }

  return (
    <li className={cn("py-3", hidden && "opacity-50")}>
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} />
          <input className="input mt-1" value={artist} onChange={(event) => setArtist(event.target.value)} />
          <p className="mt-1 break-all font-mono text-[11px] text-subtle">{location}</p>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-subtle">{formatClock(track.durationSec)}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <button type="button" disabled={busy} onClick={() => move(-1)} className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
          Up
        </button>
        <button type="button" disabled={busy} onClick={() => move(1)} className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
          Down
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void patchStationTrack({
              data: { channelSlug: channel.slug, trackId: track.id, title: title.trim() || track.title, artist: artist.trim() || track.artist },
            })
              .then((result) => applySnapshot(result.tracks, result.stations))
              .finally(() => setBusy(false));
          }}
          className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
        >
          Save
        </button>
        {hidden ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              void restoreStationTrack({ data: { channelSlug: channel.slug, trackId: track.id } })
                .then((result) => applySnapshot(result.tracks, result.stations))
                .finally(() => setBusy(false));
            }}
            className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
          >
            Restore
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (!window.confirm(`Remove “${track.title}”? File stays on R2.`)) return;
              setBusy(true);
              void hideStationTrack({ data: { channelSlug: channel.slug, trackId: track.id, audioUrl: track.audioUrl } })
                .then((result) => applySnapshot(result.tracks, result.stations))
                .finally(() => setBusy(false));
            }}
            className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
          >
            Remove
          </button>
        )}
        <button
          type="button"
          disabled={busy || !r2Configured || !key}
          onClick={() => {
            if (!key || !window.confirm(`Delete on R2?\n${key}`)) return;
            setBusy(true);
            void deleteStationFile({
              data: { channelSlug: channel.slug, trackId: track.id, audioUrl: track.audioUrl, r2Key: key, alsoDeleteR2: true },
            })
              .then((result) => applySnapshot(result.tracks, result.stations))
              .finally(() => setBusy(false));
          }}
          className="inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ember"
        >
          Delete on R2
        </button>
      </div>
    </li>
  );
}

function R2Board({ channels, r2Configured }: { channels: Channel[]; r2Configured: boolean }) {
  const [prefix, setPrefix] = useState("radio/");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState("");
  const [objects, setObjects] = useState<Array<{ key: string; size: number; url: string }>>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [assign, setAssign] = useState(channels[0]?.slug ?? "");

  function refresh(nextPrefix = prefix) {
    setStatus("loading");
    void listStationR2({ data: { prefix: nextPrefix } })
      .then((result) => {
        setObjects(result.objects);
        setStatus(result.ok ? "ready" : "error");
        setError(result.ok ? "" : result.error || "Could not list.");
      })
      .catch((err: unknown) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Could not list.");
      });
  }

  useEffect(() => {
    if (r2Configured) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r2Configured]);

  if (!r2Configured) {
    return (
      <div className="mt-8 rounded-xl bg-bg-elevated p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">R2</p>
        <p className="mt-3 text-muted">Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in Vercel. The Services tab will turn those lamps green.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          refresh(prefix);
        }}
      >
        <input className="input min-w-64 flex-1" value={prefix} onChange={(event) => setPrefix(event.target.value)} />
        <button type="submit" className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
          List
        </button>
      </form>
      <form
        className="mt-4 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!from.trim() || !to.trim()) return;
          void moveR2Object({ data: { from: from.trim(), to: to.trim() } })
            .then(() => {
              setFrom("");
              setTo("");
              refresh();
            })
            .catch((err: unknown) => window.alert(err instanceof Error ? err.message : "Move failed"));
        }}
      >
        <input className="input min-w-48 flex-1" value={from} onChange={(event) => setFrom(event.target.value)} placeholder="Move from key" />
        <input className="input min-w-48 flex-1" value={to} onChange={(event) => setTo(event.target.value)} placeholder="to key" />
        <button type="submit" className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          Move
        </button>
      </form>
      {status === "loading" ? <p className="mt-4 text-sm text-muted">Listing…</p> : null}
      {status === "error" ? <p className="mt-4 text-sm text-ember">{error}</p> : null}
      <ul className="mt-4 max-h-[28rem] space-y-1 overflow-y-auto rounded-xl bg-bg-elevated p-3">
        {objects.map((object) => (
          <li key={object.key} className="flex flex-wrap items-center gap-2 py-1">
            <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-subtle">{object.key}</span>
            <select className="input w-40" value={assign} onChange={(event) => setAssign(event.target.value)}>
              {channels.map((channel) => (
                <option key={channel.slug} value={channel.slug}>
                  {channel.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                const objectTitle = object.key.split("/").pop()?.replace(/\.[^.]+$/, "") || object.key;
                void addStationTrack({ data: { channelSlug: assign, title: objectTitle, audioUrl: object.url, r2Key: object.key } })
                  .then((result) => applySnapshot(result.tracks, result.stations))
                  .catch((err: unknown) => window.alert(err instanceof Error ? err.message : "Import failed"));
              }}
              className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
            >
              Import
            </button>
            <button
              type="button"
              onClick={() => {
                setFrom(object.key);
                setTo(object.key);
              }}
              className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
            >
              Move
            </button>
            <button
              type="button"
              onClick={() => {
                if (!window.confirm(`Delete ${object.key}?`)) return;
                void deleteR2Object({ data: { key: object.key } })
                  .then(() => refresh())
                  .catch((err: unknown) => window.alert(err instanceof Error ? err.message : "Delete failed"));
              }}
              className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ember"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ServicesBoard({ r2Configured, lamps }: { r2Configured: boolean; lamps: EnvLamp[] }) {
  const [ping, setPing] = useState<{
    hub: { origin: string; status: number; ok: boolean; note: string };
    r2: { ok: boolean; note: string; sample: number };
  } | null>(null);
  const [pinging, setPinging] = useState(false);
  const groups = useMemo(() => {
    const map = new Map<string, EnvLamp[]>();
    for (const lamp of lamps) {
      const list = map.get(lamp.group) ?? [];
      list.push(lamp);
      map.set(lamp.group, list);
    }
    return [...map.entries()];
  }, [lamps]);
  const ready = lamps.filter((lamp) => lamp.required).every((lamp) => lamp.set);

  return (
    <div className="mt-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Production keys</p>
      <p className="mt-2 max-w-prose text-muted">
        Put secrets in Vercel on the production project. This desk never shows the values — only whether each key is present. {ready ? "Required lamps are green." : "Some required lamps are still dark."}
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">R2 {r2Configured ? "live" : "missing"}</p>
      <ul className="mt-4 max-w-prose space-y-2 text-sm text-muted">
        <li>AUTH_SECRET must match the Terrainfinity hub so radio can mint and read the shared session.</li>
        <li>AUTH_URL should be https://terrainfinity.ca. SSO_HUB is optional and defaults there.</li>
        <li>DATABASE_URL is the shared Postgres with the hub — playlist and station edits live here.</li>
        <li>R2_ACCOUNT_ID + R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY open the media bucket. R2_BUCKET defaults to media-empire-radio.</li>
      </ul>
      <button
        type="button"
        disabled={pinging}
        onClick={() => {
          setPinging(true);
          void pingServices()
            .then(setPing)
            .catch((error: unknown) => window.alert(error instanceof Error ? error.message : "Ping failed"))
            .finally(() => setPinging(false));
        }}
        className="mt-4 inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg"
      >
        {pinging ? "Pinging…" : "Test hub + R2"}
      </button>
      {ping ? (
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>
            Hub {ping.hub.origin} — {ping.hub.ok ? "reachable" : "dark"} ({ping.hub.note}).
          </li>
          <li>R2 — {ping.r2.ok ? ping.r2.note : ping.r2.note}.</li>
        </ul>
      ) : null}
      {groups.map(([group, items]) => (
        <section key={group} className="mt-6 rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">{group}</h2>
          <ul className="mt-3 space-y-3">
            {items.map((lamp) => (
              <li key={lamp.key} className="flex items-start gap-3">
                <span className={cn("env-dot mt-1.5", lamp.set ? "env-dot-on" : "env-dot-off")} />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[12px] uppercase tracking-[0.12em]">{lamp.key}</p>
                  <p className="text-sm text-muted">
                    {lamp.label}
                    {lamp.required ? " · required" : " · optional"} — {lamp.set ? "active" : "missing"}. {lamp.hint}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
