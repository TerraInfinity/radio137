import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isDataSaverConnection, isFiniteAudioUrl, lruVictims, shouldHoldAutoAdvance } from "./audio-cache-policy.ts";

describe("finite audio", () => {
  it("keeps mp3/m4a on R2 and rejects live playlists", () => {
    assert.equal(isFiniteAudioUrl("https://r2.terrainfinity.ca/radio/glaum/song.mp3"), true);
    assert.equal(isFiniteAudioUrl("https://pub-abc.r2.dev/radio/a.m4a"), true);
    assert.equal(isFiniteAudioUrl("https://example.com/live.m3u8"), false);
    assert.equal(isFiniteAudioUrl("https://ice.example/stream"), false);
    assert.equal(isFiniteAudioUrl("blob:https://radio.local/x"), false);
    assert.equal(isFiniteAudioUrl(""), false);
  });
});

describe("data saver", () => {
  it("treats saveData and cellular as saver", () => {
    assert.equal(isDataSaverConnection({ saveData: true, type: "wifi" }), true);
    assert.equal(isDataSaverConnection({ saveData: false, type: "cellular" }), true);
    assert.equal(isDataSaverConnection({ saveData: false, type: "wifi" }), false);
    assert.equal(isDataSaverConnection(null), false);
  });

  it("holds auto-advance only when saver and the next file is not local", () => {
    assert.equal(shouldHoldAutoAdvance(true, false), true);
    assert.equal(shouldHoldAutoAdvance(true, true), false);
    assert.equal(shouldHoldAutoAdvance(false, false), false);
  });
});

describe("lru", () => {
  it("evicts oldest until the gap is covered", () => {
    const rows = [
      { id: "a", lastUsed: 1, size: 10 },
      { id: "b", lastUsed: 3, size: 10 },
      { id: "c", lastUsed: 2, size: 5 },
    ];
    assert.deepEqual(lruVictims(rows, 12), ["a", "c"]);
    assert.deepEqual(lruVictims(rows, 0), []);
  });
});
