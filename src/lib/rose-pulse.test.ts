import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bpmFromTags, captionForPulse, clampBpm, pulseAt } from "./rose-pulse.ts";

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

  it("walks captions by phrase", () => {
    const lines = ["a", "b", "c", "d"];
    assert.equal(captionForPulse(pulseAt(0, 120), lines), "a");
    const later = pulseAt(16, 120); // 32 beats = one 8-bar phrase at 120
    assert.equal(later.phrasePhase < 0.05 || later.phrasePhase > 0.95, true);
  });
});
