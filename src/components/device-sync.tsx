import { useEffect, useMemo, useState } from "react";
import { AudioGrabs } from "@/components/audio-grabs";
import { renderSVG } from "uqr";
import { getPlayableTracks, publicChannels } from "@/lib/catalog";
import { appleShowLinks, feedFor, listenFor, offerFor, ROSE_APPLE_SHOW, siriFor } from "@/lib/device-sync";
import { syncPageUrl, type SyncPath, type SyncTab } from "@/lib/sync-path";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";
import { zipStore } from "@/lib/zip-store";
import { enqueueGrabs } from "@/lib/download-queue";

function useOrigin() {
  const [origin, setOrigin] = useState("https://radio.terrainfinity.ca");
  useEffect(() => setOrigin(window.location.origin), []);
  return origin;
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

export function DeviceSync({
  slug,
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
  const iphone = useMemo(() => /iPhone|iPod/.test(typeof navigator === "undefined" ? "" : navigator.userAgent), []);
  const [note, setNote] = useState("");
  const [packOpen, setPackOpen] = useState(false);
  const [packing, setPacking] = useState("");
  const grabItems = getPlayableTracks(channel).map((track, index) => ({
    title: track.title,
    url: track.audioUrl,
    fileName: fileName(track.title, index + 1, track.audioUrl),
  }));
  const catalogUrl = offer.appleUrl || (slug === "rose" ? ROSE_APPLE_SHOW : "");
  const show = appleShowLinks(catalogUrl);
  const showPage = (slug === "rose" ? ROSE_APPLE_SHOW : show?.page) || "";
  const pageQr = syncPageUrl(origin, slug);

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
    <div className="mx-auto max-w-md px-4 py-10 pb-52">
      <section>
        <h1 className="font-display text-5xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-lg text-muted">The scan opens this page. The button opens the show in Podcasts.</p>
        {!offer.enabled && isAdmin ? <p className="mt-2 text-sm text-muted">Guests do not see this until Device sync is on in the station settings.</p> : null}
        <div className="mt-6 flex flex-col gap-2">
          {showPage ? (
            <a href={showPage} className="inline-flex h-14 items-center justify-center rounded-md bg-fg px-3 font-mono text-[12px] uppercase tracking-[0.14em] text-bg">
              Open in Podcasts
            </a>
          ) : (
            <button type="button" onClick={() => void enqueueGrabs(slug, grabItems)} className="inline-flex h-14 items-center justify-center rounded-md bg-fg px-3 font-mono text-[12px] uppercase tracking-[0.14em] text-bg">
              Download the audio
            </button>
          )}
          <a href={listen} className="inline-flex h-12 items-center justify-center rounded-md border border-line px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
            Play now
          </a>
        </div>
        {iphone ? null : (
          <div className="mt-8 w-44">
            <Qr value={pageQr} />
            <p className="mt-2 text-sm text-muted">Scan with the phone. It opens this page, not Podcasts.</p>
          </div>
        )}
        <p className="mt-6 text-sm text-muted">After it is in Podcasts, say “Hey Siri, {say}”. The Watch copies the show from the phone while it charges.</p>
      </section>

      <details className="mt-10">
        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">More</summary>
        <div className="mt-4">
          <AudioGrabs slug={slug} items={grabItems} />
          {hasFeed ? (
            <button type="button" onClick={() => void copyFeed()} className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              Copy RSS
            </button>
          ) : null}
          <div className="mt-4">
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
        </div>
      </details>
      {note ? <p className="mt-4 text-sm text-muted">{note}</p> : null}
    </div>
  );
}
