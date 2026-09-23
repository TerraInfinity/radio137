/** Editorial rail, listens, and recency. Higher stays nearer the top. */
export function scoreFeature(input: {
  featured: boolean;
  featuredRank?: number;
  listens: number;
  newer: number;
  fresh: boolean;
}): number {
  const rank = Math.min(Math.max(0, input.featuredRank ?? 99), 80);
  const editorial = input.featured ? 1000 - rank * 8 : 0;
  const heard = Math.min(Math.max(0, input.listens), 500) * 6;
  const recent = Math.round(Math.min(1, Math.max(0, input.newer)) * 40);
  return editorial + heard + recent + (input.fresh ? 28 : 0);
}

export function listensFor(tracks: { id: string }[], views: Record<string, number>): number {
  return tracks.reduce((sum, track) => sum + (views[track.id] ?? 0), 0);
}

export function pickWelcome(
  rows: { slug: string; enabled: boolean; featured: boolean; weight: number }[],
  history: string | null,
  fallback: string,
): string {
  if (history && rows.some((row) => row.enabled && row.slug === history)) return history;
  const open = rows.filter((row) => row.enabled);
  const featured = open.filter((row) => row.featured).sort((a, b) => b.weight - a.weight || a.slug.localeCompare(b.slug));
  if (featured[0]) return featured[0].slug;
  const ranked = [...open].sort((a, b) => b.weight - a.weight || a.slug.localeCompare(b.slug));
  return ranked[0]?.slug || fallback;
}
