import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Maximize, Minimize, Palette, Pause, Play, RotateCw, X } from "lucide-react";
import "./rose-opera.css";
import { RoseAtelier } from "@/components/rose-atelier";
import { RoseApple } from "@/components/rose-apple";
import { RoseVortex, type RoseRock } from "@/components/rose-vortex";
import { ExperienceGate, previewDeckProgress } from "@/components/experience-gate";
import { cn } from "@/lib/cn";
import { ritePrimary } from "@/lib/rite-primary";
import { radioEngine } from "@/lib/radio-engine";
import { displayAsleep, onDisplayRest } from "@/lib/display-rest";
import { dataSaverOn } from "@/lib/audio-cache";
import { useExperienceUnlock } from "@/lib/experience-unlock";
import { CUE_SETTLE_MS, cueProgress, openingPlates, plateProgress, scenePlates, songAudioProgress, upcomingFrom, warmAhead } from "@/lib/experience-preload";
import type { RadioExperience } from "@/lib/experiences";
import { lookFromStation, type RoseLook } from "@/lib/rose-look";
import { lookForPhenomenon, lookForTrack, isStageOwned, phenomenonMeta, previewTrackOf, stepPhenomenon, type PhenomenonId } from "@/lib/phenomena";
import { getPlayableTracks } from "@/lib/catalog";
import { songPortrait } from "@/lib/media";
import { bpmFromTags, captionForPulse, pulseAt, type RosePulse } from "@/lib/rose-pulse";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";

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
  const [look, setLook] = useState<RoseLook>(experience.slug === "rose" ? lookForPhenomenon(savedLook, "vortex") : trackLook);
  const lookRef = useRef(look);
  lookRef.current = look;
  const tweaked = useRef(false);
  const [overrideId, setOverrideId] = useState<PhenomenonId | null>(null);
  const [reduce, setReduce] = useState(false);
  const [cinema, setCinema] = useState<"off" | "auto" | "manual">("off");
  const [drift, setDrift] = useState(false);
  const [arming, setArming] = useState(false);
  const [holdingPreview, setHoldingPreview] = useState(experience.slug === "rose");
  const [atelierOpen, setAtelierOpen] = useState(false);
  const [chrome, setChrome] = useState(true);
  const [crossing, setCrossing] = useState(false);
  const [caption, setCaption] = useState(savedLook.captions[0] ?? experience.whisper);
  const liveVisual = playing || holdingPreview || (layout === "full" && !unlocked);
  const bpm = look.bpm > 0 ? look.bpm : bpmFromTags(track?.tags, experience.bpm);
  const stills = look.stillUrls.length ? look.stillUrls : experience.stills.map((item) => item.src);
  const stormLoop = look.phenomenon === "vortex" || look.phenomenon === "arrival";
  const stormSrc = "/experiences/rose/vortex-storm.mp4?v=5";
  const rawLoop = stormLoop ? stormSrc : look.loopUrl || experience.loop;
  const loopSrc = rawLoop.includes("tardis-loop") ? "/experiences/rose/vortex-storm.mp4?v=5" : rawLoop;
  const loopPoster = stormLoop || rawLoop.includes("tardis-loop") ? "/experiences/rose/vortex-tunnel.jpg?v=5" : stills[0];
  const portrait = (holdingPreview ? null : songPortrait(track, channel)) || "/experiences/rose/white-rose.png";
  const previewLive = holdingPreview && (playing || status === "loading");
  const previewEnded = holdingPreview && !previewLive && currentTime > 1.5;
  const previewState = previewLive ? "Playing" : previewEnded ? "Ended" : "Ready";
  const previewNotice = previewLive
    ? `Preview playing. ${track?.title ?? "Arrival"}`
    : previewEnded
      ? `Preview ended. ${track?.title ?? "Arrival"}`
      : "Preview ready. Sound is off until it plays.";
  const inRite = !holdingPreview;
  const primary = ritePrimary({
    here: inRite && here,
    playing: inRite && (playing || (arming && status === "loading")),
    started: inRite && (started || here),
  });
  const cinemaDockRef = useRef<{ hidden: boolean; collapsed: boolean } | null>(null);
  const rockRef = useRef<RoseRock>({ charge: 0, hits: 0, burst: 0 });
  const roseRite = usePlayerStore((s) => s.roseRite);
  const catalogReady = usePlayerStore((s) => s.catalogReady);
  const [opening, setOpening] = useState(layout === "full");
  const [songCue, setSongCue] = useState<number | null>(null);
  const cueHold = useRef<string | null>(null);
  const gateOn = useRef(layout === "full");
  const [stormEl, setStormEl] = useState<HTMLVideoElement | null>(null);
  const plates = useMemo(
    () => openingPlates(experience.slug, experience.cover, experience.stills.map((item) => item.src)),
    [experience.cover, experience.slug, experience.stills],
  );
  const previewCut = useMemo(() => previewTrackOf(getPlayableTracks(channel)), [channel]);
  const [deck, setDeck] = useState(0);
  const [wolfOn, setWolfOn] = useState(false);
  const [rocking, setRocking] = useState(false);
  const [wolfPop, setWolfPop] = useState(0);

  useEffect(() => {
    if (layout !== "full") return;
    let show = 0;
    let hide = 0;
    let alive = true;
    const considerHide = () => {
      if (!alive) return;
      if (rockRef.current.charge > 0.12) {
        hide = window.setTimeout(considerHide, 700);
        return;
      }
      setWolfOn(false);
      show = window.setTimeout(arm, 22000 + Math.random() * 18000);
    };
    const arm = () => {
      if (!alive) return;
      setWolfOn(true);
      hide = window.setTimeout(considerHide, 4200);
    };
    show = window.setTimeout(arm, 14000 + Math.random() * 8000);
    const watch = window.setInterval(() => setRocking(rockRef.current.charge > 0.06), 180);
    return () => {
      alive = false;
      window.clearTimeout(show);
      window.clearTimeout(hide);
      window.clearInterval(watch);
    };
  }, [layout]);

  useEffect(() => {
    if (!opening) return;
    const tick = () => setDeck(roseRite ? 1 : previewDeckProgress(catalogReady, previewCut?.audioUrl ?? null, status));
    tick();
    const id = window.setInterval(tick, 180);
    return () => window.clearInterval(id);
  }, [catalogReady, opening, previewCut?.audioUrl, roseRite, status]);

  useEffect(() => {
    if (!opening || !gateOn.current) return;
    if (status === "playing") radioEngine.pause();
  }, [opening, status]);

  const openPreview = useCallback(() => {
    gateOn.current = false;
    setOpening(false);
    if (experience.slug !== "rose") return;
    if (usePlayerStore.getState().roseRite) return;
    const preview = previewTrackOf(getPlayableTracks(channel));
    if (!preview) return;
    radioEngine.prime();
    void cueTrack(experience.stationSlug, preview.id, { play: true, hold: true });
  }, [channel, cueTrack, experience.slug, experience.stationSlug]);

  useEffect(() => {
    if (layout !== "full" || opening || holdingPreview) {
      setSongCue(null);
      return;
    }
    const id = track?.id;
    const audioUrl = track?.audioUrl ?? null;
    if (!id) {
      setSongCue(null);
      return;
    }
    let alive = true;
    let closed = false;
    const timers = { poll: 0, stall: 0 };
    const plates = scenePlates(experience.slug, look.phenomenon);
    const release = (resume: boolean) => {
      if (closed) return;
      closed = true;
      window.clearInterval(timers.poll);
      window.clearTimeout(timers.stall);
      if (cueHold.current === id && resume && usePlayerStore.getState().track?.id === id) radioEngine.prime();
      if (cueHold.current === id) cueHold.current = null;
      if (alive) setSongCue(null);
    };
    const tick = () => {
      if (!alive || closed) return;
      const snap = radioEngine.snapshot();
      const audio = songAudioProgress({
        audioUrl,
        status: usePlayerStore.getState().status,
        src: snap.src,
        readyState: snap.readyState,
        duration: snap.duration,
        buffered: snap.buffered,
        loading: snap.loading,
      });
      const pictures = plateProgress(plates);
      const progress = cueProgress(audio, pictures);
      if (progress >= 0.995 || displayAsleep()) {
        release(false);
        return;
      }
      setSongCue(progress);
    };
    const arm = window.setTimeout(() => {
      if (!alive) return;
      timers.stall = window.setTimeout(() => release(true), 7000);
      tick();
      timers.poll = window.setInterval(tick, 160);
    }, CUE_SETTLE_MS);
    return () => {
      alive = false;
      window.clearTimeout(arm);
      window.clearInterval(timers.poll);
      window.clearTimeout(timers.stall);
      const same = usePlayerStore.getState().track?.id === id;
      if (cueHold.current === id && same) radioEngine.prime();
      if (cueHold.current === id) cueHold.current = null;
    };
  }, [experience.slug, holdingPreview, layout, look.phenomenon, opening, track?.audioUrl, track?.id]);

  const shuffled = usePlayerStore((s) => Boolean(s.shuffleBySlug[experience.stationSlug]));
  useEffect(() => {
    if (layout !== "full" || opening || !channel || shuffled) return;
    let alive = true;
    let tries = 0;
    let timer = 0;
    const run = () => {
      if (!alive) return;
      if (displayAsleep() || dataSaverOn() || !radioEngine.readyToWarm()) {
        if (tries < 6) {
          tries += 1;
          timer = window.setTimeout(run, 4000);
        }
        return;
      }
      const playable = getPlayableTracks(channel);
      const ahead = holdingPreview ? playable.slice(0, 2) : upcomingFrom(playable, track?.id, 2);
      const urls: string[] = [];
      ahead.forEach((item, index) => {
        const at = Math.max(0, playable.findIndex((row) => row.id === item.id));
        const nextLook = lookForTrack(savedLook, item, at);
        urls.push(...scenePlates(experience.slug, nextLook.phenomenon));
        if (index === 0 && item.audioUrl && item.id !== track?.id) radioEngine.warm(item.audioUrl);
      });
      warmAhead(urls);
    };
    timer = window.setTimeout(run, 2500);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [channel, experience.slug, holdingPreview, layout, look.phenomenon, opening, savedLook, shuffled, track?.id]);

  function howl() {
    const rock = rockRef.current;
    rock.charge = Math.min(1, rock.charge + 0.42);
    rock.hits += 1;
    rock.burst = 1;
    setWolfOn(true);
    setRocking(true);
    setWolfPop(rock.hits);
  }

  useEffect(() => {
    setOverrideId(null);
  }, [track?.id]);

  useEffect(() => {
    if (atelierOpen && tweaked.current) return;
    if (overrideId) {
      setLook(lookForPhenomenon(savedLook, overrideId));
      return;
    }
    tweaked.current = false;
    setLook(holdingPreview ? lookForPhenomenon(savedLook, "vortex") : trackLook);
  }, [atelierOpen, holdingPreview, overrideId, savedLook, trackLook]);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const root = stageRef.current;
    if (!root) return;
    const rest = () => root.classList.add("is-asleep");
    const wake = () => root.classList.remove("is-asleep");
    if (displayAsleep()) rest();
    return onDisplayRest(rest, wake);
  }, []);

  useEffect(() => {
    originRef.current = performance.now() - currentTime * 1000;
  }, [currentTime, playing]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const sync = () => {
      if (reduce || displayAsleep() || (!liveVisual && look.phenomenon !== "vortex")) {
        el.pause();
        return;
      }
      void el.play().catch(() => undefined);
    };
    sync();
    return onDisplayRest(sync, sync);
  }, [liveVisual, look.phenomenon, loopSrc, reduce]);

  useEffect(() => {
    const el = stormRef.current;
    if (!el) return;
    const sync = () => {
      if (reduce || displayAsleep() || (!liveVisual && look.phenomenon !== "vortex")) {
        el.pause();
        return;
      }
      void el.play().catch(() => undefined);
    };
    sync();
    return onDisplayRest(sync, sync);
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
      if (displayAsleep()) {
        raf = 0;
        return;
      }
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
    const unlisten = onDisplayRest(
      () => {
        cancelAnimationFrame(raf);
        raf = 0;
      },
      () => {
        if (!raf) raf = requestAnimationFrame(tick);
      },
    );
    return () => {
      unlisten();
      cancelAnimationFrame(raf);
    };
  }, [bpm, currentTime, experience.captions, holdingPreview, playing]);

  useEffect(() => {
    if (layout !== "full") return;
    if (atelierOpen || opening || holdingPreview) {
      setChrome(true);
      return;
    }
    const resting = here && started && status !== "playing" && status !== "loading";
    if (resting) {
      setChrome(true);
      return;
    }
    const dwell = cinema !== "off" ? 2400 : 6400;
    setChrome(true);
    let timer = window.setTimeout(() => setChrome(false), dwell);
    const poke = (event: Event) => {
      if (cinema !== "off" && event.type === "pointermove" && "movementX" in event) {
        const point = event as PointerEvent;
        if (Math.abs(point.movementX) < 4 && Math.abs(point.movementY) < 4) return;
      }
      setChrome(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setChrome(false), dwell);
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
  }, [atelierOpen, cinema, here, holdingPreview, layout, opening, started, status]);

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
    if (layout !== "full" || cinema !== "off" || drift || atelierOpen || reduce || holdingPreview || opening) return;
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
  }, [atelierOpen, cinema, drift, holdingPreview, layout, opening, reduce]);

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
  const crossAt = useRef(0);

  function crossIn() {
    setCrossing(true);
    window.clearTimeout(crossAt.current);
    crossAt.current = window.setTimeout(() => setCrossing(false), 900);
  }

  useEffect(() => () => window.clearTimeout(crossAt.current), []);

  function armCinema() {
    setDrift(false);
    setCinema("manual");
    try {
      if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.();
    } catch {
      /* the stage still fills the page */
    }
  }

  async function begin() {
    const now = performance.now();
    if (now - riteAt.current < 400) return;
    riteAt.current = now;
    const state = usePlayerStore.getState();
    const stopping = !holdingPreview && (state.status === "playing" || (arming && state.status === "loading"));
    if (stopping) {
      setArming(false);
      setChrome(true);
      halt();
      return;
    }
    const resume = !holdingPreview && here && started && state.channelSlug === experience.stationSlug && Boolean(state.track);
    if (resume) {
      setChrome(true);
      setArming(true);
      try {
        await togglePlay();
      } finally {
        setArming(false);
      }
      return;
    }
    armCinema();
    crossIn();
    setHoldingPreview(false);
    setArming(true);
    radioEngine.prime();
    try {
      await tuneIn(experience.stationSlug, { forcePlay: true, fromStart: true });
    } finally {
      setArming(false);
    }
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

  const showCopy = layout === "hero" || chrome || atelierOpen;

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
        crossing && "is-crossing",
        drift && "is-drifting",
        rocking && "is-rocking",
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
          ref={(node) => {
            stormRef.current = node;
            setStormEl(node);
          }}
          className={cn("rose-storm-bed", look.phenomenon === "vortex" && "is-full")}
          src={stormSrc}
          poster="/experiences/rose/vortex-tunnel.jpg?v=5"
          muted
          loop
          playsInline
          preload={opening ? "auto" : "metadata"}
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
        <RoseVortex pulseRef={pulseRef} lookRef={lookRef} playing={liveVisual} reduce={reduce} rockRef={rockRef} />
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
        <div className="rose-cross" aria-hidden />
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
      <p className="rose-opera-caption">{layout === "full" ? (playing || holdingPreview ? caption : "") : playing ? caption : experience.whisper}</p>
      {layout === "full" ? (
        <button
          type="button"
          className={cn("rose-bad-wolf", wolfOn && "is-on", rocking && "is-hot")}
          onClick={howl}
          tabIndex={wolfOn ? 0 : -1}
          aria-hidden={!wolfOn}
          aria-label="Bad Wolf"
        >
          <span key={wolfPop}>bad wolf</span>
        </button>
      ) : null}
      {holdingPreview && layout === "full" ? (
        <p className="sr-only" role="status" aria-live="polite">
          {previewNotice}
        </p>
      ) : null}
      <LookCycle current={look.phenomenon} songDefault={trackLook.phenomenon} onCycle={cycleLook} />
      {isAdmin ? (
        <button
          type="button"
          className="rose-atelier-mark"
          aria-pressed={atelierOpen}
          aria-label="Atelier"
          onClick={() => setAtelierOpen((value) => !value)}
        >
          <Palette className="size-4" />
        </button>
      ) : null}
      <div className={cn("rose-opera-copy", !showCopy && "is-hidden")}>
        {layout === "full" ? (
          <h1 className="sr-only">{experience.title}</h1>
        ) : (
          <>
            <p className="rose-opera-kicker">{experience.kicker}</p>
            <h1 className="rose-opera-title">{experience.title}</h1>
            <p className="rose-opera-line">{experience.line}</p>
            <p className="rose-opera-whisper">{experience.whisper}</p>
          </>
        )}
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
            <button
              type="button"
              onClick={() => void resetPreview()}
              className={cn("rose-preview-reset", previewLive ? "is-live" : "is-still")}
            >
              <span className="rose-preview-orbit" aria-hidden>
                <i />
                <i />
                <i />
              </span>
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
              {experience.slug === "rose" && cinema === "off" ? <RoseApple /> : null}
            </>
          ) : (
            <>
              <Link to="/experiences/$slug" params={{ slug: experience.slug }} className="rose-welcome-enter">
                <img src={portrait} alt="" />
                <span>
                  <em>Full opera</em>
                  Welcome to the opera
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
      {layout === "full" && cinema === "manual" ? (
        <button type="button" className="rose-opera-exit" onClick={() => void leaveOpera()} aria-label="Exit cinema">
          <X className="size-4" />
        </button>
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
      {opening && layout === "full" ? (
        <ExperienceGate
          kicker={experience.kicker}
          title={experience.title}
          catalogReady={catalogReady}
          audioReady={deck}
          video={stormEl}
          plates={plates}
          onReady={openPreview}
        />
      ) : null}
      {songCue != null && layout === "full" ? (
        <div
          className="song-cue"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(songCue * 100)}
          aria-label="Loading song"
        >
          <span style={{ width: `${Math.round(songCue * 100)}%` }} />
        </div>
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
