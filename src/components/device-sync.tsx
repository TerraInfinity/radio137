import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { renderSVG } from "uqr";
import { useRoseFeed } from "@/components/rose-apple";
import { getPlayableTracks, publicChannels } from "@/lib/catalog";
import { applePodcastUrl } from "@/lib/rose-feed";
import { detectSyncPath, syncPageUrl, type SyncPath } from "@/lib/sync-path";
import { usePlayerStore } from "@/lib/player-store";
import { zipStore } from "@/lib/zip-store";
import { cn } from "@/lib/cn";

const PATHS: { id: SyncPath; label: string }[] = [
  { id: "apple", label: "iPhone / Watch" },
  { id: "android", label: "Android" },
  { id: "computer", label: "Computer" },
];

function useOrigin() {
  const [origin, setOrigin] = useState("https://radio.terrainfinity.ca");
  useEffect(() => setOrigin(window.location.origin), []);
  return origin;
}

function useTicks(key: string) {
  const [ticks, setTicks] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) || "") as Record<string, boolean>;
      setTicks(parsed && typeof parsed === "object" ? parsed : {});
    } catch {
      setTicks({});
    }
  }, [key]);

  function save(field: string, on: boolean) {
    const next = { ...ticks, [field]: on };
    setTicks(next);
    window.localStorage.setItem(key, JSON.stringify(next));
  }

  function reset() {
    setTicks({});
    window.localStorage.removeItem(key);
  }

  return { ticks, save, reset };
}

function fileName(title: string, index: number): string {
  const clean = title.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim() || `track-${index}`;
  return `${String(index).padStart(2, "0")} ${clean}.mp3`;
}

function Qr({ value, big }: { value: string; big?: boolean }) {
  const svg = useMemo(
    () => (value ? renderSVG(value, { border: 2, pixelSize: big ? 6 : 4, ecc: "M", whiteColor: "#fff", blackColor: "#14080c" }) : ""),
    [value, big],
  );
  if (!svg) return null;
  return <div className={big ? "w-56" : "w-36"} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function DeviceSync({ slug, path, onPath }: { slug: string; path?: SyncPath; onPath: (path: SyncPath) => void }) {
  const catalog = usePlayerStore((s) => s.catalog);
  const channels = catalog.channels.length ? catalog.channels : publicChannels();
  const origin = useOrigin();
  const feed = useRoseFeed();
  const ready = slug === "rose";
  const channel = channels.find((item) => item.slug === slug);
  const title = slug === "rose" ? "Rose" : channel?.name || slug;
  const detected = useMemo(() => detectSyncPath(typeof navigator === "undefined" ? "" : navigator.userAgent), []);
  const selected = path ?? detected;
  const [note, setNote] = useState("");
  const [qrLock, setQrLock] = useState<SyncPath | undefined>(undefined);
  const [packOpen, setPackOpen] = useState(false);
  const [packing, setPacking] = useState("");
  const appleTicks = useTicks(`radio.device-sync.${slug}.apple`);
  const androidTicks = useTicks(`radio.device-sync.${slug}.android`);
  const page = syncPageUrl(origin, slug);
  const qr =
    selected === "apple"
      ? syncPageUrl(origin, slug, "apple")
      : selected === "android"
        ? syncPageUrl(origin, slug, "android")
        : syncPageUrl(origin, slug, qrLock);

  async function copyFeed() {
    try {
      await navigator.clipboard.writeText(feed);
      setNote("Feed copied. Paste it into the app. Do not download the file.");
    } catch {
      setNote("Could not copy. The feed is the https address the app already knows.");
    }
  }

  async function pack() {
    const rose = channels.find((item) => item.slug === "rose");
    const tracks = getPlayableTracks(rose);
    if (tracks.length === 0) {
      setPacking("The rite is not in the catalog yet.");
      return;
    }
    setPacking(`Packing 0 of ${tracks.length}`);
    const files: { name: string; data: Uint8Array }[] = [
      {
        name: "IMPORT.txt",
        data: new TextEncoder().encode(
          "Last resort. Music app on a computer → Import → Sync Library.\nThey then appear in Music on the phone. This is not instant from the phone.\n",
        ),
      },
    ];
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      setPacking(`Packing ${i + 1} of ${tracks.length}`);
      const response = await fetch(track.audioUrl);
      if (!response.ok) {
        setPacking(`Could not fetch ${track.title}.`);
        return;
      }
      files.push({ name: fileName(track.title, i + 1), data: new Uint8Array(await response.arrayBuffer()) });
    }
    const packed = zipStore(files).slice();
    const blob = new Blob([packed.buffer], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rose-rite.zip";
    link.click();
    URL.revokeObjectURL(url);
    setPacking("Packed. Import on a computer, then Sync Library.");
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Device Sync</p>
      <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-muted">{ready ? "Get the rite on your phone. Offline. In order." : "This rite is not ready to send yet."}</p>
      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="How to send it">
        {PATHS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected === item.id}
            onClick={() => onPath(item.id)}
            className={cn(
              "inline-flex h-11 items-center rounded-full px-4 font-mono text-[11px] uppercase tracking-[0.14em]",
              selected === item.id ? "bg-fg text-bg" : "bg-bg-elevated text-muted",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {selected === "apple" ? (
        <section className="mt-8">
          <a
            href={ready ? applePodcastUrl(feed) : undefined}
            className={cn(
              "inline-flex h-12 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
              !ready && "pointer-events-none opacity-40",
            )}
            onClick={(event) => {
              if (!ready) {
                event.preventDefault();
                return;
              }
              const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
              if (ios) return;
              event.preventDefault();
              void navigator.clipboard?.writeText(feed).catch(() => undefined);
              setNote("Podcasts → Library → + → Add a Show by URL → paste the https feed.");
            }}
          >
            Add {title} to Podcasts
          </a>
          <p className="mt-3 text-sm text-muted">Podcasts → Library → + → Add a Show by URL → paste the https feed.</p>
          <p className="mt-2 text-sm text-muted">Podcasts keeps the playlist. The Watch copies from the phone.</p>
          <Steps
            ticks={appleTicks.ticks}
            onToggle={appleTicks.save}
            onReset={appleTicks.reset}
            items={[
              ["subscribe", "Subscribe"],
              ["settings", "Show settings: Auto-download On, Keep all episodes, Remove played downloads Off"],
              ["watch", `Watch app → My Watch → Podcasts → add ${title} → charge on Wi‑Fi. “Hey Siri, play ${title}.”`],
            ]}
          />
          <div className="mt-6">
            <Qr value={qr} />
            <p className="mt-2 text-sm text-subtle">Scan opens this page on iPhone. It does not save a file.</p>
          </div>
        </section>
      ) : null}

      {selected === "android" ? (
        <section className="mt-8">
          <button
            type="button"
            disabled={!ready}
            onClick={() => void copyFeed()}
            className="inline-flex h-12 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-40"
          >
            Copy RSS feed
          </button>
          {ready ? (
            <a
              href={`pktc://subscribe/${encodeURIComponent(feed)}`}
              className="ml-3 inline-flex h-12 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
            >
              Pocket Casts
            </a>
          ) : null}
          <ol className="mt-4 grid gap-2 text-sm text-muted">
            <li>Subscribe in your podcast app.</li>
            <li>Download all episodes on Wi‑Fi.</li>
            <li>Play offline in that app.</li>
          </ol>
          <Steps
            ticks={androidTicks.ticks}
            onToggle={androidTicks.save}
            onReset={androidTicks.reset}
            items={[
              ["subscribe", "Subscribe"],
              ["download", "Download all episodes on Wi‑Fi"],
              ["offline", "Play offline in that app"],
            ]}
          />
          <div className="mt-6">
            <Qr value={qr} />
          </div>
        </section>
      ) : null}

      {selected === "computer" ? (
        <section className="mt-8">
          <Qr value={qr} big />
          <p className="mt-3 text-sm text-muted">Scan with your phone. Do not scan the XML.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={qrLock === "apple"}
              onClick={() => setQrLock((value) => (value === "apple" ? undefined : "apple"))}
              className={cn("h-10 px-3 font-mono text-[11px] uppercase tracking-[0.14em]", qrLock === "apple" ? "text-gold" : "text-subtle")}
            >
              iPhone QR
            </button>
            <button
              type="button"
              aria-pressed={qrLock === "android"}
              onClick={() => setQrLock((value) => (value === "android" ? undefined : "android"))}
              className={cn("h-10 px-3 font-mono text-[11px] uppercase tracking-[0.14em]", qrLock === "android" ? "text-gold" : "text-subtle")}
            >
              Android QR
            </button>
          </div>
          <button type="button" onClick={() => void copyFeed()} className="mt-2 inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
            Copy feed URL
          </button>
          <div className="mt-6 border-t border-line pt-4">
            <button type="button" onClick={() => setPackOpen((value) => !value)} className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle" aria-expanded={packOpen}>
              {packOpen ? "Hide pack" : "Pack MP3s"}
            </button>
            {packOpen ? (
              <div className="mt-3 text-sm text-muted">
                <p>Last resort — Music app on a computer → Import → Sync Library.</p>
                <button
                  type="button"
                  disabled={!ready || packing.startsWith("Packing")}
                  onClick={() => void pack()}
                  className="mt-3 inline-flex h-11 items-center rounded-md border border-line px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-gold disabled:opacity-40"
                >
                  Download zip
                </button>
                {packing ? <p className="mt-2">{packing}</p> : null}
              </div>
            ) : null}
          </div>
          <p className="mt-6 text-sm">
            <Link to="/experiences/$slug" params={{ slug: "rose" }} className="text-gold">
              Play on site
            </Link>
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{page.replace(/^https:\/\//, "")}</p>
        </section>
      ) : null}

      {note ? <p className="mt-4 text-sm text-muted">{note}</p> : null}
    </div>
  );
}

function Steps({
  items,
  ticks,
  onToggle,
  onReset,
}: {
  items: [string, string][];
  ticks: Record<string, boolean>;
  onToggle: (field: string, on: boolean) => void;
  onReset: () => void;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-end justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">On this device</p>
        <button type="button" onClick={onReset} className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
          Reset
        </button>
      </div>
      <ul className="mt-3 grid gap-2">
        {items.map(([key, label]) => (
          <li key={key}>
            <label className="flex min-h-12 items-center gap-3 rounded-xl bg-bg-elevated px-4 py-3 text-sm">
              <input type="checkbox" checked={ticks[key] === true} onChange={(event) => onToggle(key, event.target.checked)} />
              {label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
