import { useEffect, useRef, useState } from "react";
import "./experience-gate.css";
import { bufferHead, clamp01, mergeLaneProgress, type GateLane } from "@/lib/experience-preload";
import { radioEngine } from "@/lib/radio-engine";

const STALL_MS = 12_000;

export function ExperienceGate({
  kicker,
  title,
  catalogReady,
  audioReady,
  video,
  plates,
  onReady,
}: {
  kicker: string;
  title: string;
  catalogReady: boolean;
  /** 0–1 from the deck that will play the preview. */
  audioReady: number;
  video: HTMLVideoElement | null;
  plates: string[];
  onReady: () => void;
}) {
  const [lanes, setLanes] = useState<GateLane[]>(() => [
    { id: "station", label: "Station", progress: 0 },
    { id: "score", label: "Score", progress: 0 },
    { id: "vortex", label: "Vortex", progress: 0 },
    { id: "plates", label: "Plates", progress: 0 },
  ]);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    setLanes((current) => current.map((lane) => (lane.id === "station" ? { ...lane, progress: catalogReady ? 1 : 0 } : lane)));
  }, [catalogReady]);

  useEffect(() => {
    setLanes((current) => current.map((lane) => (lane.id === "score" ? { ...lane, progress: clamp01(audioReady) } : lane)));
  }, [audioReady]);

  useEffect(() => {
    if (!video) return;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const progress = video.error ? 1 : bufferHead(video);
      setLanes((current) => current.map((lane) => (lane.id === "vortex" ? { ...lane, progress } : lane)));
    };
    tick();
    video.preload = "auto";
    const events = ["loadedmetadata", "progress", "canplay", "canplaythrough", "error"] as const;
    for (const name of events) video.addEventListener(name, tick);
    const stall = window.setTimeout(() => {
      setLanes((current) => current.map((lane) => (lane.id === "vortex" && lane.progress < 1 ? { ...lane, progress: 1 } : lane)));
    }, STALL_MS);
    return () => {
      alive = false;
      window.clearTimeout(stall);
      for (const name of events) video.removeEventListener(name, tick);
    };
  }, [video]);

  useEffect(() => {
    if (plates.length === 0) {
      setLanes((current) => current.map((lane) => (lane.id === "plates" ? { ...lane, progress: 1 } : lane)));
      return;
    }
    let alive = true;
    let loaded = 0;
    const images = plates.map((src) => {
      const img = new Image();
      const finish = () => {
        if (!alive) return;
        loaded += 1;
        const progress = loaded / plates.length;
        setLanes((current) => current.map((lane) => (lane.id === "plates" ? { ...lane, progress } : lane)));
      };
      img.onload = finish;
      img.onerror = finish;
      img.src = src;
      if (img.complete) finish();
      return img;
    });
    const stall = window.setTimeout(() => {
      setLanes((current) => current.map((lane) => (lane.id === "plates" && lane.progress < 1 ? { ...lane, progress: 1 } : lane)));
    }, STALL_MS);
    return () => {
      alive = false;
      window.clearTimeout(stall);
      for (const img of images) {
        img.onload = null;
        img.onerror = null;
      }
    };
  }, [plates]);

  const progress = mergeLaneProgress(lanes);
  const percent = Math.round(progress * 100);
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  useEffect(() => {
    if (video) return;
    const stall = window.setTimeout(() => {
      setLanes((current) => current.map((lane) => (lane.id === "vortex" && lane.progress < 1 ? { ...lane, progress: 1 } : lane)));
    }, STALL_MS);
    return () => window.clearTimeout(stall);
  }, [video]);

  useEffect(() => {
    if (progress < 0.995) return;
    const hold = window.setTimeout(() => setLeaving(true), 220);
    const finish = window.setTimeout(() => {
      if (done.current) return;
      done.current = true;
      readyRef.current();
    }, 640);
    return () => {
      window.clearTimeout(hold);
      window.clearTimeout(finish);
    };
  }, [progress]);

  return (
    <div className={leaving ? "xp-gate is-leaving" : "xp-gate"} role="status" aria-live="polite" aria-busy={!leaving}>
      <p className="xp-gate-kicker">{kicker}</p>
      <h2 className="xp-gate-title">{title}</h2>
      <p className="xp-gate-line">Opening the preview</p>
      <ol className="xp-gate-lanes">
        {lanes.map((lane) => (
          <li key={lane.id}>
            <span className="xp-gate-name">{lane.label}</span>
            <span className="xp-gate-track" aria-hidden>
              <span style={{ width: `${Math.round(clamp01(lane.progress) * 100)}%` }} />
            </span>
          </li>
        ))}
      </ol>
      <div
        className="xp-gate-master"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Preview"
      >
        <span style={{ width: `${percent}%` }} />
      </div>
      <p className="xp-gate-percent">{percent}%</p>
    </div>
  );
}

/** Deck progress for the preview cut. 1 when there is nothing left to buffer. */
export function previewDeckProgress(catalogReady: boolean, audioUrl: string | null, status: string): number {
  if (!catalogReady) return 0;
  if (!audioUrl) return 1;
  if (status === "missing") return 1;
  const snap = radioEngine.snapshot();
  const src = snap.src || "";
  const named = audioUrl.split("/").pop() || audioUrl;
  const onDeck = src.includes(named) || src.includes(encodeURIComponent(named));
  if (!onDeck) return status === "loading" ? 0.2 : 0.08;
  return bufferHead({
    readyState: snap.readyState,
    duration: snap.duration,
    buffered: snap.buffered,
  });
}
