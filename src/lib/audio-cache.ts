/** Device-local copies of finite audio. Player src stays R2 unless a full file is already here. */
import { mediaUrl } from "@/lib/media";
import type { Track } from "@/lib/types";
import {
  cacheBudgetBytes,
  FORCE_CACHE_BYTES,
  isDataSaverConnection,
  isFiniteAudioUrl,
  isTightStorage,
  lruVictims,
  maxCachedTracks,
  maxKeepBytes,
  overflowVictims,
  shouldAutoKeep,
} from "@/lib/audio-cache-policy";

export {
  isDataSaverConnection,
  isFiniteAudioUrl,
  lruVictims,
  shouldHoldAutoAdvance,
} from "@/lib/audio-cache-policy";

const DB_NAME = "radio137-audio";
const STORE = "files";
const DB_VERSION = 2;

export type CachedAudio = {
  id: string;
  url: string;
  blob: Blob;
  size: number;
  type: string;
  savedAt: number;
  lastUsed: number;
  pinned?: boolean;
};

const inflight = new Map<string, Promise<void>>();
const objectUrls = new Map<string, string>();
const known = new Set<string>();
let knownReady: Promise<void> | null = null;
let cacheGen = 0;
const cacheSubs = new Set<() => void>();

function bumpCache() {
  cacheGen += 1;
  for (const sub of cacheSubs) sub();
}

export function subscribeAudioCache(fn: () => void) {
  cacheSubs.add(fn);
  return () => cacheSubs.delete(fn);
}

export function audioCacheGeneration() {
  return cacheGen;
}

export function dataSaverOn(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean; type?: string }; mozConnection?: { saveData?: boolean; type?: string } };
  return isDataSaverConnection(nav.connection ?? nav.mozConnection ?? null);
}

export function tightStorageOn(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean; type?: string }; mozConnection?: { saveData?: boolean; type?: string } };
  const conn = nav.connection ?? nav.mozConnection ?? null;
  const width = typeof window === "undefined" ? 9999 : window.innerWidth;
  return isTightStorage({
    ua: navigator.userAgent,
    width,
    saveData: conn?.saveData,
    type: conn?.type,
  });
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
      bumpCache();
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

export function releaseOtherObjectUrls(keepId?: string) {
  for (const id of [...objectUrls.keys()]) {
    if (id !== keepId) revoke(id);
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
  bumpCache();
}

export async function clearCachedAudio(): Promise<void> {
  for (const id of [...objectUrls.keys()]) revoke(id);
  known.clear();
  try {
    await tx("readwrite", (store) => store.clear());
  } catch {
    /* ignore */
  }
  bumpCache();
}

export async function cacheUsage(): Promise<{ used: number; count: number; budget: number }> {
  const tight = tightStorageOn();
  let quota: number | undefined;
  try {
    quota = (await navigator.storage?.estimate?.())?.quota;
  } catch {
    /* ignore */
  }
  const budget = cacheBudgetBytes(quota, tight);
  try {
    const rows = await allRows();
    return {
      used: rows.reduce((sum, row) => sum + (row.size || 0), 0),
      count: rows.length,
      budget,
    };
  } catch {
    return { used: 0, count: 0, budget };
  }
}

async function budgetBytes(): Promise<number> {
  try {
    const estimate = await navigator.storage?.estimate?.();
    return cacheBudgetBytes(estimate?.quota, tightStorageOn());
  } catch {
    return cacheBudgetBytes(undefined, tightStorageOn());
  }
}

async function putWithLru(row: CachedAudio): Promise<void> {
  const budget = await budgetBytes();
  if (row.size > budget) return;
  const cap = maxCachedTracks(tightStorageOn());
  let rows: CachedAudio[] = [];
  try {
    rows = await allRows();
  } catch {
    return;
  }
  const others = rows.filter((item) => item.id !== row.id);
  const used = others.reduce((sum, item) => sum + (item.size || 0), 0);
  const need = used + row.size - budget;
  const drop = new Set<string>([
    ...(need > 0 ? lruVictims(others, need) : []),
    ...overflowVictims([...others, row], cap).filter((id) => id !== row.id),
  ]);
  for (const id of drop) await forgetCachedAudio(id);
  await tx("readwrite", (store) => store.put(row));
  known.add(row.id);
  bumpCache();
}

async function touchCached(id: string, patch?: Partial<Pick<CachedAudio, "pinned" | "url">>): Promise<void> {
  try {
    const row = (await tx("readonly", (store) => store.get(id))) as CachedAudio | undefined;
    if (!row) return;
    row.lastUsed = Date.now();
    if (patch?.pinned != null) row.pinned = patch.pinned;
    if (patch?.url) row.url = patch.url;
    await tx("readwrite", (store) => store.put(row));
  } catch {
    /* ignore */
  }
}

export async function pinCachedAudio(id: string, pinned: boolean): Promise<void> {
  await touchCached(id, { pinned });
}

export async function playableSrc(track: Pick<Track, "id" | "audioUrl">): Promise<string> {
  const remote = mediaUrl(track.audioUrl);
  if (!isFiniteAudioUrl(track.audioUrl)) return remote;
  releaseOtherObjectUrls(track.id);
  const existing = objectUrls.get(track.id);
  if (existing && known.has(track.id)) {
    void touchCached(track.id);
    return existing;
  }
  const blob = await getCachedAudio(track.id);
  if (!blob) return remote;
  try {
    const row = (await tx("readonly", (store) => store.get(track.id))) as CachedAudio | undefined;
    if (row?.url && row.url !== remote) {
      await forgetCachedAudio(track.id);
      return remote;
    }
  } catch {
    /* still play the blob */
  }
  revoke(track.id);
  const url = URL.createObjectURL(blob);
  objectUrls.set(track.id, url);
  void touchCached(track.id);
  return url;
}

async function pullFullFile(url: string, maxBytes: number): Promise<Blob | null> {
  const res = await fetch(url, { mode: "cors", credentials: "omit", cache: "force-cache" });
  if (!res.ok || res.status === 206) return null;
  const declared = Number(res.headers.get("content-length") || 0);
  if (declared && declared > maxBytes) {
    try {
      await res.body?.cancel();
    } catch {
      /* ignore */
    }
    return null;
  }
  if (!res.body) {
    const blob = await res.blob();
    if (!blob.size || blob.size > maxBytes) return null;
    if (declared && blob.size < declared * 0.98) return null;
    return blob;
  }
  const reader = res.body.getReader();
  const chunks: ArrayBuffer[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer);
  }
  if (!size) return null;
  if (declared && size < declared * 0.98) return null;
  return new Blob(chunks, { type: res.headers.get("content-type") || "audio/mpeg" });
}

export function rememberAudio(
  track: Pick<Track, "id" | "audioUrl">,
  opts?: { force?: boolean; listenedRatio?: number },
): void {
  if (typeof window === "undefined") return;
  if (!isFiniteAudioUrl(track.audioUrl)) return;
  const tight = tightStorageOn();
  const saver = dataSaverOn();
  if (
    !shouldAutoKeep({
      force: opts?.force,
      dataSaver: saver,
      tight,
      listenedRatio: opts?.listenedRatio,
    })
  ) {
    return;
  }
  const id = track.id;
  if (inflight.has(id)) return;
  const url = mediaUrl(track.audioUrl);
  const cap = maxKeepBytes({ force: opts?.force, tight });
  const work = (async () => {
    try {
      if (await hasCachedAudio(id)) {
        await touchCached(id, { pinned: opts?.force ? true : undefined, url });
        return;
      }
      const blob = await pullFullFile(url, cap);
      if (!blob) return;
      if (
        !shouldAutoKeep({
          force: opts?.force,
          dataSaver: saver,
          tight,
          bytes: blob.size,
          listenedRatio: opts?.listenedRatio,
        })
      ) {
        return;
      }
      await putWithLru({
        id,
        url,
        blob,
        size: blob.size,
        type: blob.type || "audio/mpeg",
        savedAt: Date.now(),
        lastUsed: Date.now(),
        pinned: Boolean(opts?.force),
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
  if (!src.startsWith("blob:")) return null;
  return src;
}

export async function downloadAudio(track: Pick<Track, "id" | "audioUrl">, filename: string): Promise<void> {
  const name = filename || "track.mp3";
  let blob = await getCachedAudio(track.id);
  if (!blob && isFiniteAudioUrl(track.audioUrl)) {
    blob = await pullFullFile(mediaUrl(track.audioUrl), FORCE_CACHE_BYTES);
    if (blob) {
      await putWithLru({
        id: track.id,
        url: mediaUrl(track.audioUrl),
        blob,
        size: blob.size,
        type: blob.type || "audio/mpeg",
        savedAt: Date.now(),
        lastUsed: Date.now(),
        pinned: true,
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
