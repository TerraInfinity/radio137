import { Link, useRouterState } from "@tanstack/react-router";
import { AuthSlot, HubLinks } from "@/components/auth-slot";
import { DriveBadge } from "@/components/drive-badge";
import { heldClaim } from "@/lib/claim";
import { cn } from "@/lib/cn";
import { usePlayerStore } from "@/lib/player-store";

const links = [
  { href: "/", label: "Stations" },
  { href: "/player", label: "Player" },
  { href: "/rankings", label: "Rankings" },
  { href: "/library", label: "Library" },
  { href: "/about", label: "About" },
  { href: "/desk", label: "Desk" },
];

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const identity = usePlayerStore((s) => s.identity);
  const claims = usePlayerStore((s) => s.claims);
  const driving = heldClaim(claims, identity);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
        <Link to="/" className="min-w-0 shrink-0">
          <p
            className={cn(
              "mark-radio font-display text-lg font-semibold leading-none tracking-[0.28em]",
              driving?.own ? "text-buzz" : "text-gold",
            )}
          >
            Radio
          </p>
        </Link>
        <DriveBadge />
        <nav className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
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
        </nav>
        <HubLinks />
        <AuthSlot />
        {identity ? (
          <span className="hidden max-w-24 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted xl:inline">
            {identity.name}
          </span>
        ) : null}
      </div>
    </header>
  );
}
