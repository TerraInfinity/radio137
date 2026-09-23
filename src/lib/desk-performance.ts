import { songKey } from "./rose-rite.ts";
import type { Channel, Track } from "./types.ts";

export type PerfAction = {
  kind: "convert" | "share";
  channelSlug: string;
  trackId: string;
};

export type PerfNote = {
  id: string;
  title: string;
  detail: string;
  steps: string;
  action?: PerfAction;
};

function audioExt(url: string): string {
  const path = (url || "").split("?")[0]?.split("#")[0] ?? "";
  const name = path.split("/").pop() || "";
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "";
  return name.slice(dot + 1).toLowerCase();
}

function liveTracks(channel: Channel): Track[] {
  if (!channel.enabled) return [];
  return channel.tracks.filter((track) => track.enabled !== false && Boolean(track.audioUrl));
}

/** What an admin can still do so a song does not stall. Empty means the catalog is already light. */
export function performanceNotes(channels: Channel[]): PerfNote[] {
  const notes: PerfNote[] = [];
  const seenUrl = new Set<string>();
  for (const channel of channels) {
    for (const track of liveTracks(channel)) {
      const ext = audioExt(track.audioUrl);
      if (!ext || ext === "mp3") continue;
      const key = track.audioUrl.split("?")[0] ?? track.audioUrl;
      if (seenUrl.has(key)) continue;
      seenUrl.add(key);
      notes.push({
        id: `fmt:${key}`,
        title: `${track.title} is a ${ext}`,
        detail: `${channel.name} waits on the whole ${ext} before the song can start. An mp3 starts while the rest is still coming in.`,
        steps: "Convert it once. The original file stays on R2. Every copy of this name then plays the mp3.",
        action: { kind: "convert", channelSlug: channel.slug, trackId: track.id },
      });
    }
  }

  const groups = new Map<string, { title: string; items: Array<{ channel: Channel; track: Track }> }>();
  for (const channel of channels) {
    for (const track of liveTracks(channel)) {
      const key = songKey(track.title);
      if (key === "title:") continue;
      const group = groups.get(key) ?? { title: track.title, items: [] };
      group.items.push({ channel, track });
      groups.set(key, group);
    }
  }
  for (const [key, group] of groups) {
    const urls = new Set(group.items.map((item) => item.track.audioUrl.split("?")[0]));
    if (urls.size < 2) continue;
    const mp3 = group.items.find((item) => audioExt(item.track.audioUrl) === "mp3") ?? group.items[0];
    if (!mp3) continue;
    const shareMp3 = audioExt(mp3.track.audioUrl) === "mp3";
    notes.push({
      id: `split:${key}`,
      title: `${group.title} uses ${urls.size} different files`,
      detail: "The same song on another station downloads again, so the next scene waits.",
      steps: shareMp3
        ? "Point every copy at the mp3 that already exists."
        : "Convert one copy to mp3, then every station with this name uses that file.",
      action: {
        kind: shareMp3 ? "share" : "convert",
        channelSlug: mp3.channel.slug,
        trackId: mp3.track.id,
      },
    });
  }
  return notes;
}
