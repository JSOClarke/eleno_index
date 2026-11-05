import { supabase } from "@/lib/supabase";
import { PRIMARY_EDITION_PRIORITY } from "@/lib/catalogueLanguages";
import type { MediaCatalogItem, MediaMetrics } from "@/types/media.types";

const WORK_SELECT = `
  id,
  original_title,
  original_language,
  creator,
  type,
  series_name,
  series_order,
  synopsis,
  default_cover_image_url,
  media_item(
    id,
    title,
    creator,
    language,
    format,
    cover_image_url,
    release_year,
    synopsis,
    media_metrics(*)
  )
`;

function metricsOf(row: any): MediaMetrics | null {
  return Array.isArray(row.media_metrics)
    ? row.media_metrics[0] || null
    : row.media_metrics || null;
}

function toEdition(row: any, work: any): MediaCatalogItem {
  const metrics = metricsOf(row);
  return {
    id: String(row.id),
    type: work.type,
    title: String(row.title),
    creator: String(row.creator || work.creator || "Unknown Creator"),
    language: String(row.language || work.original_language || "es"),
    format: row.format || "epub",
    cover_image_url: row.cover_image_url || work.default_cover_image_url || null,
    release_year: row.release_year || null,
    series_name: work.series_name || null,
    series_order: work.series_order != null ? Number(work.series_order) : null,
    metrics,
    comprehension: null,
    previewWords: [],
    sampleSnippet:
      row.synopsis ||
      work.synopsis ||
      "«Texto auténtico indexado en el banco de oraciones del corpus español.»",
    sampleSourceLabel: row.synopsis
      ? `SYNOPSIS · ${String(row.format || "MEDIA").toUpperCase()}`
      : "CORPUS ARCHIVE",
  };
}

function toWork(row: any): MediaCatalogItem | null {
  const rows = Array.isArray(row.media_item) ? row.media_item : row.media_item ? [row.media_item] : [];
  if (!rows.length) return null;

  const editions = rows.map((edition: any) => toEdition(edition, row));
  const primary =
    PRIMARY_EDITION_PRIORITY
      .map((language) => editions.find((edition: MediaCatalogItem) => edition.language === language))
      .find((edition): edition is MediaCatalogItem => Boolean(edition)) || editions[0];

  return {
    ...primary,
    work_id: String(row.id),
    work_title: String(row.original_title),
    work_language: String(row.original_language || "en"),
    editions,
  };
}

export async function fetchBaseCatalogueItems(): Promise<MediaCatalogItem[]> {
  const { data, error } = await supabase
    .from("media_work")
    .select(WORK_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(toWork).filter((work): work is MediaCatalogItem => Boolean(work));
}
