import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({ meta: [{ title: "About · Radio" }] }),
});

function About() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-44">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Frequency</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">About</h1>
      <p className="mt-4 text-muted">
        Radio is a clockwork temple on the Terrainfinity network. Live stations share a clock. On-demand vaults let you pick a cut.
        Fixed rooms play start to finish — an album, a rite, a linear desk.
      </p>
      <p className="mt-4 text-muted">C accounts sign in through the hub. Google lives there. This radio only consumes the session.</p>
    </div>
  );
}
