import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CutCopy } from "./cuts.ts";
import type { Channel, Track } from "./types.ts";
import { clusterSkipKeys, similarClusters, skipPairKey } from "./similar-cuts.ts";

function channel(slug: string, name = slug): Channel {
  return {
    slug,
    name,
    energy: "",
    mode: "live",
    kind: "live",
    cover: "",
    description: "",
    enabled: true,
    tags: [],
    category: "",
    featured: false,
    claimable: false,
    skin: "",
    nsfw: false,
    tracks: [],
  };
}

function copy(id: string, title: string, durationSec: number, opts: { slug?: string; artist?: string; stem?: string; filename?: string; originalUrl?: string } = {}): CutCopy {
  const slug = opts.slug ?? "alpha";
  const stem = opts.stem ?? title;
  const filename = opts.filename ?? `${stem}.mp3`;
  const track: Track = {
    id,
    title,
    artist: opts.artist ?? "Alpha",
    durationSec,
    audioUrl: `https://r2.example/${slug}/${filename}`,
    originalUrl: opts.originalUrl,
  };
  return { track, channel: channel(slug, slug), folder: slug, filename, stem };
}

function idsOf(copies: ReturnType<typeof similarClusters>): string[][] {
  return copies.map((cluster) => cluster.copies.map((item) => item.track.id).sort());
}

describe("similar song detector", () => {
  it("builds a stable sorted pair key", () => {
    assert.equal(skipPairKey("b", "a"), "a|b");
    assert.deepEqual(clusterSkipKeys(["c", "a", "b"]), ["a|b", "a|c", "b|c"]);
  });

  it("detects close titles with the same duration", () => {
    const rows = [
      copy("a", "here in so hill ah GLaDOS", 184, { slug: "one", artist: "Voice" }),
      copy("b", "here in sohila GLaDOS", 185, { slug: "two", artist: "Voice" }),
    ];
    const clusters = similarClusters(rows, []);
    assert.equal(clusters.length, 1);
    assert.deepEqual(idsOf(clusters)[0], ["a", "b"]);
  });

  it("does not pair sequels that only differ by a trailing number", () => {
    const rows = [
      copy("a", "Alien cyber forest paradise", 240, { slug: "one" }),
      copy("b", "Alien cyber forest paradise 2", 240, { slug: "two" }),
    ];
    assert.equal(similarClusters(rows, []).length, 0);
  });

  it("does not pair tracks that only share a generic suffix", () => {
    const rows = [
      copy("a", "bimbo doll GLaDOS", 8, { slug: "one", artist: "Default" }),
      copy("b", "bimbo neo has awoken GLaDOS", 8, { slug: "two", artist: "Default" }),
    ];
    assert.equal(similarClusters(rows, []).length, 0);
  });

  it("does not pair different last words of a shared mantra", () => {
    const rows = [
      copy("a", "om shreem prana dharma", 90, { slug: "one" }),
      copy("b", "om shreem prana hreem", 90, { slug: "two" }),
    ];
    assert.equal(similarClusters(rows, []).length, 0);
  });

  it("does not pair a remix with the original", () => {
    const rows = [
      copy("a", "Clockwork Heart", 200, { slug: "one" }),
      copy("b", "Clockwork Heart (Remix)", 200, { slug: "two" }),
    ];
    assert.equal(similarClusters(rows, []).length, 0);
  });

  it("does not pair different durations", () => {
    const rows = [
      copy("a", "Clockwork Heart", 200, { slug: "one" }),
      copy("b", "Clockwork Heart", 260, { slug: "two" }),
    ];
    assert.equal(similarClusters(rows, []).length, 0);
  });

  it("hides skipped pairs", () => {
    const rows = [
      copy("a", "lady sleep", 188, { slug: "one", artist: "Voice" }),
      copy("b", "lady sleeep", 188, { slug: "two", artist: "Voice" }),
    ];
    assert.equal(similarClusters(rows, []).length, 1);
    assert.equal(similarClusters(rows, [], [skipPairKey("a", "b")]).length, 0);
  });

  it("does not re-suggest already merged songs", () => {
    const rows = [
      copy("a", "lady sleep", 188, { slug: "one", artist: "Voice" }),
      copy("b", "lady sleeep", 188, { slug: "two", artist: "Voice" }),
    ];
    assert.equal(similarClusters(rows, [{ canonicalId: "a", memberIds: ["a", "b"] }]).length, 0);
  });

  it("does not pair lettered variants on the same station", () => {
    const rows = [
      copy("a", "Monkey", 98, { slug: "ai-nature-music" }),
      copy("b", "Monkey b", 96, { slug: "ai-nature-music" }),
      copy("c", "Monkey a 2", 99, { slug: "ai-nature-music" }),
    ];
    assert.equal(similarClusters(rows, []).length, 0);
  });

  it("does not pair numbered movements of a series", () => {
    const rows = [
      copy("a", "07 Sutra 4 v1", 644, { slug: "one" }),
      copy("b", "11 Sutra 8 v1", 643, { slug: "two" }),
    ];
    assert.equal(similarClusters(rows, []).length, 0);
  });

  it("does not pair v1 with v3", () => {
    const rows = [
      copy("a", "Glaum Wedding v1", 961, { slug: "one" }),
      copy("b", "Glaum Wedding v3", 960, { slug: "two" }),
    ];
    assert.equal(similarClusters(rows, []).length, 0);
  });

  it("does not pair short clips that only share a tiny stem", () => {
    const rows = [
      copy("a", "G C S", 8, { slug: "one", artist: "Default" }),
      copy("b", "Oh GLaDOS", 8, { slug: "two", artist: "Default" }),
    ];
    assert.equal(similarClusters(rows, []).length, 0);
  });

  it("does not pair pronoun-flipped lines", () => {
    const rows = [
      copy("a", "my bimbo mind is mine GLaDOS", 8, { slug: "one", artist: "Default" }),
      copy("b", "your bimbo mind is mine GLaDOS", 8, { slug: "two", artist: "Default" }),
    ];
    assert.equal(similarClusters(rows, []).length, 0);
  });

  it("does not pair a line with a longer different line", () => {
    const rows = [
      copy("a", "bubble pop GLaDOS", 8, { slug: "one", artist: "Default" }),
      copy("b", "Surrender to the bubble pop GLaDOS", 8, { slug: "two", artist: "Default" }),
    ];
    assert.equal(similarClusters(rows, []).length, 0);
  });

  it("detects the same song with a playlist number prefix", () => {
    const rows = [
      copy("a", "19 Jungle Sloak", 215, { slug: "one", artist: "Glaum" }),
      copy("b", "Jungle Sloak", 215, { slug: "two", artist: "Glaum" }),
    ];
    assert.equal(similarClusters(rows, []).length, 1);
  });

  it("detects a copy suffix as the same song", () => {
    const rows = [
      copy("a", "Helicopter Time Share", 538, { slug: "one", artist: "Glaum" }),
      copy("b", "Helicopter Time Share Copy", 538, { slug: "two", artist: "Glaum" }),
    ];
    assert.equal(similarClusters(rows, []).length, 1);
  });

  it("detects an artist credit suffix as the same song", () => {
    const rows = [
      copy("a", "Kira's Ramayan Chhikka", 1330, { slug: "one", artist: "Kira" }),
      copy("b", "Kira's Ramayan Chhikka — Azeirf", 1331, { slug: "two", artist: "Kira" }),
    ];
    assert.equal(similarClusters(rows, []).length, 1);
  });
});
