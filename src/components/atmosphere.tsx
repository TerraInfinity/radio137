function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r };
}

function arcPath(cx: number, cy: number, r: number, start: number, sweep: number) {
  const a = polar(cx, cy, r, start);
  const b = polar(cx, cy, r, start + sweep);
  const large = Math.abs(sweep) > 180 ? 1 : 0;
  const sweepFlag = sweep >= 0 ? 1 : 0;
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${large} ${sweepFlag} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

function gearPath(teeth: number, outer = 94, inner = 78, hole = 16) {
  const step = (Math.PI * 2) / teeth;
  const tooth = step * 0.3;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2;
    const corners = [
      [inner, a - tooth],
      [outer, a - tooth * 0.36],
      [outer, a + tooth * 0.36],
      [inner, a + tooth],
    ] as const;
    for (const [r, ang] of corners) {
      const x = (100 + Math.cos(ang) * r).toFixed(2);
      const y = (100 + Math.sin(ang) * r).toFixed(2);
      pts.push(`${pts.length === 0 ? "M" : "L"}${x} ${y}`);
    }
  }
  const holePts: string[] = [];
  for (let i = 0; i <= 28; i++) {
    const ang = (i / 28) * Math.PI * 2 + Math.PI / 2;
    holePts.push(`${(100 + Math.cos(ang) * hole).toFixed(2)} ${(100 + Math.sin(ang) * hole).toFixed(2)}`);
  }
  return `${pts.join(" ")} Z M ${holePts.join(" L ")} Z`;
}

function Gear({
  teeth,
  spokes = 6,
  className,
  brass = true,
}: {
  teeth: number;
  spokes?: number;
  className?: string;
  brass?: boolean;
}) {
  const stroke = brass ? "var(--color-gold)" : "var(--color-cyan)";
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <path d={gearPath(teeth)} fill={brass ? "#c9a36a14" : "#6ec8d412"} fillRule="evenodd" stroke={stroke} strokeOpacity="0.42" strokeWidth="1.4" />
      <circle cx="100" cy="100" r="54" fill="none" stroke={stroke} strokeOpacity="0.22" strokeWidth="6" />
      <circle cx="100" cy="100" r="38" fill="none" stroke={stroke} strokeOpacity="0.3" strokeWidth="1.2" />
      {Array.from({ length: spokes }, (_, i) => {
        const a = polar(100, 100, 16, (i * 360) / spokes);
        const b = polar(100, 100, 54, (i * 360) / spokes);
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeOpacity="0.28" strokeWidth="1.4" />;
      })}
      <circle cx="100" cy="100" r="10" fill={brass ? "#c9a36a33" : "#6ec8d429"} stroke={stroke} strokeOpacity="0.55" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="3.2" fill={stroke} fillOpacity="0.7" />
    </svg>
  );
}

function GallifreyDisc({ seed, accent = "cyan" }: { seed: number; accent?: "cyan" | "gold" | "ember" }) {
  const rand = rng(seed);
  const color = accent === "gold" ? "var(--color-gold)" : accent === "ember" ? "var(--color-ember)" : "var(--color-cyan)";
  const brass = "var(--color-gold)";
  const letters = Array.from({ length: 7 + Math.floor(rand() * 4) }, (_, i) => {
    const ang = (i * 360) / 10 + rand() * 28;
    const r = 78 + rand() * 8;
    const size = 7 + rand() * 11;
    const onRing = rand() > 0.35;
    return { ang, r: onRing ? 86 : r, size, dots: 1 + Math.floor(rand() * 3), stem: rand() > 0.4, nest: rand() > 0.7 };
  });
  const innerArcs = Array.from({ length: 8 }, () => ({
    r: 28 + rand() * 46,
    start: rand() * 360,
    sweep: 28 + rand() * 92,
    width: 1 + rand() * 2.2,
  }));
  const chords = Array.from({ length: 5 }, () => {
    const a = rand() * 360;
    const b = a + 40 + rand() * 110;
    const r = 34 + rand() * 40;
    return { a, b, r };
  });

  return (
    <svg viewBox="0 0 200 200" className="gallifrey-disc" aria-hidden>
      <circle cx="100" cy="100" r="96" fill="none" stroke={brass} strokeOpacity="0.2" strokeWidth="1.1" strokeDasharray="18 7 4 9" />
      <circle cx="100" cy="100" r="88" fill="#6ec8d408" stroke={color} strokeOpacity="0.55" strokeWidth="2.2" />
      <circle cx="100" cy="100" r="88" fill="none" stroke={brass} strokeOpacity="0.18" strokeWidth="6" />
      {innerArcs.map((arc, i) => (
        <path
          key={`arc-${i}`}
          d={arcPath(100, 100, arc.r, arc.start, arc.sweep)}
          fill="none"
          stroke={i % 3 === 0 ? brass : color}
          strokeOpacity={0.28 + (i % 4) * 0.08}
          strokeWidth={arc.width}
          strokeLinecap="round"
        />
      ))}
      {chords.map((c, i) => {
        const p = polar(100, 100, c.r, c.a);
        const q = polar(100, 100, c.r, c.b);
        return <line key={`ch-${i}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={color} strokeOpacity="0.22" strokeWidth="0.8" />;
      })}
      {letters.map((letter, i) => {
        const p = polar(100, 100, letter.r, letter.ang);
        const outer = polar(100, 100, 96, letter.ang);
        const inner = polar(100, 100, 18 + (i % 3) * 8, letter.ang + 8);
        return (
          <g key={`let-${i}`}>
            <circle cx={p.x} cy={p.y} r={letter.size} fill="#070605cc" stroke={i % 2 ? color : brass} strokeOpacity="0.7" strokeWidth="1.3" />
            {letter.nest ? <circle cx={p.x} cy={p.y} r={letter.size * 0.45} fill="none" stroke={brass} strokeOpacity="0.55" strokeWidth="1" /> : null}
            {Array.from({ length: letter.dots }, (_, d) => {
              const dp = polar(p.x, p.y, letter.size * 0.62, letter.ang + d * 50);
              return <circle key={d} cx={dp.x} cy={dp.y} r={1.1 + (d % 2) * 0.5} fill={d % 2 ? color : brass} fillOpacity="0.85" />;
            })}
            {letter.stem ? (
              <line x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke={i % 2 ? color : brass} strokeOpacity="0.4" strokeWidth="1" />
            ) : null}
          </g>
        );
      })}
      <circle cx="100" cy="100" r="22" fill="none" stroke={color} strokeOpacity="0.45" strokeWidth="1.4" />
      <circle cx="100" cy="100" r="14" fill="none" stroke={brass} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 5" />
      <circle cx="100" cy="100" r="4" fill={color} fillOpacity="0.55" />
    </svg>
  );
}

const STARS = (() => {
  const rand = rng(137);
  return Array.from({ length: 72 }, (_, i) => ({
    x: rand() * 1600,
    y: rand() * 900,
    r: i % 11 === 0 ? 2.4 : i % 5 === 0 ? 1.5 : 0.7 + rand() * 0.7,
    delay: rand() * 6,
    dur: 3.2 + rand() * 4.8,
    tone: i % 7 === 0 ? "gold" : i % 5 === 0 ? "cyan" : "paper",
  }));
})();

const MOTES = (() => {
  const rand = rng(42);
  return Array.from({ length: 18 }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    s: 2 + rand() * 4,
    delay: rand() * 10,
    dur: 14 + rand() * 16,
    tone: rand() > 0.55 ? "gold" : rand() > 0.4 ? "cyan" : "ember",
  }));
})();

export function Atmosphere({ skin = "none" }: { skin?: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="atmosphere-void" />
      <svg className="star-field" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        {STARS.map((star, i) => (
          <circle
            key={i}
            className="cw-star"
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill={star.tone === "gold" ? "var(--color-gold)" : star.tone === "cyan" ? "var(--color-cyan)" : "var(--color-fg)"}
            style={{ animationDelay: `${star.delay}s`, animationDuration: `${star.dur}s` }}
          />
        ))}
      </svg>
      {MOTES.map((mote, i) => (
        <span
          key={i}
          className={`cw-mote cw-mote-${mote.tone}`}
          style={{
            left: `${mote.x}%`,
            top: `${mote.y}%`,
            width: mote.s,
            height: mote.s,
            animationDelay: `${mote.delay}s`,
            animationDuration: `${mote.dur}s`,
          }}
        />
      ))}
      <div className="atmosphere-clockwork">
        <div className="cw-place cw-place-a cw-wobble">
          <div className="cw-spin-slow">
            <GallifreyDisc seed={7} accent="cyan" />
          </div>
          <div className="cw-rotor cw-spin-hand">
            <span />
          </div>
        </div>
        <div className="cw-place cw-place-b cw-wobble-rev">
          <div className="cw-spin-rev">
            <GallifreyDisc seed={19} accent="gold" />
          </div>
        </div>
        <div className="cw-place cw-place-c">
          <div className="cw-spin">
            <GallifreyDisc seed={31} accent="ember" />
          </div>
        </div>
        <Gear teeth={18} className="cw-gear cw-gear-a cw-spin" />
        <Gear teeth={14} className="cw-gear cw-gear-b cw-spin-rev" brass={false} />
        <Gear teeth={10} spokes={4} className="cw-gear cw-gear-c cw-spin-fast" />
        <Gear teeth={8} spokes={4} className="cw-gear cw-gear-d cw-spin-rev" brass={false} />
      </div>
      <div className="atmosphere-sand" />
      {skin === "glaum" ? (
        <>
          <div className="atmosphere-glaum" />
          <div className="atmosphere-glaum-spark" />
          <div className="atmosphere-glaum-shrimp" />
        </>
      ) : null}
      {skin === "waheguru" ? <div className="atmosphere-wahe" /> : null}
      <div className="atmosphere-vignette" />
    </div>
  );
}
