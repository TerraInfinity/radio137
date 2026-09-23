import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { publicChannels } from "@/lib/catalog";
import { experienceRows } from "@/lib/feature-rows";
import { usePlayerStore } from "@/lib/player-store";

export const Route = createFileRoute("/experiences/")({
  component: ExperiencesIndex,
  head: () => ({ meta: [{ title: "Experiences · Radio" }] }),
});

function ExperiencesIndex() {
  const catalog = usePlayerStore((s) => s.catalog);
  const views = usePlayerStore((s) => s.views);
  const channels = catalog.channels.length ? catalog.channels : publicChannels();
  const items = useMemo(() => experienceRows(channels, views), [channels, views]);
  const [open, setOpen] = useState(false);
  const shown = open ? items : items.slice(0, 4);
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 pb-52">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Lane</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Experiences</h1>
      <p className="mt-4 max-w-prose text-muted">
        Fixed-order rites. The playlist is the score; the screen is the stage. Newer and most heard stay near the top.
      </p>
      <ul className="mt-10 grid gap-5">
        {shown.map((item, index) => (
          <li key={item.slug}>
            <Link
              to="/experiences/$slug"
              params={{ slug: item.slug }}
              className="grid overflow-hidden rounded-2xl bg-bg-elevated shadow-[var(--shadow-filigree)] sm:grid-cols-[14rem_1fr]"
            >
              <img src={item.cover || "/covers/ember-frequency.jpg"} alt="" className={index === 0 ? "aspect-[4/5] h-full w-full object-cover sm:aspect-auto sm:min-h-56" : "aspect-[3/4] h-full w-full object-cover sm:aspect-auto sm:min-h-48"} />
              <span className="flex flex-col justify-center p-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                  {item.featured ? "Featured · " : ""}
                  {item.kicker}
                </span>
                <span className="mt-2 font-display text-3xl font-semibold">{item.title}</span>
                <span className="mt-2 font-glaum text-xl text-gold">{item.line}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {items.length > 4 ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="mt-4 inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.16em] text-gold"
        >
          {open ? "Show less" : `Show the rest · ${items.length - 4}`}
        </button>
      ) : null}
    </div>
  );
}
