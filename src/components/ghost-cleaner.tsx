import { useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getSeedCatalog } from "@/lib/catalog";
import { hideStationTrack, hideStationTracks, patchStationTrack } from "@/lib/desk-api";
import { mergeSceneTags, sceneFromTags } from "@/lib/phenomena";
import { ghostDropCount, ghostPlans, type GhostPlan } from "@/lib/playlist-ghosts";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel, Track } from "@/lib/types";

function applySnapshot(tracks: Parameters<typeof applyCatalogEdits>[1], stations: Parameters<typeof applyCatalogEdits>[2]) {
  usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}

export function GhostCleaner({ channel, compact = false }: { channel: Channel; compact?: boolean }) {
  const plans = ghostPlans(channel.tracks);
  const drop = ghostDropCount(plans);
  const [busy, setBusy] = useState(false);
  if (drop === 0) return null;

  async function inherit(plan: GhostPlan) {
    if (!plan.inheritScene) return;
    const donor = plan.drop.find((item) => sceneFromTags(item.tags));
    const scene = donor ? sceneFromTags(donor.tags) : null;
    if (!scene || sceneFromTags(plan.keep.tags)) return;
    const result = await patchStationTrack({
      data: {
        channelSlug: channel.slug,
        trackId: plan.keep.id,
        tags: mergeSceneTags(plan.keep.tags, scene),
        coverUrl: plan.keep.coverUrl || donor?.coverUrl || undefined,
      },
    });
    applySnapshot(result.tracks, result.stations);
  }

  async function clean() {
    const label = plans
      .map((plan) => `Keep “${plan.keep.title}”, remove ${plan.drop.map((item) => item.title).join(", ")}`)
      .join("\n");
    if (!window.confirm(`These extra rows look like copies — often animation stubs that did not replace the original file.\n\n${label}\n\nRemove the ghost copies from this playlist? The file stays on R2.`)) {
      return;
    }
    setBusy(true);
    try {
      for (const plan of plans) await inherit(plan);
      const tracks = plans.flatMap((plan) => plan.drop.map((item) => ({ trackId: item.id, audioUrl: item.audioUrl })));
      const result = await hideStationTracks({ data: { channelSlug: channel.slug, tracks } });
      applySnapshot(result.tracks, result.stations);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not clean ghosts");
    } finally {
      setBusy(false);
    }
  }

  async function dropOne(track: Track) {
    if (!window.confirm(`Remove “${track.title}” from this playlist? The file stays on R2.`)) return;
    setBusy(true);
    try {
      const result = await hideStationTrack({ data: { channelSlug: channel.slug, trackId: track.id, audioUrl: track.audioUrl } });
      applySnapshot(result.tracks, result.stations);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not remove");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={compact ? "ghost-clean ghost-clean-compact" : "ghost-clean"}>
      <p className="ghost-clean-copy">
        <Sparkles className="size-3.5 shrink-0 text-gold" />
        <span>
          {drop} extra {drop === 1 ? "row looks" : "rows look"} like {drop === 1 ? "a copy" : "copies"} of a song already here.
          {compact ? " Keep the original, drop the stub." : " Animation work added a second row instead of replacing the first. Keep one, remove the rest."}
        </span>
      </p>
      {!compact ? <GhostList plans={plans} busy={busy} onDrop={dropOne} /> : null}
      <button type="button" disabled={busy} onClick={() => void clean()} className="ghost-clean-go">
        <Trash2 className="size-3.5" />
        {busy ? "Cleaning…" : compact ? "Clean ghosts" : "Remove all ghost copies"}
      </button>
    </div>
  );
}

function GhostList({
  plans,
  busy,
  onDrop,
}: {
  plans: GhostPlan[];
  busy: boolean;
  onDrop: (track: Track) => void;
}) {
  return (
    <ul className="ghost-clean-list">
      {plans.map((plan) => (
        <li key={plan.keep.id} className="ghost-clean-plan">
          <p>
            <span className="text-fg">Keep {plan.keep.title}</span>
            <span className="text-muted"> · {plan.why}</span>
          </p>
          <ul>
            {plan.drop.map((item) => (
              <li key={item.id} className="ghost-clean-drop">
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
                <button type="button" disabled={busy} className="ghost-clean-one" onClick={() => onDrop(item)}>
                  Remove this
                </button>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
