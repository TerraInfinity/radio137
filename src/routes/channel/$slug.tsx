import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import { ChannelView } from "@/components/channel-view";
import { getChannel } from "@/lib/catalog";
import { experienceFromChannel } from "@/lib/experiences";
import { ensureLiveCatalog } from "@/lib/live-catalog";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/channel/$slug")({
  beforeLoad: async ({ params }) => {
    if (params.slug === "rose") {
      throw redirect({ to: "/experiences/$slug", params: { slug: "rose" } });
    }
    try {
      await ensureLiveCatalog();
    } catch {
      /* seed is enough */
    }
    const channel = getChannel(params.slug);
    const experience = channel ? experienceFromChannel(channel) : undefined;
    if (experience) {
      throw redirect({ to: "/experiences/$slug", params: { slug: experience.slug } });
    }
  },
  component: ChannelPage,
  head: ({ params }) => {
    const channel = getChannel(params.slug);
    return { meta: [{ title: `${channel?.name ?? "Station"} · Radio` }] };
  },
});

function ChannelPage() {
  const { slug } = Route.useParams();
  if (slug === "rose") {
    return <Navigate to="/experiences/$slug" params={{ slug: "rose" }} replace />;
  }
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
  const experience = experienceFromChannel(channel);
  if (experience) {
    return <Navigate to="/experiences/$slug" params={{ slug: experience.slug }} replace />;
  }
  return <ChannelView channel={channel} />;
}
