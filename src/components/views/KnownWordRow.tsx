import React, { useState } from "react";
import { WordContextDrawer } from "@/components/layout/WordContextDrawer";
import { formatNumber } from "@/lib/formatters";
import { PrimerRowActions } from "@/components/inspector/PrimerRowActions";
import type { KnownWordEntry, UserVocabStatus } from "@/types/vocabulary.types";

interface KnownWordRowProps {
  word: KnownWordEntry;
  status: UserVocabStatus | undefined;
  statusMap: Record<string, UserVocabStatus>;
  userId?: string | null;
  rankingSource: "tubelex_v2025" | "elelex_v2020";
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

  const rankingEntry = word.rankings?.find((r) => r.source === rankingSource);
  const activeRank = rankingEntry?.rank ?? null;
  const rankTooltip = rankingEntry?.count
    ? `Corpus count: ${formatNumber(rankingEntry.count)}`
    : undefined;
  const rankLabel = rankingSource === "tubelex_v2025" ? "TUBELEX" : "ELELEX";

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
    <div>
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
          <span title={rankTooltip}>
            {activeRank ? `#${formatNumber(activeRank)} ${rankLabel}` : `No ${rankLabel} rank`}
          </span>
          <span>Added {dateLabel}</span>
        </div>

        <div className="flex justify-end">{actions}</div>
      </div>

      <div className="hidden grid-cols-12 items-center gap-3 px-4 py-3 text-xs hover:bg-[#F8F8F6] md:grid">
        <div className="col-span-3 truncate font-mono font-bold text-[#111111]">{word.lemma}</div>
        <div className="col-span-2 truncate font-mono text-[#555555]">{word.ipa || "—"}</div>
        <div className="col-span-1 font-mono text-[#666666]">{word.pos}</div>
        <div className="col-span-1">
          <span className="border border-[#111111] px-1.5 py-0.5 font-mono text-[11px]">{word.cefr}</span>
        </div>
        <div className="col-span-2 font-mono tabular-nums text-[#444444]" title={rankTooltip}>
          {activeRank ? `#${formatNumber(activeRank)}` : "—"}
        </div>
        <div className="col-span-1 truncate font-mono text-[11px] text-[#666666]">{dateLabel}</div>
        <div className="col-span-2 flex justify-end">{actions}</div>
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
          fallbackContextLabel="CORPUS EXCERPT"
        />
      )}
    </div>
  );
};
