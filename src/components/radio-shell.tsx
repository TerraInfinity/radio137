import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Atmosphere } from "@/components/atmosphere";
import { DeepLink } from "@/components/deep-link";
import { EnterGate } from "@/components/enter-gate";
import { LoveBubbles } from "@/components/love-bubbles";
import { MiniPlayer } from "@/components/mini-player";
import { SiteHeader } from "@/components/site-header";
import { heldClaim } from "@/lib/claim";
import { cn } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";

export function RadioShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const collapsed = usePlayerStore((s) => s.playerCollapsed);
  const hydrate = usePlayerStore((s) => s.hydrate);
  const claims = usePlayerStore((s) => s.claims);
  const identity = usePlayerStore((s) => s.identity);
  const driving = Boolean(heldClaim(claims, identity)?.own);
  const embed = pathname === "/embed" || pathname.startsWith("/embed/");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.classList.toggle("is-dj", driving);
  }, [driving]);

  if (embed) {
    return <div className="h-dvh overflow-hidden bg-bg">{children}</div>;
  }

  return (
    <div className="relative min-h-dvh bg-bg text-fg">
      <Atmosphere />
      <DeepLink />
      <div className={cn("relative z-10 flex min-h-dvh flex-col", driving && "is-dj")}>
        <SiteHeader />
        <main className={cn("flex-1", collapsed ? "pb-20" : "pb-44")}>{children}</main>
      </div>
      <MiniPlayer />
      <LoveBubbles />
      <EnterGate />
    </div>
  );
}
