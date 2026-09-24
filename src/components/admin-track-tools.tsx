import { useState } from "react";
import { addStationTrack, deleteStationFile, hideStationTrack, patchStationTrack, renameStationFile, shareSongAudio } from "@/lib/desk-api";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { audioExtension, audioPathParts, fileLocationLabel, r2KeyFromAudioUrl } from "@/lib/file-path";
import { sameSongTitle } from "@/lib/rose-rite";
import { getSeedCatalog } from "@/lib/catalog";
import { directDeskUpload } from "@/lib/direct-upload";
import { convertWavOnThisDevice } from "@/lib/convert-wav";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";
import { cn, slugify } from "@/lib/cn";
import { parseTags } from "@/lib/search";
import { ArtUpload } from "@/components/art-upload";
import { FoldDetails } from "@/components/fold-section";
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
  const [busy, setBusy] = useState<"hide" | "r2" | "save" | "file" | "rename" | "share" | null>(null);
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [tags, setTags] = useState((track.tags ?? []).filter((tag) => !tag.startsWith("scene.v1.")).join(", "));
  const [publicSlug, setPublicSlug] = useState(track.slug ?? "");
  const [aliases, setAliases] = useState((track.aliases ?? []).join(", "));
  const [audioUrl, setAudioUrl] = useState(track.audioUrl);
  const [coverUrl, setCoverUrl] = useState(track.coverUrl ?? "");
  const [filename, setFilename] = useState(audioPathParts(track.audioUrl).filename);
  const [hint, setHint] = useState("");
  const next = usePlayerStore((s) => s.next);
  const playingId = usePlayerStore((s) => s.track?.id ?? null);
  const channels = usePlayerStore((s) => s.catalog.channels);
  if (isPending || !isAdmin) return null;
  const location = fileLocationLabel(track.audioUrl);
  const key = r2KeyFromAudioUrl(track.audioUrl);

  async function hide() {
    if (!window.confirm(`Remove “${track.title}” from this station? Other desks keep their copy. The file stays on R2.`)) return;
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
          tags: [...(track.tags ?? []).filter((tag) => tag.startsWith("scene.v1.")), ...parseTags(tags).filter((tag) => !tag.startsWith("scene.v1."))].join(", "),
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
      const result = await directDeskUpload({
        kind: "audio",
        slug,
        file,
        trackId: track.id,
        coverUrl: coverUrl.trim() || undefined,
      });
      if (result.tracks) applySnapshot(result.tracks, result.stations ?? [], playingId, next);
      if (result.object?.url) setAudioUrl(result.object.url);
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

  const copies = channels.flatMap((channel) =>
    channel.tracks
      .filter((item) => item.enabled !== false && item.audioUrl && sameSongTitle(item.title, track.title))
      .map((item) => ({ slug: channel.slug, url: item.audioUrl })),
  );
  const fileKeys = new Set(copies.map((item) => r2KeyFromAudioUrl(item.url) || item.url));
  const desks = new Set(copies.map((item) => item.slug));
  const ext = audioExtension(track.audioUrl);
  const needsMp3 = Boolean(ext) && ext !== "mp3";

  async function shareAudio(convert: boolean) {
    const where = desks.size > 1 ? `${copies.length} copies on ${desks.size} desks` : `${copies.length} ${copies.length === 1 ? "copy" : "copies"}`;
    const message = convert
      ? `Turn this ${ext || "file"} into an mp3 next to it and point ${where} of “${track.title}” at it?\n\nEncoding happens in this browser, with a progress line. The wav stays on R2.`
      : `Point ${where} of “${track.title}” at this audio file?\n\nOther files stay on R2. Titles stay as they are.`;
    if (!window.confirm(message)) return;
    setBusy("share");
    setHint(convert ? "Downloading the wav…" : "Sharing this file…");
    try {
      if (convert) {
        const result = await convertWavOnThisDevice({
          channelSlug: slug,
          trackId: track.id,
          audioUrl: track.audioUrl,
          onProgress: setHint,
        });
        applySnapshot(result.tracks, result.stations, playingId, next);
        if (result.url) setAudioUrl(result.url);
        setHint(`Mp3 is beside the wav. ${result.updated} ${result.updated === 1 ? "copy now uses" : "copies now use"} it.`);
        return;
      }
      const result = await shareSongAudio({ data: { channelSlug: slug, trackId: track.id, convert } });
      applySnapshot(result.tracks, result.stations, playingId, next);
      if (result.url) setAudioUrl(result.url);
      if (result.converted) setHint(`Mp3 is in radio/rose/. ${result.updated} ${result.updated === 1 ? "copy now uses" : "copies now use"} it.`);
      else if (result.reused) setHint(`Already an mp3 in radio/rose/. ${result.updated} ${result.updated === 1 ? "copy now uses" : "copies now use"} it.`);
      else setHint(result.updated ? `${result.updated} ${result.updated === 1 ? "copy now uses" : "copies now use"} this file.` : "Every copy already uses this file.");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not share this file");
      setHint("");
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
        title="Remove this song from this station"
        aria-label={`Remove ${track.title} from this station`}
        className="playlist-remove"
      >
        {busy === "hide" ? "…" : "Remove"}
      </button>
    );
  }

  return (
    <div>
      <p className="break-all font-mono text-[11px] text-subtle" title={track.audioUrl}>
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
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Tags</span>
          <input className="input mt-1" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="glados, sting, voice" />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Art URL</span>
          <input className="input mt-1" value={coverUrl} onChange={(event) => setCoverUrl(event.target.value)} placeholder="/covers/… or https://… jpg or mp4" />
          <span className="mt-1 block text-sm text-muted">Still under 2 MB or looping mp4 under 32 MB. Phone photos shrink on the way in. Plays on this song page only, not on every list thumbnail.</span>
        </label>
        <ArtUpload slug={slug} trackId={track.id} current={coverUrl} onUrl={setCoverUrl} />
        <FoldDetails title="Public URLs" hint="Edit">
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
        </FoldDetails>
        <FoldDetails title="Audio file" hint="Open">
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
          {key ? (
            <button type="button" disabled={Boolean(busy) || !r2Configured} onClick={() => void renameFile()} className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              {busy === "rename" ? "Renaming…" : "Rename file on R2"}
            </button>
          ) : null}
          <label className="block cursor-pointer rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Replace audio file</span>
            <p className="mt-1 text-sm text-muted">
              {r2Configured ? "Upload a new mp3 / wav / flac / m4a. The song keeps its id and tags." : "R2 keys are dark — paste a new URL above instead."}
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
          {needsMp3 ? (
            <button type="button" disabled={Boolean(busy)} onClick={() => void shareAudio(true)} className="inline-flex h-11 items-center px-3 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              {busy === "share" ? "Working…" : "Convert to mp3 and use it everywhere"}
            </button>
          ) : null}
          {fileKeys.size > 1 ? (
            <button type="button" disabled={Boolean(busy)} onClick={() => void shareAudio(false)} className="inline-flex h-11 items-center px-3 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              {busy === "share" ? "Working…" : "Use this file on every copy"}
            </button>
          ) : null}
          <p className="text-sm text-muted">
            {copies.length > 1
              ? `${copies.length} copies of this song, ${fileKeys.size} ${fileKeys.size === 1 ? "file" : "files"}, ${desks.size} ${desks.size === 1 ? "desk" : "desks"}. Same name keeps its own scene.`
              : "No other copy of this song is on a desk."}
            {needsMp3 ? " A wav stays put. The new mp3 lands in radio/rose/ and every copy of this name plays that." : ""}
          </p>
        </FoldDetails>
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={Boolean(busy)} className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
            {busy === "save" ? "Saving…" : "Save song"}
          </button>
        </div>
        {hint ? <p className="text-sm text-muted">{hint}</p> : null}
      </form>
      <FoldDetails title="Remove or delete" hint="Open">
        <div className="flex flex-wrap gap-2">
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
      </FoldDetails>
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
  return <StationSettingsForm key={channel.slug} channel={channel} compact />;
}
