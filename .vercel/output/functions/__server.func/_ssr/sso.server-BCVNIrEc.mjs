import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { q as jwtVerify } from "../_libs/@better-auth/core+[...].mjs";
import { r as SignJWT } from "../_libs/jose.mjs";
import { o as getRequest } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sso.server-BCVNIrEc.js
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
/** Pure SSO client helpers. Hub owns Google; Radio only consumes a one-time code. */
var DEFAULT_SSO_HUB = "https://www.terrainfinity.ca";
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
function normalizeHubOrigin(raw) {
	const fallback = DEFAULT_SSO_HUB;
	const value = (raw ?? "").trim().replace(/\/$/, "");
	if (!value) return fallback;
	try {
		const url = new URL(value.includes("://") ? value : `https://${value}`);
		if (url.hostname === "terrainfinity.ca") url.hostname = "www.terrainfinity.ca";
		url.pathname = url.pathname.replace(/\/$/, "") || "";
		url.search = "";
		url.hash = "";
		return url.origin;
	} catch {
		return fallback;
	}
}
function hostnameOf(hostHeader) {
	return hostHeader.trim().toLowerCase().split(",")[0]?.trim().split(":")[0] ?? "";
}
function publicOriginFromHost(hostHeader, proto) {
	const host = hostHeader.trim().split(",")[0]?.trim() || "localhost";
	const hostname = hostnameOf(host);
	if (hostname === "radio.terrainfinity.ca" || hostname.endsWith(".radio.terrainfinity.ca")) return "https://radio.terrainfinity.ca";
	if (hostname === "radio.cyber-athens.ca" || hostname.endsWith(".radio.cyber-athens.ca")) return "https://radio.cyber-athens.ca";
	return `${proto.split(",")[0]?.trim() === "https" ? "https" : "http"}://${host}`;
}
function ssoCookieDomain(hostHeader, configured) {
	const hostname = hostnameOf(hostHeader);
	if (!hostname) return void 0;
	if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]") return void 0;
	if (hostname.endsWith(".grok.me") || hostname.endsWith(".grok-sandbox.com") || hostname.endsWith(".grok.com")) return;
	if (hostname === "cyber-athens.ca" || hostname.endsWith(".cyber-athens.ca")) return void 0;
	if (!(hostname === "terrainfinity.ca" || hostname.endsWith(".terrainfinity.ca"))) return void 0;
	return (configured ?? "").trim() || ".terrainfinity.ca";
}
function consumeReturnTo(origin, next = "/") {
	const url = new URL("/api/sso/consume", origin);
	url.searchParams.set("next", safeNext(next));
	return url.toString();
}
function hubStartUrl(hub, returnTo) {
	const url = new URL("/api/sso/start", hub);
	url.searchParams.set("returnTo", returnTo);
	return url.toString();
}
function consumeHandoffHref(code, next = "/") {
	const url = new URL("/api/sso/consume", "https://radio.invalid");
	url.searchParams.set("code", code);
	url.searchParams.set("next", safeNext(next));
	return `${url.pathname}${url.search}`;
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
	loginLocation: () => loginLocation,
	logoutLocation: () => logoutLocation,
	mintNextCookie: () => mintNextCookie,
	mintSsoCookie: () => mintSsoCookie,
	publicOrigin: () => publicOrigin,
	r2Configured: () => r2Configured,
	readHubUser: () => readHubUser,
	readNextFromCookie: () => readNextFromCookie,
	readSsoUser: () => readSsoUser,
	requestOrigin: () => requestOrigin,
	requireAdmin: () => requireAdmin,
	requireRadioUser: () => requireRadioUser,
	resolveRadioUser: () => resolveRadioUser,
	safeRedirectPath: () => safeRedirectPath
});
var SSO_COOKIE = "radio_sso";
var SSO_NEXT_COOKIE = "radio_sso_next";
var SESSION_DAYS = 30;
function extraAdminEmails() {
	return (process.env.ADMIN_EMAILS ?? "").split(/[,;\s]+/).map((item) => item.trim()).filter(Boolean);
}
function envTrim(name) {
	return process.env[name]?.trim() ?? "";
}
function hubOrigin() {
	return normalizeHubOrigin(envTrim("SSO_HUB") || envTrim("HUB_ORIGIN") || "https://www.terrainfinity.ca");
}
function sessionSecret() {
	const raw = envTrim("AUTH_SECRET") || envTrim("BETTER_AUTH_SECRET") || "radio-preview-sso-secret";
	return new TextEncoder().encode(raw);
}
function hostHeader(request) {
	const url = new URL(request.url);
	return request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
}
function protoHeader(request) {
	const url = new URL(request.url);
	return request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "") || "https";
}
function requestOrigin(request) {
	return publicOriginFromHost(hostHeader(request), protoHeader(request));
}
function publicOrigin(request) {
	return requestOrigin(request);
}
function cookieDomainFor(request) {
	return ssoCookieDomain(hostHeader(request), envTrim("AUTH_COOKIE_DOMAIN"));
}
function serializeCookie(name, value, request, maxAge) {
	const parts = [
		`${name}=${value}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax"
	];
	if (publicOrigin(request).startsWith("https://")) parts.push("Secure");
	const domain = cookieDomainFor(request);
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
	if (!envTrim("AUTH_SECRET")) return null;
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
async function postHubCode(path, code) {
	const res = await fetch(`${hubOrigin()}${path}`, {
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
	const user = asSsoUser(json);
	return {
		ok: res.ok && Boolean(user),
		status: res.status,
		user,
		retry: res.status === 404 || res.status === 405 || res.status >= 500
	};
}
async function exchangeSsoCode(code) {
	const redeem = await postHubCode("/api/sso/redeem", code);
	if (redeem.ok && redeem.user) return redeem.user;
	if (redeem.retry || !redeem.ok) {
		const exchange = await postHubCode("/api/sso/exchange", code);
		if (exchange.ok && exchange.user) return exchange.user;
		throw new Error(`SSO exchange failed (${exchange.status || redeem.status})`);
	}
	throw new Error("SSO exchange returned no user");
}
function loginLocation(request, next) {
	const origin = publicOrigin(request);
	const safe = safeNext(next);
	const returnTo = consumeReturnTo(origin, safe);
	return {
		location: hubStartUrl(hubOrigin(), returnTo),
		nextCookie: mintNextCookie(safe, request)
	};
}
function safeRedirectPath(next, request) {
	const resolved = new URL(safeNext(next), publicOrigin(request));
	if (resolved.pathname.startsWith("/") && !resolved.pathname.startsWith("//")) return `${resolved.pathname}${resolved.search}`;
	return "/";
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
	const { getSessionUser } = await import("./verify.server-DvBbTC-L.mjs");
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
		const { UnauthorizedError } = await import("./verify.server-DvBbTC-L.mjs");
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
	return Boolean(envTrim("R2_ACCOUNT_ID") && envTrim("R2_ACCESS_KEY_ID") && envTrim("R2_SECRET_ACCESS_KEY"));
}
function logoutLocation(request) {
	const hub = new URL("/api/sso/logout", hubOrigin());
	hub.searchParams.set("returnTo", `${publicOrigin(request)}/`);
	return hub.toString();
}
function envLamps() {
	const present = (name) => Boolean(envTrim(name));
	return [
		{
			key: "SSO_HUB",
			label: "SSO hub",
			group: "SSO",
			set: present("SSO_HUB") || present("HUB_ORIGIN"),
			required: true,
			hint: "https://www.terrainfinity.ca — Google lives here."
		},
		{
			key: "AUTH_SECRET",
			label: "Auth secret",
			group: "SSO",
			set: present("AUTH_SECRET"),
			required: true,
			hint: "Same secret as the hub if sharing the terrainfinity cookie."
		},
		{
			key: "AUTH_COOKIE_DOMAIN",
			label: "Cookie domain",
			group: "SSO",
			set: present("AUTH_COOKIE_DOMAIN"),
			required: false,
			hint: ".terrainfinity.ca on radio.terrainfinity.ca only. Never on localhost, grok, or cyber-athens."
		},
		{
			key: "AUTH_URL",
			label: "Auth URL",
			group: "SSO",
			set: present("AUTH_URL"),
			required: false,
			hint: "Do not set this to the hub. Radio mounts /api/auth/* for the Grok session."
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
export { isAdminEmail as _, logoutLocation as a, readNextFromCookie as c, resolveRadioUser as d, safeRedirectPath as f, safeNext as g, isRelativeNext as h, loginLocation as i, readSsoUser as l, consumeHandoffHref as m, clearSsoCookie as n, mintSsoCookie as o, sso_server_exports as p, exchangeSsoCode as r, r2Configured as s, clearNextCookie as t, requireAdmin as u };
