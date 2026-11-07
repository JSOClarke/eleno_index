import React from "react";
import { formatMorphology } from "@/lib/grammarFormatters";
import { getCefrBand, getRankBand } from "@/lib/readerHighlight";
import type { DefinitionLanguage, ElenoPhraseHint, TrackedLexiconEntry } from "@/types/reader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { WordDefinitionsPanel } from "./WordDefinitionsPanel";
import { WordImageSection } from "./WordImageSection";
import { WordLedgerSection } from "./WordLedgerSection";
import { WordPhrasesSection } from "./WordPhrasesSection";
import { WordSentenceAiSection } from "./WordSentenceAiSection";

interface WordDockContentProps {
  surface: string;
  entry: TrackedLexiconEntry;
  morph?: string;
  sentence?: string;
  status: UserVocabStatus | undefined;
  onSetStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  definitionLanguage: DefinitionLanguage;
  onDefinitionLanguageChange: (language: DefinitionLanguage) => void;
  phrases?: ElenoPhraseHint[];
}

/** Dictionary + ledger body shared by the desktop dock and the mobile sheet. */
export const WordDockContent: React.FC<WordDockContentProps> = ({
  surface,
  entry,
  morph,
  sentence,
  status,
  onSetStatus,
  definitionLanguage,
  onDefinitionLanguageChange,
  phrases = [],
}) => {
  const morphLabel = formatMorphology(morph);
  const cefrBand = getCefrBand(entry.cefr);
  const rankBand = getRankBand(entry.rank);

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(surface || entry.lemma);
    utterance.lang = "es-ES";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="truncate font-serif text-2xl font-bold text-[#111111]">{entry.lemma}</h2>
          {surface.toLowerCase() !== entry.lemma.toLowerCase() && (
            <span className="truncate font-serif text-sm italic text-[#666666]">({surface})</span>
          )}
          <span className="shrink-0 border border-[#111111] bg-[#F8F8F6] px-1.5 py-0.5 font-mono text-xs font-bold text-[#111111]">
            {entry.pos}
          </span>
        </div>
        <button
          type="button"
          onClick={handleSpeak}
          title="Listen to pronunciation"
          className="flex shrink-0 items-center gap-1.5 border border-[#111111] bg-[#B8FF01] px-2 py-1 font-mono text-xs font-bold text-[#111111] cursor-pointer"
        >
          AUDIO
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        {entry.ipa && <span className="italic text-[#555555]">[{entry.ipa}]</span>}
        {entry.cefr && (
          <span
            className={`border border-[#111111] px-1.5 font-mono font-bold ${
              cefrBand?.bg || "bg-[#B8FF01]"
            } ${cefrBand?.text || "text-[#111111]"}`}
          >
            {entry.cefr}
          </span>
        )}
        {entry.rank && (
          <span className="inline-flex items-center gap-1 border border-[#111111] bg-[#F8F8F6] px-1.5 font-mono tabular-nums text-[#111111]">
            <span className="text-[9px] font-bold uppercase text-[#666666]">
              {entry.rank_source === "tubelex_v2025" ? "TUBELEX" : entry.rank_source === "elelex_v2020" ? "ELELEX" : "RANK"}
            </span>
            <span className="text-[#888888]">#</span>
            <span className="font-bold">{entry.rank.toLocaleString()}</span>
            <span className={`px-1 text-[10px] font-bold ${rankBand.bg} ${rankBand.text}`}>
              {rankBand.label}
            </span>
          </span>
        )}
      </div>

      {morphLabel && (
        <div className="inline-flex items-center gap-1.5 border border-[#111111] bg-[#F8F8F6] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#111111]">
          <span className="font-bold text-[#888888]">FORM:</span>
          <span>{morphLabel}</span>
        </div>
      )}

      <WordDefinitionsPanel
        entry={entry}
        language={definitionLanguage}
        onLanguageChange={onDefinitionLanguageChange}
      />

      <WordSentenceAiSection sentence={sentence} targetWord={surface} />

      <WordPhrasesSection phrases={phrases} />

      <WordImageSection entry={entry} />

      <WordLedgerSection
        canonicalId={entry.id}
        status={status}
        onSetStatus={onSetStatus}
      />
    </div>
  );
};
