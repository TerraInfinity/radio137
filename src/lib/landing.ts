/** First-visit Tune In landing is only the bare home page. */
export function isLandingLocation(pathname: string, search = ""): boolean {
  if (pathname !== "/") return false;
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const q = new URLSearchParams(raw).get("q");
  return !q?.trim();
}
