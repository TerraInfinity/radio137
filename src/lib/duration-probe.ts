/** Read real file length from metadata. Catalog slots are often 8s (stings) or 60s (desk add). */
import { useEffect, useSyncExternalStore } from "react";
import { isFiniteAudioUrl } from "@/lib/audio-cache-policy";
import { isStubDuration } from "@/lib/duration-policy";
import { mediaUrl } from "@/lib/media";
import { durationGeneration, hasMeasuredDuration, rememberDuration, slotDuration, subscribeDurations } from "@/lib/playback";
import type { Track } from "@/lib/types";

const queued: Track[] = [];
const pending = new Set<string>();
let pumping = false;

export function needsDurationProbe(track: Pick<Track, "id" | "audioUrl" | "durationSec">): boolean {
  if (hasMeasuredDuration(track.id)) return false;
  if (!isFiniteAudioUrl(track.audioUrl)) return false;
  const slot = slotDuration(track as Track);
  return isStubDuration(slot);
}

export function probeAudioDuration(src: string | File): Promise<number> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || typeof Audio === "undefined") {
      reject(new Error("no audio"));
      return;
    }
    const el = new Audio();
    el.preload = "metadata";
    const objectUrl = src instanceof File ? URL.createObjectURL(src) : "";
    const url = src instanceof File ? objectUrl : mediaUrl(src);
    let settled = false;
    const finish = (err?: Error, value?: number) => {
      if (settled) return;
      settled = true;
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("error", onErr);
      window.clearTimeout(timer);
      el.removeAttribute("src");
      try {
        el.load();
      } catch {
        /* ignore */
      }
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (err || !(value && Number.isFinite(value))) reject(err ?? new Error("no duration"));
      else resolve(value);
    };
    const onMeta = () => {
      const duration = el.duration;
      if (Number.isFinite(duration) && duration > 0.2) finish(undefined, duration);
      else finish(new Error("empty duration"));
    };
    const onErr = () => finish(new Error("probe failed"));
    const timer = window.setTimeout(() => finish(new Error("probe timeout")), 8000);
    el.addEventListener("loadedmetadata", onMeta, { once: true });
    el.addEventListener("error", onErr, { once: true });
    el.src = url;
    el.load();
  });
}

function pump() {
  if (pumping) return;
  const track = queued.shift();
  if (!track) return;
  pumping = true;
  pending.add(track.id);
  void probeAudioDuration(track.audioUrl)
    .then((seconds) => rememberDuration(track.id, seconds))
    .catch(() => {
      /* keep the catalog slot */
    })
    .finally(() => {
      pending.delete(track.id);
      pumping = false;
      if (queued.length) window.setTimeout(pump, 120);
    });
}

export function requestDurations(tracks: Array<Pick<Track, "id" | "audioUrl" | "durationSec">>) {
  if (typeof window === "undefined") return;
  for (const track of tracks) {
    if (!needsDurationProbe(track)) continue;
    if (pending.has(track.id)) continue;
    if (queued.some((item) => item.id === track.id)) continue;
    queued.push(track as Track);
  }
  pump();
}

export function useDurationClock(tracks: Array<Pick<Track, "id" | "audioUrl" | "durationSec">>) {
  const generation = useSyncExternalStore(subscribeDurations, durationGeneration, durationGeneration);
  const key = tracks.map((track) => track.id).join("|");
  useEffect(() => {
    requestDurations(tracks);
  }, [key, tracks]);
  return generation;
}
