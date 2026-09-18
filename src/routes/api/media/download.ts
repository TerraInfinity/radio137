import { createFileRoute } from "@tanstack/react-router";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { listEdits, listStationEdits } from "@/lib/catalog-edits.server";
import { getSeedCatalog, isAdultTrack, isChannelNsfw } from "@/lib/catalog";
import { mediaUrl } from "@/lib/media";
import { resolveRadioUser } from "@/lib/sso.server";

export const Route = createFileRoute("/api/media/download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const id = new URL(request.url).searchParams.get("id")?.trim() || "";
        if (!id) return Response.json({ error: "Missing song" }, { status: 400 });
        let catalog = getSeedCatalog();
        try {
          catalog = applyCatalogEdits(getSeedCatalog(), await listEdits(), await listStationEdits());
        } catch {
          /* seed is enough */
        }
        let hit: { track: (typeof catalog.channels)[0]["tracks"][0]; channel: (typeof catalog.channels)[0] } | null = null;
        for (const channel of catalog.channels) {
          const track = channel.tracks.find((item) => item.id === id && item.enabled !== false);
          if (track?.audioUrl) {
            hit = { track, channel };
            break;
          }
        }
        if (!hit) return Response.json({ error: "Song not found" }, { status: 404 });
        const locked = isAdultTrack(hit.track) && !isChannelNsfw(hit.channel);
        if (locked) {
          const user = await resolveRadioUser();
          if (!user) return Response.json({ error: "Sign in to download this song" }, { status: 401 });
        }
        const src = mediaUrl(hit.track.audioUrl);
        if (!src) return Response.json({ error: "No file" }, { status: 404 });
        return Response.redirect(src, 302);
      },
    },
  },
});
