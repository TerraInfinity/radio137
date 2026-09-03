import { createMiddleware } from "@tanstack/react-start";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const radioSessionMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { resolveRadioUser } = await import("@/lib/sso.server");
    const user = await resolveRadioUser(context.bearerToken);
    return next({ context: { user } });
  });

export const listStationChat = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { listChat } = await import("@/lib/social.server");
    return listChat(data.slug);
  });

export const postStationChat = createServerFn({ method: "POST" })
  .middleware([radioSessionMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        slug: z.string().min(1).max(80),
        author: z.string().min(1).max(24),
        body: z.string().min(1).max(280),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const author = (context.user?.name || context.user?.email || data.author).trim().slice(0, 24);
    const body = data.body.trim().slice(0, 280);
    if (!author || !body) throw new Error("Need a handle and a line.");
    const { insertChat, listChat } = await import("@/lib/social.server");
    await insertChat(data.slug, author, body, context.user?.id ?? null);
    return listChat(data.slug);
  });

export const bumpTrackView = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ trackId: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { bumpView } = await import("@/lib/social.server");
    return bumpView(data.trackId);
  });

export const bumpTrackLike = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ trackId: z.string().min(1), liked: z.boolean() }).parse(input))
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const { bumpLike } = await import("@/lib/social.server");
    return bumpLike(data.trackId, data.liked);
  });

export const toggleFavoriteTrack = createServerFn({ method: "POST" })
  .middleware([radioSessionMiddleware])
  .validator((input: unknown) => z.object({ trackId: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    if (!context.user) return { favorites: [] as string[], persisted: false };
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const { toggleFavorite } = await import("@/lib/social.server");
    const favorites = await toggleFavorite(context.user.id, data.trackId);
    return { favorites, persisted: true };
  });

export const listMyFavorites = createServerFn({ method: "GET" })
  .middleware([radioSessionMiddleware])
  .handler(async ({ context }) => {
    if (!context.user) return [] as string[];
    const { listFavorites } = await import("@/lib/social.server");
    return listFavorites(context.user.id);
  });
