import { resolveLocalHostUrl, supabase } from "@/lib/supabase";
import { PRIMARY_EDITION_PRIORITY } from "@/lib/catalogueLanguages";
import type { MediaCatalogItem, MediaMetrics } from "@/types/media.types";

const WORK_SELECT = `
  *,
  media_series (
    id,
    name,
    original_name,
    kind,
    parent_series_id
  ),
  media_item (
    id,
    title,
    creator,
    language,
    format,
    cover_image_url,
    release_year,
    synopsis,
    genres,
    external_ids,
    metadata,
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
  const seriesObj = work.media_series || null;
  return {
    id: String(row.id),
    type: work.type,
    title: String(row.title),
    creator: String(row.creator || work.creator || "Unknown Creator"),
    language: String(row.language || work.original_language || "es"),
    format: row.format || "epub",
    cover_image_url: resolveLocalHostUrl(row.cover_image_url || work.default_cover_image_url || null),
    release_year: row.release_year || null,
    series_id: work.series_id || null,
    series: seriesObj,
    series_name: seriesObj?.name || null,
    series_order: work.series_order != null ? Number(work.series_order) : null,
    series_label: work.series_label || null,
    metrics,
    comprehension: null,
    has_audio: Boolean(row.metadata?.has_audio || (row.metadata?.audio && row.metadata.audio.length > 0)),
    external_ids: row.external_ids || undefined,
    metadata: row.metadata || undefined,
    genres: Array.isArray(row.genres) ? row.genres : [],
    previewWords: [],
    sampleSnippet: row.synopsis || work.synopsis || null,
    sampleSourceLabel: row.synopsis ? "Synopsis" : "Archive",
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
  const workTitle = String(row.title_en || row.original_title);
  const workSynopsis = row.synopsis_en || row.synopsis || null;

  return {
    ...primary,
    work_id: String(row.id),
    work_title: workTitle,
    work_language: String(row.original_language || "en"),
    work_synopsis: workSynopsis,
    sampleSnippet: workSynopsis || primary.sampleSnippet,
    sampleSourceLabel: workSynopsis ? "WORK SYNOPSIS · EN" : primary.sampleSourceLabel,
    has_audio: Boolean(primary.has_audio || editions.some((ed: MediaCatalogItem) => ed.has_audio)),
    genres: primary.genres && primary.genres.length ? primary.genres : Array.from(new Set(editions.flatMap((e: MediaCatalogItem) => e.genres || []))),
    editions,
  };
}

export async function fetchBaseCatalogueItems(): Promise<MediaCatalogItem[]> {
  const pageSize = 1000;
  const allRows: any[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("media_work")
      .select(WORK_SELECT)
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    const batch = data || [];
    allRows.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }

  return allRows.map(toWork).filter((work): work is MediaCatalogItem => Boolean(work));
}
