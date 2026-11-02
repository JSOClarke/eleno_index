import React from "react";
import type { WordSentenceEntry } from "@/api/inspector.api";

interface WordContextDrawerProps {
  lemma: string;
  pos: string;
  definitions: string[];
  loadingSentences: boolean;
  sentences: WordSentenceEntry[] | null;
  fallbackContextLabel: string;
}

function highlightTargetForm(sentence: string, target: string | null) {
  if (!target) return sentence;
  const idx = sentence.toLowerCase().indexOf(target.toLowerCase());
  if (idx === -1) return sentence;
  return (
    <>
      {sentence.slice(0, idx)}
      <span className="bg-[#B8FF01] text-[#111111] font-semibold px-1 not-italic">
        {sentence.slice(idx, idx + target.length)}
      </span>
      {sentence.slice(idx + target.length)}
    </>
  );
}

export const WordContextDrawer: React.FC<WordContextDrawerProps> = ({
  lemma,
  pos,
  definitions,
  loadingSentences,
  sentences,
  fallbackContextLabel,
}) => {
  return (
    <div className="bg-[#F4F4F2] border-t border-[#E2E2DF] px-6 py-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
      {/* Left: Canonical Dictionary Definitions (0ms) */}
      <div className="md:col-span-5 space-y-1.5">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[#666666]">
          CANONICAL DEFINITIONS · {lemma.toUpperCase()} ({pos})
        </div>
        {definitions && definitions.length > 0 ? (
          <ol className="list-decimal list-inside space-y-1 text-xs text-[#111111] font-sans">
            {definitions.map((gloss, i) => (
              <li key={i} className="leading-snug">
                {gloss}
              </li>
            ))}
          </ol>
        ) : (
          <div className="font-mono text-xs text-[#777777]">
            No dictionary senses recorded for this headword.
          </div>
        )}
      </div>

      {/* Right: Authentic Sentence Bank Excerpts */}
      <div className="md:col-span-7 space-y-2">
        {loadingSentences ? (
          <div className="border-l-2 border-[#CCCCCC] pl-3 py-1 space-y-2 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-24 bg-[#DFDFDC]" />
              <div className="h-2.5 w-16 bg-[#E6E6E3]" />
            </div>
            <div className="space-y-1.5 pt-0.5">
              <div className="h-3.5 w-11/12 bg-[#DFDFDC]" />
              <div className="h-3.5 w-3/5 bg-[#E6E6E3]" />
            </div>
          </div>
        ) : !sentences || sentences.length === 0 ? (
          <div className="font-mono text-xs text-[#666666]">
            No indexed sentence found in sentence_bank for «{lemma}».
          </div>
        ) : (
          sentences.map((s, idx) => (
            <div key={idx} className="border-l-2 border-[#111111] pl-3 py-0.5">
              <div className="font-mono text-[10px] uppercase text-[#666666]">
                SENTENCE BANK · {s.source_context || fallbackContextLabel}
              </div>
              <p className="font-serif text-sm text-[#111111] italic mt-0.5">
                «{highlightTargetForm(s.sentence, s.target_form || lemma)}»
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
