import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { actSlot, bpmFromTags, captionForPulse, clampBpm, overlayAlpha, pulseAt } from "./rose-pulse.ts";

describe("rose pulse", () => {
  it("reads bpm tags and clamps wild values", () => {
    assert.equal(bpmFromTags(["experience", "bpm:128"]), 128);
    assert.equal(bpmFromTags(["BPM 96"]), 96);
    assert.equal(bpmFromTags(["opera"], 118), 118);
    assert.equal(clampBpm(12), 70);
    assert.equal(clampBpm(900), 200);
  });

  it("lands kicks on the grid and downbeats on bar one", () => {
    const on = pulseAt(0, 120, true);
    assert.ok(on.kick > 0.7);
    assert.ok(on.downbeat > 0.7);
    assert.equal(on.beatIndex, 0);
    const snare = pulseAt(0.5, 120, true); // beat 2 at 120bpm
    assert.ok(snare.snare > 0.5);
    assert.ok(snare.downbeat < 0.05);
    const hush = pulseAt(0, 120, false);
    assert.ok(hush.flying < 0.15);
    assert.ok(hush.energy < 0.2);
  });

  it("holds one caption for a whole phrase, then steps", () => {
    const lines = ["a", "b", "c", "d"];
    assert.equal(captionForPulse(pulseAt(0, 120), lines), "a");
    assert.equal(captionForPulse(pulseAt(8, 120), lines), "a");
    assert.equal(captionForPulse(pulseAt(16, 120), lines), "b");
    assert.equal(actSlot(pulseAt(0, 120), 4), 0);
    assert.equal(actSlot(pulseAt(4, 120), 4), 1);
  });

  it("opens overlay copy for four bars, then rests four", () => {
    assert.ok(overlayAlpha(pulseAt(1, 120), 4) > 0.9);
    assert.equal(overlayAlpha(pulseAt(8, 120), 4), 0);
    assert.equal(overlayAlpha(pulseAt(12, 120), 4), 0);
    assert.ok(overlayAlpha(pulseAt(17, 120), 4) > 0.9);
  });
});
