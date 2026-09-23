import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bufferHead, cueProgress, mergeLaneProgress, openingPlates, plateProgress, scenePlates, songAudioProgress, upcomingFrom } from "./experience-preload.ts";
import type { Track } from "./types.ts";

describe("experience opening gate", () => {
  it("holds the preview until every lane has data", () => {
    assert.equal(
      mergeLaneProgress([
        { id: "station", label: "Station", progress: 1 },
        { id: "score", label: "Score", progress: 0.5 },
        { id: "vortex", label: "Vortex", progress: 0 },
      ]),
      0.5,
    );
    assert.equal(mergeLaneProgress([]), 0);
  });

  it("counts a song ready only once the opening can play", () => {
    assert.equal(bufferHead({ readyState: 0, duration: NaN, buffered: { length: 0, end: () => 0 } }), 0);
    assert.equal(
      bufferHead({
        readyState: 1,
        duration: 200,
        buffered: { length: 1, end: () => 4 },
      }),
      0.46,
    );
    assert.equal(bufferHead({ readyState: 3, duration: 200, buffered: { length: 1, end: () => 1 } }), 1);
  });

  it("keeps Rose on the vortex plates and lets another experience bring its own", () => {
    assert.deepEqual(openingPlates("rose", "/covers/rose.jpg", ["/experiences/rose/hero.jpg"]), [
      "/experiences/rose/vortex-tunnel.jpg?v=5",
      "/experiences/rose/white-rose.png",
      "/experiences/rose/tardis-chase.png",
    ]);
    assert.deepEqual(openingPlates("next", "/covers/next.jpg", ["/a.jpg", "/a.jpg", "/b.jpg"]), [
      "/covers/next.jpg",
      "/a.jpg",
      "/b.jpg",
    ]);
  });

  it("keeps a song cue even until both the score and the pictures are in", () => {
    assert.equal(cueProgress(1, 0), 0.5);
    assert.equal(cueProgress(1, 1), 1);
    assert.equal(
      songAudioProgress({
        audioUrl: null,
        status: "playing",
        src: "",
        readyState: 0,
        duration: 0,
        buffered: { length: 0, end: () => 0 },
        loading: false,
      }),
      1,
    );
    assert.equal(
      songAudioProgress({
        audioUrl: "/audio/rose.mp3",
        status: "loading",
        src: "",
        readyState: 0,
        duration: 0,
        buffered: { length: 0, end: () => 0 },
        loading: true,
      }),
      0.12,
    );
    assert.equal(plateProgress([]), 1);
    assert.deepEqual(scenePlates("rose", "manual"), [
      "/experiences/rose/allocate-glyphs.jpg",
      "/experiences/rose/allocate-cleo.jpg",
      "/experiences/rose/white-rose.png",
    ]);
    assert.deepEqual(scenePlates("other", "manual"), []);
  });

  it("lines up the next songs and does not circle back onto the one playing", () => {
    const tracks = ["a", "b", "c"].map((id) => ({ id, title: id, artist: "", durationSec: 1, audioUrl: `/${id}.mp3` }) satisfies Track);
    assert.deepEqual(upcomingFrom(tracks, "a", 2).map((track) => track.id), ["b", "c"]);
    assert.deepEqual(upcomingFrom(tracks, "c", 2).map((track) => track.id), ["a", "b"]);
    assert.deepEqual(upcomingFrom(tracks, "b", 1).map((track) => track.id), ["c"]);
  });
});
