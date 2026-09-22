import { useEffect, useRef } from "react";
import type { RoseLook } from "@/lib/rose-look";
import type { RosePulse } from "@/lib/rose-pulse";

type Star = { a: number; r: number; z: number; len: number };
type Glyph = { a: number; r: number; z: number; kind: number };

function makeStars(n: number): Star[] {
  const out: Star[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      a: Math.random() * Math.PI * 2,
      r: 0.18 + Math.random() * 0.95,
      z: Math.random(),
      len: 0.012 + Math.random() * 0.04,
    });
  }
  return out;
}

function makeGlyphs(n: number): Glyph[] {
  const out: Glyph[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      a: (i / n) * Math.PI * 2 + 0.4,
      r: 0.55 + (i % 5) * 0.08,
      z: (i * 0.137) % 1,
      kind: i % 3,
    });
  }
  return out;
}

function resizeList<T>(list: T[], n: number, make: (i: number) => T) {
  if (list.length < n) {
    for (let i = list.length; i < n; i++) list.push(make(i));
  } else if (list.length > n) {
    list.length = n;
  }
}

function project(x: number, y: number, z: number, cx: number, cy: number, fov: number) {
  const depth = Math.max(0.08, z);
  const s = fov / depth;
  return { x: cx + x * s, y: cy + y * s, s };
}

function drawTardis(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, lamp: number, yaw: number) {
  const w = 18 * scale;
  const h = 32 * scale;
  const depth = 10 * scale * Math.sin(yaw);
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = `rgba(0, 40, 82, ${0.82 + lamp * 0.12})`;
  ctx.strokeStyle = `rgba(180, 220, 255, ${0.35 + lamp * 0.4})`;
  ctx.lineWidth = Math.max(1, scale * 0.6);
  ctx.beginPath();
  ctx.moveTo(-w, -h);
  ctx.lineTo(w, -h);
  ctx.lineTo(w + depth, -h + 4);
  ctx.lineTo(w + depth, h + 4);
  ctx.lineTo(-w, h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = `rgba(8, 22, 48, 0.9)`;
  ctx.fillRect(-w + 2, -h + 8, w * 2 - 4, 6 * scale);
  ctx.fillStyle = `rgba(232, 226, 214, ${0.75 + lamp * 0.25})`;
  ctx.font = `${Math.max(4, 3.4 * scale)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("POLICE", 0, -h + 13 * Math.min(scale, 1.6));
  const cols = 2;
  const rows = 3;
  const gw = (w * 1.4) / cols;
  const gh = (h * 0.55) / rows;
  const gx = -w + 4;
  const gy = -h + 18 * Math.min(scale, 1.8);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = `rgba(154, 212, 255, ${0.18 + lamp * 0.45})`;
      ctx.fillRect(gx + c * gw, gy + r * gh, gw - 2, gh - 2);
      ctx.strokeStyle = "rgba(200, 230, 255, 0.35)";
      ctx.strokeRect(gx + c * gw, gy + r * gh, gw - 2, gh - 2);
    }
  }
  ctx.beginPath();
  ctx.fillStyle = `rgba(255, 250, 205, ${0.45 + lamp * 0.55})`;
  ctx.shadowColor = "#fffacd";
  ctx.shadowBlur = 12 + lamp * 28;
  ctx.arc(0, -h - 4 * scale, 2.4 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function bolt(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, seed: number, alpha: number) {
  ctx.save();
  ctx.strokeStyle = `rgba(186, 230, 255, ${alpha})`;
  ctx.lineWidth = 1.4;
  ctx.shadowColor = "#6ec8d4";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  const steps = 7;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const jx = (Math.sin(seed * 12 + i * 3.1) * 18) * (1 - Math.abs(t - 0.5) * 1.4);
    const jy = (Math.cos(seed * 9 + i * 2.4) * 14) * (1 - Math.abs(t - 0.5));
    ctx.lineTo(x0 + (x1 - x0) * t + jx, y0 + (y1 - y0) * t + jy);
  }
  ctx.stroke();
  ctx.restore();
}

type Petal = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
  size: number;
  life: number;
  max: number;
  sway: number;
};

const SPRITES = {
  petal: "/experiences/rose/white-petal.jpg",
  sword: "/experiences/rose/elven-sword.jpg",
  antlers: "/experiences/rose/antlers.jpg",
};

function loadSprite(src: string) {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  return img;
}

function drawPetalShape(ctx: CanvasRenderingContext2D, size: number) {
  ctx.beginPath();
  ctx.moveTo(0, size * 0.85);
  ctx.bezierCurveTo(size * 1.05, size * 0.15, size * 0.78, -size * 0.72, 0, -size);
  ctx.bezierCurveTo(-size * 0.78, -size * 0.72, -size * 1.05, size * 0.15, 0, size * 0.85);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, -size, 0, size);
  g.addColorStop(0, "rgba(255, 252, 248, 0.92)");
  g.addColorStop(0.45, "rgba(255, 244, 236, 0.78)");
  g.addColorStop(1, "rgba(236, 214, 214, 0.35)");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
  ctx.lineWidth = 0.6;
  ctx.stroke();
}

function drawLaserI(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, glow: number) {
  ctx.save();
  ctx.shadowColor = "#ff2a2a";
  ctx.shadowBlur = 18 + glow * 28;
  ctx.fillStyle = `rgba(255, 42, 42, ${0.55 + glow * 0.45})`;
  ctx.fillRect(x - 1.1, y, 2.2, h);
  ctx.shadowBlur = 6;
  ctx.fillStyle = `rgba(255, 230, 230, ${0.65 + glow * 0.35})`;
  ctx.fillRect(x - 0.45, y + 1, 0.9, h - 2);
  ctx.restore();
}

function ready(img: HTMLImageElement) {
  return img.complete && img.naturalWidth > 0;
}

export function RoseVortex({
  pulseRef,
  lookRef,
  playing,
  reduce,
}: {
  pulseRef: { current: RosePulse };
  lookRef: { current: RoseLook };
  playing: boolean;
  reduce: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const glyphsRef = useRef<Glyph[]>([]);
  const petalsRef = useRef<Petal[]>([]);
  const glareRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const lastBeatRef = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    starsRef.current = makeStars(lookRef.current.stars);
    glyphsRef.current = makeGlyphs(lookRef.current.glyphs);
    const petalImg = loadSprite(SPRITES.petal);
    const swordImg = loadSprite(SPRITES.sword);
    const antlerImg = loadSprite(SPRITES.antlers);
    let raf = 0;
    let last = performance.now();
    let tunnel = 0;
    let spin = 0;

    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const pulse = pulseRef.current;
      const look = lookRef.current;
      const kind = look.phenomenon || "vortex";
      resizeList(starsRef.current, look.stars, (i) => makeStars(1)[0] ?? { a: i, r: 0.4, z: Math.random(), len: 0.02 });
      resizeList(glyphsRef.current, kind === "void" || kind === "still-rite" ? 0 : look.glyphs, (i) => makeGlyphs(1)[0] ?? { a: i, r: 0.6, z: Math.random(), kind: i % 3 });
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      const cx = w * 0.5;
      const cy = h * 0.42;
      const fov = Math.min(w, h) * 0.55;
      const live = playing && !document.hidden;
      const energy = pulse.energy * look.intensity;
      const fly = (live ? pulse.flying : 0.05) * look.fly * (kind === "void" ? 0.35 : kind === "still-rite" ? 0.4 : 1);
      tunnel += dt * (0.22 + fly * 0.95);
      spin += dt * (0.18 + pulse.kick * 1.4 + energy * 0.5) * (live ? 1 : 0) * (kind === "void" ? 0.4 : 1);

      ctx.fillStyle = kind === "aurora" ? "rgba(4, 10, 18, 0.38)" : "rgba(7, 3, 10, 0.42)";
      ctx.fillRect(0, 0, w, h);

      const g = ctx.createRadialGradient(cx, cy, 8, cx, cy, Math.max(w, h) * 0.7);
      if (kind === "aurora") {
        g.addColorStop(0, `rgba(90, 220, 180, ${0.1 + energy * 0.16})`);
        g.addColorStop(0.45, `rgba(210, 57, 248, ${0.08 + pulse.downbeat * 0.14})`);
        g.addColorStop(1, "rgba(4, 10, 18, 0.2)");
      } else if (kind === "petals") {
        g.addColorStop(0, `rgba(255, 186, 210, ${0.1 + energy * 0.12})`);
        g.addColorStop(0.4, `rgba(110, 200, 212, ${0.06 + pulse.kick * 0.1})`);
        g.addColorStop(1, "rgba(7, 3, 10, 0.22)");
      } else {
        g.addColorStop(0, `rgba(110, 200, 212, ${0.08 + energy * 0.12})`);
        g.addColorStop(0.35, `rgba(196, 92, 40, ${0.07 + pulse.downbeat * 0.12})`);
        g.addColorStop(1, "rgba(7, 3, 10, 0.2)");
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      if (kind === "aurora") {
        for (let i = 0; i < 8; i++) {
          const x = ((i + 0.5) / 8) * w + Math.sin(spin * 1.1 + i) * 28;
          const curtain = ctx.createLinearGradient(x, 0, x + 90, h);
          curtain.addColorStop(0, `rgba(110, 200, 212, ${0.02 + energy * 0.08})`);
          curtain.addColorStop(0.45, `rgba(210, 57, 248, ${0.05 + pulse.kick * 0.12})`);
          curtain.addColorStop(1, "rgba(4, 10, 18, 0)");
          ctx.fillStyle = curtain;
          ctx.fillRect(x - 40, 0, 88, h);
        }
      }

      for (const star of starsRef.current) {
        if (live) star.z -= dt * (0.35 + fly * 1.6) * (0.4 + star.len * 8);
        if (star.z < 0) star.z += 1;
        const z = star.z * 3.2 + 0.12;
        const x = Math.cos(star.a + spin * 0.15) * star.r;
        const y = Math.sin(star.a + spin * 0.15) * star.r * 0.62;
        const p = project(x, y, z, cx, cy, fov);
        const p2 = project(x, y, z + star.len * 8, cx, cy, fov);
        ctx.strokeStyle = `rgba(243, 237, 230, ${0.12 + (1 - star.z) * 0.55})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      const drawRings = kind === "vortex" || kind === "glyphs";
      const rings = drawRings ? look.rings : 0;
      for (let i = 0; i < rings; i++) {
        const u = (i / Math.max(1, rings) + tunnel * 0.08) % 1;
        const z = 0.18 + u * 3.4;
        const radius = 0.62 + Math.sin(i * 0.7 + spin) * 0.04 + pulse.kick * 0.05;
        const twist = spin * 0.9 + i * 0.21;
        ctx.beginPath();
        for (let s = 0; s <= 48; s++) {
          const a = (s / 48) * Math.PI * 2 + twist;
          const wobble = 1 + Math.sin(a * 3 + spin * 2) * (0.03 + energy * 0.04);
          const p = project(Math.cos(a) * radius * wobble, Math.sin(a) * radius * 0.62 * wobble, z, cx, cy, fov);
          if (s === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        const near = 1 - u;
        const cyan = `rgba(110, 200, 212, ${0.05 + near * 0.32 + pulse.kick * 0.2})`;
        const gold = `rgba(201, 163, 106, ${0.04 + near * 0.28 + pulse.snare * 0.22})`;
        ctx.strokeStyle = i % 2 === 0 ? cyan : gold;
        ctx.lineWidth = 1 + near * 1.6 + pulse.downbeat * 1.4;
        ctx.stroke();
      }

      for (const glyph of glyphsRef.current) {
        if (live) glyph.z -= dt * (0.12 + fly * 0.35);
        if (glyph.z < 0) glyph.z += 1;
        const z = 0.25 + glyph.z * 2.8;
        const a = glyph.a + spin * 0.35;
        const p = project(Math.cos(a) * glyph.r, Math.sin(a) * glyph.r * 0.6, z, cx, cy, fov);
        const size = Math.max(4, Math.min(26, p.s * 0.04));
        ctx.strokeStyle = `rgba(210, 57, 248, ${0.08 + (1 - glyph.z) * 0.28})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.stroke();
        if (glyph.kind !== 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 0.55, a, a + 1.8);
          ctx.stroke();
        }
        if (glyph.kind === 2) {
          ctx.beginPath();
          ctx.arc(p.x + size * 0.35, p.y - size * 0.1, size * 0.28, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      if (look.bolts && kind !== "void" && kind !== "still-rite" && pulse.downbeat > 0.2 && live) {
        bolt(ctx, cx, cy, cx - w * 0.38, cy - h * 0.2, pulse.beatIndex + 0.2, pulse.downbeat * 0.85);
        bolt(ctx, cx, cy, cx + w * 0.34, cy + h * 0.18, pulse.beatIndex + 1.1, pulse.downbeat * 0.7);
      }

      if (ready(antlerImg)) {
        const aw = Math.min(w * 0.92, 720);
        const ah = aw * (antlerImg.naturalHeight / antlerImg.naturalWidth);
        ctx.save();
        ctx.globalAlpha = 0.5 + energy * 0.18 + pulse.downbeat * 0.12;
        ctx.drawImage(antlerImg, cx - aw / 2, -ah * 0.28 + pulse.kick * 4, aw, ah);
        ctx.restore();
      }

      if (ready(swordImg)) {
        const sh = h * 1.05;
        const sw = sh * (swordImg.naturalWidth / swordImg.naturalHeight);
        const bob = Math.sin(pulse.time * 0.7) * 6 + pulse.kick * 8;
        ctx.save();
        ctx.globalAlpha = 0.72 + energy * 0.18;
        ctx.drawImage(swordImg, -sw * 0.38, h - sh * 0.82 + bob, sw, sh);
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(swordImg, -sw * 0.38, h - sh * 0.82 - bob * 0.6, sw, sh);
        ctx.restore();
      }

      if (look.box && (kind === "vortex" || kind === "petals")) {
        const pathT = pulse.time * 0.33 * look.fly;
        const helix = 0.22 + energy * 0.05;
        const tx = Math.sin(pathT) * helix;
        const ty = Math.cos(pathT * 0.85) * helix * 0.42;
        const tz = 0.55 + (Math.sin(pathT * 0.5) * 0.5 + 0.5) * 1.35;
        const tardis = project(tx, ty, tz, cx, cy, fov);
        const scale = Math.max(0.55, Math.min(2.8, tardis.s * 0.048 + pulse.kick * 0.12));
        drawTardis(ctx, tardis.x, tardis.y, scale, Math.min(1, pulse.kick * 0.7 + pulse.downbeat + 0.25), pathT);
      }

      if (look.petals && kind !== "void" && kind !== "still-rite") {
        const petals = petalsRef.current;
        const beat = pulse.beatIndex;
        if (live && petals.length < 4) {
          const since = now - lastSpawnRef.current;
          const sparse = since > 2800 + (beat % 7) * 700;
          const onKick = beat !== lastBeatRef.current && pulse.downbeat > 0.55 && Math.random() < 0.22;
          const onPhrase = pulse.snare > 0.55 && pulse.phrasePhase > 0.9 && Math.random() < 0.35;
          if (sparse || onKick || onPhrase) {
            lastSpawnRef.current = now;
            lastBeatRef.current = beat;
            petals.push({
              x: 0.08 + Math.random() * 0.84,
              y: -0.1 - Math.random() * 0.08,
              vx: (Math.random() - 0.52) * 0.05,
              vy: 0.035 + Math.random() * 0.04,
              rot: Math.random() * Math.PI * 2,
              spin: (Math.random() - 0.5) * 0.55,
              size: 26 + Math.random() * 38,
              life: 0,
              max: 8 + Math.random() * 7,
              sway: Math.random() * Math.PI * 2,
            });
          }
        }
        for (let i = petals.length - 1; i >= 0; i--) {
          const petal = petals[i];
          if (!petal) continue;
          if (live) {
            petal.life += dt;
            petal.sway += dt * (0.7 + energy);
            petal.x += (petal.vx + Math.sin(petal.sway) * 0.04) * dt * (0.55 + look.fly * 0.5);
            petal.y += petal.vy * dt * (0.7 + pulse.energy * 0.5);
            petal.rot += petal.spin * dt * (0.8 + pulse.kick);
          }
          const fade = Math.min(1, petal.life * 1.4) * Math.min(1, (petal.max - petal.life) / 2.2);
          if (petal.life > petal.max || petal.y > 1.15) {
            petals.splice(i, 1);
            continue;
          }
          ctx.save();
          ctx.translate(petal.x * w, petal.y * h);
          ctx.rotate(petal.rot);
          ctx.globalAlpha = 0.15 + fade * 0.85;
          if (ready(petalImg)) {
            ctx.globalCompositeOperation = "screen";
            const s = petal.size * (1 + pulse.kick * 0.08);
            ctx.drawImage(petalImg, -s, -s, s * 2, s * 2);
          } else {
            drawPetalShape(ctx, petal.size * 0.55);
          }
          ctx.restore();
        }
      }

      const vg = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.18, cx, cy, Math.max(w, h) * 0.72);
      vg.addColorStop(0, "rgba(7, 3, 10, 0)");
      vg.addColorStop(1, "rgba(7, 3, 10, 0.72)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      const bar = Math.floor(pulse.beatIndex / 4);
      if (live && pulse.downbeat > 0.45 && bar % 16 === 7) {
        glareRef.current = Math.max(glareRef.current, 0.92);
      }
      glareRef.current *= Math.pow(0.04, dt);
      const glare = glareRef.current;
      if (glare > 0.04) {
        const eyeY = cy - h * 0.06;
        const spread = 18 + glare * 10;
        const ih = 16 + glare * 22;
        drawLaserI(ctx, cx - spread, eyeY - ih * 0.5, ih, glare);
        drawLaserI(ctx, cx + spread, eyeY - ih * 0.5, ih, glare);
      }
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [lookRef, playing, pulseRef, reduce]);

  if (reduce) return null;
  return <canvas ref={canvasRef} className="rose-opera-canvas" aria-hidden />;
}
