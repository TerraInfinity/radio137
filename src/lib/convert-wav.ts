import { commitSongMp3, stageSongMp3 } from "@/lib/desk-api";
import { putFileToR2 } from "@/lib/direct-upload";
import { mp3DurationSec } from "@/lib/mp3-duration";
import { wavToMp3 } from "@/lib/wav-mp3";

const MAX_WAV = 140 * 1024 * 1024;

async function readBody(response: Response, onBytes: (got: number, total: number) => void): Promise<Uint8Array> {
  const total = Number(response.headers.get("content-length") || "0");
  if (!response.body) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    onBytes(bytes.byteLength, bytes.byteLength);
    return bytes;
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value?.byteLength) continue;
    chunks.push(value);
    got += value.byteLength;
    onBytes(got, total);
  }
  const bytes = new Uint8Array(got);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

/** Encode on this device, then upload. A long wav is not sent through the server. */
export async function convertWavOnThisDevice(input: {
  channelSlug: string;
  trackId: string;
  audioUrl: string;
  onProgress?: (label: string, ratio: number) => void;
}): Promise<Awaited<ReturnType<typeof commitSongMp3>>> {
  const say = input.onProgress ?? (() => undefined);
  say("Downloading the wav…", 0.02);
  const response = await fetch(input.audioUrl, { redirect: "follow" });
  if (!response.ok) throw new Error(`Could not download the wav (${response.status})`);
  const bytes = await readBody(response, (got, total) => {
    const part = total > 0 ? Math.min(1, got / total) : 0;
    say(total > 0 ? `Downloading… ${Math.round(part * 100)}%` : "Downloading the wav…", 0.02 + part * 0.18);
  });
  if (bytes.byteLength < 64) throw new Error("That wav is empty");
  if (bytes.byteLength > MAX_WAV) throw new Error("That wav is over 140 MB");
  say("Encoding mp3… 0%", 0.2);
  const mp3 = await wavToMp3(bytes, (ratio) => say(`Encoding mp3… ${Math.round(ratio * 100)}%`, 0.2 + ratio * 0.72));
  say("Uploading the mp3…", 0.94);
  const staged = await stageSongMp3({ data: { channelSlug: input.channelSlug, trackId: input.trackId } });
  await putFileToR2(staged.putUrl, new Blob([mp3 as BlobPart]), "audio/mpeg");
  const durationSec = Math.round(mp3DurationSec(mp3));
  say("Saving the mp3…", 0.98);
  return commitSongMp3({
    data: {
      channelSlug: input.channelSlug,
      trackId: input.trackId,
      url: staged.url,
      key: staged.key,
      ...(durationSec > 1 ? { durationSec } : {}),
    },
  });
}
