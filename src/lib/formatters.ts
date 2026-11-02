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
  const mType = (item.type || "").toLowerCase();
  const fmt = (item.format || "").toLowerCase();
  if (mType === "movie" || mType.startsWith("tv") || fmt === "srt" || fmt === "vtt") {
    return "Film / Subtitles";
  }
  if (mType === "podcast") return "Audio / Podcast";
  if (mType === "article") return "Article / Text";
  return "Book / Reader";
}

export function getMediaSubtypeLabel(item: MediaCatalogItem): string {
  const mType = (item.type || "").toLowerCase();
  const fmt = (item.format || "epub").toUpperCase();
  if (mType === "movie" || mType.startsWith("tv") || fmt === "SRT" || fmt === "VTT") {
    const durMin = item.metrics?.duration_seconds
      ? Math.round(item.metrics.duration_seconds / 60)
      : null;
    const label = mType.startsWith("tv") ? "TV EPISODE" : "FILM";
    if (durMin && item.release_year) return `${label} · ${item.release_year} · ${durMin}M`;
    if (durMin) return `${label} · ${durMin} MIN`;
    return `${label} · ${item.release_year || fmt}`;
  }
  if (item.release_year) {
    return `BOOK · ${item.release_year}`;
  }
  return `BOOK · ${fmt}`;
}
