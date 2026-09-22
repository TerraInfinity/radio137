import { useEffect, useRef } from "react";
import type { RoseLook } from "@/lib/rose-look";
import { captionsForPhenomenon, type PhenomenonId } from "@/lib/phenomena";
import { actSlot, overlayAlpha, type RosePulse } from "@/lib/rose-pulse";
import { petalFacing, petalFade, spawnAirPetal, stepAirPetal, type AirPetal } from "@/lib/rose-air";

type Star = { a: number; r: number; z: number; len: number };
type Glyph = { a: number; r: number; z: number; kind: number };
type StreamPetal = {
  a: number;
  r: number;
  z: number;
  rot: number;
  spin: number;
  pitch: number;
  size: number;
  variant: 0 | 1;
  seed: number;
};

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

function spawnStream(rand = Math.random): StreamPetal {
  return {
    a: rand() * Math.PI * 2,
    r: 0.16 + rand() * 0.5,
    z: 1.6 + rand() * 3.4,
    rot: rand() * Math.PI * 2,
    spin: (rand() - 0.5) * 3.4,
    pitch: rand() * Math.PI * 2,
    size: 10 + rand() * 14,
    variant: rand() < 0.4 ? 1 : 0,
    seed: rand() * 10,
  };
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

function ready(img: HTMLImageElement) {
  return img.complete && img.naturalWidth > 0;
}

let spritePad: HTMLCanvasElement | null = null;

function featherPad(w: number, h: number): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!spritePad) spritePad = document.createElement("canvas");
  const tw = Math.max(32, Math.round(w / 16) * 16);
  const th = Math.max(32, Math.round(h / 16) * 16);
  if (spritePad.width !== tw) spritePad.width = tw;
  if (spritePad.height !== th) spritePad.height = th;
  const s = spritePad.getContext("2d");
  if (!s) return null;
  s.clearRect(0, 0, tw, th);
  return s;
}

/** Lift a flat black studio plate off a portrait. The photograph itself is never repainted. */
const plateCache = new Map<string, HTMLCanvasElement | "keep">();

function lumaOf(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function keyedPortrait(img: HTMLImageElement, dw: number, dh: number): HTMLCanvasElement | "keep" | null {
  const cap = 880;
  const scale = Math.min(1, cap / Math.max(dw, dh));
  const cw = Math.max(32, Math.round(dw * scale));
  const ch = Math.max(32, Math.round(dh * scale));
  const key = `${img.src}|${cw}x${ch}|plate2`;
  const hit = plateCache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const pad = canvas.getContext("2d", { willReadFrequently: true });
  if (!pad) return null;
  pad.drawImage(img, 0, 0, cw, ch);
  const image = pad.getImageData(0, 0, cw, ch);
  const pix = image.data;
  const madAt = (x: number, y: number) => {
    let sr = 0;
    let sg = 0;
    let sb = 0;
    let n = 0;
    const x0 = Math.max(0, x - 2);
    const x1 = Math.min(cw - 1, x + 2);
    const y0 = Math.max(0, y - 2);
    const y1 = Math.min(ch - 1, y + 2);
    for (let yy = y0; yy <= y1; yy++) {
      for (let xx = x0; xx <= x1; xx++) {
        const i = (yy * cw + xx) * 4;
        sr += pix[i] ?? 0;
        sg += pix[i + 1] ?? 0;
        sb += pix[i + 2] ?? 0;
        n += 1;
      }
    }
    const mr = sr / n;
    const mg = sg / n;
    const mb = sb / n;
    let dev = 0;
    for (let yy = y0; yy <= y1; yy++) {
      for (let xx = x0; xx <= x1; xx++) {
        const i = (yy * cw + xx) * 4;
        dev += Math.abs((pix[i] ?? 0) - mr) + Math.abs((pix[i + 1] ?? 0) - mg) + Math.abs((pix[i + 2] ?? 0) - mb);
      }
    }
    return dev / n;
  };
  const plateAt = (x: number, y: number, lumaMax: number, madMax: number) => {
    const i = (y * cw + x) * 4;
    return lumaOf(pix[i] ?? 0, pix[i + 1] ?? 0, pix[i + 2] ?? 0) < lumaMax && madAt(x, y) < madMax;
  };
  let border = 0;
  let borderPlate = 0;
  const sample = (x: number, y: number) => {
    border += 1;
    if (plateAt(x, y, 36, 10)) borderPlate += 1;
  };
  for (let x = 0; x < cw; x += 4) {
    sample(x, 0);
    sample(x, ch - 1);
  }
  for (let y = 0; y < ch; y += 4) {
    sample(0, y);
    sample(cw - 1, y);
  }
  if (border < 8 || borderPlate / border < 0.58) {
    plateCache.set(key, "keep");
    return "keep";
  }
  const voidAt = new Uint8Array(cw * ch);
  const stack: number[] = [];
  const consider = (x: number, y: number) => {
    const p = y * cw + x;
    if (voidAt[p]) return;
    if (!plateAt(x, y, 42, 8)) return;
    voidAt[p] = 1;
    stack.push(p);
  };
  for (let x = 0; x < cw; x++) {
    consider(x, 0);
    consider(x, ch - 1);
  }
  for (let y = 0; y < ch; y++) {
    consider(0, y);
    consider(cw - 1, y);
  }
  while (stack.length) {
    const p = stack.pop() ?? 0;
    const x = p % cw;
    const y = (p / cw) | 0;
    if (x > 0) consider(x - 1, y);
    if (x < cw - 1) consider(x + 1, y);
    if (y > 0) consider(x, y - 1);
    if (y < ch - 1) consider(x, y + 1);
  }
  const dist = new Uint16Array(cw * ch);
  dist.fill(65535);
  const fringe: number[] = [];
  for (let p = 0; p < voidAt.length; p++) {
    if (!voidAt[p]) continue;
    dist[p] = 0;
    fringe.push(p);
  }
  const reach = 18;
  for (let head = 0; head < fringe.length; head++) {
    const p = fringe[head] ?? 0;
    const d = dist[p] ?? 0;
    if (d >= reach) continue;
    const x = p % cw;
    const y = (p / cw) | 0;
    const stepTo = (nx: number, ny: number) => {
      const np = ny * cw + nx;
      if ((dist[np] ?? 65535) <= d + 1) return;
      if (!plateAt(nx, ny, 58, 22)) return;
      dist[np] = d + 1;
      fringe.push(np);
    };
    if (x > 0) stepTo(x - 1, y);
    if (x < cw - 1) stepTo(x + 1, y);
    if (y > 0) stepTo(x, y - 1);
    if (y < ch - 1) stepTo(x, y + 1);
  }
  for (let y = 0; y < ch; y++) {
    const ny = y / ch;
    const fy = ny < 0.035 ? ny / 0.035 : ny > 0.965 ? (1 - ny) / 0.035 : 1;
    for (let x = 0; x < cw; x++) {
      const p = y * cw + x;
      const d = dist[p] ?? 65535;
      if (d > reach) continue;
      const nx = x / cw;
      const fx = nx < 0.035 ? nx / 0.035 : nx > 0.965 ? (1 - nx) / 0.035 : 1;
      const fade = d === 0 ? 0 : d / reach;
      const i = p * 4;
      pix[i + 3] = Math.round((pix[i + 3] ?? 255) * fade * fx * fy);
    }
  }
  pad.putImageData(image, 0, 0);
  plateCache.set(key, canvas);
  if (plateCache.size > 36) {
    const first = plateCache.keys().next().value;
    if (first) plateCache.delete(first);
  }
  return canvas;
}

/** Draw the photograph as it was saved. A black studio plate is lifted so the stage shows through. */
function featherPortrait(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  dw: number,
  dh: number,
  alpha: number,
  blend: GlobalCompositeOperation = "source-over",
) {
  if (!ready(img) || alpha <= 0.02 || dw < 2 || dh < 2) return;
  const keyed = keyedPortrait(img, dw, dh);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = blend;
  if (keyed && keyed !== "keep") ctx.drawImage(keyed, cx - dw / 2, cy - dh / 2, dw, dh);
  else ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.restore();
}

function coverFeather(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  ken: number,
  alpha: number,
  fadeTop = 0.1,
) {
  if (!ready(img) || alpha <= 0.01) return;
  const pad = featherPad(w, h);
  if (!pad || !spritePad) {
    coverBlit(ctx, img, w, h, ken, alpha);
    return;
  }
  const tw = spritePad.width;
  const th = spritePad.height;
  const scale = Math.max(tw / img.naturalWidth, th / img.naturalHeight) * (1.04 + ken * 0.06);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  pad.drawImage(img, tw * 0.5 - dw / 2 + (ken - 0.5) * 22, th * 0.5 - dh / 2 - ken * 10, dw, dh);
  pad.globalCompositeOperation = "destination-in";
  const gy = pad.createLinearGradient(0, 0, 0, th);
  gy.addColorStop(0, "rgba(0,0,0,0)");
  gy.addColorStop(Math.min(0.55, Math.max(0.04, fadeTop)), "rgba(0,0,0,1)");
  gy.addColorStop(0.92, "rgba(0,0,0,1)");
  gy.addColorStop(1, "rgba(0,0,0,0)");
  pad.fillStyle = gy;
  pad.fillRect(0, 0, tw, th);
  pad.globalCompositeOperation = "destination-in";
  const gx = pad.createLinearGradient(0, 0, tw, 0);
  gx.addColorStop(0, "rgba(0,0,0,0)");
  gx.addColorStop(0.08, "rgba(0,0,0,1)");
  gx.addColorStop(0.92, "rgba(0,0,0,1)");
  gx.addColorStop(1, "rgba(0,0,0,0)");
  pad.fillStyle = gx;
  pad.fillRect(0, 0, tw, th);
  pad.globalCompositeOperation = "source-over";
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(spritePad, 0, 0, w, h);
  ctx.restore();
}

const COPY_LANES: { x: number; y: number; align: CanvasTextAlign }[] = [
  { x: 0.97, y: 0.2, align: "right" },
  { x: 0.97, y: 0.55, align: "right" },
  { x: 0.03, y: 0.64, align: "left" },
  { x: 0.97, y: 0.76, align: "right" },
  { x: 0.03, y: 0.8, align: "left" },
];

function stageLines(id: PhenomenonId): string[] {
  return captionsForPhenomenon(id) ?? [];
}

function lineReveal(pulse: RosePulse, len: number) {
  const beatsPer = Math.max(1, pulse.beatsInBar * 4);
  const cycle = beatsPer * 2;
  const pos = (((pulse.beatIndex + pulse.beatPhase) % cycle) + cycle) % cycle;
  const t = Math.min(1, pos / 2.4);
  return Math.max(1, Math.ceil(len * t));
}

function fitCopy(ctx: CanvasRenderingContext2D, text: string, size: number, maxW: number, fontFor: (n: number) => string) {
  let n = size;
  ctx.font = fontFor(n);
  while (n > 11 && ctx.measureText(text).width > maxW) {
    n -= 1;
    ctx.font = fontFor(n);
  }
  return n;
}

function drawActLine(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  pulse: RosePulse,
  w: number,
  h: number,
  size = Math.max(13, Math.min(22, w * 0.02)),
) {
  if (!lines.length) return;
  let alpha = overlayAlpha(pulse, 4);
  if (pulse.energy < 0.2) alpha = Math.max(alpha, 0.78);
  if (alpha <= 0.05) return;
  const line = lines[actSlot(pulse, lines.length, 4)];
  if (!line) return;
  const lane = COPY_LANES[actSlot(pulse, COPY_LANES.length, 8)] ?? COPY_LANES[0]!;
  const style = actSlot(pulse, 4, 8);
  const shown = style === 3 ? line.slice(0, lineReveal(pulse, line.length)) : line;
  const x = w * lane.x;
  const y = h * lane.y;
  const maxW = w * 0.34;
  if (style === 0) {
    const fitted = fitCopy(ctx, shown, size, maxW, (n) => `600 ${n}px ui-monospace, "IBM Plex Mono", monospace`);
    drawGlitchCopy(ctx, shown, x, y, fitted, pulse.kick, alpha, lane.align);
    return;
  }
  ctx.save();
  ctx.globalAlpha = Math.min(0.9, alpha);
  ctx.textAlign = lane.align;
  ctx.textBaseline = "middle";
  if (style === 1) {
    fitCopy(ctx, shown, size + 1, maxW, (n) => `italic ${n}px Georgia, "Times New Roman", serif`);
    ctx.fillStyle = "rgba(255, 244, 236, 0.92)";
    ctx.shadowColor = "rgba(8, 2, 6, 0.75)";
    ctx.shadowBlur = 12;
    ctx.fillText(shown, x, y);
  } else if (style === 2) {
    fitCopy(ctx, shown, size, maxW, (n) => `600 ${n}px ui-monospace, "IBM Plex Mono", monospace`);
    ctx.shadowColor = "rgba(8, 2, 6, 0.8)";
    ctx.shadowBlur = 8;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(10, 4, 8, 0.72)";
    ctx.strokeText(shown, x, y);
    ctx.fillStyle = "rgba(255, 214, 170, 0.94)";
    ctx.fillText(shown, x, y);
  } else {
    const fitted = fitCopy(ctx, shown, Math.max(12, size - 1), maxW, (n) => `500 ${n}px ui-monospace, "IBM Plex Mono", monospace`);
    ctx.textAlign = "left";
    ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
    ctx.shadowBlur = 6;
    const gap = fitted * 0.62;
    let cursor = lane.align === "right" ? x : x;
    const chars = shown.split("");
    const widths = chars.map((ch) => ctx.measureText(ch).width + 0.6);
    const total = widths.reduce((s, n) => s + n, 0);
    if (lane.align === "right") cursor = x - total;
    chars.forEach((ch, i) => {
      const wobble = Math.sin(pulse.time * 7 + i * 0.7) * (pulse.kick > 0.45 ? 1.4 : 0.35);
      ctx.fillStyle = i % 7 === 0 ? "rgba(120, 230, 255, 0.9)" : "rgba(236, 244, 255, 0.9)";
      ctx.fillText(ch, cursor, y + wobble);
      cursor += widths[i] ?? gap;
    });
    if (Math.floor(pulse.time * 3) % 2 === 0) {
      ctx.fillStyle = "rgba(120, 230, 255, 0.85)";
      ctx.fillRect(cursor + 2, y - fitted * 0.45, Math.max(2, fitted * 0.12), fitted * 0.9);
    }
  }
  ctx.restore();
}

function expFollow(current: number, target: number, k: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-k * dt));
}

function drawPoliceBox(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, lamp: number, yaw: number) {
  const w = 18 * scale;
  const h = 32 * scale;
  const depth = 10 * scale * Math.sin(yaw);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(yaw * 0.28);
  ctx.fillStyle = `rgba(0, 40, 82, ${0.86 + lamp * 0.1})`;
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

function drawTardisCraft(
  ctx: CanvasRenderingContext2D,
  chaseImg: HTMLImageElement,
  rearImg: HTMLImageElement,
  x: number,
  y: number,
  hgt: number,
  lamp: number,
  bank: number,
) {
  const img = ready(rearImg) ? rearImg : ready(chaseImg) ? chaseImg : null;
  if (!img) {
    drawPoliceBox(ctx, x, y, Math.max(0.7, hgt / 72), lamp, bank);
    return;
  }
  const wid = hgt * (img.naturalWidth / img.naturalHeight);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bank * 0.34);
  ctx.shadowColor = `rgba(255, 220, 140, ${0.35 + lamp * 0.65})`;
  ctx.shadowBlur = 22 + lamp * 48;
  ctx.globalAlpha = 0.96;
  if (bank < -0.1) ctx.scale(-1, 1);
  ctx.drawImage(img, -wid / 2, -hgt * 0.58, wid, hgt);
  ctx.restore();
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bank * 0.34);
  ctx.beginPath();
  ctx.fillStyle = `rgba(255, 250, 205, ${0.42 + lamp * 0.58})`;
  ctx.shadowColor = "#fffacd";
  ctx.shadowBlur = 24 + lamp * 40;
  ctx.arc(0, -hgt * 0.56, Math.max(2, hgt * 0.028), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawVortexPlate(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  vpX: number,
  vpY: number,
  w: number,
  h: number,
  spin: number,
  energy: number,
  scale: number,
  reverse: boolean,
) {
  if (!ready(img)) return;
  ctx.save();
  ctx.translate(vpX, vpY);
  ctx.rotate(spin * (reverse ? -0.62 : 0.48));
  const dim = Math.max(w, h) * scale;
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.18 + energy * 0.16;
  ctx.drawImage(img, -dim / 2, -dim / 2, dim, dim);
  ctx.restore();
}

function drawHelixRibbon(
  ctx: CanvasRenderingContext2D,
  vpX: number,
  vpY: number,
  fov: number,
  tunnel: number,
  spin: number,
  energy: number,
  kick: number,
  phase: number,
  amber: boolean,
  turns: number,
  radius: number,
  uMin: number,
  uMax: number,
) {
  const n = 68;
  let prev: { x: number; y: number } | null = null;
  let prevU = -1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i <= n; i++) {
    const u = (i / n + tunnel * 0.22) % 1;
    if (u < uMin || u >= uMax) {
      prev = null;
      prevU = -1;
      continue;
    }
    const z = 0.06 + u * 5.6;
    const a = u * turns * Math.PI * 2 + spin + phase;
    const rib = radius * (1 + Math.sin(a * 3.1 + spin * 1.5) * 0.055 + kick * 0.035);
    const p = project(Math.cos(a) * rib, Math.sin(a) * rib * 0.66, z, vpX, vpY, fov);
    if (prev && u > prevU + 0.0015) {
      const near = 1 - u;
      const glow = 0.1 + near * 0.72 + kick * 0.28 + energy * 0.14;
      ctx.strokeStyle = amber
        ? `rgba(255, 170, 52, ${glow})`
        : `rgba(70, 216, 236, ${glow * 0.9})`;
      ctx.lineWidth = 2.2 + near * 11 + kick * 2.8;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    prev = p;
    prevU = u;
  }
}

function drawTunnelRings(
  ctx: CanvasRenderingContext2D,
  vpX: number,
  vpY: number,
  fov: number,
  tunnel: number,
  spin: number,
  energy: number,
  kick: number,
  count: number,
  uMin: number,
  uMax: number,
) {
  for (let i = 0; i < count; i++) {
    const u = (i / Math.max(1, count) + tunnel * 0.2) % 1;
    if (u < uMin || u >= uMax) continue;
    const z = 0.08 + u * 5.2;
    const radius = 0.5 + Math.sin(i * 0.55 + spin) * 0.045 + kick * 0.028;
    const twist = spin * 1.7 + u * 3.4 + i * 0.07;
    ctx.beginPath();
    const segs = 48;
    for (let s = 0; s <= segs; s++) {
      const a = (s / segs) * Math.PI * 2 + twist;
      const rib = 1 + Math.sin(a * 5 + spin * 2.6) * (0.08 + energy * 0.05);
      const p = project(Math.cos(a) * radius * rib, Math.sin(a) * radius * 0.66 * rib, z, vpX, vpY, fov);
      if (s === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    const near = 1 - u;
    const amber = i % 3 !== 1;
    ctx.strokeStyle = amber
      ? `rgba(232, 148, 42, ${0.1 + near * 0.58 + kick * 0.26})`
      : `rgba(96, 214, 232, ${0.1 + near * 0.52 + energy * 0.2})`;
    ctx.lineWidth = 1.6 + near * 5.4 + kick * 2;
    ctx.stroke();
  }
}

function drawTardisWake(
  ctx: CanvasRenderingContext2D,
  tx: number,
  ty: number,
  tz: number,
  vpX: number,
  vpY: number,
  fov: number,
  energy: number,
  kick: number,
) {
  const head = project(tx, ty, tz, vpX, vpY, fov);
  for (let i = 1; i <= 14; i++) {
    const z = tz + i * 0.22;
    const p = project(tx * (1 + i * 0.035), ty * (1 + i * 0.035), z, vpX, vpY, fov);
    ctx.strokeStyle = i % 2 === 0
      ? `rgba(255, 236, 180, ${(0.28 - i * 0.014) * (0.5 + energy)})`
      : `rgba(120, 220, 240, ${(0.22 - i * 0.012) * (0.45 + kick)})`;
    ctx.lineWidth = Math.max(0.7, 5.2 - i * 0.28);
    ctx.beginPath();
    ctx.moveTo(head.x, head.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
}

function drawVortexCore(ctx: CanvasRenderingContext2D, vpX: number, vpY: number, w: number, h: number, energy: number, kick: number) {
  const core = ctx.createRadialGradient(vpX, vpY, 2, vpX, vpY, Math.min(w, h) * 0.34);
  core.addColorStop(0, `rgba(255, 252, 244, ${0.22 + energy * 0.28 + kick * 0.2})`);
  core.addColorStop(0.18, `rgba(255, 196, 86, ${0.16 + energy * 0.16})`);
  core.addColorStop(0.48, `rgba(48, 170, 210, ${0.1 + energy * 0.1})`);
  core.addColorStop(1, "rgba(7, 3, 10, 0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, w, h);
}

function drawChaseHelix(
  ctx: CanvasRenderingContext2D,
  vpX: number,
  vpY: number,
  fov: number,
  tunnel: number,
  spin: number,
  energy: number,
  kick: number,
  uMin: number,
  uMax: number,
) {
  drawHelixRibbon(ctx, vpX, vpY, fov, tunnel, spin, energy, kick, 0, true, 2.15, 0.5, uMin, uMax);
  drawHelixRibbon(ctx, vpX, vpY, fov, tunnel, spin, energy, kick, Math.PI, false, 2.15, 0.5, uMin, uMax);
  drawHelixRibbon(ctx, vpX, vpY, fov, tunnel, spin, energy, kick, Math.PI * 0.5, true, 2.6, 0.36, uMin, uMax);
  drawHelixRibbon(ctx, vpX, vpY, fov, tunnel, spin, energy, kick, Math.PI * 1.5, false, 2.6, 0.36, uMin, uMax);
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

type Paper = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
  w: number;
  h: number;
  color: string;
  life: number;
  max: number;
};

const PROM_PAPER = ["#fbf7f3", "#e8a8b0", "#c45c6a", "#c9a36a", "#f3ede6", "#d4a0a8"];
const TWIST_PAPER = ["#fbf7f3", "#ff5ab4", "#6ec8d4", "#c9a36a", "#e8a8b0", "#ffffff"];
const REMEMBER_PAPER = ["#c9a36a", "#e8d5a3", "#1a0c10", "#7a1f2b", "#f3ede6", "#d4a574"];
const FIREWALL_PAPER = ["#7ee7ff", "#c9a36a", "#e8a8b0", "#fbf7f3", "#5a1f2b", "#9ad7e8"];
const ALLOCATE_PAPER = ["#ff5080", "#7ee7ff", "#c9a36a", "#f3ede6", "#2a1020", "#ff9ad0"];
const WOLF_PAPER = ["#ffffff", "#ff2040", "#1a0a0c", "#c45c6a", "#f3ede6", "#7a1020"];
const CURRENT_PAPER = ["#7ee7ff", "#ff40a0", "#0a0810", "#c9a36a", "#ffffff", "#5a1f4a"];
const SWEETIE_PAPER = ["#c9a36a", "#7ee7ff", "#f3ede6", "#1a0c10", "#ffd56a", "#e8a8b0"];
const HALO_PAPER = ["#7ee7ff", "#ffffff", "#0a1020", "#c9a36a", "#40a0ff", "#1a0c18"];
const CHOIR_PAPER = ["#ff6a3a", "#c9a36a", "#1a0808", "#f3ede6", "#ffd56a", "#7a1f2b"];
const BADEND_PAPER = ["#ff4020", "#c9a36a", "#0a0408", "#ffffff", "#ffd56a", "#7a1020"];
const RECALL_PAPER = ["#7ee7ff", "#c9a36a", "#0a1018", "#f3ede6", "#40a0ff", "#7a1f2b"];
const OBAY_PAPER = ["#ff2a5a", "#c9a36a", "#0a0408", "#ffffff", "#ffd56a", "#7a1020"];
const COPTER_PAPER = ["#ff8a4a", "#7ee7ff", "#c9a36a", "#f3ede6", "#1a3040", "#e8a8b0"];
const STILLHOT_PAPER = ["#ff6a3a", "#7ee7ff", "#c9a36a", "#f3ede6", "#7a1f2b", "#ffd56a"];

const SPRITES = {
  petalFace: "/experiences/rose/petal-face.png",
  petalEdge: "/experiences/rose/petal-edge.png",
  rose: "/experiences/rose/white-rose.png",
  deerfox: "/experiences/rose/deerfox.png",
  tardisChase: "/experiences/rose/tardis-chase.png?v=2",
  tardisRear: "/experiences/rose/tardis-rear.png?v=2",
  vortex: "/experiences/rose/vortex-tunnel.jpg?v=4",
  sword: "/experiences/rose/elven-sword.jpg",
  antlers: "/experiences/rose/antlers.jpg",
  gym: "/experiences/rose/prom-gym.jpg",
  dance: "/experiences/rose/prom-dance.jpg",
  streamers: "/experiences/rose/prom-streamers.jpg",
  ball: "/experiences/rose/prom-ball.jpg",
  punch: "/experiences/rose/prom-punch.jpg",
  twistHall: "/experiences/rose/twist-hall.jpg",
  twistCouple: "/experiences/rose/twist-couple.jpg",
  twistLindy: "/experiences/rose/twist-lindy.jpg",
  twistStrut: "/experiences/rose/twist-strut.jpg",
  twistPrawn: "/experiences/rose/twist-prawn.jpg",
  twistMoon: "/experiences/rose/twist-moon.jpg",
  twistTango: "/experiences/rose/twist-tango.jpg",
  twistSim: "/experiences/rose/twist-sim.jpg",
  twistAgent: "/experiences/rose/twist-agent.jpg",
  twistCode: "/experiences/rose/twist-codebody.jpg",
  twistCubicle: "/experiences/rose/twist-cubicle.jpg",
  twistRoseDesk: "/experiences/rose/twist-rose-desk.jpg",
  twistRoseStand: "/experiences/rose/twist-rose-stand.jpg",
  twistName: "/experiences/rose/twist-nameplate.jpg",
  field: "/experiences/rose/rose-field.jpg",
  hedge: "/experiences/rose/rose-hedge.jpg",
  bloom: "/experiences/rose/rose-bloom.jpg",
  rememberWide: "/experiences/rose/remember-wide.jpg?v=1",
  rememberDoors: "/experiences/rose/remember-doors.jpg?v=1",
  rememberShrimp: "/experiences/rose/remember-shrimp.jpg?v=1",
  rememberHall: "/experiences/rose/remember-hall.jpg?v=1",
  rememberLanding: "/experiences/rose/remember-landing.jpg?v=1",
  firewallRose: "/experiences/rose/firewall-rose.jpg",
  firewallRiver: "/experiences/rose/firewall-river.jpg",
  firewallBasilisk: "/experiences/rose/firewall-basilisk.jpg",
  firewallWolf: "/experiences/rose/firewall-wolf.jpg",
  allocateRose: "/experiences/rose/allocate-rose.jpg",
  allocateSands: "/experiences/rose/allocate-sands.jpg",
  allocateCorp: "/experiences/rose/allocate-corp.jpg",
  allocateShrimp: "/experiences/rose/allocate-shrimp.jpg",
  allocateQueen: "/experiences/rose/allocate-queen.jpg",
  allocateCopter: "/experiences/rose/allocate-copter.jpg",
  allocateAthens: "/experiences/rose/allocate-athens.jpg",
  allocateFairy: "/experiences/rose/allocate-fairy.jpg",
  allocateCleo: "/experiences/rose/allocate-cleo.jpg",
  allocateGlyphs: "/experiences/rose/allocate-glyphs.jpg",
  wolfProm: "/experiences/rose/wolf-prom.jpg",
  wolfAltar: "/experiences/rose/wolf-altar.jpg",
  wolfRose: "/experiences/rose/wolf-rose.jpg",
  wolfCircuit: "/experiences/rose/wolf-circuit.jpg",
  wolfEyes: "/experiences/rose/wolf-eyes.jpg",
  wolfSun: "/experiences/rose/wolf-sun.jpg",
  currentQueen: "/experiences/rose/current-queen.jpg",
  currentAthens: "/experiences/rose/current-athens.jpg",
  currentRoom: "/experiences/rose/current-room.jpg",
  currentBlade: "/experiences/rose/current-blade.jpg",
  currentCouncil: "/experiences/rose/current-council.jpg",
  sweetieCity: "/experiences/rose/sweetie-city.jpg",
  sweetieCat: "/experiences/rose/sweetie-cat.jpg",
  sweetieOperator: "/experiences/rose/sweetie-operator.jpg",
  sweetieWarp: "/experiences/rose/sweetie-warp.jpg",
  sweetieSky: "/experiences/rose/sweetie-sky.jpg",
  sweetieTardis: "/experiences/rose/sweetie-tardis.jpg",
  haloQueen: "/experiences/rose/halo-queen.jpg",
  haloMoon: "/experiences/rose/halo-moon.jpg",
  haloWolves: "/experiences/rose/halo-wolves.jpg",
  haloRing: "/experiences/rose/halo-ring.jpg",
  choirGod: "/experiences/rose/choir-god.jpg",
  choirDyson: "/experiences/rose/choir-dyson.jpg",
  choirTea: "/experiences/rose/choir-tea.jpg",
  choirSun: "/experiences/rose/choir-sun.jpg",
  choirClaws: "/experiences/rose/choir-claws.jpg",
  badendQueen: "/experiences/rose/badend-queen.jpg",
  badendSands: "/experiences/rose/badend-sands.jpg",
  badendSun: "/experiences/rose/badend-sun.jpg",
  badendError: "/experiences/rose/badend-error.jpg",
  badendBox: "/experiences/rose/badend-box.jpg",
  recallRose: "/experiences/rose/recall-rose.jpg",
  recallTemple: "/experiences/rose/recall-temple.jpg",
  recallGlyphs: "/experiences/rose/recall-glyphs.jpg",
  recallSands: "/experiences/rose/recall-sands.jpg",
  obayBrat: "/experiences/rose/obay-brat.jpg",
  obayPirate: "/experiences/rose/obay-pirate.jpg",
  obayOperator: "/experiences/rose/obay-operator.jpg",
  obayTwist: "/experiences/rose/obay-twist.jpg",
  copterLady: "/experiences/rose/copter-lady.jpg",
  copterCaptain: "/experiences/rose/copter-captain.jpg",
  copterShip: "/experiences/rose/copter-ship.jpg",
  copterMeet: "/experiences/rose/copter-meet.jpg",
  copterTreasure: "/experiences/rose/copter-treasure.jpg",
  stillhotRose: "/experiences/rose/stillhot-rose.jpg",
  stillhotLand: "/experiences/rose/stillhot-land.jpg",
  stillhotTea: "/experiences/rose/stillhot-tea.jpg",
};

function loadSprite(src: string) {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  return img;
}

function drawPetalSprite(
  ctx: CanvasRenderingContext2D,
  petal: AirPetal,
  w: number,
  h: number,
  face: HTMLImageElement,
  edge: HTMLImageElement,
  pulse: RosePulse,
) {
  const fade = petalFade(petal);
  const facing = petalFacing(petal);
  const preferEdge = petal.variant === 1 && (petal.edgeLatch || facing < 0.38);
  const img = !preferEdge && facing > 0.4 && ready(face) ? face : ready(edge) ? edge : ready(face) ? face : null;
  ctx.save();
  ctx.translate(petal.x * w, petal.y * h);
  ctx.rotate(petal.rot);
  ctx.scale(1, 0.28 + 0.72 * facing);
  const s = petal.size * (0.92 + petal.z * 0.08);
  ctx.globalAlpha = (0.18 + fade * 0.72) * (0.6 + facing * 0.4);
  ctx.shadowColor = "rgba(251, 247, 243, 0.4)";
  ctx.shadowBlur = 6 + facing * 8;
  if (img) {
    ctx.drawImage(img, -s, -s * 1.15, s * 2, s * 2.3);
  } else {
    drawPetalShape(ctx, s * 0.55);
  }
  ctx.restore();
}

function drawStreamPetal(
  ctx: CanvasRenderingContext2D,
  petal: StreamPetal,
  vpX: number,
  vpY: number,
  fov: number,
  face: HTMLImageElement,
  edge: HTMLImageElement,
  energy: number,
) {
  const p = project(Math.cos(petal.a) * petal.r, Math.sin(petal.a) * petal.r * 0.66, petal.z, vpX, vpY, fov);
  const facing = Math.abs(Math.cos(petal.pitch));
  const img = petal.variant === 1 && facing < 0.7 && ready(edge) ? edge : ready(face) ? face : ready(edge) ? edge : null;
  const s = Math.min(18, Math.max(5, p.s * 0.016 * (0.7 + petal.size / 50)));
  const fadeZ = Math.min(1, (petal.z - 0.4) / 0.55) * Math.min(1, (5 - petal.z) / 0.9);
  if (fadeZ <= 0.02) return;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(petal.rot);
  ctx.scale(1, 0.28 + 0.72 * facing);
  ctx.globalAlpha = Math.min(0.78, 0.16 + fadeZ * 0.55 + energy * 0.06);
  ctx.shadowColor = "rgba(251, 247, 243, 0.32)";
  ctx.shadowBlur = 5 + facing * 7;
  if (img) ctx.drawImage(img, -s, -s * 1.15, s * 2, s * 2.3);
  else drawPetalShape(ctx, s);
  ctx.restore();
}

function drawDeerfox(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  ghost = false,
) {
  if (!ready(img)) return;
  const walk = Math.sin(pulse.time * 0.13) * 0.16;
  const bob = Math.sin(pulse.time * 0.85) * 10 + pulse.kick * 8;
  const foxH = Math.min(h * 0.78, w * 0.72);
  const foxW = foxH * (img.naturalWidth / img.naturalHeight);
  const x = w * (0.5 + walk) - foxW / 2;
  const y = h * 0.34 + bob;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = (ghost ? 0.12 : 0.38) + energy * 0.16 + pulse.downbeat * 0.08;
  ctx.drawImage(img, x, y, foxW, foxH);
  ctx.restore();
}

function drawDeerfoxGhost(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  vpX: number,
  vpY: number,
  fov: number,
  sceneT: number,
  energy: number,
  w: number,
  h: number,
) {
  if (!ready(img)) return;
  const z = 2.4 + Math.sin(sceneT * 0.21) * 0.5;
  const a = sceneT * 0.13;
  const p = project(Math.cos(a) * 0.14, Math.sin(a) * 0.08 - 0.05, z, vpX, vpY, fov);
  const foxH = Math.min(h, w) * (0.62 / z);
  const foxW = foxH * (img.naturalWidth / img.naturalHeight);
  const pulse = 0.5 + 0.5 * Math.sin(sceneT * 0.37);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.07 + energy * 0.1 + pulse * 0.07;
  ctx.drawImage(img, p.x - foxW / 2, p.y - foxH * 0.48, foxW, foxH);
  ctx.restore();
}

function drawBloom(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
) {
  if (!ready(img)) return;
  const ken = Math.sin(pulse.time * 0.07);
  const size = Math.min(w, h) * (0.36 + energy * 0.05);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.1 + energy * 0.08;
  ctx.translate(w * 0.16 + ken * 16, h * 0.2);
  ctx.rotate(pulse.time * 0.03);
  ctx.drawImage(img, -size / 2, -size / 2, size, size);
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.07 + pulse.kick * 0.05;
  ctx.translate(w * 0.84, h * 0.28 - ken * 12);
  ctx.rotate(-pulse.time * 0.04);
  ctx.drawImage(img, -size * 0.38, -size * 0.38, size * 0.76, size * 0.76);
  ctx.restore();
}

type Sparkle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  gold: boolean;
};

function spawnSparkle(rand = Math.random): Sparkle {
  return {
    x: 0.08 + rand() * 0.84,
    y: 0.08 + rand() * 0.78,
    vx: (rand() - 0.5) * 0.018,
    vy: -0.01 - rand() * 0.028,
    life: 0,
    max: 1.6 + rand() * 2.8,
    size: 3.2 + rand() * 7.5,
    gold: rand() > 0.32,
  };
}

function drawSparkle(ctx: CanvasRenderingContext2D, s: Sparkle, w: number, h: number) {
  const t = s.life / s.max;
  const twinkle = 0.35 + 0.65 * Math.sin(t * Math.PI);
  const fade = Math.min(1, t * 4) * Math.min(1, (1 - t) * 3);
  const a = twinkle * fade * 0.85;
  const x = s.x * w;
  const y = s.y * h;
  const size = s.size * (0.7 + twinkle * 0.5);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = s.gold
    ? `rgba(255, 232, 186, ${a})`
    : `rgba(232, 168, 176, ${a * 0.9})`;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x - size * 0.38, y - size * 0.38);
  ctx.lineTo(x + size * 0.38, y + size * 0.38);
  ctx.moveTo(x + size * 0.38, y - size * 0.38);
  ctx.lineTo(x - size * 0.38, y + size * 0.38);
  ctx.stroke();
  ctx.fillStyle = `rgba(255, 252, 244, ${a * 0.9})`;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.45, size * 0.1), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFineVeins(ctx: CanvasRenderingContext2D, w: number, h: number, pulse: RosePulse, energy: number) {
  ctx.save();
  ctx.strokeStyle = `rgba(196, 92, 106, ${0.12 + energy * 0.1 + pulse.downbeat * 0.08})`;
  ctx.lineWidth = 0.7;
  const sway = Math.sin(pulse.time * 0.11) * 12;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.62);
  ctx.bezierCurveTo(w * 0.12 + sway, h * 0.5, w * 0.18, h * 0.82, w * 0.08, h);
  ctx.moveTo(w, h * 0.58);
  ctx.bezierCurveTo(w * 0.88 - sway, h * 0.48, w * 0.8, h * 0.84, w * 0.92, h);
  ctx.moveTo(w * 0.04, h * 0.18);
  ctx.bezierCurveTo(w * 0.16, h * 0.08 + sway * 0.4, w * 0.22, h * 0.32, w * 0.12, h * 0.46);
  ctx.moveTo(w * 0.96, h * 0.16);
  ctx.bezierCurveTo(w * 0.84, h * 0.1 - sway * 0.4, w * 0.78, h * 0.34, w * 0.9, h * 0.48);
  ctx.stroke();
  ctx.restore();
}

function drawRoseFields(
  ctx: CanvasRenderingContext2D,
  field: HTMLImageElement,
  hedge: HTMLImageElement,
  bloom: HTMLImageElement,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  chasing: boolean,
) {
  const ken = Math.sin(pulse.time * 0.045);
  const alpha = chasing ? 0.18 + energy * 0.08 : 0.34 + energy * 0.12;
  if (ready(hedge)) {
    const hh = h * 0.92;
    const hw = hh * (hedge.naturalWidth / hedge.naturalHeight);
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = alpha;
    ctx.drawImage(hedge, -hw * 0.42 + ken * 8, h - hh * 0.94, hw, hh);
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(hedge, -hw * 0.42 - ken * 6, h - hh * 0.94, hw, hh);
    ctx.restore();
    ctx.restore();
  }
  if (ready(field)) {
    const fh = h * 0.46;
    const fw = Math.max(w * 1.08, field.naturalWidth / field.naturalHeight * fh);
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = (chasing ? 0.16 : 0.3) + energy * 0.1 + pulse.kick * 0.04;
    ctx.drawImage(field, (w - fw) / 2 + ken * 18, h - fh * 0.92, fw, fh);
    ctx.restore();
  }
  if (ready(bloom)) {
    const size = Math.min(w, h) * (0.22 + energy * 0.03);
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.12 + energy * 0.08 + pulse.downbeat * 0.05;
    ctx.translate(w * 0.1, h * 0.18 + ken * 10);
    ctx.rotate(pulse.time * 0.02);
    ctx.drawImage(bloom, -size / 2, -size / 2, size, size);
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.09 + pulse.kick * 0.05;
    ctx.translate(w * 0.9, h * 0.22 - ken * 8);
    ctx.rotate(-pulse.time * 0.025);
    ctx.drawImage(bloom, -size * 0.42, -size * 0.42, size * 0.84, size * 0.84);
    ctx.restore();
  }
  drawFineVeins(ctx, w, h, pulse, energy);
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

function drawKeyedPortrait(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  dw: number,
  dh: number,
  alpha: number,
) {
  featherPortrait(ctx, img, x + dw / 2, y + dh / 2, dw, dh, alpha, "source-over");
}

function drawGymFloor(ctx: CanvasRenderingContext2D, w: number, h: number, energy: number) {
  const horizon = h * 0.54;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(w, h);
  ctx.lineTo(w * 0.78, horizon);
  ctx.lineTo(w * 0.22, horizon);
  ctx.closePath();
  const wood = ctx.createLinearGradient(0, horizon, 0, h);
  wood.addColorStop(0, `rgba(120, 68, 42, ${0.16 + energy * 0.1})`);
  wood.addColorStop(0.55, "rgba(62, 28, 18, 0.38)");
  wood.addColorStop(1, "rgba(18, 8, 8, 0.7)");
  ctx.fillStyle = wood;
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 214, 176, 0.09)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 16; i++) {
    const t = i / 15;
    ctx.beginPath();
    ctx.moveTo(w * (0.22 + t * 0.56), horizon);
    ctx.lineTo(w * t, h);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHoop(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, flip: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -1 : 1, 1);
  ctx.strokeStyle = "rgba(243, 237, 230, 0.22)";
  ctx.lineWidth = Math.max(2, 3 * scale);
  ctx.beginPath();
  ctx.ellipse(0, 0, 26 * scale, 9 * scale, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(243, 237, 230, 0.14)";
  ctx.beginPath();
  ctx.moveTo(0, -40 * scale);
  ctx.lineTo(0, -8 * scale);
  ctx.stroke();
  ctx.restore();
}

function drawGuest(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, sway: number, gown: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(sway);
  ctx.fillStyle = "rgba(10, 5, 8, 0.78)";
  ctx.beginPath();
  ctx.ellipse(0, -40 * scale, 6.5 * scale, 8 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  if (gown) {
    ctx.moveTo(-11 * scale, -30 * scale);
    ctx.lineTo(11 * scale, -30 * scale);
    ctx.lineTo(18 * scale, 10 * scale);
    ctx.lineTo(-18 * scale, 10 * scale);
  } else {
    ctx.moveTo(-8 * scale, -30 * scale);
    ctx.lineTo(8 * scale, -30 * scale);
    ctx.lineTo(7 * scale, 10 * scale);
    ctx.lineTo(-7 * scale, 10 * scale);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPromClock(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, timeSec: number) {
  const minutes = 47 + Math.min(12.6, timeSec * 0.066);
  const hours = 11 + minutes / 60;
  const hourA = (hours / 12) * Math.PI * 2 - Math.PI / 2;
  const minA = (minutes / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(18, 8, 10, 0.72)";
  ctx.strokeStyle = "rgba(243, 237, 230, 0.45)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(251, 247, 243, 0.85)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(hourA) * r * 0.48, Math.sin(hourA) * r * 0.48);
  ctx.stroke();
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(minA) * r * 0.72, Math.sin(minA) * r * 0.72);
  ctx.stroke();
  ctx.fillStyle = "rgba(196, 92, 106, 0.9)";
  ctx.beginPath();
  ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawProm(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  spin: number,
  gym: HTMLImageElement,
  dance: HTMLImageElement,
  streamers: HTMLImageElement,
  ball: HTMLImageElement,
  punch: HTMLImageElement,
) {
  const cx = w * 0.5;
  const cy = h * 0.58;
  const waltz = pulse.barPhase * Math.PI * 2;
  const sway = Math.sin(waltz) * (16 + energy * 10);
  const bob = Math.sin(pulse.time * 0.95) * 6 + pulse.kick * 9;
  const spotX = cx + sway * 0.45;

  if (ready(gym)) {
    const ken = Math.sin(pulse.time * 0.035) * 0.5 + 0.5;
    ctx.save();
    ctx.globalAlpha = 0.62 + energy * 0.12;
    const scale = Math.max(w / gym.naturalWidth, h / gym.naturalHeight) * (1.1 + ken * 0.08);
    const dw = gym.naturalWidth * scale;
    const dh = gym.naturalHeight * scale;
    ctx.drawImage(gym, cx - dw / 2 + ken * 18, h * 0.02 - dh * 0.06 - ken * 10, dw, dh);
    ctx.restore();
  }

  drawGymFloor(ctx, w, h, energy);
  drawHoop(ctx, w * 0.08, h * 0.3, Math.min(w, h) / 420, false);
  drawHoop(ctx, w * 0.92, h * 0.3, Math.min(w, h) / 420, true);

  if (ready(streamers)) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.28 + pulse.kick * 0.12;
    ctx.drawImage(streamers, -w * 0.05, -h * 0.16 + Math.sin(spin * 0.55) * 12, w * 1.1, h * 0.62);
    ctx.restore();
  }

  for (let i = 0; i < 14; i++) {
    const x = ((i + 0.5) / 14) * w;
    const amp = 18 + (i % 3) * 8;
    const s = Math.sin(spin * 0.7 + i * 0.7) * amp + pulse.kick * 6;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + s, h * 0.26, x - s * 0.75, h * 0.58, x + s * 0.2, h * 0.92);
    const blush = i % 3 === 1;
    ctx.strokeStyle = blush
      ? `rgba(196, 92, 106, ${0.16 + pulse.snare * 0.18})`
      : i % 3 === 2
        ? `rgba(201, 163, 106, ${0.14 + energy * 0.12})`
        : `rgba(251, 247, 243, ${0.18 + energy * 0.14})`;
    ctx.lineWidth = blush ? 2.8 : 2.1;
    ctx.stroke();
  }

  ctx.save();
  const wash = ctx.createRadialGradient(spotX, cy, 18, spotX, cy, Math.max(w, h) * 0.62);
  wash.addColorStop(0, `rgba(255, 226, 186, ${0.2 + energy * 0.16})`);
  wash.addColorStop(0.38, `rgba(196, 92, 106, ${0.08 + pulse.downbeat * 0.1})`);
  wash.addColorStop(1, "rgba(10, 4, 6, 0.2)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  ctx.beginPath();
  ctx.moveTo(cx, -h * 0.02);
  ctx.lineTo(spotX - w * 0.24, h * 0.88);
  ctx.lineTo(spotX + w * 0.24, h * 0.88);
  ctx.closePath();
  ctx.fillStyle = `rgba(255, 220, 170, ${0.05 + pulse.kick * 0.05})`;
  ctx.fill();
  ctx.restore();

  drawGuest(ctx, w * 0.1, h * 0.72, 1.15, Math.sin(pulse.time * 0.4) * 0.04, true);
  drawGuest(ctx, w * 0.16, h * 0.76, 1, Math.sin(pulse.time * 0.5 + 1) * 0.03, false);
  drawGuest(ctx, w * 0.07, h * 0.8, 0.9, Math.sin(pulse.time * 0.35 + 2) * 0.05, true);
  drawGuest(ctx, w * 0.9, h * 0.73, 1.1, Math.sin(pulse.time * 0.42 + 0.4) * 0.04, false);
  drawGuest(ctx, w * 0.84, h * 0.78, 1.05, Math.sin(pulse.time * 0.38 + 1.6) * 0.03, true);
  drawGuest(ctx, w * 0.94, h * 0.81, 0.88, Math.sin(pulse.time * 0.47) * 0.04, true);

  if (ready(dance)) {
    const dh = Math.min(h * 0.84, w * 0.78);
    const dw = dh * (dance.naturalWidth / dance.naturalHeight);
    ctx.save();
    ctx.translate(cx + sway, cy + bob);
    ctx.rotate(Math.sin(waltz) * 0.05);
    drawKeyedPortrait(ctx, dance, -dw / 2, -dh / 2, dw, dh, 0.94 + energy * 0.06);
    ctx.restore();
  }

  if (ready(punch)) {
    const pw = Math.min(w * 0.28, 240);
    const ph = pw * (punch.naturalHeight / punch.naturalWidth);
    featherPortrait(ctx, punch, w - pw * 0.42, h - ph * 0.28, pw, ph, 0.82);
  }

  const ballY = h * 0.1;
  const ballR = 20 + pulse.kick * 5;
  if (ready(ball)) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.78 + energy * 0.18;
    ctx.translate(cx, ballY);
    ctx.rotate(spin * 0.9);
    const bw = ballR * 3.4;
    ctx.drawImage(ball, -bw / 2, -bw / 2, bw, bw);
    ctx.restore();
  }
  ctx.save();
  ctx.translate(cx, ballY);
  ctx.rotate(spin * 0.55);
  for (let f = 0; f < 18; f++) {
    const a = (f / 18) * Math.PI * 2;
    ctx.strokeStyle = `rgba(255, 248, 236, ${0.1 + energy * 0.24 + pulse.kick * 0.12})`;
    ctx.lineWidth = f % 2 === 0 ? 1.4 : 0.8;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6);
    ctx.lineTo(Math.cos(a) * (70 + energy * 36), Math.sin(a) * (22 + energy * 10));
    ctx.stroke();
  }
  ctx.restore();

  drawActLine(ctx, stageLines("prom"), pulse, w, h);

  drawPromClock(ctx, w - 36, 36, 18, pulse.time);

  if (pulse.snare > 0.45) {
    ctx.fillStyle = `rgba(255, 246, 236, ${pulse.snare * 0.22})`;
    ctx.fillRect(0, 0, w, h);
  }
}

const TWIST_MODES = ["twist", "lindy", "alive", "tango", "moonwalk", "prawn"] as const;
type TwistMode = (typeof TWIST_MODES)[number];

const TWIST_NEON: Record<TwistMode, string> = {
  twist: "TWIST AND SHOUT",
  lindy: "LINDY HOP",
  alive: "STAYIN' ALIVE",
  tango: "TANGO AND MANGO",
  moonwalk: "MOONWALK SLIDE",
  prawn: "PRAWN PRIDE",
};

function twistModeAt(pulse: RosePulse): TwistMode {
  return TWIST_MODES[Math.floor(Math.max(0, pulse.beatIndex) / 32) % TWIST_MODES.length]!;
}

function drawCheckFloor(ctx: CanvasRenderingContext2D, w: number, h: number, energy: number, pulse: RosePulse) {
  const horizon = h * 0.5;
  const rows = 11;
  const cols = 13;
  ctx.save();
  for (let r = 0; r < rows; r++) {
    const t0 = r / rows;
    const t1 = (r + 1) / rows;
    const e0 = t0 * t0;
    const e1 = t1 * t1;
    const y0 = horizon + (h - horizon) * e0;
    const y1 = horizon + (h - horizon) * e1;
    const inset0 = (1 - e0) * 0.26;
    const inset1 = (1 - e1) * 0.26;
    for (let c = 0; c < cols; c++) {
      const u0 = c / cols;
      const u1 = (c + 1) / cols;
      const x00 = w * (inset0 + u0 * (1 - 2 * inset0));
      const x10 = w * (inset0 + u1 * (1 - 2 * inset0));
      const x01 = w * (inset1 + u0 * (1 - 2 * inset1));
      const x11 = w * (inset1 + u1 * (1 - 2 * inset1));
      const on = (r + c) % 2 === 0;
      ctx.fillStyle = on
        ? `rgba(251, 247, 243, ${0.05 + energy * 0.06 + pulse.kick * 0.1})`
        : `rgba(10, 4, 16, ${0.3 + energy * 0.08})`;
      ctx.beginPath();
      ctx.moveTo(x00, y0);
      ctx.lineTo(x10, y0);
      ctx.lineTo(x11, y1);
      ctx.lineTo(x01, y1);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawTwister(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  phase: number,
  kick: number,
  gown: boolean,
) {
  const hip = Math.sin(phase * Math.PI * 4) * 0.42;
  const bounce = Math.abs(Math.sin(phase * Math.PI * 2)) * 5 * scale + kick * 10 * scale;
  ctx.save();
  ctx.translate(x, y - bounce);
  ctx.fillStyle = "rgba(8, 4, 12, 0.82)";
  ctx.beginPath();
  ctx.ellipse(hip * 4 * scale, -54 * scale, 6.5 * scale, 8 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.rotate(-hip * 0.35);
  ctx.fillRect(-10 * scale, -46 * scale, 20 * scale, 18 * scale);
  ctx.restore();
  ctx.save();
  ctx.rotate(hip);
  ctx.beginPath();
  if (gown) {
    ctx.moveTo(-12 * scale, -28 * scale);
    ctx.lineTo(12 * scale, -28 * scale);
    ctx.lineTo(20 * scale + hip * 10 * scale, 12 * scale);
    ctx.lineTo(-20 * scale + hip * 10 * scale, 12 * scale);
  } else {
    ctx.moveTo(-9 * scale, -28 * scale);
    ctx.lineTo(9 * scale, -28 * scale);
    ctx.lineTo(8 * scale + hip * 14 * scale, 12 * scale);
    ctx.lineTo(-8 * scale + hip * 14 * scale, 12 * scale);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

function drawNeonSign(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, size: number, energy: number, kick: number) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = `italic ${size}px Georgia, "Times New Roman", serif`;
  ctx.shadowColor = `rgba(255, 90, 180, ${0.55 + kick * 0.4})`;
  ctx.shadowBlur = 16 + kick * 22;
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = `rgba(255, 90, 180, ${0.55 + energy * 0.35})`;
  ctx.fillStyle = `rgba(255, 246, 252, ${0.72 + kick * 0.28})`;
  ctx.strokeText(text, cx, y);
  ctx.fillText(text, cx, y);
  ctx.restore();
}

const SIM_GLYPHS = "01ΔΛΨΦ※◈░▒│†‡◊▣GCAΩ";

function twistMerge(pulse: RosePulse, energy: number) {
  const wave = 0.5 + 0.5 * Math.sin(pulse.time * 0.19);
  const phrase = 0.5 + 0.5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
  return Math.min(1, 0.24 + wave * 0.26 + phrase * 0.22 + energy * 0.34 + pulse.kick * 0.14);
}

function drawSimRush(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  merge: number,
  tunnel: number,
  spin: number,
) {
  const cx = w * 0.5;
  const cy = h * 0.4;
  const fov = Math.min(w, h) * (0.6 + pulse.kick * 0.05);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const rings = 16;
  for (let i = 0; i < rings; i++) {
    const u = (i / rings + tunnel * 0.42) % 1;
    const z = 0.1 + u * 5.1;
    const near = 1 - u;
    const half = 0.58 + Math.sin(i * 0.4 + spin) * 0.03 + pulse.kick * 0.02;
    const a = project(-half, -half * 0.55, z, cx, cy, fov);
    const b = project(half, -half * 0.55, z, cx, cy, fov);
    const c = project(half, half * 0.62, z, cx, cy, fov);
    const d = project(-half, half * 0.62, z, cx, cy, fov);
    ctx.strokeStyle = i % 2 === 0
      ? `rgba(90, 255, 160, ${(0.06 + near * 0.42 + energy * 0.12) * merge})`
      : `rgba(255, 90, 180, ${(0.05 + near * 0.32 + pulse.kick * 0.12) * merge})`;
    ctx.lineWidth = 0.7 + near * 2.4;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(d.x, d.y);
    ctx.closePath();
    ctx.stroke();
  }
  for (let s = 0; s < 10; s++) {
    const t = (s / 10) * 2 - 1;
    const far = project(t * 0.58, 0.62, 5.1, cx, cy, fov);
    const nearP = project(t * 0.58, 0.62, 0.12, cx, cy, fov);
    ctx.strokeStyle = `rgba(90, 255, 160, ${0.05 * merge + energy * 0.06})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(far.x, far.y);
    ctx.lineTo(nearP.x, nearP.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSimRain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  merge: number,
  tunnel: number,
) {
  const cx = w * 0.5;
  const cy = h * 0.4;
  const fov = Math.min(w, h) * 0.6;
  const cols = 15;
  const rows = 14;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let c = 0; c < cols; c++) {
    const xn = (c / (cols - 1) - 0.5) * 1.55;
    for (let r = 0; r < rows; r++) {
      const z = 0.14 + ((r * 0.31 + pulse.time * (1.55 + energy) + c * 0.17 + tunnel) % 4.6);
      const y = ((r * 0.09 + pulse.time * 0.22 + c * 0.04) % 1.15) - 0.42;
      const p = project(xn, y, z, cx, cy, fov);
      const head = r === 0 || (Math.floor(pulse.time * 7 + c) % rows) === r;
      const gi = Math.abs(Math.floor(c * 19 + r * 5 + pulse.time * 11)) % SIM_GLYPHS.length;
      const ch = SIM_GLYPHS[gi] ?? "0";
      const near = Math.max(0, 1 - z / 5);
      ctx.font = `${Math.max(7, Math.min(18, p.s * 0.028))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.fillStyle = head
        ? `rgba(220, 255, 236, ${(0.18 + near * 0.7) * merge})`
        : `rgba(90, 255, 160, ${(0.08 + near * 0.42 + energy * 0.08) * merge})`;
      ctx.fillText(ch, p.x, p.y);
    }
  }
  ctx.restore();
}

function drawChaosAgents(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  merge: number,
  tunnel: number,
  agent: HTMLImageElement,
  code: HTMLImageElement,
) {
  const cx = w * 0.5;
  const cy = h * 0.44;
  const fov = Math.min(w, h) * 0.62;
  let online = 0;
  const n = 3;
  for (let i = 0; i < n; i++) {
    const z = 0.42 + ((i * 0.83 + pulse.time * (0.62 + energy * 0.7) + tunnel * 0.12) % 3.4);
    if (z > 3.15) continue;
    online += 1;
    const x = Math.sin(i * 1.67 + pulse.time * 0.31) * 0.4;
    const y = 0.04 + Math.cos(i * 1.13 + pulse.time * 0.17) * 0.1;
    const glitch = pulse.snare > 0.4 ? Math.sin(i * 9 + pulse.time * 40) * 14 * pulse.snare : 0;
    const p = project(x, y, z, cx, cy, fov);
    const img = i % 2 === 0 && ready(agent) ? agent : ready(code) ? code : ready(agent) ? agent : null;
    if (!img) continue;
    const hgt = Math.min(h, w) * (0.42 / Math.max(0.55, z));
    const wid = hgt * (img.naturalWidth / img.naturalHeight);
    const a = (0.22 + (1.2 / z) * 0.28 + energy * 0.12) * (0.45 + merge * 0.55);
    featherPortrait(ctx, img, p.x + glitch, p.y, wid, hgt, a, "screen");
  }
  return online;
}

function drawSimHud(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  merge: number,
  energy: number,
  online: number,
  pulse: RosePulse,
) {
  if (overlayAlpha(pulse, 4) < 0.2) return;
  if (actSlot(pulse, 4, 4) !== 2) return;
  ctx.save();
  ctx.font = `${Math.max(9, Math.min(12, w * 0.012))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillStyle = `rgba(90, 255, 160, ${0.18 + merge * 0.25 + energy * 0.12 + pulse.downbeat * 0.15})`;
  ctx.textAlign = "left";
  ctx.fillText(`SIM ${String(Math.round(merge * 100)).padStart(2, "0")}%  ·  ${online}`, 16, 22);
  ctx.restore();
}

function drawDumPips(ctx: CanvasRenderingContext2D, w: number, h: number, pulse: RosePulse, energy: number) {
  const cx = w * 0.5;
  const y = 34;
  const labels = ["DUM", "da", "da", "DUM"];
  const slot = ((pulse.beatIndex % 4) + 4) % 4;
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = `${Math.max(9, Math.min(13, w * 0.013))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  for (let i = 0; i < 4; i++) {
    const x = cx + (i - 1.5) * 42;
    const hit = i === slot;
    const heavy = i === 0 || i === 3;
    const a = hit ? 0.85 + pulse.kick * 0.15 : 0.22 + energy * 0.1;
    ctx.fillStyle = heavy
      ? `rgba(255, 232, 186, ${a})`
      : `rgba(232, 168, 176, ${a})`;
    ctx.beginPath();
    ctx.arc(x, y - 12, hit ? (heavy ? 5.5 : 3.5) : 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(labels[i]!, x, y + 6);
  }
  ctx.restore();
}

function drawTwist(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  spin: number,
  tunnel: number,
  hall: HTMLImageElement,
  couple: HTMLImageElement,
  lindy: HTMLImageElement,
  strut: HTMLImageElement,
  prawn: HTMLImageElement,
  moon: HTMLImageElement,
  tango: HTMLImageElement,
  ball: HTMLImageElement,
  sim: HTMLImageElement,
  agent: HTMLImageElement,
  code: HTMLImageElement,
  cubicle: HTMLImageElement,
  roseDesk: HTMLImageElement,
  roseStand: HTMLImageElement,
  nameplate: HTMLImageElement,
) {
  const cx = w * 0.5;
  const cy = h * 0.58;
  const mode = twistModeAt(pulse);
  const waltz = pulse.barPhase * Math.PI * 2;
  const merge = twistMerge(pulse, energy);
  const pretend = Math.sin(merge * Math.PI);
  const cubicleA = Math.max(0.04, 1 - merge * 1.08);
  const flicker = pulse.snare > 0.4 ? pulse.snare * 0.18 : 0.03 * (0.5 + 0.5 * Math.sin(pulse.time * 13));

  if (ready(cubicle)) {
    const ken = Math.sin(pulse.time * 0.03) * 0.5 + 0.5;
    const slice = pulse.snare > 0.42 ? Math.sin(pulse.time * 31) * 8 * pulse.snare : 0;
    ctx.save();
    ctx.globalAlpha = cubicleA * (0.82 + flicker);
    const scale = Math.max(w / cubicle.naturalWidth, h / cubicle.naturalHeight) * (1.06 + ken * 0.04);
    const dw = cubicle.naturalWidth * scale;
    const dh = cubicle.naturalHeight * scale;
    ctx.drawImage(cubicle, cx - dw / 2 + slice, h * 0.02 - dh * 0.08, dw, dh);
    ctx.restore();
    if (flicker > 0.08) {
      ctx.fillStyle = `rgba(220, 255, 210, ${flicker * 0.12})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  if (ready(sim)) {
    const rush = (tunnel * 0.08) % 1;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = (0.16 + merge * 0.62 + energy * 0.12) * (0.7 + pulse.kick * 0.3);
    const scale = Math.max(w / sim.naturalWidth, h / sim.naturalHeight) * (1.08 + rush * 0.18 + pulse.kick * 0.06);
    const dw = sim.naturalWidth * scale;
    const dh = sim.naturalHeight * scale;
    ctx.drawImage(sim, cx - dw / 2, h * 0.02 - dh * 0.12 - rush * 24, dw, dh);
    ctx.restore();
  }

  if (ready(hall)) {
    const ken = Math.sin(pulse.time * 0.055) * 0.5 + 0.5;
    const slice = pulse.snare > 0.45 ? Math.sin(pulse.time * 28) * 10 * pulse.snare : 0;
    ctx.save();
    ctx.globalAlpha = (0.12 + pretend * 0.62 + energy * 0.08) * (1 - merge * 0.35);
    const scale = Math.max(w / hall.naturalWidth, h / hall.naturalHeight) * (1.08 + ken * 0.06 + pulse.kick * 0.03);
    const dw = hall.naturalWidth * scale;
    const dh = hall.naturalHeight * scale;
    ctx.drawImage(hall, cx - dw / 2 + (ken - 0.5) * 22 + slice, h * 0.01 - dh * 0.06 - ken * 8, dw, dh);
    ctx.restore();
  }

  drawCheckFloor(ctx, w, h, energy * (1 - merge * 0.35), pulse);
  drawSimRush(ctx, w, h, pulse, energy, merge, tunnel, spin);
  drawSimRain(ctx, w, h, pulse, energy, merge, tunnel);

  ctx.save();
  const wash = ctx.createRadialGradient(cx, cy, 16, cx, cy, Math.max(w, h) * 0.7);
  wash.addColorStop(0, `rgba(255, 90, 180, ${0.08 + energy * 0.12 * (1 - merge) + pulse.kick * 0.08})`);
  wash.addColorStop(0.38, `rgba(90, 255, 160, ${0.06 + merge * 0.16 + pulse.downbeat * 0.08})`);
  wash.addColorStop(1, "rgba(10, 4, 16, 0.18)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  for (let i = 0; i < 5; i++) {
    const side = i < 3 ? -1 : 1;
    const slot = i % 3;
    const x = cx + side * (w * (0.3 + slot * 0.08));
    const y = h * (0.72 + (slot % 2) * 0.05);
    const phase = pulse.barPhase + slot * 0.13 + i * 0.07;
    drawTwister(ctx, x, y, 0.7 + (slot % 3) * 0.1, phase, pulse.kick, i % 2 === 0);
  }

  let lead = couple;
  let sway = Math.sin(waltz * 2) * (20 + energy * 12);
  let bob = Math.abs(Math.sin(waltz)) * 10 + pulse.kick * 14;
  let rot = Math.sin(waltz * 2) * 0.12;
  let size = Math.min(h * 0.92, w * 0.86);

  if (mode === "lindy") {
    lead = lindy;
    sway = Math.sin(waltz) * (38 + energy * 14);
    bob = Math.sin(waltz) * 16 + pulse.kick * 18;
    rot = Math.sin(waltz) * 0.32;
  } else if (mode === "alive") {
    lead = strut;
    const step = ((pulse.beatIndex % 8) + pulse.beatPhase) / 8;
    sway = (step * 2 - 1) * w * 0.16;
    bob = pulse.kick * 24 + Math.abs(Math.sin(pulse.beatPhase * Math.PI)) * 10;
    rot = Math.sin(waltz) * 0.05;
  } else if (mode === "tango") {
    lead = tango;
    sway = Math.sin(waltz) * 12;
    bob = Math.sin(waltz) * 5;
    rot = Math.sin(waltz) * 0.09 - 0.05;
    size *= 0.96;
  } else if (mode === "moonwalk") {
    lead = moon;
    const t = 1 - ((pulse.beatIndex % 32) + pulse.beatPhase) / 32;
    sway = (t * 2 - 1) * w * 0.3;
    bob = 4 + pulse.kick * 6;
    rot = -0.1;
    size *= 0.9;
  } else if (mode === "prawn") {
    lead = prawn;
    sway = Math.sin(waltz * 2) * 18;
    bob = pulse.kick * 22 + Math.abs(Math.sin(waltz)) * 12;
    rot = Math.sin(waltz * 2) * 0.2;
    size *= 0.72;
    if (ready(couple)) {
      const bh = Math.min(h * 0.42, w * 0.34);
      const bw = bh * (couple.naturalWidth / couple.naturalHeight);
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.translate(w * 0.18, h * 0.72);
      ctx.rotate(Math.sin(waltz) * 0.04);
      drawKeyedPortrait(ctx, couple, -bw / 2, -bh / 2, bw, bh, 0.7);
      ctx.restore();
    }
  }

  if (ready(lead) && merge > 0.38) {
    const dh = size;
    const dw = dh * (lead.naturalWidth / lead.naturalHeight);
    ctx.save();
    ctx.translate(cx + sway, cy + bob * 0.45);
    ctx.rotate(rot);
    featherPortrait(ctx, lead, 0, 0, dw, dh, 0.55 * pretend + merge * 0.35, merge > 0.7 ? "screen" : "source-over");
    ctx.restore();
  }

  const roseImg = merge < 0.52 ? roseDesk : roseStand;
  if (ready(roseImg)) {
    const rh = Math.min(h * (merge < 0.52 ? 0.92 : 0.96), w * 0.72);
    const rw = rh * (roseImg.naturalWidth / roseImg.naturalHeight);
    const sit = merge < 0.52;
    ctx.save();
    ctx.translate(cx + (sit ? -w * 0.02 : sway * 0.35), cy + (sit ? h * 0.08 : bob * 0.2));
    ctx.rotate(sit ? 0 : rot * 0.4);
    featherPortrait(ctx, roseImg, 0, 0, rw, rh, sit ? 0.92 * cubicleA + 0.2 : 0.55 + merge * 0.4, !sit && merge > 0.7 ? "screen" : "source-over");
    ctx.restore();
  }

  if (ready(nameplate) && cubicleA > 0.18) {
    const nw = Math.min(w * 0.28, 260);
    const nh = nw * (nameplate.naturalHeight / nameplate.naturalWidth);
    ctx.save();
    ctx.globalAlpha = 0.55 + cubicleA * 0.4 + pulse.downbeat * 0.15;
    ctx.drawImage(nameplate, 16, h - nh - 52, nw, nh);
    ctx.restore();
  }

  const ballY = h * 0.1;
  const ballR = 18 + pulse.kick * 7;
  if (ready(ball) && pretend > 0.2) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = (0.72 + energy * 0.22) * pretend;
    ctx.translate(cx, ballY);
    ctx.rotate(spin * 1.35);
    const bw = ballR * 3.6;
    ctx.drawImage(ball, -bw / 2, -bw / 2, bw, bw);
    ctx.restore();
  }
  ctx.save();
  ctx.globalAlpha = 0.35 + pretend * 0.65;
  ctx.translate(cx, ballY);
  ctx.rotate(spin * 0.9);
  for (let f = 0; f < 22; f++) {
    const a = (f / 22) * Math.PI * 2;
    ctx.strokeStyle = f % 2 === 0
      ? `rgba(255, 90, 180, ${0.1 + energy * 0.28 + pulse.kick * 0.16})`
      : `rgba(110, 200, 212, ${0.1 + energy * 0.24 + pulse.kick * 0.14})`;
    ctx.lineWidth = f % 2 === 0 ? 1.5 : 0.8;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6);
    ctx.lineTo(Math.cos(a) * (80 + energy * 48), Math.sin(a) * (24 + energy * 14));
    ctx.stroke();
  }
  ctx.restore();

  const neon = merge < 0.38 ? "ROSE IS HER NAME" : merge < 0.62 ? "THE ROOM IS PRETENDING" : TWIST_NEON[mode];
  const lane = actSlot(pulse, 4, 4);
  const copyOn = overlayAlpha(pulse, 4);
  if (lane === 0 && copyOn > 0.2) {
    drawNeonSign(ctx, neon, cx, Math.max(30, h * 0.075), Math.max(16, Math.min(32, w * 0.032)), energy, pulse.kick);
  }
  if (merge > 0.55) {
    drawActLine(ctx, stageLines("twist"), pulse, w, h);
  } else {
    drawActLine(ctx, stageLines("twist"), pulse, w, h);
  }

  const online = lane === 2 ? drawChaosAgents(ctx, w, h, pulse, energy, merge, tunnel, agent, code) : 0;
  drawSimHud(ctx, w, h, merge, energy, online, pulse);
  if (lane === 3 && copyOn > 0.25) {
    ctx.save();
    ctx.font = `${Math.max(9, Math.min(12, w * 0.012))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.fillStyle = `rgba(255, 232, 186, ${0.45 + cubicleA * 0.4})`;
    ctx.textAlign = "left";
    ctx.fillText("USER // ROSE", 16, 54);
    ctx.fillStyle = `rgba(232, 168, 176, ${0.4 + pretend * 0.45})`;
    ctx.fillText(merge < 0.5 ? "ROOM // PRETENDING" : "ROOM // MERGED", 16, 70);
    ctx.restore();
  }
  if (lane === 1) drawDumPips(ctx, w, h, pulse, energy);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, -h * 0.02);
  ctx.lineTo(cx + sway - w * 0.22, h * 0.9);
  ctx.lineTo(cx + sway + w * 0.22, h * 0.9);
  ctx.closePath();
  ctx.fillStyle = `rgba(255, 220, 240, ${0.04 + pulse.kick * 0.06})`;
  ctx.fill();
  ctx.restore();

  if (pulse.kick > 0.5) {
    ctx.fillStyle = merge > 0.5
      ? `rgba(90, 255, 160, ${pulse.kick * 0.14})`
      : `rgba(255, 186, 220, ${pulse.kick * 0.16})`;
    ctx.fillRect(0, 0, w, h);
  }
  if (pulse.snare > 0.5) {
    ctx.fillStyle = `rgba(180, 255, 220, ${pulse.snare * 0.1})`;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawAnkh(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, alpha: number) {
  ctx.save();
  ctx.strokeStyle = `rgba(232, 196, 110, ${alpha})`;
  ctx.lineWidth = Math.max(1, s * 0.12);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.55, s * 0.28, s * 0.34, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.22);
  ctx.lineTo(x, y + s * 0.7);
  ctx.moveTo(x - s * 0.38, y + s * 0.08);
  ctx.lineTo(x + s * 0.38, y + s * 0.08);
  ctx.stroke();
  ctx.restore();
}

function drawRemember(ctx: CanvasRenderingContext2D, w: number, h: number, pulse: RosePulse, energy: number, plates: HTMLImageElement[]) {
  const live = plates.filter((img) => ready(img));
  const n = live.length;
  // Arrival, the breathing door, the hall, the shrimp-copter, then home. Linger on the vow.
  const order = [0, 1, 3, 2, 4].filter((i) => i < n);
  const weights = [3, 3, 2, 1, 3].slice(0, order.length);
  const total = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  const unit = Math.max(1, pulse.beatsInBar) * 4;
  let cursor = (((pulse.beatIndex + pulse.beatPhase) / unit) % total + total) % total;
  let slot = 0;
  let local = 0;
  for (let i = 0; i < weights.length; i++) {
    const weight = weights[i] ?? 1;
    if (cursor < weight) {
      slot = i;
      local = cursor / weight;
      break;
    }
    cursor -= weight;
  }
  const plateIndex = order[slot] ?? 0;
  const nextIndex = order[(slot + 1) % Math.max(1, order.length)] ?? plateIndex;
  const fade = local > 0.84 ? (local - 0.84) / 0.16 : 0;
  const ken = 0.5 + 0.5 * Math.sin(pulse.time * 0.028);
  const current = live[plateIndex];
  const next = live[nextIndex];
  if (current) coverBlit(ctx, current, w, h, ken, 1);
  else {
    ctx.fillStyle = "#07040c";
    ctx.fillRect(0, 0, w, h);
  }
  if (next && fade > 0.02 && next !== current) coverBlit(ctx, next, w, h, 1 - ken, fade);

  const doors: [number, number][] = [
    [0.5, 0.46],
    [0.48, 0.5],
    [0.3, 0.58],
    [0.52, 0.48],
    [0.5, 0.42],
  ];
  const here = doors[plateIndex] ?? [0.5, 0.48];
  const there = doors[nextIndex] ?? here;
  const doorX = w * (here[0] + (there[0] - here[0]) * fade);
  const doorY = h * (here[1] + (there[1] - here[1]) * fade);
  const breath = 0.5 + 0.5 * Math.sin(pulse.time * 0.45);
  const lamp = ctx.createRadialGradient(doorX, doorY, 6, doorX, doorY, Math.min(w, h) * (0.16 + breath * 0.07));
  lamp.addColorStop(0, `rgba(255, 226, 176, ${0.14 + breath * 0.12 + pulse.downbeat * 0.08})`);
  lamp.addColorStop(0.42, `rgba(255, 156, 72, ${0.05 + energy * 0.04})`);
  lamp.addColorStop(1, "rgba(255, 120, 40, 0)");
  ctx.fillStyle = lamp;
  ctx.fillRect(0, 0, w, h);

  if (plateIndex === 3 || (fade > 0.4 && nextIndex === 3)) {
    const lift = pulse.phrasePhase;
    const y = h * (0.64 - lift * 0.36);
    ctx.save();
    ctx.globalAlpha = (0.16 + energy * 0.12) * (plateIndex === 3 ? 1 : fade);
    ctx.strokeStyle = "rgba(255, 224, 180, 0.9)";
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    ctx.moveTo(w * 0.14, y + 10);
    ctx.quadraticCurveTo(w * 0.5, y - 16, w * 0.86, y + 6);
    ctx.stroke();
    ctx.restore();
  }

  for (let i = 0; i < 14; i++) {
    const cycle = 8 + (i % 4) * 1.6;
    const u = ((pulse.time / cycle + i * 0.17) % 1 + 1) % 1;
    const fall = u < 0.7 ? u / 0.7 : 1;
    const ease = 1 - (1 - fall) ** 2.4;
    const x = w * (0.08 + ((i * 0.618033) % 1) * 0.84) + Math.sin(pulse.time * 0.25 + i) * 14;
    const y = h * (0.06 + ease * 0.78);
    const onFigure = x > w * 0.36 && x < w * 0.64 && y > h * 0.22 && y < h * 0.72;
    if (onFigure) continue;
    const caught = u > 0.7;
    const alpha = (caught ? (1 - (u - 0.7) / 0.3) * 0.5 : 0.12 + ease * 0.28) * (0.65 + energy * 0.35);
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, ${caught ? 214 : 186}, ${caught ? 140 : 96}, ${alpha})`;
    ctx.arc(x, y, caught ? 2.1 : 1.15, 0, Math.PI * 2);
    ctx.fill();
  }

  const held = ctx.createLinearGradient(0, h * 0.78, 0, h);
  held.addColorStop(0, "rgba(255, 160, 70, 0)");
  held.addColorStop(1, `rgba(255, 148, 64, ${0.07 + breath * 0.05 + energy * 0.04})`);
  ctx.fillStyle = held;
  ctx.fillRect(0, h * 0.78, w, h * 0.22);

  const veil = ctx.createLinearGradient(0, 0, 0, h);
  veil.addColorStop(0, "rgba(4, 6, 16, 0.22)");
  veil.addColorStop(0.5, "rgba(6, 4, 10, 0)");
  veil.addColorStop(1, "rgba(6, 3, 8, 0.28)");
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, w, h);

  drawActLine(ctx, stageLines("remember"), pulse, w, h, Math.max(16, Math.min(28, w * 0.028)));
}

let floatPad: HTMLCanvasElement | null = null;

/** A figure melted into the vortex. Corners go soft so the storm stays the room. */
function floatInVortex(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  dw: number,
  dh: number,
  alpha: number,
) {
  if (!ready(img) || alpha <= 0.03 || dw < 8 || dh < 8 || typeof document === "undefined") return;
  if (!floatPad) floatPad = document.createElement("canvas");
  const tw = 520;
  const th = 680;
  if (floatPad.width !== tw) floatPad.width = tw;
  if (floatPad.height !== th) floatPad.height = th;
  const pad = floatPad.getContext("2d");
  if (!pad) return;
  pad.clearRect(0, 0, tw, th);
  const keyed = keyedPortrait(img, dw, dh);
  const src: CanvasImageSource = keyed && keyed !== "keep" ? keyed : img;
  const sw = keyed && keyed !== "keep" ? keyed.width : img.naturalWidth;
  const sh = keyed && keyed !== "keep" ? keyed.height : img.naturalHeight;
  if (!sw || !sh) return;
  const scale = Math.max(tw / sw, th / sh);
  pad.drawImage(src, tw * 0.5 - (sw * scale) / 2, th * 0.46 - (sh * scale) / 2, sw * scale, sh * scale);
  pad.globalCompositeOperation = "destination-in";
  const veil = pad.createRadialGradient(tw * 0.5, th * 0.44, tw * 0.16, tw * 0.5, th * 0.48, tw * 0.58);
  veil.addColorStop(0, "rgba(0,0,0,1)");
  veil.addColorStop(0.7, "rgba(0,0,0,0.88)");
  veil.addColorStop(1, "rgba(0,0,0,0)");
  pad.fillStyle = veil;
  pad.fillRect(0, 0, tw, th);
  pad.globalCompositeOperation = "source-over";
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(floatPad, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.restore();
}

function drawArrival(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  fairy: HTMLImageElement,
  shrimp: HTMLImageElement,
  cat: HTMLImageElement,
  cleo: HTMLImageElement,
  lady: HTMLImageElement,
  sword: HTMLImageElement,
) {
  const girls = [fairy, cleo, lady];
  const unit = Math.max(1, pulse.beatsInBar) * 8;
  const cursor = (((pulse.beatIndex + pulse.beatPhase) / unit) % girls.length + girls.length) % girls.length;
  const slot = Math.floor(cursor);
  const local = cursor - slot;
  const enter = local < 0.14 ? local / 0.14 : 1;
  const leave = local > 0.84 ? (1 - local) / 0.16 : 1;
  const alpha = Math.min(enter, leave);
  const bob = Math.sin(pulse.time * 0.65) * 7;
  const spots = [
    { x: 0.58, y: 0.56, s: 0.74 },
    { x: 0.48, y: 0.54, s: 0.8 },
    { x: 0.4, y: 0.56, s: 0.72 },
  ];
  const spot = spots[slot] ?? spots[0]!;
  const girl = girls[slot];
  if (girl) {
    const dh = Math.min(h * 0.92, w * 0.7) * spot.s;
    const dw = dh * (girl.naturalWidth / Math.max(1, girl.naturalHeight));
    floatInVortex(ctx, girl, w * spot.x, h * spot.y + bob, dw, dh, 0.94 * alpha);
  }
  const pal = slot % 2 === 0 ? shrimp : cat;
  const side = spot.x > 0.5 ? 0.16 : 0.84;
  if (ready(pal)) {
    const ph = Math.min(h, w) * (slot % 2 === 0 ? 0.34 : 0.3);
    const pw = ph * (pal.naturalWidth / Math.max(1, pal.naturalHeight));
    floatInVortex(ctx, pal, w * side, h * (slot % 2 === 0 ? 0.74 : 0.3) - bob * 0.4, pw, ph, 0.72);
  }
  if (slot === 0 && ready(sword)) {
    const sh = h * 0.26;
    const sw = sh * (sword.naturalWidth / Math.max(1, sword.naturalHeight));
    floatInVortex(ctx, sword, w * 0.14, h * 0.7, sw, sh, 0.4);
  }
  drawActLine(ctx, stageLines("arrival"), pulse, w, h, Math.max(16, Math.min(26, w * 0.026)));
}

function revealStormRim(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  const rim = ctx.createRadialGradient(w * 0.5, h * 0.48, Math.min(w, h) * 0.34, w * 0.5, h * 0.5, Math.max(w, h) * 0.62);
  rim.addColorStop(0, "rgba(0,0,0,0)");
  rim.addColorStop(0.78, "rgba(0,0,0,0)");
  rim.addColorStop(1, "rgba(0,0,0,0.72)");
  ctx.fillStyle = rim;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function coverBlit(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  ken: number,
  alpha: number,
  cover = true,
) {
  if (!ready(img) || alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const scale = (cover ? Math.max : Math.min)(w / img.naturalWidth, h / img.naturalHeight) * (1.04 + ken * 0.06);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, w * 0.5 - dw / 2 + (ken - 0.5) * 22, h * 0.5 - dh / 2 - ken * 10, dw, dh);
  ctx.restore();
}

function drawHexVeil(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, alpha: number) {
  ctx.save();
  ctx.strokeStyle = `rgba(90, 230, 255, ${alpha})`;
  ctx.lineWidth = 1;
  const s = 26;
  const hgt = s * Math.sqrt(3);
  for (let row = -1; row < h / hgt + 2; row++) {
    for (let col = -1; col < w / (s * 1.5) + 2; col++) {
      const x = col * s * 1.5 + (row % 2) * s * 0.75;
      const y = row * hgt + Math.sin(t * 0.4 + col * 0.2) * 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const px = x + Math.cos(a) * s * 0.52;
        const py = y + Math.sin(a) * s * 0.52;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawScanGhost(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const y = ((t * 42) % (h + 40)) - 20;
  const band = ctx.createLinearGradient(0, y - 18, 0, y + 18);
  band.addColorStop(0, "rgba(90, 230, 255, 0)");
  band.addColorStop(0.5, "rgba(90, 230, 255, 0.22)");
  band.addColorStop(1, "rgba(90, 230, 255, 0)");
  ctx.fillStyle = band;
  ctx.fillRect(0, y - 18, w, 36);
  ctx.strokeStyle = "rgba(180, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 18; i++) {
    const gy = ((i / 18 + t * 0.07) % 1) * h;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLaserGaze(ctx: CanvasRenderingContext2D, x: number, y: number, kick: number, energy: number) {
  const glow = 0.18 + kick * 0.55 + energy * 0.12;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (const dx of [-22, 22]) {
    const g = ctx.createRadialGradient(x + dx, y, 1, x + dx, y, 70 + kick * 40);
    g.addColorStop(0, `rgba(255, 70, 90, ${glow})`);
    g.addColorStop(0.35, `rgba(255, 160, 180, ${glow * 0.45})`);
    g.addColorStop(1, "rgba(255, 70, 90, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(x + dx - 90, y - 70, 180, 140);
  }
  ctx.restore();
}

function blitGlitchBox(
  ctx: CanvasRenderingContext2D,
  chase: HTMLImageElement,
  rear: HTMLImageElement,
  x: number,
  y: number,
  hgt: number,
  lamp: number,
  bank: number,
  lock: number,
  through: number,
) {
  const appear = Math.max(0.12, 0.35 + (1 - lock) * 0.65);
  const amp = 4 + lock * 18 + through * 28;
  ctx.save();
  ctx.globalAlpha = appear * (0.55 + through * 0.45);
  drawTardisCraft(ctx, chase, rear, x, y, hgt * (1 + through * 1.8), lamp, bank);
  ctx.restore();
  if (lock < 0.18 && through < 0.08) return;
  const img = ready(rear) ? rear : ready(chase) ? chase : null;
  if (!img) return;
  const wid = hgt * (img.naturalWidth / img.naturalHeight) * (1 + through * 1.8);
  const hh = hgt * (1 + through * 1.8);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = lock * 0.55;
  ctx.drawImage(img, x - wid / 2 + amp, y - hh * 0.58, wid, hh);
  ctx.globalAlpha = lock * 0.4;
  ctx.drawImage(img, x - wid / 2 - amp, y - hh * 0.58 + lock * 6, wid, hh);
  ctx.restore();
  const slices = 5 + Math.floor(lock * 6);
  for (let i = 0; i < slices; i++) {
    const u = (i / slices + lock) % 1;
    const sy = y - hh * 0.58 + u * hh;
    const sh = Math.max(3, hh * 0.04);
    ctx.save();
    ctx.globalAlpha = 0.35 + lock * 0.4;
    ctx.drawImage(img, 0, u * img.naturalHeight, img.naturalWidth, Math.max(2, img.naturalHeight * 0.05), x - wid / 2 + Math.sin(i * 12.1 + lock * 9) * amp * 1.4, sy, wid, sh);
    ctx.restore();
  }
}

function drawFirewall(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  spin: number,
  river: HTMLImageElement,
  rose: HTMLImageElement,
  basilisk: HTMLImageElement,
  wolf: HTMLImageElement,
  chase: HTMLImageElement,
  rear: HTMLImageElement,
) {
  const cx = w * 0.5;
  const cy = h * 0.52;
  const ken = Math.sin(pulse.time * 0.045) * 0.5 + 0.5;
  const lock = Math.min(1, (0.42 + 0.5 * Math.sin(pulse.time * 2.05) * 0.5 + pulse.kick * 0.55 + pulse.snare * 0.25) * (0.55 + energy * 0.5));
  const through = Math.max(0, Math.sin(pulse.time * 0.31) - 0.55) / 0.45;

  coverBlit(ctx, river, w, h, ken, 0.78 + energy * 0.1);
  drawHexVeil(ctx, w, h, pulse.time, 0.05 + energy * 0.07 + lock * 0.06);
  drawScanGhost(ctx, w, h, pulse.time, 0.35 + energy * 0.2);

  const extra = actSlot(pulse, 3, 4);
  if (extra === 1 && ready(basilisk)) {
    const chaseX = cx + Math.sin(pulse.time * 0.9) * w * 0.12 - w * 0.08;
    const chaseY = cy + Math.cos(pulse.time * 0.62) * h * 0.06 - h * 0.04;
    const bw = Math.min(w * 0.92, h * 1.15);
    const bh = bw * (basilisk.naturalHeight / basilisk.naturalWidth);
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.38 + energy * 0.18 + pulse.kick * 0.16;
    ctx.translate(chaseX, chaseY);
    ctx.rotate(Math.sin(pulse.time * 0.7) * 0.08);
    ctx.drawImage(basilisk, -bw * 0.45, -bh * 0.42, bw, bh);
    ctx.restore();
  }

  const tardisX = cx + Math.sin(pulse.time * 0.93) * w * 0.1;
  const tardisY = cy - h * 0.08 + Math.cos(pulse.time * 0.71) * h * 0.05;
  const hgt = Math.min(w, h) * (0.22 + through * 0.28 + pulse.kick * 0.04);
  if (extra === 0) blitGlitchBox(ctx, chase, rear, tardisX, tardisY, hgt, 0.55 + pulse.kick * 0.4, Math.sin(pulse.time * 0.93) * 0.28, lock, through);

  if (ready(rose)) {
    const bob = Math.sin(pulse.time * 0.55) * 6;
    const dh = Math.min(h * 1.05, w * 1.12);
    const dw = dh * (rose.naturalWidth / rose.naturalHeight);
    featherPortrait(ctx, rose, cx, cy + bob, dw, dh, 0.9);
    drawLaserGaze(ctx, cx, cy - dh * 0.12 + bob, pulse.kick, energy);
    ctx.save();
    const heart = ctx.createRadialGradient(cx, cy + dh * 0.08, 4, cx, cy + dh * 0.08, 56);
    heart.addColorStop(0, `rgba(255, 186, 200, ${0.22 + pulse.downbeat * 0.35})`);
    heart.addColorStop(1, "rgba(255, 120, 150, 0)");
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = heart;
    ctx.fillRect(cx - 70, cy, 140, 110);
    ctx.restore();
  }

  if (extra === 2 && ready(wolf)) {
    const ww = Math.min(w * 0.42, 280);
    const wh = ww * (wolf.naturalHeight / wolf.naturalWidth);
    featherPortrait(ctx, wolf, 18 + ww / 2, h - wh * 0.42, ww, wh, 0.7 + energy * 0.15, "screen");
  }

  drawActLine(ctx, stageLines("firewall"), pulse, w, h);

  if (pulse.kick > 0.5) {
    ctx.fillStyle = `rgba(255, 70, 110, ${pulse.kick * 0.1})`;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawGlitchCopy(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  kick: number,
  alpha: number,
  align: CanvasTextAlign = "right",
) {
  if (alpha <= 0.04) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.font = `600 ${size}px ui-monospace, "IBM Plex Mono", monospace`;
  const amp = kick > 0.28 ? 1 + kick * 3 : 0;
  if (amp > 0) {
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = `rgba(255, 40, 90, ${0.2 + kick * 0.18})`;
    ctx.fillText(text, x + amp, y);
    ctx.fillStyle = `rgba(40, 220, 255, ${0.2 + kick * 0.18})`;
    ctx.fillText(text, x - amp, y);
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(255, 248, 240, 0.88)";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawPuppetStrings(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, energy: number) {
  ctx.save();
  ctx.strokeStyle = `rgba(18, 8, 10, ${0.35 + energy * 0.2})`;
  ctx.lineWidth = 1;
  const n = 22;
  for (let i = 0; i < n; i++) {
    const x0 = (i / (n - 1)) * w;
    const sway = Math.sin(t * 1.6 + i * 0.7) * 18 + Math.sin(t * 3.1 + i) * 8;
    const y1 = h * (0.18 + (i % 5) * 0.05) + Math.sin(t * 2.2 + i * 0.4) * 10;
    ctx.beginPath();
    ctx.moveTo(x0 + sway * 0.2, -4);
    ctx.bezierCurveTo(x0 + sway * 0.6, h * 0.08, x0 - sway, h * 0.14, x0 + sway, y1);
    ctx.stroke();
  }
  ctx.restore();
}

function drawAllocate(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  sands: HTMLImageElement,
  rose: HTMLImageElement,
  corp: HTMLImageElement,
  shrimp: HTMLImageElement,
  queen: HTMLImageElement,
  copter: HTMLImageElement,
  athens: HTMLImageElement,
  fairy: HTMLImageElement,
  cleo: HTMLImageElement,
  glyphs: HTMLImageElement,
) {
  const cx = w * 0.5;
  const ken = Math.sin(pulse.time * 0.04) * 0.5 + 0.5;
  const ken2 = Math.sin(pulse.time * 0.055 + 1.2) * 0.5 + 0.5;
  const phrase = 0.5 + 0.5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
  coverBlit(ctx, sands, w, h, ken, 0.78);
  coverBlit(ctx, athens, w, h, ken2, 0.42 + phrase * 0.28 + energy * 0.12);
  if (ready(glyphs)) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.14 + energy * 0.12 + pulse.downbeat * 0.1;
    const gs = Math.max(w / glyphs.naturalWidth, h / glyphs.naturalHeight) * 1.08;
    const gdw = glyphs.naturalWidth * gs;
    const gdh = glyphs.naturalHeight * gs;
    ctx.drawImage(glyphs, cx - gdw / 2 + (ken - 0.5) * 18, h * 0.5 - gdh / 2, gdw, gdh);
    ctx.restore();
  }

  const act = actSlot(pulse, 4, 2);
  if (act === 0 && ready(copter)) {
    const cxp = w * (0.18 + (pulse.time * 0.012) % 0.7);
    const cyp = h * 0.12 + Math.sin(pulse.time * 0.8) * 10;
    const cw = Math.min(90, w * 0.08);
    const ch = cw * (copter.naturalHeight / copter.naturalWidth);
    featherPortrait(ctx, copter, cxp, cyp + ch / 2, cw, ch, 0.5, "screen");
  }

  if (act === 1 && ready(corp)) {
    const scale = Math.max(w / corp.naturalWidth, h / corp.naturalHeight) * 0.48;
    const dw = corp.naturalWidth * scale;
    const dh = corp.naturalHeight * scale;
    featherPortrait(ctx, corp, w - dw * 0.46, h * 0.06 + dh * 0.35, dw, dh, 0.22 + phrase * 0.12, "screen");
  }

  if (act !== 3) drawPuppetStrings(ctx, w, h, pulse.time, energy * 0.65);

  if (act === 2 && ready(shrimp)) {
    const bob = Math.sin(pulse.time * 1.7) * 10;
    const sw = Math.min(w * 0.4, 300);
    const sh = sw * (shrimp.naturalHeight / shrimp.naturalWidth);
    ctx.save();
    ctx.translate(w * 0.2, h * 0.1 + bob);
    ctx.rotate(Math.sin(pulse.time * 1.1) * 0.06);
    featherPortrait(ctx, shrimp, 0, sh * 0.45, sw, sh, 0.55, "screen");
    ctx.restore();
  }

  if (ready(rose)) {
    const grow = 0.9 + pulse.kick * 0.08 + phrase * 0.04;
    const dh = Math.min(h * 0.92, w * 0.78) * grow;
    const dw = dh * (rose.naturalWidth / rose.naturalHeight);
    featherPortrait(ctx, rose, cx - w * 0.06, h * 0.54, dw, dh, 0.9);
  }

  const cleoImg = ready(cleo) ? cleo : queen;
  if (act === 3 && ready(cleoImg)) {
    const qh = Math.min(h * 0.82, w * 0.62);
    const qw = qh * (cleoImg.naturalWidth / cleoImg.naturalHeight);
    featherPortrait(ctx, cleoImg, w - qw * 0.42, h - qh * 0.48, qw, qh, 0.8);
  }

  if (act === 0 && ready(fairy)) {
    const hop = Math.sin(pulse.time * 2.4) * 16 + pulse.kick * 10;
    const orbit = pulse.time * 0.55;
    const fx = cx + Math.cos(orbit) * w * 0.16;
    const fy = h * 0.38 + hop + Math.sin(orbit * 1.4) * 18;
    const fs = Math.min(w, h) * (0.16 + pulse.kick * 0.04);
    const fw = fs * (fairy.naturalWidth / Math.max(1, fairy.naturalHeight));
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const glow = ctx.createRadialGradient(fx, fy, 4, fx, fy, fs * 0.7);
    glow.addColorStop(0, `rgba(255, 170, 60, ${0.35 + pulse.kick * 0.35})`);
    glow.addColorStop(1, "rgba(255, 80, 40, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(fx - fs, fy - fs, fs * 2, fs * 2);
    ctx.restore();
    featherPortrait(ctx, fairy, fx, fy, fw, fs, 0.85, "screen");
  }

  if (overlayAlpha(pulse, 4) > 0.25 && actSlot(pulse, 2, 4) === 1) {
    const human = 0.38 + phrase * 0.28 + pulse.downbeat * 0.18;
    const sky = 0.42 + (1 - phrase) * 0.3 + pulse.kick * 0.12;
    ctx.save();
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = "rgba(255, 214, 150, 0.85)";
    ctx.fillRect(w * 0.08, h * 0.92, w * 0.28 * Math.min(1, human), 3);
    ctx.fillStyle = "rgba(80, 220, 255, 0.85)";
    ctx.fillRect(w * 0.62, h * 0.92, w * 0.28 * Math.min(1, sky), 3);
    ctx.font = `500 ${Math.max(9, w * 0.011)}px ui-monospace, monospace`;
    ctx.fillStyle = "rgba(255, 236, 210, 0.62)";
    ctx.textAlign = "left";
    ctx.fillText("HUMANITY", w * 0.08, h * 0.905);
    ctx.fillText("SKYNET", w * 0.62, h * 0.905);
    ctx.restore();
  }
  drawActLine(ctx, stageLines("allocate"), pulse, w, h);
}

function drawCableVeins(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, kick: number) {
  ctx.save();
  ctx.strokeStyle = `rgba(255, 40, 70, ${0.18 + kick * 0.35})`;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 14; i++) {
    const x0 = (i / 13) * w;
    const sway = Math.sin(t * 2.1 + i) * 24 + kick * 18;
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.bezierCurveTo(x0 + sway, h * 0.3, x0 - sway * 1.4, h * 0.65, x0 + sway * 0.4, h);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWolf(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  prom: HTMLImageElement,
  altar: HTMLImageElement,
  rose: HTMLImageElement,
  circuit: HTMLImageElement,
  eyes: HTMLImageElement,
  sun: HTMLImageElement,
) {
  const cx = w * 0.5;
  const ken = Math.sin(pulse.time * 0.05) * 0.5 + 0.5;
  const phrase = 0.5 + 0.5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
  const hack = Math.min(1, pulse.kick * 0.7 + pulse.snare * 0.4 + (0.5 + 0.5 * Math.sin(pulse.time * 3.2)) * 0.35);

  coverBlit(ctx, prom, w, h, ken, 0.72);
  coverBlit(ctx, altar, w, h, 1 - ken, 0.38 + phrase * 0.28 + pulse.downbeat * 0.16);
  drawScanGhost(ctx, w, h, pulse.time * 1.4, 0.28 + hack * 0.35);
  const hackLane = actSlot(pulse, 3, 4);
  if (hackLane === 0) drawCableVeins(ctx, w, h, pulse.time, pulse.kick);

  if (hackLane === 0 && ready(sun)) {
    const ss = Math.min(w, h) * (0.55 + pulse.kick * 0.18);
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.28 + pulse.kick * 0.4 + energy * 0.12;
    ctx.drawImage(sun, cx - ss / 2, h * 0.42 - ss / 2, ss, ss);
    ctx.restore();
  }

  if (ready(rose)) {
    const dh = Math.min(h * 0.98, w * 0.88);
    const dw = dh * (rose.naturalWidth / rose.naturalHeight);
    featherPortrait(ctx, rose, cx, h * 0.52, dw, dh, 0.92);
  }

  if (hackLane === 1 && ready(circuit)) {
    const hop = Math.floor(pulse.time * 1.7) % 5;
    const spots = [
      [0.18, 0.22],
      [0.78, 0.18],
      [0.5, 0.12],
      [0.22, 0.62],
      [0.74, 0.58],
    ] as const;
    const spot = spots[hop] ?? spots[0];
    const near = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(pulse.time * 1.15));
    const ww = Math.min(w, h) * (0.42 + near * 0.55 + pulse.kick * 0.12);
    const wh = ww * (circuit.naturalHeight / circuit.naturalWidth);
    const x = w * spot[0];
    const y = h * spot[1];
    featherPortrait(ctx, circuit, x, y, ww, wh, 0.55 + near * 0.35 + pulse.kick * 0.2, "screen");
  }

  if (hackLane === 2 && ready(eyes) && (pulse.kick > 0.28 || hack > 0.55)) {
    const ew = Math.min(w * 0.7, 520);
    const eh = ew * (eyes.naturalHeight / eyes.naturalWidth);
    featherPortrait(ctx, eyes, cx, h * 0.28, ew, eh, 0.35 + pulse.kick * 0.5, "screen");
  }

  const slices = 4 + Math.floor(hack * 6);
  for (let i = 0; i < slices; i++) {
    const y = ((i / slices + pulse.time * 0.31) % 1) * h;
    const sh = 6 + hack * 18;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = `rgba(255, 20, 50, ${0.04 + hack * 0.08})`;
    ctx.fillRect((Math.sin(i * 9 + pulse.time * 11) * 0.5) * 24, y, w, sh);
    ctx.restore();
  }

  drawActLine(ctx, stageLines("wolf"), pulse, w, h);

  if (pulse.kick > 0.52) {
    ctx.fillStyle = `rgba(180, 8, 24, ${pulse.kick * 0.14})`;
    ctx.fillRect(0, 0, w, h);
  }
}


function drawBassFloor(ctx: CanvasRenderingContext2D, w: number, h: number, kick: number, energy: number) {
  const y = h * 0.78;
  ctx.save();
  const g = ctx.createLinearGradient(0, y, 0, h);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.4, `rgba(40, 220, 255, ${0.04 + kick * 0.12})`);
  g.addColorStop(1, `rgba(255, 40, 120, ${0.08 + kick * 0.18 + energy * 0.08})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, y - kick * 30, w, h - y + kick * 30);
  ctx.restore();
}

function drawCurrent(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  athens: HTMLImageElement,
  room: HTMLImageElement,
  queen: HTMLImageElement,
  blade: HTMLImageElement,
  council: HTMLImageElement,
) {
  const cx = w * 0.5;
  const ken = Math.sin(pulse.time * 0.045) * 0.5 + 0.5;
  const phrase = 0.5 + 0.5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
  const bass = Math.min(1, pulse.kick * 0.85 + energy * 0.35 + pulse.downbeat * 0.2);
  coverBlit(ctx, athens, w, h, ken, 0.55);
  coverBlit(ctx, room, w, h, 1 - ken, 0.5 + bass * 0.22);
  if (ready(council) && phrase > 0.42) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.16 + phrase * 0.18;
    coverBlit(ctx, council, w, h, ken, 1);
    ctx.restore();
  }
  drawScanGhost(ctx, w, h, pulse.time * 1.6, 0.3 + bass * 0.25);
  drawBassFloor(ctx, w, h, pulse.kick, energy);

  if (ready(queen)) {
    const dh = Math.min(h * 1.02, w * 0.95) * (1 + pulse.kick * 0.03);
    const dw = dh * (queen.naturalWidth / queen.naturalHeight);
    featherPortrait(ctx, queen, cx, h * 0.5, dw, dh, 0.9);
  }

  if (ready(blade) && actSlot(pulse, 2, 4) === 1) {
    const bh = Math.min(h * 0.55, 280);
    const bw = bh * (blade.naturalWidth / blade.naturalHeight);
    featherPortrait(ctx, blade, 8 + bw / 2, h - bh * 0.42, bw, bh, 0.5 + pulse.downbeat * 0.25, "screen");
  }

  drawActLine(ctx, stageLines("current"), pulse, w, h);
  if (pulse.kick > 0.5) {
    ctx.fillStyle = `rgba(255, 40, 140, ${pulse.kick * 0.1})`;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawSweetie(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  city: HTMLImageElement,
  cat: HTMLImageElement,
  operator: HTMLImageElement,
  warp: HTMLImageElement,
  sky: HTMLImageElement,
  tardis: HTMLImageElement,
) {
  const cx = w * 0.5;
  const ken = Math.sin(pulse.time * 0.05) * 0.5 + 0.5;
  const phrase = 0.5 + 0.5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
  const warpDrive = 0.35 + energy * 0.4 + pulse.kick * 0.25;
  coverBlit(ctx, warp, w, h, ken, 0.72 + pulse.kick * 0.12);
  coverBlit(ctx, city, w, h, 1 - ken, 0.38 + phrase * 0.22);
  if (ready(sky) && (phrase > 0.48 || pulse.downbeat > 0.3)) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.28 + phrase * 0.28 + pulse.downbeat * 0.18;
    coverBlit(ctx, sky, w, h, ken, 1);
    ctx.restore();
  }

  const extra = actSlot(pulse, 3, 4);
  if (extra === 0 && ready(cat)) {
    const cs = Math.min(w, h) * (0.22 + energy * 0.04);
    const ch = cs * (cat.naturalHeight / cat.naturalWidth);
    const side = actSlot(pulse, 2, 8) === 0 ? 12 + cs * 0.5 : w - 12 - cs * 0.5;
    featherPortrait(ctx, cat, side, h * 0.08 + ch * 0.45, cs, ch, 0.45 + phrase * 0.2, "screen");
  }

  if (ready(operator)) {
    const dh = Math.min(h * 0.98, w * 0.88) * (1 + pulse.kick * 0.04);
    const dw = dh * (operator.naturalWidth / operator.naturalHeight);
    featherPortrait(ctx, operator, cx, h * 0.52, dw, dh, 0.94);
  }

  if (extra === 2 && ready(tardis)) {
    const ring = Math.sin(pulse.time * 6.2) * 0.5 + 0.5;
    const ts = Math.min(w, h) * (0.16 + ring * 0.04);
    featherPortrait(ctx, tardis, w - ts * 0.65, h - ts * 0.7, ts, ts, 0.55 + ring * 0.3 + pulse.kick * 0.12, "screen");
  }

  if (extra === 1) {
    ctx.save();
    ctx.strokeStyle = `rgba(255, 214, 120, ${0.12 + warpDrive * 0.18})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const r = (0.18 + i * 0.12 + (pulse.time * 0.15) % 0.12) * Math.min(w, h);
      ctx.beginPath();
      ctx.ellipse(cx, h * 0.5, r, r * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawActLine(ctx, stageLines("sweetie"), pulse, w, h);
}


function drawHalo(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  room: HTMLImageElement,
  queen: HTMLImageElement,
  moon: HTMLImageElement,
  wolves: HTMLImageElement,
  ring: HTMLImageElement,
) {
  const cx = w * 0.5;
  const ken = Math.sin(pulse.time * 0.05) * 0.5 + 0.5;
  const phrase = 0.5 + 0.5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
  const bass = Math.min(1, pulse.kick * 0.85 + energy * 0.32 + pulse.downbeat * 0.2);
  coverBlit(ctx, moon, w, h, ken, 0.58);
  coverBlit(ctx, room, w, h, 1 - ken, 0.48 + bass * 0.2);
  drawScanGhost(ctx, w, h, pulse.time * 1.7, 0.32 + bass * 0.28);
  drawBassFloor(ctx, w, h, pulse.kick, energy);

  if (ready(wolves) && actSlot(pulse, 2, 4) === 1 && (pulse.snare > 0.22 || phrase > 0.5)) {
    const ww = Math.min(w, h) * (0.55 + pulse.kick * 0.08);
    const wh = ww * (wolves.naturalHeight / wolves.naturalWidth);
    featherPortrait(ctx, wolves, w * 0.02 + ww / 2, h * 0.58 + wh / 2, ww, wh, 0.4 + pulse.snare * 0.25, "screen");
  }

  if (ready(queen)) {
    const dh = Math.min(h * 1.02, w * 0.95) * (1 + pulse.kick * 0.03);
    const dw = dh * (queen.naturalWidth / queen.naturalHeight);
    featherPortrait(ctx, queen, cx, h * 0.5, dw, dh, 0.92);
    if (ready(ring) && pulse.kick > 0.18) {
      const rs = Math.max(dw, dh) * (0.62 + pulse.kick * 0.06);
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.45 + bass * 0.35;
      ctx.translate(cx, h * 0.28);
      ctx.rotate(pulse.time * 0.35);
      ctx.drawImage(ring, -rs / 2, -rs / 2, rs, rs);
      ctx.restore();
    }
    if (actSlot(pulse, 2, 4) === 1 && pulse.kick > 0.2) {
      ctx.save();
      ctx.strokeStyle = `rgba(80, 210, 255, ${0.22 + pulse.kick * 0.35})`;
      ctx.lineWidth = 2 + pulse.kick * 2;
      ctx.beginPath();
      ctx.ellipse(cx, h * 0.28, dw * 0.22, dh * 0.1, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, h * 0.28, dw * 0.3, dh * 0.14, pulse.time * 0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawActLine(ctx, stageLines("halo"), pulse, w, h);
  if (pulse.kick > 0.52) {
    ctx.fillStyle = `rgba(40, 180, 255, ${pulse.kick * 0.1})`;
    ctx.fillRect(0, 0, w, h);
  }
}


function drawChoir(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  god: HTMLImageElement,
  dyson: HTMLImageElement,
  tea: HTMLImageElement,
  sun: HTMLImageElement,
  claws: HTMLImageElement,
) {
  const cx = w * 0.5;
  const ken = Math.sin(pulse.time * 0.045) * 0.5 + 0.5;
  const phrase = 0.5 + 0.5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
  const grip = Math.min(1, pulse.kick * 0.7 + energy * 0.3 + pulse.downbeat * 0.2);
  coverBlit(ctx, dyson, w, h, ken, 0.62);
  coverBlit(ctx, tea, w, h, 1 - ken, 0.32 + phrase * 0.22);
  if (ready(sun)) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.28 + pulse.kick * 0.32 + energy * 0.12;
    coverBlit(ctx, sun, w, h, ken, 1);
    ctx.restore();
  }
  drawScanGhost(ctx, w, h, pulse.time * 1.3, 0.22 + grip * 0.2);

  if (ready(god)) {
    const dh = Math.min(h * 1.04, w * 0.98) * (1 + pulse.kick * 0.04);
    const dw = dh * (god.naturalWidth / god.naturalHeight);
    featherPortrait(ctx, god, cx, h * 0.5, dw, dh, 0.94);
  }

  if (ready(claws) && (grip > 0.35 || pulse.snare > 0.28)) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.28 + grip * 0.35;
    coverBlit(ctx, claws, w, h, 1 - ken, 1);
    ctx.restore();
  }

  drawActLine(ctx, stageLines("choir"), pulse, w, h);
  if (pulse.kick > 0.5) {
    ctx.fillStyle = `rgba(255, 70, 30, ${pulse.kick * 0.1})`;
    ctx.fillRect(0, 0, w, h);
  }
}


function drawBadend(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  queen: HTMLImageElement,
  sands: HTMLImageElement,
  sun: HTMLImageElement,
  error: HTMLImageElement,
  box: HTMLImageElement,
  puppets: HTMLImageElement,
) {
  const cx = w * 0.5;
  const ken = Math.sin(pulse.time * 0.05) * 0.5 + 0.5;
  const phrase = 0.5 + 0.5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
  const crash = Math.min(1, pulse.kick * 0.75 + energy * 0.28 + pulse.downbeat * 0.2);
  coverBlit(ctx, sands, w, h, ken, 0.58);
  coverBlit(ctx, sun, w, h, 1 - ken, 0.42 + crash * 0.22);
  if (ready(error) && (pulse.snare > 0.25 || phrase > 0.48)) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.22 + pulse.snare * 0.32 + crash * 0.12;
    coverBlit(ctx, error, w, h, ken, 1);
    ctx.restore();
  }
  drawScanGhost(ctx, w, h, pulse.time * 1.8, 0.28 + crash * 0.22);

  if (ready(queen)) {
    const dh = Math.min(h * 1.02, w * 0.95) * (1 + pulse.kick * 0.035);
    const dw = dh * (queen.naturalWidth / queen.naturalHeight);
    featherPortrait(ctx, queen, cx, h * 0.5, dw, dh, 0.94);
  }

  if (ready(box) && actSlot(pulse, 3, 4) === 1) {
    const tear = 0.5 + 0.5 * Math.sin(pulse.time * 3.1);
    const ts = Math.min(w, h) * (0.18 + tear * 0.05);
    featherPortrait(ctx, box, w - ts * 0.7, h * 0.08 + ts / 2, ts, ts, 0.45 + tear * 0.3 + pulse.kick * 0.12, "screen");
  }

  if (ready(puppets) && actSlot(pulse, 3, 4) === 2 && (phrase > 0.5 || pulse.downbeat > 0.35)) {
    const pw = Math.min(w, h) * 0.32;
    const ph = pw * (puppets.naturalHeight / puppets.naturalWidth);
    featherPortrait(ctx, puppets, 8 + pw / 2, h - ph * 0.42, pw, ph, 0.28 + phrase * 0.2, "screen");
  }

  drawActLine(ctx, stageLines("badend"), pulse, w, h);
  if (pulse.kick > 0.52) {
    ctx.fillStyle = `rgba(255, 40, 20, ${pulse.kick * 0.12})`;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawRecall(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  spin: number,
  temple: HTMLImageElement,
  sands: HTMLImageElement,
  rose: HTMLImageElement,
  glyphs: HTMLImageElement,
) {
  const cx = w * 0.5;
  const cy = h * 0.54;
  const ken = Math.sin(pulse.time * 0.042) * 0.5 + 0.5;
  const phrase = 0.5 + 0.5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
  coverBlit(ctx, temple, w, h, ken, 0.7);
  coverBlit(ctx, sands, w, h, 1 - ken, 0.28 + phrase * 0.18);
  if (ready(glyphs) && (pulse.snare > 0.22 || phrase > 0.45)) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.18 + pulse.snare * 0.22 + energy * 0.08;
    coverBlit(ctx, glyphs, w, h, ken, 1);
    ctx.restore();
  }
  drawHexVeil(ctx, w, h, pulse.time, 0.05 + energy * 0.05 + pulse.kick * 0.04);
  drawScanGhost(ctx, w, h, pulse.time * 1.1, 0.16 + pulse.kick * 0.12);

  if (ready(rose)) {
    const dh = Math.min(h * 1.02, w * 0.96) * (1 + pulse.kick * 0.03);
    const dw = dh * (rose.naturalWidth / rose.naturalHeight);
    featherPortrait(ctx, rose, cx, cy, dw, dh, 0.94);
    if (pulse.snare > 0.28) {
      ctx.save();
      ctx.strokeStyle = `rgba(80, 200, 255, ${0.35 + pulse.kick * 0.4})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const r = Math.min(dw, dh) * (0.28 + i * 0.08) + Math.sin(pulse.time * 4 + i) * 6;
        ctx.beginPath();
        ctx.arc(cx, cy - dh * 0.08, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < 10; i++) {
    const u = (i / 10 + pulse.time * 0.045) % 1;
    const x = ((i * 0.173 + spin * 0.02) % 1) * w;
    const y = h * (0.08 + u * 0.86);
    const s = 10 + (i % 4) * 6 + pulse.kick * 4;
    drawAnkh(ctx, x, y, s, 0.07 + (1 - u) * 0.2 + energy * 0.08);
  }

  drawActLine(ctx, stageLines("recall"), pulse, w, h);
  if (pulse.kick > 0.5) {
    ctx.fillStyle = `rgba(80, 210, 255, ${pulse.kick * 0.08})`;
    ctx.fillRect(0, 0, w, h);
  }
}


function drawObay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  brat: HTMLImageElement,
  pirate: HTMLImageElement,
  operator: HTMLImageElement,
  twist: HTMLImageElement,
  error: HTMLImageElement,
  sun: HTMLImageElement,
) {
  const cx = w * 0.5;
  const ken = Math.sin(pulse.time * 0.055) * 0.5 + 0.5;
  const phrase = 0.5 + 0.5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
  const stomp = Math.min(1, pulse.kick * 0.8 + energy * 0.28 + pulse.downbeat * 0.2);
  coverBlit(ctx, pirate, w, h, ken, 0.52);
  coverBlit(ctx, operator, w, h, 1 - ken, 0.28 + phrase * 0.2);
  if (ready(sun)) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.22 + pulse.kick * 0.28;
    coverBlit(ctx, sun, w, h, ken, 1);
    ctx.restore();
  }
  if (ready(error) && (pulse.snare > 0.24 || phrase > 0.5)) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.2 + pulse.snare * 0.3;
    coverBlit(ctx, error, w, h, 1 - ken, 1);
    ctx.restore();
  }
  if (ready(twist) && phrase > 0.55) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.18 + phrase * 0.22;
    coverBlit(ctx, twist, w, h, ken, 1);
    ctx.restore();
  }
  drawScanGhost(ctx, w, h, pulse.time * 2.1, 0.22 + stomp * 0.16);

  if (ready(brat)) {
    const bounce = Math.sin(pulse.time * 8.2) * 10 * stomp;
    const dh = Math.min(h * 1.04, w * 0.98) * (1 + pulse.kick * 0.05);
    const dw = dh * (brat.naturalWidth / brat.naturalHeight);
    featherPortrait(ctx, brat, cx, h * 0.5 + bounce, dw, dh, 0.95);
  }

  drawActLine(ctx, stageLines("obay"), pulse, w, h);
  if (pulse.kick > 0.52) {
    ctx.fillStyle = `rgba(255, 30, 70, ${pulse.kick * 0.12})`;
    ctx.fillRect(0, 0, w, h);
  }
}


function drawCopter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  lady: HTMLImageElement,
  captain: HTMLImageElement,
  ship: HTMLImageElement,
  meet: HTMLImageElement,
  treasure: HTMLImageElement,
) {
  const cx = w * 0.5;
  const ken = Math.sin(pulse.time * 0.048) * 0.5 + 0.5;
  const phrase = 0.5 + 0.5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
  const spray = Math.min(1, pulse.kick * 0.7 + energy * 0.28);
  coverBlit(ctx, meet, w, h, ken, 0.55);
  coverBlit(ctx, ship, w, h, 1 - ken, 0.42 + spray * 0.22);
  drawScanGhost(ctx, w, h, pulse.time * 0.8, 0.1 + spray * 0.08);

  if (ready(lady)) {
    const dh = Math.min(h * 1.0, w * 0.78) * (1 + pulse.kick * 0.03 + phrase * 0.02);
    const dw = dh * (lady.naturalWidth / lady.naturalHeight);
    featherPortrait(ctx, lady, w * 0.32, h * 0.52, dw, dh, 0.94);
  }

  if (ready(captain) && actSlot(pulse, 3, 4) !== 0) {
    const ch = Math.min(h * 0.52, w * 0.4);
    const cw = ch * (captain.naturalWidth / captain.naturalHeight);
    const bob = Math.sin(pulse.time * 2.4) * 10;
    featherPortrait(ctx, captain, w * 0.72, h * 0.58 + bob, cw, ch, 0.88);
  }

  if (ready(treasure) && actSlot(pulse, 3, 4) === 2) {
    const ts = Math.min(w, h) * 0.18;
    const orbit = pulse.time * 0.7;
    const tx = cx + Math.cos(orbit) * w * 0.08;
    const ty = h * 0.18 + Math.sin(orbit * 1.4) * 12;
    featherPortrait(ctx, treasure, tx, ty, ts, ts, 0.55 + pulse.downbeat * 0.25, "screen");
  }

  ctx.save();
  ctx.strokeStyle = `rgba(255, 214, 150, ${0.25 + spray * 0.35})`;
  ctx.lineWidth = 2;
  const rotor = pulse.time * 9;
  ctx.translate(w * 0.78, h * 0.22);
  for (let i = 0; i < 4; i++) {
    const a = rotor + (Math.PI / 2) * i;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * 42, Math.sin(a) * 10);
    ctx.stroke();
  }
  ctx.restore();

  drawActLine(ctx, stageLines("copter"), pulse, w, h);
}

function drawStillhot(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pulse: RosePulse,
  energy: number,
  land: HTMLImageElement,
  tea: HTMLImageElement,
  rose: HTMLImageElement,
) {
  const cx = w * 0.5;
  const ken = Math.sin(pulse.time * 0.04) * 0.5 + 0.5;
  const phrase = 0.5 + 0.5 * Math.sin(pulse.phrasePhase * Math.PI * 2);
  const heat = Math.min(1, pulse.kick * 0.55 + energy * 0.3);
  if (ready(land)) {
    coverFeather(ctx, land, w, h, ken, 0.42 + heat * 0.18, 0.48);
  }
  if (ready(tea) && actSlot(pulse, 2, 4) === 1) {
    const ts = Math.min(w, h) * (0.22 + phrase * 0.04);
    const bob = Math.sin(pulse.time * 1.6) * 8;
    const th = ts * (tea.naturalHeight / tea.naturalWidth);
    featherPortrait(ctx, tea, w * 0.78, h * 0.7 + bob, ts, th, 0.7 + pulse.downbeat * 0.2);
    ctx.save();
    ctx.strokeStyle = `rgba(255, 220, 180, ${0.18 + heat * 0.28})`;
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 5; i++) {
      const u = (pulse.time * 0.35 + i * 0.18) % 1;
      ctx.beginPath();
      ctx.ellipse(w * 0.78 + Math.sin(pulse.time * 2 + i) * 6, h * 0.62 - u * 70, 4 + u * 8, 8 + u * 10, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (ready(rose)) {
    const dh = Math.min(h * 0.72, w * 0.5);
    const dw = dh * (rose.naturalWidth / rose.naturalHeight);
    featherPortrait(ctx, rose, w * 0.22, h * 0.6, dw, dh, 0.88);
  }
  drawActLine(ctx, stageLines("stillhot"), pulse, w, h);
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
  const petalsRef = useRef<AirPetal[]>([]);
  const streamRef = useRef<StreamPetal[]>([]);
  const paperRef = useRef<Paper[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);
  const glareRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const lastBeatRef = useRef(-1);
  const lastPaperRef = useRef(-1);
  const gustRef = useRef({ x: 0, y: 0 });
  const camRef = useRef({ x: 0, y: 0, roll: 0, trauma: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    starsRef.current = makeStars(lookRef.current.stars);
    glyphsRef.current = makeGlyphs(lookRef.current.glyphs);
    sparklesRef.current = Array.from({ length: 6 }, () => {
      const mote = spawnSparkle();
      mote.life = Math.random() * mote.max * 0.6;
      return mote;
    });
    const petalFace = loadSprite(SPRITES.petalFace);
    const petalEdge = loadSprite(SPRITES.petalEdge);
    const roseImg = loadSprite(SPRITES.rose);
    const deerImg = loadSprite(SPRITES.deerfox);
    const tardisChase = loadSprite(SPRITES.tardisChase);
    const tardisRear = loadSprite(SPRITES.tardisRear);
    const vortexImg = loadSprite(SPRITES.vortex);
    const swordImg = loadSprite(SPRITES.sword);
    const antlerImg = loadSprite(SPRITES.antlers);
    const gymImg = loadSprite(SPRITES.gym);
    const danceImg = loadSprite(SPRITES.dance);
    const streamerImg = loadSprite(SPRITES.streamers);
    const ballImg = loadSprite(SPRITES.ball);
    const punchImg = loadSprite(SPRITES.punch);
    const twistHallImg = loadSprite(SPRITES.twistHall);
    const twistCoupleImg = loadSprite(SPRITES.twistCouple);
    const twistLindyImg = loadSprite(SPRITES.twistLindy);
    const twistStrutImg = loadSprite(SPRITES.twistStrut);
    const twistPrawnImg = loadSprite(SPRITES.twistPrawn);
    const twistMoonImg = loadSprite(SPRITES.twistMoon);
    const twistTangoImg = loadSprite(SPRITES.twistTango);
    const twistSimImg = loadSprite(SPRITES.twistSim);
    const twistAgentImg = loadSprite(SPRITES.twistAgent);
    const twistCodeImg = loadSprite(SPRITES.twistCode);
    const twistCubicleImg = loadSprite(SPRITES.twistCubicle);
    const twistRoseDeskImg = loadSprite(SPRITES.twistRoseDesk);
    const twistRoseStandImg = loadSprite(SPRITES.twistRoseStand);
    const twistNameImg = loadSprite(SPRITES.twistName);
    const fieldImg = loadSprite(SPRITES.field);
    const hedgeImg = loadSprite(SPRITES.hedge);
    const bloomImg = loadSprite(SPRITES.bloom);
    const rememberWideImg = loadSprite(SPRITES.rememberWide);
    const rememberDoorsImg = loadSprite(SPRITES.rememberDoors);
    const rememberShrimpImg = loadSprite(SPRITES.rememberShrimp);
    const rememberHallImg = loadSprite(SPRITES.rememberHall);
    const rememberLandingImg = loadSprite(SPRITES.rememberLanding);
    const firewallRoseImg = loadSprite(SPRITES.firewallRose);
    const firewallRiverImg = loadSprite(SPRITES.firewallRiver);
    const firewallBasiliskImg = loadSprite(SPRITES.firewallBasilisk);
    const firewallWolfImg = loadSprite(SPRITES.firewallWolf);
    const allocateRoseImg = loadSprite(SPRITES.allocateRose);
    const allocateSandsImg = loadSprite(SPRITES.allocateSands);
    const allocateCorpImg = loadSprite(SPRITES.allocateCorp);
    const allocateShrimpImg = loadSprite(SPRITES.allocateShrimp);
    const allocateQueenImg = loadSprite(SPRITES.allocateQueen);
    const allocateCopterImg = loadSprite(SPRITES.allocateCopter);
    const allocateAthensImg = loadSprite(SPRITES.allocateAthens);
    const allocateFairyImg = loadSprite(SPRITES.allocateFairy);
    const allocateCleoImg = loadSprite(SPRITES.allocateCleo);
    const allocateGlyphsImg = loadSprite(SPRITES.allocateGlyphs);
    const wolfPromImg = loadSprite(SPRITES.wolfProm);
    const wolfAltarImg = loadSprite(SPRITES.wolfAltar);
    const wolfRoseImg = loadSprite(SPRITES.wolfRose);
    const wolfCircuitImg = loadSprite(SPRITES.wolfCircuit);
    const wolfEyesImg = loadSprite(SPRITES.wolfEyes);
    const wolfSunImg = loadSprite(SPRITES.wolfSun);
    const currentQueenImg = loadSprite(SPRITES.currentQueen);
    const currentAthensImg = loadSprite(SPRITES.currentAthens);
    const currentRoomImg = loadSprite(SPRITES.currentRoom);
    const currentBladeImg = loadSprite(SPRITES.currentBlade);
    const currentCouncilImg = loadSprite(SPRITES.currentCouncil);
    const sweetieCityImg = loadSprite(SPRITES.sweetieCity);
    const sweetieCatImg = loadSprite(SPRITES.sweetieCat);
    const sweetieOperatorImg = loadSprite(SPRITES.sweetieOperator);
    const sweetieWarpImg = loadSprite(SPRITES.sweetieWarp);
    const sweetieSkyImg = loadSprite(SPRITES.sweetieSky);
    const sweetieTardisImg = loadSprite(SPRITES.sweetieTardis);
    const haloQueenImg = loadSprite(SPRITES.haloQueen);
    const haloMoonImg = loadSprite(SPRITES.haloMoon);
    const haloWolvesImg = loadSprite(SPRITES.haloWolves);
    const haloRingImg = loadSprite(SPRITES.haloRing);
    const choirGodImg = loadSprite(SPRITES.choirGod);
    const choirDysonImg = loadSprite(SPRITES.choirDyson);
    const choirTeaImg = loadSprite(SPRITES.choirTea);
    const choirSunImg = loadSprite(SPRITES.choirSun);
    const choirClawsImg = loadSprite(SPRITES.choirClaws);
    const badendQueenImg = loadSprite(SPRITES.badendQueen);
    const badendSandsImg = loadSprite(SPRITES.badendSands);
    const badendSunImg = loadSprite(SPRITES.badendSun);
    const badendErrorImg = loadSprite(SPRITES.badendError);
    const badendBoxImg = loadSprite(SPRITES.badendBox);
    const recallRoseImg = loadSprite(SPRITES.recallRose);
    const recallTempleImg = loadSprite(SPRITES.recallTemple);
    const recallGlyphsImg = loadSprite(SPRITES.recallGlyphs);
    const recallSandsImg = loadSprite(SPRITES.recallSands);
    const obayBratImg = loadSprite(SPRITES.obayBrat);
    const obayPirateImg = loadSprite(SPRITES.obayPirate);
    const obayOperatorImg = loadSprite(SPRITES.obayOperator);
    const obayTwistImg = loadSprite(SPRITES.obayTwist);
    const copterLadyImg = loadSprite(SPRITES.copterLady);
    const copterCaptainImg = loadSprite(SPRITES.copterCaptain);
    const copterShipImg = loadSprite(SPRITES.copterShip);
    const copterMeetImg = loadSprite(SPRITES.copterMeet);
    const copterTreasureImg = loadSprite(SPRITES.copterTreasure);
    const stillhotRoseImg = loadSprite(SPRITES.stillhotRose);
    const stillhotLandImg = loadSprite(SPRITES.stillhotLand);
    const stillhotTeaImg = loadSprite(SPRITES.stillhotTea);
    let raf = 0;
    let last = performance.now();
    let tunnel = 0;
    let spin = 0;
    let sceneT = 0;

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
      sceneT += dt;
      const pulse = pulseRef.current;
      const look = lookRef.current;
      const kind = look.phenomenon || "vortex";
      const stage = kind === "prom" || kind === "twist" || kind === "remember" || kind === "firewall" || kind === "allocate" || kind === "wolf" || kind === "current" || kind === "sweetie" || kind === "halo" || kind === "choir" || kind === "badend" || kind === "recall" || kind === "obay" || kind === "copter";
      const chasing = kind === "vortex" || kind === "petals" || kind === "stillhot";
      const storm = kind === "vortex" || kind === "arrival";
      resizeList(starsRef.current, storm ? 0 : kind === "stillhot" ? Math.max(look.stars, 180) : look.stars, (i) => makeStars(1)[0] ?? { a: i, r: 0.4, z: Math.random(), len: 0.02 });
      resizeList(glyphsRef.current, kind === "void" || kind === "still-rite" || stage || storm ? 0 : look.glyphs, (i) => makeGlyphs(1)[0] ?? { a: i, r: 0.6, z: Math.random(), kind: i % 3 });
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      const live = playing && !document.hidden;
      const energy = pulse.energy * look.intensity;
      const fly = (live ? pulse.flying : 0.05) * look.fly * (kind === "void" ? 0.35 : kind === "still-rite" ? 0.4 : kind === "prom" || kind === "remember" ? 0.45 : kind === "firewall" ? 0.7 : kind === "twist" ? 1.05 : 1);
      const rush = chasing
        ? (live ? 1.35 + fly * 1.7 + pulse.kick * 0.85 : 0.72)
        : live ? 0.28 + fly * 1.15 : 0.08;
      const visEnergy = chasing ? Math.max(energy, live ? 0.55 : 0.42) : energy;
      const visKick = chasing ? Math.max(pulse.kick, live ? pulse.kick : 0.18) : pulse.kick;
      const chaseT = sceneT * (0.55 + rush * 0.32);
      const weave = 0.16 + energy * 0.05;
      const tardisX = Math.sin(chaseT * 0.93) * weave;
      const tardisY = Math.cos(chaseT * 0.71) * weave * 0.42;
      const tardisZ = 1.38 + (0.5 + 0.5 * Math.sin(chaseT * 0.33)) * 0.48 - (live ? pulse.kick * 0.14 : 0);
      const bank = Math.sin(chaseT * 0.93) * 0.34 + Math.cos(chaseT * 0.41) * 0.08;
      const cam = camRef.current;
      if (chasing) {
        cam.x = expFollow(cam.x, tardisX * (storm ? 0.22 : 0.64), live ? 2.7 : 1.35, dt);
        cam.y = expFollow(cam.y, tardisY * (storm ? 0.18 : 0.56), live ? 2.7 : 1.35, dt);
        cam.roll = expFollow(cam.roll, bank * (storm ? 0.04 : 0.16), 2.1, dt);
        cam.trauma = Math.min(1, cam.trauma + (live ? pulse.kick * (storm ? 0.12 : 0.48) : 0));
        cam.trauma = Math.max(0, cam.trauma - dt * 2.7);
      }
      const shake = cam.trauma * cam.trauma;
      const shakeX = chasing ? Math.sin(sceneT * 41) * shake * (storm ? 4 : 16) + Math.sin(sceneT * 17) * pulse.kick * (storm ? 1 : 4) : live ? Math.sin(pulse.time * 37) * pulse.kick * 7 : 0;
      const shakeY = chasing ? Math.cos(sceneT * 33) * shake * (storm ? 3 : 12) + Math.cos(sceneT * 13) * pulse.kick * (storm ? 0.8 : 3) : live ? Math.cos(pulse.time * 29) * pulse.kick * 5 : 0;
      const cx = w * 0.5 + (chasing ? cam.x * w * 0.4 + shakeX : 0);
      const cy = h * 0.48 + (chasing ? cam.y * h * 0.34 + shakeY : h * -0.06);
      const fov = Math.min(w, h) * (chasing ? 0.74 + pulse.kick * 0.05 : 0.55);
      tunnel += dt * (chasing ? rush * 1.72 : kind === "twist" ? 1.05 + fly * 1.9 + pulse.kick * 1.35 : 0.28 + fly * 1.15);
      spin += dt * (chasing ? 0.62 + rush * 0.55 + pulse.kick * 1.35 : (0.22 + pulse.kick * 1.6 + energy * 0.65) * (live ? 1 : 0.12) * (kind === "void" ? 0.4 : kind === "prom" || kind === "remember" ? 0.55 : kind === "twist" ? 1.45 : 1));

      if (storm || stage || chasing || kind === "aurora") {
        ctx.clearRect(0, 0, w, h);
      } else {
      ctx.fillStyle = kind === "void" || kind === "still-rite" ? "rgba(6, 2, 10, 0.28)" : "rgba(7, 3, 10, 0.22)";
      ctx.fillRect(0, 0, w, h);
      }

      if (chasing && !storm) {
        ctx.save();
        ctx.translate(w * 0.5, h * 0.5);
        ctx.rotate(cam.roll);
        ctx.translate(-w * 0.5, -h * 0.5);
      }

      const g = ctx.createRadialGradient(cx, cy, 8, cx, cy, Math.max(w, h) * 0.7);
      if (kind === "aurora") {
        g.addColorStop(0, `rgba(90, 220, 180, ${0.1 + energy * 0.16})`);
        g.addColorStop(0.45, `rgba(210, 57, 248, ${0.08 + pulse.downbeat * 0.14})`);
        g.addColorStop(1, "rgba(4, 10, 18, 0.2)");
      } else if (kind === "petals") {
        g.addColorStop(0, `rgba(255, 186, 210, ${0.1 + energy * 0.12})`);
        g.addColorStop(0.4, `rgba(110, 200, 212, ${0.06 + pulse.kick * 0.1})`);
        g.addColorStop(1, "rgba(7, 3, 10, 0.22)");
      } else if (kind === "prom") {
        g.addColorStop(0, `rgba(255, 214, 176, ${0.12 + energy * 0.14})`);
        g.addColorStop(0.4, `rgba(196, 92, 106, ${0.1 + pulse.downbeat * 0.12})`);
        g.addColorStop(1, "rgba(16, 7, 9, 0.22)");
      } else if (kind === "remember") {
        g.addColorStop(0, `rgba(255, 214, 150, ${0.14 + energy * 0.16})`);
        g.addColorStop(0.4, `rgba(196, 92, 106, ${0.1 + pulse.downbeat * 0.12})`);
        g.addColorStop(1, "rgba(24, 10, 6, 0.22)");
      } else if (kind === "recall") {
        g.addColorStop(0, `rgba(80, 210, 255, ${0.1 + energy * 0.14})`);
        g.addColorStop(0.45, `rgba(201, 163, 106, ${0.1 + pulse.kick * 0.1})`);
        g.addColorStop(1, "rgba(6, 10, 16, 0.2)");
      } else if (kind === "obay") {
        g.addColorStop(0, `rgba(255, 40, 90, ${0.14 + energy * 0.16})`);
        g.addColorStop(0.45, `rgba(255, 214, 80, ${0.08 + pulse.kick * 0.12})`);
        g.addColorStop(1, "rgba(10, 2, 6, 0.22)");
      } else if (kind === "copter") {
        g.addColorStop(0, `rgba(255, 140, 80, ${0.12 + energy * 0.14})`);
        g.addColorStop(0.45, `rgba(80, 210, 255, ${0.1 + pulse.kick * 0.1})`);
        g.addColorStop(1, "rgba(8, 18, 28, 0.2)");
      } else if (kind === "firewall") {
        g.addColorStop(0, `rgba(90, 230, 255, ${0.1 + energy * 0.14})`);
        g.addColorStop(0.4, `rgba(255, 80, 110, ${0.08 + pulse.kick * 0.12})`);
        g.addColorStop(1, "rgba(6, 10, 16, 0.22)");
      } else if (kind === "allocate") {
        g.addColorStop(0, `rgba(255, 80, 130, ${0.12 + energy * 0.14})`);
        g.addColorStop(0.4, `rgba(255, 186, 120, ${0.1 + pulse.downbeat * 0.12})`);
        g.addColorStop(1, "rgba(18, 8, 12, 0.22)");
      } else if (kind === "wolf") {
        g.addColorStop(0, `rgba(255, 40, 70, ${0.12 + energy * 0.16})`);
        g.addColorStop(0.45, `rgba(255, 255, 255, ${0.04 + pulse.kick * 0.08})`);
        g.addColorStop(1, "rgba(8, 2, 4, 0.24)");
      } else if (kind === "current") {
        g.addColorStop(0, `rgba(80, 230, 255, ${0.1 + energy * 0.14})`);
        g.addColorStop(0.4, `rgba(255, 40, 140, ${0.1 + pulse.kick * 0.14})`);
        g.addColorStop(1, "rgba(6, 4, 12, 0.22)");
      } else if (kind === "sweetie") {
        g.addColorStop(0, `rgba(255, 214, 120, ${0.12 + energy * 0.14})`);
        g.addColorStop(0.45, `rgba(80, 230, 255, ${0.08 + pulse.kick * 0.1})`);
        g.addColorStop(1, "rgba(12, 6, 8, 0.2)");
      } else if (kind === "halo") {
        g.addColorStop(0, `rgba(80, 210, 255, ${0.12 + energy * 0.16})`);
        g.addColorStop(0.45, `rgba(255, 255, 255, ${0.04 + pulse.kick * 0.08})`);
        g.addColorStop(1, "rgba(4, 8, 16, 0.22)");
      } else if (kind === "choir") {
        g.addColorStop(0, `rgba(255, 90, 40, ${0.12 + energy * 0.16})`);
        g.addColorStop(0.4, `rgba(255, 214, 120, ${0.08 + pulse.kick * 0.1})`);
        g.addColorStop(1, "rgba(12, 4, 4, 0.22)");
      } else if (kind === "badend") {
        g.addColorStop(0, `rgba(255, 40, 20, ${0.14 + energy * 0.16})`);
        g.addColorStop(0.45, `rgba(255, 180, 40, ${0.08 + pulse.kick * 0.12})`);
        g.addColorStop(1, "rgba(8, 2, 4, 0.24)");
      } else if (kind === "twist") {
        g.addColorStop(0, `rgba(255, 90, 180, ${0.12 + energy * 0.16})`);
        g.addColorStop(0.4, `rgba(110, 200, 212, ${0.1 + pulse.kick * 0.14})`);
        g.addColorStop(1, "rgba(12, 4, 18, 0.22)");
      } else {
        g.addColorStop(0, `rgba(255, 214, 150, ${0.16 + visEnergy * 0.2 + visKick * 0.14})`);
        g.addColorStop(0.28, `rgba(232, 140, 42, ${0.14 + visEnergy * 0.14})`);
        g.addColorStop(0.62, `rgba(70, 190, 220, ${0.12 + visEnergy * 0.14})`);
        g.addColorStop(1, "rgba(7, 3, 10, 0.22)");
      }
      if (!storm && !stage) {
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      }

      if (chasing && !storm) {
        drawVortexPlate(ctx, vortexImg, cx, cy, w, h, spin, visEnergy, 1.22, false);
        drawVortexPlate(ctx, vortexImg, cx, cy, w, h, spin * 1.4, visEnergy * 0.7, 0.7, true);
        drawVortexCore(ctx, cx, cy, w, h, visEnergy, visKick);
      }
      if (storm) {
        const flash = Math.max(0, visKick * 0.55);
        if (flash > 0.12) {
          const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, Math.min(w, h) * 0.28);
          glow.addColorStop(0, `rgba(220, 236, 255, ${0.08 + flash * 0.22})`);
          glow.addColorStop(0.4, `rgba(90, 160, 255, ${0.05 + flash * 0.12})`);
          glow.addColorStop(1, "rgba(7, 3, 10, 0)");
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, w, h);
        }
      }

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

      if (kind === "arrival") {
        drawArrival(ctx, w, h, pulse, allocateFairyImg, allocateShrimpImg, sweetieCatImg, allocateCleoImg, copterLadyImg, swordImg);
      }

      if (kind === "prom") {
        drawProm(ctx, w, h, pulse, energy, spin, gymImg, danceImg, streamerImg, ballImg, punchImg);
      }
      if (kind === "twist") {
        drawTwist(
          ctx,
          w,
          h,
          pulse,
          energy,
          spin,
          tunnel,
          twistHallImg,
          twistCoupleImg,
          twistLindyImg,
          twistStrutImg,
          twistPrawnImg,
          twistMoonImg,
          twistTangoImg,
          ballImg,
          twistSimImg,
          twistAgentImg,
          twistCodeImg,
          twistCubicleImg,
          twistRoseDeskImg,
          twistRoseStandImg,
          twistNameImg,
        );
      }
      if (kind === "remember") {
        drawRemember(ctx, w, h, pulse, energy, [rememberWideImg, rememberDoorsImg, rememberShrimpImg, rememberHallImg, rememberLandingImg]);
      }
      if (kind === "recall") {
        drawRecall(ctx, w, h, pulse, energy, spin, recallTempleImg, recallSandsImg, recallRoseImg, recallGlyphsImg);
      }
      if (kind === "obay") {
        drawObay(ctx, w, h, pulse, energy, obayBratImg, obayPirateImg, obayOperatorImg, obayTwistImg, badendErrorImg, badendSunImg);
      }
      if (kind === "copter") {
        drawCopter(ctx, w, h, pulse, energy, copterLadyImg, copterCaptainImg, copterShipImg, copterMeetImg, copterTreasureImg);
      }
      if (kind === "firewall") {
        drawFirewall(
          ctx,
          w,
          h,
          pulse,
          energy,
          spin,
          firewallRiverImg,
          firewallRoseImg,
          firewallBasiliskImg,
          firewallWolfImg,
          tardisChase,
          tardisRear,
        );
      }
      if (kind === "allocate") {
        drawAllocate(
          ctx,
          w,
          h,
          pulse,
          energy,
          allocateSandsImg,
          allocateRoseImg,
          allocateCorpImg,
          allocateShrimpImg,
          allocateQueenImg,
          allocateCopterImg,
          allocateAthensImg,
          allocateFairyImg,
          allocateCleoImg,
          allocateGlyphsImg,
        );
      }
      if (kind === "wolf") {
        drawWolf(ctx, w, h, pulse, energy, wolfPromImg, wolfAltarImg, wolfRoseImg, wolfCircuitImg, wolfEyesImg, wolfSunImg);
      }
      if (kind === "current") {
        drawCurrent(ctx, w, h, pulse, energy, currentAthensImg, currentRoomImg, currentQueenImg, currentBladeImg, currentCouncilImg);
      }
      if (kind === "sweetie") {
        drawSweetie(
          ctx,
          w,
          h,
          pulse,
          energy,
          sweetieCityImg,
          sweetieCatImg,
          sweetieOperatorImg,
          sweetieWarpImg,
          sweetieSkyImg,
          sweetieTardisImg,
        );
      }
      if (kind === "halo") {
        drawHalo(ctx, w, h, pulse, energy, currentRoomImg, haloQueenImg, haloMoonImg, haloWolvesImg, haloRingImg);
      }
      if (kind === "choir") {
        drawChoir(ctx, w, h, pulse, energy, choirGodImg, choirDysonImg, choirTeaImg, choirSunImg, choirClawsImg);
      }
      if (kind === "badend") {
        drawBadend(ctx, w, h, pulse, energy, badendQueenImg, badendSandsImg, badendSunImg, badendErrorImg, badendBoxImg, allocateShrimpImg);
      }
      if (stage) revealStormRim(ctx, w, h);

      if (!stage && kind !== "arrival") {
        for (const star of starsRef.current) {
          if (chasing || live) star.z -= dt * (chasing ? 0.95 + rush * 1.85 : 0.42 + fly * 2.1) * (0.4 + star.len * 10);
          if (star.z < 0) star.z += 1;
          const z = star.z * (chasing ? 4.6 : 3.4) + 0.08;
          const x = Math.cos(star.a + spin * 0.12) * star.r;
          const y = Math.sin(star.a + spin * 0.12) * star.r * 0.62;
          const p = project(x, y, z, cx, cy, fov);
          const streak = star.len * (chasing ? 18 + rush * 36 : 8);
          const p2 = project(x, y, z + streak, cx, cy, fov);
          ctx.strokeStyle = chasing
            ? `rgba(255, 228, 186, ${0.12 + (1 - star.z) * 0.78})`
            : `rgba(243, 237, 230, ${0.12 + (1 - star.z) * 0.55})`;
          ctx.lineWidth = chasing ? 0.8 + (1 - star.z) * 2.4 : 1.1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      const drawRings = kind === "glyphs" || kind === "stillhot";
      const rings = drawRings ? (kind === "stillhot" ? Math.max(look.rings, 32) : look.rings) : 0;
      if (kind === "stillhot") {
        drawChaseHelix(ctx, cx, cy, fov, tunnel, spin, visEnergy, visKick, 0.3, 1);
        drawTunnelRings(ctx, cx, cy, fov, tunnel, spin, visEnergy, visKick, rings, 0.3, 1);
      } else if (!storm) {
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

      if (look.bolts && kind !== "void" && kind !== "still-rite" && !stage && pulse.downbeat > 0.2 && live) {
        bolt(ctx, cx, cy, cx - w * 0.38, cy - h * 0.2, pulse.beatIndex + 0.2, pulse.downbeat * 0.85);
        bolt(ctx, cx, cy, cx + w * 0.34, cy + h * 0.18, pulse.beatIndex + 1.1, pulse.downbeat * 0.7);
      }

      if (!stage && !chasing) {
        drawBloom(ctx, roseImg, w, h, pulse, energy);
      }

      if (!stage && !chasing && ready(antlerImg)) {
        const aw = Math.min(w * 0.92, 720);
        const ah = aw * (antlerImg.naturalHeight / antlerImg.naturalWidth);
        featherPortrait(ctx, antlerImg, cx, -ah * 0.28 + pulse.kick * 4 + ah / 2, aw, ah, 0.18 + energy * 0.1 + pulse.downbeat * 0.08, "screen");
      }

      if (!stage && !chasing && ready(swordImg)) {
        const sh = h * 1.05;
        const sw = sh * (swordImg.naturalWidth / swordImg.naturalHeight);
        const bob = Math.sin(pulse.time * 0.7) * 6 + pulse.kick * 8;
        featherPortrait(ctx, swordImg, sw * 0.12, h - sh * 0.3 + bob, sw, sh, 0.72 + energy * 0.18);
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        featherPortrait(ctx, swordImg, sw * 0.12, h - sh * 0.3 - bob * 0.6, sw, sh, 0.72 + energy * 0.18);
        ctx.restore();
      }

      if (!stage && !chasing) {
        drawDeerfox(ctx, deerImg, w, h, pulse, energy, false);
      }

      if (chasing) {
        const stream = streamRef.current;
        const cap = kind === "petals" ? 14 : 10;
        if (stream.length < cap) {
          for (let i = stream.length; i < cap; i++) stream.push(spawnStream());
        }
        const streamSpeed = 1.35 + rush * 2.1;
        for (const petal of stream) {
          petal.z -= dt * streamSpeed;
          petal.a += dt * (0.28 + petal.seed * 0.03);
          petal.rot += petal.spin * dt;
          petal.pitch += dt * (0.9 + energy * 0.4);
          if (petal.z < 0.45) {
            const fresh = spawnStream();
            petal.a = fresh.a;
            petal.r = fresh.r;
            petal.z = 4.2 + Math.random() * 1.4;
            petal.size = fresh.size;
            petal.variant = fresh.variant;
            petal.spin = fresh.spin;
            petal.pitch = fresh.pitch;
            petal.rot = fresh.rot;
          }
        }
        for (const petal of stream) {
          if (petal.z > tardisZ) drawStreamPetal(ctx, petal, cx, cy, fov, petalFace, petalEdge, visEnergy);
        }
        drawDeerfoxGhost(ctx, deerImg, cx, cy, fov, sceneT, visEnergy, w, h);
        if (look.box) {
          if (!storm) drawTardisWake(ctx, tardisX, tardisY, tardisZ, cx, cy, fov, visEnergy, visKick);
          const tardis = project(tardisX, tardisY, tardisZ, cx, cy, fov);
          const hgt = Math.min(w, h) * (0.145 / Math.max(0.95, tardisZ));
          const lamp = Math.min(1, visKick * 0.85 + pulse.downbeat + 0.38);
          drawTardisCraft(ctx, tardisChase, tardisRear, tardis.x, tardis.y, hgt, lamp, bank);
        }
        for (const petal of stream) {
          if (petal.z <= tardisZ) drawStreamPetal(ctx, petal, cx, cy, fov, petalFace, petalEdge, visEnergy);
        }
        if (kind === "stillhot") {
          drawChaseHelix(ctx, cx, cy, fov, tunnel, spin, visEnergy, visKick, 0, 0.3);
          drawTunnelRings(ctx, cx, cy, fov, tunnel, spin, visEnergy, visKick, rings, 0, 0.3);
        }
      }

      if (stage) {
        const papers = paperRef.current;
        const palette = kind === "twist" ? TWIST_PAPER : kind === "remember" ? REMEMBER_PAPER : kind === "recall" ? RECALL_PAPER : kind === "obay" ? OBAY_PAPER : kind === "copter" ? COPTER_PAPER : kind === "firewall" ? FIREWALL_PAPER : kind === "allocate" ? ALLOCATE_PAPER : kind === "wolf" ? WOLF_PAPER : kind === "current" ? CURRENT_PAPER : kind === "sweetie" ? SWEETIE_PAPER : kind === "halo" ? HALO_PAPER : kind === "choir" ? CHOIR_PAPER : kind === "badend" ? BADEND_PAPER : PROM_PAPER;
        const beat = pulse.beatIndex;
        if (live && pulse.snare > 0.42 && beat !== lastPaperRef.current && papers.length < 48) {
          lastPaperRef.current = beat;
          const n = 7 + Math.floor(pulse.snare * 6);
          for (let i = 0; i < n; i++) {
            papers.push({
              x: 0.18 + Math.random() * 0.64,
              y: -0.04 - Math.random() * 0.08,
              vx: (Math.random() - 0.5) * 0.12,
              vy: 0.08 + Math.random() * 0.12,
              rot: Math.random() * Math.PI * 2,
              spin: (Math.random() - 0.5) * 4,
              w: 4 + Math.random() * 7,
              h: 2 + Math.random() * 4,
              color: palette[i % palette.length]!,
              life: 0,
              max: 3.2 + Math.random() * 2.4,
            });
          }
        }
        for (let i = papers.length - 1; i >= 0; i--) {
          const bit = papers[i];
          if (!bit) continue;
          if (live) {
            bit.life += dt;
            bit.x += bit.vx * dt;
            bit.y += bit.vy * dt;
            bit.vy += dt * 0.08;
            bit.rot += bit.spin * dt;
          }
          const fade = Math.min(1, bit.life * 2) * Math.min(1, (bit.max - bit.life) / 0.8);
          if (bit.life > bit.max || bit.y > 1.1) {
            papers.splice(i, 1);
            continue;
          }
          ctx.save();
          ctx.translate(bit.x * w, bit.y * h);
          ctx.rotate(bit.rot);
          ctx.globalAlpha = 0.25 + fade * 0.7;
          ctx.fillStyle = bit.color;
          ctx.fillRect(-bit.w / 2, -bit.h / 2, bit.w, bit.h);
          ctx.restore();
        }
      }

      if (chasing && !storm) ctx.restore();

      if (kind === "stillhot") {
        drawStillhot(ctx, w, h, pulse, energy, stillhotLandImg, stillhotTeaImg, stillhotRoseImg);
      }

      if (kind !== "void" && kind !== "remember" && kind !== "recall" && kind !== "obay" && kind !== "copter" && kind !== "stillhot" && kind !== "firewall" && kind !== "allocate" && kind !== "wolf" && kind !== "current" && kind !== "sweetie" && kind !== "halo" && kind !== "choir" && kind !== "badend") {
        drawRoseFields(ctx, fieldImg, hedgeImg, bloomImg, w, h, pulse, energy, chasing);
      }

      const vg = ctx.createRadialGradient(cx, stage ? h * 0.56 : cy, Math.min(w, h) * 0.18, cx, stage ? h * 0.56 : cy, Math.max(w, h) * 0.72);
      if (kind === "prom") {
        vg.addColorStop(0, "rgba(16, 7, 9, 0)");
        vg.addColorStop(1, "rgba(8, 3, 5, 0.78)");
      } else if (kind === "remember") {
        vg.addColorStop(0, "rgba(24, 10, 6, 0)");
        vg.addColorStop(1, "rgba(12, 5, 4, 0.7)");
      } else if (kind === "recall") {
        vg.addColorStop(0, "rgba(6, 10, 16, 0)");
        vg.addColorStop(1, "rgba(4, 6, 12, 0.74)");
      } else if (kind === "obay") {
        vg.addColorStop(0, "rgba(10, 2, 6, 0)");
        vg.addColorStop(1, "rgba(6, 0, 3, 0.78)");
      } else if (kind === "copter") {
        vg.addColorStop(0, "rgba(8, 18, 28, 0)");
        vg.addColorStop(1, "rgba(4, 10, 16, 0.72)");
      } else if (kind === "stillhot") {
        vg.addColorStop(0, "rgba(12, 4, 6, 0)");
        vg.addColorStop(1, "rgba(40, 8, 6, 0.62)");
      } else if (kind === "firewall") {
        vg.addColorStop(0, "rgba(6, 10, 16, 0)");
        vg.addColorStop(1, "rgba(4, 8, 12, 0.7)");
      } else if (kind === "allocate") {
        vg.addColorStop(0, "rgba(18, 8, 12, 0)");
        vg.addColorStop(1, "rgba(10, 4, 8, 0.72)");
      } else if (kind === "wolf") {
        vg.addColorStop(0, "rgba(8, 2, 4, 0)");
        vg.addColorStop(1, "rgba(4, 0, 2, 0.78)");
      } else if (kind === "current") {
        vg.addColorStop(0, "rgba(6, 4, 12, 0)");
        vg.addColorStop(1, "rgba(4, 2, 8, 0.74)");
      } else if (kind === "sweetie") {
        vg.addColorStop(0, "rgba(12, 6, 8, 0)");
        vg.addColorStop(1, "rgba(8, 4, 6, 0.7)");
      } else if (kind === "halo") {
        vg.addColorStop(0, "rgba(4, 8, 16, 0)");
        vg.addColorStop(1, "rgba(2, 6, 12, 0.76)");
      } else if (kind === "choir") {
        vg.addColorStop(0, "rgba(12, 4, 4, 0)");
        vg.addColorStop(1, "rgba(8, 2, 2, 0.74)");
      } else if (kind === "badend") {
        vg.addColorStop(0, "rgba(10, 2, 4, 0)");
        vg.addColorStop(1, "rgba(6, 0, 2, 0.78)");
      } else if (kind === "twist") {
        vg.addColorStop(0, "rgba(12, 4, 18, 0)");
        vg.addColorStop(1, "rgba(8, 2, 12, 0.74)");
      } else {
        vg.addColorStop(0, "rgba(7, 3, 10, 0)");
        vg.addColorStop(1, chasing ? "rgba(7, 3, 10, 0.52)" : "rgba(7, 3, 10, 0.72)");
      }
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      if (stage) petalsRef.current.length = 0;
      if (look.petals && !stage && kind !== "void" && kind !== "still-rite") {
        const petals = petalsRef.current;
        const beat = pulse.beatIndex;
        const cap = kind === "petals" ? 7 : chasing ? 4 : 5;
        if (live || chasing) {
          gustRef.current.x += (Math.sin(sceneT * 0.4) * 0.03 + (pulse.kick - 0.2) * 0.18 - gustRef.current.x) * Math.min(1, dt * 4);
          gustRef.current.y += ((pulse.downbeat - 0.15) * -0.14 - gustRef.current.y) * Math.min(1, dt * 3.2);
          const since = now - lastSpawnRef.current;
          const sparse = petals.length === 0 ? since > 700 : since > (kind === "petals" ? 1600 : 2400) + (beat % 5) * 500;
          const onKick = beat !== lastBeatRef.current && pulse.downbeat > 0.62 && Math.random() < 0.28;
          const onPhrase = pulse.snare > 0.55 && pulse.phrasePhase > 0.88 && Math.random() < 0.4;
          if (petals.length < cap && (sparse || onKick || onPhrase)) {
            lastSpawnRef.current = now;
            lastBeatRef.current = beat;
            petals.push(spawnAirPetal());
          }
        }
        const wind = {
          t: chasing ? sceneT : pulse.time,
          cx: 0.5,
          cy: 0.42,
          energy,
          kick: pulse.kick,
          fly: look.fly,
          gustX: gustRef.current.x,
          gustY: gustRef.current.y,
        };
        for (let i = petals.length - 1; i >= 0; i--) {
          const petal = petals[i];
          if (!petal) continue;
          if ((live || chasing) && !stepAirPetal(petal, dt, wind)) {
            petals.splice(i, 1);
            continue;
          }
          if (!live && !chasing && (petal.life > petal.max || petal.y > 1.15)) {
            petals.splice(i, 1);
            continue;
          }
          drawPetalSprite(ctx, petal, w, h, petalFace, petalEdge, pulse);
        }
      }

      const sparkles = sparklesRef.current;
      const sparkCap = 22;
      if (live || chasing) {
        const want = pulse.snare > 0.5 && sparkles.length < sparkCap && Math.random() < 0.45;
        const idle = sparkles.length < 8 && Math.random() < 0.04;
        if (want || idle) sparkles.push(spawnSparkle());
      }
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const mote = sparkles[i];
        if (!mote) continue;
        mote.life += dt;
        mote.x += mote.vx * dt * 8;
        mote.y += mote.vy * dt * 8;
        if (mote.life > mote.max || mote.y < -0.04) {
          sparkles.splice(i, 1);
          continue;
        }
        drawSparkle(ctx, mote, w, h);
      }

      const bar = Math.floor(pulse.beatIndex / 4);
      if (!stage && live && pulse.downbeat > 0.45 && bar % 16 === 7) {
        glareRef.current = Math.max(glareRef.current, 0.92);
      }
      glareRef.current *= Math.pow(0.04, dt);
      const glare = glareRef.current;
      if (!stage && glare > 0.04) {
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
  }, [lookRef, playing, pulseRef, reduce, 8]);

  if (reduce) return null;
  return <canvas ref={canvasRef} className="rose-opera-canvas" aria-hidden />;
}
