import { createFileRoute, Link } from "@tanstack/react-router";
import { Pause, Play } from "lucide-react";
import { useMemo } from "react";
import { CoverArt } from "@/components/cover-art";
import { DialSearch } from "@/components/dial-search";
import { FeatureBoard } from "@/components/feature-board";
import { publicChannels } from "@/lib/catalog";
import { experienceFromChannel } from "@/lib/experiences";
import { homeFeatured } from "@/lib/feature-rows";
import { visualSrc } from "@/lib/media";
import { qSearch } from "@/lib/search";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/")({
  component: Home,
  validateSearch: qSearch,
  head: () => ({ meta: [{ title: "Radio" }] }),
});

function Home() {
  const catalog = usePlayerStore((s) => s.catalog);
  const views = usePlayerStore((s) => s.views);
  const channels = catalog.channels.length ? catalog.channels : publicChannels();
  const { q = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const searching = q.trim().length >= 2;
  const faces = useMemo(() => homeFeatured(channels, views), [channels, views]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Welcome to the Light Ages</p>
      <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight">Radio</h1>
      <p className="mt-3 max-w-prose text-muted">Featured rites and stations, and whatever is on the air. The full directories stay in their lanes.</p>
      <div className="mt-8 max-w-3xl">
        <DialSearch
          catalog={catalog.channels.length ? catalog : { ...catalog, channels }}
          query={q}
          onQuery={(next) => void navigate({ search: { q: next.trim() ? next : undefined }, replace: true })}
          heading="Search songs & stations"
        />
      </div>
      {searching ? null : <FeatureBoard rows={faces} />}
      {searching ? null : <OnAir />}
      <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
        <Link to="/stations" className="text-gold">
          Stations
        </Link>
        {" · "}
        <Link to="/experiences" className="text-gold">
          Experiences
        </Link>
      </p>
    </div>
  );
}

function OnAir() {
  const track = usePlayerStore((s) => s.track);
  const slug = usePlayerStore((s) => s.channelSlug);
  const status = usePlayerStore((s) => s.status);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const catalog = usePlayerStore((s) => s.catalog);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const channel = slug ? catalog.channels.find((item) => item.slug === slug) : undefined;
  const experience = channel ? experienceFromChannel(channel) : undefined;
  const playing = status === "playing";
  const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  return (
    <section className="mt-10 overflow-hidden rounded-2xl bg-bg-elevated shadow-[var(--shadow-filigree)]">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="size-24 shrink-0 overflow-hidden rounded-xl sm:size-28">
          {channel && track ? (
            <CoverArt src={visualSrc(track, channel)} alt="" className="size-full" motion="loop" />
          ) : (
            <div className="size-full bg-black/40" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">On the air</p>
          {track && channel ? (
            <>
              <h2 className="mt-1 truncate font-display text-2xl font-semibold">{track.title}</h2>
              <p className="mt-1 truncate text-sm text-muted">
                {experience ? (
                  <Link to="/experiences/$slug" params={{ slug: experience.slug }} className="text-gold">
                    {experience.title}
                  </Link>
                ) : (
                  <Link to="/channel/$slug" params={{ slug: channel.slug }} className="text-gold">
                    {channel.name}
                  </Link>
                )}
                {track.artist ? ` · ${track.artist}` : ""}
              </p>
            </>
          ) : (
            <h2 className="mt-1 font-display text-2xl font-semibold">Nothing playing yet</h2>
          )}
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gold" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => void togglePlay()}
          disabled={!track}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-fg px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-40"
        >
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {playing ? "Pause" : "Play"}
        </button>
      </div>
    </section>
  );
}
