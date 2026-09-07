import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/experiences")({
  component: Experiences,
  head: () => ({ meta: [{ title: "Experiences · Radio" }] }),
});

function Experiences() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 pb-44">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Frequency</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Experiences</h1>
      <p className="mt-4 text-muted">Under construction. Linear rites, start-to-finish rooms, and guided sessions will land here.</p>
      <p className="mt-4 text-muted">Until then, stations still carry the fixed-order desks.</p>
      <Link to="/" className="mt-8 inline-flex h-12 items-center font-mono text-[12px] uppercase tracking-[0.16em] text-gold">
        Back to stations
      </Link>
    </div>
  );
}
