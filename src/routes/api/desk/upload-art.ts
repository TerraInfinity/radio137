import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/lib/sso.server";
import { MEDIA_MAX_IMAGE, MEDIA_MAX_VIDEO } from "@/lib/media";
import { putR2Object, r2Configured, sanitizeUploadName } from "@/lib/r2.server";
import { listEdits, listStationEdits, patchTrack, upsertStation } from "@/lib/catalog-edits.server";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";

const IMAGE = /\.(jpe?g|png|webp|gif|avif)$/i;
const VIDEO = /\.(mp4|webm|mov)$/i;

export const Route = createFileRoute("/api/desk/upload-art")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          assertSameSiteRequest();
          const user = await requireAdmin();
          if (!r2Configured()) {
            return Response.json({ error: "R2 keys are not set" }, { status: 400 });
          }
          const form = await request.formData();
          const slug = String(form.get("slug") || "").trim();
          const trackId = String(form.get("trackId") || "").trim();
          const file = form.get("file");
          if (!slug || !(file instanceof File)) {
            return Response.json({ error: "Need a station slug and a file" }, { status: 400 });
          }
          const name = sanitizeUploadName(file.name);
          const video = VIDEO.test(name);
          const image = IMAGE.test(name);
          if (!video && !image) {
            return Response.json({ error: "Art only (jpg, png, webp, gif, or a short mp4 / webm)" }, { status: 400 });
          }
          if (video && file.size > MEDIA_MAX_VIDEO) {
            return Response.json({ error: "Keep looping videos under 10 MB on the free plan" }, { status: 400 });
          }
          if (image && file.size > MEDIA_MAX_IMAGE) {
            return Response.json({ error: "Keep stills under 2 MB" }, { status: 400 });
          }
          const folder = trackId ? `radio/art/${slug}/${trackId}` : `radio/art/${slug}`;
          const key = `${folder}/${Date.now()}-${name}`;
          const bytes = new Uint8Array(await file.arrayBuffer());
          const type = file.type || (video ? "video/mp4" : "image/jpeg");
          const object = await putR2Object(key, bytes, type);
          if (trackId) {
            await patchTrack(user, { channelSlug: slug, trackId, coverUrl: object.url });
          } else {
            await upsertStation(user, { slug, cover: object.url });
          }
          const tracks = await listEdits();
          const stations = await listStationEdits();
          return Response.json({ ok: true, object, kind: video ? "video" : "image", tracks, stations });
        } catch (error) {
          const status = typeof error === "object" && error && "status" in error ? Number((error as { status: number }).status) : 500;
          return Response.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: status || 500 });
        }
      },
    },
  },
});
