const hits = new Map<string, number[]>();

/** In-memory gate so a loop cannot repeat a paid or write-heavy call. */
export function allowSpend(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const prev = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
  if (prev.length >= limit) {
    hits.set(key, prev);
    return false;
  }
  prev.push(now);
  hits.set(key, prev);
  if (hits.size > 4000) {
    const oldest = hits.keys().next().value;
    if (oldest) hits.delete(oldest);
  }
  return true;
}
