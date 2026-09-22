import assert from "node:assert/strict";
import test from "node:test";
import { ROSE_LOOK_DEFAULT, normalizeLook } from "./rose-look.ts";
import { mergeLookPatch, parseGrokLookResponse, threadStorageKey } from "./rose-grok.ts";

const base = normalizeLook({
  ...ROSE_LOOK_DEFAULT,
  fly: 1,
  petals: true,
  box: true,
  phenomenon: "vortex",
  stillUrls: ["/experiences/rose/hero.jpg"],
  loopUrl: "/experiences/rose/tardis-loop.mp4",
  captions: ["Pretty eyes"],
});

test("parseGrokLookResponse merges a look patch and keeps art urls", () => {
  const turn = parseGrokLookResponse(
    JSON.stringify({
      reply: "Quieter snow.",
      look: { phenomenon: "petals", fly: 0.4, box: false, captions: ["White rose"] },
      pin: true,
    }),
    base,
  );
  assert.equal(turn.reply, "Quieter snow.");
  assert.equal(turn.pin, true);
  assert.equal(turn.changed, true);
  assert.equal(turn.look.phenomenon, "petals");
  assert.equal(turn.look.fly, 0.4);
  assert.equal(turn.look.box, false);
  assert.equal(turn.look.loopUrl, base.loopUrl);
  assert.deepEqual(turn.look.stillUrls, base.stillUrls);
  assert.deepEqual(turn.look.captions, ["White rose"]);
});

test("parseGrokLookResponse reads fenced json and ignores empty look", () => {
  const turn = parseGrokLookResponse("```json\n{\"reply\":\"Hold.\",\"look\":{}}\n```", base);
  assert.equal(turn.reply, "Hold.");
  assert.equal(turn.changed, false);
  assert.equal(turn.look.phenomenon, "vortex");
});

test("parseGrokLookResponse falls back when the model talks", () => {
  const turn = parseGrokLookResponse("just a note with no json", base);
  assert.match(turn.reply, /just a note/);
  assert.equal(turn.changed, false);
  assert.equal(turn.pin, false);
});

test("mergeLookPatch does not invent a phenomenon id", () => {
  const next = mergeLookPatch(base, { phenomenon: "not-real" as never, stars: 40 });
  assert.equal(next.phenomenon, "vortex");
  assert.equal(next.stars, 40);
});

test("threadStorageKey is per song", () => {
  assert.equal(threadStorageKey("rose", "rose-001"), "radio.rose.grok.v1.rose.rose-001");
  assert.equal(threadStorageKey("rose", null), "radio.rose.grok.v1.rose.station");
});
