import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GLAUM_STATION } from "@/lib/shrimpify";

const ADS = [
  {
    id: "cooler",
    kicker: "A spot",
    title: "Drink the cool-aid…",
    line: "One shrimp in a glass. Served room temperature, with regard.",
    to: "/channel/$slug" as const,
    slug: GLAUM_STATION,
  },
  {
    id: "hymn",
    kicker: "A hymn card",
    title: "Praise Glåüm",
    line: "Official Glaum Frequency. No church. The station is the hymn.",
    to: "/channel/$slug" as const,
    slug: GLAUM_STATION,
  },
  {
    id: "switch",
    kicker: "Switchboard",
    title: "1-800-SHRIMP-UP",
    line: "Operators are standing by, in a circle, holding hands.",
    to: "/channel/$slug" as const,
    slug: GLAUM_STATION,
  },
  {
    id: "parents",
    kicker: "A recommendation",
    title: "The only station recommended by parents adopting shrimp with disabilities.",
    line: "They said it once, evenly, and went back to the broadcast.",
    to: "/channel/$slug" as const,
    slug: GLAUM_STATION,
  },
  {
    id: "program",
    kicker: "Tonight",
    title: "World Glåümination, tonight at 8.",
    line: "A program listing for the only station.",
    to: "/channel/$slug" as const,
    slug: GLAUM_STATION,
  },
  {
    id: "hands",
    kicker: "Membership",
    title: "The Many Hands need another hand.",
    line: "This does not sign anyone up. It only points at the frequency.",
    to: "/channel/$slug" as const,
    slug: GLAUM_STATION,
  },
  {
    id: "prom",
    kicker: "The ballroom",
    title: "Elevator to the prom.",
    line: "A Glaum Prom spot. The doors open on the album.",
    to: "/albums/$slug" as const,
    slug: "the-glaum-prom",
  },
];

export function SatireAd({ slim = false }: { slim?: boolean }) {
  const [index, setIndex] = useState(0);
  const [hold, setHold] = useState(false);
  const ad = ADS[index % ADS.length];

  useEffect(() => {
    if (hold) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((current) => (current + 1) % ADS.length), 14000);
    return () => window.clearInterval(id);
  }, [hold]);

  return (
    <aside
      className={slim ? "satire-slim" : "satire-rail"}
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocusCapture={() => setHold(true)}
      onBlurCapture={() => setHold(false)}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">From the booth</p>
      <Link
        to={ad.to}
        params={{ slug: ad.slug }}
        className="satire-card"
      >
        <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">{ad.kicker}</span>
        <span className="mt-2 block font-glaum text-2xl leading-tight text-fg">{ad.title}</span>
        <span className="mt-2 block text-sm text-muted">{ad.line}</span>
      </Link>
    </aside>
  );
}
