import { commitSongMp3, stageSongMp3 } from "@/lib/desk-api";
import { putFileToR2 } from "@/lib/direct-upload";
import { mp3DurationSec } from "@/lib/mp3-duration";
import { wavToMp3 } from "@/lib/wav-mp3";

const MAX_WAV = 140 * 1024 * 1024;

/** Encode on this device, then upload. A long wav is not sent through the server, which is what made Convert hang. */
export async function convertWavOnThisDevice(input: {
  channelSlug: string;
  trackId: string;
  audioUrl: string;
  onProgress?: (label: string) => void;
}): Promise<Awaited<ReturnType<typeof commitSongMp3>>> {
  const say = input.onProgress ?? (() => undefined);
  say("Downloading the wav…");
  const response = await fetch(input.audioUrl, { redirect: "follow" });
  if (!response.ok) throw new Error(`Could not download the wav (${response.status})`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength < 64) throw new Error("That wav is empty");
  if (bytes.byteLength > MAX_WAV) throw new Error("That wav is over 140 MB");
  say("Encoding mp3… 0%");
  const mp3 = await wavToMp3(bytes, (ratio) => say(`Encoding mp3… ${Math.round(ratio * 100)}%`));
  say("Uploading the mp3…");
  const staged = await stageSongMp3({ data: { channelSlug: input.channelSlug, trackId: input.trackId } });
  await putFileToR2(staged.putUrl, new Blob([mp3 as BlobPart]), "audio/mpeg");
  const durationSec = Math.round(mp3DurationSec(mp3));
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
