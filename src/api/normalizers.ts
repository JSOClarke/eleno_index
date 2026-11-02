import type {
  ChapterComprehensionStats,
  MediaComprehensionStats,
  PreviewWordItem,
} from "@/types/media.types";
import type { LexicalRanking, VocabularyWord } from "@/types/vocabulary.types";

export function normalizeMediaComprehension(raw: any): MediaComprehensionStats {
  const vocabPct = Number(raw.comprehension_percentage || 0);
  return {
    media_item_id: String(raw.media_item_id || ""),
    total_words: Number(raw.total_words || 0),
    known_words: Number(raw.known_words || 0),
    comprehension_percentage: vocabPct,
    total_tokens: Number(raw.total_tokens || 0),
    known_tokens: Number(raw.known_tokens || 0),
    text_coverage_percentage: Number(raw.text_coverage_percentage ?? vocabPct),
  };
}

export function normalizeChapterComprehension(raw: any): ChapterComprehensionStats {
  return {
    chapter_index: Number(raw.chapter_index),
    chapter_title: raw.chapter_title || `Chapter ${raw.chapter_index}`,
    total_words: Number(raw.total_words || 0),
    known_words: Number(raw.known_words || 0),
    chapter_comprehension_percentage: Number(raw.chapter_comprehension_percentage || 0),
    total_tokens: Number(raw.total_tokens || 0),
    known_tokens: Number(raw.known_tokens || 0),
    text_coverage_percentage:
      raw.text_coverage_percentage !== null && raw.text_coverage_percentage !== undefined
        ? Number(raw.text_coverage_percentage)
        : null,
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
