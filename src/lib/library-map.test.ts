import assert from "node:assert/strict";
import test from "node:test";
import { libraryKeyFor, mapLibrary } from "./library-map.ts";

function copy(title: string, slug: string, url: string) {
  const filename = url.split("/").pop() || url;
  const folder = url.slice(0, url.lastIndexOf("/"));
  return {
    track: { id: `${slug}-${title}`, title, artist: "", durationSec: 10, audioUrl: `https://r2.terrainfinity.ca/${url}` },
    channel: { slug, name: slug, energy: "", mode: "fixed" as const, kind: "fixed" as const, cover: "", description: "", enabled: true, tracks: [] },
    folder,
    filename,
    stem: filename.replace(/\.mp3$/, ""),
  };
}

test("one song maps every playlist and proposes a library file", () => {
  const rows = mapLibrary([copy("Soft Shell", "rose", "radio/rose/Soft Shell.mp3"), copy("Soft Shell", "glaum", "radio/glaum/Soft Shell.mp3")] as never);
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0]?.playlists.map((item) => item.slug), ["rose", "glaum"]);
  assert.equal(rows[0]?.files, 2);
  assert.equal(rows[0]?.shelved, false);
  assert.equal(rows[0]?.libraryKey, "radio/library/Soft Shell.mp3");
  assert.equal(libraryKeyFor("a/b"), "radio/library/a b.mp3");
});

test("a song already in the library folder is shelved", () => {
  const rows = mapLibrary([copy("Rose", "rose", "radio/library/Rose.mp3")] as never);
  assert.equal(rows[0]?.shelved, true);
});
