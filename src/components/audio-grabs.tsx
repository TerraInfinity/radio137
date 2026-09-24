import { useState } from "react";
import { cancelActiveGrab, enqueueGrabs, formatBytes, resumeGrabs, saveGrab, saveKeptGrabs, useGrabs, type GrabRequest } from "@/lib/download-queue";

export function AudioGrabs({ slug, items }: { slug: string; items: GrabRequest[] }) {
  const grabs = useGrabs().filter((job) => job.slug === slug);
  const [hint, setHint] = useState("");
  const running = grabs.some((job) => job.state === "active" || job.state === "queued");
  const failed = grabs.some((job) => job.state === "error");
  const kept = grabs.some((job) => job.state === "kept");

  return (
    <section className="mt-8">
      <button
        type="button"
        disabled={items.length === 0 || running}
        onClick={() => {
          setHint("");
          void enqueueGrabs(slug, items).catch((error: unknown) => setHint(error instanceof Error ? error.message : "Could not start."));
        }}
        className="inline-flex h-12 items-center rounded-md border border-line px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-gold disabled:opacity-40"
      >
        {running ? "Downloading…" : "Download the audio"}
      </button>
      <p className="mt-2 max-w-prose text-sm text-muted">
        One song at a time. A finished song stays if the next one stops. Resume continues the unfinished file instead of starting it over.
      </p>
      {failed ? (
        <button type="button" onClick={() => resumeGrabs(slug)} className="mt-3 mr-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          Resume
        </button>
      ) : null}
      {running ? (
        <button type="button" onClick={cancelActiveGrab} className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
          Pause
        </button>
      ) : null}
      {kept ? (
        <button
          type="button"
          onClick={() => void saveKeptGrabs(slug).catch(() => setHint("Save them one at a time. The songs already downloaded are still here."))}
          className="mt-3 ml-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
        >
          Save finished
        </button>
      ) : null}
      {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
      {grabs.length ? (
        <ul className="mt-4 grid gap-2">
          {grabs.map((job) => {
            const ratio = job.total > 0 ? Math.min(1, job.received / job.total) : job.state === "kept" || job.state === "saved" ? 1 : 0;
            return (
              <li key={job.id} className="rounded-xl bg-bg-elevated px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm">{job.title}</span>
                  <span className="shrink-0 font-mono text-[10px] tabular-nums text-subtle">
                    {job.total > 0 ? `${formatBytes(job.received)} / ${formatBytes(job.total)}` : formatBytes(job.received)}
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-bg">
                  <div className="h-full bg-gold" style={{ width: `${Math.round(ratio * 100)}%` }} />
                </div>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                  {job.state === "active" ? "Downloading" : job.state === "queued" ? "Waiting" : job.state === "saved" ? "On the device" : job.state === "kept" ? "Kept here" : "Stopped"}
                  {job.detail ? ` · ${job.detail}` : ""}
                </p>
                {job.state === "kept" || job.state === "error" ? (
                  <button type="button" onClick={() => void saveGrab(job.id).catch((error: unknown) => setHint(error instanceof Error ? error.message : "Could not save."))} className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
                    {job.state === "error" ? "Save what landed" : "Save"}
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
