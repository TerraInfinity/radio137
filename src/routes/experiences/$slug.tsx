import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RoseOpera } from "@/components/rose-opera";
import { getExperience } from "@/lib/experiences";
import { getCatalog } from "@/lib/catalog";
import { ensureLiveCatalog } from "@/lib/live-catalog";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/experiences/$slug")({
  beforeLoad: async () => {
    try {
      await ensureLiveCatalog();
    } catch {
      /* seed is enough */
    }
  },
  component: ExperiencePage,
  head: ({ params }) => {
    const experience = getExperience(params.slug, getCatalog());
    return { meta: [{ title: `${experience?.title ?? "Experience"} · Radio` }] };
  },
});

function ExperiencePage() {
  const { slug } = Route.useParams();
  const catalog = usePlayerStore((s) => s.catalog);
  const experience = getExperience(slug, catalog.channels.length ? catalog : undefined);
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const ready = usePlayerStore((s) => s.ready);
  const catalogReady = usePlayerStore((s) => s.catalogReady);
  const here = usePlayerStore((s) => Boolean(experience) && s.channelSlug === experience?.stationSlug);
  const stationSlug = experience?.stationSlug;

  useEffect(() => {
    if (!ready || !catalogReady || !stationSlug || here) return;
    void tuneIn(stationSlug, { fromStart: true, play: false });
  }, [ready, catalogReady, stationSlug, here, tuneIn]);

  if (!experience) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember">Missing rite</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">No such experience</h1>
        <Link to="/experiences" className="mt-6 inline-flex h-12 items-center font-mono text-[12px] uppercase tracking-[0.16em] text-gold">
          All experiences
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-0">
      <RoseOpera experience={experience} layout="full" />
    </div>
  );
}
