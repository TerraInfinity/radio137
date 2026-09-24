import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { enqueueWavConverts, onConvertFinished, useConvertQueue } from "@/lib/convert-queue";
import { hideStationTrack, listRoseLibrary, reprobeRoseTrack } from "@/lib/desk-api";
import { formatClock } from "@/lib/cn";
import { useRadioUser } from "@/lib/radio-user";

type Row = {
  id: string;
  title: string;
  key: string;
  format: string;
  bytes: number;
  durationSec: number;
  inFeed: boolean;
  group: string;
  audioUrl: string;
};

export const Route = createFileRoute("/desk/library/rose")({
  component: RoseLibraryPage,
  head: () => ({ meta: [{ title: "Rose library · Desk" }] }),
});

function RoseLibraryPage() {
  const { isAdmin, isPending, user } = useRadioUser();
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const jobs = useConvertQueue();

  async function load() {
    const data = await listRoseLibrary();
    setRows(data.rows);
  }

  useEffect(() => {
    if (!isAdmin) return;
    void load().catch((err) => setError(err instanceof Error ? err.message : "Could not read Rose"));
    return onConvertFinished(() => {
      void load().catch(() => undefined);
    });
  }, [isAdmin]);

  function queue(row: Row) {
    enqueueWavConverts([{ title: row.title, channelSlug: "rose", trackId: row.id, audioUrl: row.audioUrl }]);
  }

  const wavs = rows.filter((row) => row.format === "wav" || row.format === "aiff" || row.format === "aif");

  async function reprobe(row: Row) {
    setBusy(row.id);
    setError("");
    try {
      await reprobeRoseTrack({ data: { trackId: row.id } });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not probe");
    } finally {
      setBusy("");
    }
  }

  async function hide(row: Row) {
    if (!window.confirm(`Hide “${row.title}” from Rose? The file stays on R2.`)) return;
    setBusy(row.id);
    setError("");
    try {
      const result = await hideStationTrack({ data: { channelSlug: "rose", trackId: row.id, audioUrl: row.audioUrl } });
      const { applyCatalogEdits } = await import("@/lib/catalog-edits");
      const { getSeedCatalog } = await import("@/lib/catalog");
      const { usePlayerStore } = await import("@/lib/player-store");
      usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), result.tracks, result.stations));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not hide");
    } finally {
      setBusy("");
    }
  }

  if (isPending && !user) return <p className="px-4 py-10 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Checking the door.</p>;
  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <p className="text-muted">This list is for the desk.</p>
        <Link to="/desk" className="mt-4 inline-flex text-gold">
          Desk
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Rose library</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">One mp3 for the feed</h1>
      <p className="mt-3 max-w-prose text-muted">
        Apple only receives mp3. A wav stays on R2 until you convert it. The feed uses the probed length, not the old one-minute guess.
      </p>
      <Link to="/desk" className="mt-4 inline-flex font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
        Back to the desk
      </Link>
      {error ? <p className="mt-4 text-sm text-muted">{error}</p> : null}
      {wavs.length ? (
        <button
          type="button"
          onClick={() =>
            enqueueWavConverts(wavs.map((row) => ({ title: row.title, channelSlug: "rose", trackId: row.id, audioUrl: row.audioUrl })))
          }
          className="mt-4 inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg"
        >
          Queue all {wavs.length} wavs
        </button>
      ) : null}
      <ul className="mt-6 divide-y divide-line">
        {rows.map((row) => (
          <li key={row.id} className="grid gap-1 py-3 text-sm">
            <p className="font-display text-lg">{row.title}</p>
            <p className="break-all font-mono text-[10px] uppercase tracking-[0.06em] text-subtle">{row.key}</p>
            <p className="text-muted">
              {row.format} · {row.bytes > 0 ? `${row.bytes} bytes` : "no length"} · {row.durationSec > 0 ? formatClock(row.durationSec) : "no probe"} ·{" "}
              {row.inFeed ? "in the feed" : "hidden from the feed"}
              {row.group ? ` · duplicate ${row.group}` : ""}
            </p>
            {row.format === "wav" || row.format === "aiff" || row.format === "aif" ? (
              <button
                type="button"
                disabled={jobs.some((job) => job.trackId === row.id && (job.state === "queued" || job.state === "active"))}
                onClick={() => queue(row)}
                className="mt-1 inline-flex h-10 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold disabled:opacity-40"
              >
                {jobs.find((job) => job.trackId === row.id)?.state === "active"
                  ? "Encoding…"
                  : jobs.some((job) => job.trackId === row.id && job.state === "queued")
                    ? "Queued"
                    : "Queue WAV → MP3"}
              </button>
            ) : null}
            <button
              type="button"
              disabled={busy === row.id}
              onClick={() => void reprobe(row)}
              className="inline-flex h-10 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold disabled:opacity-40"
            >
              Re-probe
            </button>
            {row.group ? (
              <button
                type="button"
                disabled={busy === row.id}
                onClick={() => void hide(row)}
                className="inline-flex h-10 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-subtle disabled:opacity-40"
              >
                Hide duplicate
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
