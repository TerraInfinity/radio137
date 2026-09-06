import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";

export function ShareLink({ path, title }: { path: string; title: string }) {
  const hrefPath = path.startsWith("/") ? path : `/${path}`;
  const [href, setHref] = useState(hrefPath);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setHref(`${window.location.origin}${hrefPath}`);
  }, [hrefPath]);

  async function share() {
    const url = href.startsWith("http") ? href : `${window.location.origin}${hrefPath}`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, url, text: title });
        return;
      }
    } catch {
      /* fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-subtle" title={href}>
        {href}
      </p>
      <button
        type="button"
        onClick={() => void share()}
        className="inline-flex h-11 shrink-0 items-center gap-2 px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
      >
        <Share2 className="size-4" />
        {copied ? "Copied" : "Share"}
      </button>
    </div>
  );
}
