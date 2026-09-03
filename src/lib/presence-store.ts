import { create } from "zustand";
import type { PresenceSnapshot } from "@/lib/types";

export const usePresenceStore = create<{ snapshot: PresenceSnapshot | null }>(() => ({
  snapshot: null,
}));
