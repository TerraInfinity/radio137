import { useEffect, useState } from "react";
import { clearSettledConverts, removeQueuedConvert, useConvertQueue } from "@/lib/convert-queue";

export function ConvertQueueBar() {
  const jobs = useConvertQueue();
  const [bottom, setBottom] = useState(112);
  useEffect(() => {
    const dock = document.querySelector(".player-dock");
    if (!dock) return;
    const measure = () => setBottom(Math.ceil(dock.getBoundingClientRect().height) + 8);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(dock);
    return () => observer.disconnect();
  }, [jobs.length]);
  if (jobs.length === 0) return null;
  const active = jobs.find((job) => job.state === "active");
  const queued = jobs.filter((job) => job.state === "queued");
  const failed = jobs.filter((job) => job.state === "error");
  const done = jobs.filter((job) => job.state === "done").length;
  const width = Math.max(2, Math.round((active?.ratio ?? (done && !queued.length ? 1 : 0)) * 100));

  return (
    <div className="pointer-events-none fixed inset-x-0 z-40 px-3" style={{ bottom }}>
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-lg border border-line bg-bg/95 p-3 shadow-[var(--shadow-border)] backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate font-display text-base">{active?.title ?? (queued[0]?.title ?? "Convert queue")}</p>
          <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            {queued.length ? `${queued.length} waiting` : done ? `${done} done` : ""}
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={width} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-gold transition-[width] duration-200" style={{ width: `${width}%` }} />
        </div>
        <p className="mt-1 text-sm text-muted">{active?.label ?? (queued.length ? "Next file is queued." : failed[0]?.label ?? "Mp3 is in.")}</p>
        {queued.length ? (
          <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto">
            {queued.map((job) => (
              <li key={job.id} className="flex items-center justify-between gap-3 text-sm text-subtle">
                <span className="min-w-0 truncate">{job.title}</span>
                <button type="button" onClick={() => removeQueuedConvert(job.id)} className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {failed.length ? <p className="mt-2 text-sm text-muted">{failed.length === 1 ? failed[0]?.label : `${failed.length} files failed. ${failed[0]?.label ?? ""}`}</p> : null}
        {done || failed.length ? (
          <button type="button" onClick={clearSettledConverts} className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
            Clear finished
          </button>
        ) : null}
      </div>
    </div>
  );
}
