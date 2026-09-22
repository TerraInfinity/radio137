import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, Maximize, MessageSquare, Minimize, Palette, Pause, Play, X } from "lucide-react";
import "./rose-opera.css";
import { AdminStationEdit } from "@/components/admin-track-tools";
import { RoseAtelier } from "@/components/rose-atelier";
import { RoseGrokChat } from "@/components/rose-grok-chat";
import { RoseVortex } from "@/components/rose-vortex";
import { StationPlaylist } from "@/components/station-playlist";
import { cn } from "@/lib/cn";
import { ritePrimary } from "@/lib/rite-primary";
import { useExperienceUnlock } from "@/lib/experience-unlock";
import type { RadioExperience } from "@/lib/experiences";
import { lookFromStation, type RoseLook } from "@/lib/rose-look";
import { lookForTrack, isStageOwned } from "@/lib/phenomena";
import { getPlayableTracks } from "@/lib/catalog";
import { bpmFromTags, captionForPulse, pulseAt, type RosePulse } from "@/lib/rose-pulse";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";

const IDLE_MS = 3200;

const QUIET: RosePulse = pulseAt(0, 120, false);

const RITE_LABEL = {
  begin: "Begin the rite",
  pause: "Pause",
  resume: "Resume",
  opening: "Opening…",
} as const;

export function RoseOpera({
  experience,
  layout = "full",
}: {
  experience: RadioExperience;
  layout?: "full" | "hero";
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const pulseRef = useRef<RosePulse>(QUIET);
  const originRef = useRef(performance.now());
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const track = usePlayerStore((s) => (s.channelSlug === experience.stationSlug ? s.track : null));
  const currentTime = usePlayerStore((s) => (s.channelSlug === experience.stationSlug ? s.currentTime : 0));
  const status = usePlayerStore((s) => (s.channelSlug === experience.stationSlug ? s.status : "idle"));
  const playing = status === "playing";
  const here = usePlayerStore((s) => s.channelSlug === experience.stationSlug);
  const { unlocked, started } = useExperienceUnlock(experience.stationSlug);
  const { isAdmin } = useRadioUser();
  const channel = usePlayerStore((s) => s.catalog.channels.find((item) => item.slug === experience.stationSlug));
  const savedLook = useMemo(() => lookFromStation(experience, channel), [channel, experience]);
  const trackIndex = channel && track ? Math.max(0, getPlayableTracks(channel).findIndex((item) => item.id === track.id)) : 0;
  const trackLook = useMemo(() => lookForTrack(savedLook, track, trackIndex), [savedLook, track, trackIndex]);
  const [look, setLook] = useState<RoseLook>(trackLook);
  const lookRef = useRef(look);
  lookRef.current = look;
  const tweaked = useRef(false);
  const [reduce, setReduce] = useState(false);
  const [cinema, setCinema] = useState(false);
  const [deskOpen, setDeskOpen] = useState(false);
  const [atelierOpen, setAtelierOpen] = useState(false);
  const [grokOpen, setGrokOpen] = useState(false);
  const grokPersist = useRef(false);
  const [chrome, setChrome] = useState(true);
  const [caption, setCaption] = useState(savedLook.captions[0] ?? experience.whisper);
  const liveVisual = playing || (layout === "full" && !unlocked);
  const bpm = look.bpm > 0 ? look.bpm : bpmFromTags(track?.tags, experience.bpm);
  const stills = look.stillUrls.length ? look.stillUrls : experience.stills.map((item) => item.src);
  const loopSrc = look.loopUrl || experience.loop;
  const primary = ritePrimary({ here, playing, started, loading: status === "loading" });

  useEffect(() => {
    if ((atelierOpen || grokOpen) && tweaked.current) return;
    tweaked.current = false;
    setLook(trackLook);
  }, [atelierOpen, grokOpen, trackLook]);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    try {
      setGrokOpen(window.localStorage.getItem("radio.rose.grok.open.v1") === "1");
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    if (!grokPersist.current) {
      grokPersist.current = true;
      return;
    }
    try {
      window.localStorage.setItem("radio.rose.grok.open.v1", grokOpen ? "1" : "0");
    } catch {
      /* private mode */
    }
  }, [grokOpen]);

  useEffect(() => {
    originRef.current = performance.now() - currentTime * 1000;
  }, [currentTime, playing]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (reduce || !liveVisual) {
      el.pause();
      return;
    }
    void el.play().catch(() => undefined);
  }, [liveVisual, loopSrc, reduce]);

  useEffect(() => {
    const root = stageRef.current;
    if (!root) return;
    root.style.setProperty("--rose-stills", String(look.stills));
    root.style.setProperty("--rose-loop", String(look.loop));
  }, [look.loop, look.stills]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = playing ? Math.max(0, (performance.now() - originRef.current) / 1000) : currentTime;
      const pulse = pulseAt(t, bpm, playing);
      pulseRef.current = pulse;
      const lines = lookRef.current.captions.length ? lookRef.current.captions : experience.captions;
      const next = captionForPulse(pulse, lines);
      if (next) {
        setCaption((prev) => (prev === next ? prev : next));
      }
      const root = stageRef.current;
      if (root) {
        root.style.setProperty("--rose-energy", String(pulse.energy));
        root.style.setProperty("--rose-kick", String(pulse.kick));
        root.style.setProperty("--rose-fly", String(pulse.flying));
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [bpm, currentTime, experience.captions, playing]);

  useEffect(() => {
    if (!cinema || atelierOpen || grokOpen || deskOpen) {
      setChrome(true);
      return;
    }
    setChrome(false);
    let timer = window.setTimeout(() => setChrome(false), IDLE_MS);
    const poke = () => {
      setChrome(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setChrome(false), IDLE_MS);
    };
    window.addEventListener("pointermove", poke);
    window.addEventListener("pointerdown", poke);
    window.addEventListener("keydown", poke);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", poke);
      window.removeEventListener("pointerdown", poke);
      window.removeEventListener("keydown", poke);
    };
  }, [atelierOpen, cinema, deskOpen, grokOpen]);

  useEffect(() => {
    document.body.classList.toggle("rose-cinema-on", cinema && layout === "full");
    return () => document.body.classList.remove("rose-cinema-on");
  }, [cinema, layout]);

  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement) setCinema(false);
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  async function begin() {
    if (primary === "opening") return;
    if (primary === "pause" || primary === "resume") {
      await togglePlay();
      return;
    }
    await tuneIn(experience.stationSlug, { forcePlay: true, fromStart: true });
  }

  async function toggleCinema() {
    const el = stageRef.current;
    if (!el) {
      setCinema((value) => !value);
      return;
    }
    try {
      if (!document.fullscreenElement) {
        setCinema(true);
        await el.requestFullscreen?.();
      } else {
        await document.exitFullscreen();
        setCinema(false);
      }
    } catch {
      setCinema((value) => !value);
    }
  }

  const showCopy = layout === "hero" || chrome || deskOpen || atelierOpen || grokOpen;

  function applyLook(next: RoseLook) {
    tweaked.current = true;
    setLook(next);
  }

  return (
    <section
      ref={stageRef}
      className={cn(
        "rose-opera",
        layout === "full" && "rose-opera-full",
        cinema && "is-cinema",
        !liveVisual && "is-hush",
        showCopy ? "is-chrome" : "is-screensaver",
      )}
      data-phenomenon={look.phenomenon}
    >
      <div className="rose-opera-stage" aria-hidden>
        {isStageOwned(look.phenomenon) ? null : (
          <div className="rose-opera-stills">
            {stills.map((src, index) => (
              <img
                key={src}
                src={src}
                alt=""
                className={`rose-opera-still rose-opera-still-${index}`}
              />
            ))}
          </div>
        )}
        {reduce || isStageOwned(look.phenomenon) ? null : (
          <video
            ref={videoRef}
            className="rose-opera-loop"
            src={loopSrc}
            poster={stills[0]}
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}
        <RoseVortex pulseRef={pulseRef} lookRef={lookRef} playing={liveVisual} reduce={reduce} />
        {isStageOwned(look.phenomenon) ? null : (
          <>
            <div className="rose-opera-vortex">
              <span />
              <span />
              <span />
            </div>
            <span className="rose-opera-lantern" />
          </>
        )}
        <div className="rose-opera-veil" />
        <div className="rose-opera-fields" aria-hidden>
          <img className="rose-field-hedge is-left" src="/experiences/rose/rose-hedge.jpg" alt="" />
          <img className="rose-field-hedge is-right" src="/experiences/rose/rose-hedge.jpg" alt="" />
          <img className="rose-field-ground" src="/experiences/rose/rose-field.jpg" alt="" />
          <img className="rose-field-bloom is-a" src="/experiences/rose/rose-bloom.jpg" alt="" />
          <img className="rose-field-bloom is-b" src="/experiences/rose/rose-bloom.jpg" alt="" />
          <span className="rose-glitter" />
          <span className="rose-glitter" />
          <span className="rose-glitter" />
          <span className="rose-glitter" />
          <span className="rose-glitter" />
          <span className="rose-glitter" />
          <span className="rose-glitter" />
          <span className="rose-glitter" />
        </div>
        <div className="rose-opera-air" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      </div>
      <p className="rose-opera-caption">{playing ? caption : experience.whisper}</p>
      <div className={cn("rose-opera-copy", !showCopy && "is-hidden")}>
        <p className="rose-opera-kicker">{experience.kicker}</p>
        <h1 className="rose-opera-title">{experience.title}</h1>
        <p className="rose-opera-line">{experience.line}</p>
        <p className="rose-opera-whisper">{experience.whisper}</p>
        <div className="rose-opera-actions">
          <button
            type="button"
            onClick={() => void begin()}
            className="rose-opera-begin"
            disabled={primary === "opening"}
            aria-pressed={primary === "pause"}
          >
            {primary === "pause" ? <Pause className="size-4" /> : <Play className="size-4" />}
            {RITE_LABEL[primary]}
          </button>
          {layout === "full" ? (
            <>
              <button type="button" onClick={() => void toggleCinema()} className="rose-opera-ghost" aria-pressed={cinema}>
                {cinema ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
                {cinema ? "Exit cinema" : "Cinema"}
              </button>
              <button
                type="button"
                onClick={() => setDeskOpen((value) => !value)}
                className="rose-opera-ghost"
                aria-expanded={deskOpen}
              >
                {unlocked || isAdmin ? "Open the desk" : (
                  <>
                    <Lock className="size-3.5" />
                    Locked desk
                  </>
                )}
              </button>
              {isAdmin ? (
                <button type="button" className="rose-opera-ghost" aria-pressed={atelierOpen} onClick={() => setAtelierOpen((value) => !value)}>
                  <Palette className="size-3.5" />
                  Atelier
                </button>
              ) : null}
              {isAdmin ? (
                <button type="button" className="rose-opera-ghost" aria-pressed={grokOpen} onClick={() => setGrokOpen((value) => !value)}>
                  <MessageSquare className="size-3.5" />
                  Grok
                </button>
              ) : null}
              <Link to="/channel/$slug" params={{ slug: experience.stationSlug }} className="rose-opera-ghost">
                Station
              </Link>
            </>
          ) : (
            <>
              <Link to="/experiences/$slug" params={{ slug: experience.slug }} className="rose-opera-ghost">
                Full opera
              </Link>
              {isAdmin ? (
                <button type="button" className="rose-opera-ghost" aria-pressed={atelierOpen} onClick={() => setAtelierOpen((value) => !value)}>
                  <Palette className="size-3.5" />
                  Atelier
                </button>
              ) : null}
              {isAdmin ? (
                <button type="button" className="rose-opera-ghost" aria-pressed={grokOpen} onClick={() => setGrokOpen((value) => !value)}>
                  <MessageSquare className="size-3.5" />
                  Grok
                </button>
              ) : null}
            </>
          )}
        </div>
        {layout === "full" ? (
          <p className="rose-opera-hint">
            Begin starts the playlist from the first song. Cinema hides the title for a fullscreen stage — it does not restart the music.
          </p>
        ) : null}
      </div>
      {layout === "full" && cinema ? (
        <button type="button" className="rose-opera-exit" onClick={() => void toggleCinema()} aria-label="Exit cinema">
          <X className="size-4" />
        </button>
      ) : null}
      {layout === "full" && deskOpen && channel ? (
        <div className="rose-desk">
          <div className="rose-desk-bar">
            <p className="rose-desk-kicker">{unlocked || isAdmin ? "Rite playlist" : "Sealed until the rite begins"}</p>
            <button type="button" onClick={() => setDeskOpen(false)} className="rose-opera-ghost" aria-label="Close desk">
              <X className="size-4" />
            </button>
          </div>
          <StationPlaylist
            channel={channel}
            locked={!unlocked}
            onUnlock={() => void begin()}
          />
          {isAdmin ? (
            <div className="rose-desk-admin">
              <p className="rose-desk-kicker">Admin</p>
              <p className="mb-3 text-sm text-muted">
                Tag a song <span className="font-mono text-gold">bpm:128</span> to lock that cut. Open <span className="font-mono text-gold">Atelier</span> to keep directing the vortex.
              </p>
              <AdminStationEdit channel={channel} />
            </div>
          ) : null}
        </div>
      ) : null}
      {atelierOpen && isAdmin && channel ? (
        <RoseAtelier
          channel={channel}
          track={track}
          look={look}
          saved={trackLook}
          onLook={applyLook}
          onClose={() => setAtelierOpen(false)}
        />
      ) : null}
      {grokOpen && isAdmin && channel ? (
        <RoseGrokChat
          channel={channel}
          track={track}
          look={look}
          onLook={applyLook}
          onClose={() => setGrokOpen(false)}
        />
      ) : null}
    </section>
  );
}
