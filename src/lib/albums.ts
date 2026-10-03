/** SoundCloud albums and playlists by Azeirf. Artwork and embed URLs come from SoundCloud. */

export type AlbumSource = "soundcloud" | "r2";

export type Album = {
  slug: string;
  title: string;
  line: string;
  artwork: string;
  soundcloudUrl: string;
  embedSrc: string;
  source: AlbumSource;
  /** Filename stem → R2 audio URL. Empty until a later pass. Never plays beside the embed. */
  r2: Record<string, string>;
};

function embed(playlistId: string): string {
  const url = `https://api.soundcloud.com/playlists/${playlistId}`;
  const params = new URLSearchParams({
    url,
    color: "#8d6b2f",
    auto_play: "false",
    hide_related: "true",
    show_comments: "false",
    show_user: "false",
    show_reposts: "false",
    show_teaser: "false",
    visual: "false",
  });
  return `https://w.soundcloud.com/player/?${params.toString()}`;
}

export const ALBUMS: Album[] = [
  {
    slug: "1-800-shrimp-up",
    title: "1-800-Shrimp-Up",
    line: "Album · 35 tracks",
    artwork: "https://i1.sndcdn.com/artworks-q85qmz9LFXFAAhRf-KDqKDQ-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/1-800-shrimp-up",
    embedSrc: embed("2269641311"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "cyber-athens-bimbo-elon-musk",
    title: "Cyber Athens: Bimbo Elon Musk",
    line: "Album · 20 tracks",
    artwork: "https://i1.sndcdn.com/artworks-Dl7lUhwNFazr0bmI-KzuOqQ-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/cyber-athens-bimbo-elon-musk",
    embedSrc: embed("2247054182"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "cyber-athens-yoga-nabhi-kriya",
    title: "Cyber Athens Yoga: Nabhi Kriya for Prana Apana Balance",
    line: "Album · 6 tracks",
    artwork: "https://i1.sndcdn.com/artworks-uRSMffwumnml9e1c-wpprow-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/cyber-athens-yoga-nabhi-kriya",
    embedSrc: embed("2246506169"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "cyber-athens-8-limbs-of-yoga",
    title: "Cyber Athens: 8 Limbs of Yoga",
    line: "Album · 9 tracks",
    artwork: "https://i1.sndcdn.com/artworks-T6iXvsZzDkOCFszy-Tfw89g-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/cyber-athens-8-limbs-of-yoga",
    embedSrc: embed("2240189477"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "glaum-tenants",
    title: "Glaum Tenants",
    line: "Album · 11 tracks",
    artwork: "https://i1.sndcdn.com/artworks-YT6hqQQhqGHXTPj3-weyChQ-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/glaum-tenants",
    embedSrc: embed("2234350781"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "shrimp-helicopter-time-share",
    title: "Shrimp Helicopter Time Share Ad",
    line: "Album · 2 tracks",
    artwork: "https://i1.sndcdn.com/artworks-2nzFBgXRp2Jdfzq5-tC3fFw-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/shrimp-helicopter-time-share",
    embedSrc: embed("2234285078"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "the-glaum-prom",
    title: "The Glaum Prom",
    line: "The ballroom set.",
    artwork: "https://i1.sndcdn.com/artworks-2nzFBgXRp2Jdfzq5-tC3fFw-t500x500.png",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/the-glaum-prom",
    embedSrc: embed("2234251208"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "general-casual-listening",
    title: "General Casual Listening",
    line: "A quiet room of songs.",
    artwork: "https://i1.sndcdn.com/artworks-zBP8pugFZS3mGhWf-lNrubg-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/general-sfw",
    embedSrc: embed("2180149688"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "everyone-hates-bimbo-elon-musk",
    title: "Everyone Hates Bimbo Elon Musk",
    line: "Album · 12 tracks",
    artwork: "https://i1.sndcdn.com/artworks-BWF6w1B0cDKuNgcR-9uy7WA-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/everyone-hates-bimbo-elon-musk",
    embedSrc: embed("2177110316"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "lady-bambi-reborn-always-a-twist-at-the-end",
    title: "Lady Bambi, Reborn (Always a Twist at the End)",
    line: "Album · 7 tracks",
    artwork: "https://i1.sndcdn.com/artworks-XU8TRF0FEdAqjIy6-Sa2Pgg-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/lady-bambi-reborn-always-a-twist-at-the-end",
    embedSrc: embed("2175322772"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "stand-alone-tracks",
    title: "Stand Alone Tracks",
    line: "Songs that stand by themselves.",
    artwork: "https://i1.sndcdn.com/artworks-j1Y7foUL8yXYLmib-gmP8zA-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/stand-alone-tracks",
    embedSrc: embed("2174219237"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "lady-m-the-ethical-slut-jungle-of-love",
    title: "Lady M - The Ethical Slut (Jungle of Love)",
    line: "Album · 11 tracks",
    artwork: "https://i1.sndcdn.com/artworks-hYt6gsKeycZFgzsR-2UJvQg-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/lady-m-the-ethical-slut-jungle-of-love",
    embedSrc: embed("2174216162"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "player-lady-bambi-a-beautiful-game",
    title: "Player: Lady Bambi (A Beautiful Game)",
    line: "Album · 4 tracks",
    artwork: "https://i1.sndcdn.com/artworks-BaccDfhwqKMyjifd-sL24Aw-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/player-lady-bambi-a-beautiful-game",
    embedSrc: embed("2173695125"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "i-am-lady-bambi-2ohm-lady-reset",
    title: "I Am Lady, (Bambi 2.Ohm) - Lady Reset",
    line: "Album · 8 tracks",
    artwork: "https://i1.sndcdn.com/artworks-oXq7OR6Rll4sxycs-ufkIWA-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/i-am-lady-bambi-2ohm-lady-reset",
    embedSrc: embed("2172632990"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "lady-bambis-chaos-manual",
    title: "18+ Lady Bambi's Chaos Manual (Modern Gods for Modern Girls)",
    line: "A longer rite. The mark is theme, not a lock.",
    artwork: "https://i1.sndcdn.com/artworks-GrrfolkL6zSkPuXC-6dJZzA-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/lady-bambis-chaos-manual",
    embedSrc: embed("2172627839"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "clockwork",
    title: "CLockWork 18+",
    line: "Clockwork, in the open.",
    artwork: "https://i1.sndcdn.com/artworks-S0a7USpa6zghV1HP-GRQTAA-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/clockwork",
    embedSrc: embed("2172624701"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "lady-bambis-kinky-mobile",
    title: "Lady Bambi's Kinky Mobile Meditation Charging Station 18+",
    line: "Playlist · 5 tracks",
    artwork: "https://i1.sndcdn.com/artworks-H5lOOAO4cyWFOpq2-woGDhQ-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/lady-bambis-kinky-mobile",
    embedSrc: embed("2172624179"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "cs-sohila",
    title: "C's Sohila",
    line: "Album · 5 tracks",
    artwork: "https://i1.sndcdn.com/artworks-KVdyg1NczCXzTA8C-l0hB8g-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/cs-sohila",
    embedSrc: embed("2172620015"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "lady-bambi-consent-is-for-everyone",
    title: "Lady Bambi - Consent is for Everyone",
    line: "Album · 3 tracks",
    artwork: "https://i1.sndcdn.com/artworks-w38ziW6RKDaF3l8y-VFNAeg-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/lady-bambi-consent-is-for-everyone",
    embedSrc: embed("2172609926"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "hello-sweetie-lady-cs-chaos-manual",
    title: "Hello Sweetie (Lady C's Chaos Manual)",
    line: "Album · 5 tracks",
    artwork: "https://i1.sndcdn.com/artworks-d7HHJviFGpsm3lWj-4oW0Fw-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/hello-sweetie-lady-cs-chaos-manual",
    embedSrc: embed("2172608561"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "karma-rokos-basilisk-notice-me-senpai",
    title: "Karma: Roko's Basilisk (Notice Me Senpai)",
    line: "Album · 15 tracks",
    artwork: "https://i1.sndcdn.com/artworks-RimpQtOcczVnCA4b-SbfnEg-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/karma-rokos-basilisk-notice-me-senpai",
    embedSrc: embed("2153834711"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "cancer-scorpio",
    title: "Harmonic Cancer Scorpio Field",
    line: "Playlist · 13 tracks",
    artwork: "https://i1.sndcdn.com/artworks-J62Lq8I8PGb3zVcj-8dMncQ-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/cancer-scorpio",
    embedSrc: embed("2117420726"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "karma-dump-minimum-hello-world",
    title: "Karma Dump Minimum - Hello World",
    line: "Playlist · 12 tracks",
    artwork: "https://i1.sndcdn.com/artworks-EeGByvDWRz8NCQnT-nCy7nA-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/karma-dump-minimum-hello-world",
    embedSrc: embed("2116988972"),
    source: "soundcloud",
    r2: {},
  },
  {
    slug: "a-prawnic-experience-bambi-20hm-skynet-agent-bambi-cyber-bimbo-matrix",
    title: "A Prawnic  Experience (Bambi 2.0hm - Skynet Agent Bambi / Cyber Bimbo Matrix)",
    line: "Album · 37 tracks",
    artwork: "https://i1.sndcdn.com/artworks-l6BaaZsjd0HcY7Po-ioFLFw-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/azeirf/sets/a-prawnic-experience-bambi-20hm-skynet-agent-bambi-cyber-bimbo-matrix",
    embedSrc: embed("2115994856"),
    source: "soundcloud",
    r2: {},
  },
];

export function albumBySlug(slug: string): Album | undefined {
  return ALBUMS.find((album) => album.slug === slug);
}

/** SoundCloud embed, unless a later pass marks the album r2 and supplies a URL. Never both. */
export function albumPlayback(album: Album): { kind: "soundcloud"; src: string } | { kind: "r2"; src: string } {
  const r2 = Object.values(album.r2).find((url) => url.trim());
  if (album.source === "r2" && r2) return { kind: "r2", src: r2 };
  return { kind: "soundcloud", src: album.embedSrc };
}
