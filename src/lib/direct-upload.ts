import { completeDeskUpload, mintDeskUpload } from "@/lib/desk-api";

export async function putFileToR2(putUrl: string, file: Blob, contentType: string, signal?: AbortSignal) {
  const res = await fetch(putUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": contentType },
    signal,
  });
  if (!res.ok) {
    const why = res.status === 403 ? "R2 rejected the upload. The link may have expired, or the bucket is blocking this browser." : "Upload to storage failed";
    throw new Error(`${why} (${res.status} ${res.statusText || "no status"})`);
  }
}

export async function directDeskUpload(input: {
  kind: "audio" | "art";
  slug: string;
  file: File;
  trackId?: string;
  title?: string;
  coverUrl?: string;
  durationSec?: number;
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
  await putFileToR2(minted.putUrl, input.file, minted.contentType);
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
