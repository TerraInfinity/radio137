import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { feedFor, offerFor } from "@/lib/device-sync";
import { applePodcastUrl } from "@/lib/rose-feed";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/sync/$slug/add")({
  component: SyncAdd,
  head: () => ({ meta: [{ title: "Add to Podcasts" }] }),
});

function SyncAdd() {
  const { slug } = Route.useParams();
  const channel = usePlayerStore((s) => s.catalog.channels.find((item) => item.slug === slug));
  const offer = offerFor(channel ?? { slug, tags: [] });
  const [origin, setOrigin] = useState("https://radio.terrainfinity.ca");
  const [held, setHeld] = useState(false);
  const feed = feedFor(slug, origin, offer);
  const podcast = feed ? applePodcastUrl(feed) : "";

  useEffect(() => setOrigin(window.location.origin), []);

  useEffect(() => {
    if (!offer.enabled || !podcast.startsWith("podcast:")) return;
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (!ios) return;
    window.location.assign(podcast);
    const timer = window.setTimeout(() => setHeld(true), 900);
    return () => window.clearTimeout(timer);
  }, [offer.enabled, podcast]);

  const title = channel?.name || (slug === "rose" ? "Rose" : slug);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-5xl font-semibold tracking-tight">{title}</h1>
      {podcast ? (
        <a href={podcast} className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-md bg-fg px-4 font-mono text-[12px] uppercase tracking-[0.14em] text-bg">
          Add {title} to Podcasts
        </a>
      ) : offer.appleUrl ? (
        <a href={offer.appleUrl} className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-md bg-fg px-4 font-mono text-[12px] uppercase tracking-[0.14em] text-bg">
          Open in Apple Podcasts
        </a>
      ) : (
        <p className="mt-6 text-muted">This station has no podcast feed yet. Open the sync page to download the audio.</p>
      )}
      <p className="mt-3 text-sm text-muted">{held ? "If Podcasts did not open, tap the button." : "Subscribe, then stay on Wi‑Fi."}</p>
    </div>
  );
}
