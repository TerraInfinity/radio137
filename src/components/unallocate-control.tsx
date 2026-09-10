import { useState } from "react";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getSeedCatalog } from "@/lib/catalog";
import { unallocateStationTrack } from "@/lib/desk-api";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel, Track } from "@/lib/types";

export function UnallocateControl({ channel, track }: { channel: Channel; track: Track }) {
  const { isAdmin, isPending } = useRadioUser();
  const [busy, setBusy] = useState(false);
  if (isPending || !isAdmin) return null;

  async function run() {
    if (!window.confirm(`Remove from ${channel.name}? File stays on R2. Lands in Desk → Review. Other stations untouched.`)) {
      return;
    }
    setBusy(true);
    try {
      const result = await unallocateStationTrack({
        data: {
          channelSlug: channel.slug,
          trackId: track.id,
          audioUrl: track.audioUrl,
          title: track.title,
          artist: track.artist,
          coverUrl: track.coverUrl,
        },
      });
      usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
      usePlayerStore.setState({ deckHint: "Sent to Review." });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not unallocate");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void run()}
      title="Remove from this station into Desk Review"
      className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
    >
      {busy ? "Sending…" : "To review"}
    </button>
  );
}
