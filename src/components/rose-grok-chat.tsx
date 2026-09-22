import { useEffect, useRef, useState } from "react";
import { MessageSquare, Pin, Send, X } from "lucide-react";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getSeedCatalog } from "@/lib/catalog";
import { patchStationTrack, saveStation } from "@/lib/desk-api";
import { mergeSceneTags } from "@/lib/phenomena";
import { mergeLookTags, type RoseLook } from "@/lib/rose-look";
import { ROSE_GROK_STARTERS, threadStorageKey, type GrokChatMessage } from "@/lib/rose-grok";
import { directRoseLook } from "@/lib/rose-grok-api";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel, Track } from "@/lib/types";

function readThread(key: string): GrokChatMessage[] {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GrokChatMessage[];
    return Array.isArray(parsed) ? parsed.slice(-16) : [];
  } catch {
    return [];
  }
}

export function RoseGrokChat({
  channel,
  track,
  look,
  onLook,
  onClose,
}: {
  channel: Channel;
  track?: Track | null;
  look: RoseLook;
  onLook: (next: RoseLook) => void;
  onClose: () => void;
}) {
  const lookRef = useRef(look);
  lookRef.current = look;
  const key = threadStorageKey(channel.slug, track?.id);
  const [messages, setMessages] = useState<GrokChatMessage[]>(() => (typeof window === "undefined" ? [] : readThread(key)));
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(readThread(key));
    setHint("");
  }, [key]);

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(messages.slice(-16)));
    } catch {
      /* quota */
    }
  }, [key, messages]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  async function pinSong(next: RoseLook) {
    if (!track) {
      setHint("Play a song first, then pin.");
      return;
    }
    setBusy(true);
    setHint("Pinning this song…");
    try {
      const result = await patchStationTrack({
        data: {
          channelSlug: channel.slug,
          trackId: track.id,
          tags: mergeSceneTags(track.tags, next),
        },
      });
      usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
      setHint(`Pinned to ${track.title}.`);
    } catch (error) {
      setHint(error instanceof Error ? error.message : "Could not pin this song");
    } finally {
      setBusy(false);
    }
  }

  async function saveStationLook(next: RoseLook) {
    setBusy(true);
    setHint("Saving station look…");
    try {
      const result = await saveStation({
        data: {
          slug: channel.slug,
          tags: mergeLookTags(channel.tags, next),
          cover: next.stillUrls[0] || channel.cover,
          animationUrl: next.loopUrl || undefined,
          videoUrl: next.loopUrl || undefined,
        },
      });
      usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
      setHint("Station look is live.");
    } catch (error) {
      setHint(error instanceof Error ? error.message : "Could not save station look");
    } finally {
      setBusy(false);
    }
  }

  async function send(text: string) {
    const prompt = text.trim();
    if (!prompt || busy) return;
    setDraft("");
    const history = messages.slice(-8);
    setMessages((list) => [...list, { role: "user", content: prompt }]);
    setBusy(true);
    setHint("Grok is directing…");
    try {
      const result = await directRoseLook({
        data: {
          prompt,
          stationSlug: channel.slug,
          trackId: track?.id,
          trackTitle: track?.title,
          artist: track?.artist,
          look: lookRef.current,
          history,
        },
      });
      if (!result.ok) {
        setMessages((list) => [...list, { role: "assistant", content: result.error }]);
        setHint(result.error);
        return;
      }
      if (result.changed) onLook(result.look);
      setMessages((list) => [...list, { role: "assistant", content: result.reply }]);
      if (result.pin) {
        if (track) await pinSong(result.look);
        else await saveStationLook(result.look);
      } else {
        setHint(result.changed ? "Live on the stage. Pin the song to keep it." : "No look change.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Grok could not reach the stage.";
      setMessages((list) => [...list, { role: "assistant", content: message }]);
      setHint(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="rose-grok" aria-label="Grok director">
      <div className="rose-desk-bar">
        <p className="rose-desk-kicker">
          <MessageSquare className="size-3.5" />
          Grok · {track?.title || "Station look"}
        </p>
        <button type="button" className="rose-opera-ghost" onClick={onClose} aria-label="Close Grok">
          <X className="size-4" />
        </button>
      </div>
      <p className="rose-atelier-note">Talk the rite into shape. Changes land live on this cut; pin to keep them after refresh.</p>
      <div ref={logRef} className="rose-grok-log">
        {messages.length === 0 ? (
          <p className="rose-atelier-hint">No thread yet for this song. Try a starter, or describe the phenomenon you want.</p>
        ) : (
          messages.map((item, index) => (
            <p key={`${item.role}-${index}`} className={item.role === "user" ? "rose-grok-you" : "rose-grok-them"}>
              {item.content}
            </p>
          ))
        )}
      </div>
      <div className="rose-atelier-presets">
        {ROSE_GROK_STARTERS.map((line) => (
          <button key={line} type="button" className="rose-opera-ghost" disabled={busy} onClick={() => void send(line)}>
            {line}
          </button>
        ))}
      </div>
      <form
        className="rose-grok-form"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        <label className="sr-only" htmlFor="rose-grok-input">
          Direct this song
        </label>
        <textarea
          id="rose-grok-input"
          rows={2}
          value={draft}
          disabled={busy}
          placeholder="Tell Grok how this song should look…"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void send(draft);
            }
          }}
        />
        <button type="submit" className="rose-opera-begin" disabled={busy || !draft.trim()}>
          <Send className="size-3.5" />
          Send
        </button>
      </form>
      <div className="rose-atelier-save">
        <button type="button" className="rose-opera-ghost" disabled={busy || !track} onClick={() => void pinSong(look)}>
          <Pin className="size-3.5" />
          Pin this song
        </button>
        <button type="button" className="rose-opera-ghost" disabled={busy} onClick={() => void saveStationLook(look)}>
          Save station look
        </button>
      </div>
      {hint ? <p className="rose-atelier-hint">{hint}</p> : null}
    </aside>
  );
}
