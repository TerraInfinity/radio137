import { usePlayerStore } from "@/lib/player-store";
import { cn } from "@/lib/cn";

/** The Radio home set. Shrimpify keeps its own cabinet. */
export function RadioHomeSet() {
  const slug = usePlayerStore((s) => s.channelSlug);
  const last = usePlayerStore((s) => s.lastSlug);
  const status = usePlayerStore((s) => s.status);
  const track = usePlayerStore((s) => s.track);
  const catalog = usePlayerStore((s) => s.catalog);
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const playing = status === "playing";
  const station = catalog.channels.find((item) => item.slug === (slug || last)) ?? catalog.channels.find((item) => item.enabled);

  function press() {
    if (playing && slug) {
      void togglePlay();
      return;
    }
    const next = slug || last || station?.slug;
    if (next) void tuneIn(next, { forcePlay: true });
  }

  return (
    <section className={cn("radio-set", playing && "is-live")} aria-label="Radio">
      <img src="/brand/radio-set.jpg" alt="" className="radio-set-art" />
      <div className="radio-set-shade" />
      <div className="radio-set-read">
        <p className="radio-set-kicker">
          <span className="radio-set-lamp" />
          On the air
        </p>
        <p className="radio-set-title">{track?.title || station?.name || "Radio"}</p>
        <p className="radio-set-station">{station?.name || "The station clock"}</p>
        <button type="button" className="radio-set-knob" onClick={press}>
          {playing ? "Pause" : "Play"}
        </button>
      </div>
    </section>
  );
}
