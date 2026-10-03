import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Atmosphere } from "@/components/atmosphere";
import { EnterGate } from "@/components/enter-gate";
import { LoveLayer } from "@/components/love-layer";
import { ConvertQueueBar } from "@/components/convert-queue-bar";
import { MiniPlayer } from "@/components/mini-player";
import { SiteHeader } from "@/components/site-header";
import { SatireAd } from "@/components/satire-ads";
import { ShrimpOrnaments } from "@/components/shrimp-ornaments";
import { useShrimp } from "@/components/shrimp-context";
import { SsoCodeCatcher } from "@/components/sso-code-catcher";
import { getChannel, stationSkin } from "@/lib/catalog";
import { isLandingLocation } from "@/lib/landing";
import { cn } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";

export function RadioShell({ children }: { children: React.ReactNode }) {
  const hydrate = usePlayerStore((s) => s.hydrate);
  const ready = usePlayerStore((s) => s.ready);
  const visited = usePlayerStore((s) => s.visited);
  const slug = usePlayerStore((s) => s.channelSlug);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const hash = useRouterState({ select: (s) => s.location.hash });
  const applyListenQuery = usePlayerStore((s) => s.applyListenQuery);
  const channel = slug ? getChannel(slug) : undefined;
  const skin = channel ? stationSkin(channel) : "none";
  const shrimp = useShrimp();
  const showGate = ready && !visited && isLandingLocation(pathname, search);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    applyListenQuery(search, hash);
  }, [applyListenQuery, search, hash]);

  return (
    <div className="radio-app relative">
      <SsoCodeCatcher />
      <Atmosphere skin={skin} />
      <LoveLayer />
      <div className={cn("radio-frame relative z-10", shrimp && "shrimp-main")}>
        <SiteHeader />
        {shrimp ? <ShrimpOrnaments /> : null}
        <div ref={mainRef} className={cn("radio-main", shrimp && "xl:pr-72")}>
          {children}
          {shrimp ? <SatireAd slim /> : null}
        </div>
        {shrimp ? <SatireAd /> : null}
        {ready && !showGate ? <ConvertQueueBar /> : null}
        {showGate ? <EnterGate /> : null}
      </div>
      {ready && !showGate ? <MiniPlayer /> : null}
    </div>
  );
}
