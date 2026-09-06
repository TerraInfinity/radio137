import { useRouterState } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { hasGateSessionMarker } from "@/lib/auth/gate-session-marker";
import { ssoLoginHref, useRadioUser } from "@/lib/radio-user";
import { cn } from "@/lib/cn";

const subscribeToNothing = () => () => {};

export function AuthSlot() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isAdmin, isPending } = useRadioUser();
  const gateSession = useSyncExternalStore(subscribeToNothing, hasGateSessionMarker, () => false);

  if (isPending) {
    return <div className="h-11 w-24 shrink-0 animate-pulse rounded-md bg-bg-elevated" />;
  }

  if (!user) {
    if (gateSession) {
      return <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Signed in</span>;
    }
    return (
      <a
        href={ssoLoginHref(pathname || "/")}
        className="inline-flex h-11 shrink-0 items-center px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
      >
        Sign in with Google
      </a>
    );
  }

  const label = user.email || user.name || "Signed in";
  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2">
      {user.image ? (
        <img src={user.image} alt="" className="size-8 rounded-full object-cover" />
      ) : (
        <span
          className={cn(
            "grid size-8 place-items-center rounded-full font-mono text-[11px]",
            isAdmin ? "bg-gold/20 text-gold" : "bg-bg-elevated text-muted",
          )}
        >
          {isAdmin ? "C" : (label[0] || "?").toUpperCase()}
        </span>
      )}
      <span className="hidden max-w-[11rem] truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted lg:inline">
        {label}
      </span>
      {gateSession ? null : (
        <a href="/logout" className="inline-flex h-11 items-center font-mono text-[10px] uppercase tracking-[0.12em] text-subtle hover:text-fg">
          Sign out
        </a>
      )}
    </div>
  );
}

export function HubLinks() {
  return (
    <span className="hidden items-center gap-2 md:flex">
      <a href="https://terrainfinity.ca" className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle hover:text-gold">
        Hub
      </a>
      <a href="https://cyber-athens.ca" className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle hover:text-gold">
        Athens
      </a>
    </span>
  );
}
