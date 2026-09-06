import { applyCatalogEdits } from "@/lib/catalog-edits";
import { getSeedCatalog, setLiveCatalog } from "@/lib/catalog";

let livePromise: Promise<void> | null = null;

/** Pull desk edits so alias / slug lookups see the same catalog both hosts share. */
export function ensureLiveCatalog(): Promise<void> {
  livePromise ??= (async () => {
    const { listCatalogEdits } = await import("@/lib/desk-api");
    const data = await listCatalogEdits();
    setLiveCatalog(applyCatalogEdits(getSeedCatalog(), data.tracks, data.stations));
  })().catch((err) => {
    livePromise = null;
    throw err;
  });
  return livePromise;
}
