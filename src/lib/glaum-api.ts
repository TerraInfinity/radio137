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

export const listGlaumWords = createServerFn({ method: "GET" }).handler(async () => {
  const { listGlaumLexicon } = await import("@/lib/glaum-words.server");
  return listGlaumLexicon();
});

export const addGuestGlaumWordFn = createServerFn({ method: "POST" })
  .middleware([radioSessionMiddleware])
  .validator((input: unknown) => z.object({ word: z.string().min(1).max(48) }).parse(input))
  .handler(async ({ context, data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    if (!context.user) throw new Error("Sign in to add a lantern word.");
    const { addGuestGlaumWord, listGlaumLexicon } = await import("@/lib/glaum-words.server");
    await addGuestGlaumWord(context.user, data.word);
    return listGlaumLexicon();
  });

export const addAdminGlaumWordFn = createServerFn({ method: "POST" })
  .middleware([radioSessionMiddleware])
  .validator((input: unknown) => z.object({ word: z.string().min(1).max(64) }).parse(input))
  .handler(async ({ context, data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    if (!context.user?.isAdmin) throw new Error("C only.");
    const { addAdminGlaumWord, listGlaumLexicon } = await import("@/lib/glaum-words.server");
    await addAdminGlaumWord(context.user, data.word);
    return listGlaumLexicon();
  });

export const hideGlaumWordFn = createServerFn({ method: "POST" })
  .middleware([radioSessionMiddleware])
  .validator((input: unknown) => z.object({ id: z.number().int().positive().optional(), word: z.string().optional() }).parse(input))
  .handler(async ({ context, data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    if (!context.user?.isAdmin) throw new Error("C only.");
    const { hideGlaumWord, hideGlaumDefault, listGlaumLexicon } = await import("@/lib/glaum-words.server");
    if (data.id) await hideGlaumWord(data.id);
    else if (data.word) await hideGlaumDefault(data.word);
    else throw new Error("Need a word to remove");
    return listGlaumLexicon();
  });
