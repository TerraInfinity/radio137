import { createFileRoute } from "@tanstack/react-router";
import { ChannelView } from "@/components/channel-view";
import { getChannel } from "@/lib/catalog";

export const Route = createFileRoute("/channel/$slug")({
  component: ChannelPage,
  head: ({ params }) => {
    const channel = getChannel(params.slug);
    return {
      meta: [{ title: channel ? `${channel.name} · Radio` : "Channel · Radio" }],
    };
  },
});

function ChannelPage() {
  const { slug } = Route.useParams();
  return <ChannelView slug={slug} />;
}
