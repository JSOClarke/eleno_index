import React, { useState } from "react";
import { Quote } from "lucide-react";
import { WordContextDrawer } from "@/components/layout/WordContextDrawer";
import { formatNumber } from "@/lib/formatters";
import type { UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";

interface CanonicalPrimerRowProps {
  mediaItemId: string;
  word: VocabularyWord;
  rankingSource: "tubelex_v2025" | "elelex_v2020";
  status: UserVocabStatus | undefined;
  statusMap: Record<string, UserVocabStatus>;
  userId?: string | null;
  onChangeWordStatus: (word: VocabularyWord, targetStatus: UserVocabStatus) => void;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
}

export const CanonicalPrimerRow: React.FC<CanonicalPrimerRowProps> = ({
  mediaItemId,
  word,
  rankingSource,
  status,
  statusMap,
  userId,
  onChangeWordStatus,
  onSetWordStatus,
}) => {
  const [open, setOpen] = useState(false);

  const isEpisodeSnippet = /^\d+x\d+/i.test(word.first_context_snippet || "");
  const debutLabel = word.first_context_snippet
    ? isEpisodeSnippet
      ? `Ep. ${word.first_occurrence_index} · ${word.first_context_snippet}`
      : `Ch. ${word.first_occurrence_index} · ${word.first_context_snippet}`
    : `Chapter ${word.first_occurrence_index}`;

  const rankingEntry = word.rankings?.find((r) => r.source === rankingSource);
  const activeRank =
    rankingEntry?.rank ?? (rankingSource === "tubelex_v2025" ? word.global_rank : null);
  const rankTooltip = rankingEntry?.count
    ? `Corpus count: ${formatNumber(rankingEntry.count)}`
    : undefined;

  const isLearning = status === "learning";
  const isKnown = status === "known";

  return (
    <div>
      <div className="grid grid-cols-12 gap-3 px-4 py-3 items-center text-xs hover:bg-[#F8F8F6]">
        <div className="col-span-2 font-mono font-bold text-[#111111] truncate">{word.lemma}</div>
        <div className="col-span-2 font-mono text-[#555555] truncate">{word.ipa || "—"}</div>
        <div className="col-span-1 font-mono text-[#666666]">{word.pos}</div>
        <div className="col-span-1">
          <span className="px-1.5 py-0.5 border border-[#111111] font-mono text-[11px]">{word.cefr}</span>
        </div>
        <div className="col-span-1 font-mono tabular-nums">{word.frequency}x</div>
        <div className="col-span-1 font-mono tabular-nums text-[#444444]" title={rankTooltip}>
          {activeRank ? `#${formatNumber(activeRank)}` : "—"}
        </div>
        <div className="col-span-2 font-mono text-xs text-[#444444] truncate" title={debutLabel}>
          {debutLabel}
        </div>
        <div className="col-span-2 flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            title="Show dictionary definitions & authentic sentences"
            className={`p-1.5 border border-[#111111] transition-colors cursor-pointer ${
              open ? "bg-[#B8FF01] text-[#111111]" : "bg-white text-[#111111] hover:bg-[#F4F4F2]"
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChangeWordStatus(word, "learning")}
            title={isLearning ? "Reset to Unknown" : "Mark as Learning"}
            className={`px-2 py-1 font-mono text-[11px] border transition-colors cursor-pointer ${
              isLearning
                ? "border-[#111111] bg-[#B8FF01] text-[#111111] font-semibold"
                : "border-[#CCCCCC] bg-white text-[#555555] hover:border-[#111111] hover:text-[#111111]"
            }`}
          >
            {isLearning ? "● Learning" : "Learn"}
          </button>
          <button
            type="button"
            onClick={() => onChangeWordStatus(word, "known")}
            title={isKnown ? "Reset to Unknown" : "Mark as Known"}
            className={`px-2.5 py-1 font-mono text-[11px] border transition-colors cursor-pointer ${
              isKnown
                ? "border-[#111111] bg-[#111111] text-[#B8FF01] font-semibold"
                : "border-[#111111] bg-white text-[#111111] hover:bg-[#B8FF01]"
            }`}
          >
            {isKnown ? "✓ Known" : "Known"}
          </button>
        </div>
      </div>

      {open && (
        <WordContextDrawer
          lemma={word.lemma}
          pos={word.pos}
          definitions={word.definitions}
          canonicalId={word.canonical_id}
          mediaItemId={mediaItemId}
          userId={userId}
          statusMap={statusMap}
          onSetWordStatus={onSetWordStatus}
          fallbackContextLabel={debutLabel}
        />
      )}
    </div>
  );
};
