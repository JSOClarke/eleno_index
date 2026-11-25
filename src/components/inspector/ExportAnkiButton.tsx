import React, { useState } from "react";
import { Download } from "lucide-react";
import type { RankingSource } from "@/lib/ankiExport";
import type { UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";

interface ExportAnkiButtonProps {
  words: VocabularyWord[];
  statusMap: Record<string, UserVocabStatus>;
  mediaTitle?: string;
  mediaItemId?: string;
  rankingSource: RankingSource;
}

/** Downloads the currently filtered words as a styled Anki .apkg deck (lazy-loaded client-side). */
export const ExportAnkiButton: React.FC<ExportAnkiButtonProps> = ({
  words,
  statusMap,
  mediaTitle,
  mediaItemId,
  rankingSource,
}) => {
  const [exporting, setExporting] = useState(false);
  const disabled = words.length === 0 || exporting;

  const handleExport = async () => {
    if (disabled) return;
    setExporting(true);
    try {
      const { downloadApkgDeck } = await import("@/lib/ankiApkgExport");
      await downloadApkgDeck(words, statusMap, mediaTitle, mediaItemId, rankingSource);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled}
      title="Download filtered words as an Anki .apkg deck (Lemma, Reading, Level, Rank, GlobalFrequency, Sentence, Definition)"
      className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
    >
      <Download className="h-3.5 w-3.5" />
      {exporting ? "Building .apkg…" : `Export ${words.length.toLocaleString()} · Anki (.apkg)`}
    </button>
  );
};
