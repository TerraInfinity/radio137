import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";

function nativeShareOk(): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return true;
  return navigator.maxTouchPoints > 1 && window.matchMedia("(pointer: coarse)").matches;
}

export function ShareLink({ path, title, compact = false }: { path: string; title: string; compact?: boolean }) {
  const hrefPath = path.startsWith("/") ? path : `/${path}`;
  const [href, setHref] = useState(hrefPath);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setHref(`${window.location.origin}${hrefPath}`);
  }, [hrefPath]);

  async function share() {
    const url = href.startsWith("http") ? href : `${window.location.origin}${hrefPath}`;
    if (nativeShareOk()) {
      try {
        await navigator.share({ title, url, text: title });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
      {compact ? null : (
        <p className="hidden min-w-0 flex-1 truncate font-mono text-[11px] text-subtle sm:block" title={href}>
          {href}
        </p>
      )}
      <button
        type="button"
        onClick={() => void share()}
        className="inline-flex h-11 shrink-0 items-center gap-2 px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
      >
        <Share2 className="size-4" />
        Share
      </button>
      {copied ? <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">URL copied</span> : null}
    </div>
  );
}
