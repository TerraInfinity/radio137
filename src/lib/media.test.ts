import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isLoopingVisual, stationVisualSrc, visualSrc } from "./media.ts";

describe("station visual preference", () => {
  it("prefers videoUrl, then animationUrl, then cover", () => {
    assert.equal(
      stationVisualSrc({ videoUrl: "https://r2.example/a.mp4", animationUrl: "https://r2.example/b.webm", cover: "/covers/x.jpg" }),
      "https://r2.example/a.mp4",
    );
    assert.equal(
      stationVisualSrc({ videoUrl: "", animationUrl: "https://r2.example/b.webm", cover: "/covers/x.jpg" }),
      "https://r2.example/b.webm",
    );
    assert.equal(stationVisualSrc({ cover: "/covers/glaum-camp.jpg", animationUrl: "", videoUrl: "" }), "/covers/glaum-camp.jpg");
  });

  it("lets a song cover win, then falls through to station motion", () => {
    assert.equal(visualSrc({ coverUrl: "/covers/song.jpg" }, { cover: "/covers/station.jpg", animationUrl: "https://r2.example/loop.mp4" }), "/covers/song.jpg");
    assert.equal(visualSrc(null, { cover: "/covers/station.jpg", animationUrl: "https://r2.example/loop.mp4" }), "https://r2.example/loop.mp4");
  });

  it("detects looping files", () => {
    assert.equal(isLoopingVisual("https://r2.example/loop.mp4"), true);
    assert.equal(isLoopingVisual("/covers/glaum-camp.jpg"), false);
  });
});
