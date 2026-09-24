import assert from "node:assert/strict";
import test from "node:test";
import { totalFromResponse } from "./download-bytes.ts";

test("a stopped download knows how big the file is", () => {
  assert.equal(totalFromResponse(1_000_000, 206, 500, "bytes 1000000-1499999/8000000"), 8_000_000);
  assert.equal(totalFromResponse(0, 200, 4000, null), 4000);
  assert.equal(totalFromResponse(10, 206, 90, null), 100);
});
