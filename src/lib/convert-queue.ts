import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getSeedCatalog } from "@/lib/catalog";
import { convertWavOnThisDevice } from "@/lib/convert-wav";
import { usePlayerStore } from "@/lib/player-store";
import { useSyncExternalStore } from "react";

export type ConvertJob = {
  id: string;
  title: string;
  channelSlug: string;
  trackId: string;
  audioUrl: string;
  state: "queued" | "active" | "done" | "error";
  ratio: number;
  label: string;
};

export type ConvertRequest = {
  title: string;
  channelSlug: string;
  trackId: string;
  audioUrl: string;
};

let jobs: ConvertJob[] = [];
let snapshot: ConvertJob[] = [];
let pumping = false;
const listeners = new Set<() => void>();
const doneListeners = new Set<() => void>();

function emit() {
  snapshot = jobs.map((job) => ({ ...job }));
  for (const listener of listeners) listener();
}

function patch(id: string, next: Partial<ConvertJob>) {
  jobs = jobs.map((job) => (job.id === id ? { ...job, ...next } : job));
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useConvertQueue(): ConvertJob[] {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}

export function onConvertFinished(listener: () => void) {
  doneListeners.add(listener);
  return () => {
    doneListeners.delete(listener);
  };
}

export function jobFor(channelSlug: string, trackId: string): ConvertJob | undefined {
  return snapshot.find((job) => job.channelSlug === channelSlug && job.trackId === trackId);
}

/** Add wavs to the one-at-a-time queue. A file already waiting or running is left as it is. */
export function enqueueWavConverts(items: ConvertRequest[]): number {
  let added = 0;
  for (const item of items) {
    if (!item.audioUrl || !item.trackId) continue;
    const id = `${item.channelSlug}:${item.trackId}`;
    const existing = jobs.find((job) => job.id === id);
    if (existing && (existing.state === "queued" || existing.state === "active")) continue;
    jobs = jobs.filter((job) => job.id !== id);
    jobs.push({ ...item, id, state: "queued", ratio: 0, label: "Queued" });
    added += 1;
  }
  if (added) emit();
  void pump();
  return added;
}

export function removeQueuedConvert(id: string) {
  const job = jobs.find((item) => item.id === id);
  if (!job || job.state !== "queued") return;
  jobs = jobs.filter((item) => item.id !== id);
  emit();
}

export function clearSettledConverts() {
  jobs = jobs.filter((job) => job.state === "queued" || job.state === "active");
  emit();
}

async function pump() {
  if (pumping) return;
  pumping = true;
  try {
    for (;;) {
      const next = jobs.find((job) => job.state === "queued");
      if (!next) break;
      patch(next.id, { state: "active", ratio: 0, label: "Starting…" });
      try {
        const result = await convertWavOnThisDevice({
          channelSlug: next.channelSlug,
          trackId: next.trackId,
          audioUrl: next.audioUrl,
          onProgress: (label, ratio) => patch(next.id, { label, ratio }),
        });
        if (result.tracks) {
          usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations ?? []));
        }
        patch(next.id, { state: "done", ratio: 1, label: "Mp3 is in" });
        for (const listener of doneListeners) listener();
      } catch (error) {
        const label = error instanceof Error ? error.message : "Could not convert";
        patch(next.id, { state: "error", label });
        for (const listener of doneListeners) listener();
      }
    }
  } finally {
    pumping = false;
  }
}
