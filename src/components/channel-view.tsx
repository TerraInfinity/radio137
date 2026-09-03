import { useEffect, useState } from "react";
import { Play, Star } from "lucide-react";
import { ClaimBooth } from "@/components/claim-booth";
import { ModePill } from "@/components/mode-pill";
import { NowPlayingCard } from "@/components/now-playing-card";
import { StationVisual } from "@/components/station-visual";
import { UpcomingList } from "@/components/upcoming-list";
import { channelIsLive, getChannel, getPlayableTracks, isAdultTrack, isChannelNsfw } from "@/lib/catalog";
import { heldClaim } from "@/lib/claim";
import { cn } from "@/lib/cn";
import { loadFavorites, toggleFavorite } from "@/lib/favorites";
import { upcomingTracks, liveCursor } from "@/lib/playback";
import { loadRanks, voteRank } from "@/lib/ranks";
import { usePlayerStore } from "@/lib/player-store";
import type { Channel } from "@/lib/types";

export function ChannelView({ slug }: { slug: string }) {
  const catalog = usePlayerStore((s) => s.catalog);
  const ready = usePlayerStore((s) => s.ready);
  const channel = catalog.channels.find((item) => item.slug === slug) ?? getChannel(slug) ?? null;

  if (!channel) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember">Missing frequency</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">No such channel</h1>
        <p className="mt-4 text-muted">{ready ? "That slug is not on the grid." : "Tuning the catalog."}</p>
      </div>
    );
  }

  return <ChannelBody channel={channel} />;
}

function ChannelBody({ channel }: { channel: Channel }) {
  const status = usePlayerStore((s) => s.status);
  const track = usePlayerStore((s) => s.track);
  const channelSlug = usePlayerStore((s) => s.channelSlug);
  const ready = usePlayerStore((s) => s.ready);
  const autoplay = usePlayerStore((s) => s.autoplay);
  const gateOpen = usePlayerStore((s) => s.gateOpen);
  const claims = usePlayerStore((s) => s.claims);
  const identity = usePlayerStore((s) => s.identity);
  const tuneIn = usePlayerStore((s) => s.tuneIn);
  const [fav, setFav] = useState(() => loadFavorites().includes(channel.slug));
  const [score, setScore] = useState(() => loadRanks().channels[channel.slug] ?? 0);

  useEffect(() => {
    if (!channel.enabled) return;
    if (!autoplay) return;
    if (gateOpen) return;
    void tuneIn(channel.slug);
  }, [autoplay, channel.enabled, channel.slug, gateOpen, tuneIn]);

  const nsfw = isChannelNsfw(channel);
  const tunedHere = channelSlug === channel.slug;
  const playable = getPlayableTracks(channel);
  const live = ready && channelIsLive(channel) ? liveCursor(playable, Date.now(), channel.slug) : null;
  const currentRaw = tunedHere && track ? track : live?.track ?? playable[0] ?? null;
  const current = currentRaw && isAdultTrack(currentRaw) && !nsfw ? null : currentRaw;
  const upcoming = upcomingTracks(channel, current?.id ?? null, 16);
  const driving = heldClaim(claims, identity);
  const deskHeld = driving?.slug === channel.slug;
  const drivingHere = Boolean(deskHeld && driving?.own);

  if (!channel.enabled) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <StationVisual channel={channel} dimmed size="hero" className="aspect-[4/3] w-full rounded-xl" />
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          {nsfw ? "18+ · Off air" : "Off air"}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{channel.name}</h1>
        <p className="mt-8 rounded-xl bg-bg-elevated p-4 font-mono text-[12px] uppercase tracking-[0.14em] text-gold shadow-[var(--shadow-border)]">
          {nsfw
            ? "This frequency is locked. Playlist names stay hidden until you enable the desk."
            : "This desk is dark."}
        </p>
      </div>
    );
  }

  const statusLabel =
    playable.length === 0
      ? "No playable signal"
      : status === "missing" && tunedHere
        ? "Missing audio"
        : status === "loading" && tunedHere
          ? "Tuning"
          : current
            ? current.title
            : "Ready";

  return (
    <div className={cn("mx-auto max-w-3xl px-4 py-8", channel.skin === "glaum" && "glaum-page")}>
      <div
        className={cn(
          "overflow-hidden rounded-xl",
          channel.skin === "glaum"
            ? "glaum-panel"
            : "filigree-frame shadow-[var(--shadow-filigree)]",
          channel.skin === "glaum" && "skin-glaum",
          channel.skin === "waheguru" && "skin-waheguru filigree-frame shadow-[var(--shadow-filigree)]",
          drivingHere || deskHeld ? "skin-buzz" : null,
        )}
      >
        <StationVisual channel={channel} size="hero" className="aspect-[4/3] w-full" />
      </div>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          {channel.skin === "glaum" ? (
            <p className="glaum-kicker font-mono text-[11px] uppercase">What If · Theme frequency</p>
          ) : null}
          <h1
            className={cn(
              "font-display text-4xl font-semibold tracking-tight",
              channel.skin === "glaum" && "glaum-title mt-2 text-5xl sm:text-6xl",
            )}
          >
            {channel.skin === "glaum" ? "Glåüm" : channel.name}
          </h1>
          {channel.skin === "glaum" ? (
            <p className="glaum-sponsor mt-2 font-mono text-[10px] uppercase">Sponsored by Shrimp™</p>
          ) : (
            <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.16em] text-muted">{channel.energy}</p>
          )}
        </div>
        <ModePill kind={channel.kind} mode={channel.mode} enabled nsfw={isChannelNsfw(channel)} />
      </div>
      {channel.skin === "glaum" ? (
        <p className="mt-5 max-w-prose font-glaum text-xl italic leading-relaxed text-prom/80">
          Many hands make light work. Carpets, strange music, soft lighting. Listening is enough.
        </p>
      ) : null}
      {channel.skin === "waheguru" ? (
        <p className="mt-4 max-w-prose text-waheguru">Slow gold. The name is the song.</p>
      ) : null}
      <p className="mt-4 max-w-prose text-muted">{channel.description}</p>
      {channel.tags.length > 0 ? (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
          {channel.category ? `${channel.category} · ` : ""}
          {channel.tags.join(" · ")}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void tuneIn(channel.slug, { forcePlay: true })}
          className={cn(
            "inline-flex h-12 min-w-44 items-center justify-center gap-2 px-5 text-[12px] uppercase",
            channel.skin === "glaum" ? "btn-glaum" : "rounded-md bg-fg font-mono tracking-[0.16em] text-bg",
          )}
        >
          <Play className="size-4" />
          {tunedHere && status === "playing" ? "Retune" : "Tune in"}
        </button>
        <button
          type="button"
          onClick={() => setFav(toggleFavorite(channel.slug).includes(channel.slug))}
          className={cn(
            "inline-flex h-12 items-center gap-2 px-3 font-mono text-[11px] uppercase tracking-[0.14em]",
            channel.skin === "glaum" ? "btn-glaum-ghost text-glaum-gold" : "text-gold",
          )}
        >
          <Star className={cn("size-4", fav && "fill-gold")} />
          {fav ? "Favorited" : "Favorite"}
        </button>
        <button
          type="button"
          onClick={() => setScore(voteRank("channels", channel.slug, 1).channels[channel.slug] ?? 0)}
          className="inline-flex h-12 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted"
        >
          Upvote · {score}
        </button>
        {channel.claimable ? (
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new Event("radio:open-booth"));
              const booth = document.getElementById("dj-booth");
              booth?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              const next = `${window.location.pathname}${window.location.search}#dj-booth`;
              window.history.replaceState(null, "", next);
            }}
            className={cn(
              "inline-flex h-12 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]",
              drivingHere ? "text-buzz" : "btn-buzz px-4",
            )}
          >
            {drivingHere ? "Your booth" : deskHeld ? "Booth held" : "Claim booth"}
          </button>
        ) : null}
      </div>
      {channel.skin === "glaum" ? (
        <p className="mt-5">
          <a
            href="https://camp.glaum.ca/"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-glaum-gold"
          >
            camp.glaum.ca
          </a>
        </p>
      ) : null}

      {channel.skin === "glaum" ? <div className="glaum-rule mt-8" /> : null}

      <div className="mt-8">
        <NowPlayingCard channel={channel} track={current} statusLabel={statusLabel} driving={drivingHere} held={deskHeld} />
      </div>

      <UpcomingList slug={channel.slug} upcoming={upcoming} live={channelIsLive(channel)} cover={channel.cover} />
      <ClaimBooth channel={channel} />
    </div>
  );
}
