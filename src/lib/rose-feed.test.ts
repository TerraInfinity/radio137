import assert from "node:assert/strict";
import test from "node:test";
import { applePodcastUrl, roseFeedUrl, roseFeedXml } from "./rose-feed.ts";
import type { Catalog } from "./types.ts";

const catalog = {
  defaultSlug: "rose",
  channels: [
    {
      slug: "rose",
      name: "Rose",
      energy: "rite",
      mode: "fixed",
      kind: "fixed",
      cover: "/covers/rose.jpg",
      description: "Pretty eyes & the box",
      enabled: true,
      tracks: [
        {
          id: "twist",
          title: "twist me intro",
          artist: "Rose",
          durationSec: 90,
          audioUrl: "https://r2.terrainfinity.ca/radio/rose/twist me.mp3",
        },
        {
          id: "swoon",
          title: "Glaum Shrimp Prom - Swooning for Glaum's Attention",
          artist: "Rose",
          durationSec: 164,
          audioUrl: "https://r2.terrainfinity.ca/radio/rose/swoon.mp3",
        },
      ],
    },
  ],
} as Catalog;

test("rose feed is a serial podcast in catalog order", () => {
  const xml = roseFeedXml(catalog, "https://radio.terrainfinity.ca");
  assert.match(xml, /<itunes:type>serial<\/itunes:type>/);
  assert.match(xml, /application\/rss\+xml/);
  const swoon = xml.indexOf("Swooning");
  const twist = xml.indexOf("twist me intro");
  assert.ok(twist > 0 && swoon > twist);
  assert.match(xml, /<itunes:episode>1<\/itunes:episode>/);
  assert.match(xml, /radio\/rose\/twist%20me\.mp3/);
  assert.ok(xml.includes("Pretty eyes " + "&" + "amp; the box"));
  assert.equal(roseFeedUrl("https://radio.terrainfinity.ca/"), "https://radio.terrainfinity.ca/feeds/rose.xml");
  assert.equal(
    applePodcastUrl("https://radio.terrainfinity.ca/feeds/rose.xml"),
    "podcast:https://radio.terrainfinity.ca/feeds/rose.xml",
  );
});
