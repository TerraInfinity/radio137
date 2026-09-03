import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn, formatRemaining } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel } from "@/lib/types";

export function ClaimBooth({ channel }: { channel: Channel }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const identity = usePlayerStore((s) => s.identity);
  const claims = usePlayerStore((s) => s.claims);
  const setIdentityName = usePlayerStore((s) => s.setIdentityName);
  const claimChannel = usePlayerStore((s) => s.claimChannel);
  const releaseClaim = usePlayerStore((s) => s.releaseClaim);
  const claim = claims[channel.slug];
  const held = Boolean(claim?.claimantId && (claim.expiresAt ?? 0) > now);
  const own = held && claim?.claimantId === identity?.id;
  const remaining = own && claim?.expiresAt ? claim.expiresAt - now : 0;
  const elapsed = own && claim?.claimedAt ? now - claim.claimedAt : 0;

  useEffect(() => {
    const expand = () => setOpen(true);
    const onHash = () => {
      if (window.location.hash === "#dj-booth") expand();
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    window.addEventListener("radio:open-booth", expand);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("radio:open-booth", expand);
    };
  }, []);

  useEffect(() => {
    if (!own) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [own]);

  if (!channel.claimable) return null;

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      if (!next && window.location.hash === "#dj-booth") {
        const url = `${window.location.pathname}${window.location.search}`;
        window.history.replaceState(null, "", url);
      }
      return next;
    });
  };

  return (
    <section id="dj-booth" className="mt-6 overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-border)]">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex h-11 w-full items-center justify-between gap-3 px-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className={cn("font-mono text-[10px] uppercase tracking-[0.16em]", own ? "lamp-pink" : "text-subtle")}>
            DJ booth
          </span>
          {own ? (
            <span className="lamp-pink truncate font-mono text-[10px] uppercase tracking-[0.12em] tabular-nums">
              Driving {formatRemaining(elapsed)} · {formatRemaining(remaining)} left
            </span>
          ) : held ? (
            <span className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-buzz">
              Held by {claim?.claimantName}
            </span>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Available</span>
          )}
        </span>
        {open ? <ChevronUp className="size-4 shrink-0 text-subtle" /> : <ChevronDown className="size-4 shrink-0 text-subtle" />}
      </button>

      {open ? (
        <div className="border-t border-line px-3 py-3">
          <p className="text-sm text-muted">
            Claim this desk to DJ. One driver at a time. Others cannot skip until you release.
          </p>
          {!identity ? (
            <form
              className="mt-3 flex flex-wrap gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                setIdentityName(name);
              }}
            >
              <input
                className="input max-w-xs"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Handle"
                aria-label="DJ name"
              />
              <button
                type="submit"
                className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg"
              >
                Set name
              </button>
            </form>
          ) : own ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-buzz">You are driving</p>
              <button
                type="button"
                onClick={() => releaseClaim(channel.slug)}
                className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted"
              >
                Release early
              </button>
            </div>
          ) : held ? (
            <p className="mt-3 text-sm text-buzz">Booth is held. Wait for release.</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {[15, 30, 60].map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => claimChannel(channel.slug, minutes)}
                  className="inline-flex h-11 items-center rounded-md bg-buzz px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fg"
                >
                  Claim {minutes}m
                </button>
              ))}
            </div>
          )}
          {own ? <DjPlayAlong /> : null}
        </div>
      ) : null}
    </section>
  );
}

function DjPlayAlong() {
  const [advanced, setAdvanced] = useState(false);
  return (
    <div className="mt-4 rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-buzz">Play along</p>
      <p className="mt-2 text-sm text-muted">
        Microphone, a local file, or a DJ controller — optional. This stays on your machine.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-gold">
          Local file
          <input
            type="file"
            accept="audio/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              const extra = new Audio(url);
              extra.loop = true;
              void extra.play();
            }}
          />
        </label>
        <button
          type="button"
          onClick={async () => {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              const extra = new Audio();
              extra.srcObject = stream;
              void extra.play();
            } catch {
              /* permission denied */
            }
          }}
          className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-gold"
        >
          Microphone
        </button>
      </div>
      <button
        type="button"
        onClick={() => setAdvanced((v) => !v)}
        className="mt-2 inline-flex h-11 items-center font-mono text-[10px] uppercase tracking-[0.14em] text-subtle"
      >
        {advanced ? "Hide advanced" : "Advanced · MIDI / gamepad"}
      </button>
      {advanced ? (
        <p className="mt-1 text-sm text-muted">
          Plug in a MIDI controller or gamepad. Browser MIDI needs a secure context. Map whatever you already play.
        </p>
      ) : null}
    </div>
  );
}
