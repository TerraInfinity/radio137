/** God / C accounts. Server also reads extra addresses from ADMIN_EMAILS. */
export const ADMIN_EMAILS = ["career@terrainfinity.ca", "c@cyber-athens.ca"] as const;

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

export function isAdminEmail(email: string | null | undefined, extra: string[] = []): boolean {
  const needle = normalizeEmail(email);
  if (!needle) return false;
  if (ADMIN_EMAILS.includes(needle as (typeof ADMIN_EMAILS)[number])) return true;
  return extra.some((item) => normalizeEmail(item) === needle);
}
