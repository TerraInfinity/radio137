import { AutoplayLamp } from "@/components/autoplay-lamp";
import { usePlayerStore } from "@/lib/player-store";

export function EnterGate() {
  const enterGate = usePlayerStore((s) => s.enterGate);
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-bg/95 px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">Frequency</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">Radio</h1>
        <p className="mt-4 text-muted">
          The green lamp is on. Default begins the clock. After this visit, this tab resumes wherever you left the dial.
          Dim the lamp if you want silence on arrival.
        </p>
        <div className="mt-6 flex justify-center">
          <AutoplayLamp label="Autoplay on" />
        </div>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => enterGate()}
            className="inline-flex h-12 min-w-44 items-center justify-center rounded-md bg-fg px-6 font-mono text-[12px] uppercase tracking-[0.16em] text-bg"
          >
            Tune in
          </button>
        </div>
      </div>
    </div>
  );
}
