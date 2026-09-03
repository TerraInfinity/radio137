import type { Channel, PresenceSnapshot } from "@/lib/types";

export function popularityScore(
  channel: Channel,
  opts: {
    live: number;
    viewers: number;
    listens: number;
    views: number;
    favorite: boolean;
    hostSlug?: string | null;
    upvotes?: number;
  },
): number {
  return (
    opts.live * 48 +
    opts.viewers * 14 +
    opts.listens * 3 +
    opts.views * 1 +
    (opts.upvotes ?? 0) * 8 +
    (opts.favorite ? 80 : 0) +
    (opts.hostSlug === channel.slug ? 120 : 0) +
    (channel.featured ? 10 : 0)
  );
}

export function sortByPopularity(
  channels: Channel[],
  presence: PresenceSnapshot | null,
  favorites: string[],
  upvotes: Record<string, number> = {},
): Channel[] {
  const fav = new Set(favorites);
  const hostSlug = presence?.host?.slug ?? null;
  return [...channels].sort((a, b) => {
    const sa = popularityScore(a, {
      live: presence?.live[a.slug] ?? 0,
      viewers: presence?.viewers[a.slug] ?? 0,
      listens: presence?.listens[a.slug] ?? 0,
      views: presence?.views[a.slug] ?? 0,
      favorite: fav.has(a.slug),
      hostSlug,
      upvotes: upvotes[a.slug],
    });
    const sb = popularityScore(b, {
      live: presence?.live[b.slug] ?? 0,
      viewers: presence?.viewers[b.slug] ?? 0,
      listens: presence?.listens[b.slug] ?? 0,
      views: presence?.views[b.slug] ?? 0,
      favorite: fav.has(b.slug),
      hostSlug,
      upvotes: upvotes[b.slug],
    });
    return sb - sa || a.name.localeCompare(b.name);
  });
}

export function listenerLabel(live: number, listens: number, viewers = 0, views = 0): string {
  const bits: string[] = [];
  if (live > 0) bits.push(live === 1 ? "1 listening" : `${live} listening`);
  else if (viewers > 0) bits.push(viewers === 1 ? "1 here" : `${viewers} here`);
  if (listens > 0) bits.push(listens === 1 ? "1 listen" : `${listens} listens`);
  if (views > 0 && live === 0) bits.push(views === 1 ? "1 visit" : `${views} visits`);
  return bits.join(" · ");
}
