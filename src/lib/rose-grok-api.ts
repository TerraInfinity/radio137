import { createMiddleware } from "@tanstack/react-start";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { lookSnapshot, parseGrokLookResponse, roseGrokSystemPrompt } from "@/lib/rose-grok";
import { normalizeLook, type RoseLook } from "@/lib/rose-look";

const adminMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    const { requireAdmin } = await import("@/lib/sso.server");
    assertSameSiteRequest();
    const user = await requireAdmin(context.bearerToken);
    return next({ context: { user } });
  });

const lookShape = z.object({
  bpm: z.number(),
  fly: z.number(),
  intensity: z.number(),
  stills: z.number(),
  loop: z.number(),
  stars: z.number(),
  glyphs: z.number(),
  rings: z.number(),
  petals: z.boolean(),
  bolts: z.boolean(),
  box: z.boolean(),
  phenomenon: z.string(),
  captions: z.array(z.string()),
  stillUrls: z.array(z.string()),
  loopUrl: z.string(),
});

const inputShape = z.object({
  prompt: z.string().trim().min(1).max(1200),
  stationSlug: z.string().min(1).max(80),
  trackId: z.string().max(120).optional(),
  trackTitle: z.string().max(200).optional(),
  artist: z.string().max(160).optional(),
  look: lookShape,
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(1600),
      }),
    )
    .max(10)
    .optional(),
});

export const directRoseLook = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => inputShape.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Grok is not available in this environment." };
    const current = normalizeLook(data.look as RoseLook);
    const history = (data.history ?? []).slice(-8).map((item) => ({
      role: item.role,
      content: item.content.slice(0, 1200),
    }));
    const userBlock = [
      `Station: ${data.stationSlug}`,
      data.trackTitle ? `Now playing: ${data.trackTitle}${data.artist ? ` — ${data.artist}` : ""}` : "No song playing yet — direct the station look.",
      data.trackId ? `Track id: ${data.trackId}` : "",
      `Current look: ${JSON.stringify(lookSnapshot(current))}`,
      `Admin: ${data.prompt.trim()}`,
    ]
      .filter(Boolean)
      .join("\n");
    const payload = {
      model: "grok-4.5",
      temperature: 0.45,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: roseGrokSystemPrompt() },
        ...history,
        { role: "user", content: userBlock },
      ],
    };
    let res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    if (res.status === 400) {
      const retry = { ...payload } as Record<string, unknown>;
      delete retry.response_format;
      res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(retry),
      });
    }
    if (!res.ok) {
      return { ok: false as const, error: `Grok could not direct this cut (${res.status}).` };
    }
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content ?? "";
    const turn = parseGrokLookResponse(text, current);
    return {
      ok: true as const,
      reply: turn.reply,
      look: turn.look,
      changed: turn.changed,
      pin: turn.pin,
    };
  });
