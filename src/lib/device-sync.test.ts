import assert from "node:assert/strict";
import test from "node:test";
import { appleShowLinks, decodeSyncTag, encodeSyncTag, feedFor, offerFor, siriFor } from "./device-sync.ts";

test("device sync stays off until an admin turns it on, except Rose", () => {
  assert.equal(offerFor({ slug: "official-glaum-frequency", tags: [] }).enabled, false);
  assert.equal(offerFor({ slug: "rose", tags: [] }).enabled, true);
  assert.equal(offerFor(undefined).enabled, false);
  const saved = decodeSyncTag(encodeSyncTag({ enabled: false, appleUrl: "http://nope", feedUrl: "notes", siriName: "Play Glaum" }));
  assert.equal(saved?.enabled, false);
  assert.equal(saved?.appleUrl, "");
  assert.equal(saved?.siriName, "Play Glaum");
  assert.equal(offerFor({ slug: "rose", tags: [encodeSyncTag({ enabled: false, appleUrl: "", feedUrl: "", siriName: "" })] }).enabled, false);
});

test("the Apple button is the catalog show, never the feed file", () => {
  const links = appleShowLinks("https://podcasts.apple.com/us/podcast/rose/id6815476712");
  assert.equal(links?.page, "https://podcasts.apple.com/us/podcast/rose/id6815476712");
  assert.equal(links?.app, "podcasts://podcasts.apple.com/podcast/id6815476712");
  assert.equal(links?.page.includes("rose.xml"), false);
  assert.equal(appleShowLinks("https://radio.terrainfinity.ca/feeds/rose.xml"), null);
});

test("a pasted feed wins, and Rose keeps its own feed", () => {
  const custom = "https://example.com/show.xml";
  assert.equal(feedFor("rose", "https://radio.terrainfinity.ca", { enabled: true, appleUrl: "", feedUrl: custom, siriName: "" }), custom);
  assert.equal(feedFor("rose", "https://radio.terrainfinity.ca/", { enabled: true, appleUrl: "", feedUrl: "", siriName: "" }), "https://radio.terrainfinity.ca/feeds/rose.xml");
  assert.equal(feedFor("glaum", "https://radio.terrainfinity.ca", { enabled: true, appleUrl: "", feedUrl: "", siriName: "" }), "");
  assert.equal(siriFor("Official Glaum Frequency", "official-glaum-frequency", { enabled: true, appleUrl: "", feedUrl: "", siriName: "" }), "Play Glaum");
});
