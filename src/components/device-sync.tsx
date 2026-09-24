import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { renderSVG } from "uqr";
import { useRoseFeed } from "@/components/rose-apple";
import { getPlayableTracks, publicChannels } from "@/lib/catalog";
import { applePodcastUrl } from "@/lib/rose-feed";
import { detectSyncPath, syncAddUrl, type SyncPath, type SyncTab } from "@/lib/sync-path";
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

function Qr({ value }: { value: string }) {
  const svg = useMemo(
    () => (value ? renderSVG(value, { border: 2, pixelSize: 8, ecc: "M", whiteColor: "#fff", blackColor: "#14080c" }) : ""),
    [value],
  );
  if (!svg) return null;
  return <div className="w-60 [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />;
}

const SHORTCUTS = "https://apps.apple.com/app/shortcuts/id915249334";

const LIVE_NAMES = [
  { say: "Play Glaum", slug: "official-glaum-frequency" },
  { say: "Play Athens", slug: "cyber-athens-frequency" },
] as const;

export function DeviceSync({
  slug,
  path,
  tab,
  onPath,
  onTab,
}: {
  slug: string;
  path?: SyncPath;
  tab?: SyncTab;
  onPath: (path: SyncPath) => void;
  onTab: (tab: SyncTab) => void;
}) {
  const catalog = usePlayerStore((s) => s.catalog);
  const channels = catalog.channels.length ? catalog.channels : publicChannels();
  const origin = useOrigin();
  const feed = useRoseFeed();
  const ready = slug === "rose";
  const channel = channels.find((item) => item.slug === slug);
  const title = slug === "rose" ? "Rose" : channel?.name || slug;
  const detected = useMemo(() => detectSyncPath(typeof navigator === "undefined" ? "" : navigator.userAgent), []);
  const iphone = useMemo(() => /iPhone|iPod/.test(typeof navigator === "undefined" ? "" : navigator.userAgent), []);
  const selected = path ?? detected;
  const appleTab = tab === "radio" ? "radio" : "offline";
  const [note, setNote] = useState("");
  const [packOpen, setPackOpen] = useState(false);
  const [packing, setPacking] = useState("");
  const appleTicks = useTicks(`radio.device-sync.${slug}.apple`);
  const androidTicks = useTicks(`radio.device-sync.${slug}.android`);
  const addUrl = syncAddUrl(origin, slug);

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
    <div className="mx-auto max-w-3xl px-4 py-10 pb-52">
      <section className="grid items-center gap-8 min-[800px]:grid-cols-[minmax(0,1fr)_15rem]">
        <div>
          <h1 className="font-display text-6xl font-semibold tracking-tight">{title}</h1>
          <p className={cn("mt-3 hidden max-w-sm text-lg text-muted min-[800px]:block", iphone && "!hidden")}>
            {ready ? "Scan to add the rite to Podcasts." : "This rite is not ready to send yet."}
          </p>
          <a
            href={ready ? applePodcastUrl(feed) : undefined}
            className={cn(
              "mt-6 inline-flex h-14 w-full items-center justify-center rounded-md bg-fg px-4 font-mono text-[12px] uppercase tracking-[0.14em] text-bg min-[800px]:hidden",
              iphone && "!flex",
              !ready && "pointer-events-none opacity-40",
            )}
            onClick={(event) => {
              if (!ready) {
                event.preventDefault();
                return;
              }
              if (/iPhone|iPad|iPod/.test(navigator.userAgent)) return;
              event.preventDefault();
              void navigator.clipboard?.writeText(feed).catch(() => undefined);
              setNote("Podcasts → Library → + → Add a Show by URL → paste the https feed.");
            }}
          >
            Add {title} to Podcasts
          </a>
          <p className={cn("mt-3 text-sm text-muted min-[800px]:hidden", iphone && "!block")}>Subscribe, then stay on Wi‑Fi.</p>
        </div>
        {iphone ? null : (
          <div className="hidden min-[800px]:block">
            <Qr value={addUrl} />
            <p className="mt-3 text-sm text-muted">iPhone Camera → Podcasts → Subscribe.</p>
          </div>
        )}
      </section>

      <div className="mt-16">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="After it is on the phone">
          {(
            [
              ["offline", "Download for Offline"],
              ["radio", "Radio Sync"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={appleTab === id}
              onClick={() => onTab(id)}
              className={cn(
                "inline-flex h-11 items-center rounded-full px-4 font-mono text-[11px] uppercase tracking-[0.14em]",
                appleTab === id ? "bg-fg text-bg" : "bg-bg-elevated text-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="How to send it">
          {PATHS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected === item.id}
              onClick={() => onPath(item.id)}
              className={cn(
                "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]",
                selected === item.id ? "text-gold" : "text-subtle",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>


      {selected === "apple" || appleTab === "radio" ? (
        <section className="mt-8">
          {appleTab === "offline" && selected === "apple" ? (
            <>
              <p className="text-sm text-muted">Podcasts keeps the playlist. The Watch copies from the phone.</p>
              <Steps
                ticks={appleTicks.ticks}
                onToggle={appleTicks.save}
                onReset={appleTicks.reset}
                items={[
                  ["subscribe", "Subscribe"],
                  ["settings", "Show settings: Auto-download On, Keep all episodes, Remove played downloads Off"],
                  ["watch", `Watch app → My Watch → Podcasts → add ${title} → charge on Wi‑Fi.`],
                ]}
              />
              <SiriBlock>
                <ol className="mt-3 grid gap-2 text-sm text-muted">
                  <li>After the show is in Podcasts, try “Hey Siri, play Rose” on the Watch. No Shortcut yet.</li>
                  <li>If Siri misses: iPhone Shortcuts → Play Podcast → show Rose → name the Shortcut Play Rose → Watch app → Shortcuts → add it.</li>
                </ol>
                <p className="mt-3 text-sm text-muted">Do not use Play Music. Test with “Hey Siri, Play Rose.”</p>
              </SiriBlock>
            </>
          ) : appleTab === "radio" ? (
            <>
              <SiriBlock>
                <p className="mt-3 text-sm text-muted">Live needs a Shortcut. Siri will not learn a stream by itself.</p>
                <ol className="mt-3 grid gap-2 text-sm text-muted">
                  <li>iPhone Shortcuts → Open URLs → paste the Listen-now address → name it Play and a short word → Watch app → Shortcuts → add it.</li>
                </ol>
                <p className="mt-3 text-sm text-muted">One Shortcut per station. Do not reuse Play Rose. That name is the podcast.</p>
                <p className="mt-2 text-sm text-muted">This opens the site player. It is not Apple Music Radio. The Watch cannot add a radio URL. Safari on the phone starts it. Audio can go to Watch Bluetooth, or the phone can stay the player.</p>
              </SiriBlock>
              <ul className="mt-4 grid gap-2">
                <li className="rounded-xl bg-bg-elevated px-4 py-3 text-sm">
                  <p className="font-display text-lg">Play Rose</p>
                  <p className="text-muted">Podcasts only. Do not point this name at a stream.</p>
                </li>
                {LIVE_NAMES.map((item) => {
                  const listen = `${origin}/channel/${item.slug}`;
                  return (
                    <li key={item.say} className="rounded-xl bg-bg-elevated px-4 py-3 text-sm">
                      <p className="font-display text-lg">{item.say}</p>
                      <p className="mt-1 break-all font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">{listen.replace(/^https:\/\//, "")}</p>
                      <button
                        type="button"
                        onClick={() => void navigator.clipboard?.writeText(listen).then(() => setNote(`${item.say} address copied. Paste it into Open URLs.`)).catch(() => setNote(listen))}
                        className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
                      >
                        Copy Listen-now
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}

      {appleTab === "offline" && selected === "android" ? (
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
        </section>
      ) : null}

      {appleTab === "offline" && selected === "computer" ? (
        <section className="mt-8">
          <button type="button" onClick={() => void copyFeed()} className="inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
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
        </section>
      ) : null}

      {note ? <p className="mt-4 text-sm text-muted">{note}</p> : null}
    </div>
  );
}

function SiriBlock({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 rounded-2xl bg-bg-elevated p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">Siri on Watch</p>
      <p className="mt-2 text-sm text-muted">Make the Shortcut on the iPhone. An iPhone 12 or Air is the same. The Watch only runs the name.</p>
      {children}
      <a href={SHORTCUTS} className="mt-4 inline-flex font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
        Shortcuts app
      </a>
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
