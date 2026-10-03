/** Host picks the face. A saved toggle is a cookie for that host only, so radio and shrimpify never share it. */

export const GLAUM_STATION = "official-glaum-frequency";
export const SHRIMP_COOKIE = "radio_shrimp";

export function hostWantsShrimp(host: string): boolean {
  const name = host.toLowerCase().split(",")[0].trim().replace(/:\d+$/, "").replace(/\.$/, "");
  return name === "shrimpify.com" || name === "www.shrimpify.com" || name === "shrimpify.ca" || name === "www.shrimpify.ca";
}

export function shrimpFromCookie(cookie: string): boolean | null {
  const match = cookie.match(/(?:^|;\s*)radio_shrimp=([01])(?:;|$)/);
  if (!match) return null;
  return match[1] === "1";
}

/** First paint. Home is always full Radio. The station set is the Shrimpify screen. */
export function shrimpForVisit(host: string, cookie: string, path = "/"): boolean {
  const clean = (path.split("?")[0] || "/").replace(/\/$/, "") || "/";
  if (clean === "/") return false;
  if (hostWantsShrimp(host) && (clean === "/stations" || clean.startsWith("/channel/"))) return true;
  return shrimpFromCookie(cookie) === true;
}

export function writeShrimpCookie(on: boolean) {
  if (typeof document === "undefined") return;
  document.cookie = `${SHRIMP_COOKIE}=${on ? "1" : "0"}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
