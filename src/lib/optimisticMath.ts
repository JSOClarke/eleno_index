import type {
  MediaComprehensionStats,
  MediaMetrics,
} from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

/**
 * Computes an instant 0ms optimistic comprehension update when a word changes state
 * between unknown, learning, and known. Coerces all numbers to prevent BIGINT string bugs.
 */
export function applyOptimisticBookDelta(
  prev: MediaComprehensionStats | null,
  metrics: MediaMetrics | null,
  wordFrequency: number,
  newStatus: UserVocabStatus | null,
  oldStatus?: UserVocabStatus
): MediaComprehensionStats {
  const knownDelta = (newStatus === "known" ? 1 : 0) - (oldStatus === "known" ? 1 : 0);
  const learnDelta = (newStatus === "learning" ? 1 : 0) - (oldStatus === "learning" ? 1 : 0);
  const freq = Number(wordFrequency || 1);

  const totalWords = Number(prev?.total_words || metrics?.unique_words_count || 1);
  const nextKnownWords = Math.max(0, Math.min(totalWords, Number(prev?.known_words || 0) + knownDelta));
  const nextLearnWords = Math.max(0, Math.min(totalWords, Number(prev?.learning_words || 0) + learnDelta));

  const nextVocabPct = totalWords > 0 ? Number(((nextKnownWords / totalWords) * 100).toFixed(1)) : 0;
  const nextLearnPct = totalWords > 0 ? (nextLearnWords / totalWords) * 100 : 0;

  const totalTokens = Number(
    prev?.total_tokens || metrics?.trackable_tokens || metrics?.content_tokens || totalWords
  );
  const nextKnownTokens = Math.max(0, Math.min(totalTokens, Number(prev?.known_tokens || 0) + knownDelta * freq));
  const nextLearnTokens = Math.max(0, Math.min(totalTokens, Number(prev?.learning_tokens || 0) + learnDelta * freq));

  const nextFlowPct = totalTokens > 0 ? Number(((nextKnownTokens / totalTokens) * 100).toFixed(1)) : nextVocabPct;
  const nextLearnFlowPct = totalTokens > 0 ? (nextLearnTokens / totalTokens) * 100 : nextLearnPct;

  return {
    media_item_id: prev?.media_item_id || metrics?.media_item_id || "",
    total_words: totalWords,
    known_words: nextKnownWords,
    learning_words: nextLearnWords,
    comprehension_percentage: nextVocabPct,
    learning_percentage: nextLearnPct,
    total_tokens: totalTokens,
    known_tokens: nextKnownTokens,
    learning_tokens: nextLearnTokens,
    text_coverage_percentage: nextFlowPct,
    learning_text_coverage_percentage: nextLearnFlowPct,
  };
}
