import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export function MarqueeTitle({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [run, setRun] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [dur, setDur] = useState(12);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const measure = measureRef.current;
    if (!wrap || !measure) return;

    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const check = () => {
      if (reduce) {
        setRun(false);
        return;
      }
      const overflow = measure.scrollWidth > wrap.clientWidth + 2;
      setRun(overflow);
      if (overflow) {
        setDur(Math.min(36, Math.max(9, measure.scrollWidth / 28)));
      }
    };

    check();
    const ro = new ResizeObserver(check);
    ro.observe(wrap);
    const io = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting);
      },
      { rootMargin: "64px 0px" },
    );
    io.observe(wrap);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [text]);

  return (
    <span
      ref={wrapRef}
      className={cn("marquee", run && onScreen && "marquee-run", className)}
      style={{ ["--marquee-dur" as string]: `${dur}s` }}
      title={text}
    >
      <span ref={measureRef} className="marquee-static">
        {text}
      </span>
      {run && onScreen ? (
        <span className="marquee-track" aria-hidden>
          <span className="marquee-copy">{text}</span>
          <span className="marquee-copy">{text}</span>
        </span>
      ) : null}
    </span>
  );
}
