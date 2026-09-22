/** Pages that own the desk: do not restore lastSlug from another station. */
export function pageCuesPlayback(pathname: string): boolean {
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
