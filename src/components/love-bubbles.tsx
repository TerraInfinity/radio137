import { useEffect, useState } from "react";
import { addGlaumules, GLAUMULE_EVENT, loadGlaumules } from "@/lib/glaumules";
import { cn } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";

type Bubble = { id: number; text: string; x: number; kind: "word" | "pop" };

const GLAUM = ["wow", "omg", "wowie", "shrimply amazing", "weee", "darling", "pearl", "love"];
const WAHE = ["wow", "om", "light", "grace", "love", "waheguru", "peace"];

export function LoveBubbles() {
  const catalog = usePlayerStore((s) => s.catalog);
  const channelSlug = usePlayerStore((s) => s.channelSlug);
  const status = usePlayerStore((s) => s.status);
  const collapsed = usePlayerStore((s) => s.playerCollapsed);
  const channel = catalog.channels.find((item) => item.slug === channelSlug);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  const playing = status === "playing" && Boolean(channel);
  const bubblesOn = Boolean(playing && channel?.loveBubbles);
  const glaumulesOn = Boolean(playing && channel?.glaumules);
  const skin = channel?.skin ?? "none";

  useEffect(() => {
    if (!bubblesOn) {
      setBubbles([]);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const words = skin === "waheguru" ? WAHE : GLAUM;
    const timers: number[] = [];
    const spawn = (text: string, kind: Bubble["kind"] = "word") => {
      const id = Date.now() + Math.random();
      const x = kind === "pop" ? 72 + Math.random() * 18 : 8 + Math.random() * 64;
      setBubbles((list) => [...list.slice(-2), { id, text, x, kind }]);
      timers.push(
        window.setTimeout(() => {
          setBubbles((list) => list.filter((item) => item.id !== id));
        }, kind === "pop" ? 2200 : 5200),
      );
    };
    spawn(words[Math.floor(Math.random() * words.length)]);
    const timer = window.setInterval(() => {
      spawn(words[Math.floor(Math.random() * words.length)]);
    }, 8000 + Math.random() * 4000);
    return () => {
      window.clearInterval(timer);
      for (const id of timers) window.clearTimeout(id);
    };
  }, [bubblesOn, skin]);

  useEffect(() => {
    if (!glaumulesOn) return;
    const tick = window.setInterval(() => {
      addGlaumules(1);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      setBubbles((list) => {
        const id = Date.now();
        window.setTimeout(() => {
          setBubbles((next) => next.filter((item) => item.id !== id));
        }, 2200);
        return [...list.slice(-2), { id, text: "+1", x: 78 + Math.random() * 12, kind: "pop" }];
      });
    }, 14000);
    return () => window.clearInterval(tick);
  }, [glaumulesOn]);

  if (!channel || (!bubblesOn && !glaumulesOn)) return null;

  return (
    <div className="love-layer" aria-hidden>
      {bubbles.map((bubble) => (
        <span
          key={bubble.id}
          className={cn(
            "love-orb",
            bubble.kind === "pop" && "love-orb-pop",
            skin === "waheguru" ? "love-orb-wahe" : "love-orb-glaum",
          )}
          style={{
            left: `${bubble.x}%`,
            bottom: collapsed
              ? "calc(5.25rem + env(safe-area-inset-bottom, 0px))"
              : "calc(10.5rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {bubble.text}
        </span>
      ))}
    </div>
  );
}

export function GlaumuleChip({ className }: { className?: string }) {
  const catalog = usePlayerStore((s) => s.catalog);
  const channelSlug = usePlayerStore((s) => s.channelSlug);
  const status = usePlayerStore((s) => s.status);
  const channel = catalog.channels.find((item) => item.slug === channelSlug);
  const [points, setPoints] = useState(0);
  const show = Boolean(channel?.glaumules && (status === "playing" || status === "paused" || status === "loading"));

  useEffect(() => {
    setPoints(loadGlaumules());
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<number>).detail;
      setPoints(typeof detail === "number" ? detail : loadGlaumules());
    };
    window.addEventListener(GLAUMULE_EVENT, onChange);
    return () => window.removeEventListener(GLAUMULE_EVENT, onChange);
  }, []);

  if (!show) return null;
  return (
    <span
      className={cn(
        "shrink-0 rounded-full bg-glaum/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-glaum-soft",
        className,
      )}
    >
      Glaumules {points}
    </span>
  );
}
