import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DeskStations } from "@/components/desk-stations";
import { DeskDirectory } from "@/components/desk-directory";
import { DeskReview } from "@/components/desk-review";
import {
  deleteR2Object,
  importR2Tracks,
  listStationR2,
  moveR2Object,
  pingServices,
  listReviewQueue,
} from "@/lib/desk-api";
import { applyCatalogEdits, type CatalogEdit, type StationEdit } from "@/lib/catalog-edits";
import { getCatalog, getSeedCatalog } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { desksForKey, buildDeskKeyIndex, formatBytes, isAudioKey, titleFromR2Key } from "@/lib/file-path";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";
import { SignInChoices } from "@/components/sign-in-choices";
import type { Channel } from "@/lib/types";
import type { EnvLamp } from "@/lib/env-lamps";

export const Route = createFileRoute("/desk")({
  component: DeskPage,
  head: () => ({ meta: [{ title: "Station desk · Radio" }] }),
});

function applySnapshot(tracks: CatalogEdit[], stations: StationEdit[]) {
  usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}

const DESK_TABS = ["stations", "directory", "review", "r2", "services"] as const;
type DeskTab = (typeof DESK_TABS)[number];

function readDeskTab(): DeskTab {
  try {
    const value = window.localStorage.getItem("radio.desk.tab");
    if (value && (DESK_TABS as readonly string[]).includes(value)) return value as DeskTab;
  } catch {
    /* ignore */
  }
  return "stations";
}

function DeskPage() {
  const { user, isAdmin, isPending, r2Configured, lamps } = useRadioUser();
  const catalog = usePlayerStore((s) => s.catalog);
  const channels = catalog.channels.length ? catalog.channels : getCatalog().channels;
  const [tab, setTab] = useState<DeskTab>("stations");
  const [reviewOpen, setReviewOpen] = useState(0);

  useEffect(() => {
    setTab(readDeskTab());
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    void listReviewQueue()
      .then((data) => setReviewOpen(data.open))
      .catch(() => setReviewOpen(0));
  }, [isAdmin, tab]);

  function pickTab(next: DeskTab) {
    setTab(next);
    try {
      window.localStorage.setItem("radio.desk.tab", next);
    } catch {
      /* ignore */
    }
  }

  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Station desk</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Station desk</h1>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Checking the door.</p>
      </div>
    );
  }

  if (!user) return <DeskLocked />;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Station desk</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Clockwork desk</h1>
        <p className="mt-4 text-muted">
          Signed in as {user.email}. This door is for C — career@terrainfinity.ca and c@cyber-athens.ca.
        </p>
        <Link to="/" className="mt-8 inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          Back to stations
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">C · God desk</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Station desk</h1>
      <p className="mt-3 max-w-prose text-muted">
        Pick a station, add songs, keep the rest folded. R2 scans in the background so the desk stays light.
      </p>
      <DeskOverview channels={channels} reviewOpen={reviewOpen} />
      <div className="mt-6 flex flex-wrap gap-1">
        {(
          [
            ["stations", "Stations"],
            ["directory", "Directory"],
            ["review", reviewOpen ? `Review (${reviewOpen})` : "Review"],
            ["r2", "R2"],
            ["services", "Services"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => pickTab(id)}
            className={cn(
              "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]",
              tab === id ? "bg-fg text-bg" : "text-gold",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "stations" ? <DeskStations channels={channels} r2Configured={r2Configured} /> : null}
      {tab === "directory" ? <DeskDirectory catalog={catalog.channels.length ? catalog : getCatalog()} /> : null}
      {tab === "review" ? <DeskReview /> : null}
      {tab === "r2" ? <R2Board channels={channels} r2Configured={r2Configured} /> : null}
      {tab === "services" ? <ServicesBoard r2Configured={r2Configured} lamps={lamps} /> : null}
    </div>
  );
}

function DeskOverview({ channels, reviewOpen }: { channels: Channel[]; reviewOpen: number }) {
  const songs = channels.reduce((sum, channel) => sum + channel.tracks.filter((track) => track.enabled !== false).length, 0);
  const offAir = channels.filter((channel) => !channel.enabled).length;
  const empty = channels.filter((channel) => channel.enabled && channel.tracks.filter((track) => track.enabled !== false).length === 0).length;
  return (
    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
      {channels.length} stations · {songs} songs
      {offAir ? ` · ${offAir} off air` : ""}
      {empty ? ` · ${empty} empty` : ""}
      {reviewOpen ? ` · ${reviewOpen} in review` : ""}
    </p>
  );
}

function DeskLocked() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Station desk</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Unlock</h1>
      <p className="mt-4 text-muted">C accounts sign in with Google or X. Google still opens on the Terrainfinity hub.</p>
      <div className="mt-8">
        <SignInChoices next="/desk" />
      </div>
    </div>
  );
}

function R2Board({ channels, r2Configured }: { channels: Channel[]; r2Configured: boolean }) {
  const [prefix, setPrefix] = useState("radio/");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState("");
  const [objects, setObjects] = useState<Array<{ key: string; size: number; url: string }>>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [assign, setAssign] = useState<string[]>(channels[0]?.slug ? [channels[0].slug] : []);
  const [picked, setPicked] = useState<string[]>([]);
  const [onlyNew, setOnlyNew] = useState(true);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);

  function refresh(nextPrefix = prefix) {
    setStatus("loading");
    void listStationR2({ data: { prefix: nextPrefix, maxKeys: 800 } })
      .then((result) => {
        setObjects(result.objects);
        setStatus(result.ok ? "ready" : "error");
        setError(result.ok ? "" : result.error || "Could not list.");
      })
      .catch((err: unknown) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Could not list.");
      });
  }

  function toggleAssign(slug: string) {
    setAssign((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  }

  function togglePick(key: string) {
    setPicked((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  }

  const keyIndex = useMemo(() => buildDeskKeyIndex(channels), [channels]);
  const rows = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const mapped = objects
      .map((object) => ({
        ...object,
        audio: isAudioKey(object.key),
        desks: desksForKey(keyIndex, object.key),
        title: titleFromR2Key(object.key),
      }))
      .filter((object) => {
        if (onlyNew && object.audio && object.desks.length > 0) return false;
        if (onlyNew && !object.audio) return false;
        if (needle && !`${object.title} ${object.key}`.toLowerCase().includes(needle)) return false;
        return true;
      });
    return mapped.slice(0, 80);
  }, [objects, keyIndex, onlyNew, filter]);

  async function importKeys(keys: string[]) {
    const items = objects
      .filter((object) => keys.includes(object.key) && isAudioKey(object.key))
      .map((object) => ({ key: object.key, url: object.url, title: titleFromR2Key(object.key) }));
    if (!items.length || assign.length === 0) {
      window.alert(assign.length === 0 ? "Pick at least one station." : "Pick audio files to import.");
      return;
    }
    setBusy(true);
    try {
      const result = await importR2Tracks({ data: { channelSlugs: assign, items } });
      applySnapshot(result.tracks, result.stations);
      setPicked([]);
      window.alert(
        result.added
          ? `Added ${result.added} song${result.added === 1 ? "" : "s"}${result.skipped ? ` · ${result.skipped} already listed` : ""}`
          : "Those files are already on the selected station(s).",
      );
      refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  if (!r2Configured) {
    return (
      <div className="mt-8 rounded-xl bg-bg-elevated p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">R2</p>
        <p className="mt-3 text-muted">Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in Vercel. The Services tab will turn those lamps green.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <p className="max-w-prose text-sm text-muted">
        Pick a station folder to scan. The whole bucket is too large to list on open — this tab waits until you ask.
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => {
            setPrefix("radio/");
            refresh("radio/");
          }}
          className={cn("inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em]", prefix === "radio/" ? "bg-fg text-bg" : "text-gold")}
        >
          All radio/
        </button>
        {channels.map((channel) => {
          const folder = `radio/${channel.slug}/`;
          return (
            <button
              key={channel.slug}
              type="button"
              onClick={() => {
                setPrefix(folder);
                setAssign([channel.slug]);
                refresh(folder);
              }}
              className={cn("inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em]", prefix === folder ? "bg-fg text-bg" : "text-gold")}
            >
              {channel.name}
            </button>
          );
        })}
      </div>
      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          refresh(prefix);
        }}
      >
        <input className="input min-w-64 flex-1" value={prefix} onChange={(event) => setPrefix(event.target.value)} />
        <button type="submit" className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg">
          List
        </button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOnlyNew((value) => !value)}
          className={cn("inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em]", onlyNew ? "bg-fg text-bg" : "text-gold")}
        >
          {onlyNew ? "New audio only" : "Show all files"}
        </button>
        <input className="input min-w-48 flex-1" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter keys" />
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">Import onto</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {channels.map((channel) => (
          <button
            key={channel.slug}
            type="button"
            onClick={() => toggleAssign(channel.slug)}
            className={cn(
              "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em]",
              assign.includes(channel.slug) ? "bg-fg text-bg" : "text-gold",
            )}
          >
            {channel.name}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || picked.length === 0}
          onClick={() => void importKeys(picked)}
          className="inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg"
        >
          {busy ? "Importing…" : `Import selected (${picked.length})`}
        </button>
        <button
          type="button"
          disabled={busy || rows.filter((item) => item.audio && item.desks.length === 0).length === 0}
          onClick={() => void importKeys(rows.filter((item) => item.audio && item.desks.length === 0).map((item) => item.key))}
          className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
        >
          Import all new
        </button>
      </div>
      <form
        className="mt-4 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!from.trim() || !to.trim()) return;
          void moveR2Object({ data: { from: from.trim(), to: to.trim() } })
            .then(() => {
              setFrom("");
              setTo("");
              refresh();
            })
            .catch((err: unknown) => window.alert(err instanceof Error ? err.message : "Move failed"));
        }}
      >
        <input className="input min-w-48 flex-1" value={from} onChange={(event) => setFrom(event.target.value)} placeholder="Move from key" />
        <input className="input min-w-48 flex-1" value={to} onChange={(event) => setTo(event.target.value)} placeholder="to key" />
        <button type="submit" className="inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          Move
        </button>
      </form>
      {status === "idle" ? <p className="mt-4 text-sm text-muted">Choose a station folder above, or type a prefix and list.</p> : null}
      {status === "loading" ? <p className="mt-4 text-sm text-muted">Listing this folder… the rest of the desk stays usable.</p> : null}
      {status === "error" ? <p className="mt-4 text-sm text-ember">{error}</p> : null}
      <ul className="mt-4 max-h-[28rem] space-y-1 overflow-y-auto rounded-xl bg-bg-elevated p-3">
        {rows.map((object) => (
          <li key={object.key} className="flex flex-wrap items-center gap-2 py-1">
            <label className="flex min-w-0 flex-1 items-center gap-2">
              <input
                type="checkbox"
                checked={picked.includes(object.key)}
                disabled={!object.audio}
                onChange={() => togglePick(object.key)}
                className="size-4"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-[11px] text-subtle">{object.key}</span>
                <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                  {formatBytes(object.size)}
                  {object.audio
                    ? object.desks.length
                      ? ` · on ${object.desks.map((slug) => channels.find((item) => item.slug === slug)?.name || slug).join(", ")}`
                      : " · not on a station"
                    : " · not audio"}
                </span>
              </span>
            </label>
            {object.audio ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void importKeys([object.key])}
                className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
              >
                Import
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setFrom(object.key);
                setTo(object.key);
              }}
              className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
            >
              Move
            </button>
            <button
              type="button"
              onClick={() => {
                if (!window.confirm(`Delete ${object.key}?`)) return;
                void deleteR2Object({ data: { key: object.key } })
                  .then(() => refresh())
                  .catch((err: unknown) => window.alert(err instanceof Error ? err.message : "Delete failed"));
              }}
              className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ember"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ServicesBoard({ r2Configured, lamps }: { r2Configured: boolean; lamps: EnvLamp[] }) {
  const [ping, setPing] = useState<{
    hub: { origin: string; status: number; ok: boolean; note: string };
    r2: { ok: boolean; note: string; sample: number };
  } | null>(null);
  const [pinging, setPinging] = useState(false);
  const groups = useMemo(() => {
    const map = new Map<string, EnvLamp[]>();
    for (const lamp of lamps) {
      const list = map.get(lamp.group) ?? [];
      list.push(lamp);
      map.set(lamp.group, list);
    }
    return [...map.entries()];
  }, [lamps]);
  const ready = lamps.filter((lamp) => lamp.required).every((lamp) => lamp.set);

  return (
    <div className="mt-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Production keys</p>
      <p className="mt-2 max-w-prose text-muted">
        Put secrets in Vercel on the production project. This desk never shows the values — only whether each key is present. {ready ? "Required lamps are green." : "Some required lamps are still dark."}
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">R2 {r2Configured ? "live" : "missing"}</p>
      <ul className="mt-4 max-w-prose space-y-2 text-sm text-muted">
        <li>AUTH_SECRET must match the Terrainfinity hub so radio can mint and read the shared session.</li>
        <li>SSO_HUB must be https://www.terrainfinity.ca. Do not set AUTH_URL to the hub — Radio already mounts /api/auth/* for the Grok session.</li>
        <li>AUTH_COOKIE_DOMAIN=.terrainfinity.ca only on radio.terrainfinity.ca. radio.cyber-athens.ca uses the consume handoff instead of a shared cookie.</li>
        <li>DATABASE_URL is the shared Postgres with the hub — playlist, aliases, and station edits live here. On Vercel use the Supabase Connection pooling URI (Transaction or Session, host *.pooler.supabase.com), not the direct db.*.supabase.co host. Direct URIs are often IPv6-only and fail on Vercel unless an IPv4 add-on is attached.</li>
        <li>R2_ACCOUNT_ID + R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY open the media bucket. R2_BUCKET defaults to media-empire-radio.</li>
      </ul>
      <button
        type="button"
        disabled={pinging}
        onClick={() => {
          setPinging(true);
          void pingServices()
            .then(setPing)
            .catch((error: unknown) => window.alert(error instanceof Error ? error.message : "Ping failed"))
            .finally(() => setPinging(false));
        }}
        className="mt-4 inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg"
      >
        {pinging ? "Pinging…" : "Test hub + R2"}
      </button>
      {ping ? (
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>
            Hub {ping.hub.origin} — {ping.hub.ok ? "reachable" : "dark"} ({ping.hub.note}).
          </li>
          <li>R2 — {ping.r2.ok ? ping.r2.note : ping.r2.note}.</li>
        </ul>
      ) : null}
      {groups.map(([group, items]) => (
        <section key={group} className="mt-6 rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">{group}</h2>
          <ul className="mt-3 space-y-3">
            {items.map((lamp) => (
              <li key={lamp.key} className="flex items-start gap-3">
                <span className={cn("env-dot mt-1.5", lamp.set ? "env-dot-on" : "env-dot-off")} />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[12px] uppercase tracking-[0.12em]">{lamp.key}</p>
                  <p className="text-sm text-muted">
                    {lamp.label}
                    {lamp.required ? " · required" : " · optional"} — {lamp.set ? "active" : "missing"}. {lamp.hint}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
