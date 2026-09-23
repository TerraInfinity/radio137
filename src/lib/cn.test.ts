import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatClock } from "./cn.ts";

describe("formatClock", () => {
  it("rounds file lengths and keeps mm:ss under an hour", () => {
    assert.equal(formatClock(0), "0:00");
    assert.equal(formatClock(8), "0:08");
    assert.equal(formatClock(8.6), "0:09");
    assert.equal(formatClock(65), "1:05");
    assert.equal(formatClock(3599.4), "59:59");
  });

  it("uses hours once a cut or playlist total passes 60 minutes", () => {
    assert.equal(formatClock(3600), "1:00:00");
    assert.equal(formatClock(3661), "1:01:01");
    assert.equal(formatClock(4500), "1:15:00");
    assert.equal(formatClock(43200), "12:00:00");
  });

  it("floors playhead time so elapsed does not jump ahead", () => {
    assert.equal(formatClock(3.9, { floor: true }), "0:03");
    assert.equal(formatClock(59.9, { floor: true }), "0:59");
  });
});
