import { useEffect, useMemo, useRef, useState } from "react";
import { ChannelCard } from "@/components/channel-card";
import { sortByPopularity } from "@/lib/popularity";
import type { Channel, PresenceSnapshot } from "@/lib/types";

export function FeaturedRail({
  channels,
  presence,
  favorites = [],
  hostSlug,
}: {
  channels: Channel[];
  presence: PresenceSnapshot | null;
  favorites?: string[];
  hostSlug?: string | null;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const ordered = useMemo(() => {
    const ranked = sortByPopularity(channels, presence, favorites);
    if (!hostSlug) return ranked;
    const host = ranked.find((channel) => channel.slug === hostSlug);
    if (!host) return ranked;
    return [host, ...ranked.filter((channel) => channel.slug !== hostSlug)];
  }, [channels, favorites, hostSlug, presence]);

  useEffect(() => {
    if (ordered.length < 2 || paused) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = window.setInterval(() => {
      setIndex((n) => (n + 1) % ordered.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [ordered.length, paused]);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const child = root.children[index % Math.max(ordered.length, 1)] as HTMLElement | undefined;
    if (!child) return;
    const left = child.offsetLeft;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }, [index, ordered.length]);

  if (ordered.length === 0) return null;

  return (
    <div
      className="relative"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div
        ref={scroller}
        className="relative flex gap-4 overflow-x-auto overflow-y-hidden pb-2 snap-x snap-mandatory overscroll-x-contain [overflow-anchor:none] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {ordered.map((channel) => (
          <div key={channel.slug} className="w-[min(100%,320px)] shrink-0 snap-start">
            <ChannelCard channel={channel} />
          </div>
        ))}
      </div>
      {ordered.length > 1 ? (
        <div className="mt-3 flex justify-center gap-1">
          {ordered.map((channel, i) => (
            <button
              key={channel.slug}
              type="button"
              aria-label={`Show ${channel.name}`}
              onClick={() => setIndex(i)}
              className={
                i === index % ordered.length
                  ? "h-2 w-6 rounded-full bg-gold"
                  : "size-2 rounded-full bg-subtle"
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
