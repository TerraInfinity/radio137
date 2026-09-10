import { MEDIA_MAX_IMAGE, MEDIA_MAX_IMAGE_PICK, MEDIA_MAX_VIDEO } from "@/lib/media";

const IMAGE_NAME = /\.(jpe?g|png|webp|gif|avif|heic|heif|heics)$/i;
const VIDEO_NAME = /\.(mp4|webm|mov|m4v)$/i;
const MAX_EDGE = 1600;

type ArtKind = "image" | "video";

export function classifyArt(file: File): ArtKind | null {
  const type = (file.type || "").toLowerCase();
  const name = file.name || "";
  if (type.startsWith("video/") || VIDEO_NAME.test(name)) return "video";
  if (type.startsWith("image/") || IMAGE_NAME.test(name)) return "image";
  if (/^image/i.test(name) || type === "application/octet-stream" && IMAGE_NAME.test(name)) return "image";
  return null;
}

function stem(name: string): string {
  const base = (name.split(/[/\\]/).pop() || "art").replace(/\.[^.]+$/, "");
  return base.replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 80) || "art";
}

function videoExt(file: File): { ext: string; type: string } {
  const type = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();
  if (name.endsWith(".webm") || type.includes("webm")) return { ext: "webm", type: type || "video/webm" };
  if (name.endsWith(".mov") || type.includes("quicktime")) return { ext: "mov", type: type || "video/quicktime" };
  if (name.endsWith(".m4v") || type === "video/x-m4v") return { ext: "m4v", type: type || "video/mp4" };
  return { ext: "mp4", type: type || "video/mp4" };
}

function named(file: Blob, filename: string, type: string): File {
  return new File([file], filename, { type, lastModified: Date.now() });
}

async function loadDrawable(file: File): Promise<CanvasImageSource & { width: number; height: number; close?: () => void }> {
  try {
    if (typeof createImageBitmap === "function") {
      return await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
    }
  } catch {
    /* HEIC on some browsers — try an <img> */
  }
  return await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that photo. On iPhone, take a screenshot or export as JPEG."));
    };
    img.src = url;
  });
}

async function jpegFromCanvas(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("Could not encode that photo.");
  return blob;
}

async function compressPhoto(file: File): Promise<File> {
  const source = await loadDrawable(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(source.width, source.height, 1));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that photo.");
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  source.close?.();
  let quality = 0.86;
  let blob = await jpegFromCanvas(canvas, quality);
  while (blob.size > MEDIA_MAX_IMAGE && quality > 0.48) {
    quality -= 0.1;
    blob = await jpegFromCanvas(canvas, quality);
  }
  if (blob.size > MEDIA_MAX_IMAGE) {
    throw new Error("Photo is still too heavy after shrinking. Try a screenshot.");
  }
  return named(blob, `${stem(file.name)}.jpg`, "image/jpeg");
}

/** Turn a phone photo/video into something the art API will accept. */
export async function prepareArtFile(file: File): Promise<File> {
  const kind = classifyArt(file);
  if (!kind) {
    throw new Error("Need a photo or a short video (JPEG, HEIC, PNG, MP4, or MOV).");
  }
  if (kind === "video") {
    if (file.size > MEDIA_MAX_VIDEO) {
      throw new Error(`Keep looping videos under ${Math.round(MEDIA_MAX_VIDEO / (1024 * 1024))} MB.`);
    }
    const { ext, type } = videoExt(file);
    const current = (file.name.split(".").pop() || "").toLowerCase();
    if (current === ext && file.type) return file;
    return named(file, `${stem(file.name)}.${ext}`, type);
  }
  if (file.size > MEDIA_MAX_IMAGE_PICK) {
    throw new Error(`Photo is over ${Math.round(MEDIA_MAX_IMAGE_PICK / (1024 * 1024))} MB.`);
  }
  return compressPhoto(file);
}
