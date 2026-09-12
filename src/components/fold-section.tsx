import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Advanced blocks start closed so the page stays a listen surface. */
export function FoldSection({
  title,
  hint = "Open",
  defaultOpen = false,
  children,
  className,
  titleClassName,
}: {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={cn("mt-6 overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-border)]", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex h-12 w-full items-center justify-between gap-3 px-3 text-left"
      >
        <span className={cn("min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-subtle", titleClassName)}>
          {title}
        </span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-gold">{open ? "Close" : hint}</span>
      </button>
      {open ? <div className="border-t border-line p-3">{children}</div> : null}
    </section>
  );
}

/** Nested disclosure for forms already inside a card — no second chrome. */
export function FoldDetails({
  title,
  hint = "Open",
  defaultOpen = false,
  children,
}: {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex h-11 w-full items-center justify-between gap-3 text-left"
      >
        <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">{title}</span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-gold">{open ? "Close" : hint}</span>
      </button>
      {open ? <div className="space-y-3 border-t border-line pt-3">{children}</div> : null}
    </div>
  );
}
