import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, Maximize, MessageSquare, Minimize, Palette, Pause, Play, RotateCw, X } from "lucide-react";
import "./rose-opera.css";
import { AdminStationEdit } from "@/components/admin-track-tools";
import { GhostCleaner } from "@/components/ghost-cleaner";
import { RoseAtelier } from "@/components/rose-atelier";
import { RoseGrokChat } from "@/components/rose-grok-chat";
import { RoseVortex } from "@/components/rose-vortex";
import { StationPlaylist } from "@/components/station-playlist";
import { cn } from "@/lib/cn";
import { ritePrimary } from "@/lib/rite-primary";
import { radioEngine } from "@/lib/radio-engine";
import { useExperienceUnlock } from "@/lib/experience-unlock";
import type { RadioExperience } from "@/lib/experiences";
import { lookFromStation, type RoseLook } from "@/lib/rose-look";
import { lookForPhenomenon, lookForTrack, isStageOwned, phenomenonMeta, previewTrackOf, stepPhenomenon, type PhenomenonId } from "@/lib/phenomena";
import { getPlayableTracks } from "@/lib/catalog";
import { bpmFromTags, captionForPulse, pulseAt, type RosePulse } from "@/lib/rose-pulse";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";

const IDLE_CHROME_MS = 3200;
const IDLE_OPERA_MS = 15_000;
const DRIFT_MS = 2400;

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
  const stormRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const pulseRef = useRef<RosePulse>(QUIET);
  const originRef = useRef(performance.now());
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const cueTrack = usePlayerStore((s) => s.cueTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const halt = usePlayerStore((s) => s.halt);
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
  const [overrideId, setOverrideId] = useState<PhenomenonId | null>(null);
  const [reduce, setReduce] = useState(false);
  const [cinema, setCinema] = useState<"off" | "auto" | "manual">("off");
  const [drift, setDrift] = useState(false);
  const [arming, setArming] = useState(false);
  const [holdingPreview, setHoldingPreview] = useState(experience.slug === "rose");
  const [deskOpen, setDeskOpen] = useState(false);
  const [atelierOpen, setAtelierOpen] = useState(false);
  const [grokOpen, setGrokOpen] = useState(false);
  const grokPersist = useRef(false);
  const [chrome, setChrome] = useState(true);
  const [caption, setCaption] = useState(savedLook.captions[0] ?? experience.whisper);
  const liveVisual = playing || holdingPreview || (layout === "full" && !unlocked);
  const bpm = look.bpm > 0 ? look.bpm : bpmFromTags(track?.tags, experience.bpm);
  const stills = look.stillUrls.length ? look.stillUrls : experience.stills.map((item) => item.src);
  const stormLoop = look.phenomenon === "vortex" || look.phenomenon === "arrival";
  const stormSrc = "/experiences/rose/vortex-storm.mp4?v=5";
  const rawLoop = stormLoop ? stormSrc : look.loopUrl || experience.loop;
  const loopSrc = rawLoop.includes("tardis-loop") ? "/experiences/rose/vortex-storm.mp4?v=5" : rawLoop;
  const loopPoster = stormLoop || rawLoop.includes("tardis-loop") ? "/experiences/rose/vortex-tunnel.jpg?v=5" : stills[0];
  const inRite = !holdingPreview;
  const primary = ritePrimary({
    here: inRite && here,
    playing: inRite && (playing || (arming && status === "loading")),
    started: inRite && (started || here),
  });
  const cinemaDockRef = useRef<{ hidden: boolean; collapsed: boolean } | null>(null);

  useEffect(() => {
    setOverrideId(null);
  }, [track?.id]);

  useEffect(() => {
    if ((atelierOpen || grokOpen) && tweaked.current) return;
    if (overrideId) {
      setLook(lookForPhenomenon(savedLook, overrideId));
      return;
    }
    tweaked.current = false;
    setLook(trackLook);
  }, [atelierOpen, grokOpen, overrideId, savedLook, trackLook]);

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
    if (reduce) {
      el.pause();
      return;
    }
    if (!liveVisual && look.phenomenon !== "vortex") {
      el.pause();
      return;
    }
    void el.play().catch(() => undefined);
  }, [liveVisual, look.phenomenon, loopSrc, reduce]);

  useEffect(() => {
    const el = stormRef.current;
    if (!el) return;
    if (reduce) {
      el.pause();
      return;
    }
    if (!liveVisual && look.phenomenon !== "vortex") {
      el.pause();
      return;
    }
    void el.play().catch(() => undefined);
  }, [liveVisual, look.phenomenon, reduce]);

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
      const alive = playing || holdingPreview;
      const t = playing
        ? Math.max(0, (performance.now() - originRef.current) / 1000)
        : holdingPreview
          ? performance.now() / 1000
          : currentTime;
      const pulse = pulseAt(t, bpm, alive);
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
  }, [bpm, currentTime, experience.captions, holdingPreview, playing]);

  useEffect(() => {
    if (cinema === "off" || atelierOpen || grokOpen || deskOpen) {
      setChrome(true);
      return;
    }
    setChrome(false);
    let timer = window.setTimeout(() => setChrome(false), IDLE_CHROME_MS);
    const poke = () => {
      if (cinema === "auto") return;
      setChrome(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setChrome(false), IDLE_CHROME_MS);
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

  const opera = cinema !== "off" && layout === "full";

  useEffect(() => {
    document.body.classList.toggle("rose-cinema-on", opera);
    if (!opera) {
      return () => document.body.classList.remove("rose-cinema-on");
    }
    const store = usePlayerStore.getState();
    if (!cinemaDockRef.current) {
      cinemaDockRef.current = { hidden: store.playerHidden, collapsed: store.playerCollapsed };
    }
    store.setPlayerHidden(true);
    return () => {
      document.body.classList.remove("rose-cinema-on");
      const prior = cinemaDockRef.current;
      cinemaDockRef.current = null;
      if (!prior) return;
      const now = usePlayerStore.getState();
      if (!now.playerHidden) return;
      if (prior.hidden) now.setPlayerHidden(true);
      else now.setPlayerCollapsed(prior.collapsed);
    };
  }, [opera]);

  useEffect(() => {
    const on = drift && cinema === "off" && layout === "full";
    document.body.classList.toggle("rose-drift-on", on);
    return () => document.body.classList.remove("rose-drift-on");
  }, [cinema, drift, layout]);

  useEffect(() => {
    if (layout !== "full" || cinema !== "off" || drift || deskOpen || atelierOpen || grokOpen || reduce) return;
    let timer = window.setTimeout(() => setDrift(true), IDLE_OPERA_MS);
    let lastX = -1;
    let lastY = -1;
    const poke = (event: Event) => {
      if ("clientX" in event) {
        const point = event as PointerEvent;
        if (lastX >= 0 && Math.abs(point.clientX - lastX) < 3 && Math.abs(point.clientY - lastY) < 3) return;
        lastX = point.clientX;
        lastY = point.clientY;
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setDrift(true), IDLE_OPERA_MS);
    };
    window.addEventListener("pointermove", poke);
    window.addEventListener("pointerdown", poke);
    window.addEventListener("touchstart", poke, { passive: true });
    window.addEventListener("keydown", poke);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", poke);
      window.removeEventListener("pointerdown", poke);
      window.removeEventListener("touchstart", poke);
      window.removeEventListener("keydown", poke);
    };
  }, [atelierOpen, cinema, deskOpen, drift, grokOpen, layout, reduce]);

  useEffect(() => {
    if (!drift || cinema !== "off") return;
    const timer = window.setTimeout(() => {
      setCinema("auto");
      setDrift(false);
    }, DRIFT_MS);
    const wake = (event: Event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("[data-rite-cinema]")) return;
      if ("clientX" in event) {
        const point = event as PointerEvent;
        if (event.type === "pointermove" && point.movementX === 0 && point.movementY === 0) return;
      }
      setDrift(false);
    };
    window.addEventListener("pointermove", wake);
    window.addEventListener("pointerdown", wake);
    window.addEventListener("touchstart", wake, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("touchstart", wake);
    };
  }, [cinema, drift]);

  useEffect(() => {
    if (cinema !== "auto") return;
    const wake = (event: Event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("[data-rite-cinema], .rose-opera-exit")) return;
      if (event.type === "pointermove" && "movementX" in event) {
        const point = event as PointerEvent;
        if (Math.abs(point.movementX) < 2 && Math.abs(point.movementY) < 2) return;
      }
      setCinema("off");
      setDrift(false);
    };
    window.addEventListener("pointermove", wake);
    window.addEventListener("pointerdown", wake);
    window.addEventListener("touchstart", wake, { passive: true });
    return () => {
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("touchstart", wake);
    };
  }, [cinema]);

  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement) setCinema((mode) => (mode === "manual" ? "off" : mode));
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const riteAt = useRef(0);

  async function begin() {
    const now = performance.now();
    if (now - riteAt.current < 400) return;
    riteAt.current = now;
    const state = usePlayerStore.getState();
    const stopping = !holdingPreview && (state.status === "playing" || (arming && state.status === "loading"));
    if (stopping) {
      setArming(false);
      halt();
      return;
    }
    const resume = !holdingPreview && here && started && state.channelSlug === experience.stationSlug && Boolean(state.track);
    if (resume) {
      setArming(true);
      await togglePlay();
      return;
    }
    setHoldingPreview(false);
    setArming(true);
    radioEngine.prime();
    await tuneIn(experience.stationSlug, { forcePlay: true, fromStart: true });
  }

  async function resetPreview() {
    const preview = previewTrackOf(getPlayableTracks(channel));
    if (!preview) return;
    const state = usePlayerStore.getState();
    const play = state.autoplay || state.currentTime > 1;
    radioEngine.prime();
    await cueTrack(experience.stationSlug, preview.id, { play, hold: true });
  }

  function leaveOpera() {
    setDrift(false);
    setCinema("off");
    if (document.fullscreenElement) {
      void document.exitFullscreen?.().catch(() => undefined);
    }
  }

  async function enterOpera() {
    setDrift(false);
    setCinema("manual");
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    } catch {
      /* the stage still fills the page */
    }
  }

  const showCopy = layout === "hero" || chrome || deskOpen || atelierOpen || grokOpen;

  function applyLook(next: RoseLook) {
    tweaked.current = true;
    setLook(next);
  }

  function cycleLook(step = 1) {
    const next = stepPhenomenon(look.phenomenon, step);
    if (next === trackLook.phenomenon) {
      setOverrideId(null);
      tweaked.current = false;
      setLook(trackLook);
      return;
    }
    setOverrideId(next);
    applyLook(lookForPhenomenon(savedLook, next));
  }

  return (
    <section
      ref={stageRef}
      className={cn(
        "rose-opera",
        layout === "full" && "rose-opera-full",
        cinema !== "off" && "is-cinema",
        drift && "is-drifting",
        !liveVisual && "is-hush",
        showCopy ? "is-chrome" : "is-screensaver",
        atelierOpen && "is-atelier",
        isStageOwned(look.phenomenon) && "is-stage",
      )}
      data-phenomenon={look.phenomenon}
    >
      <div className="rose-opera-stage" aria-hidden>
        {isStageOwned(look.phenomenon) || stormLoop ? null : (
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
        <video
          ref={stormRef}
          className={cn("rose-storm-bed", look.phenomenon === "vortex" && "is-full")}
          src={stormSrc}
          poster="/experiences/rose/vortex-tunnel.jpg?v=5"
          muted
          loop
          playsInline
          preload="metadata"
        />
        {reduce || isStageOwned(look.phenomenon) || loopSrc.includes("vortex-storm") ? null : (
          <video
            key={loopSrc}
            ref={videoRef}
            className="rose-opera-loop"
            src={loopSrc}
            poster={loopPoster}
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}
        <RoseVortex pulseRef={pulseRef} lookRef={lookRef} playing={liveVisual} reduce={reduce} />
        {isStageOwned(look.phenomenon) || look.phenomenon === "arrival" ? null : (
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
      <LookCycle current={look.phenomenon} songDefault={trackLook.phenomenon} onCycle={cycleLook} />
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
            aria-pressed={primary === "pause"}
          >
            {primary === "pause" ? <Pause className="size-4" /> : <Play className="size-4" />}
            {RITE_LABEL[primary]}
          </button>
          {holdingPreview && layout === "full" ? (
            <button type="button" onClick={() => void resetPreview()} className="rose-opera-ghost">
              <RotateCw className="size-3.5" />
              Reset the preview
            </button>
          ) : null}
          {layout === "full" ? (
            <>
              <button
                type="button"
                data-rite-cinema
                onClick={() => void (cinema === "manual" ? leaveOpera() : enterOpera())}
                className="rose-opera-ghost"
                aria-pressed={cinema === "manual"}
              >
                {cinema === "manual" ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
                {cinema === "manual" ? "Exit cinema" : "Cinema"}
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
            The arrival preview is the song marked Arrival in the desk. It plays when Auto is on, and only animates when Auto is off. It stops when that song ends. Reset it, or begin the rite — that always starts the playlist at the first song, from the top.
          </p>
        ) : null}
      </div>
      {layout === "full" && cinema === "manual" ? (
        <button type="button" className="rose-opera-exit" onClick={() => void leaveOpera()} aria-label="Exit cinema">
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
          {isAdmin ? <GhostCleaner channel={channel} /> : null}
          <StationPlaylist
            channel={channel}
            locked={!unlocked}
            onUnlock={() => void begin()}
            startOpen={isAdmin}
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

function LookCycle({
  current,
  songDefault,
  onCycle,
}: {
  current: PhenomenonId;
  songDefault: PhenomenonId;
  onCycle: (step?: number) => void;
}) {
  const item = phenomenonMeta(current);
  const overridden = current !== songDefault;
  return (
    <button
      type="button"
      className="rose-look-cycle"
      aria-pressed={overridden}
      aria-label={`${overridden ? "Override look" : "This song's look"}: ${item.label}. Next look`}
      title={`${item.hint} Click to cycle. Shift-click for the previous scene. The next song returns to its own graphic.`}
      onClick={(event) => onCycle(event.shiftKey ? -1 : 1)}
    >
      <img src={item.thumb} alt="" />
      <span>
        <em>{overridden ? "Override" : "This song"}</em>
        <b>{item.label}</b>
      </span>
      <RotateCw className="size-4" aria-hidden />
    </button>
  );
}
