import type { CatalogueViewMode } from "@/types/filter.types";

const VIEW_STORAGE_KEY = "eleno.catalogue.view";

/** Last grid mode the user picked, so returning to the catalogue keeps it. */
export function readStoredCatalogueView(): CatalogueViewMode {
  try {
    const value = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (value === "table" || value === "mosaic" || value === "cards") return value;
  } catch {
    /* storage unavailable — fall through to the default */
  }
  return "cards";
}

export function writeStoredCatalogueView(mode: CatalogueViewMode): void {
  try {
    window.localStorage.setItem(VIEW_STORAGE_KEY, mode);
  } catch {
    /* ignore quota/private-mode errors */
  }
}
