import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { getCatalog, getPlayableTracks } from "@/lib/catalog";
import { usePlayerStore } from "@/lib/player-store";

export function DeepLink() {
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const gateOpen = usePlayerStore((s) => s.gateOpen);
  const apply = usePlayerStore((s) => s.tuneIn);
  const cueTrack = usePlayerStore((s) => s.cueTrack);

  useEffect(() => {
    if (gateOpen) return;
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    const station = params.get("station");
    const track = params.get("track") || params.get("t") || params.get("radio");
    const catalog = getCatalog();
    if (station) {
      const channel = catalog.channels.find(
        (item) => item.slug === station || item.slug.includes(station) || item.name.toLowerCase().includes(station.toLowerCase()),
      );
      if (channel?.enabled) void apply(channel.slug, { forcePlay: true });
      return;
    }
    if (track) {
      for (const channel of catalog.channels) {
        if (!channel.enabled) continue;
        const hit = getPlayableTracks(channel).find(
          (item) => item.audioUrl.includes(track) || item.id === track,
        );
        if (hit) {
          void cueTrack(channel.slug, hit.id);
          return;
        }
      }
    }
  }, [apply, cueTrack, gateOpen, search]);

  return null;
}
