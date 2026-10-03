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
  head: ({ loaderData }) => {
    const glaum = Boolean(loaderData?.shrimp);
    const icon = glaum ? "/brand/glaum-icon-32.png" : "/brand/radio-icon-32.png";
    const touch = glaum ? "/brand/glaum-icon-180.png" : "/brand/radio-icon-180.png";
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: glaum ? "Glåüm" : APP_NAME },
        { name: "theme-color", content: glaum ? "#2a1836" : "#070605" },
        {
          name: "description",
          content: glaum
            ? "You are listening to Glåüm Radio."
            : "Welcome to the Light Ages. A chaos primer in relative time — a radio of frequencies.",
        },
      ],
      links: [
        { rel: "icon", type: "image/png", sizes: "32x32", href: icon },
        { rel: "apple-touch-icon", href: touch },
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: "/__grok/manifest.webmanifest" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Syne:wght@500;600;700;800&display=swap",
        },
      ],
    };
  },
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
