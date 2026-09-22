import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { leaderIsOther, parseLeader, thisTabOwnsClock } from "./playback-lock.ts";

describe("playback lock", () => {
  it("ignores garbage and self", () => {
    assert.equal(parseLeader(null), null);
    assert.equal(parseLeader("{"), null);
    assert.equal(parseLeader(JSON.stringify({ tabId: "a", at: 10 }))?.tabId, "a");
    assert.equal(leaderIsOther({ tabId: "self", at: 100 }, "self", 110), false);
  });

  it("treats a fresh other tab as the speaker", () => {
    assert.equal(leaderIsOther({ tabId: "b", at: 1000 }, "a", 1400, 8000), true);
    assert.equal(leaderIsOther({ tabId: "b", at: 1000 }, "a", 20_000, 8000), false);
  });

  it("lets the silent tab keep persisted clock unless it is held elsewhere", () => {
    assert.equal(thisTabOwnsClock(true, false), true);
    assert.equal(thisTabOwnsClock(true, true), true);
    assert.equal(thisTabOwnsClock(false, false), true);
    assert.equal(thisTabOwnsClock(false, true), false);
  });
});
