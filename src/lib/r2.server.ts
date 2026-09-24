import {
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function bucket(): string {
  return process.env.R2_BUCKET?.trim() || "media-empire-radio";
}

export function r2PublicBase(): string {
  return (
    process.env.MEDIA_PUBLIC_BASE?.trim() ||
    process.env.VITE_MEDIA_PUBLIC_BASE?.trim() ||
    process.env.R2_PUBLIC_BASE_URL?.trim() ||
    "https://r2.terrainfinity.ca"
  ).replace(/\/$/, "");
}

export function r2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID?.trim() &&
      process.env.R2_ACCESS_KEY_ID?.trim() &&
      process.env.R2_SECRET_ACCESS_KEY?.trim(),
  );
}

function client(): S3Client {
  const accountId = required("R2_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: required("R2_ACCESS_KEY_ID"),
      secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export type R2Object = { key: string; size: number; url: string };

export function publicUrlForKey(key: string): string {
  return `${r2PublicBase()}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

function cleanKey(key: string): string {
  const cleaned = key.replace(/^\/+/, "").replace(/\\/g, "/");
  if (!cleaned || cleaned.includes("..")) throw new Error("Invalid R2 key");
  return cleaned;
}

export async function listR2Prefix(prefix: string, maxKeys = 2500): Promise<R2Object[]> {
  const cleaned = prefix.replace(/^\/+/, "");
  const out: R2Object[] = [];
  let token: string | undefined;
  const s3 = client();
  do {
    const page = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket(),
        Prefix: cleaned,
        ContinuationToken: token,
        MaxKeys: Math.min(1000, maxKeys - out.length),
      }),
    );
    for (const item of page.Contents ?? []) {
      if (!item.Key || item.Key.endsWith("/")) continue;
      out.push({ key: item.Key, size: item.Size ?? 0, url: publicUrlForKey(item.Key) });
      if (out.length >= maxKeys) return out;
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return out;
}

export async function deleteR2Key(key: string): Promise<void> {
  await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: cleanKey(key) }));
}

export async function copyR2Key(from: string, to: string): Promise<R2Object> {
  const source = cleanKey(from);
  const dest = cleanKey(to);
  if (source === dest) return { key: dest, size: 0, url: publicUrlForKey(dest) };
  await client().send(
    new CopyObjectCommand({
      Bucket: bucket(),
      CopySource: `/${bucket()}/${source}`,
      Key: dest,
    }),
  );
  return { key: dest, size: 0, url: publicUrlForKey(dest) };
}

export async function moveR2Key(from: string, to: string): Promise<R2Object> {
  const object = await copyR2Key(from, to);
  const source = cleanKey(from);
  if (source !== object.key) await deleteR2Key(source);
  return object;
}

export function defaultPrefixForSlug(slug: string): string {
  return `radio/${slug}/`;
}

export function sanitizeUploadName(name: string): string {
  const base = name.split(/[/\\]/).pop() || "track.mp3";
  return base.replace(/[^A-Za-z0-9._ -]+/g, "_").replace(/\s+/g, " ").trim() || "track.mp3";
}

export async function putR2Object(key: string, body: Uint8Array, contentType: string): Promise<R2Object> {
  const cleaned = cleanKey(key);
  await client().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: cleaned,
      Body: body,
      ContentType: contentType || "audio/mpeg",
      CacheControl: "public, max-age=86400, stale-while-revalidate=604800",
    }),
  );
  return { key: cleaned, size: body.byteLength, url: publicUrlForKey(cleaned) };
}

export async function presignR2Put(key: string, contentType: string, expiresIn = 600): Promise<R2Object & { putUrl: string }> {
  const cleaned = cleanKey(key);
  await ensureR2PutCors();
  const putUrl = await getSignedUrl(
    client(),
    new PutObjectCommand({
      Bucket: bucket(),
      Key: cleaned,
      ContentType: contentType || "application/octet-stream",
      CacheControl: "public, max-age=86400, stale-while-revalidate=604800",
    }),
    { expiresIn },
  );
  return { key: cleaned, size: 0, url: publicUrlForKey(cleaned), putUrl };
}

let corsAttempted = false;
async function ensureR2PutCors() {
  if (corsAttempted) return;
  corsAttempted = true;
  try {
    await client().send(
      new PutBucketCorsCommand({
        Bucket: bucket(),
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedOrigins: ["*"],
              AllowedMethods: ["GET", "PUT", "HEAD"],
              AllowedHeaders: ["*", "Range", "Content-Type"],
              ExposeHeaders: ["ETag", "Location", "Accept-Ranges", "Content-Range", "Content-Length"],
              MaxAgeSeconds: 86400,
            },
          ],
        },
      }),
    );
  } catch {
    /* Bucket CORS may already be set, or the token cannot change it. Presigned PUT still works when CORS allows the app origin. */
  }
}
