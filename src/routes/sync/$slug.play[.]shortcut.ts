import { createFileRoute } from "@tanstack/react-router";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { listEdits, listStationEdits } from "@/lib/catalog-edits.server";
import { getSeedCatalog } from "@/lib/catalog";
import { appleShowLinks, offerFor, ROSE_APPLE_SHOW, siriFor } from "@/lib/device-sync";
import { playShowShortcutXml } from "@/lib/shortcut-file";

export const Route = createFileRoute("/sync/$slug/play.shortcut")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slug = params.slug;
        let catalog = getSeedCatalog();
        try {
          catalog = applyCatalogEdits(getSeedCatalog(), await listEdits(), await listStationEdits());
        } catch {
          /* seed catalog */
        }
        const channel = catalog.channels.find((item) => item.slug === slug);
        const offer = offerFor(channel ?? { slug, tags: [] });
        const show = appleShowLinks(offer.appleUrl || (slug === "rose" ? ROSE_APPLE_SHOW : ""));
        if (!show) return new Response("No Apple Podcasts show for this station.", { status: 404 });
        const name = siriFor(channel?.name || (slug === "rose" ? "Rose" : slug), slug, offer);
        const body = playShowShortcutXml(name, show.app);
        return new Response(body, {
          headers: {
            "content-type": "application/octet-stream",
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
