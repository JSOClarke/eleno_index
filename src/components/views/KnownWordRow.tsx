import React, { useState } from "react";
import { WordContextDrawer } from "@/components/layout/WordContextDrawer";
import { getCefrBadgeClass } from "@/lib/catalogueDisplay";
import { formatNumber } from "@/lib/formatters";
import { getRankingEntry, getRankSourceLabel, type RankingSourceKey } from "@/lib/vocabSorting";
import { PrimerRowActions } from "@/components/inspector/PrimerRowActions";
import type { KnownWordEntry, UserVocabStatus } from "@/types/vocabulary.types";

interface KnownWordRowProps {
  word: KnownWordEntry;
  status: UserVocabStatus | undefined;
  statusMap: Record<string, UserVocabStatus>;
  userId?: string | null;
  rankingSource: RankingSourceKey;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
}

export const KnownWordRow: React.FC<KnownWordRowProps> = ({
  word,
  status,
  statusMap,
  userId,
  rankingSource,
  onSetWordStatus,
}) => {
  const [open, setOpen] = useState(false);

  const rankingEntry = getRankingEntry(word.rankings, rankingSource);
  const activeRank = rankingEntry?.rank ?? null;
  const rankTooltip = rankingEntry?.count
    ? `Corpus count: ${formatNumber(rankingEntry.count)}`
    : undefined;
  const rankLabel = getRankSourceLabel(rankingSource);

  const dateLabel = word.updated_at
    ? new Date(word.updated_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const isLearning = status === "learning";
  const isKnown = status === "known";

  const actions = (
    <PrimerRowActions
      isOpen={open}
      isLearning={isLearning}
      isKnown={isKnown}
      onToggleOpen={() => setOpen((current) => !current)}
      onLearn={() => onSetWordStatus(word.canonical_id, isLearning ? null : "learning")}
      onKnown={() => onSetWordStatus(word.canonical_id, isKnown ? null : "known")}
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
          <span title={rankTooltip}>
            {activeRank ? `#${formatNumber(activeRank)} ${rankLabel}` : `No ${rankLabel} rank`}
          </span>
          <span>Added {dateLabel}</span>
        </div>

        <div className="flex justify-end">{actions}</div>
      </div>

      <div className="hidden grid-cols-12 items-center px-4 py-3 text-xs md:grid">
        <div className="col-span-3 px-2 truncate text-center font-semibold text-slate-900">{word.lemma}</div>
        <div className="col-span-2 px-2 truncate text-center font-mono text-[11px] text-slate-400">{word.ipa || "—"}</div>
        <div className="col-span-1 px-2 text-center text-[11px] font-medium text-slate-500">{word.pos}</div>
        <div className="col-span-1 px-2 text-center">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getCefrBadgeClass(word.cefr)}`}>
            {word.cefr}
          </span>
        </div>
        <div className="col-span-2 px-2 text-center tabular-nums text-slate-500" title={rankTooltip}>
          {activeRank ? `#${formatNumber(activeRank)}` : "—"}
        </div>
        <div className="col-span-1 px-2 truncate text-center text-xs text-slate-500">{dateLabel}</div>
        <div className="col-span-2 px-2 flex justify-center">{actions}</div>
      </div>

      {open && (
        <WordContextDrawer
          lemma={word.lemma}
          pos={word.pos}
          definitions={word.definitions}
          canonicalId={word.canonical_id}
          userId={userId}
          statusMap={statusMap}
          onSetWordStatus={onSetWordStatus}
          fallbackContextLabel="Corpus excerpt"
        />
      )}
    </div>
  );
};
