import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/lib/sso.server";
import { defaultPrefixForSlug, putR2Object, r2Configured, sanitizeUploadName } from "@/lib/r2.server";
import { addTrack, listEdits, listStationEdits, patchTrack } from "@/lib/catalog-edits.server";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";

const MAX_BYTES = 80 * 1024 * 1024;

export const Route = createFileRoute("/api/desk/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          assertSameSiteRequest();
          const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || undefined;
          const user = await requireAdmin(bearer);
          if (!r2Configured()) {
            return Response.json({ error: "R2 keys are not set" }, { status: 400 });
          }
          const form = await request.formData();
          const slug = String(form.get("slug") || "").trim();
          const replaceId = String(form.get("trackId") || "").trim();
          const file = form.get("file");
          if (!slug || !(file instanceof File)) {
            return Response.json({ error: "Need a station slug and a file" }, { status: 400 });
          }
          if (file.size > MAX_BYTES) {
            return Response.json({ error: "File is larger than 80 MB" }, { status: 400 });
          }
          const name = sanitizeUploadName(file.name);
          if (!/\.(mp3|wav|flac|m4a|ogg|aac)$/i.test(name)) {
            return Response.json({ error: "Audio only (mp3, wav, flac, m4a, ogg, aac)" }, { status: 400 });
          }
          const key = `${defaultPrefixForSlug(slug)}${replaceId ? `${replaceId}-` : ""}${name}`;
          const bytes = new Uint8Array(await file.arrayBuffer());
          const object = await putR2Object(key, bytes, file.type || "audio/mpeg");
          const title = String(form.get("title") || "").trim() || name.replace(/\.[^.]+$/, "");
          const coverUrl = String(form.get("coverUrl") || "").trim() || undefined;
          const edit = replaceId
            ? await patchTrack(user, {
                channelSlug: slug,
                trackId: replaceId,
                audioUrl: object.url,
                coverUrl,
              })
            : await addTrack(user, {
                channelSlug: slug,
                title,
                audioUrl: object.url,
                coverUrl,
                r2Key: object.key,
              });
          const tracks = await listEdits();
          const stations = await listStationEdits();
          return Response.json({ ok: true, object, edit, tracks, stations });
        } catch (error) {
          const status = typeof error === "object" && error && "status" in error ? Number((error as { status: number }).status) : 500;
          return Response.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: status || 500 });
        }
      },
    },
  },
});
