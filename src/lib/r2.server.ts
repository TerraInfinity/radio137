import {
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

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

function publicUrlForKey(key: string): string {
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
        MaxKeys: Math.min(200, maxKeys - out.length),
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

export async function moveR2Key(from: string, to: string): Promise<R2Object> {
  const source = cleanKey(from);
  const dest = cleanKey(to);
  await client().send(
    new CopyObjectCommand({
      Bucket: bucket(),
      CopySource: `/${bucket()}/${source}`,
      Key: dest,
    }),
  );
  if (source !== dest) await deleteR2Key(source);
  return { key: dest, size: 0, url: publicUrlForKey(dest) };
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
    }),
  );
  return { key: cleaned, size: body.byteLength, url: publicUrlForKey(cleaned) };
}
