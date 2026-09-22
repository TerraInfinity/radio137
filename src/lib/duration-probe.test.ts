import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isStubDuration, wholeSeconds } from "./duration-policy.ts";

describe("duration placeholders", () => {
  it("flags sting and desk-add slots", () => {
    assert.equal(isStubDuration(8), true);
    assert.equal(isStubDuration(60), true);
    assert.equal(isStubDuration(0), true);
    assert.equal(isStubDuration(709), false);
    assert.equal(isStubDuration(16), false);
  });

  it("stores probed lengths as whole seconds", () => {
    assert.equal(wholeSeconds(376.520167), 377);
    assert.equal(wholeSeconds(376.4), 376);
    assert.equal(wholeSeconds(0.2), 1);
    assert.equal(wholeSeconds(undefined), null);
    assert.equal(wholeSeconds(Number.NaN), null);
  });
});
