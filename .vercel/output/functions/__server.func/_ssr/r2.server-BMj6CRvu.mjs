import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { a as CopyObjectCommand, i as DeleteObjectCommand, n as PutBucketCorsCommand, o as S3Client, r as ListObjectsV2Command, t as PutObjectCommand } from "../_libs/@aws-sdk/client-s3+[...].mjs";
import { t as getSignedUrl } from "../_libs/aws-sdk__s3-request-presigner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/r2.server-BMj6CRvu.js
var r2_server_BMj6CRvu_exports = /* @__PURE__ */ __exportAll({
	a: () => sanitizeUploadName,
	i: () => r2_server_exports,
	n: () => putR2Object,
	r: () => r2Configured,
	t: () => defaultPrefixForSlug
});
var r2_server_exports = /* @__PURE__ */ __exportAll$1({
	defaultPrefixForSlug: () => defaultPrefixForSlug,
	deleteR2Key: () => deleteR2Key,
	listR2Prefix: () => listR2Prefix,
	moveR2Key: () => moveR2Key,
	presignR2Put: () => presignR2Put,
	publicUrlForKey: () => publicUrlForKey,
	putR2Object: () => putR2Object,
	r2Configured: () => r2Configured,
	r2PublicBase: () => r2PublicBase,
	sanitizeUploadName: () => sanitizeUploadName
});
function required(name) {
	const value = process.env[name]?.trim();
	if (!value) throw new Error(`${name} is not set`);
	return value;
}
function bucket() {
	return process.env.R2_BUCKET?.trim() || "media-empire-radio";
}
function r2PublicBase() {
	return (process.env.MEDIA_PUBLIC_BASE?.trim() || process.env.VITE_MEDIA_PUBLIC_BASE?.trim() || process.env.R2_PUBLIC_BASE_URL?.trim() || "https://r2.terrainfinity.ca").replace(/\/$/, "");
}
function r2Configured() {
	return Boolean(process.env.R2_ACCOUNT_ID?.trim() && process.env.R2_ACCESS_KEY_ID?.trim() && process.env.R2_SECRET_ACCESS_KEY?.trim());
}
function client() {
	const accountId = required("R2_ACCOUNT_ID");
	return new S3Client({
		region: "auto",
		endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: required("R2_ACCESS_KEY_ID"),
			secretAccessKey: required("R2_SECRET_ACCESS_KEY")
		}
	});
}
function publicUrlForKey(key) {
	return `${r2PublicBase()}/${key.split("/").map(encodeURIComponent).join("/")}`;
}
function cleanKey(key) {
	const cleaned = key.replace(/^\/+/, "").replace(/\\/g, "/");
	if (!cleaned || cleaned.includes("..")) throw new Error("Invalid R2 key");
	return cleaned;
}
async function listR2Prefix(prefix, maxKeys = 2500) {
	const cleaned = prefix.replace(/^\/+/, "");
	const out = [];
	let token;
	const s3 = client();
	do {
		const page = await s3.send(new ListObjectsV2Command({
			Bucket: bucket(),
			Prefix: cleaned,
			ContinuationToken: token,
			MaxKeys: Math.min(1e3, maxKeys - out.length)
		}));
		for (const item of page.Contents ?? []) {
			if (!item.Key || item.Key.endsWith("/")) continue;
			out.push({
				key: item.Key,
				size: item.Size ?? 0,
				url: publicUrlForKey(item.Key)
			});
			if (out.length >= maxKeys) return out;
		}
		token = page.IsTruncated ? page.NextContinuationToken : void 0;
	} while (token);
	return out;
}
async function deleteR2Key(key) {
	await client().send(new DeleteObjectCommand({
		Bucket: bucket(),
		Key: cleanKey(key)
	}));
}
async function moveR2Key(from, to) {
	const source = cleanKey(from);
	const dest = cleanKey(to);
	await client().send(new CopyObjectCommand({
		Bucket: bucket(),
		CopySource: `/${bucket()}/${source}`,
		Key: dest
	}));
	if (source !== dest) await deleteR2Key(source);
	return {
		key: dest,
		size: 0,
		url: publicUrlForKey(dest)
	};
}
function defaultPrefixForSlug(slug) {
	return `radio/${slug}/`;
}
function sanitizeUploadName(name) {
	return (name.split(/[/\\]/).pop() || "track.mp3").replace(/[^A-Za-z0-9._ -]+/g, "_").replace(/\s+/g, " ").trim() || "track.mp3";
}
async function putR2Object(key, body, contentType) {
	const cleaned = cleanKey(key);
	await client().send(new PutObjectCommand({
		Bucket: bucket(),
		Key: cleaned,
		Body: body,
		ContentType: contentType || "audio/mpeg",
		CacheControl: "public, max-age=86400, stale-while-revalidate=604800"
	}));
	return {
		key: cleaned,
		size: body.byteLength,
		url: publicUrlForKey(cleaned)
	};
}
async function presignR2Put(key, contentType, expiresIn = 600) {
	const cleaned = cleanKey(key);
	await ensureR2PutCors();
	const putUrl = await getSignedUrl(client(), new PutObjectCommand({
		Bucket: bucket(),
		Key: cleaned,
		ContentType: contentType || "application/octet-stream",
		CacheControl: "public, max-age=86400, stale-while-revalidate=604800"
	}), { expiresIn });
	return {
		key: cleaned,
		size: 0,
		url: publicUrlForKey(cleaned),
		putUrl
	};
}
var corsAttempted = false;
async function ensureR2PutCors() {
	if (corsAttempted) return;
	corsAttempted = true;
	try {
		await client().send(new PutBucketCorsCommand({
			Bucket: bucket(),
			CORSConfiguration: { CORSRules: [{
				AllowedOrigins: ["*"],
				AllowedMethods: [
					"GET",
					"PUT",
					"HEAD"
				],
				AllowedHeaders: [
					"*",
					"Range",
					"Content-Type"
				],
				ExposeHeaders: [
					"ETag",
					"Location",
					"Accept-Ranges",
					"Content-Range",
					"Content-Length"
				],
				MaxAgeSeconds: 86400
			}] }
		}));
	} catch {}
}
//#endregion
export { sanitizeUploadName as a, r2_server_BMj6CRvu_exports as i, putR2Object as n, r2Configured as r, defaultPrefixForSlug as t };
