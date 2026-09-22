import { AutoplayLamp } from "@/components/autoplay-lamp";
import { ListenModeLamp } from "@/components/listen-mode-lamp";
import { listenModeHint } from "@/lib/listen-mode";
import { usePlayerStore } from "@/lib/player-store";

export function EnterGate() {
  const enterGate = usePlayerStore((s) => s.enterGate);
  const listenMode = usePlayerStore((s) => s.listenModeSession ?? s.listenMode);
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-bg/95 px-5">
      <div className="filigree-frame w-full max-w-md rounded-xl bg-bg-elevated/80 px-6 py-8 shadow-[var(--shadow-filigree)]">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">Frequency</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">Radio</h1>
        <p className="mt-4 text-pretty text-muted">
          Tune in to open the default station. Shared station and song links skip this page and start on their own.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-1">
          <ListenModeLamp />
          <AutoplayLamp label="Keep playing" />
        </div>
        <p className="mt-3 text-center text-sm text-muted">{listenModeHint(listenMode)}</p>
        <div className="mt-7">
          <button
            type="button"
            onClick={() => enterGate()}
            className="inline-flex h-12 w-full items-center justify-center rounded-md bg-fg px-6 font-mono text-[12px] uppercase tracking-[0.16em] text-bg"
          >
            Tune in
          </button>
        </div>
      </div>
    </div>
  );
}
