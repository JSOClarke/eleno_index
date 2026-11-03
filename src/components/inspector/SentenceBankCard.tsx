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
  onSelectToken: (token: SentenceToken) => void;
}

export const SentenceBankCard: React.FC<SentenceBankCardProps> = ({
  entry,
  showMatch,
  targetCanonicalId,
  statusMap,
  fallbackContextLabel,
  onSelectToken,
}) => (
  <div className="border-l-2 border-[#111111] pl-3 py-1">
    <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase text-[#666666]">
      <span>{entry.source_context || fallbackContextLabel}</span>
      <span>· {entry.token_count} words</span>
      {showMatch && (
        <span className="bg-[#B8FF01] text-[#111111] border border-[#9FE000] px-1.5 py-0.5 font-semibold">
          i+1 MATCH
        </span>
      )}
    </div>
    <p className="font-serif text-sm text-[#111111] italic mt-0.5">
      «
      <SentenceTokenLine
        sentence={entry.sentence}
        tokens={entry.tokens}
        targetCanonicalId={targetCanonicalId}
        statusMap={statusMap}
        onSelectToken={onSelectToken}
      />
      »
    </p>
  </div>
);
