import type { DialRow } from "@/components/dial-list";
import { getPlayableTracks, isChannelNsfw } from "@/lib/catalog";
import { experienceFromChannel, listExperiences } from "@/lib/experiences";
import { listensFor, scoreFeature } from "@/lib/feature-weight";
import type { Channel } from "@/lib/types";

function weightOf(channel: Channel, index: number, total: number, views: Record<string, number>, experience: boolean): number {
  const base = scoreFeature({
    featured: Boolean(channel.featured),
    featuredRank: channel.featuredRank,
    listens: listensFor(channel.tracks, views),
    newer: total <= 1 ? 1 : index / (total - 1),
    fresh: (channel.tags ?? []).some((tag) => tag.toLowerCase() === "new"),
  });
  return base + (experience ? 18 : 0);
}

export function stationRows(channels: Channel[], views: Record<string, number>): DialRow[] {
  const open = channels.filter((channel) => channel.enabled && !isChannelNsfw(channel) && getPlayableTracks(channel).length > 0);
  return open
    .map((channel) => {
      const index = channels.findIndex((item) => item.slug === channel.slug);
      const xp = experienceFromChannel(channel);
      return {
        kind: "station" as const,
        slug: channel.slug,
        stationSlug: channel.slug,
        title: channel.name,
        kicker: channel.energy,
        line: channel.description,
        cover: channel.cover,
        href: "/channel/$slug" as const,
        weight: weightOf(channel, Math.max(0, index), channels.length, views, Boolean(xp)),
        featured: Boolean(channel.featured),
        channel,
      };
    })
    .sort((a, b) => b.weight - a.weight || a.title.localeCompare(b.title));
}

export function experienceRows(channels: Channel[], views: Record<string, number>): DialRow[] {
  return listExperiences({ channels, defaultSlug: "", network: "" })
    .map((item) => {
      const channel = channels.find((row) => row.slug === item.stationSlug);
      const index = channel ? channels.findIndex((row) => row.slug === channel.slug) : channels.length - 1;
      return {
        kind: "experience" as const,
        slug: item.slug,
        stationSlug: item.stationSlug,
        title: item.title,
        kicker: item.kicker,
        line: item.line || item.summary,
        cover: item.cover,
        href: "/experiences/$slug" as const,
        weight: channel ? weightOf(channel, Math.max(0, index), channels.length, views, true) : 40,
        featured: Boolean(channel?.featured) || item.slug === "rose",
        channel,
      };
    })
    .filter((row) => !row.channel || (row.channel.enabled && !isChannelNsfw(row.channel)))
    .sort((a, b) => b.weight - a.weight || a.title.localeCompare(b.title));
}

export function homeFeatured(channels: Channel[], views: Record<string, number>): DialRow[] {
  return experienceRows(channels, views).filter((row) => row.featured).slice(0, 3);
}
