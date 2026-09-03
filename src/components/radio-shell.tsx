import { useEffect } from "react";
import { Atmosphere } from "@/components/atmosphere";
import { EnterGate } from "@/components/enter-gate";
import { MiniPlayer } from "@/components/mini-player";
import { SiteHeader } from "@/components/site-header";
import { getChannel, stationSkin } from "@/lib/catalog";
import { usePlayerStore } from "@/lib/player-store";

export function RadioShell({ children }: { children: React.ReactNode }) {
  const hydrate = usePlayerStore((s) => s.hydrate);
  const ready = usePlayerStore((s) => s.ready);
  const gateOpen = usePlayerStore((s) => s.gateOpen);
  const slug = usePlayerStore((s) => s.channelSlug);
  const channel = slug ? getChannel(slug) : undefined;
  const skin = channel ? stationSkin(channel) : "none";

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="relative min-h-dvh">
      <Atmosphere skin={skin} />
      <div className="relative z-10">
        <SiteHeader />
        {children}
        {ready && !gateOpen ? <MiniPlayer /> : null}
      </div>
      {ready && gateOpen ? <EnterGate /> : null}
    </div>
  );
}
