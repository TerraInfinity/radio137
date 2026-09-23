import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ghostDropCount, ghostPlans } from "./playlist-ghosts.ts";
import type { Track } from "./types.ts";

function track(partial: Partial<Track> & Pick<Track, "id" | "title" | "audioUrl" | "durationSec">): Track {
  return {
    artist: "Rose",
    coverUrl: "",
    nsfw: false,
    enabled: true,
    playback: "file",
    tags: [],
    ...partial,
  };
}

describe("playlist ghosts", () => {
  it("keeps the real Twist It file and drops voice stubs that reused it", () => {
    const twistUrl = "https://r2.terrainfinity.ca/radio/official-glaum-frequency/What%20If%20Glaum/31_twist%20me%20intro.mp3";
    const plans = ghostPlans([
      track({ id: "rose-005", title: "Twist It Intro", audioUrl: twistUrl, durationSec: 1047 }),
      track({ id: "rose-008", title: "Voice Check ♔ M8ternity", audioUrl: twistUrl, durationSec: 240, coverUrl: "/experiences/rose/allocate-rose.jpg" }),
      track({ id: "rose-010", title: "Voice C___", audioUrl: twistUrl, durationSec: 240 }),
    ]);
    assert.equal(plans.length, 1);
    assert.equal(plans[0]?.keep.id, "rose-005");
    assert.equal(ghostDropCount(plans), 2);
    assert.equal(plans[0]?.inheritScene, false);
  });

  it("does not flag unique files", () => {
    assert.equal(
      ghostPlans([
        track({ id: "a", title: "Time War 2137", audioUrl: "https://r2.example/Time%20War%202137.mp3", durationSec: 511 }),
        track({ id: "b", title: "The Basilisk", audioUrl: "https://r2.example/basilisk.mp3", durationSec: 1381 }),
      ]).length,
      0,
    );
  });

  it("does not merge Voice C lanes that are different cuts", () => {
    const plans = ghostPlans([
      track({ id: "c", title: "Voice C___", audioUrl: "https://r2.example/voice-c.mp3", durationSec: 200 }),
      track({ id: "co", title: "Voice Co__", audioUrl: "https://r2.example/voice-co.mp3", durationSec: 200 }),
      track({ id: "coc", title: "Voice Coc_", audioUrl: "https://r2.example/voice-coc.mp3", durationSec: 200 }),
    ]);
    assert.equal(plans.length, 0);
  });

  it("flags a pretty-eyes original sitting next to the art copy", () => {
    const plans = ghostPlans([
      track({
        id: "orig",
        title: "Pretty Face, Pretty Eyes Sweetie",
        audioUrl: "https://r2.example/Pretty%20Face%20Pretty%20Eyes%20Sweetie.mp3",
        durationSec: 244,
      }),
      track({
        id: "art",
        title: "Pretty Face, Pretty Eyes Sweetie",
        audioUrl: "https://r2.example/Pretty-Face-Pretty-Eyes-Sweetie.mp3",
        durationSec: 244,
        coverUrl: "/experiences/rose/sweetie-city.jpg",
      }),
    ]);
    assert.equal(plans.length, 1);
    assert.equal(ghostDropCount(plans), 1);
  });

  it("keeps Rose Remembers and Rose Remembers 2_ apart", () => {
    assert.equal(
      ghostPlans([
        track({ id: "r1", title: "Rose Remembers!", audioUrl: "https://r2.example/remember.mp3", durationSec: 180 }),
        track({ id: "r2", title: "Rose Remembers 2_", audioUrl: "https://r2.example/remember2.mp3", durationSec: 180 }),
      ]).length,
      0,
    );
  });
});
