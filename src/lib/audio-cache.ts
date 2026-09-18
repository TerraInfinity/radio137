/** Device-local copies of finite audio. Player src stays R2 unless a full file is already here. */
import { mediaUrl } from "@/lib/media";
import type { Track } from "@/lib/types";
import { isDataSaverConnection, isFiniteAudioUrl, lruVictims } from "@/lib/audio-cache-policy";

export { isDataSaverConnection, isFiniteAudioUrl, lruVictims, shouldHoldAutoAdvance } from "@/lib/audio-cache-policy";

const DB_NAME = "radio137-audio";
const STORE = "files";
const DB_VERSION = 1;
const BUDGET_BYTES = 800 * 1024 * 1024;

export type CachedAudio = {
  id: string;
  url: string;
  blob: Blob;
  size: number;
  type: string;
  savedAt: number;
  lastUsed: number;
};

const inflight = new Map<string, Promise<void>>();
const objectUrls = new Map<string, string>();
const known = new Set<string>();
let knownReady: Promise<void> | null = null;

export function dataSaverOn(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean; type?: string }; mozConnection?: { saveData?: boolean; type?: string } };
  return isDataSaverConnection(nav.connection ?? nav.mozConnection ?? null);
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const store = transaction.objectStore(STORE);
        const request = run(store);
        transaction.oncomplete = () => resolve((request ? request.result : undefined) as T);
        transaction.onerror = () => reject(transaction.error);
        if (request) request.onerror = () => reject(request.error);
      }),
  );
}

async function allRows(): Promise<CachedAudio[]> {
  return tx("readonly", (store) => store.getAll()) as Promise<CachedAudio[]>;
}

async function hydrateKnown() {
  if (typeof indexedDB === "undefined") return;
  knownReady ??= allRows()
    .then((rows) => {
      known.clear();
      for (const row of rows) known.add(row.id);
    })
    .catch(() => {
      knownReady = null;
    });
  await knownReady;
}

export async function hasCachedAudio(id: string): Promise<boolean> {
  if (known.has(id)) return true;
  await hydrateKnown();
  return known.has(id);
}

export async function getCachedAudio(id: string): Promise<Blob | null> {
  try {
    const row = (await tx("readonly", (store) => store.get(id))) as CachedAudio | undefined;
    if (!row?.blob) return null;
    known.add(id);
    return row.blob;
  } catch {
    return null;
  }
}

function revoke(id: string) {
  const prev = objectUrls.get(id);
  if (prev) {
    URL.revokeObjectURL(prev);
    objectUrls.delete(id);
  }
}

export async function forgetCachedAudio(id: string): Promise<void> {
  revoke(id);
  known.delete(id);
  try {
    await tx("readwrite", (store) => store.delete(id));
  } catch {
    /* ignore */
  }
}

async function budgetBytes(): Promise<number> {
  try {
    const estimate = await navigator.storage?.estimate?.();
    if (estimate?.quota) return Math.min(BUDGET_BYTES, Math.floor(estimate.quota * 0.45));
  } catch {
    /* ignore */
  }
  return BUDGET_BYTES;
}

async function putWithLru(row: CachedAudio): Promise<void> {
  const budget = await budgetBytes();
  if (row.size > budget) return;
  let rows: CachedAudio[] = [];
  try {
    rows = await allRows();
  } catch {
    return;
  }
  const others = rows.filter((item) => item.id !== row.id);
  const used = others.reduce((sum, item) => sum + (item.size || 0), 0);
  const need = used + row.size - budget;
  if (need > 0) {
    for (const id of lruVictims(others, need)) {
      await forgetCachedAudio(id);
    }
  }
  await tx("readwrite", (store) => store.put(row));
  known.add(row.id);
}

async function touchCached(id: string): Promise<void> {
  try {
    const row = (await tx("readonly", (store) => store.get(id))) as CachedAudio | undefined;
    if (!row) return;
    row.lastUsed = Date.now();
    await tx("readwrite", (store) => store.put(row));
  } catch {
    /* ignore */
  }
}

export async function playableSrc(track: Pick<Track, "id" | "audioUrl">): Promise<string> {
  const remote = mediaUrl(track.audioUrl);
  if (!isFiniteAudioUrl(track.audioUrl)) return remote;
  const blob = await getCachedAudio(track.id);
  if (!blob) return remote;
  revoke(track.id);
  const url = URL.createObjectURL(blob);
  objectUrls.set(track.id, url);
  void touchCached(track.id);
  return url;
}

async function pullFullFile(url: string): Promise<Blob | null> {
  const res = await fetch(url, { mode: "cors", credentials: "omit", cache: "force-cache" });
  if (!res.ok || res.status === 206) return null;
  const blob = await res.blob();
  const declared = Number(res.headers.get("content-length") || 0);
  if (!blob.size) return null;
  if (declared && blob.size < declared * 0.98) return null;
  return blob;
}

export function rememberAudio(track: Pick<Track, "id" | "audioUrl">, opts?: { force?: boolean }): void {
  if (typeof window === "undefined") return;
  if (!isFiniteAudioUrl(track.audioUrl)) return;
  if (!opts?.force && dataSaverOn()) return;
  const id = track.id;
  if (inflight.has(id)) return;
  const url = mediaUrl(track.audioUrl);
  const work = (async () => {
    try {
      if (await hasCachedAudio(id)) {
        await touchCached(id);
        return;
      }
      const blob = await pullFullFile(url);
      if (!blob) return;
      await putWithLru({
        id,
        url,
        blob,
        size: blob.size,
        type: blob.type || "audio/mpeg",
        savedAt: Date.now(),
        lastUsed: Date.now(),
      });
    } catch {
      /* playback still uses R2 */
    }
  })();
  inflight.set(id, work);
  void work.finally(() => {
    if (inflight.get(id) === work) inflight.delete(id);
  });
}

export async function warmTrackSrc(track: Pick<Track, "id" | "audioUrl">): Promise<string | null> {
  const src = await playableSrc(track);
  if (dataSaverOn() && !src.startsWith("blob:")) return null;
  return src;
}

export async function downloadAudio(track: Pick<Track, "id" | "audioUrl">, filename: string): Promise<void> {
  const name = filename || "track.mp3";
  let blob = await getCachedAudio(track.id);
  if (!blob && isFiniteAudioUrl(track.audioUrl)) {
    blob = await pullFullFile(mediaUrl(track.audioUrl));
    if (blob) {
      await putWithLru({
        id: track.id,
        url: mediaUrl(track.audioUrl),
        blob,
        size: blob.size,
        type: blob.type || "audio/mpeg",
        savedAt: Date.now(),
        lastUsed: Date.now(),
      });
    }
  }
  if (!blob) {
    window.location.assign(mediaUrl(track.audioUrl));
    return;
  }
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 4000);
}
