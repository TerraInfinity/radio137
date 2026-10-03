import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RoseOpera } from "@/components/rose-opera";
import { getExperience } from "@/lib/experiences";
import { getCatalog, getPlayableTracks } from "@/lib/catalog";
import { ensureLiveCatalog } from "@/lib/live-catalog";
import { previewTrackOf } from "@/lib/phenomena";
import { usePlayerStore } from "@/lib/player-store";
import { markRoseLeft, takeRoseResume } from "@/lib/rose-place";

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
  const roseRite = usePlayerStore((s) => s.roseRite);
  const trackId = usePlayerStore((s) => s.track?.id ?? null);
  const channelSlug = usePlayerStore((s) => s.channelSlug);
  const arrived = useRef(false);
  const roseSettled = useRef(false);

  useEffect(() => {
    if (slug !== "rose") return;
    return () => markRoseLeft();
  }, [slug]);

  useEffect(() => {
    if (slug !== "rose" || !stationSlug) return;
    const onShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      roseSettled.current = true;
      usePlayerStore.setState({ roseRite: false, lastOffsetSec: 0 });
      const channel = usePlayerStore.getState().catalog.channels.find((item) => item.slug === stationSlug);
      const preview = previewTrackOf(getPlayableTracks(channel));
      if (preview) void cueTrack(stationSlug, preview.id, { play: false, hold: true, offsetSec: 0 });
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, [cueTrack, slug, stationSlug]);

  useEffect(() => {
    if (!ready || !catalogReady || !stationSlug || !experience) return;
    const state = usePlayerStore.getState();
    if (experience.slug === "rose") {
      if (roseSettled.current) return;
      roseSettled.current = true;
      const place = takeRoseResume();
      const channel = catalog.channels.find((item) => item.slug === stationSlug);
      const preview = previewTrackOf(getPlayableTracks(channel));
      if (place?.roseRite && place.trackId) {
        usePlayerStore.setState({
          roseRite: true,
          lastSlug: stationSlug,
          lastTrackId: place.trackId,
          lastOffsetSec: place.offset,
        });
        void tuneIn(stationSlug, { play: false });
        return;
      }
      const offset = place && preview && place.trackId === preview.id ? place.offset : 0;
      usePlayerStore.setState({ roseRite: false, lastOffsetSec: offset });
      if (!preview) return;
      void cueTrack(stationSlug, preview.id, { play: false, hold: true, offsetSec: offset });
      return;
    }
    if (arrived.current) return;
    arrived.current = true;
    if (state.channelSlug === stationSlug) return;
    void tuneIn(stationSlug, { fromStart: true, play: false });
  }, [catalog.channels, catalogReady, channelSlug, cueTrack, experience, ready, roseRite, stationSlug, trackId, tuneIn]);

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
