import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { claimElapsedMs, claimRemainRatio, claimRemainingMs, heldClaim } from "@/lib/claim";
import { cn, formatRemaining } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";

export function DriveBadge() {
  const identity = usePlayerStore((s) => s.identity);
  const autoplay = usePlayerStore((s) => s.autoplay);
  const setAutoplay = usePlayerStore((s) => s.setAutoplay);
  const claims = usePlayerStore((s) => s.claims);
  const catalog = usePlayerStore((s) => s.catalog);
  const [now, setNow] = useState(() => Date.now());
  const driving = heldClaim(claims, identity, now);

  useEffect(() => {
    if (!driving) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [driving?.slug]);

  if (driving?.own) {
    const remaining = claimRemainingMs(driving.claim, now);
    const elapsed = claimElapsedMs(driving.claim, now);
    const ratio = claimRemainRatio(driving.claim, now);
    const name = catalog.channels.find((item) => item.slug === driving.slug)?.name ?? "desk";
    return (
      <Link
        to="/channel/$slug"
        params={{ slug: driving.slug }}
        className="drive-badge inline-flex h-11 max-w-[52vw] shrink-0 items-center gap-2 px-1 sm:max-w-none"
        title={`Driving ${name} · on ${formatRemaining(elapsed)} · ${formatRemaining(remaining)} left`}
      >
        <DriveRing ratio={ratio} urgent={remaining > 0 && remaining < 60_000} />
        <span className="min-w-0">
          <span className="dj-timer block font-mono text-[10px] font-medium uppercase tracking-[0.16em] tabular-nums leading-none">
            {formatRemaining(elapsed)}
          </span>
          <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.14em] text-buzz/80">
            {remaining > 0 ? `${formatRemaining(remaining)} left` : "live"}
          </span>
        </span>
        <span className="sr-only">
          Autoplay lamp is pink. You are driving {name}. On for {formatRemaining(elapsed)}. {formatRemaining(remaining)} remaining.
        </span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setAutoplay(!autoplay)}
      className="inline-flex h-11 shrink-0 items-center gap-2 px-1"
      aria-pressed={autoplay}
      title={autoplay ? "Autoplay on — stations start when you open them" : "Autoplay off"}
    >
      <span className="lamp-bezel">
        <span className={cn("lamp", autoplay && "lamp-live")} />
      </span>
      <span className="hidden font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-subtle sm:inline">
        auto
      </span>
      <span className="sr-only">Autoplay {autoplay ? "on" : "off"}</span>
    </button>
  );
}

function DriveRing({ ratio, urgent }: { ratio: number; urgent: boolean }) {
  const r = 9;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, ratio));
  return (
    <span className={cn("drive-bezel relative", urgent && "drive-ring-urgent")}>
      <svg className="drive-ring absolute inset-0 size-7 -rotate-90" viewBox="0 0 28 28" aria-hidden>
        <circle cx="14" cy="14" r={r} fill="none" stroke="rgb(255 61 154 / 0.22)" strokeWidth="2" />
        <circle
          cx="14"
          cy="14"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${c * clamped} ${c}`}
        />
      </svg>
      <span className="lamp lamp-buzz" />
    </span>
  );
}
