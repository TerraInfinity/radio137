import assert from "node:assert/strict";
import test from "node:test";
import { deckIsStalled } from "./display-rest.ts";

test("a buffering or paused deck is stalled, a healthy one is not", () => {
  assert.equal(deckIsStalled({ paused: false, readyState: 4, buffering: false }), false);
  assert.equal(deckIsStalled({ paused: false, readyState: 4, buffering: true }), true);
  assert.equal(deckIsStalled({ paused: true, readyState: 4, buffering: false }), true);
  assert.equal(deckIsStalled({ paused: false, readyState: 1, buffering: false }), true);
});
