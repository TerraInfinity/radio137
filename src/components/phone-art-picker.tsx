import { ImagePlus } from "lucide-react";
import { ART_ACCEPT } from "@/lib/media";
import { cn } from "@/lib/cn";

/**
 * One iOS-safe file input: the <input> IS the tap target (opacity overlay),
 * never a hidden input clicked from JS. Combined accept lets Photos, the
 * camera roll, Files, and the desktop chooser all flow through one control.
 */
export function PhoneArtPicker({
  disabled,
  onFile,
  label = "Choose file",
}: {
  disabled?: boolean;
  onFile: (file: File) => void;
  label?: string;
}) {
  return (
    <label
      className={cn(
        "relative inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md px-3 font-mono text-[11px] uppercase tracking-[0.14em]",
        disabled ? "pointer-events-none opacity-50" : "bg-fg text-bg",
      )}
    >
      <input
        type="file"
        accept={ART_ACCEPT}
        disabled={disabled}
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onFile(file);
        }}
      />
      <ImagePlus className="size-4" aria-hidden />
      {label}
    </label>
  );
}
