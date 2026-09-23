import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decodeWav, transcodeToMp3, wavToMp3 } from "./audio-transcode.server.ts";

function wav16(samples: Int16Array, rate = 44100): Uint8Array {
  const dataSize = samples.length * 2;
  const buf = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buf);
  const write = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, dataSize, true);
  new Int16Array(buf, 44).set(samples);
  return new Uint8Array(buf);
}

function tone(frames = 2400): Int16Array {
  const pcm = new Int16Array(frames);
  for (let i = 0; i < frames; i += 1) pcm[i] = Math.round(Math.sin(i / 12) * 8000);
  return pcm;
}

describe("wav to mp3", () => {
  it("reads a 16-bit wav", () => {
    const decoded = decodeWav(wav16(tone()));
    assert.equal(decoded.channels, 1);
    assert.equal(decoded.sampleRate, 44100);
    assert.equal(decoded.pcm.length, 2400);
  });

  it("encodes a wav to an mp3 frame without ffmpeg", async () => {
    const mp3 = await wavToMp3(wav16(tone()));
    assert.ok(mp3.byteLength > 64);
    assert.equal(mp3[0], 0xff);
  });

  it("passes an mp3 through and converts wav when asked", async () => {
    const wav = wav16(tone());
    const mp3 = await transcodeToMp3(wav, "wav");
    assert.ok(mp3.byteLength > 64);
    assert.equal(await transcodeToMp3(mp3, "mp3"), mp3);
  });
});
