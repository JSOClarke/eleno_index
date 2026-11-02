import type { LengthBucket } from "@/types/filter.types";
import type { MediaCatalogItem } from "@/types/media.types";

export function formatCompactWords(tokens: number): string {
  if (!tokens || tokens <= 0) return "0 words";
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}k words`;
  }
  return `${tokens} words`;
}

export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined || Number.isNaN(val)) return "0";
  return new Intl.NumberFormat("en-US").format(Math.round(val));
}

/**
 * Normalizes a ratio/percentage from the DB into a 0-100 percentage number.
 * Handles both 0..1 ratios and already-scaled 0..100 values (e.g. 17.2 -> 17.2).
 */
export function toPercentNumber(val: number | null | undefined): number {
  const num = Number(val || 0);
  if (num <= 0 || Number.isNaN(num)) return 0;
  return num <= 1 ? num * 100 : num;
}

export function formatPercent(val: number | null | undefined, decimals = 1): string {
  return `${toPercentNumber(val).toFixed(decimals)}%`;
}

export function getLengthBucket(tokens: number): LengthBucket {
  if (tokens < 25000) return "under25k";
  if (tokens <= 80000) return "25to80k";
  return "80k+";
}

export function getMediaCategoryLabel(item: MediaCatalogItem): string {
  const titleLower = item.title.toLowerCase();
  if (titleLower.includes("cuentos") || titleLower.includes("beedle")) {
    return "Short story";
  }
  if (
    titleLower.includes("quidditch") ||
    titleLower.includes("animales fantásticos") ||
    titleLower.includes("hogwarts")
  ) {
    return "Lore / guide";
  }
  return "Reader / book";
}

export function getMediaSubtypeLabel(item: MediaCatalogItem): string {
  const t = item.title.toLowerCase();
  if (t.includes("piedra filosofal")) return "NOVEL · VOL. 1";
  if (t.includes("cámara secreta")) return "NOVEL · VOL. 2";
  if (t.includes("prisionero de azkaban")) return "NOVEL · VOL. 3";
  if (t.includes("cáliz de fuego")) return "NOVEL · VOL. 4";
  if (t.includes("orden del fénix")) return "NOVEL · VOL. 5";
  if (t.includes("misterio del príncipe")) return "NOVEL · VOL. 6";
  if (t.includes("reliquias de la muerte")) return "NOVEL · VOL. 7";
  if (t.includes("legado maldito")) return "STAGE PLAY · VOL. 8";
  if (t.includes("beedle")) return "FOLKLORE ANTHOLOGY";
  if (t.includes("quidditch")) return "COMPANION GUIDE";
  if (t.includes("animales fantásticos")) return "MAGIZOOLOGY GUIDE";
  if (t.includes("hogwarts")) return "POTTERMORE PRESENTS";
  if (t.includes("vacante")) return "CONTEMPORARY NOVEL";
  if (t.includes("cuco")) return "DETECTIVE NOVEL";
  return `${item.format?.toUpperCase() || "EPUB"} · CORPUS`;
}
