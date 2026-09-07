export type StationKind = "live" | "ondemand" | "fixed";
export type ShuffleMode = "off" | "optional" | "on";

export type Track = {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
  audioUrl: string;
  coverUrl?: string;
  nsfw?: boolean;
  enabled?: boolean;
  playback?: string;
  originalUrl?: string;
  originalPlatform?: string;
  tags?: string[];
  slug?: string;
  aliases?: string[];
};

export type Channel = {
  slug: string;
  name: string;
  energy: string;
  mode: StationKind | string;
  kind: StationKind | string;
  cover: string;
  description: string;
  enabled: boolean;
  tags: string[];
  category: string;
  featured: boolean;
  featuredRank?: number;
  claimable: boolean;
  skin: string;
  loveBubbles?: boolean;
  glaumules?: boolean;
  nsfw: boolean;
  isDefault?: boolean;
  shuffle?: ShuffleMode;
  publicSlug?: string;
  aliases?: string[];
  animationUrl?: string;
  embedUrl?: string;
  videoUrl?: string;
  mix?: string;
  spotlightTrackId?: string;
  tracks: Track[];
};

export type Catalog = {
  network: string;
  defaultSlug: string;
  theme?: { clockwork?: boolean; sand?: boolean; intensity?: number };
  hostShare?: boolean;
  channels: Channel[];
};

export type Identity = { id: string; name: string };
export type ClaimRecord = { claimantId: string; name: string; expiresAt: number };
