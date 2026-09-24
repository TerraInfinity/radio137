import { useMemo, useState } from "react";
import { enqueueWavConverts, useConvertQueue } from "@/lib/convert-queue";
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
  const jobs = useConvertQueue();
  const shown = notes.slice(0, SHOWN);
  const rest = notes.length - shown.length;
  const converts = notes.filter((note) => note.action?.kind === "convert" && note.action.audioUrl);

  async function fix(note: PerfNote) {
    if (!note.action) return;
    if (note.action.kind === "convert") {
      enqueueWavConverts([
        { title: note.title, channelSlug: note.action.channelSlug, trackId: note.action.trackId, audioUrl: note.action.audioUrl },
      ]);
      setHint("Queued. The bar keeps the progress.");
      return;
    }
    setBusyId(note.id);
    setHint("");
    try {
      const result = await shareSongAudio({
        data: { channelSlug: note.action.channelSlug, trackId: note.action.trackId, convert: false },
      });
      if (result.tracks) {
        usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations ?? []));
      }
      setHint("Every copy now uses that file.");
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
            {converts.length > 1 ? (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    enqueueWavConverts(
                      converts.flatMap((note) =>
                        note.action
                          ? [{ title: note.title, channelSlug: note.action.channelSlug, trackId: note.action.trackId, audioUrl: note.action.audioUrl }]
                          : [],
                      ),
                    );
                    setHint("Queued. The bar keeps the progress.");
                  }}
                  className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg"
                >
                  Queue all {converts.length}
                </button>
              </li>
            ) : null}
            {shown.map((note) => (
              <li key={note.id} className="grid gap-1">
                <p className="font-display text-lg">{note.title}</p>
                <p className="text-sm text-muted">{note.detail}</p>
                <p className="text-sm">{note.steps}</p>
                {note.action ? (
                  <button
                    type="button"
                    disabled={note.action.kind === "share" ? busyId !== null : jobs.some((job) => job.trackId === note.action?.trackId && (job.state === "queued" || job.state === "active"))}
                    onClick={() => void fix(note)}
                    className="mt-1 inline-flex h-11 w-fit items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold disabled:opacity-40"
                  >
                    {note.action.kind === "convert"
                      ? jobs.find((job) => job.trackId === note.action?.trackId)?.state === "active"
                        ? "Encoding…"
                        : jobs.some((job) => job.trackId === note.action?.trackId && job.state === "queued")
                          ? "Queued"
                          : "Queue mp3"
                      : busyId === note.id
                        ? "Working…"
                        : "Use one file"}
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
