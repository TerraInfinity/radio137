import { useState } from "react";
import { signIn } from "@/lib/auth/client";
import { cn } from "@/lib/cn";
import { ssoLoginHref } from "@/lib/radio-user";

export function SignInChoices({ next = "/", stacked = true }: { next?: string; stacked?: boolean }) {
  const [busy, setBusy] = useState<"google" | "x" | null>(null);
  const path = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  async function withX() {
    setBusy("x");
    try {
      await signIn("grok-x", { callbackURL: path, errorCallbackURL: "/login" });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "X sign-in failed");
      setBusy(null);
    }
  }

  return (
    <div className={cn("flex gap-2", stacked ? "flex-col" : "flex-wrap")}>
      <a
        href={ssoLoginHref(path)}
        onClick={() => setBusy("google")}
        className="inline-flex h-12 min-w-44 items-center justify-center rounded-md bg-fg px-6 font-mono text-[12px] uppercase tracking-[0.16em] text-bg"
      >
        {busy === "google" ? "Opening Google…" : "Continue with Google"}
      </a>
      <button
        type="button"
        disabled={Boolean(busy)}
        onClick={() => void withX()}
        className="inline-flex h-12 min-w-44 items-center justify-center rounded-md px-6 font-mono text-[12px] uppercase tracking-[0.16em] text-gold shadow-[var(--shadow-border)]"
      >
        {busy === "x" ? "Opening X…" : "Continue with X"}
      </button>
    </div>
  );
}
