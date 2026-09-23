import assert from "node:assert/strict";
import test from "node:test";
import { listensFor, pickWelcome, scoreFeature } from "./feature-weight.ts";

test("featured and newer outrank a quiet old station, listens can climb", () => {
  const lead = scoreFeature({ featured: true, featuredRank: 0, listens: 0, newer: 1, fresh: true });
  const later = scoreFeature({ featured: true, featuredRank: 4, listens: 0, newer: 0.2, fresh: false });
  const quiet = scoreFeature({ featured: false, listens: 2, newer: 0, fresh: false });
  const heard = scoreFeature({ featured: false, listens: 200, newer: 0.1, fresh: false });
  assert.ok(lead > later);
  assert.ok(later > quiet);
  assert.ok(heard > quiet);
  assert.equal(listensFor([{ id: "a" }, { id: "b" }], { a: 3, b: 1 }), 4);
});

test("welcome uses history, otherwise the heaviest featured station", () => {
  const rows = [
    { slug: "old", enabled: true, featured: false, weight: 10 },
    { slug: "rose", enabled: true, featured: true, weight: 900 },
    { slug: "glaum", enabled: true, featured: true, weight: 700 },
  ];
  assert.equal(pickWelcome(rows, "old", "default"), "old");
  assert.equal(pickWelcome(rows, null, "default"), "rose");
  assert.equal(pickWelcome([], null, "default"), "default");
});
