const KEY = "radio.favs.v1";
export const FAV_EVENT = "radio:favs";

export function loadFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]") as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(slug: string): string[] {
  const current = loadFavorites();
  const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(FAV_EVENT));
  } catch {
    /* ignore */
  }
  return next;
}
