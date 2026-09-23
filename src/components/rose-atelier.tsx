import { useState } from "react";
import { Palette, X } from "lucide-react";
import { ArtUpload } from "@/components/art-upload";
import { FoldDetails } from "@/components/fold-section";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getSeedCatalog } from "@/lib/catalog";
import { patchStationTrack, saveStation } from "@/lib/desk-api";
import { looksEqual, mergeLookTags, ROSE_LOOK_PRESETS, type RoseLook } from "@/lib/rose-look";
import { mergeSceneTags, PHENOMENA, type PhenomenonId } from "@/lib/phenomena";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel, Track } from "@/lib/types";

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="rose-atelier-row">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <em>{Number.isInteger(step) ? value : value.toFixed(2)}</em>
    </label>
  );
}

export function RoseAtelier({
  channel,
  track,
  look,
  saved,
  onLook,
  onClose,
}: {
  channel: Channel;
  track?: Track | null;
  look: RoseLook;
  saved: RoseLook;
  onLook: (next: RoseLook) => void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");
  const dirty = !looksEqual(look, saved);

  function patch(next: Partial<RoseLook>) {
    onLook({ ...look, ...next });
  }

  async function publish() {
    setBusy(true);
    setHint("Saving look…");
    try {
      const result = await saveStation({
        data: {
          slug: channel.slug,
          tags: mergeLookTags(channel.tags, look),
          cover: look.stillUrls[0] || channel.cover,
          animationUrl: look.loopUrl || undefined,
          videoUrl: look.loopUrl || undefined,
        },
      });
      usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
      setHint("Look is live on the station.");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not save look");
      setHint("");
    } finally {
      setBusy(false);
    }
  }

  async function publishSong() {
    if (!track) {
      window.alert("Play a song first so this scene has a cut to pin.");
      return;
    }
    setBusy(true);
    setHint("Pinning this song…");
    try {
      const result = await patchStationTrack({
        data: {
          channelSlug: channel.slug,
          trackId: track.id,
          tags: mergeSceneTags(track.tags, look),
        },
      });
      usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
      setHint(`Pinned to ${track.title}.`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not save song scene");
      setHint("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="rose-atelier" aria-label="Experience atelier">
      <div className="rose-desk-bar">
        <p className="rose-desk-kicker">
          <Palette className="size-3.5" />
          Atelier
        </p>
        <button type="button" className="rose-opera-ghost" onClick={onClose} aria-label="Close atelier">
          <X className="size-4" />
        </button>
      </div>
      <p className="rose-atelier-note">Tweak live, or tap the look chip on the stage to cycle scenes. Grok can talk a cut into a look. Pin a song if you want that override to stick.</p>
      <div className="rose-atelier-presets">
        {PHENOMENA.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={look.phenomenon === item.id}
            className="rose-opera-ghost"
            title={item.hint}
            onClick={() => patch({ phenomenon: item.id as PhenomenonId })}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="rose-atelier-hint">{PHENOMENA.find((item) => item.id === look.phenomenon)?.hint}</p>
      <div className="rose-atelier-presets">
        {ROSE_LOOK_PRESETS.map((preset) => (
          <button key={preset.id} type="button" className="rose-opera-ghost" onClick={() => patch(preset.patch)}>
            {preset.label}
          </button>
        ))}
      </div>
      <Slider label="Fly" value={look.fly} min={0} max={2} step={0.05} onChange={(fly) => patch({ fly })} />
      <Slider label="Punch" value={look.intensity} min={0} max={2} step={0.05} onChange={(intensity) => patch({ intensity })} />
      <Slider label="BPM" value={look.bpm} min={0} max={180} step={1} onChange={(bpm) => patch({ bpm })} />
      <p className="rose-atelier-hint">{look.bpm ? `${look.bpm} locks the grid` : "0 follows the song tag"}</p>
      <Slider label="Stills" value={look.stills} min={0} max={1} step={0.05} onChange={(stills) => patch({ stills })} />
      <Slider label="Loop" value={look.loop} min={0} max={1} step={0.05} onChange={(loop) => patch({ loop })} />
      <Slider label="Stars" value={look.stars} min={20} max={200} step={1} onChange={(stars) => patch({ stars })} />
      <Slider label="Glyphs" value={look.glyphs} min={0} max={32} step={1} onChange={(glyphs) => patch({ glyphs })} />
      <Slider label="Rings" value={look.rings} min={0} max={36} step={1} onChange={(rings) => patch({ rings })} />
      <div className="rose-atelier-toggles">
        {(["box", "bolts", "petals"] as const).map((key) => (
          <button key={key} type="button" aria-pressed={look[key]} className="rose-opera-ghost" onClick={() => patch({ [key]: !look[key] })}>
            {key}
          </button>
        ))}
      </div>
      <label className="rose-atelier-copy">
        <span>Captions · one per line, walk with the phrase</span>
        <textarea
          className="input"
          rows={4}
          value={look.captions.join("\n")}
          onChange={(event) => patch({ captions: event.target.value.split("\n") })}
        />
      </label>
      <FoldDetails title="Loop and stills" hint="Art">
      <p className="rose-desk-kicker">Loop video</p>
      <input
        className="input"
        value={look.loopUrl}
        onChange={(event) => patch({ loopUrl: event.target.value })}
        placeholder="Looping mp4 / webm URL"
      />
      <ArtUpload slug={channel.slug} current={look.loopUrl} onUrl={(url) => patch({ loopUrl: url })} />
      <p className="rose-desk-kicker">Stills</p>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="rose-atelier-still">
          <input
            className="input"
            value={look.stillUrls[index] ?? ""}
            placeholder={`Still ${index + 1}`}
            onChange={(event) => {
              const stillUrls = [...look.stillUrls];
              stillUrls[index] = event.target.value;
              patch({ stillUrls });
            }}
          />
          <ArtUpload
            slug={channel.slug}
            current={look.stillUrls[index]}
            onUrl={(url, kind) => {
              if (kind === "video") {
                patch({ loopUrl: url });
                return;
              }
              const stillUrls = [...look.stillUrls];
              stillUrls[index] = url;
              patch({ stillUrls });
            }}
          />
        </div>
      ))}
      </FoldDetails>
      <div className="rose-atelier-save">
        <button type="button" className="rose-opera-begin" disabled={busy || !dirty} onClick={() => void publish()}>
          {busy ? "Saving" : dirty ? "Save station look" : "Station saved"}
        </button>
        <button type="button" className="rose-opera-ghost" disabled={busy || !track} onClick={() => void publishSong()}>
          {track ? "Pin this song" : "Play a song to pin"}
        </button>
        {dirty ? (
          <button type="button" className="rose-opera-ghost" onClick={() => onLook(saved)}>
            Revert
          </button>
        ) : null}
      </div>
      {hint ? <p className="rose-atelier-hint">{hint}</p> : null}
    </aside>
  );
}
