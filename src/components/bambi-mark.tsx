import { cn } from "@/lib/cn";

function Cuff({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 18" aria-hidden>
      <rect x="2" y="3" width="32" height="12" rx="6" />
      <rect x="15" y="1" width="6" height="7" rx="1" />
      <circle cx="18" cy="4.2" r="1" />
    </svg>
  );
}

/** Hot-pink Bambi's, with lace and cuffs when the mark is the heading. */
export function BambiMark({ name, ornate = false }: { name: string; ornate?: boolean }) {
  const shown = name.replace("Lady Bambi's Elysium", "Bambi's Elysium");
  if (!shown.startsWith("Bambi's")) return <>{name}</>;
  return (
    <span className={cn("bambi-mark", ornate && "is-ornate")}>
      {ornate ? <Cuff className="bambi-cuff" /> : null}
      <strong className="bambi-name">Bambi's</strong>
      {shown.slice("Bambi's".length)}
      {ornate ? <Cuff className="bambi-cuff" /> : null}
    </span>
  );
}
