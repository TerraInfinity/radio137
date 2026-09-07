import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getChannel, getStationByAlias, stationSkin } from "@/lib/catalog";
import { GLAUM_DEFAULT_WORDS, isGlaumDesk } from "@/lib/glaum-words";
import { listGlaumWords } from "@/lib/glaum-api";
import { usePlayerStore } from "@/lib/player-store";

type Orb = {
  id: number;
  left: number;
  label: string;
  kind: "float" | "pop";
  drift: number;
  size: number;
  dur: number;
};

let seq = 1;

function pick(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)] || "glåüm";
}

function glaumFromPath(pathname: string): boolean {
  if (pathname.startsWith("/channel/")) {
    const slug = pathname.slice("/channel/".length).split("/")[0] || "";
    const channel = getChannel(slug);
    return Boolean(channel && stationSkin(channel) === "glaum");
  }
  const alias = pathname.replace(/^\/+/, "").split("/")[0] || "";
  if (!alias || alias === "player" || alias === "desk") return false;
  const station = getStationByAlias(alias);
  return Boolean(station && stationSkin(station) === "glaum") || isGlaumDesk(alias);
}

export function LoveLayer() {
  const slug = usePlayerStore((s) => s.channelSlug);
  const status = usePlayerStore((s) => s.status);
  const collect = usePlayerStore((s) => s.collectGlaumule);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const channel = slug ? getChannel(slug) : undefined;
  const skin = channel ? stationSkin(channel) : "none";
  const playingGlaum = Boolean(channel && status === "playing" && (channel.loveBubbles || channel.glaumules || skin === "glaum"));
  const pageGlaum = glaumFromPath(pathname);
  const active = playingGlaum || pageGlaum;
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const poolRef = useRef<string[]>(GLAUM_DEFAULT_WORDS);

  useEffect(() => {
    let alive = true;
    const pull = () => {
      void listGlaumWords()
        .then((data) => {
          if (alive && data.pool.length) poolRef.current = data.pool;
        })
        .catch(() => {
          /* defaults stay */
        });
    };
    pull();
    const timer = window.setInterval(pull, 45_000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!active) {
      setOrbs([]);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const mobile = window.matchMedia("(max-width: 640px)").matches;
    const maxOrbs = mobile ? 7 : 14;
    const spawn = (kind: Orb["kind"], label?: string) => {
      if (document.hidden) return;
      const id = seq++;
      const orb: Orb = {
        id,
        left: mobile ? 6 + Math.random() * 72 : 4 + Math.random() * 88,
        label: label || pick(poolRef.current),
        kind,
        drift: (Math.random() * 2 - 1) * (mobile ? 18 : 28),
        size: mobile ? 2.6 + Math.random() * 1.3 : 3.2 + Math.random() * 2.4,
        dur: kind === "pop" ? 1.8 : mobile ? 6 + Math.random() * 2.5 : 7.5 + Math.random() * 4,
      };
      setOrbs((current) => [...current, orb].slice(-maxOrbs));
      window.setTimeout(() => {
        setOrbs((current) => current.filter((item) => item.id !== id));
      }, orb.dur * 1000);
    };
    const interval = mobile ? 2800 : 1700;
    const timer = window.setInterval(() => {
      spawn("float");
      if (!mobile && Math.random() > 0.62) spawn("float");
    }, interval);
    spawn("float", "glåüm");
    spawn("float");
    const onLove = (event: Event) => {
      const detail = (event as CustomEvent).detail as { kind?: string } | undefined;
      spawn("pop", detail?.kind === "like" ? "♡" : "glåüm");
      spawn("float", pick(poolRef.current));
    };
    window.addEventListener("radio-love", onLove);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("radio-love", onLove);
    };
  }, [active]);

  if (!active && orbs.length === 0) return null;

  return (
    <div className="love-layer" aria-hidden>
      {orbs.map((orb) => (
        <button
          key={orb.id}
          type="button"
          className={orb.kind === "pop" ? "love-orb love-orb-pop love-orb-glaum" : "love-orb love-orb-glaum"}
          style={{
            left: `${orb.left}%`,
            ["--orb-drift" as string]: `${orb.drift}vw`,
            ["--orb-size" as string]: `${orb.size}rem`,
            ["--orb-dur" as string]: `${orb.dur}s`,
          }}
          onClick={() => {
            collect(1);
            setOrbs((current) => current.filter((item) => item.id !== orb.id));
            window.dispatchEvent(new CustomEvent("radio-love", { detail: { kind: "collect" } }));
          }}
        >
          {orb.label}
        </button>
      ))}
    </div>
  );
}
