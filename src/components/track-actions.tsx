import { Heart, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";

export function TrackActions({ trackId, compact = false }: { trackId: string; compact?: boolean }) {
  const liked = usePlayerStore((s) => s.liked.includes(trackId));
  const favorite = usePlayerStore((s) => s.favorites.includes(trackId));
  const likes = usePlayerStore((s) => s.likeCounts[trackId] ?? 0);
  const views = usePlayerStore((s) => s.views[trackId] ?? 0);
  const toggleLike = usePlayerStore((s) => s.toggleLike);
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);

  return (
    <div className={cn("flex flex-wrap items-center", compact ? "gap-1" : "gap-2")}>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleLike(trackId);
        }}
        className={cn(
          "inline-flex h-11 items-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em]",
          liked ? "text-buzz" : "text-subtle hover:text-gold",
        )}
        aria-pressed={liked}
        aria-label="Like"
      >
        <Heart className="size-4" fill={liked ? "currentColor" : "none"} />
        {likes > 0 ? likes : compact ? "" : "Like"}
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleFavorite(trackId);
        }}
        className={cn(
          "inline-flex h-11 items-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em]",
          favorite ? "text-gold" : "text-subtle hover:text-gold",
        )}
        aria-pressed={favorite}
        aria-label="Favorite"
      >
        <Star className="size-4" fill={favorite ? "currentColor" : "none"} />
        {compact ? "" : favorite ? "Saved" : "Save"}
      </button>
      {views > 0 ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{views} plays</span>
      ) : null}
    </div>
  );
}
