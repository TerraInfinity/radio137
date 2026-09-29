import { completeDeskUpload, mintDeskUpload } from "@/lib/desk-api";

export function putFileToR2(
  putUrl: string,
  file: Blob,
  contentType: string,
  signal?: AbortSignal,
  onProgress?: (loaded: number, total: number) => void,
) {
  if (!onProgress) {
    return fetch(putUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": contentType },
      signal,
    }).then((res) => {
      if (!res.ok) throw uploadError(res.status, res.statusText);
    });
  }
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", putUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded, event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(uploadError(xhr.status, xhr.statusText));
    };
    xhr.onerror = () => reject(new Error("Upload to storage failed. The browser could not reach R2."));
    xhr.onabort = () => reject(new Error("Upload cancelled"));
    const abort = () => xhr.abort();
    signal?.addEventListener("abort", abort, { once: true });
    xhr.send(file);
  });
}

function uploadError(status: number, statusText: string) {
  const why =
    status === 403
      ? "R2 rejected the upload. The signed link did not match, or the bucket is blocking this browser."
      : "Upload to storage failed";
  return new Error(`${why} (${status} ${statusText || "no status"})`);
}

export async function directDeskUpload(input: {
  kind: "audio" | "art";
  slug: string;
  file: File;
  trackId?: string;
  title?: string;
  coverUrl?: string;
  durationSec?: number;
  onProgress?: (loaded: number, total: number) => void;
}) {
  const minted = await mintDeskUpload({
    data: {
      kind: input.kind,
      slug: input.slug,
      filename: input.file.name,
      contentType: input.file.type || undefined,
      size: input.file.size,
      trackId: input.trackId,
    },
  });
  await putFileToR2(minted.putUrl, input.file, minted.contentType, undefined, input.onProgress);
  return completeDeskUpload({
    data: {
      kind: input.kind,
      slug: input.slug,
      key: minted.key,
      title: input.title,
      coverUrl: input.coverUrl,
      trackId: input.trackId,
      contentType: minted.contentType,
      durationSec: input.durationSec,
    },
  });
}
