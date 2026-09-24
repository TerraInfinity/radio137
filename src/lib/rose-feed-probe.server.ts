import { execFile } from "node:child_process";
import { access, constants } from "node:fs/promises";
import { mp3DurationSec } from "@/lib/mp3-duration";
import type { RoseFeedFact } from "@/lib/rose-feed";

const TTL = 30 * 60 * 1000;
const cache = new Map<string, { at: number; fact: RoseFeedFact }>();

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

function clockToSeconds(text: string): number {
  const match = text.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

async function probeDuration(url: string, bytes: number): Promise<number> {
  if (url.split("?")[0].toLowerCase().endsWith(".mp3")) {
    try {
      const response = await fetch(url, {
        headers: { Range: "bytes=0-262143" },
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
      });
      if (response.ok) {
        const measured = mp3DurationSec(new Uint8Array(await response.arrayBuffer()), bytes || undefined);
        if (measured > 1) return measured;
      }
    } catch {
      /* header probe failed */
    }
  }
  const bin = await ffmpegBin();
  if (!bin) return 0;
  const stderr = await new Promise<string>((resolve) => {
    execFile(
      bin,
      ["-hide_banner", "-probesize", "65536", "-analyzeduration", "0", "-i", url, "-f", "null", "-"],
      { timeout: 25_000, maxBuffer: 1_000_000 },
      (error, _stdout, err) => resolve(`${err || ""}${error instanceof Error ? error.message : ""}`),
    );
  });
  return clockToSeconds(stderr);
}

async function probeOne(url: string): Promise<RoseFeedFact> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL) return hit.fact;
  let bytes = 0;
  try {
    const head = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(12_000) });
    bytes = Number(head.headers.get("content-length") || "0");
    if (!Number.isFinite(bytes) || bytes < 0) bytes = 0;
  } catch {
    bytes = 0;
  }
  let durationSec = 0;
  try {
    durationSec = await probeDuration(url, bytes);
  } catch {
    durationSec = 0;
  }
  const fact = { bytes: Math.round(bytes), durationSec };
  if (fact.bytes > 0 && fact.durationSec > 0) cache.set(url, { at: Date.now(), fact });
  return fact;
}

export async function loadRoseFeedFacts(tracks: { id: string; audioUrl: string }[]): Promise<Record<string, RoseFeedFact>> {
  const facts: Record<string, RoseFeedFact> = {};
  const queue = [...tracks];
  async function worker() {
    for (;;) {
      const track = queue.shift();
      if (!track?.audioUrl) return;
      facts[track.id] = await probeOne(track.audioUrl);
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
  return facts;
}
