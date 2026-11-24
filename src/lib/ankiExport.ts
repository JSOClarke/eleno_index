import { getWordRankForSource, type RankingSourceKey } from "@/lib/vocabSorting";
import type { UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";

export type RankingSource = RankingSourceKey;

/**
 * Plain-text field: tabs/newlines would break the TSV, so collapse them.
 * No HTML escaping — the file is imported as plain text so users can map the
 * columns onto whatever note type fields they like.
 */
function clean(value: string | null | undefined): string {
  return (value ?? "").replace(/[\r\n\t]+/g, " ").trim();
}

function rankFor(word: VocabularyWord, source: RankingSource): number | null {
  return getWordRankForSource(word.rankings, source);
}

/**
 * Build a tab-separated table with one column per field, in this order:
 *
 *   Lemma · IPA · POS · CEFR · Rank · Frequency · Definition · Chapter · Status
 *
 * Definitions are joined with " | ". No header row and no HTML, so every column
 * can be mapped freely in Anki's import dialog.
 */
export function buildAnkiTsv(
  words: VocabularyWord[],
  statusMap: Record<string, UserVocabStatus>,
  rankingSource: RankingSource = "tubelex_v2025"
): string {
  const lines = ["#separator:tab"];

  for (const word of words) {
    const definitions = (word.definitions || []).map(clean).filter(Boolean).join(" | ");
    const rank = rankFor(word, rankingSource);
    lines.push(
      [
        clean(word.lemma),
        clean(word.ipa),
        clean(word.pos),
        clean(word.cefr),
        rank == null ? "" : String(rank),
        String(word.frequency),
        definitions,
        String(word.first_occurrence_index),
        statusMap[word.canonical_id] || "unknown",
      ].join("\t")
    );
  }

  return `${lines.join("\n")}\n`;
}

/** Lowercase, accent-folded (niño -> nino), hyphenated, length-capped. */
function slugify(value?: string): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * `{slug}-{short id}-anki.tsv`, e.g. `el-nino-con-el-pijama-de-rayas-b65d6ca2-anki.tsv`.
 * The short media id keeps exports unique across books with the same title.
 */
export function ankiFilename(mediaTitle?: string, mediaItemId?: string): string {
  const base = slugify(mediaTitle) || "vocabulary";
  const shortId = (mediaItemId || "").replace(/[^a-z0-9]/gi, "").slice(0, 8);
  return `${[base, shortId].filter(Boolean).join("-")}-anki.tsv`;
}

/** Trigger a local file download; the content never leaves the browser. */
export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/tab-separated-values;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
