import { usePlayerStore } from "@/lib/player-store";

export function EnterGate() {
  const gateOpen = usePlayerStore((s) => s.gateOpen);
  const enterGate = usePlayerStore((s) => s.enterGate);
  const catalog = usePlayerStore((s) => s.catalog);
  if (!gateOpen) return null;

  const intro =
    catalog.channels.find((channel) => channel.slug === catalog.defaultSlug)?.name ?? "Default";

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-bg/88 px-4 pb-16 pt-24 backdrop-blur-[3px] sm:items-center sm:pb-0">
      <div className="filigree-frame relative w-full max-w-md rounded-xl bg-bg-elevated p-6 shadow-[var(--shadow-filigree)] sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">Frequency</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">Radio</h1>
        <p className="mt-3 text-sm text-muted">
          The green lamp is on. {intro} begins the clock. After this visit, this tab resumes wherever
          you left the dial. Uncheck the lamp if you want silence on arrival.
        </p>
        <button
          type="button"
          onClick={() => enterGate()}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-3 rounded-md bg-fg font-mono text-[12px] uppercase tracking-[0.18em] text-bg"
        >
          <span className="lamp-bezel">
            <span className="lamp lamp-live" />
          </span>
          Tune in
        </button>
      </div>
    </div>
  );
}
