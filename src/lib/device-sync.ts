import { experienceFromChannel } from "./experiences.ts";
import { roseFeedUrl } from "./rose-feed.ts";
import type { Channel } from "./types.ts";

const PREFIX = "sync.v1.";

export const ROSE_APPLE_SHOW = "https://podcasts.apple.com/us/podcast/rose/id6815476712";

/** Catalog page, and the iOS scheme that opens Podcasts instead of Safari. */
export function appleShowLinks(catalogUrl: string): { page: string; app: string } | null {
  try {
    const url = new URL(catalogUrl.trim());
    if (url.protocol !== "https:" || !url.hostname.endsWith("podcasts.apple.com")) return null;
    const id = url.pathname.match(/id(\d+)/)?.[1];
    if (!id) return null;
    return { page: `${url.origin}${url.pathname}`, app: `podcasts://${url.host}${url.pathname}` };
  } catch {
    return null;
  }
}

export type DeviceSyncOffer = {
  enabled: boolean;
  appleUrl: string;
  feedUrl: string;
  siriName: string;
};

function httpsUrl(value: string): string {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

export function encodeSyncTag(offer: DeviceSyncOffer): string {
  return (
    PREFIX +
    encodeURIComponent(
      JSON.stringify({
        on: offer.enabled ? 1 : 0,
        apple: offer.appleUrl.trim(),
        feed: offer.feedUrl.trim(),
        siri: offer.siriName.trim(),
      }),
    )
  );
}

export function decodeSyncTag(tag: string | undefined | null): DeviceSyncOffer | null {
  if (!tag?.startsWith(PREFIX)) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(tag.slice(PREFIX.length))) as { on?: number; apple?: string; feed?: string; siri?: string };
    return {
      enabled: parsed.on === 1,
      appleUrl: httpsUrl(String(parsed.apple ?? "")),
      feedUrl: String(parsed.feed ?? "").trim(),
      siriName: String(parsed.siri ?? "").trim().slice(0, 40),
    };
  } catch {
    return null;
  }
}

export function syncFromTags(tags?: string[] | null): DeviceSyncOffer | null {
  if (!tags) return null;
  for (const tag of tags) {
    const offer = decodeSyncTag(tag);
    if (offer) return offer;
  }
  return null;
}

/** Rose is on until an admin saves a choice. Every other station stays off. */
export function offerFor(channel: { slug: string; tags?: string[] | null } | undefined): DeviceSyncOffer {
  const saved = syncFromTags(channel?.tags);
  if (saved) return saved;
  if (channel?.slug === "rose") return { enabled: true, appleUrl: ROSE_APPLE_SHOW, feedUrl: "", siriName: "Play Rose" };
  return { enabled: false, appleUrl: "", feedUrl: "", siriName: "" };
}

export function feedFor(slug: string, origin: string, offer: DeviceSyncOffer): string {
  const custom = httpsUrl(offer.feedUrl);
  if (custom) return custom;
  if (slug === "rose") return roseFeedUrl(origin);
  return "";
}

export function siriFor(name: string, slug: string, offer: DeviceSyncOffer): string {
  if (offer.siriName.trim()) return offer.siriName.trim();
  if (slug === "rose") return "Play Rose";
  const word = name.replace(/^official\s+/i, "").split(/\s+/).filter(Boolean)[0] || "Radio";
  const clean = word.replace(/[^A-Za-z0-9]/g, "");
  return `Play ${clean.slice(0, 18) || "Radio"}`;
}

export function listenFor(origin: string, channel: Channel): string {
  const root = origin.replace(/\/$/, "") || "https://radio.terrainfinity.ca";
  const xp = experienceFromChannel(channel);
  if (xp) return `${root}/experiences/${encodeURIComponent(xp.slug)}`;
  return `${root}/channel/${encodeURIComponent(channel.slug)}`;
}
