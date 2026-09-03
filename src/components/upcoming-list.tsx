import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AdminAddTrack, AdminTrackTools } from "@/components/admin-track-tools";
import { cn, formatClock } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";
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
  const cueTrack = usePlayerStore((s) => s.cueTrack);
  const skipAllowed = usePlayerStore((s) => s.skipAllowed(slug));
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

      {!skipAllowed ? (
        <p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-buzz">Skip locked</p>
      ) : null}

      {upcoming.length === 0 ? (
        <p className="px-3 pb-3 text-sm text-muted">Empty queue.</p>
      ) : expanded ? (
        <ol className="divide-y divide-line border-t border-line">
          {visible.map((item) => (
            <li key={item.id} className="flex items-center gap-1 px-2">
              <button
                type="button"
                disabled={!skipAllowed}
                onClick={() => void cueTrack(slug, item.id)}
                className="flex min-h-11 min-w-0 flex-1 items-baseline justify-between gap-3 px-1 py-2 text-left disabled:opacity-60"
              >
                <span className="truncate font-display text-lg">{item.title}</span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-subtle">
                  {formatClock(item.durationSec)}
                </span>
              </button>
              <Link
                to="/player/$id"
                params={{ id: item.id }}
                className="inline-flex h-11 shrink-0 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
              >
                Open
              </Link>
              <AdminTrackTools slug={slug} track={item} compact />
            </li>
          ))}
        </ol>
      ) : (
        <ol className="border-t border-line px-3 py-1">
          {visible.map((item, index) => (
            <li key={item.id} className="flex items-center gap-1">
              <button
                type="button"
                disabled={!skipAllowed}
                onClick={() => void cueTrack(slug, item.id)}
                className="flex h-7 min-w-0 flex-1 items-center gap-2 text-left disabled:opacity-60"
              >
                <span className="w-3.5 shrink-0 font-mono text-[10px] tabular-nums text-subtle">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-muted">{item.title}</span>
                <span className="shrink-0 font-mono text-[10px] tabular-nums text-subtle">
                  {formatClock(item.durationSec)}
                </span>
              </button>
              <AdminTrackTools slug={slug} track={item} compact />
            </li>
          ))}
        </ol>
      )}
      <AdminAddTrack slug={slug} cover={cover ?? ""} />
    </section>
  );
}
