import { useMemo, useState } from "react";
import { shareSongAudio } from "@/lib/desk-api";
import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getSeedCatalog } from "@/lib/catalog";
import { performanceNotes, type PerfNote } from "@/lib/desk-performance";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel } from "@/lib/types";

const SHOWN = 5;

export function DeskPerformance({ channels }: { channels: Channel[] }) {
  const notes = useMemo(() => performanceNotes(channels), [channels]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const shown = notes.slice(0, SHOWN);
  const rest = notes.length - shown.length;

  async function fix(note: PerfNote) {
    if (!note.action) return;
    setBusyId(note.id);
    setHint("");
    try {
      const result = await shareSongAudio({
        data: { channelSlug: note.action.channelSlug, trackId: note.action.trackId, convert: note.action.kind === "convert" },
      });
      if (result.tracks) {
        usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations ?? []));
      }
      setHint(note.action.kind === "convert" ? "Mp3 is in. The other copies follow it." : "Every copy now uses that file.");
    } catch (error) {
      setHint(error instanceof Error ? error.message : "Could not fix that file");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-6 border border-line px-4 py-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Playback</p>
      {notes.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Songs are mp3s, and shared names use one file. Nothing for you to fix.</p>
      ) : (
        <>
          <p className="mt-2 max-w-prose text-sm text-muted">
            The experience already loads the next scene while a song plays. These files still make it wait.
          </p>
          <ul className="mt-4 grid gap-4">
            {shown.map((note) => (
              <li key={note.id} className="grid gap-1">
                <p className="font-display text-lg">{note.title}</p>
                <p className="text-sm text-muted">{note.detail}</p>
                <p className="text-sm">{note.steps}</p>
                {note.action ? (
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => void fix(note)}
                    className="mt-1 inline-flex h-11 w-fit items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
                  >
                    {busyId === note.id ? "Working…" : note.action.kind === "convert" ? "Convert to mp3" : "Use one file"}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          {rest > 0 ? (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
              {rest} more in Stations. Open the song and use the same button there.
            </p>
          ) : null}
        </>
      )}
      {hint ? <p className="mt-3 text-sm text-gold">{hint}</p> : null}
    </section>
  );
}
