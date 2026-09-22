import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { encodeSceneTag, lookForTrack, phenomenonAt, sceneFromTags } from "./phenomena.ts";
import { ROSE_LOOK_DEFAULT } from "./rose-look.ts";

describe("phenomena", () => {
  it("cycles unique looks from the station default", () => {
    assert.equal(phenomenonAt(0, "vortex"), "vortex");
    assert.equal(phenomenonAt(1, "vortex"), "aurora");
    assert.notEqual(phenomenonAt(0, "vortex"), phenomenonAt(1, "vortex"));
  });

  it("pins a track scene without commas in the tag", () => {
    const tag = encodeSceneTag({
      ...ROSE_LOOK_DEFAULT,
      phenomenon: "aurora",
      captions: ["Pretty eyes, pretty eyes…"],
      bpm: 128,
    });
    assert.equal(tag.includes(","), false);
    const scene = sceneFromTags(["bpm:122", tag]);
    assert.equal(scene?.phenomenon, "aurora");
    assert.equal(scene?.bpm, 128);
  });

  it("lets a pinned song override the station cycle", () => {
    const track = {
      id: "a",
      title: "A",
      artist: "x",
      durationSec: 10,
      audioUrl: "https://example/a.mp3",
      tags: [encodeSceneTag({ phenomenon: "void" })],
    };
    const look = lookForTrack({ ...ROSE_LOOK_DEFAULT, phenomenon: "vortex" }, track, 0);
    assert.equal(look.phenomenon, "void");
  });
});
