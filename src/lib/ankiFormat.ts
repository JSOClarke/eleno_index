import {
  getRankingEntry,
  getRankSourceLabel,
  getWordRankForSource,
  type RankingSourceKey,
} from "@/lib/vocabSorting";
import type { LexicalRanking, VocabularyWord } from "@/types/vocabulary.types";

/** Formats an internal level token with its explicit proficiency scale (e.g. "CEFR A1", "HSK 6"). */
export function formatLevelLabel(level?: string | null): string {
  const raw = (level || "").trim();
  if (!raw) return "";
  const upper = raw.toUpperCase();
  if (/^(A[12]|B[12]|C[12])$/.test(upper)) return `CEFR ${upper}`;
  if (/^(TEU|TBU)$/.test(upper)) return `TRKI ${upper}`;
  if (/^N[1-5]\+?$/.test(upper)) return `JLPT ${upper}`;
  return raw;
}

/** Formats the corpus rank together with its source name (e.g. "TubeLex #2400"). */
export function formatRankLabel(
  rankings: LexicalRanking[] | undefined,
  source: RankingSourceKey
): string {
  const rank = getWordRankForSource(rankings, source);
  return rank != null ? `${getRankSourceLabel(source)} #${rank}` : "";
}

/** Formats the global corpus frequency count for the selected ranking source. */
export function formatGlobalFrequency(
  rankings: LexicalRanking[] | undefined,
  source: RankingSourceKey,
  formatted = true
): string {
  const count = getRankingEntry(rankings, source)?.count;
  if (count == null || count <= 0) return "";
  return formatted ? count.toLocaleString("en-US") : String(count);
}

/** Formats the word's reading with an explicit script/notation prefix (Pinyin, Hiragana, or IPA). */
export function formatReadingLabel(word: Pick<VocabularyWord, "ipa" | "reading">): string {
  const reading = (word.reading || "").trim();
  if (reading) return reading;
  const ipa = (word.ipa || "").trim();
  if (!ipa) return "";
  return /^(?:IPA|Pinyin|Hiragana|Katakana|Kana|Romaji):/i.test(ipa) ? ipa : `IPA: ${ipa}`;
}
