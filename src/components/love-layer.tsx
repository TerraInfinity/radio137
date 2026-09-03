import { useEffect, useState } from "react";
import { getChannel, stationSkin } from "@/lib/catalog";
import { usePlayerStore } from "@/lib/player-store";

type Orb = { id: number; left: number; label: string; kind: "float" | "pop" };

const WORDS = ["glåüm", "shrimp", "om", "sat nam", "pop", "♡", "prawn", "lantern", "sequin"];

let seq = 1;

export function LoveLayer() {
  const slug = usePlayerStore((s) => s.channelSlug);
  const status = usePlayerStore((s) => s.status);
  const collect = usePlayerStore((s) => s.collectGlaumule);
  const channel = slug ? getChannel(slug) : undefined;
  const skin = channel ? stationSkin(channel) : "none";
  const active = Boolean(channel && status === "playing" && (channel.loveBubbles || channel.glaumules || skin === "glaum"));
  const [orbs, setOrbs] = useState<Orb[]>([]);

  useEffect(() => {
    if (!active) {
      setOrbs([]);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const spawn = (kind: Orb["kind"], label?: string) => {
      const id = seq++;
      const orb: Orb = {
        id,
        left: 8 + Math.random() * 84,
        label: label || WORDS[Math.floor(Math.random() * WORDS.length)],
        kind,
      };
      setOrbs((current) => [...current.slice(-22), orb]);
      window.setTimeout(() => {
        setOrbs((current) => current.filter((item) => item.id !== id));
      }, kind === "pop" ? 2100 : 5100);
    };
    const timer = window.setInterval(() => {
      spawn("float");
      if (Math.random() > 0.55) spawn("float");
    }, 2200);
    spawn("float");
    spawn("float", "glåüm");
    const onLove = (event: Event) => {
      const detail = (event as CustomEvent).detail as { kind?: string } | undefined;
      spawn("pop", detail?.kind === "like" ? "♡" : "glåüm");
      spawn("float", "shrimp");
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
          style={{ left: `${orb.left}%` }}
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
