import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { experienceSlugFromPath, pageCuesPlayback } from "./playback-page.ts";

describe("playback page", () => {
  it("lets an experience page own the desk so lastSlug cannot steal it", () => {
    assert.equal(pageCuesPlayback("/experiences/rose"), true);
    assert.equal(experienceSlugFromPath("/experiences/rose"), "rose");
    assert.equal(pageCuesPlayback("/experiences"), false);
    assert.equal(experienceSlugFromPath("/experiences"), null);
  });

  it("still cues station and player pages, not the library", () => {
    assert.equal(pageCuesPlayback("/channel/official-glaum-frequency"), true);
    assert.equal(pageCuesPlayback("/library"), false);
    assert.equal(pageCuesPlayback("/"), false);
  });
});
