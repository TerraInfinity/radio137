import { normalizeKind } from "@/lib/catalog";
import type { Channel, StationKind } from "@/lib/types";

export type ListenMode = "stream" | "ondemand";

export function parseListenMode(value: string | null | undefined): ListenMode | null {
  const raw = (value || "").toLowerCase().trim();
  if (raw === "stream" || raw === "live" || raw === "clock") return "stream";
  if (raw === "ondemand" || raw === "on-demand" || raw === "demand" || raw === "vault") return "ondemand";
  return null;
}

/** Session override from ?listen=stream or #stream — does not rewrite the saved default. */
export function listenModeFromLocation(search = "", hash = ""): ListenMode | null {
  try {
    const q = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    const fromQuery = parseListenMode(q.get("listen") || q.get("mode"));
    if (fromQuery) return fromQuery;
  } catch {
    /* ignore */
  }
  const token = hash.replace(/^#/, "").split("&")[0];
  return parseListenMode(token);
}

/**
 * How this listener hears this desk.
 * Desk kind wins for fixed / vault. Live desks honor stream vs on-demand overlay.
 */
export function effectiveKind(channel: Channel | undefined | null, listenMode: ListenMode): StationKind {
  if (!channel) return "live";
  const desk = normalizeKind(channel.kind || channel.mode);
  if (desk === "fixed" || desk === "ondemand") return desk;
  return listenMode === "stream" ? "live" : "ondemand";
}

export function isOnDemandOverlay(channel: Channel | undefined | null, listenMode: ListenMode): boolean {
  if (!channel) return false;
  return normalizeKind(channel.kind || channel.mode) === "live" && listenMode === "ondemand";
}

export function isStreamingLive(channel: Channel | undefined | null, listenMode: ListenMode): boolean {
  if (!channel) return false;
  return normalizeKind(channel.kind || channel.mode) === "live" && listenMode === "stream";
}

export function listenModeLabel(mode: ListenMode): string {
  return mode === "stream" ? "Streaming" : "On demand";
}

export function listenModeHint(mode: ListenMode): string {
  if (mode === "stream") return "Join the shared station clock when the desk is live.";
  return "Your own pace. Skip and seek freely. Jump to live when you want the clock.";
}
