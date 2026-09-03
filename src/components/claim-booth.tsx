import { useState } from "react";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel } from "@/lib/types";

export function ClaimBooth({ channel }: { channel: Channel }) {
  const [open, setOpen] = useState(false);
  const identity = usePlayerStore((s) => s.identity);
  const setIdentityName = usePlayerStore((s) => s.setIdentityName);
  const claims = usePlayerStore((s) => s.claims);
  const claimChannel = usePlayerStore((s) => s.claimChannel);
  const releaseClaim = usePlayerStore((s) => s.releaseClaim);
  const claim = claims[channel.slug];
  const held = claim && (claim.expiresAt ?? 0) > Date.now();
  const own = held && identity && claim.claimantId === identity.id;
  if (!channel.claimable) return null;

  return (
    <section className="mt-6 overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-border)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-full items-center justify-between px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle"
      >
        DJ booth {held ? (own ? "· Yours" : "· Held") : "· Available"}
        <span className="text-gold">{open ? "Close" : "Open"}</span>
      </button>
      {open ? (
        <div className="border-t border-line p-3">
          <p className="text-sm text-muted">
            Listeners join the shared station clock. Claim the booth to skip and cue; everyone else stays locked to the clock until you release.
          </p>
          <label className="mt-3 block">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Handle</span>
            <input
              className="input mt-1"
              value={identity?.name ?? ""}
              onChange={(event) => setIdentityName(event.target.value)}
              placeholder="Your name"
            />
          </label>
          <div className="mt-3 flex gap-2">
            {own ? (
              <button
                type="button"
                onClick={() => releaseClaim(channel.slug)}
                className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
              >
                Release
              </button>
            ) : (
              <button
                type="button"
                disabled={!identity}
                onClick={() => claimChannel(channel.slug, 30)}
                className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-60"
              >
                Claim booth
              </button>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
