import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { ssoLoginHref, useRadioUser } from "@/lib/radio-user";
import { safeNext } from "@/lib/sso";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in · Radio" }] }),
});

function LoginPage() {
  const { user, isPending } = useRadioUser();
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const next = safeNext(params.get("next"));
  const href = ssoLoginHref(next);

  useEffect(() => {
    if (isPending) return;
    if (user) {
      window.location.replace(next);
      return;
    }
    window.location.assign(href);
  }, [href, isPending, next, user]);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">Frequency</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-4 text-muted">Google opens on terrainfinity.ca. This radio only consumes the one-time code the hub sends back.</p>
      <a href={href} className="mt-8 inline-flex h-12 min-w-44 items-center justify-center rounded-md bg-fg px-6 font-mono text-[12px] uppercase tracking-[0.16em] text-bg">
        Sign in with Google
      </a>
    </div>
  );
}
