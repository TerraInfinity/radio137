import { useEffect, useRef, useState } from "react";

const HUB = "https://www.terrainfinity.ca";
const HUB_PNG = "https://www.terrainfinity.ca/brand/ti-logo.png";
const HUB_WEBM = "https://www.terrainfinity.ca/brand/ti-logo-click.webm";
const LOCAL_PNG = "/brand/ti-logo.png";
const LOCAL_WEBM = "/brand/ti-logo-click.webm";
const HOLD_MS = 320;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hasFineHover() {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function TiNetworkMark({ size = 48, className, plate = false }: { size?: number; className?: string; plate?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const holdRef = useRef(0);
  const suppressClick = useRef(false);
  const [png, setPng] = useState(HUB_PNG);
  const [webm, setWebm] = useState(HUB_WEBM);
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => window.clearTimeout(holdRef.current), []);

  function playAnim() {
    if (prefersReducedMotion()) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.playsInline = true;
    video.loop = false;
    video.playbackRate = 2;
    try {
      video.currentTime = 0;
    } catch {
      /* ignore */
    }
    const play = video.play();
    if (play) void play.then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  function goHub() {
    window.location.assign(HUB);
  }

  return (
    <a
      href={HUB}
      aria-label="Terra Infinity home"
      className={className}
      style={{
        position: "relative",
        display: "inline-flex",
        width: size,
        height: size,
        flexShrink: 0,
        overflow: "hidden",
        ...(plate
          ? { background: "#2a1836", borderRadius: 10, boxShadow: "inset 0 0 0 1px rgba(255, 209, 236, 0.45)" }
          : null),
      }}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        goHub();
      }}
      onMouseEnter={() => {
        if (hasFineHover()) playAnim();
      }}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse") return;
        window.clearTimeout(holdRef.current);
        holdRef.current = window.setTimeout(() => {
          playAnim();
          suppressClick.current = true;
        }, HOLD_MS);
      }}
      onPointerUp={() => window.clearTimeout(holdRef.current)}
      onPointerCancel={() => window.clearTimeout(holdRef.current)}
      onContextMenu={(event) => event.preventDefault()}
    >
      <img
        src={png}
        alt=""
        draggable={false}
        style={{
          position: "absolute",
          inset: plate ? 3 : 0,
          width: plate ? "calc(100% - 6px)" : "100%",
          height: plate ? "calc(100% - 6px)" : "100%",
          objectFit: "contain",
          pointerEvents: "none",
          opacity: playing ? 0 : 1,
          transition: "opacity 150ms ease",
        }}
        onError={() => {
          if (png !== LOCAL_PNG) setPng(LOCAL_PNG);
        }}
      />
      <video
        ref={videoRef}
        src={webm}
        muted
        playsInline
        preload="metadata"
        aria-hidden
        disablePictureInPicture
        disableRemotePlayback
        loop={false}
        style={{
          position: "absolute",
          inset: plate ? 3 : 0,
          width: plate ? "calc(100% - 6px)" : "100%",
          height: plate ? "calc(100% - 6px)" : "100%",
          objectFit: "contain",
          pointerEvents: "none",
          opacity: playing ? 1 : 0,
          transition: "opacity 150ms ease",
        }}
        onEnded={() => {
          const video = videoRef.current;
          if (video) {
            video.pause();
            try {
              video.currentTime = 0;
            } catch {
              /* ignore */
            }
          }
          setPlaying(false);
        }}
        onError={() => {
          if (webm !== LOCAL_WEBM) setWebm(LOCAL_WEBM);
        }}
      />
    </a>
  );
}
