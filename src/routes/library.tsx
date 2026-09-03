import { createFileRoute, Link } from "@tanstack/react-router";
import { publicChannels } from "@/lib/catalog";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/library")({
  component: Library,
  head: () => ({ meta: [{ title: "Library · Radio" }] }),
});

function Library() {
  const catalog = usePlayerStore((s) => s.catalog);
  const channels = (catalog.channels.length ? catalog.channels : publicChannels()).filter((channel) => channel.enabled && !channel.nsfw);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-44">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Library</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Stations</h1>
      <ul className="mt-6 divide-y divide-line">
        {channels.map((channel) => (
          <li key={channel.slug} className="py-3">
            <Link to="/channel/$slug" params={{ slug: channel.slug }} className="font-display text-xl">
              {channel.name}
            </Link>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
              {channel.kind} · {channel.tracks.filter((track) => track.enabled !== false).length} cuts
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
