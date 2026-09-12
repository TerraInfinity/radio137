import { useEffect, useState } from "react";
import { getChannel, stationSkin } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { listStationChat, postStationChat } from "@/lib/social-api";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";

type Line = { id: number; author: string; body: string; createdAt: string };

export function StationChat({ slug }: { slug: string }) {
  const { user } = useRadioUser();
  const identity = usePlayerStore((s) => s.identity);
  const setIdentityName = usePlayerStore((s) => s.setIdentityName);
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channel = getChannel(slug);
  const skin = channel ? stationSkin(channel) : "none";

  useEffect(() => {
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
    const timer = window.setInterval(pull, 5000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [slug]);

  const handle = (user?.name || user?.email || identity?.name || "").trim();

  return (
    <section className={cn("mt-6 overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-border)]", skin === "glaum" && "glaum-panel")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-full items-center justify-between px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle"
      >
        Desk chat {lines.length ? `· ${lines.length}` : ""}
        <span className="text-gold">{open ? "Close" : "Open"}</span>
      </button>
      {open ? (
        <div className="border-t border-line p-3">
          <ul className="max-h-56 space-y-2 overflow-y-auto">
            {lines.length === 0 ? <li className="text-sm text-muted">The room is quiet. Leave a line for the desk.</li> : null}
            {lines.map((line) => (
              <li key={line.id}>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{line.author}</p>
                <p className="text-sm text-fg">{line.body}</p>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              const name = handle || identity?.name || "";
              if (!name.trim()) return;
              if (!body.trim()) return;
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
    </section>
  );
}
