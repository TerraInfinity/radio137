import type { Track } from "./types.ts";

export function compareTrackTitle(a: Track, b: Track): number {
  return (
    a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" }) ||
    (a.artist || "").localeCompare(b.artist || "", undefined, { numeric: true, sensitivity: "base" }) ||
    a.id.localeCompare(b.id)
  );
}

/** Default A–Z. Custom `sortOrder` only wins after an admin Arranges the desk. */
export function sortPlaylistTracks(
  tracks: Track[],
  orderById?: ReadonlyMap<string, number | null | undefined>,
): Track[] {
  const hasOrder = orderById ? [...orderById.values()].some((n) => n != null) : false;
  return [...tracks].sort((a, b) => {
    if (!hasOrder) return compareTrackTitle(a, b);
    const ao = orderById?.get(a.id);
    const bo = orderById?.get(b.id);
    if (ao == null && bo == null) return compareTrackTitle(a, b);
    return (ao ?? 9999) - (bo ?? 9999) || compareTrackTitle(a, b);
  });
}
