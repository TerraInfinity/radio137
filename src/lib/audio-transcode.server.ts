import { execFile } from "node:child_process";
import { constants } from "node:fs";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { wavToMp3 } from "./wav-mp3.ts";

export { decodeWav, wavToMp3 } from "./wav-mp3.ts";

const MAX_AUDIO = 80 * 1024 * 1024;

export function audioExtension(urlOrName: string): string {
  const path = (urlOrName || "").split("?")[0]?.split("#")[0] ?? "";
  const name = path.split("/").pop() || "";
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "";
  return name.slice(dot + 1).toLowerCase();
}

export function isMp3Name(urlOrName: string): boolean {
  return audioExtension(urlOrName) === "mp3";
}

async function ffmpegBin(): Promise<string | null> {
  const candidates = [process.env.FFMPEG_PATH, "/usr/local/bin/ffmpeg", "/usr/bin/ffmpeg"].filter(Boolean) as string[];
  for (const path of candidates) {
    try {
      await access(path, constants.X_OK);
      return path;
    } catch {
      /* next */
    }
  }
  return null;
}

async function ffmpegToMp3(bytes: Uint8Array, ext: string): Promise<Uint8Array | null> {
  const bin = await ffmpegBin();
  if (!bin) return null;
  const safeExt = /^[a-z0-9]{1,5}$/.test(ext) ? ext : "bin";
  const dir = await mkdtemp(join(tmpdir(), "rose-mp3-"));
  const input = join(dir, `in.${safeExt}`);
  const output = join(dir, "out.mp3");
  try {
    await writeFile(input, bytes);
    await new Promise<void>((resolve, reject) => {
      execFile(
        bin,
        ["-hide_banner", "-loglevel", "error", "-y", "-i", input, "-codec:a", "libmp3lame", "-b:a", "192k", output],
        { timeout: 90_000, maxBuffer: 1024 * 1024 },
        (error) => (error ? reject(error) : resolve()),
      );
    });
    const mp3 = await readFile(output);
    if (mp3.byteLength < 64) throw new Error("Encoder produced an empty mp3");
    return mp3;
  } catch (error) {
    if (ext === "wav") return null;
    const message = error instanceof Error ? error.message : "ffmpeg failed";
    throw new Error(message.includes("ffmpeg") ? message : `Could not convert that ${ext} to mp3`);
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}

/** mp3 passes through. wav always converts. Other types need ffmpeg on the host. */
export async function transcodeToMp3(bytes: Uint8Array, ext: string): Promise<Uint8Array> {
  if (bytes.byteLength > MAX_AUDIO) throw new Error("That file is over 80 MB");
  const kind = (ext || "").toLowerCase().replace(/^\./, "");
  if (kind === "mp3") return bytes;
  const viaFfmpeg = await ffmpegToMp3(bytes, kind || "audio");
  if (viaFfmpeg) return viaFfmpeg;
  if (kind === "wav" || kind === "wave") return wavToMp3(bytes);
  throw new Error("This host can convert wav to mp3. Export an mp3, or upload a wav.");
}

/** 320 kbps stereo mp3 for the Apple feed. Requires ffmpeg. */
export async function encodeStereoMp3(bytes: Uint8Array, ext: string): Promise<Uint8Array> {
  if (bytes.byteLength > MAX_AUDIO) throw new Error("That file is over 80 MB");
  const bin = await ffmpegBin();
  if (!bin) throw new Error("ffmpeg is not on this host");
  const kind = (ext || "wav").toLowerCase().replace(/^\./, "");
  const safeExt = /^[a-z0-9]{1,5}$/.test(kind) ? kind : "bin";
  const dir = await mkdtemp(join(tmpdir(), "rose-320-"));
  const input = join(dir, `in.${safeExt}`);
  const output = join(dir, "out.mp3");
  try {
    await writeFile(input, bytes);
    await new Promise<void>((resolve, reject) => {
      execFile(
        bin,
        ["-hide_banner", "-loglevel", "error", "-y", "-i", input, "-codec:a", "libmp3lame", "-b:a", "320k", "-ac", "2", output],
        { timeout: 180_000, maxBuffer: 1024 * 1024 },
        (error) => (error ? reject(error) : resolve()),
      );
    });
    const mp3 = await readFile(output);
    if (mp3.byteLength < 64) throw new Error("Encoder produced an empty mp3");
    return mp3;
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}
