import { heldClaim } from "@/lib/claim";
import { usePlayerStore } from "@/lib/player-store";

export function Atmosphere() {
  const catalog = usePlayerStore((s) => s.catalog);
  const channelSlug = usePlayerStore((s) => s.channelSlug);
  const status = usePlayerStore((s) => s.status);
  const claims = usePlayerStore((s) => s.claims);
  const identity = usePlayerStore((s) => s.identity);
  const theme = catalog.theme;
  const clockwork = theme?.clockwork !== false;
  const sand = theme?.sand !== false;
  const intensity = theme?.intensity ?? 0.55;
  const channel = catalog.channels.find((item) => item.slug === channelSlug);
  const glaum = channel?.skin === "glaum" && (status === "playing" || status === "loading");
  const wahe = channel?.skin === "waheguru" && (status === "playing" || status === "loading");
  const driving = heldClaim(claims, identity)?.own;
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {clockwork ? (
        <div className="atmosphere-clockwork" style={{ opacity: 0.12 + intensity * 0.22 }}>
          <span className="gallifrey gallifrey-a" />
          <span className="gallifrey gallifrey-b" />
          <span className="gear gear-a" />
          <span className="gear gear-b" />
          <span className="gear gear-c" />
          <span className="dial" />
        </div>
      ) : null}
      {sand ? (
        <>
          <div className="atmosphere-sand" style={{ opacity: 0.08 + intensity * 0.2 }} />
          <div className="sand-grain" style={{ opacity: 0.12 + intensity * 0.18 }} />
        </>
      ) : null}
      {glaum ? (
        <>
          <div className="atmosphere-glaum" />
          <div className="atmosphere-glaum-spark" />
          <div className="atmosphere-glaum-shrimp" />
        </>
      ) : null}
      {wahe ? <div className="atmosphere-wahe" /> : null}
      {driving ? (
        <>
          <div className="atmosphere-buzz" />
          <div className="atmosphere-buzz-arc" />
          <div className="atmosphere-buzz-bolt" />
        </>
      ) : null}
      <div className="atmosphere-vignette" />
    </div>
  );
}
