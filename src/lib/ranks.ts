const KEY = "radio.ranks.v1";

export type RankBook = { channels: Record<string, number>; songs: Record<string, number> };

function empty(): RankBook {
  return { channels: {}, songs: {} };
}

export function loadRanks(): RankBook {
  if (typeof window === "undefined") return empty();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "null") as RankBook | null;
    return parsed && typeof parsed === "object" ? { channels: parsed.channels ?? {}, songs: parsed.songs ?? {} } : empty();
  } catch {
    return empty();
  }
}

export function voteRank(kind: "channels" | "songs", id: string, delta: number): RankBook {
  const book = loadRanks();
  const next = Math.max(0, (book[kind][id] ?? 0) + delta);
  book[kind][id] = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(book));
  } catch {
    /* ignore */
  }
  return book;
}
