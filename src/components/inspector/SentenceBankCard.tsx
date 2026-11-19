import React from "react";
import type { BankSentence, SentenceToken } from "@/types/sentence.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { SentenceTokenLine } from "./SentenceTokenLine";

interface SentenceBankCardProps {
  entry: BankSentence;
  showMatch: boolean;
  targetCanonicalId: string;
  statusMap: Record<string, UserVocabStatus>;
  fallbackContextLabel: string;
  onSelectToken: (token: SentenceToken, entry: BankSentence) => void;
}

export const SentenceBankCard: React.FC<SentenceBankCardProps> = ({
  entry,
  showMatch,
  targetCanonicalId,
  statusMap,
  fallbackContextLabel,
  onSelectToken,
}) => (
  <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 px-4 py-3 space-y-1.5">
    <p className="font-sans text-sm text-slate-800 leading-relaxed">
      <SentenceTokenLine
        sentence={entry.sentence}
        tokens={entry.tokens}
        targetCanonicalId={targetCanonicalId}
        statusMap={statusMap}
        onSelectToken={(tok) => onSelectToken(tok, entry)}
      />
    </p>
    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
      <span className="font-medium text-slate-500">{entry.source_context || fallbackContextLabel}</span>
      <div className="flex items-center gap-2 shrink-0 tabular-nums">
        <span>{entry.token_count} words</span>
        {showMatch && (
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
            i+1
          </span>
        )}
      </div>
    </div>
  </div>
);
