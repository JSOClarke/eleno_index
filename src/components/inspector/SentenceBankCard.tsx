import React, { useState } from "react";
import { Languages } from "lucide-react";
import { readActiveLanguage } from "@/lib/catalogueLanguages";
import { translateText } from "@/lib/translationProvider";
import type { BankSentence, SentenceToken } from "@/types/sentence.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { SentenceTokenLine } from "./SentenceTokenLine";

interface SentenceBankCardProps {
  entry: BankSentence;
  showMatch: boolean;
  targetCanonicalId: string;
  statusMap: Record<string, UserVocabStatus>;
  fallbackContextLabel: string;
  selectedToken?: SentenceToken | null;
  onSelectToken: (token: SentenceToken, entry: BankSentence) => void;
}

export const SentenceBankCard: React.FC<SentenceBankCardProps> = ({
  entry,
  showMatch,
  targetCanonicalId,
  statusMap,
  fallbackContextLabel,
  selectedToken,
  onSelectToken,
}) => {
  const [translation, setTranslation] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [showTr, setShowTr] = useState(false);

  const handleTranslate = async () => {
    if (translation) { setShowTr((v) => !v); return; }
    setTranslating(true);
    try {
      setTranslation(await translateText(entry.sentence, readActiveLanguage(), "en"));
      setShowTr(true);
    } catch {
      setTranslation("Could not translate sentence.");
      setShowTr(true);
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 px-4 py-3 space-y-1.5">
      <p className="font-sans text-sm text-slate-800 leading-relaxed">
        <SentenceTokenLine
          sentence={entry.sentence}
          tokens={entry.tokens}
          targetCanonicalId={targetCanonicalId}
          statusMap={statusMap}
          selectedToken={selectedToken}
          onSelectToken={(tok) => onSelectToken(tok, entry)}
        />
      </p>
      {showTr && translation && (
        <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-1.5 text-xs text-slate-600 leading-relaxed">
          {translation}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <span className="font-medium text-slate-500">{entry.source_context || fallbackContextLabel}</span>
        <div className="flex items-center gap-2 shrink-0 tabular-nums">
          <button
            type="button"
            onClick={handleTranslate}
            disabled={translating}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 cursor-pointer disabled:opacity-50"
          >
            <Languages className="h-3 w-3" />
            {translating ? "Translating..." : showTr ? "Hide" : "Translate"}
          </button>
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
};
