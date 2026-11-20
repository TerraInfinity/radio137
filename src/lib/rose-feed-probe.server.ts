import { mp3DurationSec } from "@/lib/mp3-duration";
import type { RoseFeedFact } from "@/lib/rose-feed";
import { allowedMediaUrl } from "@/lib/media-host";

const TTL = 30 * 60 * 1000;
const cache = new Map<string, { at: number; fact: RoseFeedFact }>();
const inflight = new Map<string, Promise<RoseFeedFact>>();

const EMPTY: RoseFeedFact = { bytes: 0, durationSec: 0 };

async function probeOne(url: string): Promise<RoseFeedFact> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL) return hit.fact;
  const pending = inflight.get(url);
  if (pending) return pending;
  const job = (async () => {
    if (!allowedMediaUrl(url)) {
      cache.set(url, { at: Date.now(), fact: EMPTY });
      return EMPTY;
    }
    let bytes = 0;
    let durationSec = 0;
    try {
      const head = await fetch(url, { method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(8_000) });
      if (head.status < 300) bytes = Number(head.headers.get("content-length") || "0");
      if (!Number.isFinite(bytes) || bytes < 0) bytes = 0;
    } catch {
      bytes = 0;
    }
    if (url.split("?")[0].toLowerCase().endsWith(".mp3")) {
      try {
        const response = await fetch(url, {
          headers: { Range: "bytes=0-65535" },
          redirect: "manual",
          signal: AbortSignal.timeout(8_000),
        });
        if (response.status < 300) {
          const measured = mp3DurationSec(new Uint8Array(await response.arrayBuffer()), bytes || undefined);
          if (measured > 1) durationSec = measured;
        }
      } catch {
        durationSec = 0;
      }
    }
    const fact = { bytes: Math.round(bytes), durationSec };
    cache.set(url, { at: Date.now(), fact });
    return fact;
  })().finally(() => inflight.delete(url));
  inflight.set(url, job);
  return job;
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
