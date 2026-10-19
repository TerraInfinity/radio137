import { GLAUM_STATION } from "./shrimpify.ts";

/** How long a last-heard station counts as "recent" for homepage resume. (?): 7 days is a product choice, not analytics-derived. */
export const RECENT_PLAY_MS = 7 * 24 * 60 * 60 * 1000;

/** Homepage Featured is a hard allowlist: exactly these two, in this order. Desk featured flags cannot expand it. */
export const HOME_FEATURED = [
  { kind: "experience", slug: "rose" },
  { kind: "station", slug: GLAUM_STATION },
] as const;

export function isRecentPlay(lastPlayedAt: number | null | undefined, now: number): boolean {
  return typeof lastPlayedAt === "number" && Number.isFinite(lastPlayedAt) && lastPlayedAt > 0 && now - lastPlayedAt >= 0 && now - lastPlayedAt <= RECENT_PLAY_MS;
}

export function pickHomeStartSlug(input: {
  lastSlug: string | null;
  lastPlayedAt: number | null;
  now: number;
  playableSlugs: Iterable<string>;
  defaultSlug: string;
}): string | null {
  const playable = new Set(input.playableSlugs);
  if (input.lastSlug && isRecentPlay(input.lastPlayedAt, input.now) && playable.has(input.lastSlug)) return input.lastSlug;
  if (playable.has(GLAUM_STATION)) return GLAUM_STATION;
  if (input.defaultSlug && playable.has(input.defaultSlug)) return input.defaultSlug;
  return null;
}

/** Apply the HOME_FEATURED allowlist to already-built rows, in allowlist order. Returns fewer (never a substitute) if one is missing. */
export function selectHomeFeatured<T extends { kind: string; slug: string; channel?: unknown }>(experiences: T[], stations: T[]): T[] {
  return HOME_FEATURED.flatMap((want) => {
    const row = want.kind === "experience"
      ? experiences.find((item) => item.kind === "experience" && item.slug === want.slug && item.channel)
      : stations.find((item) => item.kind === "station" && item.slug === want.slug);
    return row ? [row] : [];
  });
}
