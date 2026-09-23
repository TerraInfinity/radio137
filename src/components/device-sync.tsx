import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { renderSVG } from "uqr";
import { SendToIphone, useRoseFeed } from "@/components/rose-apple";
import { getPlayableTracks, isChannelNsfw, publicChannels } from "@/lib/catalog";
import { applePodcastUrl } from "@/lib/rose-feed";
import { usePlayerStore } from "@/lib/player-store";
import { zipStore } from "@/lib/zip-store";

const TICKS = "radio.device-sync.rose";

type Ticks = { subscribed: boolean; downloaded: boolean; watch: boolean };

const emptyTicks: Ticks = { subscribed: false, downloaded: false, watch: false };

function loadTicks(): Ticks {
  if (typeof window === "undefined") return emptyTicks;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(TICKS) || "") as Partial<Ticks>;
    return {
      subscribed: parsed.subscribed === true,
      downloaded: parsed.downloaded === true,
      watch: parsed.watch === true,
    };
  } catch {
    return emptyTicks;
  }
}

function fileName(title: string, index: number): string {
  const clean = title.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim() || `track-${index}`;
  return `${String(index).padStart(2, "0")} ${clean}.mp3`;
}

export function DeviceSync() {
  const catalog = usePlayerStore((s) => s.catalog);
  const channels = catalog.channels.length ? catalog.channels : publicChannels();
  const feed = useRoseFeed();
  const [ticks, setTicks] = useState<Ticks>(emptyTicks);
  const [copied, setCopied] = useState("");
  const [packOpen, setPackOpen] = useState(false);
  const [packing, setPacking] = useState("");
  const qr = useMemo(() => (feed ? renderSVG(feed, { border: 2, pixelSize: 3, ecc: "M", whiteColor: "#fff", blackColor: "#14080c" }) : ""), [feed]);
  const waiting = useMemo(
    () => channels.filter((channel) => channel.enabled && !isChannelNsfw(channel) && channel.slug !== "rose").map((channel) => channel.name),
    [channels],
  );

  useEffect(() => {
    setTicks(loadTicks());
  }, []);

  function save(next: Ticks) {
    setTicks(next);
    window.localStorage.setItem(TICKS, JSON.stringify(next));
  }

  async function copyFeed() {
    try {
      await navigator.clipboard.writeText(feed);
      setCopied("Copied. Same URL for a QR on a computer.");
    } catch {
      setCopied(feed);
    }
  }

  async function pack() {
    const rose = channels.find((channel) => channel.slug === "rose");
    const tracks = getPlayableTracks(rose);
    if (tracks.length === 0) {
      setPacking("The rite is not in the catalog yet.");
      return;
    }
    setPacking(`Packing 0 of ${tracks.length}`);
    const files: { name: string; data: Uint8Array }[] = [];
    const note = new TextEncoder().encode(
      "Music app on a Mac or PC → Import these files → turn on Sync Library.\nThey then appear in Music on iPhone and can be downloaded to the Watch like any playlist.\nThis is not instant from the phone.\n",
    );
    files.push({ name: "IMPORT.txt", data: note });
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
    setPacking("Packed. Import the zip on a computer. This is not instant from the phone.");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Phone and Watch</p>
      <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight">Device Sync</h1>
      <p className="mt-3 max-w-prose text-muted">The website is the playlist. Apple never gets a dump of loose files.</p>

      <section className="mt-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">Ready to send</p>
        <article className="mt-3 rounded-2xl bg-bg-elevated p-5 shadow-[var(--shadow-filigree)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Fixed experience · start to finish</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">Rose</h2>
          <p className="mt-2 max-w-prose text-sm text-muted">
            Rose is a fixed-order rite. Send it to Podcasts. The phone keeps the list. The Watch copies from the phone while it charges.
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
            Source <Link to="/experiences/$slug" params={{ slug: "rose" }} className="text-gold">experiences/rose</Link>
            {" · "}
            Feed {feed.replace(/^https:\/\//, "")}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <SendToIphone
              className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg"
              onFallback={setCopied}
            />
            <button type="button" onClick={() => void copyFeed()} className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              Copy feed URL
            </button>
            <Link to="/experiences/$slug" params={{ slug: "rose" }} className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              Play on site
            </Link>
          </div>
          {copied ? <p className="mt-3 text-sm text-muted">{copied}</p> : null}
          <p className="mt-2 text-sm text-subtle">Same URL for a QR on a computer. {applePodcastUrl(feed)}</p>
          {qr ? <div className="mt-4 w-36" dangerouslySetInnerHTML={{ __html: qr }} /> : null}
          <div className="mt-5 border-t border-line pt-4">
            <button type="button" onClick={() => setPackOpen((value) => !value)} className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle" aria-expanded={packOpen}>
              {packOpen ? "Hide pack for Music" : "Pack for Music"}
            </button>
            {packOpen ? (
              <div className="mt-3 text-sm text-muted">
                <p>
                  Music app on a Mac or PC → Import these files → turn on Sync Library. They then appear in Music on iPhone and can be downloaded to the Watch like any playlist. This is not instant from the phone.
                </p>
                <button
                  type="button"
                  disabled={packing.startsWith("Packing")}
                  onClick={() => void pack()}
                  className="mt-3 inline-flex h-11 items-center rounded-md border border-line px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-gold disabled:opacity-50"
                >
                  Download zip
                </button>
                {packing ? <p className="mt-2">{packing}</p> : null}
              </div>
            ) : null}
          </div>
        </article>
        <ul className="mt-4 grid gap-2">
          {waiting.map((name) => (
            <li key={name} className="flex items-center justify-between rounded-xl bg-bg-elevated/60 px-4 py-3 text-subtle">
              <span>{name}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em]">Coming soon</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">How it lands</p>
        <ol className="mt-3 grid gap-3">
          <li className="rounded-xl bg-bg-elevated px-4 py-3">1. Tap Send to iPhone. Podcasts opens and offers Subscribe.</li>
          <li className="rounded-xl bg-bg-elevated px-4 py-3">2. On Wi‑Fi, Podcasts downloads the tracks in order. That is the playlist.</li>
          <li className="rounded-xl bg-bg-elevated px-4 py-3">3. Watch app → My Watch → Podcasts → add Rose → charge the Watch on Wi‑Fi. Then “Hey Siri, play Rose.”</li>
        </ol>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">On this device</p>
          <button type="button" onClick={() => save(emptyTicks)} className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            Reset Rose
          </button>
        </div>
        <ul className="mt-3 grid gap-2">
          {(
            [
              ["subscribed", "Subscribed in Podcasts"],
              ["downloaded", "Downloaded on Wi‑Fi"],
              ["watch", "Added to Watch"],
            ] as const
          ).map(([key, label]) => (
            <li key={key}>
              <label className="flex h-12 items-center gap-3 rounded-xl bg-bg-elevated px-4">
                <input
                  type="checkbox"
                  checked={ticks[key]}
                  onChange={(event) => save({ ...ticks, [key]: event.target.checked })}
                />
                {label}
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
