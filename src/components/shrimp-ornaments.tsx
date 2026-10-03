/** Margin decoration only. It never takes clicks. */

const HANDS = [
  "hand-a",
  "hand-b",
  "hand-c",
  "hand-d",
  "hand-e",
  "hand-f",
  "hand-g",
  "hand-h",
] as const;

function TinyHand({ className }: { className: string }) {
  return (
    <svg className={`shrimp-hand ${className}`} viewBox="0 0 32 32">
      <path d="M15.5 28c-4.2 0-7.2-3-7.2-7.1v-5.6c0-1.1.9-1.9 2-1.9 1 0 1.7.6 1.9 1.5V9.2c0-1.1.9-2 2-2s2 .9 2 2V7c0-1.2 1-2.1 2.2-2.1s2.1.9 2.1 2.1v2.1c0-1 .8-1.8 1.9-1.8 1.1 0 2 .8 2 1.9v3c.7-.4 1.6-.3 2.2.4.7.8.6 2-.2 2.7L21 22.2c-1.1 2.8-3.2 5.8-5.5 5.8z" />
    </svg>
  );
}

export function ShrimpOrnaments() {
  return (
    <div className="shrimp-ornaments" aria-hidden>
      <span className="shrimp-dial" />
      <span className="shrimp-bubble bubble-a" />
      <span className="shrimp-bubble bubble-b" />
      <span className="shrimp-bubble bubble-c" />
      <span className="shrimp-bubble bubble-d" />
      {HANDS.map((name) => (
        <TinyHand key={name} className={name} />
      ))}
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
