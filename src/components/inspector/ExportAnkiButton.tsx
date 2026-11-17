import React from "react";
import { Download } from "lucide-react";
import { ankiFilename, buildAnkiTsv, downloadTextFile, type RankingSource } from "@/lib/ankiExport";
import type { UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";

interface ExportAnkiButtonProps {
  words: VocabularyWord[];
  statusMap: Record<string, UserVocabStatus>;
  mediaTitle?: string;
  mediaItemId?: string;
  rankingSource: RankingSource;
}

const COLUMNS = "Lemma · IPA · POS · CEFR · Rank · Frequency · Definition · Chapter · Status";

/** Downloads the currently filtered words as a tab-separated table (client-side only). */
export const ExportAnkiButton: React.FC<ExportAnkiButtonProps> = ({
  words,
  statusMap,
  mediaTitle,
  mediaItemId,
  rankingSource,
}) => {
  const disabled = words.length === 0;

  const handleExport = () => {
    if (disabled) return;
    downloadTextFile(
      ankiFilename(mediaTitle, mediaItemId),
      buildAnkiTsv(words, statusMap, rankingSource)
    );
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled}
      title={`Download the filtered words as a TSV. Columns: ${COLUMNS}`}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
    >
      <Download className="h-3.5 w-3.5" />
      Export {words.length.toLocaleString()} · Anki TSV
    </button>
  );
};
