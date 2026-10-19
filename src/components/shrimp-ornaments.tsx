import { useEffect, useRef } from "react";

/** Margin decoration. The page still receives clicks; only the shrimp and hands do. */

const HANDS = [0, 1, 2, 3, 4];

function OpenHand() {
  return (
    <svg viewBox="0 0 80 96" className="shrimp-hand-svg">
      <g className="shrimp-fingers">
        <rect className="finger" x="8" y="30" width="10" height="28" rx="5" transform="rotate(-16 13 56)" />
        <rect className="finger" x="22" y="10" width="10" height="36" rx="5" />
        <rect className="finger" x="36" y="6" width="10" height="40" rx="5" />
        <rect className="finger" x="50" y="14" width="10" height="32" rx="5" transform="rotate(14 55 46)" />
        <rect className="finger thumb" x="2" y="48" width="11" height="22" rx="5.5" transform="rotate(-50 8 58)" />
      </g>
      <ellipse className="palm" cx="40" cy="64" rx="22" ry="16" />
      <path className="wrist" d="M26 76c2 12 7 16 14 16s12-4 14-16" />
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

type Box = { l: number; t: number; r: number; b: number };
type Gesture = "rest" | "wave" | "beckon";
type Hand = {
  el: HTMLButtonElement;
  fingers: SVGGElement | null;
  x: number;
  y: number;
  tx: number;
  ty: number;
  side: 1 | -1;
  phase: number;
  gesture: Gesture;
  until: number;
  next: number;
  pokedAt: number;
};

function hits(x: number, y: number, w: number, h: number, boxes: Box[]) {
  return boxes.some((box) => x < box.r && x + w > box.l && y < box.b && y + h > box.t);
}

function openSpot(width: number, height: number, boxes: Box[]) {
  let x = width * 0.5;
  let y = height * 0.4;
  for (let tryNo = 0; tryNo < 16; tryNo += 1) {
    x = 8 + Math.random() * Math.max(12, width - 52);
    y = 8 + Math.random() * Math.max(12, height - 60);
    if (!hits(x, y, 36, 44, boxes)) return { x, y };
  }
  return { x, y };
}

export function ShrimpOrnaments() {
  const rootRef = useRef<HTMLDivElement>(null);
  const shrimpRef = useRef<HTMLButtonElement>(null);
  const handsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const handPokes = useRef<number[]>([]);
  const shrimpPoke = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    const shrimp = shrimpRef.current;
    if (!root || !shrimp) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let boxes: Box[] = [];
    const hands: Hand[] = handsRef.current.flatMap((el, index) => {
      if (!el) return [];
      return [
        {
          el,
          fingers: el.querySelector(".shrimp-fingers"),
          x: 8,
          y: 30 + index * 80,
          tx: 8,
          ty: 30 + index * 80,
          side: 1,
          phase: index * 1.3,
          gesture: "rest" as Gesture,
          until: 0,
          next: 1800 + index * 900,
          pokedAt: 0,
        },
      ];
    });

    const measure = () => {
      const host = root.getBoundingClientRect();
      const next: Box[] = [];
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
      hands.forEach((hand, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const cellW = Math.max(40, (host.width - 20) / 3);
        const cellH = Math.max(40, (host.height - 20) / 2);
        let spot = {
          x: 8 + col * cellW + Math.random() * Math.max(8, cellW - 44),
          y: 8 + row * cellH + Math.random() * Math.max(8, cellH - 52),
        };
        if (hits(spot.x, spot.y, 36, 44, boxes)) spot = openSpot(host.width, host.height, boxes);
        hand.x = spot.x;
        hand.y = spot.y;
        hand.tx = spot.x;
        hand.ty = spot.y;
      });
    };

    measure();
    if (reduce) {
      hands.forEach((hand) => {
        hand.el.style.transform = `translate(${hand.x}px, ${hand.y}px)`;
      });
      shrimp.style.transform = "translate(16px, 24px)";
      return;
    }

    const measureTimer = window.setInterval(() => {
      const host = root.getBoundingClientRect();
      const next: Box[] = [];
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
    }, 900);

    let x = 20;
    let y = 36;
    let heading = Math.random() * Math.PI * 2;
    let speed = 0.78;
    let wander = 0.2;
    let wanderUntil = 0;
    let spinUntil = 0;
    let lastShrimpPoke = 0;
    let raf = 0;
    let greeted = -1;
    const swim = (now: number) => {
      if (!document.hidden) {
        const host = root.getBoundingClientRect();
        const w = 64;
        const h = 30;
        if (shrimpPoke.current > lastShrimpPoke) {
          lastShrimpPoke = shrimpPoke.current;
          heading += Math.PI * (0.55 + Math.random() * 0.9);
          speed = 2.7;
          spinUntil = now + 720;
          shrimp.classList.add("is-startled");
          const nearestHand = hands.reduce<{ hand: Hand; dist: number } | null>((best, hand) => {
            const dist = Math.hypot(x + 32 - (hand.x + 18), y + 15 - (hand.y + 22));
            return !best || dist < best.dist ? { hand, dist } : best;
          }, null);
          if (nearestHand && nearestHand.dist < 220) {
            nearestHand.hand.gesture = "wave";
            nearestHand.hand.until = now + 1100;
            nearestHand.hand.el.classList.add("is-poked");
          }
        }
        if (now > spinUntil) shrimp.classList.remove("is-startled");
        if (now > wanderUntil) {
          wander = (Math.random() - 0.5) * 1.1;
          wanderUntil = now + 800 + Math.random() * 1400;
        }
        heading += wander * 0.035;
        speed += (0.82 - speed) * 0.018;
        const margin = 36;
        if (x < margin) heading = Math.atan2(Math.sin(heading), Math.abs(Math.cos(heading)));
        if (x > host.width - w - margin) heading = Math.atan2(Math.sin(heading), -Math.abs(Math.cos(heading)));
        if (y < margin) heading = Math.atan2(Math.abs(Math.sin(heading)), Math.cos(heading));
        if (y > host.height - h - margin) heading = Math.atan2(-Math.abs(Math.sin(heading)), Math.cos(heading));
        const vx = Math.cos(heading) * speed;
        const vy = Math.sin(heading) * speed * 0.7;
        const nx = x + vx;
        const ny = y + vy;
        const hit = boxes.find((box) => nx < box.r && nx + w > box.l && ny < box.b && ny + h > box.t);
        if (hit) {
          const dx = nx + w / 2 - (hit.l + hit.r) / 2;
          const dy = ny + h / 2 - (hit.t + hit.b) / 2;
          heading = Math.atan2(dy, dx);
          speed = Math.max(speed, 1.15);
        } else {
          x = nx;
          y = ny;
        }
        const spin = now < spinUntil ? Math.sin((spinUntil - now) / 70) * 32 : vy * 12;
        shrimp.style.transform = `translate(${x}px, ${y}px) scaleX(${Math.cos(heading) >= 0 ? 1 : -1}) rotate(${spin}deg)`;

        let nearest = -1;
        let nearestDist = 150;
        hands.forEach((hand, index) => {
          const dist = Math.hypot(x + 32 - (hand.x + 18), y + 15 - (hand.y + 22));
          if (dist < nearestDist) {
            nearest = index;
            nearestDist = dist;
          }
          const poke = handPokes.current[index] ?? 0;
          if (poke > hand.pokedAt) {
            hand.pokedAt = poke;
            hand.gesture = Math.random() < 0.5 ? "wave" : "beckon";
            hand.until = now + 1500;
            const spot = openSpot(host.width, host.height, boxes);
            hand.tx = spot.x;
            hand.ty = spot.y;
            hand.el.classList.add("is-poked");
          }
          if (now > hand.next && now > hand.until) {
            hand.gesture = Math.random() < 0.55 ? "wave" : "beckon";
            hand.until = now + 1100 + Math.random() * 500;
            hand.next = now + 4200 + Math.random() * 5200;
            const spot = openSpot(host.width, host.height, boxes);
            hand.tx = spot.x;
            hand.ty = spot.y;
          }
          const ease = now < hand.until && hand.pokedAt > 0 && now - hand.pokedAt < 1500 ? 0.085 : 0.03;
          hand.x += (hand.tx - hand.x) * ease;
          hand.y += (hand.ty - hand.y) * ease;
          if (now > hand.until) hand.el.classList.remove("is-poked");
        });
        if (nearest >= 0 && nearest !== greeted && nearestDist < 130) {
          const hand = hands[nearest];
          if (hand && now > hand.until) {
            hand.gesture = "wave";
            hand.until = now + 900;
            greeted = nearest;
          }
        }
        if (nearest < 0 || nearestDist > 180) greeted = -1;

        hands.forEach((hand) => {
          const active = now < hand.until;
          const poked = now - hand.pokedAt < 1500;
          const bob = Math.sin(now / 780 + hand.phase) * (poked ? 7 : 4.5);
          const sway = Math.sin(now / 1300 + hand.phase) * (poked ? 12 : 7);
          const driftX = Math.sin(now / 1500 + hand.phase) * 8;
          const driftY = Math.sin(now / 1100 + hand.phase) * Math.cos(now / 1500 + hand.phase) * 6;
          const toward = Math.atan2(y + 15 - (hand.y + 30), x + 32 - (hand.x + 18)) * (180 / Math.PI);
          const lean = nearestDist < 180 && hands[nearest] === hand ? toward * 0.12 : 0;
          let finger = sway * 0.2;
          let curl = 1;
          if (active && hand.gesture === "wave") finger = Math.sin(now / (poked ? 90 : 130)) * (poked ? 26 : 18);
          if (active && hand.gesture === "beckon") {
            finger = -12 + Math.sin(now / 180) * 12;
            curl = 0.78 + Math.sin(now / 180) * 0.12;
          }
          if (hand.fingers) hand.fingers.style.transform = `rotate(${finger}deg) scaleY(${curl})`;
          const face = x + 32 > hand.x ? 1 : -1;
          hand.el.style.transform = `translate(${hand.x + driftX}px, ${hand.y + bob + driftY}px) rotate(${sway + lean}deg) scaleX(${face})`;
        });
      }
      raf = window.requestAnimationFrame(swim);
    };
    raf = window.requestAnimationFrame(swim);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearInterval(measureTimer);
    };
  }, []);

  return (
    <div ref={rootRef} className="shrimp-ornaments">
      <span className="shrimp-dial" aria-hidden />
      <span className="shrimp-bubble bubble-a" aria-hidden />
      <span className="shrimp-bubble bubble-b" aria-hidden />
      <span className="shrimp-bubble bubble-c" aria-hidden />
      <span className="shrimp-bubble bubble-d" aria-hidden />
      {HANDS.map((id) => (
        <button
          key={id}
          type="button"
          className="shrimp-hand"
          aria-label="Wave"
          ref={(node) => {
            handsRef.current[id] = node;
          }}
          onClick={(event) => {
            handPokes.current[id] = performance.now();
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
              event.currentTarget.classList.add("is-poked");
              window.setTimeout(() => event.currentTarget.classList.remove("is-poked"), 700);
            }
          }}
        >
          <OpenHand />
        </button>
      ))}
      <button
        ref={shrimpRef}
        type="button"
        className="shrimp-swimmer"
        aria-label="Startle the shrimp"
        onClick={(event) => {
          shrimpPoke.current = performance.now();
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            event.currentTarget.classList.add("is-startled");
            window.setTimeout(() => event.currentTarget.classList.remove("is-startled"), 700);
          }
        }}
      >
        <CuteShrimp />
      </button>
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
