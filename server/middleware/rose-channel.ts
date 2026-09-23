/**
 * /channel/rose is the old station URL. The only Rose frontend is the experience.
 */
export default function roseChannelRedirect(
  event: { url: URL },
  next: () => unknown | Promise<unknown>,
): unknown | Promise<unknown> {
  const path = event.url.pathname.replace(/\/+$/, "") || "/";
  if (path.toLowerCase() !== "/channel/rose") return next();
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/experiences/rose${event.url.search}`,
      "Cache-Control": "no-store",
    },
  });
}
