import assert from "node:assert/strict";
import test from "node:test";
import { hostWantsShrimp, shrimpForVisit } from "./shrimpify.ts";

test("home is full Radio, and the station set is Shrimpify", () => {
  assert.equal(shrimpForVisit("shrimpify.com", "", "/"), false);
  assert.equal(shrimpForVisit("shrimpify.com", "", "/stations"), true);
  assert.equal(shrimpForVisit("www.shrimpify.com", "radio_shrimp=0", "/stations"), true);
  assert.equal(shrimpForVisit("radio.terrainfinity.ca", "", "/"), false);
  assert.equal(shrimpForVisit("radio.terrainfinity.ca", "", "/stations"), false);
  assert.equal(shrimpForVisit("radio.cyber-athens.ca", "radio_shrimp=1", "/"), false);
  assert.equal(shrimpForVisit("radio.terrainfinity.ca", "radio_shrimp=1", "/stations"), true);
  assert.equal(shrimpForVisit("localhost", "", "/albums"), false);
  assert.equal(hostWantsShrimp("radio.terrainfinity.ca"), false);
});
