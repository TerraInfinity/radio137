const ABSOLUTE = /^https?:\/\//i;

export function resolveMediaUrl(url: string): string {
  if (!url) return "";
  if (ABSOLUTE.test(url)) return url;
  return url;
}
