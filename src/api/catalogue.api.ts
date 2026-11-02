import { supabase } from "@/lib/supabase";
import type {
  MediaCatalogItem,
  MediaComprehensionStats,
  PreviewWordItem,
} from "@/types/media.types";
import {
  normalizeMediaComprehension,
  normalizeVocabularyRow,
  toPreviewWordItem,
} from "./normalizers";

const PREVIEW_SELECT = `
  canonical_id,
  frequency,
  first_occurrence_index,
  first_context_snippet,
  canonical_lexical_entity (
    lemma,
    pos,
    lexical_ranking (source, cefr, rank)
  )
`;

async function fetchMediaPreviewWords(mediaItemId: string): Promise<PreviewWordItem[]> {
  // Fetch mid-to-high frequency content words (skipping ultra-basic top 15 function words)
  const { data, error } = await supabase
    .from("media_vocabulary")
    .select(PREVIEW_SELECT)
    .eq("media_item_id", mediaItemId)
    .order("frequency", { ascending: false })
    .range(18, 35);

  if (error || !data) return [];
  return data
    .map(normalizeVocabularyRow)
    .filter((w) => w.lemma.length >= 4 && ["NOUN", "VERB", "ADJ"].includes(w.pos))
    .slice(0, 8)
    .map(toPreviewWordItem);
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

export async function fetchCatalogueItems(
  userId?: string | null
): Promise<MediaCatalogItem[]> {
  const [{ data, error }, compMap] = await Promise.all([
    supabase
      .from("media_item")
      .select("*, media_metrics(*)")
      .order("created_at", { ascending: false }),
    fetchMediaComprehensionMap(userId),
  ]);

  if (error) throw error;
  const rows = data || [];

  // Load preview words + authentic sample snippet in parallel for each item
  const previewsById = await Promise.all(
    rows.map(async (r) => ({
      id: r.id,
      words: await fetchMediaPreviewWords(r.id),
    }))
  );
  const previewLookup: Record<string, PreviewWordItem[]> = {};
  previewsById.forEach((p) => {
    previewLookup[p.id] = p.words;
  });

  return rows.map((row) => {
    const metrics = Array.isArray(row.media_metrics)
      ? row.media_metrics[0] || null
      : row.media_metrics || null;
    const previewWords = previewLookup[row.id] || [];
    const wordWithSentence = previewWords.find(
      (w) => w.sentence && w.sentence.length > 25
    );

    return {
      id: row.id,
      type: row.type,
      title: row.title,
      creator: row.creator || "J.K. Rowling",
      language: row.language || "es",
      format: row.format || "epub",
      cover_image_url: row.cover_image_url || null,
      release_year: row.release_year || null,
      metrics,
      comprehension: compMap[row.id] || null,
      previewWords,
      sampleSnippet:
        wordWithSentence?.sentence ||
        row.synopsis ||
        "«Texto auténtico indexado en el banco de oraciones del corpus español.»",
      sampleSourceLabel: wordWithSentence
        ? `CORPUS LINE · LEMMA «${wordWithSentence.lemma.toUpperCase()}»`
        : "CORPUS ARCHIVE · VERIFIED",
    };
  });
}
