import { useState } from "react";
import { cn } from "@/lib/cn";
import { useShrimp, useShrimpToggle } from "@/components/shrimp-context";

export function ShrimpToggle() {
  const on = useShrimp();
  const toggle = useShrimpToggle();
  const [motion, setMotion] = useState<"" | "in" | "out">("");

  function press() {
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) setMotion(on ? "out" : "in");
    toggle();
    if (!reduce) window.setTimeout(() => setMotion(""), 520);
  }

  return (
    <button
      type="button"
      onClick={press}
      aria-pressed={on}
      aria-label={on ? "Glåüm Radio" : "Shrimpify"}
      title={on ? "Glåüm Radio" : "Shrimpify"}
      className="inline-flex size-11 shrink-0 items-center justify-center"
    >
      <svg viewBox="0 0 32 32" className={cn("shrimp-mark", on && "is-live", motion && `is-${motion}`)} aria-hidden>
        <path className="shrimp-fan" d="M5.2 18.6c.2 2.4 2.2 3.6 3.8 2.6" />
        <path className="shrimp-fan" d="M5.6 21.4c1.2 2 3.4 2.2 4.4.6" />
        <path className="shrimp-body" d="M9.2 20.8c.4-5.6 5.2-9.4 10.6-8.4 3.6.6 6 3.6 5.2 6.6-.8 3.4-4.8 5.4-8.2 4.2-2-.7-3.4-2.2-3.6-2.2" />
        <path className="shrimp-band" d="M14.2 16.2c1.2 1.4 2.2 1.6 3.4.4" />
        <path className="shrimp-band" d="M17.2 14.4c1.1 1.5 2.2 1.6 3.3.2" />
        <path className="shrimp-feel" d="M20.4 12.2c1.2-2.4 2.6-3.6 2.2-5.4" />
        <path className="shrimp-feel" d="M22.2 12.6c2-1.6 3.4-2 4.2-3.6" />
        <circle className="shrimp-eye" cx="23.4" cy="15.2" r="1.35" />
        <circle className="shrimp-glint" cx="23.85" cy="14.75" r="0.38" />
        <path className="shrimp-smile" d="M21.6 17.3c.7.55 1.6.5 2.2-.1" />
        <circle className="shrimp-blush" cx="20.2" cy="17.1" r="0.7" />
      </svg>
    </button>
  );
}
