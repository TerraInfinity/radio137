import type { Catalog, Track } from "@/lib/types";

export type CatalogEdit = {
  channelSlug: string;
  trackId: string;
  hidden: boolean;
  deletedR2: boolean;
  added: boolean;
  title: string | null;
  artist: string | null;
  durationSec: number | null;
  audioUrl: string | null;
  coverUrl: string | null;
  r2Key: string | null;
};

export function applyCatalogEdits(catalog: Catalog, edits: CatalogEdit[]): Catalog {
  if (edits.length === 0) return catalog;
  const deletedUrls = new Set(
    edits.filter((edit) => edit.deletedR2 && edit.audioUrl).map((edit) => edit.audioUrl as string),
  );
  const deletedKeys = new Set(edits.filter((edit) => edit.deletedR2 && edit.r2Key).map((edit) => edit.r2Key as string));
  const hidden = new Map<string, Set<string>>();
  const added = new Map<string, CatalogEdit[]>();
  for (const edit of edits) {
    if (edit.hidden) {
      const set = hidden.get(edit.channelSlug) ?? new Set();
      set.add(edit.trackId);
      hidden.set(edit.channelSlug, set);
    }
    if (edit.added && !edit.hidden) {
      const list = added.get(edit.channelSlug) ?? [];
      list.push(edit);
      added.set(edit.channelSlug, list);
    }
  }

  return {
    ...catalog,
    channels: catalog.channels.map((channel) => {
      const hide = hidden.get(channel.slug);
      const extra = added.get(channel.slug) ?? [];
      const tracks = channel.tracks
        .map((track) => {
          const gone =
            hide?.has(track.id) ||
            (track.audioUrl && deletedUrls.has(track.audioUrl)) ||
            (track.audioUrl && deletedKeys.size > 0 && [...deletedKeys].some((key) => track.audioUrl.includes(key)));
          if (!gone) return track;
          return { ...track, enabled: false };
        })
        .concat(
          extra
            .filter((edit) => !channel.tracks.some((track) => track.id === edit.trackId))
            .map(
              (edit): Track => ({
                id: edit.trackId,
                title: edit.title || "Untitled",
                artist: edit.artist || channel.name,
                durationSec: edit.durationSec && edit.durationSec > 0 ? edit.durationSec : 60,
                audioUrl: edit.audioUrl || "",
                coverUrl: edit.coverUrl || channel.cover,
                nsfw: false,
                enabled: true,
                playback: "file",
              }),
            ),
        );
      return { ...channel, tracks };
    }),
  };
}
