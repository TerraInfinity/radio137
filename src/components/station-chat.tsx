import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, GripHorizontal, X } from "lucide-react";
import { getChannel, stationSkin } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { listStationChat, postStationChat } from "@/lib/social-api";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";

type Line = { id: number; author: string; body: string; createdAt: string };

const CHAT_KEY = "radio.chat.dock.v1";
const COLLAPSED_FALLBACK_W = 168;
const OPEN_W = 300;
const OPEN_H = 360;
const BAR_H = 44;
const SLIVER_W = 44;
const SLIVER_H = 56;
const PAD = 12;

type DockMem = { open: boolean; hidden: boolean; nx: number; ny: number };

function clamp01(n: number) {
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 1;
}

function loadDock(): DockMem {
  if (typeof window === "undefined") return { open: false, hidden: false, nx: 1, ny: 1 };
  try {
    const raw = window.localStorage.getItem(CHAT_KEY);
    if (!raw) return { open: false, hidden: false, nx: 1, ny: 1 };
    const parsed = JSON.parse(raw) as Partial<DockMem>;
    return {
      open: Boolean(parsed.open),
      hidden: Boolean(parsed.hidden),
      nx: clamp01(Number(parsed.nx)),
      ny: clamp01(Number(parsed.ny)),
    };
  } catch {
    return { open: false, hidden: false, nx: 1, ny: 1 };
  }
}

function saveDock(mem: DockMem) {
  try {
    window.localStorage.setItem(CHAT_KEY, JSON.stringify(mem));
  } catch {
    /* ignore */
  }
}

function slot(opts: { open: boolean; hidden: boolean; measuredW?: number }) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const header = document.querySelector("header");
  const dock = document.querySelector(".player-dock") || document.querySelector(".player-sliver");
  const topMin = (header ? header.getBoundingClientRect().bottom : 56) + PAD;
  const botMax = (dock ? dock.getBoundingClientRect().top : vh - 96) - PAD;
  if (opts.hidden) {
    const w = SLIVER_W;
    const h = SLIVER_H;
    const y0 = topMin;
    const y1 = Math.max(topMin, botMax - h);
    return { w, h, x0: 0, x1: Math.max(0, vw - w), y0, y1 };
  }
  const w = opts.open
    ? Math.min(OPEN_W, Math.max(220, vw - PAD * 2))
    : Math.min(Math.max(opts.measuredW || COLLAPSED_FALLBACK_W, 120), vw - PAD * 2);
  const maxH = Math.max(BAR_H, botMax - topMin);
  const h = opts.open ? Math.min(OPEN_H, Math.max(BAR_H + 88, maxH)) : BAR_H;
  const x0 = PAD;
  const x1 = Math.max(PAD, vw - PAD - w);
  const y0 = topMin;
  const y1 = Math.max(topMin, botMax - h);
  return { w, h, x0, x1, y0, y1 };
}

export function StationChat({ slug }: { slug: string }) {
  const { user } = useRadioUser();
  const identity = usePlayerStore((s) => s.identity);
  const setIdentityName = usePlayerStore((s) => s.setIdentityName);
  const hasPlayer = usePlayerStore((s) => Boolean(s.track));
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hostRef = useRef<HTMLElement>(null);
  const openRef = useRef(false);
  const hiddenRef = useRef(false);
  const nxRef = useRef(1);
  const nyRef = useRef(1);
  const dragRef = useRef<{ pointer: number; dx: number; dy: number; nx: number; ny: number } | null>(null);
  const unbindRef = useRef<(() => void) | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const channel = getChannel(slug);
  const skin = channel ? stationSkin(channel) : "none";

  function paint(nextOpen = openRef.current, nextHidden = hiddenRef.current, nextNx = nxRef.current, nextNy = nyRef.current) {
    const host = hostRef.current;
    if (!host) return;
    const measured = nextOpen || nextHidden ? undefined : host.offsetWidth;
    const s = slot({ open: nextOpen, hidden: nextHidden, measuredW: measured });
    const left = Math.round(s.x0 + nextNx * (s.x1 - s.x0));
    const top = Math.round(s.y0 + nextNy * (s.y1 - s.y0));
    host.style.left = `${left}px`;
    host.style.top = `${top}px`;
    if (nextHidden) {
      host.style.width = `${s.w}px`;
      host.style.height = `${s.h}px`;
    } else if (nextOpen) {
      host.style.width = `${s.w}px`;
      host.style.height = `${s.h}px`;
    } else {
      host.style.width = "auto";
      host.style.height = `${BAR_H}px`;
    }
  }

  useLayoutEffect(() => {
    const mem = loadDock();
    openRef.current = mem.open;
    hiddenRef.current = mem.hidden;
    nxRef.current = mem.nx;
    nyRef.current = mem.ny;
    setOpen(mem.open);
    setHidden(mem.hidden);
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!mounted) return;
    openRef.current = open;
    hiddenRef.current = hidden;
    paint();
  }, [mounted, open, hidden, hasPlayer]);

  useEffect(() => {
    if (!mounted) return;
    const relayout = () => {
      if (dragRef.current) return;
      paint();
    };
    relayout();
    const host = hostRef.current;
    const dock = document.querySelector(".player-dock");
    const header = document.querySelector("header");
    const ro = new ResizeObserver(relayout);
    if (host) ro.observe(host);
    if (dock) ro.observe(dock);
    if (header) ro.observe(header);
    window.addEventListener("resize", relayout);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", relayout);
    };
  }, [mounted, hasPlayer, hidden]);

  useEffect(() => {
    if (!mounted || hidden || !open) return;
    let alive = true;
    const pull = () => {
      void listStationChat({ data: { slug } })
        .then((rows) => {
          if (alive) setLines(rows);
        })
        .catch(() => {
          /* quiet */
        });
    };
    pull();
    const timer = window.setInterval(pull, 20_000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [slug, mounted, open, hidden]);

  useEffect(() => {
    const el = listRef.current;
    if (!el || !open || hidden) return;
    el.scrollTop = el.scrollHeight;
  }, [lines, open, hidden]);

  useEffect(() => () => unbindRef.current?.(), []);

  const handle = (user?.name || user?.email || identity?.name || "").trim();

  function persist() {
    saveDock({ open: openRef.current, hidden: hiddenRef.current, nx: nxRef.current, ny: nyRef.current });
  }

  function toggleOpen() {
    const next = !openRef.current;
    openRef.current = next;
    setOpen(next);
    persist();
  }

  function hideChat() {
    hiddenRef.current = true;
    nxRef.current = nxRef.current >= 0.5 ? 1 : 0;
    setHidden(true);
    persist();
  }

  function showChat() {
    hiddenRef.current = false;
    setHidden(false);
    persist();
  }

  function onBarDown(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button, a, input, textarea, select")) return;
    event.preventDefault();
    event.stopPropagation();
    const host = hostRef.current;
    const bar = event.currentTarget;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const pointer = event.pointerId;
    dragRef.current = {
      pointer,
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
      nx: nxRef.current,
      ny: nyRef.current,
    };
    host.classList.add("desk-chat-dragging");
    try {
      bar.setPointerCapture(pointer);
    } catch {
      /* iOS may ignore capture */
    }

    unbindRef.current?.();

    const move = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || e.pointerId !== d.pointer) return;
      if (e.cancelable) e.preventDefault();
      const measured = openRef.current || hiddenRef.current ? undefined : host.offsetWidth;
      const s = slot({ open: openRef.current, hidden: hiddenRef.current, measuredW: measured });
      const left = e.clientX - d.dx;
      const top = e.clientY - d.dy;
      const nxNext = s.x1 === s.x0 ? d.nx : Math.min(1, Math.max(0, (left - s.x0) / (s.x1 - s.x0)));
      const nyNext = s.y1 === s.y0 ? d.ny : Math.min(1, Math.max(0, (top - s.y0) / (s.y1 - s.y0)));
      d.nx = nxNext;
      d.ny = nyNext;
      host.style.left = `${Math.round(s.x0 + nxNext * (s.x1 - s.x0))}px`;
      host.style.top = `${Math.round(s.y0 + nyNext * (s.y1 - s.y0))}px`;
      if (openRef.current || hiddenRef.current) {
        host.style.width = `${s.w}px`;
        host.style.height = `${s.h}px`;
      }
    };

    const up = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || (e.type !== "pointercancel" && e.pointerId !== d.pointer)) return;
      nxRef.current = d.nx;
      nyRef.current = d.ny;
      dragRef.current = null;
      host.classList.remove("desk-chat-dragging");
      persist();
      paint();
      unbindRef.current?.();
      unbindRef.current = null;
      try {
        if (bar.hasPointerCapture?.(d.pointer)) bar.releasePointerCapture(d.pointer);
      } catch {
        /* ignore */
      }
    };

    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", up);
    bar.addEventListener("pointercancel", up);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    unbindRef.current = () => {
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", up);
      bar.removeEventListener("pointercancel", up);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }

  if (!mounted || typeof document === "undefined") return null;

  const onRight = nxRef.current >= 0.5;
  const hideBtn = (
    <button
      type="button"
      onClick={hideChat}
      className="grid size-11 shrink-0 place-items-center text-subtle hover:text-fg"
      aria-label="Hide desk chat"
      title="Hide chat"
    >
      <X className="size-4" />
    </button>
  );

  const node = hidden ? (
    <button
      ref={hostRef as React.RefObject<HTMLButtonElement>}
      type="button"
      className={cn(
        "desk-chat desk-chat-sliver",
        onRight ? "desk-chat-sliver-right" : "desk-chat-sliver-left",
        skin === "glaum" && "desk-chat-glaum",
      )}
      onClick={showChat}
      aria-label="Show desk chat"
      title="Show chat"
    >
      <span className="desk-chat-sliver-rail" aria-hidden />
      {onRight ? (
        <ChevronLeft className="desk-chat-sliver-mark size-4" />
      ) : (
        <ChevronRight className="desk-chat-sliver-mark size-4" />
      )}
    </button>
  ) : (
    <aside
      ref={hostRef}
      className={cn(
        "desk-chat",
        open ? "desk-chat-open" : "desk-chat-collapsed",
        skin === "glaum" && "glaum-panel desk-chat-glaum",
      )}
      data-open={open ? "true" : "false"}
      aria-label="Desk chat"
    >
      <div className="desk-chat-bar" onPointerDown={onBarDown}>
        <GripHorizontal className="size-4 shrink-0 text-subtle" aria-hidden />
        <p className="min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
          Desk chat{lines.length ? ` · ${lines.length}` : ""}
        </p>
        <button
          type="button"
          onClick={toggleOpen}
          aria-expanded={open}
          className="inline-flex h-11 shrink-0 items-center px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-gold"
        >
          {open ? "Close" : "Open"}
        </button>
        {hideBtn}
      </div>
      {open ? (
        <div className="desk-chat-body">
          <ul ref={listRef} className="desk-chat-lines">
            {lines.length === 0 ? (
              <li className="text-sm text-muted">The room is quiet. Leave a line for the desk.</li>
            ) : null}
            {lines.map((line) => (
              <li key={line.id}>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{line.author}</p>
                <p className="text-sm text-fg">{line.body}</p>
              </li>
            ))}
          </ul>
          <form
            className="desk-chat-form"
            onSubmit={(event) => {
              event.preventDefault();
              const name = handle || identity?.name || "";
              if (!name.trim() || !body.trim()) return;
              setBusy(true);
              setError(null);
              void postStationChat({ data: { slug, author: name.trim(), body: body.trim() } })
                .then((rows) => {
                  setLines(rows);
                  setBody("");
                })
                .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not send"))
                .finally(() => setBusy(false));
            }}
          >
            {!handle ? (
              <input
                className="input"
                value={identity?.name ?? ""}
                onChange={(event) => setIdentityName(event.target.value)}
                placeholder="Handle"
              />
            ) : null}
            {error ? <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ember">{error}</p> : null}
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="A line for the desk…"
                maxLength={280}
              />
              <button
                type="submit"
                disabled={busy || !body.trim() || !(handle || identity?.name)}
                className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </aside>
  );

  return createPortal(node, document.body);
}
