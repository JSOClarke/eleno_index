import React, { useState } from "react";
import { Quote } from "lucide-react";
import { fetchWordSentences, type WordSentenceEntry } from "@/api/inspector.api";
import { WordContextDrawer } from "@/components/layout/WordContextDrawer";
import { formatNumber } from "@/lib/formatters";
import type { VocabularyWord } from "@/types/vocabulary.types";

interface CanonicalPrimerRowProps {
  mediaItemId: string;
  word: VocabularyWord;
  rankingSource: "tubelex_v2025" | "elelex_v2020";
  isKnown: boolean;
  onToggleWord: (word: VocabularyWord) => void;
}

export const CanonicalPrimerRow: React.FC<CanonicalPrimerRowProps> = ({
  mediaItemId,
  word,
  rankingSource,
  isKnown,
  onToggleWord,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentences, setSentences] = useState<WordSentenceEntry[] | null>(null);

  const handleToggleSentences = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen && sentences === null) {
      setLoading(true);
      try {
        setSentences(await fetchWordSentences(mediaItemId, word.canonical_id));
      } finally {
        setLoading(false);
      }
    }
  };

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
        <div className="col-span-2 flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={handleToggleSentences}
            title="Show dictionary definitions & authentic sentences"
            className={`p-1.5 border border-[#111111] transition-colors cursor-pointer ${
              open ? "bg-[#B8FF01] text-[#111111]" : "bg-white text-[#111111] hover:bg-[#F4F4F2]"
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onToggleWord(word)}
            className={`px-3 py-1 font-mono text-xs border transition-colors cursor-pointer ${
              isKnown
                ? "border-[#111111] bg-[#111111] text-[#B8FF01] font-semibold"
                : "border-[#111111] bg-white text-[#111111] hover:bg-[#B8FF01]"
            }`}
          >
            {isKnown ? "✓ Known" : "Mark Known"}
          </button>
        </div>
      </div>

      {open && (
        <WordContextDrawer
          lemma={word.lemma}
          pos={word.pos}
          definitions={word.definitions}
          loadingSentences={loading}
          sentences={sentences}
          fallbackContextLabel={debutLabel}
        />
      )}
    </div>
  );
};
