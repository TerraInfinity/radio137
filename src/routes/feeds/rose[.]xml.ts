import { createFileRoute } from "@tanstack/react-router";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { listEdits, listStationEdits } from "@/lib/catalog-edits.server";
import { getSeedCatalog } from "@/lib/catalog";
import { roseFeedCandidates, roseFeedXml, type RoseFeedFact } from "@/lib/rose-feed";
import { loadRoseFeedFacts } from "@/lib/rose-feed-probe.server";

export const Route = createFileRoute("/feeds/rose.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        let catalog = getSeedCatalog();
        try {
          catalog = applyCatalogEdits(getSeedCatalog(), await listEdits(), await listStationEdits());
        } catch {
          /* seed order is the rite */
        }
        const origin = new URL(request.url).origin;
        const headers = {
          "content-type": "application/rss+xml; charset=utf-8",
          "cache-control": "public, max-age=300",
          "access-control-allow-origin": "*",
        };
        let facts: Record<string, RoseFeedFact> = {};
        try {
          facts = await loadRoseFeedFacts(roseFeedCandidates(catalog));
        } catch {
          /* art still ships if a probe fails */
        }
        return new Response(roseFeedXml(catalog, origin, facts), { headers });
      },
    },
  },
});
