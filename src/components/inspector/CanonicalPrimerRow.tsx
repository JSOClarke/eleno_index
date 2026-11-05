import React, { useState } from "react";
import { WordContextDrawer } from "@/components/layout/WordContextDrawer";
import { formatNumber } from "@/lib/formatters";
import type { UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";
import { PrimerRowActions } from "./PrimerRowActions";

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
  const activeRank = rankingEntry?.rank ?? null;
  const rankTooltip = rankingEntry?.count
    ? `Corpus count: ${formatNumber(rankingEntry.count)}`
    : undefined;
  const rankLabel = rankingSource === "tubelex_v2025" ? "TUBELEX" : "ELELEX";

  const isLearning = status === "learning";
  const isKnown = status === "known";

  const actions = (
    <PrimerRowActions
      isOpen={open}
      isLearning={isLearning}
      isKnown={isKnown}
      onToggleOpen={() => setOpen((current) => !current)}
      onLearn={() => onChangeWordStatus(word, "learning")}
      onKnown={() => onChangeWordStatus(word, "known")}
    />
  );

  return (
    <div className="border-b border-[#E2E2DF] md:border-0">
      {/* Mobile card: the 12-column grid is unreadable below md. */}
      <div className="space-y-2 px-4 py-3 md:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate font-mono text-sm font-bold text-[#111111]">{word.lemma}</div>
            <div className="truncate font-mono text-[11px] text-[#666666]">{word.ipa || "—"}</div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="border border-[#111111] bg-[#F8F8F6] px-1.5 py-0.5 font-mono text-[10px] font-bold">
              {word.pos}
            </span>
            <span className="border border-[#111111] px-1.5 py-0.5 font-mono text-[10px]">
              {word.cefr}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-[#444444]">
          <span>{word.frequency}× in book</span>
          <span title={rankTooltip}>
            {activeRank ? `#${formatNumber(activeRank)} ${rankLabel}` : `No ${rankLabel} rank`}
          </span>
        </div>

        <div className="line-clamp-2 font-mono text-[11px] text-[#555555]" title={debutLabel}>
          {debutLabel}
        </div>

        {actions}
      </div>

      {/* Desktop row */}
      <div className="hidden grid-cols-12 items-center gap-3 px-4 py-3 text-xs hover:bg-[#F8F8F6] md:grid">
        <div className="col-span-2 truncate font-mono font-bold text-[#111111]">{word.lemma}</div>
        <div className="col-span-2 truncate font-mono text-[#555555]">{word.ipa || "—"}</div>
        <div className="col-span-1 font-mono text-[#666666]">{word.pos}</div>
        <div className="col-span-1">
          <span className="border border-[#111111] px-1.5 py-0.5 font-mono text-[11px]">{word.cefr}</span>
        </div>
        <div className="col-span-1 font-mono tabular-nums">{word.frequency}x</div>
        <div className="col-span-1 font-mono tabular-nums text-[#444444]" title={rankTooltip}>
          {activeRank ? `#${formatNumber(activeRank)}` : "—"}
        </div>
        <div className="col-span-2 truncate font-mono text-xs text-[#444444]" title={debutLabel}>
          {debutLabel}
        </div>
        <div className="col-span-2">{actions}</div>
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
