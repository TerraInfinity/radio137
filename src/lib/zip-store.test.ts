import assert from "node:assert/strict";
import test from "node:test";
import { zipStore } from "./zip-store.ts";

test("a stored zip starts with a local file header", () => {
  const zip = zipStore([{ name: "note.txt", data: new TextEncoder().encode("Rose") }]);
  assert.equal(zip[0], 0x50);
  assert.equal(zip[1], 0x4b);
  assert.ok(zip.length > 30);
});
