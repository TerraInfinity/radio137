import assert from "node:assert/strict";
import test from "node:test";
import { applePodcastUrl, roseFeedUrl, roseFeedXml, selectRoseFeed, type RoseFeedFact } from "./rose-feed.ts";
import type { Catalog, Track } from "./types.ts";

function track(id: string, title: string, url: string, duration = 60): Track {
  return { id, title, artist: "Rose", durationSec: duration, audioUrl: url };
}

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
        track("twist", "twist me intro", "https://r2.terrainfinity.ca/radio/rose/twist me.mp3", 60),
        track("swoon", "Glaum Shrimp Prom - Swooning for Glaum's Attention", "https://r2.terrainfinity.ca/radio/rose/swoon.mp3", 60),
        track("swoon-wav", "Glaum Shrimp Prom - Swooning for Glaum's Attention", "https://r2.terrainfinity.ca/radio/rose/swoon.wav", 164),
        track("copy", "twist me intro", "https://r2.terrainfinity.ca/radio/rose/twist-copy.mp3", 60),
      ],
    },
  ],
} as Catalog;

const facts: Record<string, RoseFeedFact> = {
  twist: { bytes: 440000, durationSec: 90 },
  swoon: { bytes: 900000, durationSec: 164 },
  "swoon-wav": { bytes: 2000000, durationSec: 164 },
  copy: { bytes: 440000, durationSec: 90 },
};

test("rose feed is a serial podcast of probed mp3s", () => {
  const xml = roseFeedXml(catalog, "https://radio.terrainfinity.ca", facts);
  assert.match(xml, /<itunes:type>serial<\/itunes:type>/);
  assert.match(xml, /application\/rss\+xml/);
  assert.match(xml, /cover-3000\.jpg/);
  assert.equal(xml.includes("hero.jpg"), false);
  assert.equal(xml.includes(".wav"), false);
  assert.match(xml, /<itunes:email>career@terrainfinity\.ca<\/itunes:email>/);
  assert.match(xml, /length="440000"/);
  assert.match(xml, /<itunes:duration>00:01:30<\/itunes:duration>/);
  assert.equal(xml.includes("00:01:00"), false);
  assert.match(xml, /<guid isPermaLink="false">tag:radio\.terrainfinity\.ca,2026:rose:twist<\/guid>/);
  const swoon = xml.indexOf("Swooning");
  const twist = xml.indexOf("twist me intro");
  assert.ok(twist > 0 && swoon > twist);
  assert.equal(xml.split("twist me intro").length - 1, 2);
  assert.match(xml, /radio\/rose\/twist%20me\.mp3/);
  assert.ok(xml.includes("Pretty eyes " + "&" + "amp; the box"));
  assert.equal(selectRoseFeed(catalog.channels[0].tracks, facts).map((item) => item.id).join(","), "twist,swoon");
  assert.equal(roseFeedUrl("https://radio.terrainfinity.ca/"), "https://radio.terrainfinity.ca/feeds/rose.xml");
  assert.equal(applePodcastUrl("https://radio.terrainfinity.ca/feeds/rose.xml"), "podcast:https://radio.terrainfinity.ca/feeds/rose.xml");
});
