import { useEffect, useMemo, useState } from "react";
import { RoseGrokChat } from "@/components/rose-grok-chat";
import { getPlayableTracks } from "@/lib/catalog";
import { getExperience } from "@/lib/experiences";
import { lookForTrack } from "@/lib/phenomena";
import { lookFromStation, ROSE_LOOK_DEFAULT, type RoseLook } from "@/lib/rose-look";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel } from "@/lib/types";

export function DeskGrok({ channels }: { channels: Channel[] }) {
  const playingSlug = usePlayerStore((s) => s.channelSlug);
  const track = usePlayerStore((s) => s.track);
  const [slug, setSlug] = useState(playingSlug || "rose");
  const channel = channels.find((item) => item.slug === slug) ?? channels.find((item) => item.slug === "rose") ?? channels[0];
  const base = useMemo(() => {
    if (!channel) return ROSE_LOOK_DEFAULT;
    const experience = getExperience(channel.slug);
    const saved = experience ? lookFromStation(experience, channel) : ROSE_LOOK_DEFAULT;
    if (!track || playingSlug !== channel.slug) return saved;
    const index = Math.max(0, getPlayableTracks(channel).findIndex((item) => item.id === track.id));
    return lookForTrack(saved, track, index);
  }, [channel, playingSlug, track]);
  const [look, setLook] = useState<RoseLook>(base);

  useEffect(() => {
    setLook(base);
  }, [base]);

  if (!channel) return null;
  const song = playingSlug === channel.slug ? track : null;

  return (
    <section className="desk-grok mt-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Grok</p>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Direct a look from the desk. It is not on the experience. Pin a song, or save the station look, to keep what Grok writes.
      </p>
      <label className="mt-4 block max-w-xs text-sm">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">Station</span>
        <select className="input mt-1" value={channel.slug} onChange={(event) => setSlug(event.target.value)}>
          {channels.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-3 text-sm text-muted">{song ? `On the needle: ${song.title}` : "Nothing from this station is on the needle. The look still saves."}</p>
      <RoseGrokChat channel={channel} track={song} look={look} onLook={setLook} />
    </section>
  );
}
