import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { applePodcastUrl, roseFeedUrl } from "@/lib/rose-feed";

export const Route = createFileRoute("/sync/$slug/add")({
  component: SyncAdd,
  head: () => ({ meta: [{ title: "Add Rose · Podcasts" }] }),
});

function SyncAdd() {
  const { slug } = Route.useParams();
  const [feed, setFeed] = useState("https://radio.terrainfinity.ca/feeds/rose.xml");
  const [held, setHeld] = useState(false);
  const ready = slug === "rose";
  const podcast = applePodcastUrl(feed);

  useEffect(() => {
    setFeed(roseFeedUrl(window.location.origin));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (!ios || !podcast.startsWith("podcast:")) return;
    window.location.assign(podcast);
    const timer = window.setTimeout(() => setHeld(true), 900);
    return () => window.clearTimeout(timer);
  }, [podcast, ready]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-5xl font-semibold tracking-tight">Rose</h1>
      <a
        href={ready ? podcast : undefined}
        className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-md bg-fg px-4 font-mono text-[12px] uppercase tracking-[0.14em] text-bg"
      >
        Add Rose to Podcasts
      </a>
      <p className="mt-3 text-sm text-muted">{held ? "If Podcasts did not open, tap the button." : "Subscribe, then stay on Wi‑Fi."}</p>
    </div>
  );
}
