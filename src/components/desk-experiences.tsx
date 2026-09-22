import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { FoldSection } from "@/components/fold-section";
import { GhostCleaner } from "@/components/ghost-cleaner";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getPlayableTracks, getSeedCatalog } from "@/lib/catalog";
import { cn, formatClock, slugify } from "@/lib/cn";
import { hideStationTrack, patchStationTrack, reorderStationTracks, saveStation } from "@/lib/desk-api";
import {
  experienceFromChannel,
  listExperiences,
  mergeXpTags,
  xpFromTags,
  type ExperienceDraft,
} from "@/lib/experiences";
import { lookForTrack, mergeSceneTags, PHENOMENA, parsePhenomenon, phenomenonAt, sceneFromTags, type PhenomenonId } from "@/lib/phenomena";
import { ghostDropIds } from "@/lib/playlist-ghosts";
import { lookFromStation } from "@/lib/rose-look";
import { durationOf } from "@/lib/playback";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel, Track } from "@/lib/types";

function applySnapshot(tracks: Parameters<typeof applyCatalogEdits>[1], stations: Parameters<typeof applyCatalogEdits>[2]) {
  usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}

function fail(error: unknown) {
  window.alert(error instanceof Error ? error.message : "Could not save experience");
}

function draftFromChannel(channel: Channel): ExperienceDraft {
  const packed = xpFromTags(channel.tags);
  const seed = experienceFromChannel(channel);
  return {
    slug: packed?.slug || seed?.slug || channel.slug,
    title: packed?.title || seed?.title || channel.name,
    kicker: packed?.kicker || seed?.kicker || "Experience",
    line: packed?.line || seed?.line || channel.energy || "",
    whisper: packed?.whisper || seed?.whisper || "",
    summary: packed?.summary || seed?.summary || channel.description || "",
    bpm: packed?.bpm || seed?.bpm || 120,
    phenomenon: packed?.phenomenon || seed?.phenomenon || "vortex",
    captions: packed?.captions?.length ? packed.captions : seed?.captions ?? [],
  };
}

export function DeskExperiences({ channels }: { channels: Channel[] }) {
  const catalog = usePlayerStore((s) => s.catalog);
  const experiences = listExperiences(catalog.channels.length ? catalog : undefined);
  const used = new Set(experiences.map((item) => item.stationSlug));
  const candidates = channels.filter((channel) => !used.has(channel.slug));
  const [open, setOpen] = useState<string | null>(experiences[0]?.stationSlug ?? null);

  return (
    <div className="mt-8 space-y-8">
      <p className="max-w-prose text-sm text-muted">
        An experience is a fixed-order rite: first song first, no live clock, shuffle off. If animation work added a
        second row for a song that was already here, a ghost banner appears — keep the original file, drop the stub.
      </p>
      <NewExperienceForm channels={candidates} />
      {experiences.length === 0 ? <p className="text-sm text-muted">No rites yet. Make one from a station.</p> : null}
      {experiences.map((item) => {
        const channel = channels.find((entry) => entry.slug === item.stationSlug);
        if (!channel) return null;
        return (
          <FoldSection
            key={item.stationSlug}
            title={item.title}
            hint={open === item.stationSlug ? "Hide" : "Direct"}
            persist={`xp-${item.stationSlug}`}
            defaultOpen={open === item.stationSlug}
          >
            <ExperienceEditor
              channel={channel}
              onOpen={() => setOpen(item.stationSlug)}
            />
          </FoldSection>
        );
      })}
    </div>
  );
}

function NewExperienceForm({ channels }: { channels: Channel[] }) {
  const [slug, setSlug] = useState(channels[0]?.slug ?? "");
  const [title, setTitle] = useState("");
  const [kicker, setKicker] = useState("");
  const [line, setLine] = useState("");
  const [whisper, setWhisper] = useState("");
  const [summary, setSummary] = useState("");
  const [phenomenon, setPhenomenon] = useState<PhenomenonId>("vortex");
  const [busy, setBusy] = useState(false);
  const channel = channels.find((item) => item.slug === slug);

  return (
    <FoldSection title="New experience" hint="Create" persist="xp-new">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!channel || !title.trim()) return;
          setBusy(true);
          const draft: ExperienceDraft = {
            slug: slugify(title) || channel.slug,
            title: title.trim(),
            kicker: kicker.trim() || "Experience",
            line: line.trim(),
            whisper: whisper.trim(),
            summary: summary.trim() || channel.description,
            bpm: 120,
            phenomenon,
            captions: [line.trim(), whisper.trim()].filter(Boolean),
          };
          void saveStation({
            data: {
              slug: channel.slug,
              kind: "fixed",
              shuffle: "off",
              featured: true,
              category: "Experience",
              energy: "start to finish",
              tags: mergeXpTags(channel.tags, draft),
            },
          })
            .then((result) => {
              applySnapshot(result.tracks, result.stations);
              setTitle("");
              setKicker("");
              setLine("");
              setWhisper("");
              setSummary("");
            })
            .catch(fail)
            .finally(() => setBusy(false));
        }}
      >
        <p className="text-sm text-muted">
          The station becomes a fixed playlist. Listeners start at song one — never the live clock.
        </p>
        <select className="input" value={slug} onChange={(event) => setSlug(event.target.value)} disabled={!channels.length}>
          {channels.length === 0 ? <option value="">Every station already has a rite</option> : null}
          {channels.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
        <input className="input" value={kicker} onChange={(event) => setKicker(event.target.value)} placeholder="Kicker · 2137" />
        <input className="input" value={line} onChange={(event) => setLine(event.target.value)} placeholder="The line on the stage" />
        <input className="input" value={whisper} onChange={(event) => setWhisper(event.target.value)} placeholder="Whisper" />
        <textarea className="input" rows={3} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Summary" />
        <div className="flex flex-wrap gap-1">
          {PHENOMENA.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={phenomenon === item.id}
              title={item.hint}
              onClick={() => setPhenomenon(item.id)}
              className={cn(
                "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em]",
                phenomenon === item.id ? "bg-fg text-bg" : "text-gold",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button type="submit" disabled={busy || !channel || !title.trim()} className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-50">
          {busy ? "Creating…" : "Make experience"}
        </button>
      </form>
    </FoldSection>
  );
}

function ExperienceEditor({ channel, onOpen }: { channel: Channel; onOpen: () => void }) {
  const draft0 = draftFromChannel(channel);
  const [draft, setDraft] = useState(draft0);
  const [busy, setBusy] = useState(false);
  const playable = getPlayableTracks(channel);
  const xp = experienceFromChannel(channel);

  function patch(next: Partial<ExperienceDraft>) {
    setDraft((prev) => ({ ...prev, ...next }));
  }

  return (
    <div className="xp-board" onFocus={onOpen}>
      <div className="xp-board-actions">
        {xp ? (
          <Link to="/experiences/$slug" params={{ slug: xp.slug }} className="xp-link">
            Open rite
          </Link>
        ) : null}
        <Link to="/channel/$slug" params={{ slug: channel.slug }} className="xp-link">
          Station
        </Link>
      </div>
      <GhostCleaner channel={channel} />
      <TrackScenes channel={channel} tracks={playable} stationPhenomenon={draft.phenomenon} />
      <FoldSection title="Rite identity" hint="Edit" persist={`xp-id-${channel.slug}`} defaultOpen={false}>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            setBusy(true);
            void saveStation({
              data: {
                slug: channel.slug,
                kind: "fixed",
                shuffle: "off",
                name: draft.title.trim() || channel.name,
                energy: draft.line.trim() || channel.energy,
                description: draft.summary.trim() || channel.description,
                category: "Experience",
                tags: mergeXpTags(channel.tags, draft),
              },
            })
              .then((result) => applySnapshot(result.tracks, result.stations))
              .catch(fail)
              .finally(() => setBusy(false));
          }}
        >
          <input className="input" value={draft.title} onChange={(event) => patch({ title: event.target.value })} placeholder="Title" />
          <input className="input" value={draft.kicker} onChange={(event) => patch({ kicker: event.target.value })} placeholder="Kicker" />
          <input className="input" value={draft.line} onChange={(event) => patch({ line: event.target.value })} placeholder="Line" />
          <input className="input" value={draft.whisper} onChange={(event) => patch({ whisper: event.target.value })} placeholder="Whisper" />
          <textarea className="input" rows={3} value={draft.summary} onChange={(event) => patch({ summary: event.target.value })} placeholder="Summary" />
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Default BPM</span>
            <input
              className="input mt-1"
              type="number"
              min={0}
              max={200}
              value={draft.bpm}
              onChange={(event) => patch({ bpm: Number(event.target.value) })}
            />
          </label>
          <textarea
            className="input"
            rows={3}
            value={draft.captions.join("\n")}
            onChange={(event) => patch({ captions: event.target.value.split("\n") })}
            placeholder="Captions · one per line"
          />
          <div className="flex flex-wrap gap-1">
            {PHENOMENA.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={draft.phenomenon === item.id}
                title={item.hint}
                onClick={() => patch({ phenomenon: item.id })}
                className={cn(
                  "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em]",
                  draft.phenomenon === item.id ? "bg-fg text-bg" : "text-gold",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button type="submit" disabled={busy} className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
            {busy ? "Saving…" : "Save rite"}
          </button>
        </form>
      </FoldSection>
    </div>
  );
}

function TrackScenes({
  channel,
  tracks,
  stationPhenomenon,
}: {
  channel: Channel;
  tracks: Track[];
  stationPhenomenon: PhenomenonId;
}) {
  const [busy, setBusy] = useState(false);
  const base = lookFromStation(
    experienceFromChannel(channel) ?? {
      slug: channel.slug,
      stationSlug: channel.slug,
      title: channel.name,
      kicker: "",
      line: "",
      whisper: "",
      summary: "",
      cover: channel.cover,
      loop: channel.videoUrl || "",
      stills: [],
      bpm: 120,
      captions: [],
      phenomenon: stationPhenomenon,
    },
    channel,
  );

  async function move(index: number, dir: -1 | 1) {
    const next = [...tracks];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setBusy(true);
    try {
      const result = await reorderStationTracks({ data: { channelSlug: channel.slug, trackIds: next.map((item) => item.id) } });
      applySnapshot(result.tracks, result.stations);
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  }

  async function pin(track: Track, index: number, phenomenon: PhenomenonId) {
    setBusy(true);
    try {
      const current = lookForTrack(base, track, index);
      const result = await patchStationTrack({
        data: {
          channelSlug: channel.slug,
          trackId: track.id,
          tags: mergeSceneTags(track.tags, { ...current, phenomenon }),
        },
      });
      applySnapshot(result.tracks, result.stations);
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  }

  async function remove(track: Track) {
    if (!window.confirm(`Remove “${track.title}” from this rite? Other desks keep their copy. The file stays on R2.`)) return;
    setBusy(true);
    try {
      const result = await hideStationTrack({ data: { channelSlug: channel.slug, trackId: track.id, audioUrl: track.audioUrl } });
      applySnapshot(result.tracks, result.stations);
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  }

  const ghosts = ghostDropIds(channel.tracks);

  return (
    <div className="xp-card">
      <p className="xp-kicker">Score · {tracks.length} songs</p>
      <p className="mt-1 text-sm text-muted">
        This is the rite in order. Remove drops a row from this playlist only — it does not delete the R2 file. Ghost
        copies are extra rows added when a scene was painted; keep the real cut.
      </p>
      {tracks.length === 0 ? <p className="mt-3 text-sm text-muted">Empty score. Add songs from the Stations tab.</p> : null}
      <ol className="xp-score">
        {tracks.map((track, index) => {
          const scene = sceneFromTags(track.tags);
          const phenomenon = scene?.phenomenon || phenomenonAt(index, stationPhenomenon);
          const ghost = ghosts.has(track.id);
          return (
            <li key={track.id} className={cn("xp-score-row", ghost && "is-ghost")}>
              <span className="xp-score-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{track.title}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                  {formatClock(durationOf(track))} · {scene ? "pinned" : "cycles"}
                  {ghost ? " · ghost copy" : ""}
                </p>
              </div>
              <select
                className="input xp-score-scene"
                value={phenomenon}
                disabled={busy}
                aria-label={`Phenomenon for ${track.title}`}
                onChange={(event) => void pin(track, index, parsePhenomenon(event.target.value, stationPhenomenon))}
              >
                {PHENOMENA.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <div className="xp-score-tools">
                <button type="button" disabled={busy || index === 0} className="xp-icon" aria-label="Move up" onClick={() => void move(index, -1)}>
                  <ArrowUp className="size-3.5" />
                </button>
                <button type="button" disabled={busy || index === tracks.length - 1} className="xp-icon" aria-label="Move down" onClick={() => void move(index, 1)}>
                  <ArrowDown className="size-3.5" />
                </button>
                <button type="button" disabled={busy} className="xp-icon is-danger" aria-label={`Remove ${track.title}`} onClick={() => void remove(track)}>
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

