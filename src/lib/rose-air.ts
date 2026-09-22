export type AirPetal = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
  pitch: number;
  pitchVel: number;
  face: number;
  size: number;
  life: number;
  max: number;
  seed: number;
  variant: 0 | 1;
  edgeLatch: boolean;
  z: number;
};

export type AirWind = {
  t: number;
  cx: number;
  cy: number;
  energy: number;
  kick: number;
  fly: number;
  gustX: number;
  gustY: number;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function spawnAirPetal(rand = Math.random): AirPetal {
  const fromSide = rand() < 0.28;
  const pitch = rand() * Math.PI * 2;
  return {
    x: fromSide ? (rand() < 0.5 ? -0.08 : 1.08) : 0.12 + rand() * 0.76,
    y: fromSide ? 0.08 + rand() * 0.22 : -0.06 + rand() * 0.05,
    vx: (fromSide ? (rand() < 0.5 ? 0.06 : -0.06) : 0) + (rand() - 0.5) * 0.04,
    vy: 0.028 + rand() * 0.02,
    rot: rand() * Math.PI * 2,
    spin: (rand() - 0.5) * 0.9,
    pitch,
    pitchVel: (rand() - 0.5) * 0.8,
    face: Math.abs(Math.cos(pitch)),
    size: 20 + rand() * 16 + (rand() < 0.12 ? 8 : 0),
    life: 0,
    max: 9 + rand() * 6,
    seed: rand() * Math.PI * 2,
    variant: rand() < 0.38 ? 1 : 0,
    edgeLatch: false,
    z: 0.35 + rand() * 0.55,
  };
}

export function stepAirPetal(petal: AirPetal, dt: number, wind: AirWind): boolean {
  const h = Math.min(0.05, Math.max(0, dt));
  if (h <= 0) return true;
  petal.life += h;
  const facing = Math.abs(Math.cos(petal.pitch));
  const edge = 1 - facing;
  const mass = 0.7 + petal.size / 80;
  const drag = 1.05 + facing * 0.9;
  const flutter = Math.sin(wind.t * (1.15 + petal.seed * 0.2) + petal.seed) * (0.28 + edge * 0.55);
  const breeze = Math.sin(wind.t * 0.31 + petal.seed) * 0.03 + Math.sin(wind.t * 0.73 + petal.x * 4) * 0.014;
  const lift = (0.01 + facing * 0.018) * (0.55 + wind.energy * 0.35);

  let ax = (breeze + wind.gustX * 0.28 + flutter * 0.022) / mass;
  let ay = 0.055 - lift + wind.gustY * 0.22;

  const dx = petal.x - wind.cx;
  const dy = petal.y - wind.cy;
  const r = Math.hypot(dx, dy);
  if (r > 0.12 && r < 0.55) {
    const swirl = ((1 - r / 0.55) * (0.018 + wind.fly * 0.016 + wind.energy * 0.012)) / mass;
    ax += (-dy / r) * swirl;
    ay += (dx / r) * swirl * 0.45;
  }

  petal.vx += ax * h;
  petal.vy += ay * h;
  petal.vx *= Math.max(0, 1 - drag * h * 0.7);
  petal.vy *= Math.max(0, 1 - (0.45 + facing * 0.25) * h);
  petal.vx = clamp(petal.vx, -0.12, 0.12);
  petal.vy = clamp(petal.vy, 0.01, 0.12);
  if (petal.life > 1.8) petal.vy = Math.max(petal.vy, 0.028);

  petal.x += petal.vx * h;
  petal.y += petal.vy * h;

  const tumble = (0.85 + edge * 1.35 + wind.energy * 0.35) * Math.sin(petal.pitch * 2 + wind.t * 0.7 + petal.seed);
  petal.pitchVel += tumble * h + flutter * 0.7 * h + wind.kick * h * 1.8 * (petal.seed - 1);
  petal.pitchVel *= Math.max(0, 1 - 1.6 * h);
  petal.pitchVel = clamp(petal.pitchVel, -3.1, 3.1);
  petal.pitch += petal.pitchVel * h;
  petal.spin += (flutter - petal.spin) * h * 1.6;
  petal.spin = clamp(petal.spin, -1.6, 1.6);
  petal.rot += petal.spin * h * (0.55 + Math.abs(petal.pitchVel) * 0.12);
  petal.face += (facing - petal.face) * Math.min(1, h * 7);
  if (petal.face < 0.32) petal.edgeLatch = true;
  else if (petal.face > 0.62) petal.edgeLatch = false;

  if (petal.life > petal.max || petal.y > 1.18 || petal.x < -0.2 || petal.x > 1.2) return false;
  return true;
}

export function petalFade(petal: AirPetal): number {
  return Math.min(1, petal.life * 1.4) * Math.min(1, (petal.max - petal.life) / 1.8);
}

export function petalFacing(petal: AirPetal): number {
  return clamp(petal.face, 0, 1);
}
