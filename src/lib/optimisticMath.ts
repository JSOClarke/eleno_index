import type {
  MediaComprehensionStats,
  MediaMetrics,
} from "@/types/media.types";

/**
 * Computes an instant 0ms optimistic comprehension update when a word is toggled
 * between known and unknown. Strictly coerces all numbers to prevent BIGINT string bugs.
 */
export function applyOptimisticBookDelta(
  prev: MediaComprehensionStats | null,
  metrics: MediaMetrics | null,
  wordsDelta: number,
  wordFrequency: number
): MediaComprehensionStats {
  const totalWords = Number(prev?.total_words || metrics?.unique_words_count || 1);
  const prevKnownWords = Number(prev?.known_words || 0);
  const nextKnownWords = Math.max(0, Math.min(totalWords, prevKnownWords + wordsDelta));
  const nextVocabPct =
    totalWords > 0 ? Number(((nextKnownWords / totalWords) * 100).toFixed(1)) : 0;

  const totalTokens = Number(
    prev?.total_tokens || metrics?.trackable_tokens || metrics?.content_tokens || totalWords
  );
  const prevKnownTokens = Number(prev?.known_tokens || 0);
  const tokensDelta = wordsDelta * Number(wordFrequency || 1);
  const nextKnownTokens = Math.max(0, Math.min(totalTokens, prevKnownTokens + tokensDelta));
  const nextFlowPct =
    totalTokens > 0
      ? Number(((nextKnownTokens / totalTokens) * 100).toFixed(1))
      : nextVocabPct;

  return {
    media_item_id: prev?.media_item_id || metrics?.media_item_id || "",
    total_words: totalWords,
    known_words: nextKnownWords,
    comprehension_percentage: nextVocabPct,
    total_tokens: totalTokens,
    known_tokens: nextKnownTokens,
    text_coverage_percentage: nextFlowPct,
  };
}
