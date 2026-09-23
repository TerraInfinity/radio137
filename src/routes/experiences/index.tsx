import { createFileRoute, Link } from "@tanstack/react-router";
import { listExperiences } from "@/lib/experiences";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/experiences/")({
  component: ExperiencesIndex,
  head: () => ({ meta: [{ title: "Experiences · Radio" }] }),
});

function ExperiencesIndex() {
  const catalog = usePlayerStore((s) => s.catalog);
  const items = listExperiences(catalog.channels.length ? catalog : undefined);
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Frequency</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Experiences</h1>
      <p className="mt-4 max-w-prose text-muted">
        Fixed-order rites. The playlist is the score; the screen is the stage. Shuffle stays off so the sequence holds.
      </p>
      <ul className="mt-10 grid gap-5">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              to="/experiences/$slug"
              params={{ slug: item.slug }}
              className="grid overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-filigree)] sm:grid-cols-[14rem_1fr]"
            >
              <img src={item.cover} alt="" className="aspect-[3/4] h-full w-full object-cover sm:aspect-auto sm:min-h-48" />
              <span className="flex flex-col justify-center p-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">{item.kicker}</span>
                <span className="mt-2 font-display text-3xl font-semibold">{item.title}</span>
                <span className="mt-2 font-glaum text-xl text-gold">{item.line}</span>
                <span className="mt-3 max-w-prose text-sm text-muted">{item.summary}</span>
                <span className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan">{item.whisper}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
