import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { encodeXpTag, experienceFromChannel, mergeXpTags, xpFromTags } from "./experiences.ts";
import type { Channel } from "./types.ts";

const channel: Channel = {
  slug: "rose",
  name: "Rose",
  energy: "opera",
  mode: "fixed",
  kind: "fixed",
  cover: "/covers/rose.jpg",
  description: "seed",
  enabled: true,
  tags: ["experience"],
  category: "Experience",
  featured: true,
  claimable: false,
  skin: "rose",
  nsfw: false,
  tracks: [],
};

describe("experience pack", () => {
  it("round-trips copy through a comma-safe tag", () => {
    const tag = encodeXpTag({
      slug: "rose",
      title: "Rose",
      kicker: "Bad Wolf Opera · 2137",
      line: "Paradise is in our hands",
      whisper: "Pretty eyes, pretty eyes…",
      summary: "A rite",
      bpm: 122,
      phenomenon: "vortex",
      captions: ["Pretty eyes, pretty eyes…"],
    });
    assert.equal(tag.includes(","), false);
    const packed = xpFromTags(["live", tag]);
    assert.equal(packed?.title, "Rose");
    assert.equal(packed?.bpm, 122);
  });

  it("keeps look tags when saving experience copy", () => {
    const tags = mergeXpTags(["look.v1.abc", "misc"], {
      title: "Rose",
      kicker: "k",
      line: "l",
      whisper: "w",
      summary: "s",
      bpm: 120,
      phenomenon: "aurora",
      captions: [],
    });
    const list = tags.split(",").map((item) => item.trim());
    assert.ok(list.includes("look.v1.abc"));
    assert.ok(list.includes("experience"));
    assert.equal(list.filter((item) => item.startsWith("xp.v1.")).length, 1);
  });

  it("reads rose from the experience flag even without a packed tag", () => {
    const xp = experienceFromChannel(channel);
    assert.equal(xp?.slug, "rose");
    assert.equal(xp?.phenomenon, "vortex");
  });
});
