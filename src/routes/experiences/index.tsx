import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { publicChannels } from "@/lib/catalog";
import { experienceRows } from "@/lib/feature-rows";
import { CoverArt } from "@/components/cover-art";
import { DialList, DialPlay, type DialRow } from "@/components/dial-list";
import { DirectoryBrowse } from "@/components/directory-browse";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/experiences/")({
  component: ExperiencesIndex,
  head: () => ({ meta: [{ title: "Experiences · Radio" }] }),
});

function dialFields(row: DialRow) {
  return {
    title: row.title,
    kicker: row.kicker,
    line: row.line,
    category: row.channel?.category,
    tags: row.channel?.tags,
    energy: row.channel?.energy,
    kind: row.channel?.kind,
    mode: row.channel?.mode,
  };
}

function ExperiencesIndex() {
  const catalog = usePlayerStore((s) => s.catalog);
  const views = usePlayerStore((s) => s.views);
  const channels = catalog.channels.length ? catalog.channels : publicChannels();
  const items = useMemo(() => experienceRows(channels, views), [channels, views]);
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Lane</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Experiences</h1>
      <p className="mt-4 max-w-prose text-muted">
        Fixed-order rites. The playlist is the score; the screen is the stage. Newer and most heard stay near the top.
      </p>
      <DirectoryBrowse
        label="experiences"
        defaultView="cards"
        items={items}
        fields={dialFields}
        collapsed={4}
        render={(shown, view) =>
          view === "list" ? (
            <DialList rows={shown} />
          ) : (
            <ul className="grid gap-5">
              {shown.map((item, index) => (
                <li key={item.slug}>
                  <Link
                    to="/experiences/$slug"
                    params={{ slug: item.slug }}
                    className="grid overflow-hidden rounded-2xl bg-bg-elevated shadow-[var(--shadow-filigree)] sm:grid-cols-[14rem_1fr]"
                  >
                    <span className={index === 0 ? "relative block aspect-[4/5] sm:aspect-auto sm:min-h-56" : "relative block aspect-[3/4] sm:aspect-auto sm:min-h-48"}>
                      <CoverArt src={item.cover || "/covers/ember-frequency.jpg"} alt="" className="absolute inset-0 size-full" />
                    </span>
                    <span className="flex flex-col justify-center p-5">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                        {item.featured ? "Featured · " : ""}
                        {item.kicker}
                      </span>
                      <span className="mt-2 font-display text-3xl font-semibold">{item.title}</span>
                      <span className="mt-2 font-glaum text-xl text-gold">{item.line}</span>
                      <DialPlay title={item.title} stationSlug={item.stationSlug} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )
        }
      />
    </div>
  );
}