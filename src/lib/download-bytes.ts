export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return mb >= 10 ? `${Math.round(mb)} MB` : `${mb.toFixed(1)} MB`;
}

/** Total size from a Range response. A full 200 is the whole file. */
export function totalFromResponse(start: number, status: number, contentLength: number, contentRange: string | null): number {
  const match = contentRange?.match(/\/(\d+)\s*$/);
  if (match) return Number(match[1]);
  if (status === 206 && contentLength > 0) return start + contentLength;
  if (contentLength > 0) return contentLength;
  return 0;
}
