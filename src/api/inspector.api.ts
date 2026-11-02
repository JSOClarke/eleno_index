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
  canonical_lexical_entity (
    lemma,
    pos,
    lexical_ranking (source, cefr, rank, count),
    lexical_pronunciation (transcriptions)
  )
`;

export async function fetchFirstVocabPage(mediaItemId: string): Promise<VocabularyWord[]> {
  const { data, error } = await supabase
    .from("media_vocabulary")
    .select(VOCAB_SELECT)
    .eq("media_item_id", mediaItemId)
    .order("frequency", { ascending: false })
    .range(0, 119);

  if (error) throw error;
  return (data || []).map(normalizeVocabularyRow);
}

export async function fetchRemainingVocabPages(
  mediaItemId: string,
  expectedTotal: number
): Promise<VocabularyWord[]> {
  const pageSize = 1000;
  const maxItems = Math.max(expectedTotal, 10000);
  const offsets: number[] = [];
  for (let offset = 120; offset < maxItems; offset += pageSize) {
    offsets.push(offset);
  }

  const results = await Promise.all(
    offsets.map((from) =>
      supabase
        .from("media_vocabulary")
        .select(VOCAB_SELECT)
        .eq("media_item_id", mediaItemId)
        .order("frequency", { ascending: false })
        .range(from, from + pageSize - 1)
    )
  );

  const words: VocabularyWord[] = [];
  for (const res of results) {
    if (res.data && res.data.length > 0) {
      words.push(...res.data.map(normalizeVocabularyRow));
    }
  }
  return words;
}

export async function fetchChapterMetricsWithComprehension(
  mediaItemId: string,
  userId?: string | null
): Promise<MediaChapterMetrics[]> {
  const { data: chData } = await supabase
    .from("media_chapter_metrics")
    .select("*")
    .eq("media_item_id", mediaItemId)
    .order("chapter_index");

  if (!chData) return [];

  const compMap: Record<number, ReturnType<typeof normalizeChapterComprehension>> = {};
  if (userId) {
    const { data: compData } = await supabase.rpc("get_user_chapter_comprehension", {
      p_user_id: userId,
      p_media_item_id: mediaItemId,
    });
    if (compData) {
      for (const row of compData) {
        const parsed = normalizeChapterComprehension(row);
        compMap[parsed.chapter_index] = parsed;
      }
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
