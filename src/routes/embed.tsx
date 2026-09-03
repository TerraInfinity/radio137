import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Pause, Play } from "lucide-react";
import { getCatalog, getPlayableTracks } from "@/lib/catalog";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/embed")({
  component: EmbedPage,
  head: () => ({ meta: [{ title: "Radio embed" }] }),
});

function EmbedPage() {
  const search = Route.useSearch() as { track?: string; station?: string; t?: string };
  const hydrate = usePlayerStore((s) => s.hydrate);
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const cueTrack = usePlayerStore((s) => s.cueTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const status = usePlayerStore((s) => s.status);
  const track = usePlayerStore((s) => s.track);
  const catalog = getCatalog();

  useEffect(() => {
    hydrate();
    const key = search.track || search.t;
    if (search.station) {
      const channel =
        catalog.channels.find((item) => item.slug === search.station || item.slug.includes(search.station || "")) ??
        catalog.channels.find((item) => item.enabled);
      if (channel) void tuneIn(channel.slug, { forcePlay: true });
      return;
    }
    if (key) {
      for (const channel of catalog.channels) {
        if (!channel.enabled) continue;
        const hit = getPlayableTracks(channel).find(
          (item) => item.id === key || item.audioUrl.includes(key) || item.title.toLowerCase().includes(key.toLowerCase()),
        );
        if (hit) {
          void cueTrack(channel.slug, hit.id);
          return;
        }
      }
    }
    const fallback = catalog.channels.find((item) => item.isDefault) ?? catalog.channels[0];
    if (fallback) void tuneIn(fallback.slug, { forcePlay: true });
  }, [catalog, cueTrack, hydrate, search.station, search.t, search.track, tuneIn]);

  useEffect(() => {
    const post = (type: string) => {
      window.parent?.postMessage({ source: "radio-embed", type, title: track?.title ?? null }, "*");
    };
    if (status === "playing") post("playing");
    if (status === "paused") post("paused");
  }, [status, track?.title]);

  return (
    <div className="flex h-full items-center gap-3 bg-bg px-3 text-fg">
      <button
        type="button"
        onClick={() => void togglePlay()}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-fg text-bg"
        aria-label={status === "playing" ? "Pause" : "Play"}
      >
        {status === "playing" ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
      </button>
      <div className="min-w-0">
        <p className="truncate font-display text-base font-semibold">{track?.title ?? "Radio"}</p>
        <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{track?.artist ?? "Idle"}</p>
      </div>
    </div>
  );
}
