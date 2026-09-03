import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ChannelCard } from "@/components/channel-card";
import { isChannelNsfw, publicChannels } from "@/lib/catalog";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({ meta: [{ title: "Radio" }] }),
});

function Home() {
  const catalog = usePlayerStore((s) => s.catalog);
  const channels = catalog.channels.length ? catalog.channels : publicChannels();
  const featured = useMemo(
    () =>
      channels
        .filter((channel) => channel.enabled && channel.featured && !isChannelNsfw(channel))
        .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99) || a.name.localeCompare(b.name)),
    [channels],
  );
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return channels.filter((channel) => {
      if (!channel.enabled || isChannelNsfw(channel)) return false;
      if (!needle) return true;
      return `${channel.name} ${channel.slug} ${channel.energy} ${channel.tags.join(" ")} ${channel.category}`.toLowerCase().includes(needle);
    });
  }, [channels, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-44">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Clockwork temple</p>
      <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight">Radio</h1>
      <p className="mt-3 max-w-prose text-muted">A dark-elf clockwork temple. Live desks share a station clock. Fixed rooms play start to finish. Vaults wait on demand.</p>
      <label className="mt-8 block">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Search</span>
        <span className="relative mt-1 block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
          <input className="input pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, tag, category" />
        </span>
      </label>
      {featured.length > 0 ? (
        <section className="mt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">Featured</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map((channel) => (
              <ChannelCard key={channel.slug} channel={channel} />
            ))}
          </div>
        </section>
      ) : null}
      <section className="mt-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">All stations</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((channel) => (
            <ChannelCard key={channel.slug} channel={channel} />
          ))}
        </div>
      </section>
      <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
        The network is quiet. <Link to="/channel/$slug" params={{ slug: "default" }} className="text-gold">Open desk</Link>
      </p>
    </div>
  );
}
