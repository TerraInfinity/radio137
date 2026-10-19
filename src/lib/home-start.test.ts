import assert from "node:assert/strict";
import test from "node:test";
import { HOME_FEATURED, RECENT_PLAY_MS, isRecentPlay, pickHomeStartSlug, selectHomeFeatured } from "./home-start.ts";


const now = 1_800_000_000_000;

test("homepage featured allowlist is exactly Rose then Official Glaum", () => {
  assert.deepEqual(HOME_FEATURED.map((row) => `${row.kind}:${row.slug}`), ["experience:rose", "station:official-glaum-frequency"]);
});

test("recent resume wins within 7 days, stale or unproven falls back to Official Glaum", () => {
  const playable = ["default", "rose", "official-glaum-frequency", "chaos-yoga-frequency"];
  assert.equal(pickHomeStartSlug({ lastSlug: "chaos-yoga-frequency", lastPlayedAt: now - 1000, now, playableSlugs: playable, defaultSlug: "default" }), "chaos-yoga-frequency");
  assert.equal(pickHomeStartSlug({ lastSlug: "chaos-yoga-frequency", lastPlayedAt: now - RECENT_PLAY_MS - 1, now, playableSlugs: playable, defaultSlug: "default" }), "official-glaum-frequency");
  assert.equal(pickHomeStartSlug({ lastSlug: "chaos-yoga-frequency", lastPlayedAt: null, now, playableSlugs: playable, defaultSlug: "default" }), "official-glaum-frequency");
  assert.equal(pickHomeStartSlug({ lastSlug: "gone", lastPlayedAt: now, now, playableSlugs: playable, defaultSlug: "default" }), "official-glaum-frequency");
  assert.equal(pickHomeStartSlug({ lastSlug: null, lastPlayedAt: null, now, playableSlugs: ["default"], defaultSlug: "default" }), "default");
  assert.equal(isRecentPlay(now - RECENT_PLAY_MS, now), true);
  assert.equal(isRecentPlay(null, now), false);
});

test("allowlist selection returns only Rose experience and Official Glaum even when others are featured", () => {
  const experiences = [{ kind: "experience", slug: "rose", channel: { slug: "rose" } }, { kind: "experience", slug: "other", channel: { slug: "other" } }];
  const stations = [
    { kind: "station", slug: "chaos-yoga-frequency", channel: { slug: "chaos-yoga-frequency" } },
    { kind: "station", slug: "official-glaum-frequency", channel: { slug: "official-glaum-frequency" } },
  ];
  assert.deepEqual(selectHomeFeatured(experiences, stations).map((row) => `${row.kind}:${row.slug}`), ["experience:rose", "station:official-glaum-frequency"]);
});

test("allowlist selection returns fewer, never a substitute, when one row is missing", () => {
  const experiences = [{ kind: "experience", slug: "rose", channel: { slug: "rose" } }];
  const stations = [{ kind: "station", slug: "chaos-yoga-frequency", channel: { slug: "chaos-yoga-frequency" } }];
  assert.deepEqual(selectHomeFeatured(experiences, stations).map((row) => row.slug), ["rose"]);
});

test("slug-default channel is named GLaDOS with unchanged slug", async () => {
  const catalog = JSON.parse(await (await import("node:fs/promises")).readFile(new URL("../data/catalog.json", import.meta.url), "utf8")) as { defaultSlug: string; channels: { slug: string; name: string }[] };
  const channel = catalog.channels.find((item) => item.slug === "default");
  assert.equal(catalog.defaultSlug, "default");
  assert.equal(channel?.name, "GLaDOS");
});
