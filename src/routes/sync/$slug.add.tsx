import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { appleShowLinks, offerFor, ROSE_APPLE_SHOW } from "@/lib/device-sync";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/sync/$slug/add")({
  component: SyncAdd,
  head: () => ({ meta: [{ title: "Add to Podcasts" }] }),
});

function SyncAdd() {
  const { slug } = Route.useParams();
  const channel = usePlayerStore((s) => s.catalog.channels.find((item) => item.slug === slug));
  const offer = offerFor(channel ?? { slug, tags: [] });
  const [held, setHeld] = useState(false);
  const catalogUrl = offer.appleUrl || (slug === "rose" ? ROSE_APPLE_SHOW : "");
  const show = appleShowLinks(catalogUrl);
  const ios = typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent);
  const target = (ios ? show?.app : show?.page) || "";

  useEffect(() => {
    if (!offer.enabled || !target) return;
    if (!ios) return;
    window.location.replace(target);
    const timer = window.setTimeout(() => setHeld(true), 900);
    return () => window.clearTimeout(timer);
  }, [ios, offer.enabled, target]);

  const title = channel?.name || (slug === "rose" ? "Rose" : slug);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-5xl font-semibold tracking-tight">{title}</h1>
      {target ? (
        <a href={target} className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-md bg-fg px-4 font-mono text-[12px] uppercase tracking-[0.14em] text-bg">
          Open {title} in Podcasts
        </a>
      ) : (
        <p className="mt-6 text-muted">This station has no Apple Podcasts show yet.</p>
      )}
      <p className="mt-3 text-sm text-muted">{held ? "If Podcasts did not open, tap the button." : "Subscribe, then stay on Wi‑Fi."}</p>
    </div>
  );
}
