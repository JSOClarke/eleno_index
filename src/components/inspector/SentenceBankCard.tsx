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
  <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 space-y-1">
    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
      <span className="font-medium text-slate-600">{entry.source_context || fallbackContextLabel}</span>
      <span>· {entry.token_count} words</span>
      {showMatch && (
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
          i+1 match
        </span>
      )}
    </div>
    <p className="font-sans text-[13px] text-slate-800 leading-relaxed">
      <SentenceTokenLine
        sentence={entry.sentence}
        tokens={entry.tokens}
        targetCanonicalId={targetCanonicalId}
        statusMap={statusMap}
        onSelectToken={(tok) => onSelectToken(tok, entry)}
      />
    </p>
  </div>
);
