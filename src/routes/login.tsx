import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { SignInChoices } from "@/components/sign-in-choices";
import { useRadioUser } from "@/lib/radio-user";
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

  useEffect(() => {
    if (!isPending && user) window.location.replace(next);
  }, [isPending, next, user]);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">Frequency</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-4 text-muted">Google opens on terrainfinity.ca. X signs in through the Radio session. Nothing else for now.</p>
      <div className="mt-8 flex justify-center">
        <SignInChoices next={next} />
      </div>
    </div>
  );
}
