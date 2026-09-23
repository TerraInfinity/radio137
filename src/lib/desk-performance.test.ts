import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { performanceNotes } from "./desk-performance.ts";
import type { Channel, Track } from "./types.ts";

function track(patch: Partial<Track> & Pick<Track, "id" | "title" | "audioUrl">): Track {
  return { artist: "Rose", durationSec: 30, ...patch };
}

function channel(slug: string, tracks: Track[]): Channel {
  return {
    slug,
    name: slug,
    energy: "",
    mode: "ondemand",
    kind: "ondemand",
    cover: "",
    description: "",
    enabled: true,
    tags: [],
    category: "",
    featured: false,
    claimable: false,
    skin: "",
    nsfw: false,
    tracks,
  };
}

describe("desk performance notes", () => {
  it("asks for an mp3 when a song is still a wav, once per file", () => {
    const notes = performanceNotes([
      channel("rose", [
        track({ id: "a", title: "Voice ON!", audioUrl: "https://cdn.example/rose/voice.wav" }),
        track({ id: "b", title: "Soft Shell", audioUrl: "https://cdn.example/rose/shell.mp3" }),
      ]),
      channel("glaum", [track({ id: "c", title: "Voice ON!", audioUrl: "https://cdn.example/rose/voice.wav" })]),
    ]);
    const wavs = notes.filter((note) => note.action?.kind === "convert" && note.id.startsWith("fmt:"));
    assert.equal(wavs.length, 1);
    assert.equal(wavs[0]?.action?.trackId, "a");
    assert.match(wavs[0]?.steps ?? "", /original file stays/i);
  });

  it("asks to share one file when the same song points at two urls", () => {
    const notes = performanceNotes([
      channel("rose", [track({ id: "a", title: "Pretty Face, Pretty Eyes Sweetie", audioUrl: "https://cdn.example/a.mp3" })]),
      channel("glaum", [track({ id: "b", title: "Pretty Face, Pretty Eyes Sweetie", audioUrl: "https://cdn.example/b.mp3" })]),
    ]);
    const split = notes.find((note) => note.id.startsWith("split:"));
    assert.equal(split?.action?.kind, "share");
    assert.equal(split?.action?.trackId, "a");
  });

  it("stays quiet when every copy is already one mp3", () => {
    const notes = performanceNotes([
      channel("rose", [track({ id: "a", title: "Voice ON!", audioUrl: "https://cdn.example/voice.mp3" })]),
      channel("glaum", [track({ id: "b", title: "Voice ON!", audioUrl: "https://cdn.example/voice.mp3" })]),
    ]);
    assert.deepEqual(notes, []);
  });
});
