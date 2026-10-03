/** SoundCloud sets by Azeirf. Artwork and embed URLs come from SoundCloud, not invented covers. */

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
