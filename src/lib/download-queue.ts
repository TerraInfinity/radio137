import { useSyncExternalStore } from "react";
import { formatBytes, totalFromResponse } from "@/lib/download-bytes";

export { formatBytes, totalFromResponse };

export type GrabState = "queued" | "active" | "kept" | "saved" | "error";

export type Grab = {
  id: string;
  slug: string;
  title: string;
  url: string;
  fileName: string;
  state: GrabState;
  received: number;
  total: number;
  detail: string;
};

export type GrabRequest = { title: string; url: string; fileName: string };

const STALL_MS = 20_000;
const STORE = "radio.audio-grabs";

let jobs: Grab[] = [];
let snapshot: Grab[] = [];
let pumping = false;
let activeAbort: AbortController | null = null;
let userFolder: FileSystemDirectoryHandle | null = null;
const listeners = new Set<() => void>();

function emit() {
  snapshot = jobs.map((job) => ({ ...job }));
  for (const listener of listeners) listener();
  try {
    localStorage.setItem(STORE, JSON.stringify(jobs));
  } catch {
    /* the bytes still sit in the browser store */
  }
}

function patch(id: string, next: Partial<Grab>) {
  jobs = jobs.map((job) => (job.id === id ? { ...job, ...next } : job));
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useGrabs(): Grab[] {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}

function load() {
  if (typeof localStorage === "undefined") return;
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) || "[]") as Grab[];
    if (!Array.isArray(raw)) return;
    jobs = raw
      .filter((job) => job && typeof job.id === "string" && typeof job.url === "string")
      .map((job) => ({ ...job, state: job.state === "active" ? "queued" : job.state, detail: job.detail || "" }));
    snapshot = jobs.map((job) => ({ ...job }));
  } catch {
    jobs = [];
  }
}

load();

async function storeRoot(slug: string) {
  const root = await navigator.storage.getDirectory();
  const grabs = await root.getDirectoryHandle("radio-grabs", { create: true });
  return grabs.getDirectoryHandle(slug.replace(/[^a-z0-9_-]+/gi, "-").slice(0, 80) || "station", { create: true });
}

async function openPartial(slug: string, fileName: string) {
  const dir = await storeRoot(slug);
  return dir.getFileHandle(fileName, { create: true });
}

async function readGrabFile(job: Grab): Promise<File> {
  const handle = await openPartial(job.slug, job.fileName);
  const file = await handle.getFile();
  return new File([file], job.fileName, { type: file.type || "audio/mpeg" });
}

async function pull(job: Grab, signal: AbortSignal, onProgress: (received: number, total: number) => void) {
  const handle = await openPartial(job.slug, job.fileName);
  const existing = await handle.getFile();
  let start = existing.size;
  if (job.total > 0 && start > job.total) start = 0;
  if (job.total > 0 && start === job.total && start > 0) {
    onProgress(start, job.total);
    return;
  }
  const headers: Record<string, string> = {};
  if (start > 0) headers.Range = `bytes=${start}-`;
  const response = await fetch(job.url, { headers, signal });
  if (!response.ok && response.status !== 206) throw new Error(`The server answered HTTP ${response.status} for ${job.title}.`);
  if (start > 0 && response.status !== 206) start = 0;
  const total = totalFromResponse(start, response.status, Number(response.headers.get("content-length") || 0), response.headers.get("content-range"));
  const resume = start > 0 && response.status === 206;
  let writable: FileSystemWritableFileStream;
  try {
    writable = await handle.createWritable({ keepExistingData: resume });
  } catch {
    writable = await handle.createWritable();
  }
  if (resume) await writable.seek(start);
  const reader = response.body?.getReader();
  if (!reader) {
    await writable.close();
    throw new Error("This browser did not open a download stream.");
  }
  let received = resume ? start : 0;
  let last = Date.now();
  const stall = window.setInterval(() => {
    if (Date.now() - last > STALL_MS) activeAbort?.abort();
  }, 2000);
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value?.byteLength) continue;
      await writable.write(value);
      received += value.byteLength;
      last = Date.now();
      onProgress(received, total);
    }
    await writable.close();
  } catch (error) {
    try {
      await writable.close();
    } catch {
      /* partial bytes stay */
    }
    if (signal.aborted) {
      throw new Error(`Stopped at ${formatBytes(received)}. Resume continues this file.`);
    }
    throw error;
  } finally {
    window.clearInterval(stall);
  }
}

async function putInFolder(job: Grab) {
  if (!userFolder) return false;
  const file = await readGrabFile(job);
  const dest = await userFolder.getFileHandle(job.fileName, { create: true });
  const writable = await dest.createWritable();
  await writable.write(file);
  await writable.close();
  return true;
}

async function pump() {
  if (pumping) return;
  pumping = true;
  try {
    for (;;) {
      const next = jobs.find((job) => job.state === "queued");
      if (!next) return;
      patch(next.id, { state: "active", detail: "", received: next.received });
      const controller = new AbortController();
      activeAbort = controller;
      try {
        await pull(next, controller.signal, (received, total) => patch(next.id, { received, total: total || next.total, detail: "" }));
        const saved = await putInFolder(next).catch(() => false);
        patch(next.id, { state: saved ? "saved" : "kept", detail: saved ? "In the folder you picked." : "Kept. Save puts it in Files." });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Download stopped.";
        patch(next.id, { state: "error", detail: message });
      } finally {
        activeAbort = null;
      }
    }
  } finally {
    pumping = false;
  }
}

export async function enqueueGrabs(slug: string, items: GrabRequest[]): Promise<number> {
  const picker = (window as Window & { showDirectoryPicker?: (options?: { mode?: "readwrite" }) => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker;
  if (picker && !userFolder) {
    try {
      userFolder = await picker({ mode: "readwrite" });
    } catch {
      userFolder = null;
    }
  }
  let added = 0;
  items.forEach((item, index) => {
    if (!item.url) return;
    const id = `${slug}:${index}:${item.fileName}`;
    const existing = jobs.find((job) => job.id === id);
    if (existing && (existing.state === "queued" || existing.state === "active" || existing.state === "saved")) return;
    if (existing?.state === "kept" && existing.total > 0 && existing.received >= existing.total) return;
    const received = existing?.received ?? 0;
    jobs = jobs.filter((job) => job.id !== id);
    jobs.push({
      id,
      slug,
      title: item.title,
      url: item.url,
      fileName: item.fileName,
      state: "queued",
      received,
      total: existing?.total ?? 0,
      detail: received > 0 ? "Continuing the saved part." : "",
    });
    added += 1;
  });
  emit();
  void pump();
  return added;
}

export function resumeGrabs(slug?: string) {
  jobs = jobs.map((job) => (job.state === "error" && (!slug || job.slug === slug) ? { ...job, state: "queued", detail: "Continuing the saved part." } : job));
  emit();
  void pump();
}

export function cancelActiveGrab() {
  activeAbort?.abort();
}

export async function saveGrab(id: string) {
  const job = jobs.find((item) => item.id === id);
  if (!job) return;
  const file = await readGrabFile(job);
  if (userFolder) {
    await putInFolder(job);
    patch(id, { state: "saved", detail: "In the folder you picked." });
    return;
  }
  const share = navigator.share?.bind(navigator);
  const can = navigator.canShare?.({ files: [file] });
  if (share && can) {
    try {
      await share({ files: [file], title: job.title });
      patch(id, { state: "saved", detail: "Sent to Files." });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        patch(id, { detail: "Still kept on this page." });
        return;
      }
    }
  }
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = job.fileName;
  link.click();
  URL.revokeObjectURL(url);
  patch(id, { state: "saved", detail: "Sent to your downloads." });
}

export async function saveKeptGrabs(slug: string) {
  const ready = jobs.filter((job) => job.slug === slug && (job.state === "kept" || job.state === "saved") && job.received > 0);
  if (ready.length === 0) return;
  if (userFolder) {
    for (const job of ready) {
      if (job.state === "saved") continue;
      await putInFolder(job);
      patch(job.id, { state: "saved", detail: "In the folder you picked." });
    }
    return;
  }
  const files = await Promise.all(ready.filter((job) => job.state === "kept").map((job) => readGrabFile(job)));
  if (files.length === 0) return;
  if (navigator.share && navigator.canShare?.({ files })) {
    await navigator.share({ files, title: slug });
    for (const job of ready) {
      if (job.state === "kept") patch(job.id, { state: "saved", detail: "Sent to Files." });
    }
    return;
  }
  await saveGrab(ready.find((job) => job.state === "kept")?.id || ready[0].id);
}
