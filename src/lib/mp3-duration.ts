const BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];

function textAt(bytes: Uint8Array, index: number, length: number): string {
  let out = "";
  for (let i = 0; i < length; i += 1) out += String.fromCharCode(bytes[index + i] ?? 0);
  return out;
}

/** Duration from a Xing/Info frame, or from a constant bitrate header plus the file size. Not ID3. */
export function mp3DurationSec(bytes: Uint8Array, totalBytes = bytes.byteLength): number {
  if (bytes.byteLength < 16) return 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let start = 0;
  if (textAt(bytes, 0, 3) === "ID3") {
    const size = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);
    start = 10 + size;
  }
  for (let i = start; i < bytes.length - 16; i += 1) {
    if (bytes[i] !== 0xff || (bytes[i + 1] & 0xe0) !== 0xe0) continue;
    const header = view.getUint32(i);
    const version = (header >> 19) & 3;
    const layer = (header >> 17) & 3;
    const rateIndex = (header >> 12) & 15;
    const sampleIndex = (header >> 10) & 3;
    const padding = (header >> 9) & 1;
    const channels = (header >> 6) & 3;
    if (version === 1 || layer !== 1 || rateIndex === 0 || rateIndex === 15 || sampleIndex === 3) continue;
    const bitrate = BITRATES[rateIndex] * 1000;
    const sampleRate = (version === 3 ? [44100, 48000, 32000] : version === 2 ? [22050, 24000, 16000] : [11025, 12000, 8000])[sampleIndex];
    const samples = version === 3 ? 1152 : 576;
    const frame = Math.floor((version === 3 ? 144 : 72) * bitrate / sampleRate) + padding;
    if (frame < 24) continue;
    const side = version === 3 ? (channels === 3 ? 17 : 32) : channels === 3 ? 9 : 17;
    const tagAt = i + 4 + side;
    if (tagAt + 12 <= bytes.length) {
      const tag = textAt(bytes, tagAt, 4);
      if (tag === "Xing" || tag === "Info") {
        const flags = view.getUint32(tagAt + 4);
        if (flags & 1) {
          const frames = view.getUint32(tagAt + 8);
          if (frames > 0 && sampleRate) return (frames * samples) / sampleRate;
        }
      }
    }
    if (i + frame + 1 < bytes.length && bytes[i + frame] === 0xff && (bytes[i + frame + 1] & 0xe0) === 0xe0 && bitrate > 0) {
      return (Math.max(0, totalBytes - i) * 8) / bitrate;
    }
  }
  return 0;
}
