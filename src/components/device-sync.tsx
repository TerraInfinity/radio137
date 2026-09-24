import { useEffect, useMemo, useState, type ReactNode } from "react";
import { renderSVG } from "uqr";
import { getPlayableTracks, publicChannels } from "@/lib/catalog";
import { feedFor, listenFor, offerFor, siriFor } from "@/lib/device-sync";
import { applePodcastUrl } from "@/lib/rose-feed";
import { detectSyncPath, shortcutsCreateUrl, shortcutsRunUrl, syncAddUrl, syncPageUrl, type SyncPath, type SyncTab } from "@/lib/sync-path";
import { useRadioUser } from "@/lib/radio-user";
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

function fileName(title: string, index: number, url: string): string {
  const clean = title.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim() || `track-${index}`;
  const ext = (url.split("?")[0]?.match(/\.([a-z0-9]+)$/i)?.[1] || "mp3").toLowerCase();
  return `${String(index).padStart(2, "0")} ${clean}.${ext}`;
}

function Qr({ value }: { value: string }) {
  const svg = useMemo(
    () => (value ? renderSVG(value, { border: 2, pixelSize: 6, ecc: "M", whiteColor: "#fff", blackColor: "#14080c" }) : ""),
    [value],
  );
  if (!svg) return null;
  return <div className="mx-auto w-40 [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />;
}

const SHORTCUTS = "https://apps.apple.com/app/shortcuts/id915249334";

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
  const { isAdmin } = useRadioUser();
  const channels = catalog.channels.length ? catalog.channels : publicChannels();
  const origin = useOrigin();
  const channel = channels.find((item) => item.slug === slug);
  const offer = offerFor(channel ?? { slug, tags: [] });
  const feed = feedFor(slug, origin, offer);
  const hasFeed = Boolean(feed);
  const open = offer.enabled || isAdmin;
  const title = channel?.name || (slug === "rose" ? "Rose" : slug);
  const say = siriFor(title, slug, offer);
  const listen = channel ? listenFor(origin, channel) : `${origin}/channel/${slug}`;
  const appleShow = offer.appleUrl;
  const detected = useMemo(() => detectSyncPath(typeof navigator === "undefined" ? "" : navigator.userAgent), []);
  const iphone = useMemo(() => /iPhone|iPod/.test(typeof navigator === "undefined" ? "" : navigator.userAgent), []);
  const selected = path ?? detected;
  const appleTab = tab === "radio" || tab === "siri" ? tab : "offline";
  const [note, setNote] = useState("");
  const [packOpen, setPackOpen] = useState(false);
  const [packing, setPacking] = useState("");
  const appleTicks = useTicks(`radio.device-sync.${slug}.apple`);
  const androidTicks = useTicks(`radio.device-sync.${slug}.android`);
  const podcastQr = hasFeed ? syncAddUrl(origin, slug) : "";
  const siriQr = syncPageUrl(origin, slug, "apple", "siri");
  const runSiri = shortcutsRunUrl(say);
  const makeSiri = shortcutsCreateUrl();

  async function copyFeed() {
    if (!feed) {
      setNote("No podcast feed yet. An admin can paste one, or download the audio below.");
      return;
    }
    try {
      await navigator.clipboard.writeText(feed);
      setNote("Feed copied. Paste it into the app. Do not download the file.");
    } catch {
      setNote(feed);
    }
  }

  async function pack() {
    const tracks = getPlayableTracks(channel);
    if (tracks.length === 0) {
      setPacking("This station has no audio yet.");
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
      if (!track) continue;
      setPacking(`Packing ${i + 1} of ${tracks.length}`);
      const response = await fetch(track.audioUrl);
      if (!response.ok) {
        setPacking(`Could not fetch ${track.title}.`);
        return;
      }
      files.push({ name: fileName(track.title, i + 1, track.audioUrl), data: new Uint8Array(await response.arrayBuffer()) });
    }
    const packed = zipStore(files).slice();
    const blob = new Blob([packed.buffer], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug}.zip`;
    link.click();
    URL.revokeObjectURL(url);
    setPacking("Packed. Import on a computer, then Sync Library.");
  }

  if (!channel && slug !== "rose") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-4xl font-semibold">No such station</h1>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Device sync</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">{title}</h1>
        <p className="mt-3 max-w-prose text-muted">This station is not offering a phone page yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pb-52">
      <section>
        <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-3 max-w-prose text-lg text-muted">Pick one. Play it now, keep it offline, or teach Siri the name.</p>
        {!offer.enabled && isAdmin ? <p className="mt-2 text-sm text-muted">Guests do not see this until Device sync is on in the station settings.</p> : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Choice
            title="Play live"
            line="Opens the station on this phone."
            scan="Camera opens the player."
            qr={iphone ? "" : listen}
            action={
              <a href={listen} className="inline-flex h-12 w-full items-center justify-center rounded-md bg-fg px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
                Play now
              </a>
            }
          />
          {hasFeed ? (
            <Choice
              title="Save offline"
              line="Podcasts keeps the list. The Watch copies it while charging."
              scan="Camera opens Podcasts → Subscribe."
              qr={iphone ? "" : podcastQr}
              action={
                <a href={applePodcastUrl(feed)} className="inline-flex h-12 w-full items-center justify-center rounded-md bg-fg px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
                  Add to Podcasts
                </a>
              }
            />
          ) : (
            <Choice
              title="Save offline"
              line="No podcast feed yet. Download the audio instead."
              scan=""
              qr=""
              action={
                <button type="button" onClick={() => void pack()} className="inline-flex h-12 w-full items-center justify-center rounded-md bg-fg px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
                  Download
                </button>
              }
            />
          )}
          <Choice
            title="Hey Siri"
            line={`After it is downloaded, say “${say}” on the iPhone or the Watch.`}
            scan="Camera opens the Siri steps."
            qr={iphone ? "" : siriQr}
            action={
              <button
                type="button"
                onClick={() => {
                  onPath("apple");
                  onTab("siri");
                }}
                className="inline-flex h-12 w-full items-center justify-center rounded-md border border-line px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
              >
                Set up {say}
              </button>
            }
          />
        </div>
      </section>

      <div className="mt-16">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="After it is on the phone">
          {(
            [
              ["offline", "Save offline"],
              ["siri", "Hey Siri"],
              ["radio", "Play live"],
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
          {appleTab === "siri" && selected === "apple" ? (
            <>
              <p className="text-sm text-muted">The iPhone and the Watch use the same words. Siri plays the podcast. It does not need a Shortcut unless it opens the wrong app.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {hasFeed ? (
                  <a href={applePodcastUrl(feed)} className="inline-flex h-12 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
                    Add to Podcasts
                  </a>
                ) : null}
                <a href={makeSiri} className="inline-flex h-12 items-center rounded-md border border-line px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
                  Open Shortcuts
                </a>
                <a href={runSiri} className="inline-flex h-12 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
                  Run {say}
                </a>
                {appleShow ? (
                  <a href={appleShow} className="inline-flex h-12 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
                    Show in Podcasts
                  </a>
                ) : null}
              </div>
              <Steps
                ticks={appleTicks.ticks}
                onToggle={appleTicks.save}
                onReset={appleTicks.reset}
                items={[
                  ["subscribe", "Subscribe, then stay on Wi‑Fi until the episodes finish downloading"],
                  ["watch", "Watch app → My Watch → Podcasts → add the show → charge on Wi‑Fi"],
                  ["speak", `Say “Hey Siri, ${say}” on the phone or the Watch`],
                ]}
              />
              <SiriBlock>
                <p className="mt-3 text-sm text-muted">Only if Siri misses. Do not use Play Music.</p>
                <ol className="mt-3 grid gap-2 text-sm text-muted">
                  <li>Open Shortcuts. Add action → Play Podcast → show {title}.</li>
                  <li>Name the Shortcut exactly {say}.</li>
                  <li>Watch app → Shortcuts → show {say} on the Watch.</li>
                </ol>
                <p className="mt-3 text-sm text-muted">A website cannot write the Shortcut for you. Those buttons open the app. You confirm the last tap.</p>
              </SiriBlock>
            </>
          ) : appleTab === "offline" && selected === "apple" ? (
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
                  <li>After the show is in Podcasts, try “Hey Siri, {say}” on the Watch. No Shortcut yet.</li>
                  <li>If Siri misses: iPhone Shortcuts → Play Podcast → show {title} → name the Shortcut {say} → Watch app → Shortcuts → add it.</li>
                </ol>
                <p className="mt-3 text-sm text-muted">Do not use Play Music. Test with “Hey Siri, {say}.”</p>
              </SiriBlock>
            </>
          ) : appleTab === "radio" ? (
            <>
              <SiriBlock>
                <p className="mt-3 text-sm text-muted">Live needs a Shortcut. Siri will not learn a stream by itself.</p>
                <ol className="mt-3 grid gap-2 text-sm text-muted">
                  <li>iPhone Shortcuts → Open URLs → paste the Listen-now address → name it Play and a short word → Watch app → Shortcuts → add it.</li>
                </ol>
                <p className="mt-3 text-sm text-muted">One Shortcut for this station. Name the live one {say} live, so it does not steal the podcast name {say}.</p>
                <p className="mt-2 text-sm text-muted">This opens the site player. It is not Apple Music Radio. The Watch cannot add a radio URL. Safari on the phone starts it. Audio can go to Watch Bluetooth, or the phone can stay the player.</p>
              </SiriBlock>
              <div className="mt-4 rounded-xl bg-bg-elevated px-4 py-3 text-sm">
                <p className="font-display text-lg">{say}</p>
                <p className="mt-1 break-all font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">{listen.replace(/^https:\/\//, "")}</p>
                <button
                  type="button"
                  onClick={() => void navigator.clipboard?.writeText(listen).then(() => setNote(`${say} live address copied. Paste it into Open URLs.`)).catch(() => setNote(listen))}
                  className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
                >
                  Copy Listen-now
                </button>
                <a href={makeSiri} className="mt-3 inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
                  Open Shortcuts
                </a>
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {appleTab === "offline" && selected === "android" ? (
        <section className="mt-8">
          <button
            type="button"
            disabled={!hasFeed}
            onClick={() => void copyFeed()}
            className="inline-flex h-12 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-40"
          >
            Copy RSS feed
          </button>
          {hasFeed ? (
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
                  disabled={packing.startsWith("Packing")}
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
            <a href={listen} className="text-gold">
              Play on site
            </a>
          </p>
        </section>
      ) : null}

      {appleTab === "offline" ? (
        <section className="mt-8">
          <button
            type="button"
            disabled={packing.startsWith("Packing")}
            onClick={() => void pack()}
            className="inline-flex h-12 items-center rounded-md border border-line px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-gold disabled:opacity-40"
          >
            Download the audio
          </button>
          {packing ? <p className="mt-2 text-sm text-muted">{packing}</p> : <p className="mt-2 text-sm text-muted">A zip of this station, in playlist order.</p>}
        </section>
      ) : null}

      {note ? <p className="mt-4 text-sm text-muted">{note}</p> : null}
    </div>
  );
}

function Choice({ title, line, scan, qr, action }: { title: string; line: string; scan: string; qr: string; action: ReactNode }) {
  return (
    <div className="flex flex-col rounded-xl bg-bg-elevated p-4">
      <p className="font-display text-2xl">{title}</p>
      <p className="mt-2 flex-1 text-sm text-muted">{line}</p>
      <div className="mt-4">{action}</div>
      {qr ? (
        <div className="mt-4 hidden sm:block">
          <Qr value={qr} />
          <p className="mt-2 text-center text-sm text-muted">{scan}</p>
        </div>
      ) : null}
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
