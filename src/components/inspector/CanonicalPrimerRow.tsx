import React, { useState } from "react";
import { WordContextDrawer } from "@/components/layout/WordContextDrawer";
import { getCefrBadgeClass } from "@/lib/catalogueDisplay";
import { formatNumber } from "@/lib/formatters";
import { getRankingEntry, getRankSourceLabel, type RankingSourceKey } from "@/lib/vocabSorting";
import type { UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";
import { PrimerRowActions } from "./PrimerRowActions";

interface CanonicalPrimerRowProps {
  mediaItemId: string;
  word: VocabularyWord;
  rankingSource: RankingSourceKey;
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

  const rankingEntry = getRankingEntry(word.rankings, rankingSource);
  const activeRank = rankingEntry?.rank ?? null;
  const rankTooltip = rankingEntry?.count
    ? `Corpus count: ${formatNumber(rankingEntry.count)}`
    : undefined;
  const rankLabel = getRankSourceLabel(rankingSource);

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
    <div className="transition-colors hover:bg-slate-50/70">
      <div className="space-y-2 px-4 py-3 md:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">{word.lemma}</div>
            <div className="truncate font-mono text-[11px] text-slate-400">{word.ipa || "—"}</div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {word.pos}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getCefrBadgeClass(word.cefr)}`}>
              {word.cefr}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
          <span>{word.frequency}× in book</span>
          <span title={rankTooltip}>
            {activeRank ? `#${formatNumber(activeRank)} ${rankLabel}` : `No ${rankLabel} rank`}
          </span>
        </div>

        <div className="line-clamp-2 text-[11px] text-slate-500" title={debutLabel}>
          {debutLabel}
        </div>

        {actions}
      </div>

      <div className="hidden md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.3fr)_minmax(0,0.7fr)_minmax(0,0.85fr)_minmax(0,0.7fr)_minmax(0,1.4fr)_minmax(0,1.9fr)_minmax(0,1.65fr)] items-center px-4 py-3 text-xs">
        <div className="min-w-0 px-2 truncate text-center font-semibold text-slate-900">{word.lemma}</div>
        <div className="min-w-0 px-2 truncate text-center font-mono text-[11px] text-slate-400">{word.ipa || "—"}</div>
        <div className="min-w-0 px-2 text-center text-[11px] font-medium text-slate-500">{word.pos}</div>
        <div className="min-w-0 px-2 text-center">
          <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${getCefrBadgeClass(word.cefr)}`}>{word.cefr}</span>
        </div>
        <div className="min-w-0 px-2 text-center tabular-nums text-slate-700">{word.frequency}×</div>
        <div className="min-w-0 px-2 text-center tabular-nums text-slate-500" title={rankTooltip}>
          {activeRank ? `#${formatNumber(activeRank)}` : "—"}
        </div>
        <div className="min-w-0 px-2 truncate text-center text-xs text-slate-500" title={debutLabel}>
          {debutLabel}
        </div>
        <div className="min-w-0 px-2">{actions}</div>
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
