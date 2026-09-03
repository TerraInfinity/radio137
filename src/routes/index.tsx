import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Search } from "lucide-react";
import { ChannelCard } from "@/components/channel-card";
import { FeaturedRail } from "@/components/featured-rail";
import { LiveNowStrip } from "@/components/live-now-strip";
import { ModePill } from "@/components/mode-pill";
import { StationVisual } from "@/components/station-visual";
import { listChannels } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { FAV_EVENT, loadFavorites } from "@/lib/favorites";
import { sortByPopularity } from "@/lib/popularity";
import { usePresenceStore } from "@/lib/presence-store";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel } from "@/lib/types";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const catalog = usePlayerStore((s) => s.catalog);
  const channels = catalog.channels.length > 0 ? catalog.channels : listChannels();
  const channelSlug = usePlayerStore((s) => s.channelSlug);
  const track = usePlayerStore((s) => s.track);
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const presence = usePresenceStore((s) => s.snapshot);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [favTick, setFavTick] = useState(0);

  useEffect(() => {
    const onFav = () => setFavTick((n) => n + 1);
    window.addEventListener(FAV_EVENT, onFav);
    return () => window.removeEventListener(FAV_EVENT, onFav);
  }, []);

  const favorites = useMemo(() => {
    void favTick;
    return loadFavorites();
  }, [favTick]);

  const ranked = useMemo(
    () => sortByPopularity(channels.filter((channel) => channel.enabled), presence, favorites),
    [channels, favorites, presence],
  );
  const offAir = useMemo(
    () => channels.filter((channel) => !channel.enabled).sort((a, b) => a.name.localeCompare(b.name)),
    [channels],
  );

  const categories = useMemo(() => {
    const set = new Set(channels.map((channel) => channel.category).filter(Boolean));
    return ["all", "popular", "listened", "viewed", "featured", "live", "favorites", ...[...set].sort()];
  }, [channels]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const fav = new Set(favorites);
    const source =
      filter === "popular" || filter === "listened" || filter === "viewed" || (filter === "all" && !needle)
        ? filter === "all"
          ? [...ranked, ...offAir]
          : ranked
        : channels;
    return source.filter((channel) => {
      if (filter === "live" && !(channel.enabled && channel.kind === "live")) return false;
      if (filter === "featured" && !channel.featured) return false;
      if (filter === "favorites" && !fav.has(channel.slug)) return false;
      if (filter === "popular" && !channel.enabled) return false;
      if (filter === "listened") return (presence?.listens[channel.slug] ?? 0) > 0;
      if (filter === "viewed") return (presence?.views[channel.slug] ?? 0) > 0;
      if (!["all", "live", "featured", "favorites", "popular", "listened", "viewed"].includes(filter) && channel.category !== filter) {
        return false;
      }
      if (!needle) return true;
      const hay = `${channel.name} ${channel.energy} ${channel.tags.join(" ")} ${channel.category} ${channel.description}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [channels, favorites, filter, offAir, presence, query, ranked]);

  const host = presence?.host;
  const featured = ranked.filter((channel) => {
    if (!channel.enabled) return false;
    if (channel.featured) return true;
    if (host?.slug === channel.slug) return true;
    return false;
  });
  const hottest = ranked
    .filter((channel) => (presence?.live[channel.slug] ?? 0) > 0 || (presence?.listens[channel.slug] ?? 0) > 0)
    .slice(0, 6);
  const hostChannel = host ? channels.find((channel) => channel.slug === host.slug) : null;
  const you = channels.find((channel) => channel.slug === channelSlug);
  const hero = hostChannel ?? you ?? channels.find((channel) => channel.slug === catalog.defaultSlug) ?? ranked[0] ?? null;
  const heroLabel = hostChannel
    ? host?.live
      ? `${host.name} is grooving`
      : `${host?.name ?? "Desk"} last grooved here`
    : channelSlug === hero?.slug
      ? "On the dial"
      : "Default intro";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">Clockwork temple</p>
      <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight sm:text-6xl">Radio</h1>
      <p className="mt-4 max-w-prose text-muted">
        A dark-elf clockwork temple. Live desks share a station clock. The green lamp starts the first
        frequency. After that, this tab remembers where you were.
      </p>

      {hero ? (
        <section
          className={cn(
            "filigree-frame mt-8 grid gap-4 rounded-xl bg-bg-elevated p-3 shadow-[var(--shadow-filigree)] sm:grid-cols-[160px_minmax(0,1fr)] sm:p-4",
            hero.skin === "glaum" && "skin-glaum",
            hero.skin === "waheguru" && "skin-waheguru",
          )}
        >
          <StationVisual channel={hero} size="hero" className="aspect-square w-full rounded-lg" />
          <div className="flex min-w-0 flex-col justify-center px-1 py-2">
            <p
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.18em] text-subtle",
                hero.skin === "glaum" && "glaum-kicker",
              )}
            >
              {hero.skin === "glaum" ? "What If · Theme frequency" : heroLabel}
            </p>
            <h2
              className={cn(
                "mt-1 font-display text-3xl font-semibold tracking-tight",
                hero.skin === "glaum" && "glaum-title",
              )}
            >
              {hero.skin === "glaum" ? "Glåüm" : hero.name}
            </h2>
            <p className="mt-1 truncate font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              {hero.skin === "glaum"
                ? "Sponsored by Shrimp™"
                : hostChannel && host?.trackTitle
                  ? host.trackTitle
                  : track && channelSlug === hero.slug
                    ? track.title
                    : hero.energy}
            </p>
            <div className="mt-3">
              <ModePill kind={hero.kind} mode={hero.mode} enabled={hero.enabled} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void tuneIn(hero.slug, { forcePlay: true })}
                className={cn(
                  "inline-flex h-11 items-center gap-2 px-4 text-[11px] uppercase",
                  hero.skin === "glaum"
                    ? "btn-glaum"
                    : "rounded-md bg-fg font-mono tracking-[0.16em] text-bg",
                )}
              >
                <Play className="size-3.5" />
                Tune in
              </button>
              <Link
                to="/channel/$slug"
                params={{ slug: hero.slug }}
                className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
              >
                Open desk
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <label className="mt-8 block">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Search stations</span>
        <span className="relative mt-1 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <input
            className="input pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, tag, category"
          />
        </span>
      </label>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={
              filter === item
                ? "inline-flex h-11 shrink-0 items-center rounded-md bg-fg px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bg"
                : "inline-flex h-11 shrink-0 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted"
            }
          >
            {item}
          </button>
        ))}
      </div>

      {hottest.length > 0 && !query && filter === "all" ? (
        <section className="mt-10">
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">Most listeners</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hottest.map((channel) => (
              <ChannelCard key={channel.slug} channel={channel} />
            ))}
          </div>
        </section>
      ) : null}

      {featured.length > 0 && !query && filter === "all" ? (
        <section className="mt-10">
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">Featured</h2>
          <FeaturedRail channels={featured} presence={presence} favorites={favorites} hostSlug={host?.slug} />
        </section>
      ) : null}

      {favorites.length > 0 && !query && filter === "all" ? (
        <section className="mt-10">
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">Favorites</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ranked
              .filter((channel) => favorites.includes(channel.slug))
              .map((channel) => (
                <ChannelCard key={channel.slug} channel={channel} />
              ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">Live now</h2>
        <LiveNowStrip />
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
          {filter === "all" && !query ? "All stations" : "Matching stations"}
        </h2>
        <ChannelGrid channels={visible} />
      </section>
    </div>
  );
}

function ChannelGrid({ channels }: { channels: Channel[] }) {
  if (channels.length === 0) {
    return <p className="text-sm text-muted">No stations match.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {channels.map((channel) => (
        <ChannelCard key={channel.slug} channel={channel} />
      ))}
    </div>
  );
}
