import type { ClaimRecord, Identity } from "@/lib/types";

export function heldClaim(claims: Record<string, ClaimRecord>, identity: Identity | null) {
  if (!identity) return null;
  const now = Date.now();
  for (const [slug, claim] of Object.entries(claims)) {
    if (claim.claimantId === identity.id && (claim.expiresAt ?? 0) > now) {
      return { slug, own: true as const, claim };
    }
  }
  return null;
}
