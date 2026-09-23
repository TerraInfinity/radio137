import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compareTrackTitle, sortPlaylistTracks } from "./track-title.ts";
import type { Track } from "./types.ts";

function track(id: string, title: string, artist = "Desk"): Track {
  return { id, title, artist, durationSec: 60, audioUrl: `https://r2.example/${id}.mp3`, enabled: true };
}

describe("playlist default order", () => {
  it("sorts songs alphabetically when the desk has not arranged them", () => {
    const ordered = sortPlaylistTracks([track("z", "Zebra"), track("a", "Apple"), track("m", "Mango")]);
    assert.deepEqual(
      ordered.map((item) => item.title),
      ["Apple", "Mango", "Zebra"],
    );
  });

  it("keeps an arranged playlist order", () => {
    const ordered = sortPlaylistTracks(
      [track("z", "Zebra"), track("a", "Apple"), track("m", "Mango")],
      new Map([
        ["z", 0],
        ["m", 1],
        ["a", 2],
      ]),
    );
    assert.deepEqual(
      ordered.map((item) => item.id),
      ["z", "m", "a"],
    );
  });

  it("uses numeric title order (2 before 19)", () => {
    const ordered = sortPlaylistTracks([track("b", "19 Jungle Sloak"), track("a", "2 Alien Forest")]);
    assert.deepEqual(
      ordered.map((item) => item.title),
      ["2 Alien Forest", "19 Jungle Sloak"],
    );
  });

  it("breaks title ties by artist then id", () => {
    assert.ok(compareTrackTitle(track("b", "Same", "Zed"), track("a", "Same", "Amy")) > 0);
  });
});
