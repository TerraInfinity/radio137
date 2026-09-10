import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AdminAddTrack, AdminTrackTools } from "@/components/admin-track-tools";
import { AdminRename } from "@/components/admin-rename";
import { MarqueeTitle } from "@/components/marquee-title";
import { formatClock } from "@/lib/cn";
import { durationOf } from "@/lib/playback";
import { songKey } from "@/lib/song-url";
import { usePlayerStore } from "@/lib/player-store";
import { useRadioUser } from "@/lib/radio-user";
import type { Track } from "@/lib/types";

const COMPACT = 3;

export function UpcomingList({
  slug,
  upcoming,
  live,
  cover,
}: {
  slug: string;
  upcoming: Track[];
  live: boolean;
  cover?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deskOpen, setDeskOpen] = useState(false);
  const cueTrack = usePlayerStore((s) => s.cueTrack);
  const { isAdmin } = useRadioUser();
  const canExpand = upcoming.length > COMPACT;
  const visible = expanded ? upcoming : upcoming.slice(0, COMPACT);
  const hidden = Math.max(0, upcoming.length - COMPACT);
  const label = live ? "Upcoming" : "Playlist";

  return (
    <section className="mt-6 overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-border)]">
      <div className="flex items-center gap-2 px-3">
        <h2 className="min-w-0 flex-1 truncate py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
          {label}
          {upcoming.length > 0 ? ` · ${upcoming.length}` : ""}
          {!expanded && hidden > 0 ? ` · +${hidden}` : ""}
        </h2>
        {canExpand ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex h-11 shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-gold"
          >
            {expanded ? (
              <>
                Compact <ChevronUp className="size-3.5" />
              </>
            ) : (
              <>
                Expand <ChevronDown className="size-3.5" />
              </>
            )}
          </button>
        ) : null}
      </div>
      {upcoming.length === 0 ? (
        <p className="px-3 pb-3 text-sm text-muted">Empty queue.</p>
      ) : (
        <ol className="border-t border-line px-3 py-1">
          {visible.map((item, index) => (
            <li key={item.id} className="flex flex-wrap items-center gap-x-1">
              <button
                type="button"
                onClick={() => void cueTrack(slug, item.id)}
                className="flex h-11 min-w-0 flex-1 items-center gap-2 overflow-hidden text-left"
              >
                <span className="w-3.5 shrink-0 font-mono text-[10px] tabular-nums text-subtle">{index + 1}</span>
                <MarqueeTitle text={item.title} className="min-w-0 flex-1 text-sm text-muted" />
                <span className="shrink-0 font-mono text-[10px] tabular-nums text-subtle">{formatClock(durationOf(item))}</span>
              </button>
              <Link
                to="/player/$id"
                params={{ id: songKey(item) }}
                className="inline-flex h-11 shrink-0 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
              >
                Open
              </Link>
              <AdminRename slug={slug} track={item} compact />
              {deskOpen ? <AdminTrackTools slug={slug} track={item} compact /> : null}
            </li>
          ))}
        </ol>
      )}
      {isAdmin ? (
        <div className="border-t border-line px-3">
          <button
            type="button"
            onClick={() => setDeskOpen((value) => !value)}
            aria-expanded={deskOpen}
            className="inline-flex h-11 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-gold"
          >
            {deskOpen ? "Hide desk" : "Desk tools"}
            {deskOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
        </div>
      ) : null}
      {deskOpen ? <AdminAddTrack slug={slug} cover={cover ?? ""} /> : null}
    </section>
  );
}
