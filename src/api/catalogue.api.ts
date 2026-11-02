import { supabase } from "@/lib/supabase";
import type {
  MediaCatalogItem,
  MediaComprehensionStats,
  PreviewWordItem,
} from "@/types/media.types";
import { normalizeMediaComprehension } from "./normalizers";

const BASE_CATALOGUE_SELECT = `
  id,
  type,
  title,
  creator,
  language,
  format,
  cover_image_url,
  release_year,
  synopsis,
  media_metrics(*)
`;

export async function fetchPreviewWordsBatch(
  userId?: string | null
): Promise<Record<string, PreviewWordItem[]>> {
  const lookup: Record<string, PreviewWordItem[]> = {};

  const { data: rpcData, error: rpcErr } = await supabase.rpc(
    "get_user_media_preview_words",
    { p_user_id: userId || null, p_limit_per_item: 8 }
  );

  if (!rpcErr && rpcData) {
    for (const row of rpcData) {
      if (row.pos === "PROPN") continue;
      const mId = String(row.media_item_id);
      if (!lookup[mId]) lookup[mId] = [];
      lookup[mId].push({
        canonical_id: String(row.canonical_id),
        lemma: String(row.lemma),
        pos: String(row.pos || "NOUN"),
        frequency: Number(row.frequency || 1),
        cefr: "B1",
        rank: null,
        sentence: row.first_context_snippet || null,
      });
    }
  }
  return lookup;
}

export async function fetchMediaComprehensionMap(
  userId?: string | null
): Promise<Record<string, MediaComprehensionStats>> {
  if (!userId) return {};
  const { data, error } = await supabase.rpc("get_user_media_comprehension", {
    p_user_id: userId,
  });
  if (error || !data) return {};

  const map: Record<string, MediaComprehensionStats> = {};
  for (const row of data) {
    const parsed = normalizeMediaComprehension(row);
    map[parsed.media_item_id] = parsed;
  }
  return map;
}

export async function fetchBaseCatalogueItems(): Promise<MediaCatalogItem[]> {
  const { data, error } = await supabase
    .from("media_item")
    .select(BASE_CATALOGUE_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map((row) => {
    const metrics = Array.isArray(row.media_metrics)
      ? row.media_metrics[0] || null
      : row.media_metrics || null;

    return {
      id: row.id,
      type: row.type,
      title: row.title,
      creator: row.creator || "Unknown Creator",
      language: row.language || "es",
      format: row.format || "epub",
      cover_image_url: row.cover_image_url || null,
      release_year: row.release_year || null,
      metrics,
      comprehension: null,
      previewWords: [],
      sampleSnippet:
        row.synopsis ||
        "«Texto auténtico indexado en el banco de oraciones del corpus español.»",
      sampleSourceLabel: row.synopsis
        ? `SYNOPSIS · ${String(row.format || "MEDIA").toUpperCase()}`
        : "CORPUS ARCHIVE",
    };
  });
}

export async function fetchCatalogueEnrichment(userId?: string | null) {
  const [compMap, previewLookup] = await Promise.all([
    fetchMediaComprehensionMap(userId),
    fetchPreviewWordsBatch(userId),
  ]);
  return { compMap, previewLookup };
}
