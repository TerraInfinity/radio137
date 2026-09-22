import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ritePrimary } from "./rite-primary.ts";

describe("ritePrimary", () => {
  it("starts the playlist from the first song until the rite has begun", () => {
    assert.equal(ritePrimary({ here: false, playing: false, started: false }), "begin");
    assert.equal(ritePrimary({ here: true, playing: false, started: false }), "begin");
  });

  it("pauses instead of restarting while the rite is playing", () => {
    assert.equal(ritePrimary({ here: true, playing: true, started: true }), "pause");
    assert.equal(ritePrimary({ here: true, playing: true, started: false }), "pause");
  });

  it("resumes from the current song after a pause", () => {
    assert.equal(ritePrimary({ here: true, playing: false, started: true }), "resume");
  });

  it("holds the control while audio is opening", () => {
    assert.equal(ritePrimary({ here: true, playing: false, started: false, loading: true }), "opening");
  });
});
