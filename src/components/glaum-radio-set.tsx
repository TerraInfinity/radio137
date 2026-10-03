import { usePlayerStore } from "@/lib/player-store";
import { GLAUM_STATION } from "@/lib/shrimpify";
import { cn } from "@/lib/cn";

export function GlaumRadioSet() {
  const slug = usePlayerStore((s) => s.channelSlug);
  const status = usePlayerStore((s) => s.status);
  const track = usePlayerStore((s) => s.track);
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const live = slug === GLAUM_STATION && status === "playing";

  function press() {
    if (slug === GLAUM_STATION) void togglePlay();
    else void tuneIn(GLAUM_STATION, { forcePlay: true });
  }

  return (
    <div className={cn("glaum-set", live && "is-live")}>
      <div className="glaum-cabinet">
        <div className="glaum-face">
          <div className="glaum-speaker" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <div className="glaum-dial">
            <p className="glaum-dial-kicker">On the air</p>
            <p className="glaum-dial-name">Glåüm</p>
            <div className="glaum-scale" aria-hidden>
              <i />
              <i />
              <i />
              <i />
              <i />
              <b className="glaum-needle" />
            </div>
            <p className="glaum-now">{live && track ? track.title : "Official Glaum Frequency"}</p>
          </div>
        </div>
        <button type="button" className="glaum-knob" onClick={press} aria-pressed={live}>
          {live ? "Pause" : "Play"}
        </button>
      </div>
      <p className="mt-6 text-center font-glaum text-2xl italic text-fg sm:text-3xl">You are listening to Glåüm Radio.</p>
    </div>
  );
}
