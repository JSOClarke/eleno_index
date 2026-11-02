import type {
  ChapterComprehensionStats,
  MediaComprehensionStats,
  PreviewWordItem,
} from "@/types/media.types";
import type { LexicalRanking, VocabularyWord } from "@/types/vocabulary.types";

export function normalizeMediaComprehension(raw: any): MediaComprehensionStats {
  const totalWords = Number(raw.total_words || 0);
  const learningWords = Number(raw.learning_words || 0);
  const totalTokens = Number(raw.total_tokens || 0);
  const learningTokens = Number(raw.learning_tokens || 0);
  const vocabPct = Number(raw.comprehension_percentage || 0);
  const learnPct =
    totalWords > 0 ? (learningWords / totalWords) * 100 : Number(raw.learning_percentage || 0);
  const learnFlowPct =
    totalTokens > 0
      ? (learningTokens / totalTokens) * 100
      : Number(raw.learning_text_coverage_percentage ?? learnPct);

  return {
    media_item_id: String(raw.media_item_id || ""),
    total_words: totalWords,
    known_words: Number(raw.known_words || 0),
    learning_words: learningWords,
    comprehension_percentage: vocabPct,
    learning_percentage: learnPct,
    total_tokens: totalTokens,
    known_tokens: Number(raw.known_tokens || 0),
    learning_tokens: learningTokens,
    text_coverage_percentage: Number(raw.text_coverage_percentage ?? vocabPct),
    learning_text_coverage_percentage: learnFlowPct,
  };
}

export function normalizeChapterComprehension(raw: any): ChapterComprehensionStats {
  const totalWords = Number(raw.total_words || 0);
  const learningWords = Number(raw.learning_words || 0);
  const totalTokens = Number(raw.total_tokens || 0);
  const learningTokens = Number(raw.learning_tokens || 0);
  const learnPct =
    totalWords > 0 ? (learningWords / totalWords) * 100 : Number(raw.learning_percentage || 0);
  const learnFlowPct =
    totalTokens > 0
      ? (learningTokens / totalTokens) * 100
      : Number(raw.learning_text_coverage_percentage ?? learnPct);

  return {
    chapter_index: Number(raw.chapter_index),
    chapter_title: raw.chapter_title || `Chapter ${raw.chapter_index}`,
    total_words: totalWords,
    known_words: Number(raw.known_words || 0),
    learning_words: learningWords,
    chapter_comprehension_percentage: Number(raw.chapter_comprehension_percentage || 0),
    learning_percentage: learnPct,
    total_tokens: totalTokens,
    known_tokens: Number(raw.known_tokens || 0),
    learning_tokens: learningTokens,
    text_coverage_percentage:
      raw.text_coverage_percentage !== null && raw.text_coverage_percentage !== undefined
        ? Number(raw.text_coverage_percentage)
        : null,
    learning_text_coverage_percentage: learnFlowPct,
    new_words_count: Number(raw.new_words_count || 0),
    known_new_words: Number(raw.known_new_words || 0),
  };
}

export function normalizeVocabularyRow(row: any): VocabularyWord {
  const entity = row.canonical_lexical_entity || {};
  const rankings: LexicalRanking[] = entity.lexical_ranking || [];
  const pronunciations = entity.lexical_pronunciation || [];

  const cefrRanking =
    rankings.find((r) => r.source === "elelex_v2020" && r.cefr) ||
    rankings.find((r) => r.cefr);
  const cefr = cefrRanking?.cefr || "B2";

  const primaryRanking =
    rankings.find((r) => r.source === "tubelex_v2025") || rankings[0];
  const rank = primaryRanking?.rank ? Number(primaryRanking.rank) : null;

  let ipa: string | null = null;
  if (pronunciations.length > 0 && pronunciations[0]?.transcriptions?.length > 0) {
    ipa = pronunciations[0].transcriptions[0].ipa || null;
  }

  return {
    canonical_id: String(row.canonical_id || ""),
    lemma: String(entity.lemma || ""),
    pos: String(entity.pos || "NOUN"),
    definitions: Array.isArray(entity.definitions) ? entity.definitions : [],
    frequency: Number(row.frequency || 1),
    first_occurrence_index: Number(row.first_occurrence_index || 1),
    first_timestamp_ms: row.first_timestamp_ms ? Number(row.first_timestamp_ms) : null,
    first_context_snippet: row.first_context_snippet || null,
    cefr,
    global_rank: rank,
    rankings,
    ipa,
  };
}

export function toPreviewWordItem(word: VocabularyWord): PreviewWordItem {
  return {
    canonical_id: word.canonical_id,
    lemma: word.lemma,
    pos: word.pos,
    frequency: word.frequency,
    cefr: word.cefr,
    rank: word.global_rank,
    sentence: word.first_context_snippet,
  };
}
