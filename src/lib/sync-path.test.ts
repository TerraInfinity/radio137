import assert from "node:assert/strict";
import test from "node:test";
import { detectSyncPath, parseSyncPath, syncAddUrl, syncPageUrl } from "./sync-path.ts";

test("sync path detects the device and never points a QR at the feed", () => {
  assert.equal(detectSyncPath("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)"), "apple");
  assert.equal(detectSyncPath("Mozilla/5.0 (Linux; Android 14)"), "android");
  assert.equal(detectSyncPath("Mozilla/5.0 (Macintosh)"), "computer");
  assert.equal(parseSyncPath("apple"), "apple");
  assert.equal(parseSyncPath("xml"), undefined);
  assert.equal(syncPageUrl("https://radio.terrainfinity.ca/", "rose"), "https://radio.terrainfinity.ca/sync/rose");
  assert.equal(syncPageUrl("https://radio.terrainfinity.ca", "rose", "apple"), "https://radio.terrainfinity.ca/sync/rose?path=apple");
  assert.equal(
    syncPageUrl("https://radio.terrainfinity.ca", "rose", "apple", "radio"),
    "https://radio.terrainfinity.ca/sync/rose?path=apple&tab=radio",
  );
  assert.equal(syncAddUrl("https://radio.terrainfinity.ca/", "rose"), "https://radio.terrainfinity.ca/sync/rose/add");
  assert.equal(syncAddUrl("https://radio.terrainfinity.ca", "rose").includes("xml"), false);
  assert.equal(syncPageUrl("https://radio.terrainfinity.ca", "rose", "apple", "siri"), "https://radio.terrainfinity.ca/sync/rose?path=apple&tab=siri");
  assert.equal(syncPageUrl("https://radio.terrainfinity.ca", "rose", "apple", "siri").includes("xml"), false);
});
