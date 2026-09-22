import { createMiddleware } from "@tanstack/react-start";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const radioSessionMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { resolveRadioUser, r2Configured, envLamps } = await import("@/lib/sso.server");
    const user = await resolveRadioUser(context.bearerToken);
    return next({ context: { user, r2Configured: r2Configured(), lamps: envLamps() } });
  });

const adminMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    const { requireAdmin, r2Configured, envLamps } = await import("@/lib/sso.server");
    assertSameSiteRequest();
    const user = await requireAdmin(context.bearerToken);
    return next({ context: { user, r2Configured: r2Configured(), lamps: envLamps() } });
  });

export const getRadioSession = createServerFn({ method: "GET" })
  .middleware([radioSessionMiddleware])
  .handler(async ({ context }) => ({
    user: context.user,
    r2Configured: context.r2Configured,
    lamps: context.user?.isAdmin ? context.lamps : [],
  }));

export const listCatalogEdits = createServerFn({ method: "GET" }).handler(async () => {
  const now = Date.now();
  if (catalogEditCache && now - catalogEditCache.at < 20_000) return catalogEditCache.payload;
  const { listEdits, listStationEdits } = await import("@/lib/catalog-edits.server");
  const payload = { tracks: await listEdits(), stations: await listStationEdits() };
  catalogEditCache = { at: now, payload };
  return payload;
});

const trackRef = z.object({
  channelSlug: z.string().min(1),
  trackId: z.string().min(1),
  audioUrl: z.string().optional(),
});

type CatalogSnapshot = Awaited<ReturnType<typeof snapshot>>;
let catalogEditCache: { at: number; payload: CatalogSnapshot } | null = null;

async function snapshot() {
  catalogEditCache = null;
  const { listEdits, listStationEdits } = await import("@/lib/catalog-edits.server");
  return { tracks: await listEdits(), stations: await listStationEdits() };
}

export const hideStationTrack = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => trackRef.parse(input))
  .handler(async ({ context, data }) => {
    const { hideTrack } = await import("@/lib/catalog-edits.server");
    const edit = await hideTrack(context.user, data.channelSlug, data.trackId, data.audioUrl);
    return { edit, ...(await snapshot()) };
  });

export const unallocateStationTrack = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) =>
    trackRef
      .extend({
        title: z.string().optional(),
        artist: z.string().optional(),
        coverUrl: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { unallocateTrack } = await import("@/lib/review.server");
    const edit = await unallocateTrack(context.user, data);
    return { edit, ...(await snapshot()) };
  });

export const listReviewQueue = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { listReviewQueue: list, countOpenReview } = await import("@/lib/review.server");
    return { items: await list("open"), open: await countOpenReview() };
  });

export const restoreReviewItemFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => z.object({ id: z.number().int().positive() }).parse(input))
  .handler(async ({ context, data }) => {
    const { restoreReviewItem } = await import("@/lib/review.server");
    await restoreReviewItem(context.user, data.id);
    return snapshot();
  });

export const dismissReviewItemFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => z.object({ id: z.number().int().positive(), status: z.enum(["dismissed", "merged", "rehomed"]).optional() }).parse(input))
  .handler(async ({ data }) => {
    const { setReviewStatus } = await import("@/lib/review.server");
    await setReviewStatus(data.id, data.status ?? "dismissed");
    return { ok: true as const };
  });

export const rehomeReviewItemFn = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) =>
    z.object({ id: z.number().int().positive(), toSlug: z.string().min(1), mode: z.enum(["copy", "move"]).optional() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { getReviewItem, setReviewStatus } = await import("@/lib/review.server");
    const item = await getReviewItem(data.id);
    if (!item) throw new Error("Review item missing");
    if (!item.audioUrl) throw new Error("No audio URL on this review item");
    const { getSeedCatalog } = await import("@/lib/catalog");
    const { applyCatalogEdits } = await import("@/lib/catalog-edits");
    const { listEdits, listStationEdits, addTrack } = await import("@/lib/catalog-edits.server");
    const catalog = applyCatalogEdits(getSeedCatalog(), await listEdits(), await listStationEdits());
    const dest = catalog.channels.find((channel) => channel.slug === data.toSlug);
    if (!dest) throw new Error("Station not found");
    const already = dest.tracks.some((track) => track.enabled !== false && track.audioUrl === item.audioUrl);
    if (!already) {
      await addTrack(context.user, {
        channelSlug: data.toSlug,
        trackId: item.trackId,
        title: item.title || "Untitled",
        artist: item.artist || undefined,
        audioUrl: item.audioUrl,
        coverUrl: item.coverUrl || undefined,
        r2Key: item.r2Key || undefined,
      });
    }
    await setReviewStatus(data.id, "rehomed");
    return snapshot();
  });

export const restoreStationTrack = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => trackRef.parse(input))
  .handler(async ({ context, data }) => {
    const { restoreTrack } = await import("@/lib/catalog-edits.server");
    const edit = await restoreTrack(context.user, data.channelSlug, data.trackId);
    return { edit, ...(await snapshot()) };
  });

export const addStationTrack = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        channelSlug: z.string().min(1),
        title: z.string().min(1),
        artist: z.string().optional(),
        durationSec: z.number().optional(),
        audioUrl: z.string().min(8),
        coverUrl: z.string().optional(),
        r2Key: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { addTrack } = await import("@/lib/catalog-edits.server");
    const edit = await addTrack(context.user, data);
    return { edit, ...(await snapshot()) };
  });

export const patchStationTrack = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        channelSlug: z.string().min(1),
        trackId: z.string().min(1),
        title: z.string().optional(),
        artist: z.string().optional(),
        audioUrl: z.string().optional(),
        coverUrl: z.string().optional(),
        durationSec: z.number().optional(),
        tags: z.string().optional(),
        slug: z.string().optional(),
        aliases: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { patchTrack } = await import("@/lib/catalog-edits.server");
    const edit = await patchTrack(context.user, data);
    return { edit, ...(await snapshot()) };
  });

export const renameStationFile = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) =>
    z.object({ channelSlug: z.string().min(1), trackId: z.string().min(1), toKey: z.string().min(1) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { renameTrackFile } = await import("@/lib/catalog-edits.server");
    const object = await renameTrackFile(context.user, data);
    return { object, ...(await snapshot()) };
  });

export const reorderStationTracks = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) =>
    z.object({ channelSlug: z.string().min(1), trackIds: z.array(z.string().min(1)).min(1) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { reorderTracks } = await import("@/lib/catalog-edits.server");
    await reorderTracks(context.user, data.channelSlug, data.trackIds);
    return snapshot();
  });

export const placeStationTrack = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        fromSlug: z.string().min(1),
        trackId: z.string().min(1),
        toSlug: z.string().min(1),
        mode: z.enum(["copy", "move"]),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { placeTrack } = await import("@/lib/catalog-edits.server");
    await placeTrack(context.user, data);
    return snapshot();
  });

export const setFeaturedRail = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => z.object({ slugs: z.array(z.string()) }).parse(input))
  .handler(async ({ context, data }) => {
    const { setFeaturedOrder } = await import("@/lib/catalog-edits.server");
    await setFeaturedOrder(context.user, data.slugs);
    return snapshot();
  });

export const deleteStationFile = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        channelSlug: z.string().min(1),
        trackId: z.string().min(1),
        audioUrl: z.string().min(1),
        r2Key: z.string().optional(),
        alsoDeleteR2: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { r2KeyFromAudioUrl } = await import("@/lib/file-path");
    const key = data.r2Key || r2KeyFromAudioUrl(data.audioUrl);
    if (data.alsoDeleteR2) {
      if (!key) throw new Error("No R2 key for this file");
      const { deleteR2Key } = await import("@/lib/r2.server");
      await deleteR2Key(key);
    }
    const { markDeletedR2, hideTrack } = await import("@/lib/catalog-edits.server");
    const edit =
      data.alsoDeleteR2 && key
        ? await markDeletedR2(context.user, data.channelSlug, data.trackId, data.audioUrl, key)
        : await hideTrack(context.user, data.channelSlug, data.trackId, data.audioUrl);
    return { edit, ...(await snapshot()), deletedR2: Boolean(data.alsoDeleteR2 && key) };
  });

export const saveStation = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        slug: z.string().min(1),
        added: z.boolean().optional(),
        hidden: z.boolean().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        energy: z.string().optional(),
        category: z.string().optional(),
        cover: z.string().optional(),
        animationUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        kind: z.enum(["live", "ondemand", "fixed"]).optional(),
        featured: z.boolean().optional(),
        featuredRank: z.number().optional(),
        enabled: z.boolean().optional(),
        nsfw: z.boolean().optional(),
        tags: z.string().optional(),
        shuffle: z.enum(["off", "optional", "on"]).optional(),
        claimable: z.boolean().optional(),
        publicSlug: z.string().optional(),
        aliases: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { upsertStation } = await import("@/lib/catalog-edits.server");
    const station = await upsertStation(context.user, { ...data, mode: data.kind });
    return { station, ...(await snapshot()) };
  });

export const listStationR2 = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .validator((input: unknown) =>
    z.object({ prefix: z.string().optional(), slug: z.string().optional(), maxKeys: z.number().int().positive().optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { listR2Prefix, defaultPrefixForSlug, r2PublicBase, r2Configured } = await import("@/lib/r2.server");
    if (!r2Configured()) {
      return { ok: false as const, prefix: data.prefix || "", base: "", objects: [], error: "R2 keys are not set" };
    }
    try {
      const prefix = data.prefix || (data.slug ? defaultPrefixForSlug(data.slug) : "radio/");
      const objects = await listR2Prefix(prefix, data.maxKeys ?? 2500);
      return { ok: true as const, prefix, base: r2PublicBase(), objects };
    } catch (error) {
      return {
        ok: false as const,
        prefix: data.prefix || "radio/",
        base: "",
        objects: [],
        error: error instanceof Error ? error.message : "R2 list failed",
      };
    }
  });

export const importR2Tracks = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        channelSlugs: z.array(z.string().min(1)).min(1),
        items: z
          .array(
            z.object({
              key: z.string().min(1),
              url: z.string().min(8),
              title: z.string().optional(),
              durationSec: z.number().optional(),
            }),
          )
          .min(1),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { addTrack } = await import("@/lib/catalog-edits.server");
    const { getSeedCatalog } = await import("@/lib/catalog");
    const { applyCatalogEdits } = await import("@/lib/catalog-edits");
    const { listEdits, listStationEdits } = await import("@/lib/catalog-edits.server");
    const { titleFromR2Key } = await import("@/lib/file-path");
    const catalog = applyCatalogEdits(getSeedCatalog(), await listEdits(), await listStationEdits());
    let added = 0;
    let skipped = 0;
    for (const slug of data.channelSlugs) {
      const dest = catalog.channels.find((channel) => channel.slug === slug);
      if (!dest) throw new Error(`Station not found: ${slug}`);
      for (const item of data.items) {
        try {
          await addTrack(context.user, {
            channelSlug: slug,
            title: (item.title || titleFromR2Key(item.key)).slice(0, 180),
            audioUrl: item.url,
            coverUrl: dest.cover,
            r2Key: item.key,
            durationSec: item.durationSec,
          });
          added += 1;
        } catch (error) {
          const message = error instanceof Error ? error.message : "";
          if (/already on/i.test(message)) {
            skipped += 1;
            continue;
          }
          throw error;
        }
      }
    }
    return { added, skipped, ...(await snapshot()) };
  });

export const moveR2Object = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => z.object({ from: z.string().min(1), to: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { moveR2Key } = await import("@/lib/r2.server");
    const object = await moveR2Key(data.from, data.to);
    return { ok: true as const, object };
  });

export const deleteR2Object = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => z.object({ key: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { deleteR2Key } = await import("@/lib/r2.server");
    await deleteR2Key(data.key);
    return { ok: true as const };
  });

export const listCutGroups = createServerFn({ method: "GET" }).handler(async () => {
  const { listCutGroups: list } = await import("@/lib/cuts.server");
  return { groups: await list() };
});

export const mergeStationCuts = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) =>
    z.object({ canonicalId: z.string().min(1), memberIds: z.array(z.string().min(1)).min(1) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { mergeCuts } = await import("@/lib/cuts.server");
    const groups = await mergeCuts(context.user, data.canonicalId, data.memberIds);
    return { groups, ...(await snapshot()) };
  });

export const mergeStationCutClusters = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        clusters: z.array(z.object({ canonicalId: z.string().min(1), memberIds: z.array(z.string().min(1)).min(1) })).min(1),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { mergeCutClusters } = await import("@/lib/cuts.server");
    const groups = await mergeCutClusters(context.user, data.clusters);
    return { groups, ...(await snapshot()) };
  });

export const unmergeStationCut = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => z.object({ memberId: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    const { unmergeCut } = await import("@/lib/cuts.server");
    const groups = await unmergeCut(context.user, data.memberId);
    return { groups };
  });

export const dissolveStationCut = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => z.object({ canonicalId: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { dissolveCut } = await import("@/lib/cuts.server");
    const groups = await dissolveCut(data.canonicalId);
    return { groups };
  });

export const listCutSkips = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { listCutSkips: list } = await import("@/lib/cuts.server");
    return { keys: await list() };
  });

export const skipSimilarCuts = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => z.object({ memberIds: z.array(z.string().min(1)).min(2) }).parse(input))
  .handler(async ({ context, data }) => {
    const { skipCutPairs } = await import("@/lib/cuts.server");
    const keys = await skipCutPairs(context.user, data.memberIds);
    return { keys };
  });

export const pingServices = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { hubOrigin } = await import("@/lib/sso.server");
    const origin = hubOrigin();
    let hubStatus = 0;
    let hubOk = false;
    let hubNote = "";
    try {
      const res = await fetch(origin, { method: "GET", redirect: "manual" });
      hubStatus = res.status;
      hubOk = res.status > 0 && res.status < 500;
      hubNote = res.status === 0 ? "no response" : `HTTP ${res.status}`;
    } catch (error) {
      hubOk = false;
      hubNote = error instanceof Error ? error.message : "hub unreachable";
    }
    const { r2Configured, listR2Prefix } = await import("@/lib/r2.server");
    let r2Ok = false;
    let r2Note = "keys missing";
    let r2Sample = 0;
    if (r2Configured()) {
      try {
        const objects = await listR2Prefix("radio/", 8);
        r2Ok = true;
        r2Sample = objects.length;
        r2Note = `${objects.length} object${objects.length === 1 ? "" : "s"} under radio/`;
      } catch (error) {
        r2Note = error instanceof Error ? error.message : "R2 list failed";
      }
    }
    return {
      hub: { origin, status: hubStatus, ok: hubOk, note: hubNote },
      r2: { ok: r2Ok, note: r2Note, sample: r2Sample },
    };
  });

const AUDIO_NAME = /\.(mp3|wav|flac|m4a|ogg|aac)$/i;
const ART_NAME = /\.(jpe?g|png|webp|gif|avif|mp4|webm|mov|m4v)$/i;
const AUDIO_MAX = 80 * 1024 * 1024;

export const mintDeskUpload = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        kind: z.enum(["audio", "art"]),
        slug: z.string().min(1),
        filename: z.string().min(1),
        contentType: z.string().optional(),
        size: z.number().int().nonnegative().optional(),
        trackId: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { defaultPrefixForSlug, presignR2Put, r2Configured, sanitizeUploadName } = await import("@/lib/r2.server");
    const { MEDIA_MAX_IMAGE, MEDIA_MAX_VIDEO } = await import("@/lib/media");
    if (!r2Configured()) throw new Error("R2 keys are not set");
    const name = sanitizeUploadName(data.filename);
    const type = (data.contentType || "").toLowerCase();
    const size = data.size ?? 0;
    if (data.kind === "audio") {
      if (!AUDIO_NAME.test(name)) throw new Error("Audio only (mp3, wav, flac, m4a, ogg, aac)");
      if (size > AUDIO_MAX) throw new Error("File is larger than 80 MB");
    } else {
      if (!ART_NAME.test(name) && !type.startsWith("image/") && !type.startsWith("video/")) {
        throw new Error("Art only (photo or a short mp4 / webm / mov)");
      }
      const video = /\.(mp4|webm|mov|m4v)$/i.test(name) || type.startsWith("video/");
      if (video && size > MEDIA_MAX_VIDEO) throw new Error(`Keep looping videos under ${Math.round(MEDIA_MAX_VIDEO / (1024 * 1024))} MB`);
      if (!video && size > MEDIA_MAX_IMAGE) throw new Error("Keep stills under 2 MB — the picker shrinks them first");
    }
    const folder =
      data.kind === "audio"
        ? `${defaultPrefixForSlug(data.slug)}${data.trackId ? `${data.trackId}-` : ""}`
        : data.trackId
          ? `radio/art/${data.slug}/${data.trackId}`
          : `radio/art/${data.slug}`;
    const key = `${folder}${data.kind === "audio" ? name : `/${Date.now()}-${name}`}`.replace(/\/+/g, "/");
    const contentType = type || (data.kind === "audio" ? "audio/mpeg" : "application/octet-stream");
    const signed = await presignR2Put(key, contentType);
    return { putUrl: signed.putUrl, key: signed.key, publicUrl: signed.url, contentType };
  });

export const completeDeskUpload = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        kind: z.enum(["audio", "art"]),
        slug: z.string().min(1),
        key: z.string().min(1),
        title: z.string().optional(),
        coverUrl: z.string().optional(),
        trackId: z.string().optional(),
        contentType: z.string().optional(),
        durationSec: z.number().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { publicUrlForKey } = await import("@/lib/r2.server");
    const { addTrack, patchTrack, upsertStation } = await import("@/lib/catalog-edits.server");
    const key = data.key.replace(/^\/+/, "");
    const audioPrefix = `radio/${data.slug}/`;
    const artPrefix = `radio/art/${data.slug}/`;
    if (data.kind === "audio" && !key.startsWith(audioPrefix)) throw new Error("Key does not belong to this station");
    if (data.kind === "art" && !key.startsWith(artPrefix)) throw new Error("Key does not belong to this station");
    const url = publicUrlForKey(key);
    const video = /\.(mp4|webm|mov|m4v)$/i.test(key) || (data.contentType || "").startsWith("video/");
    if (data.kind === "audio") {
      const title = (data.title || "").trim() || key.split("/").pop()?.replace(/\.[^.]+$/, "") || "Untitled";
      const edit = data.trackId
        ? await patchTrack(context.user, {
            channelSlug: data.slug,
            trackId: data.trackId,
            audioUrl: url,
            coverUrl: data.coverUrl,
            durationSec: data.durationSec,
          })
        : await addTrack(context.user, {
            channelSlug: data.slug,
            title,
            audioUrl: url,
            coverUrl: data.coverUrl,
            r2Key: key,
            durationSec: data.durationSec,
          });
      return { ok: true as const, object: { key, url }, kind: "audio" as const, edit, ...(await snapshot()) };
    }
    if (data.trackId) {
      await patchTrack(context.user, { channelSlug: data.slug, trackId: data.trackId, coverUrl: url });
    } else if (video) {
      await upsertStation(context.user, { slug: data.slug, animationUrl: url, videoUrl: url });
    } else {
      await upsertStation(context.user, { slug: data.slug, cover: url });
    }
    return { ok: true as const, object: { key, url }, kind: video ? ("video" as const) : ("image" as const), ...(await snapshot()) };
  });
