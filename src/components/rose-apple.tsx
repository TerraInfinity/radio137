import { useEffect, useState } from "react";
import { applePodcastUrl, roseFeedUrl } from "@/lib/rose-feed";

export function useRoseFeed() {
  const [feed, setFeed] = useState("https://radio.terrainfinity.ca/feeds/rose.xml");
  useEffect(() => {
    setFeed(roseFeedUrl(window.location.origin));
  }, []);
  return feed;
}

/** Opens Podcasts on iPhone. Elsewhere, copies the feed and shows the paste path. */
export function SendToIphone({ className, onFallback }: { className?: string; onFallback?: (message: string) => void }) {
  const feed = useRoseFeed();
  return (
    <a
      className={className}
      href={applePodcastUrl(feed)}
      onClick={(event) => {
        const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
        if (ios) return;
        event.preventDefault();
        const message = "Podcasts → Library → + → Add a Show by URL → paste.";
        void navigator.clipboard?.writeText(feed).catch(() => undefined);
        onFallback?.(message);
      }}
    >
      Send to iPhone
    </a>
  );
}

export function RoseApple() {
  const [hint, setHint] = useState("");
  return (
    <span className="rose-apple">
      <SendToIphone className="rose-opera-ghost" onFallback={setHint} />
      {hint ? <span className="rose-apple-url">{hint}</span> : null}
    </span>
  );
}
