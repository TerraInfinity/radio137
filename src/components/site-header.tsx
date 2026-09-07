import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { AutoplayLamp } from "@/components/autoplay-lamp";
import { AuthSlot } from "@/components/auth-slot";
import { getChannel, stationSkin } from "@/lib/catalog";
import { heldClaim } from "@/lib/claim";
import { cn } from "@/lib/cn";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";

const links = [
  { href: "/", label: "Stations", match: (path: string) => path === "/" || path.startsWith("/channel/") },
  { href: "/player", label: "Songs", match: (path: string) => path === "/player" || path.startsWith("/player/") || path === "/library" },
  { href: "/experiences", label: "Experiences", match: (path: string) => path.startsWith("/experiences") },
] as const;

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
  const { isAdmin, user } = useRadioUser();
  const channel = slug ? getChannel(slug) : undefined;
  const onGlaum = Boolean(channel && stationSkin(channel) === "glaum");
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function goSearch(event: FormEvent) {
    event.preventDefault();
    const next = q.trim();
    setOpen(false);
    void navigate({ to: "/", search: { q: next || undefined } });
  }

  const gold = driving?.own ? "text-buzz" : "text-gold";

  function NavLinks({ onPick }: { onPick?: () => void }) {
    return (
      <>
        {links.map((link) => {
          const active = link.match(pathname);
          return (
            <Link
              key={link.href}
              to={link.href}
              onClick={onPick}
              className={cn(
                "inline-flex h-11 shrink-0 items-center px-2.5 font-mono text-[11px] uppercase tracking-[0.14em]",
                active ? gold : "text-muted hover:text-fg",
              )}
            >
              {link.label}
            </Link>
          );
        })}
        {isAdmin ? (
          <Link
            to="/desk"
            onClick={onPick}
            className={cn(
              "inline-flex h-11 shrink-0 items-center px-2.5 font-mono text-[11px] uppercase tracking-[0.14em]",
              pathname.startsWith("/desk") ? "text-gold" : "text-muted hover:text-fg",
            )}
          >
            Desk
          </Link>
        ) : null}
      </>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:px-4">
        <Link to="/" className="min-w-0 shrink-0" onClick={() => setOpen(false)}>
          <p className={cn("mark-radio font-display text-base font-semibold leading-none tracking-[0.28em] sm:text-lg", gold)}>
            Radio
          </p>
        </Link>
        <nav className="ml-2 hidden min-w-0 items-center md:flex">
          <NavLinks />
        </nav>
        <div className="flex-1" />
        <form onSubmit={goSearch} className="relative hidden min-w-0 max-w-52 flex-1 lg:block">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subtle" />
          <input
            className="input h-10 pl-8 text-sm"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search"
            type="search"
            aria-label="Search songs and stations"
          />
        </form>
        {ready && !gateOpen ? (
          <p className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle xl:block">
            {points} pts{onGlaum || glaumules > 0 ? ` · ${glaumules} glåümules` : ""}
          </p>
        ) : null}
        <AutoplayLamp compact />
        <AuthSlot />
        <button
          type="button"
          className="inline-flex size-11 shrink-0 items-center justify-center text-gold md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-line bg-bg px-3 py-3 md:hidden">
          <nav className="flex flex-col">
            <NavLinks onPick={() => setOpen(false)} />
          </nav>
          <form onSubmit={goSearch} className="relative mt-2">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subtle" />
            <input
              className="input h-11 pl-8 text-sm"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Songs, stations"
              type="search"
              aria-label="Search songs and stations"
            />
          </form>
          {user ? (
            <a href="/logout" className="mt-2 inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
              Sign out
            </a>
          ) : (
            <a href={`/login?next=${encodeURIComponent(pathname || "/")}`} className="mt-2 inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              Sign in
            </a>
          )}
        </div>
      ) : null}
    </header>
  );
}
