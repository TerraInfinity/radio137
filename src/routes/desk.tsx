import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CoverArt } from "@/components/cover-art";
import { ModePill } from "@/components/mode-pill";
import { addStationTrack, deleteStationFile, hideStationTrack, listStationR2, restoreStationTrack } from "@/lib/desk-api";
import { applyCatalogEdits, type CatalogEdit } from "@/lib/catalog-edits";
import { getCatalog, getSeedCatalog } from "@/lib/catalog";
import { cn, formatClock } from "@/lib/cn";
import { fileLocationLabel, r2KeyFromAudioUrl } from "@/lib/file-path";
import { ssoLoginHref, useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel, Track } from "@/lib/types";

export const Route = createFileRoute("/desk")({
  component: DeskPage,
  head: () => ({ meta: [{ title: "Station desk · Radio" }] }),
});

function applyEdits(edits: CatalogEdit[]) {
  usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), edits));
}

function DeskPage() {
  const { user, isAdmin, isPending, r2Configured } = useRadioUser();
  const catalog = usePlayerStore((s) => s.catalog);
  const channels = catalog.channels.length ? catalog.channels : getCatalog().channels;

  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Station desk</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Station desk</h1>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Checking the door.</p>
      </div>
    );
  }

  if (!user) {
    return <DeskLocked />;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Station desk</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Clockwork desk</h1>
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">C · God desk</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Station desk</h1>
      <p className="mt-3 max-w-prose text-muted">
        Open a station to add or drop cuts. Remove keeps the object on R2. Delete on R2 destroys the file.
        {r2Configured
          ? " R2 keys are live."
          : " Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY to list, upload, and delete objects."}
      </p>
      <StationBoard channels={channels} r2Configured={r2Configured} />
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
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Unlock</h1>
      <p className="mt-4 text-muted">
        C accounts sign in through the Terrainfinity hub. Google lives there — this radio only consumes the session.
      </p>
      <a
        href={href}
        className="mt-8 inline-flex h-12 items-center rounded-md bg-fg px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-bg"
      >
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
    return channels.filter((channel) => {
      if (!needle) return true;
      return `${channel.name} ${channel.slug} ${channel.energy}`.toLowerCase().includes(needle);
    });
  }, [channels, query]);

  return (
    <div className="mt-8">
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Search desks</span>
        <input className="input mt-1" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or slug" />
      </label>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">Station board</p>
      <ul className="mt-3 space-y-3">
        {visible.map((channel) => (
          <li key={channel.slug} className="overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-filigree)]">
            <button
              type="button"
              onClick={() => setOpen((current) => (current === channel.slug ? null : channel.slug))}
              className="flex w-full items-center gap-3 p-3 text-left"
            >
              <CoverArt src={channel.cover} alt="" className="size-14 shrink-0 rounded-md" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-xl font-semibold">{channel.name}</span>
                <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                  {channel.slug} · {channel.tracks.filter((track) => track.enabled !== false).length} cuts
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

function DeskEditor({ channel, r2Configured }: { channel: Channel; r2Configured: boolean }) {
  const [filter, setFilter] = useState("");
  const [title, setTitle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const tracks = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    return channel.tracks.filter((track) => {
      if (!needle) return true;
      return `${track.title} ${track.artist} ${track.audioUrl}`.toLowerCase().includes(needle);
    });
  }, [channel.tracks, filter]);

  return (
    <div className="border-t border-line p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Add a cut</p>
      <form
        className="mt-2 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim() || !audioUrl.trim()) return;
          setBusy(true);
          void addStationTrack({
            data: { channelSlug: channel.slug, title: title.trim(), audioUrl: audioUrl.trim(), coverUrl: channel.cover },
          })
            .then((result) => {
              applyEdits(result.edits);
              setTitle("");
              setAudioUrl("");
            })
            .catch((error: unknown) => window.alert(error instanceof Error ? error.message : "Add failed"))
            .finally(() => setBusy(false));
        }}
      >
        <input className="input max-w-xs" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
        <input
          className="input min-w-64 flex-1"
          value={audioUrl}
          onChange={(event) => setAudioUrl(event.target.value)}
          placeholder="Audio URL (R2 or file)"
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg"
        >
          Add URL
        </button>
      </form>
      {r2Configured ? <UploadDrop slug={channel.slug} cover={channel.cover} /> : null}
      {r2Configured ? (
        <R2Picker slug={channel.slug} cover={channel.cover} />
      ) : (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
          Connect R2 to upload and list folders. You can still paste audio URLs.
        </p>
      )}
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Tracks</p>
      <input className="input mt-2" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter files" />
      <ul className="mt-4 divide-y divide-line">
        {tracks.map((track) => (
          <DeskTrackRow key={track.id} channel={channel} track={track} r2Configured={r2Configured} />
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
      const json = (await res.json()) as { error?: string; edits?: CatalogEdit[] };
      if (!res.ok) throw new Error(json.error || "Upload failed");
      if (json.edits) applyEdits(json.edits);
      setHint(`Added ${file.name}`);
    } catch (error) {
      setHint(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="mt-3 block cursor-pointer rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Upload to R2</span>
      <p className="mt-1 text-sm text-muted">{hint || "Drop an mp3 (or wav/flac/m4a) onto this station folder."}</p>
      <input
        type="file"
        accept="audio/mpeg,audio/wav,audio/flac,audio/mp4,audio/ogg,audio/aac,.mp3,.wav,.flac,.m4a,.ogg,.aac"
        disabled={busy}
        className="mt-2 block w-full text-sm text-muted file:mr-3 file:h-11 file:rounded-md file:border-0 file:bg-fg file:px-3 file:font-mono file:text-[11px] file:uppercase file:tracking-[0.14em] file:text-bg"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void send(file);
        }}
      />
    </label>
  );
}

function DeskTrackRow({
  channel,
  track,
  r2Configured,
}: {
  channel: Channel;
  track: Track;
  r2Configured: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const location = fileLocationLabel(track.audioUrl);
  const key = r2KeyFromAudioUrl(track.audioUrl);
  const hidden = track.enabled === false;

  return (
    <li className={cn("flex flex-wrap items-start gap-2 py-3", hidden && "opacity-50")}>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg">{track.title}</p>
        <p className="truncate text-sm text-muted">{track.artist}</p>
        <p className="mt-1 break-all font-mono text-[11px] text-subtle" title={track.audioUrl}>
          {location}
        </p>
      </div>
      <span className="font-mono text-[11px] tabular-nums text-subtle">{formatClock(track.durationSec)}</span>
      <div className="flex flex-wrap gap-1">
        {hidden ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              void restoreStationTrack({ data: { channelSlug: channel.slug, trackId: track.id } })
                .then((result) => applyEdits(result.edits))
                .catch((error: unknown) => window.alert(error instanceof Error ? error.message : "Restore failed"))
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
              if (!window.confirm(`Remove “${track.title}” from ${channel.name}? File stays on R2.`)) return;
              setBusy(true);
              void hideStationTrack({ data: { channelSlug: channel.slug, trackId: track.id, audioUrl: track.audioUrl } })
                .then((result) => applyEdits(result.edits))
                .catch((error: unknown) => window.alert(error instanceof Error ? error.message : "Remove failed"))
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
            if (!key) return;
            if (!window.confirm(`Permanently delete on R2?\n${key}`)) return;
            setBusy(true);
            void deleteStationFile({
              data: {
                channelSlug: channel.slug,
                trackId: track.id,
                audioUrl: track.audioUrl,
                r2Key: key,
                alsoDeleteR2: true,
              },
            })
              .then((result) => applyEdits(result.edits))
              .catch((error: unknown) => window.alert(error instanceof Error ? error.message : "R2 delete failed"))
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

function R2Picker({ slug, cover }: { slug: string; cover: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState("");
  const [objects, setObjects] = useState<Array<{ key: string; size: number; url: string }>>([]);
  const [prefix, setPrefix] = useState("");

  useEffect(() => {
    setStatus("loading");
    void listStationR2({ data: { slug } })
      .then((result) => {
        setPrefix(result.prefix);
        setObjects(result.objects);
        setStatus(result.ok ? "ready" : "error");
        setError(result.ok ? "" : result.error || "Could not list folders.");
      })
      .catch((err: unknown) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Could not list folders.");
      });
  }, [slug]);

  return (
    <div className="mt-4 rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Explorer · {prefix || `radio/${slug}/`}</p>
      {status === "loading" ? <p className="mt-2 text-sm text-muted">Listing…</p> : null}
      {status === "error" ? <p className="mt-2 text-sm text-ember">{error}</p> : null}
      {status === "ready" && objects.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No audio in this prefix, or still reading.</p>
      ) : null}
      <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto">
        {objects.map((object) => (
          <li key={object.key} className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-subtle">{object.key}</span>
            <button
              type="button"
              onClick={() => {
                const title = object.key.split("/").pop()?.replace(/\.[^.]+$/, "") || object.key;
                void addStationTrack({
                  data: { channelSlug: slug, title, audioUrl: object.url, coverUrl: cover, r2Key: object.key },
                })
                  .then((result) => applyEdits(result.edits))
                  .catch((err: unknown) => window.alert(err instanceof Error ? err.message : "Import failed"));
              }}
              className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
            >
              Import
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
