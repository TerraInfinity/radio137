import { cn } from "@/lib/cn";

export function CoverArt({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} className={cn("object-cover", className)} />;
}
