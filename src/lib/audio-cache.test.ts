import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cacheBudgetBytes,
  isDataSaverConnection,
  isFiniteAudioUrl,
  isTightStorage,
  lruVictims,
  maxCachedTracks,
  overflowVictims,
  shouldAutoKeep,
  shouldHoldAutoAdvance,
} from "./audio-cache-policy.ts";

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

describe("device budget", () => {
  it("treats phones and cellular as tight storage", () => {
    assert.equal(isTightStorage({ ua: "iPhone", width: 1200 }), true);
    assert.equal(isTightStorage({ width: 390 }), true);
    assert.equal(isTightStorage({ type: "cellular" }), true);
    assert.equal(isTightStorage({ ua: "Macintosh", width: 1440, type: "wifi" }), false);
  });

  it("caps mobile budget well below desktop and below quota", () => {
    const phone = cacheBudgetBytes(2 * 1024 * 1024 * 1024, true);
    const desk = cacheBudgetBytes(2 * 1024 * 1024 * 1024, false);
    assert.ok(phone <= 120 * 1024 * 1024);
    assert.ok(desk <= 400 * 1024 * 1024);
    assert.ok(phone < desk);
    assert.equal(maxCachedTracks(true), 8);
    assert.equal(maxCachedTracks(false), 20);
  });

  it("does not auto-keep until the listener has mostly heard the cut", () => {
    assert.equal(shouldAutoKeep({ listenedRatio: 0.2 }), false);
    assert.equal(shouldAutoKeep({ listenedRatio: 0.9 }), true);
    assert.equal(shouldAutoKeep({ dataSaver: true, listenedRatio: 1 }), false);
    assert.equal(shouldAutoKeep({ force: true, dataSaver: true }), true);
    assert.equal(shouldAutoKeep({ force: true, bytes: 80 * 1024 * 1024 }), false);
    assert.equal(shouldAutoKeep({ tight: true, bytes: 12 * 1024 * 1024, listenedRatio: 1 }), false);
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

  it("evicts unpinned songs before saved ones", () => {
    const rows = [
      { id: "old-saved", lastUsed: 1, size: 10, pinned: true },
      { id: "fresh", lastUsed: 9, size: 10, pinned: false },
      { id: "mid", lastUsed: 5, size: 10, pinned: false },
    ];
    assert.deepEqual(lruVictims(rows, 10), ["mid"]);
    assert.deepEqual(overflowVictims(rows, 2), ["mid"]);
  });
});
