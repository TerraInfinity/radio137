import {
  isAlwaysFind,
  isBigBadWolf,
  isChaosManual,
  isElevation,
  isElfMagicPreview,
  isPrettyAvatar,
  isRoseRemembers,
  isRoseRemembers2,
  isShakeBootie,
  isShinyEyes,
  isSoftShell,
  isSwooningProm,
  isSweetie,
  isTimeShare,
  isTwistIntro,
  isVoiceC,
  isVoiceCheck,
  isVoiceCo,
  isVoiceCoc,
  isVoiceCocy,
  isVoiceNo,
  isVoiceOn,
} from "./phenomena.ts";
import { sortPlaylistTracks } from "./track-title.ts";

/**
 * Default Rose rite. Blank numbers in the desk list (19, 22, 25) are skipped,
 * not empty tracks. A saved Arrange lock still wins over this.
 */
export const ROSE_RITE = [
  "Glaum Shrimp Prom - Swooning for Glaum's Attention",
  "Lady Glaum's Chaos Manual (I like making beauty out of scary shrimpy things)",
  "Pretty Face, Pretty Shiny Eyes",
  "Pretty Face, Pretty Eyes I will always find you",
  "twist me intro",
  "Rose Remembers!",
  "Pretty Face, Pretty Avatar Eyes (From The River to the C)",
  "Voice Check ♔ M8ternity",
  "Pretty Face, Pretty Eyes Big Bad Wolf",
  "Voice C___",
  "Pretty Face, Pretty Eyes Sweetie",
  "Voice Co__",
  "Voice Coc_",
  "Voice Coc_y",
  "Rose Remembers 2",
  "Voice NO!",
  "Helicopter Time Share Shrimp Ad",
  "Glaum Shrimp Prom Shake That Bootie",
  "Voice ON!",
  "Glaum Shrimp Prom - routine elevation",
  "Soft Shell Home - I backed you up inside my chest",
  "Elf Magic Shrimp Kitty Future Nostalgia",
] as const;

/** Specific lanes first, same order the stage uses, so Voice C is not Voice Co. */
const RITE_MATCH: ReadonlyArray<{ index: number; test: (title?: string | null) => boolean }> = [
  { index: 1, test: isChaosManual },
  { index: 16, test: isTimeShare },
  { index: 19, test: isElevation },
  { index: 20, test: isSoftShell },
  { index: 2, test: isShinyEyes },
  { index: 18, test: isVoiceOn },
  { index: 17, test: isShakeBootie },
  { index: 0, test: isSwooningProm },
  { index: 4, test: isTwistIntro },
  { index: 14, test: isRoseRemembers2 },
  { index: 5, test: isRoseRemembers },
  { index: 3, test: isAlwaysFind },
  { index: 8, test: isBigBadWolf },
  { index: 10, test: isSweetie },
  { index: 6, test: isPrettyAvatar },
  { index: 7, test: isVoiceCheck },
  { index: 15, test: isVoiceNo },
  { index: 13, test: isVoiceCocy },
  { index: 12, test: isVoiceCoc },
  { index: 11, test: isVoiceCo },
  { index: 9, test: isVoiceC },
  { index: 21, test: isElfMagicPreview },
];

export function foldSongTitle(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 0–21 when the title is one of the rite songs, else -1. */
export function roseRiteIndex(title?: string | null): number {
  for (const item of RITE_MATCH) {
    if (item.test(title)) return item.index;
  }
  return -1;
}

type Named = { id: string; title: string; artist?: string };

function byName(a: Named, b: Named): number {
  return (
    a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" }) ||
    (a.artist || "").localeCompare(b.artist || "", undefined, { numeric: true, sensitivity: "base" }) ||
    a.id.localeCompare(b.id)
  );
}

/** Rite songs first, in rite order. Anything else (Time War, Basilisk) sorts after, by title. */
export function sortRoseRite<T extends Named>(tracks: T[]): T[] {
  return [...tracks].sort((a, b) => {
    const ai = roseRiteIndex(a.title);
    const bi = roseRiteIndex(b.title);
    const aHit = ai >= 0;
    const bHit = bi >= 0;
    if (aHit && bHit && ai !== bi) return ai - bi;
    if (aHit !== bHit) return aHit ? -1 : 1;
    return byName(a, b);
  });
}

/**
 * Playlist order. A desk Arrange lock wins. Rose with no lock uses the rite.
 * Other fixed stations keep the order they were saved in.
 */
export function orderStationTracks<T extends Named>(
  slug: string,
  kind: string,
  tracks: T[],
  orderById?: ReadonlyMap<string, number | null | undefined>,
): T[] {
  const hasOrder = orderById ? [...orderById.values()].some((n) => n != null) : false;
  if (hasOrder) return sortPlaylistTracks(tracks, orderById);
  if (slug === "rose") return sortRoseRite(tracks);
  if (kind === "fixed") return [...tracks];
  return sortPlaylistTracks(tracks);
}

/** Same rite slot, or the same folded title for songs outside the rite. */
export function songKey(title?: string | null): string {
  const index = roseRiteIndex(title);
  if (index >= 0) return `rose:${index}`;
  return `title:${foldSongTitle(title || "")}`;
}

export function sameSongTitle(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const key = songKey(a);
  if (key === "title:") return false;
  return key === songKey(b);
}
