/** Pages that own the screen. Coming back must not retune the last station over them. */
export function pageCuesPlayback(pathname: string): boolean {
  if (pathname === "/desk" || pathname.startsWith("/desk/")) return true;
  if (pathname.startsWith("/channel/")) return true;
  if (experienceSlugFromPath(pathname)) return true;
  if (pathname.startsWith("/player/") && pathname.length > "/player/".length) return true;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length !== 1) return false;
  return !["library", "experiences", "desk", "about", "login", "logout", "player", "songs"].includes(parts[0]);
}

export function experienceSlugFromPath(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "experiences" || !parts[1] || parts.length !== 2) return null;
  try {
    return decodeURIComponent(parts[1]).toLowerCase();
  } catch {
    return parts[1].toLowerCase();
  }
}

/** Rose stays on the arrival preview until Begin the rite. Never the first playlist song. */
export function shouldHoldRosePreview(
  pathname: string,
  slug: string | null | undefined,
  roseRite: boolean,
): boolean {
  if (roseRite || slug !== "rose") return false;
  if (experienceSlugFromPath(pathname) === "rose") return true;
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "channel" || !parts[1]) return false;
  try {
    return decodeURIComponent(parts[1]).toLowerCase() === "rose";
  } catch {
    return parts[1].toLowerCase() === "rose";
  }
}
