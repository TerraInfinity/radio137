import { useEffect, useRef } from "react";

/** Margin decoration only. It never takes clicks. */

const HANDS = [0, 1, 2, 3, 4];

function OpenHand() {
  return (
    <svg viewBox="0 0 80 96" className="shrimp-hand-svg">
      <g className="shrimp-fingers">
        <rect className="finger" x="8" y="30" width="11" height="30" rx="5.5" transform="rotate(-18 13 58)" />
        <rect className="finger" x="22" y="8" width="11" height="40" rx="5.5" />
        <rect className="finger" x="36" y="4" width="11" height="44" rx="5.5" />
        <rect className="finger" x="50" y="12" width="11" height="36" rx="5.5" transform="rotate(16 55 48)" />
        <rect className="finger thumb" x="0" y="46" width="12" height="24" rx="6" transform="rotate(-52 6 58)" />
      </g>
      <ellipse className="palm" cx="40" cy="64" rx="24" ry="18" />
      <path className="wrist" d="M24 78c2 12 8 16 16 16s14-4 16-16" />
    </svg>
  );
}

function CuteShrimp() {
  return (
    <svg viewBox="0 0 96 44" className="shrimp-swim-svg">
      <g className="shrimp-tail">
        <path d="M14 22 2 8" />
        <path d="M14 22 0 22" />
        <path d="M14 22 3 36" />
      </g>
      <path className="shrimp-swim-body" d="M12 23c10-12 32-14 52-4 10 5 18 3 26-3-3 10-12 16-24 17C46 35 26 33 14 26c-2 0-2-2-2-3z" />
      <path className="shrimp-swim-band" d="M34 14c2 8 2 12 0 16" />
      <path className="shrimp-swim-band" d="M48 13c2 8 2 13 0 17" />
      <path className="shrimp-swim-feel" d="M78 16c8-8 14-8 18-2" />
      <circle className="shrimp-swim-eye" cx="74" cy="18" r="3.4" />
      <circle className="shrimp-swim-glint" cx="75.2" cy="16.8" r="1.1" />
      <path className="shrimp-swim-smile" d="M68 24c2.4 2.2 6 2 8.2-.4" />
    </svg>
  );
}

function hits(x: number, y: number, w: number, h: number, boxes: Array<{ l: number; t: number; r: number; b: number }>) {
  return boxes.some((box) => x < box.r && x + w > box.l && y < box.b && y + h > box.t);
}

export function ShrimpOrnaments() {
  const rootRef = useRef<HTMLDivElement>(null);
  const shrimpRef = useRef<HTMLDivElement>(null);
  const handsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;
    const shrimp = shrimpRef.current;
    if (!root || !shrimp) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let boxes: Array<{ l: number; t: number; r: number; b: number }> = [];

    const measure = () => {
      const host = root.getBoundingClientRect();
      const next: typeof boxes = [];
      document
        .querySelectorAll(".radio-main h1, .radio-main h2, .radio-main p, .radio-main a, .radio-main button, .radio-main input, .radio-main section, .radio-main li, .radio-main form, .glaum-cabinet, .satire-card")
        .forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width < 12 || rect.height < 12) return;
          next.push({
            l: rect.left - host.left - 16,
            t: rect.top - host.top - 14,
            r: rect.right - host.left + 16,
            b: rect.bottom - host.top + 14,
          });
        });
      boxes = next;
    };

    const placeHands = (wave: boolean) => {
      const host = root.getBoundingClientRect();
      handsRef.current.forEach((hand, index) => {
        if (!hand) return;
        let x = 12;
        let y = 24 + index * 70;
        for (let tryNo = 0; tryNo < 14; tryNo += 1) {
          const gutter = Math.random() < 0.72;
          x = gutter ? (Math.random() < 0.5 ? 6 : host.width - 48) : Math.random() * Math.max(8, host.width - 48);
          y = 8 + Math.random() * Math.max(8, host.height - 90);
          if (!hits(x, y, 40, 48, boxes)) break;
        }
        hand.style.left = `${x}px`;
        hand.style.top = `${y}px`;
        if (wave && !reduce && Math.random() < 0.6) {
          hand.classList.remove("is-waving");
          void hand.offsetWidth;
          hand.classList.add("is-waving");
        }
      });
    };

    measure();
    placeHands(false);
    if (reduce) {
      shrimp.style.transform = "translate(16px, 24px)";
      return;
    }

    const measureTimer = window.setInterval(measure, 900);
    const handTimer = window.setInterval(() => placeHands(true), 5200);
    let x = 20;
    let y = 36;
    let vx = 0.85;
    let vy = 0.28;
    let raf = 0;
    const swim = () => {
      if (!document.hidden) {
        const host = root.getBoundingClientRect();
        const w = 64;
        const h = 30;
        if (x < 2 || x > host.width - w) vx = Math.abs(vx) * (x < 2 ? 1 : -1);
        if (y < 2 || y > host.height - h) vy = Math.abs(vy) * (y < 2 ? 1 : -1);
        const nx = x + vx;
        const ny = y + vy;
        const hit = boxes.find((box) => nx < box.r && nx + w > box.l && ny < box.b && ny + h > box.t);
        if (hit) {
          const dx = nx + w / 2 - (hit.l + hit.r) / 2;
          const dy = ny + h / 2 - (hit.t + hit.b) / 2;
          const len = Math.hypot(dx, dy) || 1;
          vx = (dx / len) * 1.05;
          vy = (dy / len) * 1.05;
        } else {
          x = nx;
          y = ny;
        }
        shrimp.style.transform = `translate(${x}px, ${y}px) scaleX(${vx >= 0 ? 1 : -1}) rotate(${vy * 14}deg)`;
      }
      raf = window.requestAnimationFrame(swim);
    };
    raf = window.requestAnimationFrame(swim);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearInterval(measureTimer);
      window.clearInterval(handTimer);
    };
  }, []);

  return (
    <div ref={rootRef} className="shrimp-ornaments" aria-hidden>
      <span className="shrimp-dial" />
      <span className="shrimp-bubble bubble-a" />
      <span className="shrimp-bubble bubble-b" />
      <span className="shrimp-bubble bubble-c" />
      <span className="shrimp-bubble bubble-d" />
      {HANDS.map((id) => (
        <div
          key={id}
          className="shrimp-hand"
          ref={(node) => {
            handsRef.current[id] = node;
          }}
          style={{ left: id % 2 ? "auto" : 8, right: id % 2 ? 8 : "auto", top: 36 + id * 90 }}
        >
          <OpenHand />
        </div>
      ))}
      <div ref={shrimpRef} className="shrimp-swimmer">
        <CuteShrimp />
      </div>
    </div>
  );
}

export function OnAirLamp() {
  return (
    <span className="on-air-lamp">
      <span className="on-air-dot" />
      On the air
    </span>
  );
}
