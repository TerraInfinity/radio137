import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ROSE_RITE, orderStationTracks, roseRiteIndex, sameSongTitle, sortRoseRite } from "./rose-rite.ts";

function row(id: string, title: string) {
  return { id, title, artist: "Rose" };
}

describe("rose rite order", () => {
  it("maps each rite title onto its slot, including the skipped numbers", () => {
    ROSE_RITE.forEach((title, index) => {
      assert.equal(roseRiteIndex(title), index, title);
    });
    assert.equal(ROSE_RITE.length, 22);
  });

  it("keeps voice lanes and the two remembers apart", () => {
    const titles = ["Voice C___", "Voice Co__", "Voice Coc_", "Voice Coc_y", "Voice NO!", "Voice ON!", "Voice Check ♔ M8ternity"];
    const indexes = titles.map((title) => roseRiteIndex(title));
    assert.equal(new Set(indexes).size, titles.length);
    assert.notEqual(roseRiteIndex("Rose Remembers!"), roseRiteIndex("Rose Remembers 2"));
    assert.notEqual(roseRiteIndex("Glaum Shrimp Prom - Swooning for Glaum's Attention"), roseRiteIndex("Glaum Shrimp Prom Shake That Bootie"));
  });

  it("sorts the rite first and leaves extra songs after it", () => {
    const shuffled = [
      row("elf", ROSE_RITE[21]),
      row("war", "Time War 2137"),
      row("boot", ROSE_RITE[17]),
      row("bas", "The Basilisk"),
      row("swoon", ROSE_RITE[0]),
      row("on", "Voice ON!"),
      row("manual", "Lady Glaum's Chaos Manual"),
    ];
    const ordered = sortRoseRite(shuffled).map((item) => item.id);
    assert.deepEqual(ordered, ["swoon", "manual", "boot", "on", "elf", "bas", "war"]);
  });

  it("uses the rite for Rose until a desk Arrange lock exists", () => {
    const tracks = [row("elf", ROSE_RITE[21]), row("swoon", ROSE_RITE[0]), row("twist", ROSE_RITE[4])];
    assert.deepEqual(
      orderStationTracks("rose", "fixed", tracks).map((item) => item.id),
      ["swoon", "twist", "elf"],
    );
    assert.deepEqual(
      orderStationTracks(
        "rose",
        "fixed",
        tracks,
        new Map([
          ["elf", 0],
          ["twist", 1],
          ["swoon", 2],
        ]),
      ).map((item) => item.id),
      ["elf", "twist", "swoon"],
    );
  });

  it("does not reorder other fixed stations", () => {
    const tracks = [row("b", "Zebra"), row("a", "Apple")];
    assert.deepEqual(
      orderStationTracks("glaum", "fixed", tracks).map((item) => item.id),
      ["b", "a"],
    );
    assert.deepEqual(orderStationTracks("glaum", "live", tracks).map((item) => item.title), ["Apple", "Zebra"]);
  });

  it("treats the same rite song as one file even when the title spelling drifts", () => {
    assert.equal(sameSongTitle("Voice C___", "Voice C"), true);
    assert.equal(sameSongTitle("Voice C___", "Voice Co__"), false);
    assert.equal(sameSongTitle("twist me intro", "Twist It Intro"), true);
    assert.equal(sameSongTitle("Time War 2137", "Time War 2137"), true);
    assert.equal(sameSongTitle("Time War 2137", "The Basilisk"), false);
    assert.equal(sameSongTitle("Rose Remembers!", "Rose Remembers 2"), false);
  });
});
