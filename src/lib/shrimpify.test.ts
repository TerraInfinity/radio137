import assert from "node:assert/strict";
import test from "node:test";
import { hostWantsShrimp, shrimpForVisit } from "./shrimpify.ts";

test("shrimpify.com starts on and radio hosts start off", () => {
  assert.equal(shrimpForVisit("shrimpify.com", ""), true);
  assert.equal(shrimpForVisit("www.shrimpify.com", ""), true);
  assert.equal(shrimpForVisit("radio.terrainfinity.ca", ""), false);
  assert.equal(shrimpForVisit("radio.cyber-athens.ca", ""), false);
  assert.equal(shrimpForVisit("localhost", ""), false);
});

test("a saved toggle stays on its own host and cannot cross hosts", () => {
  assert.equal(shrimpForVisit("radio.terrainfinity.ca", "radio_shrimp=1"), true);
  assert.equal(shrimpForVisit("shrimpify.com", "radio_shrimp=0"), false);
  assert.equal(hostWantsShrimp("radio.terrainfinity.ca"), false);
  assert.equal(shrimpForVisit("shrimpify.com", "other=1"), true);
});
