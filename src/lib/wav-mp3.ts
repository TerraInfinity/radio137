const LAME_RATES = new Set([8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000]);

function readStr(view: DataView, offset: number, length: number): string {
  let out = "";
  for (let i = 0; i < length; i += 1) out += String.fromCharCode(view.getUint8(offset + i));
  return out;
}

function clamp16(value: number): number {
  if (value > 32767) return 32767;
  if (value < -32768) return -32768;
  return value | 0;
}

/** PCM wav (16/24/32-bit or float) to interleaved 16-bit. Other codecs throw. */
export function decodeWav(bytes: Uint8Array): { sampleRate: number; channels: number; pcm: Int16Array } {
  if (bytes.byteLength < 44) throw new Error("That wav is too small to read");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (readStr(view, 0, 4) !== "RIFF" || readStr(view, 8, 4) !== "WAVE") throw new Error("That file is not a wav");
  let offset = 12;
  let audioFormat = 1;
  let channels = 0;
  let sampleRate = 0;
  let bits = 16;
  let dataOffset = -1;
  let dataSize = 0;
  while (offset + 8 <= view.byteLength) {
    const id = readStr(view, offset, 4);
    const size = view.getUint32(offset + 4, true);
    const start = offset + 8;
    if (id === "fmt ") {
      audioFormat = view.getUint16(start, true);
      channels = view.getUint16(start + 2, true);
      sampleRate = view.getUint32(start + 4, true);
      bits = view.getUint16(start + 14, true);
      if (audioFormat === 0xfffe && start + 26 <= view.byteLength) {
        bits = view.getUint16(start + 18, true) || bits;
        audioFormat = view.getUint16(start + 24, true);
      }
    } else if (id === "data") {
      dataOffset = start;
      dataSize = Math.min(size, view.byteLength - start);
      break;
    }
    offset = start + size + (size % 2);
  }
  if (dataOffset < 0 || channels < 1 || channels > 8 || sampleRate < 8000) throw new Error("Could not read that wav");
  if (audioFormat !== 1 && audioFormat !== 3) throw new Error("That wav is not plain PCM. Export an mp3, or use a wav.");
  const bytesPer = audioFormat === 3 ? 4 : Math.ceil(bits / 8);
  const frames = Math.floor(dataSize / (bytesPer * channels));
  if (frames < 1) throw new Error("That wav has no audio");
  const pcm = new Int16Array(frames * channels);
  for (let i = 0; i < frames * channels; i += 1) {
    const at = dataOffset + i * bytesPer;
    let sample = 0;
    if (audioFormat === 3) sample = view.getFloat32(at, true) * 32767;
    else if (bits <= 8) sample = (view.getUint8(at) - 128) << 8;
    else if (bits <= 16) sample = view.getInt16(at, true);
    else if (bits <= 24) {
      const b0 = view.getUint8(at);
      const b1 = view.getUint8(at + 1);
      const b2 = view.getUint8(at + 2);
      let val = (b2 << 16) | (b1 << 8) | b0;
      if (val & 0x800000) val |= ~0xffffff;
      sample = val >> 8;
    } else sample = view.getInt32(at, true) >> 16;
    pcm[i] = clamp16(sample);
  }
  return { sampleRate, channels, pcm };
}

function toStereo(pcm: Int16Array, channels: number): { pcm: Int16Array; channels: number } {
  if (channels === 1 || channels === 2) return { pcm, channels };
  const frames = Math.floor(pcm.length / channels);
  const out = new Int16Array(frames * 2);
  for (let i = 0; i < frames; i += 1) {
    out[i * 2] = pcm[i * channels] ?? 0;
    out[i * 2 + 1] = pcm[i * channels + 1] ?? pcm[i * channels] ?? 0;
  }
  return { pcm: out, channels: 2 };
}

function resample(pcm: Int16Array, channels: number, from: number, to: number): Int16Array {
  if (from === to) return pcm;
  const frames = Math.floor(pcm.length / channels);
  const nextFrames = Math.max(1, Math.round((frames * to) / from));
  const out = new Int16Array(nextFrames * channels);
  for (let i = 0; i < nextFrames; i += 1) {
    const src = (i * from) / to;
    const i0 = Math.min(frames - 1, Math.floor(src));
    const i1 = Math.min(frames - 1, i0 + 1);
    const t = src - i0;
    for (let c = 0; c < channels; c += 1) {
      const a = pcm[i0 * channels + c] ?? 0;
      const b = pcm[i1 * channels + c] ?? 0;
      out[i * channels + c] = clamp16(a + (b - a) * t);
    }
  }
  return out;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const len = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(len);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** Pure-JS wav → mp3. Runs in the browser so a long file is not cut off by the server. */
export async function wavToMp3(bytes: Uint8Array, onProgress?: (ratio: number) => void): Promise<Uint8Array> {
  const decoded = decodeWav(bytes);
  let { pcm, channels } = toStereo(decoded.pcm, decoded.channels);
  let rate = decoded.sampleRate;
  if (!LAME_RATES.has(rate)) {
    pcm = resample(pcm, channels, rate, 44100);
    rate = 44100;
  }
  const { Mp3Encoder } = await import("@breezystack/lamejs");
  const encoder = new Mp3Encoder(channels, rate, 192);
  const block = 1152;
  const frames = Math.floor(pcm.length / channels);
  const parts: Uint8Array[] = [];
  const left = new Int16Array(block);
  const right = new Int16Array(block);
  for (let frame = 0; frame < frames; frame += block) {
    const count = Math.min(block, frames - frame);
    for (let i = 0; i < count; i += 1) {
      left[i] = pcm[(frame + i) * channels] ?? 0;
      if (channels > 1) right[i] = pcm[(frame + i) * channels + 1] ?? 0;
    }
    const leftChunk = count === block ? left : left.subarray(0, count);
    const rightChunk = channels > 1 ? (count === block ? right : right.subarray(0, count)) : undefined;
    const mp3 = encoder.encodeBuffer(leftChunk, rightChunk);
    if (mp3.length) parts.push(Uint8Array.from(mp3));
    if (onProgress && frame % (block * 32) === 0) {
      onProgress(frames ? frame / frames : 1);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
  const end = encoder.flush();
  if (end.length) parts.push(Uint8Array.from(end));
  if (!parts.length) throw new Error("Encoder produced an empty mp3");
  onProgress?.(1);
  return concat(parts);
}
