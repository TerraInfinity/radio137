/** Same fold as foldText/searchTokens in search.ts. Kept local so tests do not load the catalog. */

export type DirectoryView = "cards" | "list";

export type DirectoryFields = {
  title: string;
  kicker?: string;
  line?: string;
  category?: string;
  tags?: string[];
  energy?: string;
  kind?: string;
  mode?: string;
  source?: string;
};

export function foldDirectory(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function parseDirectoryView(value: unknown): DirectoryView | null {
  return value === "cards" || value === "list" ? value : null;
}

export function filterDirectory<T>(items: T[], query: string, fields: (item: T) => DirectoryFields): T[] {
  const tokens = foldDirectory(query).split(/\s+/).filter((token) => token.length > 0);
  if (tokens.length === 0) return items;
  return items.filter((item) => {
    const spec = fields(item);
    const hay = foldDirectory(
      [spec.title, spec.kicker, spec.line, spec.category, spec.energy, spec.kind, spec.mode, spec.source, ...(spec.tags ?? [])]
        .filter(Boolean)
        .join(" "),
    );
    return tokens.every((token) => hay.includes(token));
  });
}
