import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export function MarqueeTitle({ text, className }: { text: string; className?: string }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [run, setRun] = useState(false);
  const [dur, setDur] = useState(14);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const probe = probeRef.current;
    if (!wrap || !probe) return;

    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const check = () => {
      if (reduce) {
        setRun(false);
        return;
      }
      const room = wrap.clientWidth;
      if (room < 8) return;
      const need = probe.scrollWidth - room > 2;
      setRun(need);
      if (need) {
        setDur(Math.min(42, Math.max(8, probe.scrollWidth / 30)));
      }
    };

    check();
    const fonts = document.fonts?.ready?.then(check);
    const ro = new ResizeObserver(check);
    ro.observe(wrap);
    ro.observe(probe);
    window.addEventListener("resize", check);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", check);
      void fonts;
    };
  }, [text]);

  return (
    <span
      ref={wrapRef}
      className={cn("marquee", run && "marquee-overflow", run && "marquee-run", className)}
      style={{ ["--marquee-dur" as string]: `${dur}s` }}
      title={text}
    >
      <span className="marquee-static">{text}</span>
      <span ref={probeRef} className="marquee-probe" aria-hidden>
        {text}
      </span>
      {run ? (
        <span className="marquee-track" aria-hidden>
          <span className="marquee-copy">{text}</span>
          <span className="marquee-copy">{text}</span>
        </span>
      ) : null}
    </span>
  );
}
