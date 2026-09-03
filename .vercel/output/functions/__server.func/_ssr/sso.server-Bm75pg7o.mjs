import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { q as jwtVerify } from "../_libs/@better-auth/core+[...].mjs";
import { r as SignJWT } from "../_libs/jose.mjs";
import { o as getRequest } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sso.server-Bm75pg7o.js
/** God / C accounts. Server also reads extra addresses from ADMIN_EMAILS. */
var ADMIN_EMAILS = ["career@terrainfinity.ca", "c@cyber-athens.ca"];
function normalizeEmail(email) {
	return (email ?? "").trim().toLowerCase();
}
function isAdminEmail(email, extra = []) {
	const needle = normalizeEmail(email);
	if (!needle) return false;
	if (ADMIN_EMAILS.includes(needle)) return true;
	return extra.some((item) => normalizeEmail(item) === needle);
}
var sso_server_exports = /* @__PURE__ */ __exportAll({
	ForbiddenError: () => ForbiddenError,
	SSO_COOKIE: () => SSO_COOKIE,
	SSO_NEXT_COOKIE: () => SSO_NEXT_COOKIE,
	clearNextCookie: () => clearNextCookie,
	clearSsoCookie: () => clearSsoCookie,
	envLamps: () => envLamps,
	exchangeSsoCode: () => exchangeSsoCode,
	hubOrigin: () => hubOrigin,
	isRelativeNext: () => isRelativeNext,
	logoutLocation: () => logoutLocation,
	mintNextCookie: () => mintNextCookie,
	mintSsoCookie: () => mintSsoCookie,
	r2Configured: () => r2Configured,
	readHubUser: () => readHubUser,
	readNextFromCookie: () => readNextFromCookie,
	readSsoUser: () => readSsoUser,
	requestOrigin: () => requestOrigin,
	requireAdmin: () => requireAdmin,
	requireRadioUser: () => requireRadioUser,
	resolveRadioUser: () => resolveRadioUser,
	safeNext: () => safeNext
});
var SSO_COOKIE = "radio_sso";
var SSO_NEXT_COOKIE = "radio_sso_next";
var SESSION_DAYS = 30;
function extraAdminEmails() {
	return (process.env.ADMIN_EMAILS ?? "").split(/[,;\s]+/).map((item) => item.trim()).filter(Boolean);
}
function hubOrigin() {
	return (process.env.SSO_HUB || process.env.AUTH_URL || "https://terrainfinity.ca").replace(/\/$/, "");
}
function sessionSecret() {
	const raw = process.env.AUTH_SECRET?.trim() || process.env.BETTER_AUTH_SECRET?.trim() || "radio-preview-sso-secret";
	return new TextEncoder().encode(raw);
}
function requestOrigin(request) {
	const url = new URL(request.url);
	return `${request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "") || "https"}://${request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host}`;
}
function cookieDomain(request) {
	const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "").split(":")[0];
	if (host === "terrainfinity.ca" || host.endsWith(".terrainfinity.ca")) return ".terrainfinity.ca";
}
function isRelativeNext(next) {
	if (!next) return false;
	if (!next.startsWith("/")) return false;
	if (next.startsWith("//") || next.includes("\\")) return false;
	if (next.includes("://")) return false;
	return true;
}
function safeNext(next) {
	return isRelativeNext(next) ? next : "/";
}
function serializeCookie(name, value, request, maxAge) {
	const parts = [
		`${name}=${value}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax"
	];
	if (requestOrigin(request).startsWith("https://")) parts.push("Secure");
	const domain = cookieDomain(request);
	if (domain) parts.push(`Domain=${domain}`);
	parts.push(`Max-Age=${maxAge}`);
	return parts.join("; ");
}
function clearSsoCookie(request) {
	return serializeCookie(SSO_COOKIE, "", request, 0);
}
function mintNextCookie(next, request) {
	return serializeCookie(SSO_NEXT_COOKIE, encodeURIComponent(safeNext(next)), request, 600);
}
function clearNextCookie(request) {
	return serializeCookie(SSO_NEXT_COOKIE, "", request, 0);
}
async function mintSsoCookie(user, request) {
	return serializeCookie(SSO_COOKIE, await new SignJWT({
		id: user.id,
		email: normalizeEmail(user.email),
		name: user.name ?? "",
		image: user.image ?? ""
	}).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${SESSION_DAYS}d`).sign(sessionSecret()), request, 2592e3);
}
function parseCookie(header, name) {
	if (!header) return null;
	for (const part of header.split(";")) {
		const [rawKey, ...rest] = part.trim().split("=");
		if (rawKey === name) return rest.join("=");
	}
	return null;
}
function readNextFromCookie(request) {
	const raw = parseCookie(request.headers.get("cookie"), SSO_NEXT_COOKIE);
	if (!raw) return null;
	try {
		return decodeURIComponent(raw);
	} catch {
		return raw;
	}
}
function looksLikeJwt(value) {
	const parts = value.split(".");
	return parts.length === 3 && parts[0].startsWith("eyJ");
}
async function userFromJwt(token) {
	try {
		const { payload } = await jwtVerify(token, sessionSecret());
		const email = normalizeEmail(typeof payload.email === "string" ? payload.email : typeof payload.sub === "string" && payload.sub.includes("@") ? payload.sub : "");
		const id = typeof payload.id === "string" && payload.id ? payload.id : typeof payload.sub === "string" ? payload.sub : email;
		if (!email || !id) return null;
		return {
			id,
			email,
			name: typeof payload.name === "string" && payload.name ? payload.name : null,
			image: typeof payload.image === "string" && payload.image ? payload.image : typeof payload.picture === "string" ? payload.picture : null
		};
	} catch {
		return null;
	}
}
async function readSsoUser(request) {
	const req = request ?? getRequest();
	if (!req) return null;
	const token = parseCookie(req.headers.get("cookie"), SSO_COOKIE);
	if (!token) return null;
	return userFromJwt(token);
}
async function readHubUser(request) {
	const req = request ?? getRequest();
	if (!req) return null;
	if (!process.env.AUTH_SECRET?.trim()) return null;
	const header = req.headers.get("cookie");
	if (!header) return null;
	for (const part of header.split(";")) {
		const [rawKey, ...rest] = part.trim().split("=");
		if (!rawKey || rawKey === "radio_sso" || rawKey === "radio_sso_next") continue;
		const value = rest.join("=");
		if (!value || !looksLikeJwt(value)) continue;
		const user = await userFromJwt(value);
		if (user) return user;
	}
	return null;
}
function asSsoUser(raw) {
	if (!raw || typeof raw !== "object") return null;
	const record = raw;
	const inner = record.user && typeof record.user === "object" ? record.user : record;
	const email = normalizeEmail(typeof inner.email === "string" ? inner.email : "");
	const id = typeof inner.id === "string" && inner.id ? inner.id : email;
	if (!email) return null;
	return {
		id,
		email,
		name: typeof inner.name === "string" ? inner.name : null,
		image: typeof inner.image === "string" ? inner.image : typeof inner.picture === "string" ? inner.picture : null
	};
}
async function exchangeSsoCode(code) {
	const res = await fetch(`${hubOrigin()}/api/sso/exchange`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			accept: "application/json"
		},
		body: JSON.stringify({ code })
	});
	const text = await res.text();
	let json = null;
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
async function resolveRadioUser(bearerToken) {
	const sso = await readSsoUser();
	if (sso) return {
		...sso,
		isAdmin: isAdminEmail(sso.email, extraAdminEmails()),
		source: "sso"
	};
	const hub = await readHubUser();
	if (hub) return {
		...hub,
		isAdmin: isAdminEmail(hub.email, extraAdminEmails()),
		source: "hub"
	};
	const { getSessionUser } = await import("./verify.server-BUeaJHM6.mjs");
	const session = await getSessionUser(bearerToken);
	if (!session?.email) return null;
	return {
		id: session.id,
		email: normalizeEmail(session.email),
		name: null,
		image: null,
		isAdmin: isAdminEmail(session.email, extraAdminEmails()),
		source: "better-auth"
	};
}
var ForbiddenError = class extends Error {
	status = 403;
	constructor() {
		super("Forbidden");
		this.name = "ForbiddenError";
	}
};
async function requireRadioUser(bearerToken) {
	const user = await resolveRadioUser(bearerToken);
	if (!user) {
		const { UnauthorizedError } = await import("./verify.server-BUeaJHM6.mjs");
		throw new UnauthorizedError();
	}
	return user;
}
async function requireAdmin(bearerToken) {
	const user = await requireRadioUser(bearerToken);
	if (!user.isAdmin) throw new ForbiddenError();
	return user;
}
function r2Configured() {
	return Boolean(process.env.R2_ACCOUNT_ID?.trim() && process.env.R2_ACCESS_KEY_ID?.trim() && process.env.R2_SECRET_ACCESS_KEY?.trim());
}
function logoutLocation(request) {
	const origin = requestOrigin(request);
	const hub = new URL("/api/sso/logout", hubOrigin());
	const host = new URL(origin).host;
	const returnTo = host === "radio.terrainfinity.ca" || host.endsWith(".radio.terrainfinity.ca") ? "https://radio.terrainfinity.ca/" : `${origin}/`;
	hub.searchParams.set("returnTo", returnTo);
	return hub.toString();
}
function envLamps() {
	const present = (name) => Boolean(process.env[name]?.trim());
	return [
		{
			key: "AUTH_SECRET",
			label: "Auth secret",
			group: "SSO",
			set: present("AUTH_SECRET"),
			required: true,
			hint: "Must match the Terrainfinity hub."
		},
		{
			key: "AUTH_URL",
			label: "Auth URL",
			group: "SSO",
			set: present("AUTH_URL"),
			required: true,
			hint: "https://terrainfinity.ca"
		},
		{
			key: "SSO_HUB",
			label: "SSO hub",
			group: "SSO",
			set: present("SSO_HUB"),
			required: false,
			hint: "Defaults to AUTH_URL or https://terrainfinity.ca"
		},
		{
			key: "DATABASE_URL",
			label: "Postgres",
			group: "Data",
			set: present("DATABASE_URL"),
			required: true,
			hint: "Shared Neon / Postgres with the hub."
		},
		{
			key: "R2_ACCOUNT_ID",
			label: "R2 account",
			group: "R2",
			set: present("R2_ACCOUNT_ID"),
			required: true,
			hint: "Cloudflare account id."
		},
		{
			key: "R2_ACCESS_KEY_ID",
			label: "R2 access key",
			group: "R2",
			set: present("R2_ACCESS_KEY_ID"),
			required: true,
			hint: "R2 API token access key."
		},
		{
			key: "R2_SECRET_ACCESS_KEY",
			label: "R2 secret",
			group: "R2",
			set: present("R2_SECRET_ACCESS_KEY"),
			required: true,
			hint: "R2 API token secret."
		},
		{
			key: "R2_BUCKET",
			label: "R2 bucket",
			group: "R2",
			set: present("R2_BUCKET"),
			required: false,
			hint: "Defaults to media-empire-radio."
		},
		{
			key: "R2_PUBLIC_BASE_URL",
			label: "R2 public base",
			group: "R2",
			set: present("R2_PUBLIC_BASE_URL"),
			required: false,
			hint: "Defaults to https://r2.terrainfinity.ca"
		},
		{
			key: "ADMIN_EMAILS",
			label: "Extra C emails",
			group: "Desk",
			set: present("ADMIN_EMAILS"),
			required: false,
			hint: "Comma list on top of the two C accounts."
		}
	];
}
//#endregion
export { logoutLocation as a, r2Configured as c, requireAdmin as d, resolveRadioUser as f, isAdminEmail as h, hubOrigin as i, readNextFromCookie as l, sso_server_exports as m, clearSsoCookie as n, mintNextCookie as o, safeNext as p, exchangeSsoCode as r, mintSsoCookie as s, clearNextCookie as t, requestOrigin as u };
