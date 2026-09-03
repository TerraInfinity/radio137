import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({ meta: [{ title: "About · Radio" }] }),
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Manual</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">About</h1>
      <div className="mt-6 space-y-4 text-muted">
        <p>
          Radio is a nocturnal temple-broadcast. The green lamp in the header starts a station when you
          open it. First visit lands on Default. After that, this browser resumes the last desk you
          touched. Listening does not require an account.
        </p>
        <p>
          The{" "}
          <Link to="/desk" className="text-cyan">
            station desk
          </Link>{" "}
          maps folders to stations. This preview keeps the public dial, the collapsed player, and a
          compact upcoming list. The full host explorer stays on the origin radio.
        </p>
        <p>Credits appear only when a real original URL is added to a cut.</p>
      </div>
    </div>
  );
}
