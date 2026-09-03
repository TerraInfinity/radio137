import { Link, useRouterState } from "@tanstack/react-router";
import { AutoplayLamp } from "@/components/autoplay-lamp";
import { AuthSlot, HubLinks } from "@/components/auth-slot";
import { getChannel, stationSkin } from "@/lib/catalog";
import { heldClaim } from "@/lib/claim";
import { cn } from "@/lib/cn";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";

const links = [
  { href: "/", label: "Stations" },
  { href: "/player", label: "Player" },
  { href: "/library", label: "Library" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const identity = usePlayerStore((s) => s.identity);
  const claims = usePlayerStore((s) => s.claims);
  const driving = heldClaim(claims, identity);
  const points = usePlayerStore((s) => s.points);
  const glaumules = usePlayerStore((s) => s.glaumules);
  const slug = usePlayerStore((s) => s.channelSlug);
  const ready = usePlayerStore((s) => s.ready);
  const gateOpen = usePlayerStore((s) => s.gateOpen);
  const { isAdmin } = useRadioUser();
  const channel = slug ? getChannel(slug) : undefined;
  const onGlaum = Boolean(channel && stationSkin(channel) === "glaum");

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
        <Link to="/" className="min-w-0 shrink-0">
          <p className={cn("mark-radio font-display text-lg font-semibold leading-none tracking-[0.28em]", driving?.own ? "text-buzz" : "text-gold")}>
            Radio
          </p>
        </Link>
        <nav className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "inline-flex h-11 shrink-0 items-center px-2 font-mono text-[11px] uppercase tracking-[0.14em]",
                  active ? (driving?.own ? "text-buzz" : "text-gold") : "text-muted hover:text-fg",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {isAdmin ? (
            <Link
              to="/desk"
              className={cn(
                "inline-flex h-11 shrink-0 items-center px-2 font-mono text-[11px] uppercase tracking-[0.14em]",
                pathname.startsWith("/desk") ? "text-gold" : "text-muted hover:text-fg",
              )}
            >
              Desk
            </Link>
          ) : null}
        </nav>
        {ready && !gateOpen ? (
          <p className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle lg:block">
            {points} pts{onGlaum || glaumules > 0 ? ` · ${glaumules} glåümules` : ""}
          </p>
        ) : null}
        <AutoplayLamp />
        <HubLinks />
        <AuthSlot />
      </div>
    </header>
  );
}
