import { useEffect, useState } from "react";
import { renderSVG } from "uqr";
import { applePodcastUrl, roseFeedUrl } from "@/lib/rose-feed";

export function RoseApple() {
  const [open, setOpen] = useState(false);
  const [feed, setFeed] = useState("");

  useEffect(() => {
    setFeed(roseFeedUrl(window.location.origin));
  }, []);

  const qr = feed ? renderSVG(feed, { border: 2, pixelSize: 4, ecc: "M", whiteColor: "#fff", blackColor: "#14080c" }) : "";

  return (
    <div className="rose-apple">
      <button type="button" className="rose-opera-ghost" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        Send to Apple
      </button>
      {open && feed ? (
        <div className="rose-apple-card" role="dialog" aria-label="Send Rose to Apple">
          <p>Subscribe on the phone. The Watch copies Rose from the phone. It never opens this feed itself.</p>
          <a className="rose-apple-go" href={applePodcastUrl(feed)}>
            Open in Podcasts
          </a>
          <a className="rose-apple-url" href={feed}>
            {feed.replace(/^https:\/\//, "")}
          </a>
          <div className="rose-apple-qr" dangerouslySetInnerHTML={{ __html: qr }} />
        </div>
      ) : null}
    </div>
  );
}
