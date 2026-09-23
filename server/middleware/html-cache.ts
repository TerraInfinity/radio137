/**
 * CDN cache for anonymous public HTML. Cuts Vercel Fast Origin Transfer on
 * repeat hits to /, /channel/*, /player/*, and alias pages.
 * /desk, auth, and APIs stay private / uncached.
 */
function isPrivatePath(path: string): boolean {
  return (
    path === "/desk" ||
    path.startsWith("/desk/") ||
    path === "/login" ||
    path.startsWith("/login/") ||
    path === "/logout" ||
    path.startsWith("/api/") ||
    path.startsWith("/auth/")
  );
}

function isHtml(response: Response): boolean {
  return String(response.headers.get("content-type") ?? "").includes("text/html");
}

export default async function htmlCacheMiddleware(
  event: { url: URL; req: { method: string } },
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const result = await next();
  if (!(result instanceof Response)) return result;
  if (result.status >= 300 && result.status < 400) return result;
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return result;
  const path = event.url.pathname;
  const existing = (result.headers.get("cache-control") || "").toLowerCase();
  if (isPrivatePath(path) || result.headers.has("set-cookie")) {
    result.headers.set("Cache-Control", "private, no-store");
    return result;
  }
  if (existing.includes("no-cache") || existing.includes("private")) return result;
  if (isHtml(result) || path === "/" || path.startsWith("/channel/") || path.startsWith("/player/")) {
    result.headers.set("Cache-Control", "public, s-maxage=180, stale-while-revalidate=600");
  }
  return result;
}
