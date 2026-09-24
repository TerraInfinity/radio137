import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminTrackTools } from "@/components/admin-track-tools";
import { AdminMergeBox, SongCopies } from "@/components/desk-directory";
import { CoverArt } from "@/components/cover-art";
import { DownloadLink } from "@/components/download-link";
import { FoldSection } from "@/components/fold-section";
import { ShareLink } from "@/components/share-link";
import { SignInChoices } from "@/components/sign-in-choices";
import { TrackActions } from "@/components/track-actions";
import { getPlayableTracks, getSeedCatalog, stationsForRecording } from "@/lib/catalog";
import { placeStationTrack } from "@/lib/desk-api";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { formatClock } from "@/lib/cn";
import { experienceFromChannel } from "@/lib/experiences";
import { durationOf } from "@/lib/playback";
import { useDurationClock } from "@/lib/duration-probe";
import { useRadioUser } from "@/lib/radio-user";
import { aliasPath, songKey, songPath } from "@/lib/song-url";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel, Track } from "@/lib/types";

export function SongCut({
  track,
  channel,
  locked,
  sharePath,
}: {
  track: Track;
  channel: Channel;
  locked: boolean;
  sharePath: string;
}) {
  const cueTrack = usePlayerStore((s) => s.cueTrack);
  const status = usePlayerStore((s) => s.status);
  const trackNow = usePlayerStore((s) => s.track);
  const bumpView = usePlayerStore((s) => s.bumpView);
  const ready = usePlayerStore((s) => s.ready);
  const catalogReady = usePlayerStore((s) => s.catalogReady);
  const { isAdmin } = useRadioUser();
  useDurationClock([track]);

  useEffect(() => {
    if (!ready || !catalogReady || locked) return;
    const now = usePlayerStore.getState();
    if (now.track?.id === track.id && (now.status === "playing" || now.status === "loading" || now.status === "paused")) return;
    bumpView(track.id);
    void cueTrack(channel.slug, track.id, { play: now.autoplay || now.status === "playing" });
  }, [ready, catalogReady, locked, track.id, channel.slug, bumpView, cueTrack]);

  if (locked) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">18+ · Locked</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">This song is off the public dial</h1>
        <p className="mt-4 max-w-prose text-muted">Sign in with Google or X to open 18+ rooms. Google still lives on the Terrainfinity hub.</p>
        <div className="mt-8">
          <SignInChoices next={sharePath} />
        </div>
      </div>
    );
  }

  const playingHere = trackNow?.id === track.id && status === "playing";
  const homes = stationsForRecording(track).filter((item) => isAdmin || item.enabled);
  const canonical = songPath(track);
  const aliases = track.aliases ?? [];
  const tags = track.tags ?? [];
  const playable = getPlayableTracks(channel);
  const hereIndex = playable.findIndex((item) => item.id === track.id);
  const more =
    hereIndex < 0
      ? playable.filter((item) => item.id !== track.id).slice(0, 8)
      : [...playable.slice(hereIndex + 1), ...playable.slice(0, hereIndex)].slice(0, 8);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Song</p>
      <div className="mt-6 flex gap-5">
        <CoverArt src={track.coverUrl || channel.cover} alt="" className="size-32 shrink-0 rounded-lg sm:size-40" motion="loop" />
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-semibold tracking-tight">{track.title}</h1>
          <p className="mt-2 text-muted">{track.artist}</p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">{formatClock(durationOf(track))}</p>
          {tags.length > 0 ? <SongTags tags={tags} /> : null}
          <TrackActions trackId={track.id} />
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            bumpView(track.id);
            void cueTrack(channel.slug, track.id);
          }}
          className="inline-flex h-12 min-w-36 items-center justify-center gap-2 rounded-md bg-fg px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-bg"
        >
          <Play className="size-4 ml-0.5" />
          {playingHere ? "Playing" : "Play"}
        </button>
        <DownloadLink track={track} />
        <Link
          to={experienceFromChannel(channel) ? "/experiences/$slug" : "/channel/$slug"}
          params={{ slug: experienceFromChannel(channel)?.slug ?? channel.slug }}
          className="inline-flex h-12 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
        >
          {channel.name}
        </Link>
        <ShareLink path={sharePath} title={track.title} compact />
      </div>
      <SongStations track={track} fromSlug={channel.slug} homes={homes.length ? homes : [channel]} isAdmin={isAdmin} />
      {aliases.length > 0 || canonical ? (
        <FoldSection title="Addresses" hint="Links">
          <p className="break-all font-mono text-[11px] text-subtle">
            Player{" "}
            <a href={canonical} className="text-gold">
              {canonical}
            </a>
          </p>
          {aliases.length > 0 ? (
            <p className="mt-2 font-mono text-[11px] text-subtle">
              Short{" "}
              {aliases.map((alias, index) => (
                <span key={alias}>
                  {index ? " · " : ""}
                  <a href={aliasPath(alias)} className="text-gold">
                    /{alias}
                  </a>
                </span>
              ))}
            </p>
          ) : null}
        </FoldSection>
      ) : null}
      {more.length > 0 ? (
        <FoldSection title={`More on ${channel.name}`} hint="Open">
          <ol className="divide-y divide-line">
            {more.map((item, index) => (
              <li key={item.id} className="playlist-row px-0">
                <span className="w-7 shrink-0 text-center font-mono text-[10px] tabular-nums text-subtle">
                  {String((hereIndex < 0 ? index : (hereIndex + 1 + index) % playable.length) + 1).padStart(2, "0")}
                </span>
                <Link to="/player/$id" params={{ id: songKey(item) }} className="flex min-w-0 flex-1 items-center gap-2.5 py-1">
                  <span className="size-10 shrink-0 overflow-hidden rounded-sm bg-bg">
                    <CoverArt src={item.coverUrl && !item.coverUrl.match(/\.(mp4|webm|mov|m4v)$/i) ? item.coverUrl : channel.cover} alt="" className="size-full" motion="still" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{item.title}</span>
                    <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.1em] text-subtle">{item.artist || "Unknown"}</span>
                  </span>
                  <span className="min-w-12 shrink-0 text-right font-mono text-[10px] tabular-nums text-subtle">
                    {formatClock(durationOf(item))}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => void cueTrack(channel.slug, item.id)}
                  className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
                >
                  Play
                </button>
              </li>
            ))}
          </ol>
        </FoldSection>
      ) : null}
      <SongCopies trackId={track.id} />
      {isAdmin ? (
        <FoldSection title="Edit this song" hint="Edit" titleClassName="text-gold">
          <AdminTrackTools
            key={`${channel.slug}:${track.id}:${track.audioUrl}:${track.slug ?? ""}:${aliases.join(",")}:${(track.tags ?? []).join(",")}`}
            slug={channel.slug}
            track={track}
          />
        </FoldSection>
      ) : null}
      {isAdmin ? (
        <FoldSection title="Merge copies" hint="Open" titleClassName="text-gold">
          <AdminMergeBox trackId={track.id} />
        </FoldSection>
      ) : null}
    </div>
  );
}

function SongStations({ track, fromSlug, homes, isAdmin }: { track: Track; fromSlug: string; homes: Channel[]; isAdmin: boolean }) {
  const catalog = usePlayerStore((s) => s.catalog);
  const [toSlug, setToSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");
  const choices = catalog.channels
    .filter((channel) => !homes.some((home) => home.slug === channel.slug))
    .sort((a, b) => a.name.localeCompare(b.name));

  async function add() {
    if (!toSlug) return;
    setBusy(true);
    setHint("");
    try {
      const result = await placeStationTrack({ data: { fromSlug, trackId: track.id, toSlug, mode: "copy" } });
      usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations ?? []));
      setToSlug("");
      setHint("Added. The experience and the station share that list.");
    } catch (error) {
      setHint(error instanceof Error ? error.message : "Could not add it");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold">Stations</p>
      <p className="mt-2 max-w-prose text-sm text-muted">The experience is the show. The station is the same playlist, without the scene.</p>
      <ul className="mt-3 divide-y divide-line">
        {homes.map((item) => {
          const xp = experienceFromChannel(item);
          return (
            <li key={item.slug} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg">{xp?.title || item.name}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                  {xp ? "Experience and station" : "Station"}
                  {!item.enabled ? " · off the air" : ""}
                </p>
              </div>
              {xp ? (
                <Link to="/experiences/$slug" params={{ slug: xp.slug }} className="inline-flex h-10 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
                  Experience
                </Link>
              ) : null}
              <Link to="/channel/$slug" params={{ slug: item.slug }} className="inline-flex h-10 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
                Station
              </Link>
            </li>
          );
        })}
      </ul>
      {isAdmin && choices.length ? (
        <div className="mt-3">
          <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-subtle" htmlFor="add-station">
            Add to a station
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select id="add-station" className="input min-w-0 flex-1" value={toSlug} onChange={(event) => setToSlug(event.target.value)}>
              <option value="">Choose a station</option>
              {choices.map((channel) => (
                <option key={channel.slug} value={channel.slug}>
                  {channel.name}
                  {channel.enabled ? "" : " (off)"}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!toSlug || busy}
              onClick={() => void add()}
              className="inline-flex h-11 items-center rounded-md bg-fg px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-40"
            >
              {busy ? "Adding…" : "Add"}
            </button>
          </div>
          {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
        </div>
      ) : null}
    </section>
  );
}

function SongTags({ tags }: { tags: string[] }) {
  const [open, setOpen] = useState(false);
  const shown = open ? tags : tags.slice(0, 4);
  return (
    <ul className="mt-3 flex flex-wrap gap-1">
      {shown.map((tag) => (
        <li key={tag}>
          <Link
            to="/"
            search={{ q: tag }}
            className="inline-flex h-8 items-center rounded-md px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold shadow-[var(--shadow-border)]"
          >
            {tag}
          </Link>
        </li>
      ))}
      {tags.length > 4 ? (
        <li>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-8 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle"
          >
            {open ? "Less" : `+${tags.length - 4}`}
          </button>
        </li>
      ) : null}
    </ul>
  );
}
