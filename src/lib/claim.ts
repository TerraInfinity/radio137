import type { ClaimRecord, Identity } from "@/lib/types";

export const CLAIM_PRESETS = [15, 30, 60] as const;

export function heldClaim(
  claims: Record<string, ClaimRecord>,
  identity: Identity | null,
  now = Date.now(),
): { slug: string; claim: ClaimRecord; own: boolean } | null {
  for (const [slug, claim] of Object.entries(claims)) {
    if (!claim?.claimantId || (claim.expiresAt ?? 0) <= now) continue;
    return { slug, claim, own: Boolean(identity && claim.claimantId === identity.id) };
  }
  return null;
}

export function claimRemainingMs(claim: ClaimRecord, now = Date.now()): number {
  if (!claim.expiresAt) return 0;
  return Math.max(0, claim.expiresAt - now);
}

export function claimElapsedMs(claim: ClaimRecord, now = Date.now()): number {
  if (!claim.claimedAt) return 0;
  const end = claim.expiresAt ? Math.min(now, claim.expiresAt) : now;
  return Math.max(0, end - claim.claimedAt);
}

export function claimTotalMs(claim: ClaimRecord): number {
  if (!claim.claimedAt || !claim.expiresAt) return 0;
  return Math.max(1, claim.expiresAt - claim.claimedAt);
}

export function claimRemainRatio(claim: ClaimRecord, now = Date.now()): number {
  const total = claimTotalMs(claim);
  if (!total) return 0;
  return Math.min(1, claimRemainingMs(claim, now) / total);
}
