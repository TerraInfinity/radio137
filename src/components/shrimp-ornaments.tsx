/** Margin decoration only. It never takes clicks. */

export function ShrimpOrnaments() {
  return (
    <div className="shrimp-ornaments" aria-hidden>
      <svg className="shrimp-curl" viewBox="0 0 80 80">
        <path d="M8 62c8-28 28-46 54-42" />
        <path d="M14 58c6-8 10-10 16-8" />
      </svg>
      <span className="shrimp-speck speck-a" />
      <span className="shrimp-speck speck-b" />
      <span className="shrimp-speck speck-c" />
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
