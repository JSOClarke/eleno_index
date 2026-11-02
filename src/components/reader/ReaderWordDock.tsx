import React from "react";
import type { SelectedTokenState } from "@/hooks/useReaderSession";
import { formatMorphology } from "@/lib/grammarFormatters";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface ReaderWordDockProps {
  selectedToken: SelectedTokenState | null;
  status: UserVocabStatus | undefined;
  onSetStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  onClose: () => void;
}

export const ReaderWordDock: React.FC<ReaderWordDockProps> = ({
  selectedToken,
  status,
  onSetStatus,
  onClose,
}) => {
  if (!selectedToken) return null;
  const { surface, entry, morph } = selectedToken;
  const isLearning = status === "learning";
  const isKnown = status === "known";
  const morphLabel = formatMorphology(morph);

  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(surface || entry.lemma);
      utt.lang = "es-ES";
      utt.rate = 0.9;
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <aside className="fixed bottom-4 right-4 z-40 w-[380px] max-w-[calc(100vw-2rem)] border-2 border-[#111111] bg-white p-5 shadow-[6px_6px_0px_#111111]">
      <div className="mb-3 flex items-center justify-between border-b-2 border-[#111111] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111111]">// A CLOSER LOOK</span>
          <span className={`border border-[#111111] px-1.5 py-0.5 font-mono text-[10px] font-bold ${
            isLearning ? "bg-[#B8FF01] text-[#111111]" : isKnown ? "bg-[#111111] text-white" : "bg-[#F8F8F6] text-[#666666]"
          }`}>
            {isLearning ? "LEARNING" : isKnown ? "KNOWN" : "UNFAMILIAR"}
          </span>
        </div>
        <button onClick={onClose} className="font-mono text-xs font-bold text-[#666666] hover:text-[#111111]">
          ✕ ESC
        </button>
      </div>

      <div className="mb-3 space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <h2 className="font-serif text-2xl font-bold text-[#111111]">{entry.lemma}</h2>
            {surface.toLowerCase() !== entry.lemma.toLowerCase() && (
              <span className="font-serif text-sm italic text-[#666666]">({surface})</span>
            )}
            <span className="border border-[#111111] bg-[#F8F8F6] px-1.5 py-0.5 font-mono text-xs font-bold text-[#111111]">
              {entry.pos}
            </span>
          </div>
          <button
            onClick={handleSpeak}
            title="Listen to pronunciation"
            className="flex items-center gap-1 border border-[#111111] bg-[#B8FF01] px-2 py-1 font-mono text-xs font-bold text-[#111111] shadow-[2px_2px_0px_#111111] transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>🔊</span>
            <span>PLAY</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {entry.ipa && <span className="italic text-[#555555]">[{entry.ipa}]</span>}
          {entry.cefr && <span className="border border-[#111111] bg-[#B8FF01] px-1.5 font-mono font-bold text-[#111111]">{entry.cefr}</span>}
          {entry.rank && <span className="font-mono text-[#666666] tabular-nums">#{entry.rank.toLocaleString()} TubeLex</span>}
        </div>

        {morphLabel && (
          <div className="font-mono text-[11px] font-semibold text-[#111111] bg-[#F8F8F6] border border-[#111111] px-2 py-0.5 inline-flex items-center gap-1.5 shadow-[1px_1px_0px_#111111]">
            <span className="text-[#888888] font-bold">FORM:</span>
            <span>{morphLabel}</span>
          </div>
        )}
      </div>

      <div className="mb-4 border-t border-[#E2E2DF] pt-2.5">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] font-bold uppercase text-[#666666]">
          <span>KAIKKI DEFINITIONS</span>
          <span className="text-[#888888]">es → en</span>
        </div>
        <ol className="max-h-32 space-y-1.5 overflow-y-auto font-sans text-xs leading-relaxed text-[#222222] pr-1">
          {entry.definitions.length > 0 ? (
            entry.definitions.slice(0, 4).map((d, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="font-mono font-bold text-[#666666]">{i + 1}.</span>
                <span>{d}</span>
              </li>
            ))
          ) : (
            <p className="italic text-[#888888]">No English definition available.</p>
          )}
        </ol>
      </div>

      <div className="space-y-2 border-t-2 border-[#111111] pt-3">
        <div className="font-mono text-[10px] font-bold uppercase text-[#666666]">YOUR VOCABULARY LEDGER</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSetStatus(entry.id, isLearning ? null : "learning")}
            className={`border border-[#111111] py-2 font-mono text-xs font-bold shadow-[2px_2px_0px_#111111] ${
              isLearning ? "bg-[#B8FF01] text-[#111111]" : "bg-white text-[#111111] hover:bg-[#B8FF01]"
            }`}
          >
            {isLearning ? "✓ Still Learning" : "Learn"}
          </button>
          <button
            onClick={() => onSetStatus(entry.id, isKnown ? null : "known")}
            className={`border border-[#111111] py-2 font-mono text-xs font-bold shadow-[2px_2px_0px_#111111] ${
              isKnown ? "bg-[#111111] text-white" : "bg-white text-[#111111] hover:bg-[#111111] hover:text-white"
            }`}
          >
            {isKnown ? "Known ✓" : "Mark Known"}
          </button>
        </div>
        <button
          onClick={() => onSetStatus(entry.id, null)}
          className="w-full text-center font-mono text-[10px] text-[#888888] hover:text-[#111111] py-0.5"
        >
          Reset to Unfamiliar / Default
        </button>
      </div>
    </aside>
  );
};
