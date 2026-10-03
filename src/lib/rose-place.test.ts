import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { roseResumeAllowed } from "./rose-place.ts";

describe("rose place", () => {
  it("resumes only on a refresh that has not already left the rite", () => {
    assert.equal(roseResumeAllowed("reload", false), true);
    assert.equal(roseResumeAllowed("reload", true), false);
    assert.equal(roseResumeAllowed("back_forward", false), false);
    assert.equal(roseResumeAllowed("navigate", false), false);
    assert.equal(roseResumeAllowed(undefined, false), false);
  });
});
