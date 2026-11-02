import React, { useState } from "react";
import { Quote } from "lucide-react";
import type { WordSentenceEntry } from "@/api/inspector.api";
import { fetchGlobalWordSentences } from "@/api/vocabulary.api";
import { WordContextDrawer } from "@/components/layout/WordContextDrawer";
import { formatNumber } from "@/lib/formatters";
import type { KnownWordEntry } from "@/types/vocabulary.types";

interface KnownWordRowProps {
  word: KnownWordEntry;
  rankingSource: "tubelex_v2025" | "elelex_v2020";
  onRemoveWord: (canonicalId: string) => void;
}

export const KnownWordRow: React.FC<KnownWordRowProps> = ({
  word,
  rankingSource,
  onRemoveWord,
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
        setSentences(await fetchGlobalWordSentences(word.canonical_id));
      } finally {
        setLoading(false);
      }
    }
  };

  const rankingEntry = word.rankings?.find((r) => r.source === rankingSource);
  const activeRank =
    rankingEntry?.rank ?? (rankingSource === "tubelex_v2025" ? word.global_rank : null);
  const rankTooltip = rankingEntry?.count
    ? `Corpus count: ${formatNumber(rankingEntry.count)}`
    : undefined;

  const dateLabel = word.updated_at
    ? new Date(word.updated_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div>
      <div className="grid grid-cols-12 gap-3 px-4 py-3 items-center text-xs hover:bg-[#F8F8F6]">
        <div className="col-span-3 font-mono font-bold text-[#111111] truncate">{word.lemma}</div>
        <div className="col-span-2 font-mono text-[#555555] truncate">{word.ipa || "—"}</div>
        <div className="col-span-1 font-mono text-[#666666]">{word.pos}</div>
        <div className="col-span-1">
          <span className="px-1.5 py-0.5 border border-[#111111] font-mono text-[11px]">{word.cefr}</span>
        </div>
        <div className="col-span-2 font-mono tabular-nums text-[#444444]" title={rankTooltip}>
          {activeRank ? `#${formatNumber(activeRank)}` : "—"}
        </div>
        <div className="col-span-1 font-mono text-[11px] text-[#666666] truncate">{dateLabel}</div>
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
            onClick={() => onRemoveWord(word.canonical_id)}
            title="Click to unmark as known"
            className="px-3 py-1 font-mono text-xs border border-[#111111] bg-[#111111] text-[#B8FF01] font-semibold hover:opacity-80 transition-opacity cursor-pointer"
          >
            ✓ Known
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
          fallbackContextLabel="CORPUS EXCERPT"
        />
      )}
    </div>
  );
};
