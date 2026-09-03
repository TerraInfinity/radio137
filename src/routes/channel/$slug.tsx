import { createFileRoute } from "@tanstack/react-router";
import { ChannelView } from "@/components/channel-view";
import { getChannel } from "@/lib/catalog";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/channel/$slug")({
  component: ChannelPage,
  head: ({ params }) => {
    const channel = getChannel(params.slug);
    return { meta: [{ title: `${channel?.name ?? "Station"} · Radio` }] };
  },
});

function ChannelPage() {
  const { slug } = Route.useParams();
  const catalog = usePlayerStore((s) => s.catalog);
  const channel = catalog.channels.find((item) => item.slug === slug) ?? getChannel(slug);
  if (!channel) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember">Missing desk</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">No such station</h1>
      </div>
    );
  }
  return <ChannelView channel={channel} />;
}
