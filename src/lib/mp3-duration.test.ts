import assert from "node:assert/strict";
import test from "node:test";
import { mp3DurationSec } from "./mp3-duration.ts";

test("xing frame count is the duration", () => {
  const bytes = new Uint8Array(80);
  bytes[0] = 0xff;
  bytes[1] = 0xfb;
  bytes[2] = 0x90;
  bytes[3] = 0x00;
  bytes.set([0x49, 0x6e, 0x66, 0x6f], 36);
  const view = new DataView(bytes.buffer);
  view.setUint32(40, 1);
  view.setUint32(44, 1000);
  const seconds = mp3DurationSec(bytes, 80);
  assert.ok(Math.abs(seconds - (1000 * 1152) / 44100) < 0.01);
});
