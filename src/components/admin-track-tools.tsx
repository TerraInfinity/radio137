import { useState } from "react";
import { addStationTrack, deleteStationFile, hideStationTrack, patchStationTrack, renameStationFile } from "@/lib/desk-api";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { audioPathParts, fileLocationLabel, r2KeyFromAudioUrl } from "@/lib/file-path";
import { getSeedCatalog } from "@/lib/catalog";
import { getBearerToken } from "@/lib/auth/client";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";
import { cn, slugify } from "@/lib/cn";
import { parseTags } from "@/lib/search";
import { ArtUpload } from "@/components/art-upload";
import { StationSettingsForm } from "@/components/station-settings";
import type { Channel, Track } from "@/lib/types";

function applySnapshot(
  tracks: Parameters<typeof applyCatalogEdits>[1],
  stations: Parameters<typeof applyCatalogEdits>[2],
  playingId: string | null,
  next: () => void,
) {
  const catalog = applyCatalogEdits(getSeedCatalog(), tracks, stations);
  usePlayerStore.getState().replaceCatalog(catalog);
  const still = catalog.channels.flatMap((channel) => channel.tracks).find((track) => track.id === playingId && track.enabled !== false);
  if (playingId && !still) void next();
}

export function AdminTrackTools({ slug, track, compact = false }: { slug: string; track: Track; compact?: boolean }) {
  const { isAdmin, r2Configured, isPending } = useRadioUser();
  const [busy, setBusy] = useState<"hide" | "r2" | "save" | "file" | "rename" | null>(null);
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [tags, setTags] = useState((track.tags ?? []).join(", "));
  const [publicSlug, setPublicSlug] = useState(track.slug ?? "");
  const [aliases, setAliases] = useState((track.aliases ?? []).join(", "));
  const [audioUrl, setAudioUrl] = useState(track.audioUrl);
  const [coverUrl, setCoverUrl] = useState(track.coverUrl ?? "");
  const [filename, setFilename] = useState(audioPathParts(track.audioUrl).filename);
  const [hint, setHint] = useState("");
  const next = usePlayerStore((s) => s.next);
  const playingId = usePlayerStore((s) => s.track?.id ?? null);
  if (isPending || !isAdmin) return null;
  const location = fileLocationLabel(track.audioUrl);
  const key = r2KeyFromAudioUrl(track.audioUrl);

  async function hide() {
    if (!window.confirm(`Remove “${track.title}” from this station? The file stays on R2.`)) return;
    setBusy("hide");
    try {
      const result = await hideStationTrack({ data: { channelSlug: slug, trackId: track.id, audioUrl: track.audioUrl } });
      applySnapshot(result.tracks, result.stations, playingId, next);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not remove");
    } finally {
      setBusy(null);
    }
  }

  async function destroy() {
    if (!key) {
      window.alert("No R2 key on this file.");
      return;
    }
    if (!window.confirm(`Permanently delete this file from R2?\n${key}`)) return;
    setBusy("r2");
    try {
      const result = await deleteStationFile({
        data: { channelSlug: slug, trackId: track.id, audioUrl: track.audioUrl, r2Key: key, alsoDeleteR2: true },
      });
      applySnapshot(result.tracks, result.stations, playingId, next);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not delete from R2");
    } finally {
      setBusy(null);
    }
  }

  async function saveMeta() {
    setBusy("save");
    try {
      const result = await patchStationTrack({
        data: {
          channelSlug: slug,
          trackId: track.id,
          title: title.trim() || track.title,
          artist: artist.trim() || track.artist,
          tags: parseTags(tags).join(", "),
          slug: slugify(publicSlug).slice(0, 80),
          aliases,
          audioUrl: audioUrl.trim() || track.audioUrl,
          coverUrl: coverUrl.trim() || undefined,
        },
      });
      applySnapshot(result.tracks, result.stations, playingId, next);
      setHint("Saved");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not save");
    } finally {
      setBusy(null);
    }
  }

  async function replaceFile(file: File) {
    setBusy("file");
    setHint(`Uploading ${file.name}…`);
    try {
      const body = new FormData();
      body.set("slug", slug);
      body.set("trackId", track.id);
      body.set("file", file);
      if (coverUrl.trim()) body.set("coverUrl", coverUrl.trim());
      const token = getBearerToken();
      const res = await fetch("/api/desk/upload", {
        method: "POST",
        body,
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = (await res.json()) as { error?: string; tracks?: Parameters<typeof applyCatalogEdits>[1]; stations?: Parameters<typeof applyCatalogEdits>[2]; object?: { url: string } };
      if (!res.ok) throw new Error(json.error || "Upload failed");
      if (json.tracks) applySnapshot(json.tracks, json.stations ?? [], playingId, next);
      if (json.object?.url) setAudioUrl(json.object.url);
      setHint(`Replaced with ${file.name}`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Upload failed");
      setHint("");
    } finally {
      setBusy(null);
    }
  }

  async function renameFile() {
    const current = audioPathParts(track.audioUrl);
    const nextName = filename.trim();
    if (!nextName || nextName === current.filename) return;
    if (nextName.includes("..") || nextName.includes("/")) {
      window.alert("Use a file name, not a path. Folder stays the same.");
      return;
    }
    const toKey = `${current.folder ? `${current.folder}/` : ""}${nextName}`;
    if (!window.confirm(`Rename R2 object?\n${current.folder}/${current.filename}\n→ ${toKey}\n\nThe old key is copied then removed. Display title and public URL stay unless you change those too.`)) return;
    setBusy("rename");
    try {
      const result = await renameStationFile({ data: { channelSlug: slug, trackId: track.id, toKey } });
      applySnapshot(result.tracks, result.stations, playingId, next);
      if (result.object?.url) setAudioUrl(result.object.url);
      setHint(`File is now ${nextName}`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Rename failed");
    } finally {
      setBusy(null);
    }
  }

  if (compact) {
    return (
      <button
        type="button"
        disabled={Boolean(busy)}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void hide();
        }}
        className="inline-flex h-7 items-center px-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-gold"
      >
        {busy === "hide" ? "…" : "Remove"}
      </button>
    );
  }

  return (
    <div className="mt-8 rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">C desk · this cut</p>
      <p className="mt-1 break-all font-mono text-[11px] text-subtle" title={track.audioUrl}>
        {location}
      </p>
      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void saveMeta();
        }}
      >
        <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title shown on the site" />
        <input className="input" value={artist} onChange={(event) => setArtist(event.target.value)} placeholder="Artist" />
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Public URL ending</span>
          <input
            className="input mt-1"
            value={publicSlug}
            onChange={(event) => setPublicSlug(event.target.value)}
            placeholder={slugify(title) || "karma-7-hari-singh-ong-namo"}
          />
          <span className="mt-1 block font-mono text-[10px] text-subtle">/player/{slugify(publicSlug || title) || "…"}</span>
          <span className="mt-1 block text-sm text-muted">Canonical player URL. Blank uses the song title. Same on both Radio hosts.</span>
          <button type="button" onClick={() => setPublicSlug(slugify(title))} className="mt-1 inline-flex h-11 items-center font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
            Use title
          </button>
        </label>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Aliases</span>
          <input className="input mt-1" value={aliases} onChange={(event) => setAliases(event.target.value)} placeholder="hari, gong" />
          <span className="mt-1 block font-mono text-[10px] text-subtle">radio.terrainfinity.ca/hari · radio.cyber-athens.ca/hari</span>
          <span className="mt-1 block text-sm text-muted">
            Custom site endings without /player. Type hari or /hari. The address bar stays /hari — it does not bounce to the public /player/… URL. Comma-separated. Does not rename the file or the display title.
          </span>
        </label>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Tags</span>
          <input className="input mt-1" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="glados, sting, voice" />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Art URL</span>
          <input className="input mt-1" value={coverUrl} onChange={(event) => setCoverUrl(event.target.value)} placeholder="/covers/… or https://… jpg or mp4" />
          <span className="mt-1 block text-sm text-muted">Still or short looping mp4. Shows on this cut and in the player.</span>
        </label>
        <ArtUpload slug={slug} trackId={track.id} current={coverUrl} onUrl={setCoverUrl} />
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Audio file URL</span>
          <input className="input mt-1" value={audioUrl} onChange={(event) => setAudioUrl(event.target.value)} placeholder="https://r2.terrainfinity.ca/radio/…" />
        </label>
        {key ? (
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">R2 file name</span>
            <input className="input mt-1" value={filename} onChange={(event) => setFilename(event.target.value)} placeholder="Karma 7 Hari Singh.mp3" />
            <span className="mt-1 block truncate font-mono text-[10px] text-subtle">{audioPathParts(track.audioUrl).folder || "radio/"}</span>
          </label>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={Boolean(busy)} className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
            {busy === "save" ? "Saving…" : "Save cut"}
          </button>
          {key ? (
            <button type="button" disabled={Boolean(busy) || !r2Configured} onClick={() => void renameFile()} className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              {busy === "rename" ? "Renaming…" : "Rename file on R2"}
            </button>
          ) : null}
        </div>
        {hint ? <p className="text-sm text-muted">{hint}</p> : null}
      </form>
      <label className="mt-4 block cursor-pointer rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Replace audio file</span>
        <p className="mt-1 text-sm text-muted">
          {r2Configured ? "Upload a new mp3 / wav / flac / m4a. The cut keeps its id and tags." : "R2 keys are dark — paste a new URL above instead."}
        </p>
        <input
          type="file"
          accept="audio/mpeg,audio/wav,audio/flac,audio/mp4,audio/ogg,audio/aac,.mp3,.wav,.flac,.m4a,.ogg,.aac"
          disabled={Boolean(busy) || !r2Configured}
          className="mt-2 block w-full text-sm text-muted file:mr-3 file:h-11 file:rounded-md file:border-0 file:bg-fg file:px-3 file:font-mono file:text-[11px] file:uppercase file:tracking-[0.14em] file:text-bg"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void replaceFile(file);
          }}
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={Boolean(busy)} onClick={() => void hide()} className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          {busy === "hide" ? "Removing…" : "Remove from station"}
        </button>
        <button
          type="button"
          disabled={Boolean(busy) || !r2Configured}
          onClick={() => void destroy()}
          className={cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", r2Configured ? "text-ember" : "text-subtle")}
        >
          {busy === "r2" ? "Deleting…" : "Delete on R2"}
        </button>
      </div>
    </div>
  );
}

export function AdminAddTrack({ slug, cover }: { slug: string; cover: string }) {
  const { isAdmin, isPending } = useRadioUser();
  const [title, setTitle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [busy, setBusy] = useState(false);
  if (isPending || !isAdmin) return null;
  return (
    <form
      className="mt-4 flex flex-wrap gap-2 px-3 pb-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim() || !audioUrl.trim()) return;
        setBusy(true);
        void addStationTrack({ data: { channelSlug: slug, title: title.trim(), audioUrl: audioUrl.trim(), coverUrl: cover } })
          .then((result) => {
            usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
            setTitle("");
            setAudioUrl("");
          })
          .catch((error: unknown) => window.alert(error instanceof Error ? error.message : "Could not add"))
          .finally(() => setBusy(false));
      }}
    >
      <input className="input max-w-xs" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
      <input className="input max-w-md" value={audioUrl} onChange={(event) => setAudioUrl(event.target.value)} placeholder="https://r2.terrainfinity.ca/radio/…" />
      <button type="submit" disabled={busy} className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
        {busy ? "Adding…" : "Add to station"}
      </button>
    </form>
  );
}

export function AdminStationEdit({ channel }: { channel: Channel }) {
  const { isAdmin, isPending } = useRadioUser();
  if (isPending || !isAdmin) return null;
  return (
    <div className="mt-4">
      <StationSettingsForm key={channel.slug} channel={channel} />
    </div>
  );
}
