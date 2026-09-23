import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RoseOpera } from "@/components/rose-opera";
import { getExperience } from "@/lib/experiences";
import { getCatalog, getPlayableTracks } from "@/lib/catalog";
import { ensureLiveCatalog } from "@/lib/live-catalog";
import { previewTrackOf } from "@/lib/phenomena";
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
  const cueTrack = usePlayerStore((s) => s.cueTrack);
  const ready = usePlayerStore((s) => s.ready);
  const catalogReady = usePlayerStore((s) => s.catalogReady);
  const stationSlug = experience?.stationSlug;
  const arrived = useRef(false);

  useEffect(() => {
    if (!ready || !catalogReady || !stationSlug || !experience || arrived.current) return;
    arrived.current = true;
    const state = usePlayerStore.getState();
    if (experience.slug === "rose") {
      const channel = catalog.channels.find((item) => item.slug === stationSlug);
      const preview = previewTrackOf(getPlayableTracks(channel));
      const play = state.autoplay;
      if (preview) {
        void cueTrack(stationSlug, preview.id, { play, hold: true });
        return;
      }
      void tuneIn(stationSlug, { fromStart: true, play });
      return;
    }
    if (state.channelSlug === stationSlug) return;
    void tuneIn(stationSlug, { fromStart: true, play: false });
  }, [catalog.channels, catalogReady, cueTrack, experience, ready, stationSlug, tuneIn]);

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
