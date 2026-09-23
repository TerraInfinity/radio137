import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { lyricsForTitle, pairLyrics, stageLinesFromLyrics, sunoPlaylistId } from "./stage-lines.ts";

describe("stage lines", () => {
  it("drops section marks and keeps sung lines", () => {
    const lines = stageLinesFromLyrics("[Verse]\nPretty face, pretty eyes\n(whisper)\nI will always find you\nPretty face, pretty eyes");
    assert.deepEqual(lines, ["Pretty face, pretty eyes", "I will always find you"]);
  });

  it("reads the Suno playlist id", () => {
    assert.equal(sunoPlaylistId("https://suno.com/playlist/7d00e6dd-8c95-4460-97d2-858797b6e928"), "7d00e6dd-8c95-4460-97d2-858797b6e928");
    assert.equal(sunoPlaylistId("https://example.com/lyrics"), null);
  });

  it("knows Rose Remembers from the lyric bank", () => {
    const lines = lyricsForTitle("Rose Remembers!");
    assert.ok(lines?.some((line) => /paradise is in our hands/i.test(line)));
  });

  it("skips a hand-edited song unless forced", () => {
    const tracks = [{ id: "a", title: "Rose Remembers!", tags: ["lines:hand"] }];
    const clips = [{ title: "Rose Remembers!", lyrics: "Paradise is in our hands" }];
    assert.equal(pairLyrics(tracks, clips).length, 0);
    assert.equal(pairLyrics(tracks, clips, true).length, 1);
  });
});
