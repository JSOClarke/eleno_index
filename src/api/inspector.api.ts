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
  expectedTotal: number
): Promise<VocabularyWord[]> {
  const pageSize = 1000;
  // Cap to actual expected unique words count instead of blindly firing 10 queries up to 10,000
  const maxItems = Math.min(Math.max(expectedTotal || 2000, 300), 12000);
  const offsets: number[] = [];
  for (let offset = 120; offset < maxItems; offset += pageSize) {
    offsets.push(offset);
  }
  if (offsets.length === 0) return [];

  const results = await Promise.all(
    offsets.map((from) =>
      supabase
        .from("media_vocabulary")
        .select(VOCAB_SELECT)
        .eq("media_item_id", mediaItemId)
        .neq("canonical_lexical_entity.pos", "PROPN")
        .order("frequency", { ascending: false })
        .range(from, from + pageSize - 1)
    )
  );

  const words: VocabularyWord[] = [];
  for (const res of results) {
    if (res.data && res.data.length > 0) {
      words.push(
        ...res.data
          .map(normalizeVocabularyRow)
          .filter((w) => w.pos !== "PROPN")
      );
    }
  }
  return words;
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

export interface WordSentenceEntry {
  sentence: string;
  target_form: string | null;
  source_context: string | null;
}

export async function fetchWordSentences(
  mediaItemId: string,
  canonicalId: string
): Promise<WordSentenceEntry[]> {
  const { data, error } = await supabase
    .from("sentence_bank")
    .select("sentence, target_form, source_context")
    .eq("media_item_id", mediaItemId)
    .eq("canonical_id", canonicalId)
    .limit(3);

  if (error || !data) return [];
  return data;
}
