export type OriginalPlatform = "suno" | "soundcloud" | "youtube" | "other";
export type ChannelMode = "live" | "on-demand";
export type ChannelKind = "live" | "on-demand" | "fixed" | "experience";
export type TrackPlayback = "file" | "soundcloud" | "youtube" | "suno";
export type ChannelSkin = "none" | "glaum" | "waheguru";

export type Track = {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
  audioUrl: string;
  coverUrl: string;
  nsfw: boolean;
  enabled: boolean;
  originalUrl?: string;
  originalPlatform?: OriginalPlatform;
  playback?: TrackPlayback;
};

export type Channel = {
  slug: string;
  name: string;
  energy: string;
  kind: ChannelKind;
  mode: ChannelMode;
  cover: string;
  animationUrl: string;
  description: string;
  enabled: boolean;
  tracks: Track[];
  tags: string[];
  category: string;
  featured: boolean;
  claimable: boolean;
  skin: ChannelSkin;
  loveBubbles: boolean;
  glaumules: boolean;
  spotlightTrackId: string;
  isDefault: boolean;
  nsfw: boolean;
  embedUrl: string;
  videoUrl: string;
  mix: string;
};

export type SiteTheme = {
  clockwork: boolean;
  sand: boolean;
  intensity: number;
};

export type Catalog = {
  network: string;
  defaultSlug: string;
  theme: SiteTheme;
  hostShare: boolean;
  channels: Channel[];
};

export type HostGroove = {
  slug: string;
  trackTitle: string;
  name: string;
  live: boolean;
  at: number;
};

export type PresenceSnapshot = {
  live: Record<string, number>;
  viewers: Record<string, number>;
  listens: Record<string, number>;
  views: Record<string, number>;
  host: HostGroove | null;
};

export type ClaimRecord = {
  claimantId: string | null;
  claimantName: string | null;
  claimedAt: number | null;
  expiresAt: number | null;
};

export type Identity = {
  id: string;
  name: string;
};
