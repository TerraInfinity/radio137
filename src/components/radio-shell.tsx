import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Atmosphere } from "@/components/atmosphere";
import { EnterGate } from "@/components/enter-gate";
import { LoveLayer } from "@/components/love-layer";
import { ConvertQueueBar } from "@/components/convert-queue-bar";
import { MiniPlayer } from "@/components/mini-player";
import { SiteHeader } from "@/components/site-header";
import { SsoCodeCatcher } from "@/components/sso-code-catcher";
import { getChannel, stationSkin } from "@/lib/catalog";
import { isLandingLocation } from "@/lib/landing";
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
  const showGate = ready && !visited && isLandingLocation(pathname, search);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    applyListenQuery(search, hash);
  }, [applyListenQuery, search, hash]);

  return (
    <div className="relative min-h-dvh">
      <SsoCodeCatcher />
      <Atmosphere skin={skin} />
      <LoveLayer />
      <div className="relative z-10">
        <SiteHeader />
        {children}
        {ready && !showGate ? <ConvertQueueBar /> : null}
        {ready && !showGate ? <MiniPlayer /> : null}
      </div>
      {showGate ? <EnterGate /> : null}
    </div>
  );
}
