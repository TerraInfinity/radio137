import { createMiddleware } from "@tanstack/react-start";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const radioSessionMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { resolveRadioUser, r2Configured } = await import("@/lib/sso.server");
    const user = await resolveRadioUser(context.bearerToken);
    return next({ context: { user, r2Configured: r2Configured() } });
  });

const adminMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    const { requireAdmin, r2Configured } = await import("@/lib/sso.server");
    assertSameSiteRequest();
    const user = await requireAdmin(context.bearerToken);
    return next({ context: { user, r2Configured: r2Configured() } });
  });

export const getRadioSession = createServerFn({ method: "GET" })
  .middleware([radioSessionMiddleware])
  .handler(async ({ context }) => ({
    user: context.user,
    r2Configured: context.r2Configured,
  }));

export const listCatalogEdits = createServerFn({ method: "GET" }).handler(async () => {
  const { listEdits } = await import("@/lib/catalog-edits.server");
  return listEdits();
});

const trackRef = z.object({
  channelSlug: z.string().min(1),
  trackId: z.string().min(1),
  audioUrl: z.string().optional(),
});

export const hideStationTrack = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => trackRef.parse(input))
  .handler(async ({ context, data }) => {
    const { hideTrack } = await import("@/lib/catalog-edits.server");
    const edit = await hideTrack(context.user, data.channelSlug, data.trackId, data.audioUrl);
    const { listEdits } = await import("@/lib/catalog-edits.server");
    return { edit, edits: await listEdits() };
  });

export const restoreStationTrack = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => trackRef.parse(input))
  .handler(async ({ context, data }) => {
    const { restoreTrack } = await import("@/lib/catalog-edits.server");
    const edit = await restoreTrack(context.user, data.channelSlug, data.trackId);
    const { listEdits } = await import("@/lib/catalog-edits.server");
    return { edit, edits: await listEdits() };
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
    const { listEdits } = await import("@/lib/catalog-edits.server");
    return { edit, edits: await listEdits() };
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
    const edit = data.alsoDeleteR2 && key
      ? await markDeletedR2(context.user, data.channelSlug, data.trackId, data.audioUrl, key)
      : await hideTrack(context.user, data.channelSlug, data.trackId, data.audioUrl);
    const { listEdits } = await import("@/lib/catalog-edits.server");
    return { edit, edits: await listEdits(), deletedR2: Boolean(data.alsoDeleteR2 && key) };
  });

export const listStationR2 = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { listR2Prefix, defaultPrefixForSlug, r2PublicBase } = await import("@/lib/r2.server");
    try {
      const prefix = defaultPrefixForSlug(data.slug);
      const objects = await listR2Prefix(prefix);
      return { ok: true as const, prefix, base: r2PublicBase(), objects };
    } catch (error) {
      return {
        ok: false as const,
        prefix: `radio/${data.slug}/`,
        base: "",
        objects: [],
        error: error instanceof Error ? error.message : "R2 list failed",
      };
    }
  });
