import { ART_ACCEPT } from "@/lib/media";
import { cn } from "@/lib/cn";

function FileChip({
  accept,
  disabled,
  label,
  onFile,
}: {
  accept: string;
  disabled?: boolean;
  label: string;
  onFile: (file: File) => void;
}) {
  return (
    <label
      className={cn(
        "relative inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-md px-3 font-mono text-[11px] uppercase tracking-[0.14em]",
        disabled ? "pointer-events-none opacity-50" : "bg-fg text-bg",
      )}
    >
      <input
        type="file"
        accept={accept}
        disabled={disabled}
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onFile(file);
        }}
      />
      {label}
    </label>
  );
}

/** iOS-friendly pickers: the input is the tap target, not a hidden click(). */
export function PhoneArtPicker({
  disabled,
  onFile,
}: {
  disabled?: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <FileChip accept="image/*" disabled={disabled} label="Photo" onFile={onFile} />
      <FileChip accept="video/*" disabled={disabled} label="Video" onFile={onFile} />
      <FileChip accept={ART_ACCEPT} disabled={disabled} label="Files" onFile={onFile} />
    </div>
  );
}
