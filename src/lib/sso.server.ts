import { jwtVerify, SignJWT } from "jose";
import { getRequest } from "@tanstack/react-start/server";
import { isAdminEmail, normalizeEmail } from "@/lib/admins";
import type { EnvLamp } from "@/lib/env-lamps";

export type { EnvLamp } from "@/lib/env-lamps";

export const SSO_COOKIE = "radio_sso";
export const SSO_NEXT_COOKIE = "radio_sso_next";
const SESSION_DAYS = 30;

export type SsoUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

export type RadioUser = SsoUser & { isAdmin: boolean; source: "sso" | "hub" | "better-auth" };

function extraAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(/[,;\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function hubOrigin(): string {
  return (process.env.SSO_HUB || process.env.AUTH_URL || "https://terrainfinity.ca").replace(/\/$/, "");
}

function sessionSecret(): Uint8Array {
  const raw = process.env.AUTH_SECRET?.trim() || process.env.BETTER_AUTH_SECRET?.trim() || "radio-preview-sso-secret";
  return new TextEncoder().encode(raw);
}

export function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "") || "https";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
  return `${proto}://${host}`;
}

function cookieDomain(request: Request): string | undefined {
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "").split(":")[0];
  if (host === "terrainfinity.ca" || host.endsWith(".terrainfinity.ca")) return ".terrainfinity.ca";
  return undefined;
}

export function isRelativeNext(next: string | null | undefined): next is string {
  if (!next) return false;
  if (!next.startsWith("/")) return false;
  if (next.startsWith("//") || next.includes("\\")) return false;
  if (next.includes("://")) return false;
  return true;
}

export function safeNext(next: string | null | undefined): string {
  return isRelativeNext(next) ? next : "/";
}

function serializeCookie(name: string, value: string, request: Request, maxAge: number): string {
  const parts = [`${name}=${value}`, "Path=/", "HttpOnly", "SameSite=Lax"];
  if (requestOrigin(request).startsWith("https://")) parts.push("Secure");
  const domain = cookieDomain(request);
  if (domain) parts.push(`Domain=${domain}`);
  parts.push(`Max-Age=${maxAge}`);
  return parts.join("; ");
}

export function clearSsoCookie(request: Request): string {
  return serializeCookie(SSO_COOKIE, "", request, 0);
}

export function mintNextCookie(next: string, request: Request): string {
  return serializeCookie(SSO_NEXT_COOKIE, encodeURIComponent(safeNext(next)), request, 600);
}

export function clearNextCookie(request: Request): string {
  return serializeCookie(SSO_NEXT_COOKIE, "", request, 0);
}

export async function mintSsoCookie(user: SsoUser, request: Request): Promise<string> {
  const token = await new SignJWT({
    id: user.id,
    email: normalizeEmail(user.email),
    name: user.name ?? "",
    image: user.image ?? "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(sessionSecret());
  return serializeCookie(SSO_COOKIE, token, request, SESSION_DAYS * 24 * 60 * 60);
}

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (rawKey === name) return rest.join("=");
  }
  return null;
}

export function readNextFromCookie(request: Request): string | null {
  const raw = parseCookie(request.headers.get("cookie"), SSO_NEXT_COOKIE);
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function looksLikeJwt(value: string): boolean {
  const parts = value.split(".");
  return parts.length === 3 && parts[0].startsWith("eyJ");
}

async function userFromJwt(token: string): Promise<SsoUser | null> {
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    const email = normalizeEmail(
      typeof payload.email === "string"
        ? payload.email
        : typeof payload.sub === "string" && payload.sub.includes("@")
          ? payload.sub
          : "",
    );
    const id =
      typeof payload.id === "string" && payload.id
        ? payload.id
        : typeof payload.sub === "string"
          ? payload.sub
          : email;
    if (!email || !id) return null;
    return {
      id,
      email,
      name: typeof payload.name === "string" && payload.name ? payload.name : null,
      image:
        typeof payload.image === "string" && payload.image
          ? payload.image
          : typeof payload.picture === "string"
            ? payload.picture
            : null,
    };
  } catch {
    return null;
  }
}

export async function readSsoUser(request?: Request): Promise<SsoUser | null> {
  const req = request ?? getRequest();
  if (!req) return null;
  const token = parseCookie(req.headers.get("cookie"), SSO_COOKIE);
  if (!token) return null;
  return userFromJwt(token);
}

export async function readHubUser(request?: Request): Promise<SsoUser | null> {
  const req = request ?? getRequest();
  if (!req) return null;
  if (!process.env.AUTH_SECRET?.trim()) return null;
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey || rawKey === SSO_COOKIE || rawKey === SSO_NEXT_COOKIE) continue;
    const value = rest.join("=");
    if (!value || !looksLikeJwt(value)) continue;
    const user = await userFromJwt(value);
    if (user) return user;
  }
  return null;
}

function asSsoUser(raw: unknown): SsoUser | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const inner = record.user && typeof record.user === "object" ? (record.user as Record<string, unknown>) : record;
  const email = normalizeEmail(typeof inner.email === "string" ? inner.email : "");
  const id = typeof inner.id === "string" && inner.id ? inner.id : email;
  if (!email) return null;
  return {
    id,
    email,
    name: typeof inner.name === "string" ? inner.name : null,
    image: typeof inner.image === "string" ? inner.image : typeof inner.picture === "string" ? inner.picture : null,
  };
}

export async function exchangeSsoCode(code: string): Promise<SsoUser> {
  const res = await fetch(`${hubOrigin()}/api/sso/exchange`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ code }),
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) throw new Error(`SSO exchange failed (${res.status})`);
  const user = asSsoUser(json);
  if (!user) throw new Error("SSO exchange returned no user");
  return user;
}

export async function resolveRadioUser(bearerToken?: string): Promise<RadioUser | null> {
  const sso = await readSsoUser();
  if (sso) return { ...sso, isAdmin: isAdminEmail(sso.email, extraAdminEmails()), source: "sso" };
  const hub = await readHubUser();
  if (hub) return { ...hub, isAdmin: isAdminEmail(hub.email, extraAdminEmails()), source: "hub" };
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const session = await getSessionUser(bearerToken);
  if (!session?.email) return null;
  return {
    id: session.id,
    email: normalizeEmail(session.email),
    name: null,
    image: null,
    isAdmin: isAdminEmail(session.email, extraAdminEmails()),
    source: "better-auth",
  };
}

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}

export async function requireRadioUser(bearerToken?: string): Promise<RadioUser> {
  const user = await resolveRadioUser(bearerToken);
  if (!user) {
    const { UnauthorizedError } = await import("@/lib/auth/verify.server");
    throw new UnauthorizedError();
  }
  return user;
}

export async function requireAdmin(bearerToken?: string): Promise<RadioUser> {
  const user = await requireRadioUser(bearerToken);
  if (!user.isAdmin) throw new ForbiddenError();
  return user;
}

export function r2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID?.trim() &&
      process.env.R2_ACCESS_KEY_ID?.trim() &&
      process.env.R2_SECRET_ACCESS_KEY?.trim(),
  );
}

export function logoutLocation(request: Request): string {
  const origin = requestOrigin(request);
  const hub = new URL("/api/sso/logout", hubOrigin());
  const host = new URL(origin).host;
  const returnTo =
    host === "radio.terrainfinity.ca" || host.endsWith(".radio.terrainfinity.ca")
      ? "https://radio.terrainfinity.ca/"
      : `${origin}/`;
  hub.searchParams.set("returnTo", returnTo);
  return hub.toString();
}

export function envLamps(): EnvLamp[] {
  const present = (name: string) => Boolean(process.env[name]?.trim());
  return [
    { key: "AUTH_SECRET", label: "Auth secret", group: "SSO", set: present("AUTH_SECRET"), required: true, hint: "Must match the Terrainfinity hub." },
    { key: "AUTH_URL", label: "Auth URL", group: "SSO", set: present("AUTH_URL"), required: true, hint: "https://terrainfinity.ca" },
    { key: "SSO_HUB", label: "SSO hub", group: "SSO", set: present("SSO_HUB"), required: false, hint: "Defaults to AUTH_URL or https://terrainfinity.ca" },
    { key: "DATABASE_URL", label: "Postgres", group: "Data", set: present("DATABASE_URL"), required: true, hint: "Shared Neon / Postgres with the hub." },
    { key: "R2_ACCOUNT_ID", label: "R2 account", group: "R2", set: present("R2_ACCOUNT_ID"), required: true, hint: "Cloudflare account id." },
    { key: "R2_ACCESS_KEY_ID", label: "R2 access key", group: "R2", set: present("R2_ACCESS_KEY_ID"), required: true, hint: "R2 API token access key." },
    { key: "R2_SECRET_ACCESS_KEY", label: "R2 secret", group: "R2", set: present("R2_SECRET_ACCESS_KEY"), required: true, hint: "R2 API token secret." },
    { key: "R2_BUCKET", label: "R2 bucket", group: "R2", set: present("R2_BUCKET"), required: false, hint: "Defaults to media-empire-radio." },
    { key: "R2_PUBLIC_BASE_URL", label: "R2 public base", group: "R2", set: present("R2_PUBLIC_BASE_URL"), required: false, hint: "Defaults to https://r2.terrainfinity.ca" },
    { key: "ADMIN_EMAILS", label: "Extra C emails", group: "Desk", set: present("ADMIN_EMAILS"), required: false, hint: "Comma list on top of the two C accounts." },
  ];
}
