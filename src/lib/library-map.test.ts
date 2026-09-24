import assert from "node:assert/strict";
import test from "node:test";
import { cleanSongTitle, consolidationPlans, libraryKeyFor, mapLibrary, titleFixes } from "./library-map.ts";

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

test("a leading playlist number is not part of the title, and ad 1 is not ad 2", () => {
  assert.equal(cleanSongTitle("6 Helicopter Time Share Shrimp Ad 2"), "Helicopter Time Share Shrimp Ad 2");
  assert.equal(cleanSongTitle("03 The Yoga Sutras Part 1"), "The Yoga Sutras Part 1");
  assert.equal(cleanSongTitle("2.5 Kick it to me, Lady Bambi 2 — Azeirf"), "Kick it to me, Lady Bambi 2");
  assert.equal(cleanSongTitle("3 6 9 Breath, (Shuniya)"), "3 6 9 Breath, (Shuniya)");
  assert.equal(
    cleanSongTitle("Azeirf (The Bambi Cloud Podcast) Disclaimer Intro (SPOTISAVER)"),
    "Disclaimer Intro",
  );
  assert.equal(cleanSongTitle("Helicopter Time Share Shrimp Ad 1"), "Helicopter Time Share Shrimp Ad 1");
  const rows = mapLibrary([
    copy("6 Helicopter Time Share Shrimp Ad 2", "glaum", "radio/official-glaum-frequency/glaum/6 Helicopter Time Share Shrimp Ad 2.mp3"),
    copy("Helicopter Time Share Shrimp Ad 2", "rose", "radio/rose/Helicopter Time Share Shrimp Ad 2.mp3"),
    copy("Helicopter Time Share Shrimp Ad 1", "rose", "radio/rose/Helicopter Time Share Shrimp Ad 1.mp3"),
  ] as never);
  assert.equal(rows.length, 2);
  assert.equal(rows.find((row) => row.title.includes("Ad 2"))?.title, "Helicopter Time Share Shrimp Ad 2");
  assert.equal(rows.find((row) => row.title.includes("Ad 2"))?.copies.length, 2);
  assert.equal(rows.find((row) => row.title.includes("Ad 1"))?.copies.length, 1);
});

test("name review lists the junk prefix and leaves 3 6 9 alone", () => {
  const rows = mapLibrary([
    copy("03 The Yoga Sutras Part 1", "yoga", "radio/yoga/03 The Yoga Sutras Part 1.mp3"),
    copy("3 6 9 Breath, (Shuniya)", "yoga", "radio/yoga/3 6 9 Breath.mp3"),
    copy("Azeirf (The Bambi Cloud Podcast) FireWatch (SPOTISAVER)", "mischief", "radio/mischief/fire.mp3"),
  ] as never);
  const fixes = titleFixes(rows);
  assert.deepEqual(fixes.map((fix) => fix.to), ["The Yoga Sutras Part 1", "FireWatch"]);
});

test("the keeper is the mp3, and a wav is left behind", () => {
  const rows = mapLibrary([
    copy("Soft Shell", "glaum", "radio/glaum/Soft Shell.wav"),
    copy("Soft Shell", "rose", "radio/rose/Soft Shell.mp3"),
  ] as never);
  const plan = consolidationPlans(rows)[0];
  assert.equal(plan?.keep.filename, "Soft Shell.mp3");
  assert.equal(plan?.left.length, 1);
  assert.match(plan?.because ?? "", /mp3/);
});
