import { createServerFn } from "@tanstack/react-start";
import { shrimpForVisit } from "@/lib/shrimpify";

/** Server read of this host's cookie. The handler stays off the client bundle. */
export const readShrimpVisit = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const path = new URL(request.url).pathname;
    return { shrimp: shrimpForVisit(host, request.headers.get("cookie") || "", path) };
  } catch {
    return { shrimp: false };
  }
});

/** Host of this request. Used to send shrimpify.ca straight to the station set. */
export const readVisitHost = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    return request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  } catch {
    return "";
  }
});
