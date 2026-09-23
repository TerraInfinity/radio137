import { useEffect, useRef } from "react";
import { displayAsleep, onDisplayRest } from "@/lib/display-rest";

type Petal = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
  size: number;
  tilt: number;
};

function makePetal(rand = Math.random): Petal {
  return {
    x: rand(),
    y: rand(),
    vx: (rand() - 0.5) * 0.04,
    vy: 0.018 + rand() * 0.02,
    rot: rand() * Math.PI * 2,
    spin: (rand() - 0.5) * 0.6,
    size: 10 + rand() * 16,
    tilt: rand() * Math.PI,
  };
}

function paintPetal(ctx: CanvasRenderingContext2D, size: number, fill: string, vein: string) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.55, -size * 0.15, size * 0.42, -size * 0.82, 0, -size);
  ctx.bezierCurveTo(-size * 0.42, -size * 0.82, -size * 0.55, -size * 0.15, 0, 0);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = vein;
  ctx.lineWidth = Math.max(0.6, size * 0.035);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.08);
  ctx.quadraticCurveTo(size * 0.04, -size * 0.5, 0, -size * 0.92);
  ctx.stroke();
}

function paintRose(ctx: CanvasRenderingContext2D, radius: number, turn: number, open: number, pale: boolean) {
  const layers = pale
    ? [
        { n: 7, scale: 1, fill: "rgba(251, 247, 243, 0.42)", vein: "rgba(196, 92, 106, 0.7)" },
        { n: 6, scale: 0.68, fill: "rgba(255, 244, 236, 0.62)", vein: "rgba(196, 92, 106, 0.8)" },
        { n: 5, scale: 0.4, fill: "rgba(255, 250, 246, 0.86)", vein: "rgba(201, 163, 106, 0.9)" },
      ]
    : [
        { n: 7, scale: 1, fill: "rgba(244, 228, 196, 0.28)", vein: "rgba(201, 163, 106, 0.5)" },
        { n: 6, scale: 0.66, fill: "rgba(255, 236, 210, 0.4)", vein: "rgba(201, 163, 106, 0.62)" },
        { n: 5, scale: 0.38, fill: "rgba(255, 248, 236, 0.62)", vein: "rgba(201, 163, 106, 0.8)" },
      ];
  layers.forEach((layer, index) => {
    const spin = turn * (index % 2 === 0 ? 1 : -1) * (0.15 + index * 0.05);
    for (let i = 0; i < layer.n; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * i) / layer.n + spin);
      paintPetal(ctx, radius * layer.scale * open, layer.fill, layer.vein);
      ctx.restore();
    }
  });
  ctx.beginPath();
  ctx.fillStyle = pale ? "rgba(255, 214, 170, 0.85)" : "rgba(232, 196, 122, 0.8)";
  ctx.arc(0, 0, Math.max(2.5, radius * 0.07), 0, Math.PI * 2);
  ctx.fill();
}

export function PlayerMastRose({ pale = true }: { pale?: boolean }) {
  return (
    <svg className="player-mast-rose" viewBox="0 0 64 64" aria-hidden>
      <g transform="translate(32 36)">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-12"
            rx="7.5"
            ry="14"
            transform={`rotate(${deg})`}
            fill={pale ? "#fbf7f3" : "#f4e4c4"}
            stroke={pale ? "#c45c6a" : "#c9a36a"}
            strokeWidth="0.8"
          />
        ))}
        {[30, 90, 150, 210, 270, 330].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-8"
            rx="5.2"
            ry="10"
            transform={`rotate(${deg})`}
            fill={pale ? "#fffaf6" : "#fff6e8"}
            stroke={pale ? "#e8a8b0" : "#e7c98a"}
            strokeWidth="0.7"
          />
        ))}
        <circle cx="0" cy="0" r="3.2" fill={pale ? "#ffd6aa" : "#e8c47a"} />
      </g>
    </svg>
  );
}

export function PlayerBloom({
  playing,
  time,
  skin,
}: {
  playing: boolean;
  time: number;
  skin: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(time);
  const playingRef = useRef(playing);
  timeRef.current = time;
  playingRef.current = playing;
  const rose = skin === "rose";

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const petals = Array.from({ length: 16 }, () => makePetal());
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;

    const fit = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      if (displayAsleep()) {
        raf = 0;
        return;
      }
      const t = reduce ? 0 : now / 1000;
      const clock = timeRef.current;
      const live = playingRef.current && !reduce;
      const kick = live ? Math.max(0, Math.sin(clock * Math.PI * 1.9)) ** 6 : 0.08;
      ctx.clearRect(0, 0, w, h);
      const glow = ctx.createRadialGradient(w * 0.32, h * 0.42, 10, w * 0.45, h * 0.5, Math.max(w, h) * 0.72);
      if (rose) {
        glow.addColorStop(0, `rgba(255, 214, 196, ${0.16 + kick * 0.12})`);
        glow.addColorStop(0.45, "rgba(196, 92, 106, 0.05)");
        glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        glow.addColorStop(0, `rgba(201, 163, 106, ${0.12 + kick * 0.1})`);
        glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      }
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const roses = [
        { x: 0.74, y: 0.42, s: 0.22 },
        { x: 0.18, y: 0.22, s: 0.1 },
      ];
      for (const roseAt of roses) {
        ctx.save();
        ctx.translate(w * roseAt.x, h * roseAt.y);
        paintRose(ctx, Math.min(w, h) * roseAt.s, t * 0.15, 0.92 + kick * 0.08, rose);
        ctx.restore();
      }

      for (let i = 0; i < 3; i++) {
        const p = ((t * 0.18 + i / 3) % 1);
        ctx.beginPath();
        ctx.strokeStyle = rose ? `rgba(251, 247, 243, ${0.28 * (1 - p)})` : `rgba(201, 163, 106, ${0.24 * (1 - p)})`;
        ctx.lineWidth = 1.25;
        ctx.ellipse(w * 0.74, h * 0.42, 36 + p * Math.min(w, h) * 0.34, 24 + p * Math.min(w, h) * 0.2, t * 0.05, 0, Math.PI * 2);
        ctx.stroke();
      }

      const dt = 1 / 60;
      for (const petal of petals) {
        if (live) {
          petal.x += petal.vx * dt + Math.sin(t * 0.7 + petal.tilt) * 0.0008;
          petal.y += (petal.vy + kick * 0.01) * dt * 8;
          petal.rot += petal.spin * dt;
          if (petal.y > 1.08) {
            petal.y = -0.08;
            petal.x = Math.random();
          }
        }
        ctx.save();
        ctx.translate(petal.x * w, petal.y * h);
        ctx.rotate(petal.rot);
        ctx.globalAlpha = 0.72;
        paintPetal(
          ctx,
          petal.size,
          rose ? "rgba(251, 247, 243, 0.55)" : "rgba(244, 228, 196, 0.4)",
          rose ? "rgba(196, 92, 106, 0.45)" : "rgba(201, 163, 106, 0.4)",
        );
        ctx.restore();
      }

      if (!reduce) raf = requestAnimationFrame(draw);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(parent);
    raf = requestAnimationFrame(draw);
    const unlisten = onDisplayRest(
      () => {
        cancelAnimationFrame(raf);
        raf = 0;
      },
      () => {
        if (!raf && !reduce) raf = requestAnimationFrame(draw);
      },
    );
    return () => {
      unlisten();
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [rose]);

  return <canvas ref={canvasRef} className="player-bloom" aria-hidden />;
}
