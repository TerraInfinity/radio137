import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { ShrimpProvider } from "@/components/shrimp-context";
import { RadioShell } from "@/components/radio-shell";
import { shrimpForVisit } from "@/lib/shrimpify";
import appCss from "../styles.css?url";

const APP_NAME = "Radio";

export const Route = createRootRoute({
  loader: async () => {
    if (typeof document !== "undefined") {
      return { shrimp: shrimpForVisit(window.location.hostname, document.cookie, window.location.pathname) };
    }
    const { readShrimpVisit } = await import("@/lib/shrimp-visit");
    return readShrimpVisit();
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#070605" },
      {
        name: "description",
        content: "Welcome to the Light Ages. A chaos primer in relative time — a radio of frequencies.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Syne:wght@500;600;700;800&display=swap",
      },
    ],
  }),
  component: Root,
});

function Root() {
  const { shrimp } = Route.useLoaderData();
  return (
    <html lang="en" data-shrimp={shrimp ? "1" : "0"} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <ShrimpProvider initial={shrimp}>
            <RadioShell>
              <Outlet />
            </RadioShell>
          </ShrimpProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
