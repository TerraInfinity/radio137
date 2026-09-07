import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DeskStations } from "@/components/desk-stations";
import { DeskDirectory } from "@/components/desk-directory";
import {
  addStationTrack,
  deleteR2Object,
  listStationR2,
  moveR2Object,
  pingServices,
} from "@/lib/desk-api";
import { applyCatalogEdits, type CatalogEdit, type StationEdit } from "@/lib/catalog-edits";
import { getCatalog, getSeedCatalog } from "@/lib/catalog";
import { cn } from "@/lib/cn";
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

function DeskPage() {
  const { user, isAdmin, isPending, r2Configured, lamps } = useRadioUser();
  const catalog = usePlayerStore((s) => s.catalog);
  const channels = catalog.channels.length ? catalog.channels : getCatalog().channels;
  const [tab, setTab] = useState<"stations" | "directory" | "r2" | "services">("stations");

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
    <div className="mx-auto max-w-6xl px-4 py-8 pb-44">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">C · God desk</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Station desk</h1>
      <p className="mt-3 max-w-prose text-muted">
        Featured rail, playlists, and a directory so copied folders list as one song. Files stay on R2.
      </p>
      <div className="mt-6 flex flex-wrap gap-1">
        {(
          [
            ["stations", "Stations"],
            ["directory", "Directory"],
            ["r2", "R2"],
            ["services", "Services"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
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
      {tab === "r2" ? <R2Board channels={channels} r2Configured={r2Configured} /> : null}
      {tab === "services" ? <ServicesBoard r2Configured={r2Configured} lamps={lamps} /> : null}
    </div>
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
  const [assign, setAssign] = useState(channels[0]?.slug ?? "");

  function refresh(nextPrefix = prefix) {
    setStatus("loading");
    void listStationR2({ data: { prefix: nextPrefix } })
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

  useEffect(() => {
    if (r2Configured) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r2Configured]);

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
      <form
        className="flex flex-wrap gap-2"
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
      {status === "loading" ? <p className="mt-4 text-sm text-muted">Listing…</p> : null}
      {status === "error" ? <p className="mt-4 text-sm text-ember">{error}</p> : null}
      <ul className="mt-4 max-h-[28rem] space-y-1 overflow-y-auto rounded-xl bg-bg-elevated p-3">
        {objects.map((object) => (
          <li key={object.key} className="flex flex-wrap items-center gap-2 py-1">
            <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-subtle">{object.key}</span>
            <select className="input w-40" value={assign} onChange={(event) => setAssign(event.target.value)}>
              {channels.map((channel) => (
                <option key={channel.slug} value={channel.slug}>
                  {channel.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                const objectTitle = object.key.split("/").pop()?.replace(/\.[^.]+$/, "") || object.key;
                void addStationTrack({ data: { channelSlug: assign, title: objectTitle, audioUrl: object.url, r2Key: object.key } })
                  .then((result) => applySnapshot(result.tracks, result.stations))
                  .catch((err: unknown) => window.alert(err instanceof Error ? err.message : "Import failed"));
              }}
              className="inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold"
            >
              Import
            </button>
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
