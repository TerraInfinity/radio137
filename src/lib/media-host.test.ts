import assert from "node:assert/strict";
import test from "node:test";
import { allowedMediaUrl } from "./media-host.ts";

test("media fetches stay on our public R2 host", () => {
  assert.equal(allowedMediaUrl("https://r2.terrainfinity.ca/radio/rose/a.mp3"), true);
  assert.equal(allowedMediaUrl("http://r2.terrainfinity.ca/radio/rose/a.mp3"), false);
  assert.equal(allowedMediaUrl("https://evil.example/radio/rose/a.mp3"), false);
  assert.equal(allowedMediaUrl("https://169.254.169.254/latest/meta-data"), false);
  assert.equal(allowedMediaUrl("https://r2.terrainfinity.ca.evil.com/a.mp3"), false);
  assert.equal(allowedMediaUrl("https://user:pass@r2.terrainfinity.ca/a.mp3"), false);
});
