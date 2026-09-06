import { createFileRoute, Link } from "@tanstack/react-router";
import { ChannelCard } from "@/components/channel-card";
import { DialSearch } from "@/components/dial-search";
import { isChannelNsfw, publicChannels } from "@/lib/catalog";
import { qSearch } from "@/lib/search";
import { usePlayerStore } from "@/lib/player-store";
import { useMemo } from "react";

export const Route = createFileRoute("/")({
  component: Home,
  validateSearch: qSearch,
  head: () => ({ meta: [{ title: "Radio" }] }),
});

function Home() {
  const catalog = usePlayerStore((s) => s.catalog);
  const channels = catalog.channels.length ? catalog.channels : publicChannels();
  const { q = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const featured = useMemo(
    () =>
      channels
        .filter((channel) => channel.enabled && channel.featured && !isChannelNsfw(channel))
        .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99) || a.name.localeCompare(b.name)),
    [channels],
  );
  const searching = q.trim().length >= 2;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-44">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Clockwork temple</p>
      <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight">Radio</h1>
      <p className="mt-3 max-w-prose text-muted">A dark-elf clockwork temple. Live desks share a station clock. Fixed rooms play start to finish. Vaults wait on demand.</p>
      <div className="mt-8 max-w-3xl">
        <DialSearch
          catalog={catalog.channels.length ? catalog : { ...catalog, channels }}
          query={q}
          onQuery={(next) => void navigate({ search: { q: next.trim() ? next : undefined }, replace: true })}
          heading="Search songs & stations"
        />
      </div>
      {searching ? null : featured.length > 0 ? (
        <section className="mt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">Featured</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map((channel) => (
              <ChannelCard key={channel.slug} channel={channel} />
            ))}
          </div>
        </section>
      ) : null}
      {searching ? null : (
        <section className="mt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">All stations</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {channels
              .filter((channel) => channel.enabled && !isChannelNsfw(channel))
              .map((channel) => (
                <ChannelCard key={channel.slug} channel={channel} />
              ))}
          </div>
        </section>
      )}
      <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
        The network is quiet. <Link to="/channel/$slug" params={{ slug: "default" }} className="text-gold">Open desk</Link>
      </p>
    </div>
  );
}
