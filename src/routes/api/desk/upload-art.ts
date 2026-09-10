import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/lib/sso.server";
import { MEDIA_MAX_IMAGE, MEDIA_MAX_VIDEO } from "@/lib/media";
import { putR2Object, r2Configured, sanitizeUploadName } from "@/lib/r2.server";
import { listEdits, listStationEdits, patchTrack, upsertStation } from "@/lib/catalog-edits.server";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";

const IMAGE = /\.(jpe?g|png|webp|gif|avif|heic|heif)$/i;
const VIDEO = /\.(mp4|webm|mov|m4v)$/i;

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/heic": "heic",
  "image/heif": "heic",
  "image/heic-sequence": "heic",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-m4v": "m4v",
};

function artMeta(file: File): { name: string; video: boolean; image: boolean; type: string } {
  const type = (file.type || "").toLowerCase();
  let name = sanitizeUploadName(file.name);
  if (name === "track.mp3" || !/\.[A-Za-z0-9]+$/.test(name)) {
    const ext = MIME_EXT[type];
    name = ext ? `art.${ext}` : name;
  }
  const video = VIDEO.test(name) || type.startsWith("video/");
  const image = IMAGE.test(name) || type.startsWith("image/");
  const fallback = video ? "video/mp4" : image ? "image/jpeg" : type;
  return { name, video, image, type: type || fallback };
}

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
          const meta = artMeta(file);
          if (/\.(heic|heif)$/i.test(meta.name) || meta.type.includes("heic") || meta.type.includes("heif")) {
            return Response.json({ error: "Use Photo — iPhone HEIC is converted on the phone before upload" }, { status: 400 });
          }
          if (!meta.video && !meta.image) {
            return Response.json({ error: "Art only (photo or a short mp4 / mov)" }, { status: 400 });
          }
          if (meta.video && file.size > MEDIA_MAX_VIDEO) {
            return Response.json({ error: `Keep looping videos under ${Math.round(MEDIA_MAX_VIDEO / (1024 * 1024))} MB` }, { status: 400 });
          }
          if (meta.image && file.size > MEDIA_MAX_IMAGE) {
            return Response.json({ error: "Keep stills under 2 MB — the phone picker shrinks them first" }, { status: 400 });
          }
          const folder = trackId ? `radio/art/${slug}/${trackId}` : `radio/art/${slug}`;
          const key = `${folder}/${Date.now()}-${meta.name}`;
          const bytes = new Uint8Array(await file.arrayBuffer());
          const object = await putR2Object(key, bytes, meta.type);
          if (trackId) {
            await patchTrack(user, { channelSlug: slug, trackId, coverUrl: object.url });
          } else {
            await upsertStation(user, { slug, cover: object.url });
          }
          const tracks = await listEdits();
          const stations = await listStationEdits();
          return Response.json({ ok: true, object, kind: meta.video ? "video" : "image", tracks, stations });
        } catch (error) {
          const status = typeof error === "object" && error && "status" in error ? Number((error as { status: number }).status) : 500;
          return Response.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: status || 500 });
        }
      },
    },
  },
});
