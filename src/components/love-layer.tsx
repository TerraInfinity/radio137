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

/** Storm = clustered; trickle = occasional; hush = long empty stretches. */
type Weather = "storm" | "trickle" | "hush";

let seq = 1;

function pick(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)] || "glåüm";
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickWeather(prev?: Weather): Weather {
  const roll = Math.random();
  if (prev === "storm") return roll < 0.74 ? "hush" : "trickle";
  if (prev === "hush") {
    if (roll < 0.42) return "storm";
    if (roll < 0.82) return "trickle";
    return "hush";
  }
  if (roll < 0.26) return "storm";
  if (roll < 0.62) return "hush";
  return "trickle";
}

function weatherMs(kind: Weather, mobile: boolean): number {
  if (kind === "storm") return mobile ? rand(1600, 4800) : rand(2200, 7200);
  if (kind === "trickle") return mobile ? rand(7000, 16000) : rand(9000, 22000);
  return mobile ? rand(18000, 58000) : rand(24000, 90000);
}

function spawnGap(kind: Weather, mobile: boolean): number {
  if (kind === "storm") return mobile ? rand(200, 720) : rand(120, 520);
  if (kind === "trickle") return mobile ? rand(5500, 15000) : rand(7000, 20000);
  return mobile ? rand(16000, 52000) : rand(22000, 80000);
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

function musicPlaying(): boolean {
  return usePlayerStore.getState().status === "playing";
}

export function LoveLayer() {
  const slug = usePlayerStore((s) => s.channelSlug);
  const status = usePlayerStore((s) => s.status);
  const collect = usePlayerStore((s) => s.collectGlaumule);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const channel = slug ? getChannel(slug) : undefined;
  const skin = channel ? stationSkin(channel) : "none";
  const glaumDesk = Boolean(channel && (channel.loveBubbles || channel.glaumules || skin === "glaum"));
  const pageGlaum = glaumFromPath(pathname);
  const onGlaum = glaumDesk || pageGlaum;
  const spawning = status === "playing" && onGlaum;
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const poolRef = useRef<string[]>(GLAUM_DEFAULT_WORDS);
  const expireRef = useRef<Set<number>>(new Set());

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
    return () => {
      for (const id of expireRef.current) window.clearTimeout(id);
      expireRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (spawning || orbs.length === 0) return;
    const id = window.setTimeout(() => setOrbs([]), 420);
    return () => window.clearTimeout(id);
  }, [spawning, orbs.length]);

  useEffect(() => {
    if (!spawning) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const mobile = window.matchMedia("(max-width: 640px)").matches;
    const maxOrbs = mobile ? 7 : 14;
    const timeouts = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timeouts.delete(id);
        fn();
      }, ms);
      timeouts.add(id);
      return id;
    };
    const spawn = (kind: Orb["kind"], label?: string) => {
      if (!musicPlaying() || document.hidden) return;
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
      const expire = window.setTimeout(() => {
        expireRef.current.delete(expire);
        setOrbs((current) => current.filter((item) => item.id !== id));
      }, orb.dur * 1000);
      expireRef.current.add(expire);
    };
    let weather: Weather = Math.random() < 0.28 ? "storm" : Math.random() < 0.5 ? "trickle" : "hush";
    let until = Date.now() + weatherMs(weather, mobile);
    const tick = () => {
      if (!musicPlaying()) return;
      if (document.hidden) {
        later(tick, 900);
        return;
      }
      if (Date.now() >= until) {
        weather = pickWeather(weather);
        until = Date.now() + weatherMs(weather, mobile);
      }
      const fire =
        weather === "storm" ||
        weather === "trickle" ||
        Math.random() < 0.22;
      if (fire) spawn("float");
      if (weather === "storm" && Math.random() < (mobile ? 0.28 : 0.48)) {
        later(() => spawn("float"), rand(70, 340));
        if (Math.random() < 0.32) later(() => spawn("float"), rand(180, 560));
      }
      later(tick, spawnGap(weather, mobile));
    };
    if (weather === "storm") {
      spawn("float", "glåüm");
      later(() => spawn("float"), rand(120, 380));
    }
    later(tick, weather === "hush" ? spawnGap("hush", mobile) : spawnGap(weather, mobile));
    const onLove = (event: Event) => {
      if (!musicPlaying()) return;
      const detail = (event as CustomEvent).detail as { kind?: string } | undefined;
      spawn("pop", detail?.kind === "like" ? "♡" : "glåüm");
      if (Math.random() < 0.55) spawn("float", pick(poolRef.current));
    };
    window.addEventListener("radio-love", onLove);
    return () => {
      for (const id of timeouts) window.clearTimeout(id);
      timeouts.clear();
      window.removeEventListener("radio-love", onLove);
    };
  }, [spawning]);

  if (!onGlaum && orbs.length === 0) return null;
  if (!spawning && orbs.length === 0) return null;

  return (
    <div className={spawning ? "love-layer" : "love-layer love-layer-still"} aria-hidden>
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
            if (!musicPlaying()) return;
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
