import { supabase } from "@/lib/supabase";
import type { MediaChapterMetrics } from "@/types/media.types";
import type { QuarantineItem, VocabularyWord } from "@/types/vocabulary.types";
import {
  normalizeChapterComprehension,
  normalizeVocabularyRow,
} from "./normalizers";

const VOCAB_SELECT = `
  canonical_id,
  frequency,
  first_occurrence_index,
  first_timestamp_ms,
  first_context_snippet,
  canonical_lexical_entity!inner (
    lemma,
    pos,
    definitions,
    lexical_ranking (source, cefr, rank, count),
    lexical_pronunciation (transcriptions)
  )
`;

export async function fetchFirstVocabPage(mediaItemId: string): Promise<VocabularyWord[]> {
  const { data, error } = await supabase
    .from("media_vocabulary")
    .select(VOCAB_SELECT)
    .eq("media_item_id", mediaItemId)
    .neq("canonical_lexical_entity.pos", "PROPN")
    .order("frequency", { ascending: false })
    .range(0, 119);

  if (error) throw error;
  return (data || [])
    .map(normalizeVocabularyRow)
    .filter((w) => w.pos !== "PROPN");
}

export async function fetchRemainingVocabPages(
  mediaItemId: string,
  expectedTotal: number,
  onBatch?: (batch: VocabularyWord[]) => void
): Promise<VocabularyWord[]> {
  const pageSize = 1000;
  const maxItems = Math.max(expectedTotal || 2000, 300);
  const offsets: number[] = [];
  for (let offset = 120; offset < maxItems; offset += pageSize) {
    offsets.push(offset);
  }
  if (offsets.length === 0) return [];

  const allWords: VocabularyWord[] = [];
  const batchSize = 3;
  for (let i = 0; i < offsets.length; i += batchSize) {
    const chunkOffsets = offsets.slice(i, i + batchSize);
    const results = await Promise.all(
      chunkOffsets.map((from) =>
        supabase
          .from("media_vocabulary")
          .select(VOCAB_SELECT)
          .eq("media_item_id", mediaItemId)
          .neq("canonical_lexical_entity.pos", "PROPN")
          .order("frequency", { ascending: false })
          .range(from, from + pageSize - 1)
      )
    );

    const batchWords: VocabularyWord[] = [];
    let reachedEnd = false;
    for (const res of results) {
      const rows = res.data || [];
      if (rows.length < pageSize) reachedEnd = true;
      if (rows.length > 0) {
        batchWords.push(...rows.map(normalizeVocabularyRow).filter((w) => w.pos !== "PROPN"));
      }
    }
    if (batchWords.length > 0) {
      allWords.push(...batchWords);
      onBatch?.(batchWords);
    }
    if (reachedEnd) break;
  }
  return allWords;
}

export async function fetchChapterMetricsWithComprehension(
  mediaItemId: string,
  userId?: string | null
): Promise<MediaChapterMetrics[]> {
  // Run chapter metrics AND user chapter comprehension RPC in parallel
  const [{ data: chData }, compResult] = await Promise.all([
    supabase
      .from("media_chapter_metrics")
      .select("*")
      .eq("media_item_id", mediaItemId)
      .order("chapter_index"),
    userId
      ? supabase.rpc("get_user_chapter_comprehension", {
          p_user_id: userId,
          p_media_item_id: mediaItemId,
        })
      : Promise.resolve({ data: null }),
  ]);

  if (!chData) return [];

  const compMap: Record<number, ReturnType<typeof normalizeChapterComprehension>> = {};
  if (compResult.data) {
    for (const row of compResult.data) {
      const parsed = normalizeChapterComprehension(row);
      compMap[parsed.chapter_index] = parsed;
    }
  }

  return chData.map((ch) => ({
    ...ch,
    user_comprehension: compMap[ch.chapter_index],
  }));
}

export async function fetchQuarantineItems(mediaItemId: string): Promise<QuarantineItem[]> {
  const { data, error } = await supabase
    .from("media_quarantine")
    .select("*")
    .eq("media_item_id", mediaItemId)
    .order("frequency", { ascending: false })
    .range(0, 999);

  if (error || !data) return [];
  return data;
}
