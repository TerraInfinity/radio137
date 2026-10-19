import assert from "node:assert/strict";
import test from "node:test";
import { filterDirectory, parseDirectoryView, type DirectoryFields } from "./directory-search.ts";

const rows: DirectoryFields[] = [
  { title: "Rose", kicker: "Bad Wolf", line: "Paradise", category: "Experience", tags: ["opera"], energy: "rite", kind: "fixed", mode: "fixed" },
  { title: "Official Glaum Frequency", kicker: "Glåüm", line: "On the air", category: "Frequency", tags: ["shrimp"], energy: "broadcast", kind: "live", mode: "live" },
  { title: "1-800-Shrimp-Up", line: "Album · 35 tracks", source: "soundcloud" },
];

test("directory search matches title, category, tags, and album fields", () => {
  assert.deepEqual(filterDirectory(rows, "rose", (row) => row).map((row) => row.title), ["Rose"]);
  assert.deepEqual(filterDirectory(rows, "FREQUENCY", (row) => row).map((row) => row.title), ["Official Glaum Frequency"]);
  assert.deepEqual(filterDirectory(rows, "glaum", (row) => row).map((row) => row.title), ["Official Glaum Frequency"]);
  assert.deepEqual(filterDirectory(rows, "shrimp", (row) => row).map((row) => row.title), ["Official Glaum Frequency", "1-800-Shrimp-Up"]);
  assert.deepEqual(filterDirectory(rows, "soundcloud", (row) => row).map((row) => row.title), ["1-800-Shrimp-Up"]);
  assert.deepEqual(filterDirectory(rows, "opera", (row) => row).map((row) => row.title), ["Rose"]);
});

test("an empty query returns every row and a miss returns none", () => {
  assert.equal(filterDirectory(rows, "   ", (row) => row).length, 3);
  assert.deepEqual(filterDirectory(rows, "zzzz-nope", (row) => row), []);
});

test("directory view parses only cards or list", () => {
  assert.equal(parseDirectoryView("cards"), "cards");
  assert.equal(parseDirectoryView("list"), "list");
  assert.equal(parseDirectoryView(undefined), null);
  assert.equal(parseDirectoryView("grid"), null);
});
