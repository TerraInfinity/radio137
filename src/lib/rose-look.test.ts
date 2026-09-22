import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decodeLookTag,
  encodeLookTag,
  lookFromStation,
  lookFromTags,
  mergeLookTags,
  normalizeLook,
  ROSE_LOOK_DEFAULT,
} from "./rose-look.ts";
import type { RadioExperience } from "./experiences.ts";

const experience = {
  slug: "rose",
  stationSlug: "rose",
  title: "Rose",
  kicker: "k",
  line: "l",
  whisper: "w",
  summary: "s",
  cover: "/covers/rose.jpg",
  loop: "/experiences/rose/tardis-loop.mp4",
  bpm: 120,
  phenomenon: "vortex",
  captions: ["a", "b"],
  stills: [{ src: "/experiences/rose/hero.jpg", caption: "h" }],
} satisfies RadioExperience;

describe("rose look", () => {
  it("round-trips through a comma-safe station tag", () => {
    const look = normalizeLook({
      bpm: 128,
      fly: 1.4,
      captions: ["Pretty eyes, pretty eyes…", "Paradise is in our hands"],
      stillUrls: ["https://r2.example/a.jpg"],
      loopUrl: "https://r2.example/loop.mp4",
    });
    const tag = encodeLookTag(look);
    assert.equal(tag.includes(","), false);
    assert.equal(tag.startsWith("look.v1."), true);
    const back = decodeLookTag(tag);
    assert.deepEqual(back, look);
  });

  it("merges without wiping other tags", () => {
    const tags = mergeLookTags(["experience", "rose", "look.v1.old"], ROSE_LOOK_DEFAULT);
    const list = tags.split(",").map((item) => item.trim());
    assert.ok(list.includes("experience"));
    assert.ok(list.includes("rose"));
    assert.equal(list.filter((item) => item.startsWith("look.v1.")).length, 1);
    assert.ok(lookFromTags(list));
  });

  it("falls back to the experience art when the station has no look yet", () => {
    const look = lookFromStation(experience, {
      slug: "rose",
      name: "Rose",
      energy: "",
      mode: "fixed",
      kind: "fixed",
      cover: "/covers/rose.jpg",
      description: "",
      enabled: true,
      tags: ["experience", "rose"],
      category: "Experience",
      featured: true,
      claimable: false,
      skin: "rose",
      nsfw: false,
      videoUrl: "/experiences/rose/tardis-loop.mp4",
      tracks: [],
    });
    assert.equal(look.loopUrl, "/experiences/rose/tardis-loop.mp4");
    assert.equal(look.stillUrls[0], "/experiences/rose/hero.jpg");
    assert.deepEqual(look.captions, ["a", "b"]);
  });
});
