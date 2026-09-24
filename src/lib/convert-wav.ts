import { commitSongMp3, stageSongMp3 } from "@/lib/desk-api";
import { putFileToR2 } from "@/lib/direct-upload";
import { mp3DurationSec } from "@/lib/mp3-duration";
import { wavToMp3 } from "@/lib/wav-mp3";

const MAX_WAV = 140 * 1024 * 1024;
const DOWNLOAD_STALL_MS = 25_000;
const ENCODE_STALL_MS = 120_000;
const UPLOAD_MS = 120_000;
const SERVER_MS = 30_000;

export class ConvertError extends Error {
  readonly detail: string;
  constructor(message: string, detail: string) {
    super(message);
    this.name = "ConvertError";
    this.detail = detail;
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "the file host";
  }
}

function mb(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function withTimeout<T>(work: Promise<T>, ms: number, message: string, detail: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new ConvertError(message, detail)), ms);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** Encode on this device, then upload. A step that stops moving is aborted with a reason. */
export async function convertWavOnThisDevice(input: {
  channelSlug: string;
  trackId: string;
  audioUrl: string;
  signal?: AbortSignal;
  onProgress?: (label: string, ratio: number) => void;
}): Promise<Awaited<ReturnType<typeof commitSongMp3>>> {
  const say = input.onProgress ?? (() => undefined);
  const signal = input.signal;
  const throwIfCancelled = () => {
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  };

  say("Downloading the wav…", 0.02);
  throwIfCancelled();
  let response: Response;
  try {
    response = await fetch(input.audioUrl, { redirect: "follow", signal });
  } catch (error) {
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    const reason = error instanceof Error ? error.message : "network error";
    throw new ConvertError("Could not start the download", `${reason} · ${hostOf(input.audioUrl)}`);
  }
  if (!response.ok) {
    throw new ConvertError(
      `Download failed (${response.status})`,
      `${response.status} ${response.statusText || "no status"} from ${hostOf(input.audioUrl)}`,
    );
  }
  const type = (response.headers.get("content-type") || "").toLowerCase();
  if (type.includes("text/html")) {
    throw new ConvertError("The download was a web page, not a wav", `Content-Type ${type} from ${hostOf(input.audioUrl)}`);
  }

  const total = Number(response.headers.get("content-length") || "0");
  let got = 0;
  const downloadAbort = new AbortController();
  const onOuter = () => downloadAbort.abort();
  signal?.addEventListener("abort", onOuter);
  let stallTimer = window.setTimeout(() => downloadAbort.abort(), DOWNLOAD_STALL_MS);
  const bumpDownload = () => {
    window.clearTimeout(stallTimer);
    stallTimer = window.setTimeout(() => downloadAbort.abort(), DOWNLOAD_STALL_MS);
  };

  let bytes: Uint8Array;
  try {
    bytes = await readBody(response, downloadAbort.signal, (next, fileTotal) => {
      got = next;
      bumpDownload();
      const part = fileTotal > 0 ? Math.min(1, next / fileTotal) : 0;
      say(fileTotal > 0 ? `Downloading… ${Math.round(part * 100)}%` : `Downloading… ${mb(next)}`, 0.02 + part * 0.18);
    });
  } catch (error) {
    window.clearTimeout(stallTimer);
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    if (downloadAbort.signal.aborted) {
      throw new ConvertError(
        "Download stalled",
        total > 0 ? `No data for 25s at ${mb(got)} of ${mb(total)} from ${hostOf(input.audioUrl)}` : `No data for 25s at ${mb(got)} from ${hostOf(input.audioUrl)}`,
      );
    }
    const reason = error instanceof Error ? error.message : "network error";
    throw new ConvertError("Download stopped", `${reason} at ${mb(got)} from ${hostOf(input.audioUrl)}`);
  } finally {
    window.clearTimeout(stallTimer);
    signal?.removeEventListener("abort", onOuter);
  }
  if (bytes.byteLength < 64) throw new ConvertError("That wav is empty", `${bytes.byteLength} bytes from ${hostOf(input.audioUrl)}`);
  if (bytes.byteLength > MAX_WAV) throw new ConvertError("That wav is over 140 MB", mb(bytes.byteLength));

  say("Encoding mp3… 0%", 0.2);
  let encodeStalled = false;
  let encodeTimer = window.setTimeout(() => {
    encodeStalled = true;
  }, ENCODE_STALL_MS);
  const bumpEncode = () => {
    window.clearTimeout(encodeTimer);
    encodeTimer = window.setTimeout(() => {
      encodeStalled = true;
    }, ENCODE_STALL_MS);
  };
  let mp3: Uint8Array;
  try {
    mp3 = await wavToMp3(bytes, (ratio) => {
      throwIfCancelled();
      if (encodeStalled) {
        throw new ConvertError("Encode stalled", `No progress for 2 minutes at ${Math.round(ratio * 100)}%. Keep this tab in the foreground and retry.`);
      }
      bumpEncode();
      say(`Encoding mp3… ${Math.round(ratio * 100)}%`, 0.2 + ratio * 0.72);
    });
  } catch (error) {
    window.clearTimeout(encodeTimer);
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    if (error instanceof ConvertError) throw error;
    const reason = error instanceof Error ? error.message : "encoder failed";
    throw new ConvertError("Could not encode the mp3", `${reason} · wav ${mb(bytes.byteLength)}`);
  }
  window.clearTimeout(encodeTimer);
  throwIfCancelled();
  if (mp3.byteLength < 64) throw new ConvertError("Encoder produced an empty mp3", `${mp3.byteLength} bytes from a ${mb(bytes.byteLength)} wav`);

  say("Uploading the mp3…", 0.94);
  let staged: Awaited<ReturnType<typeof stageSongMp3>>;
  try {
    staged = await withTimeout(
      stageSongMp3({ data: { channelSlug: input.channelSlug, trackId: input.trackId } }),
      SERVER_MS,
      "Could not get an upload link",
      "The desk did not answer within 30s.",
    );
  } catch (error) {
    if (error instanceof ConvertError) throw error;
    const reason = error instanceof Error ? error.message : "desk error";
    throw new ConvertError("Could not get an upload link", reason);
  }
  throwIfCancelled();
  const uploadAbort = new AbortController();
  const uploadTimer = window.setTimeout(() => uploadAbort.abort(), UPLOAD_MS);
  const stopUpload = () => uploadAbort.abort();
  signal?.addEventListener("abort", stopUpload);
  try {
    await putFileToR2(staged.putUrl, new Blob([mp3 as BlobPart]), "audio/mpeg", uploadAbort.signal);
  } catch (error) {
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    if (uploadAbort.signal.aborted) throw new ConvertError("Upload stalled", `No answer for 2 minutes while sending ${mb(mp3.byteLength)} to ${staged.key}`);
    const reason = error instanceof Error ? error.message : "upload failed";
    throw new ConvertError("Upload failed", `${reason} · ${staged.key} · ${mb(mp3.byteLength)}`);
  } finally {
    window.clearTimeout(uploadTimer);
    signal?.removeEventListener("abort", stopUpload);
  }

  const durationSec = Math.round(mp3DurationSec(mp3));
  say("Saving the mp3…", 0.98);
  try {
    return await withTimeout(
      commitSongMp3({
        data: {
          channelSlug: input.channelSlug,
          trackId: input.trackId,
          url: staged.url,
          key: staged.key,
          ...(durationSec > 1 ? { durationSec } : {}),
        },
      }),
      SERVER_MS,
      "The mp3 uploaded, but the playlist did not update",
      `${staged.key} is on R2. Save again to point the song at it.`,
    );
  } catch (error) {
    if (error instanceof ConvertError) throw error;
    const reason = error instanceof Error ? error.message : "save failed";
    throw new ConvertError("The mp3 uploaded, but the playlist did not update", `${reason} · ${staged.key}`);
  }
}

async function readBody(response: Response, signal: AbortSignal, onBytes: (got: number, total: number) => void): Promise<Uint8Array> {
  const total = Number(response.headers.get("content-length") || "0");
  if (!response.body) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    onBytes(bytes.byteLength, total || bytes.byteLength);
    return bytes;
  }
  const reader = response.body.getReader();
  const onAbort = () => {
    void reader.cancel().catch(() => undefined);
  };
  signal.addEventListener("abort", onAbort);
  const chunks: Uint8Array[] = [];
  let got = 0;
  try {
    for (;;) {
      if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
      const { done, value } = await reader.read();
      if (done) break;
      if (!value?.byteLength) continue;
      chunks.push(value);
      got += value.byteLength;
      onBytes(got, total);
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    signal.removeEventListener("abort", onAbort);
  }
  const bytes = new Uint8Array(got);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}
