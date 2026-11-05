import React from "react";
import type { DefinitionLanguage, SelectedTokenState } from "@/types/reader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { WordDockContent } from "./WordDockContent";

interface ReaderWordDockProps {
  selectedToken: SelectedTokenState | null;
  status: UserVocabStatus | undefined;
  onSetStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  onClose: () => void;
  definitionLanguage: DefinitionLanguage;
  onDefinitionLanguageChange: (language: DefinitionLanguage) => void;
}

/** Desktop floating word panel. Phones use ReaderWordSheet instead. */
export const ReaderWordDock: React.FC<ReaderWordDockProps> = ({
  selectedToken,
  status,
  onSetStatus,
  onClose,
  definitionLanguage,
  onDefinitionLanguageChange,
}) => {
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!selectedToken) return null;
  const { surface, entry, morph } = selectedToken;
  const isLearning = status === "learning";
  const isKnown = status === "known";

  return (
    <aside
      onClick={(event) => event.stopPropagation()}
      className="fixed bottom-20 right-4 z-40 hidden max-h-[calc(100dvh-6rem)] w-[380px] max-w-[calc(100vw-2rem)] overflow-y-auto border border-[#E2E2DF] bg-white p-5 shadow-[0_8px_24px_rgba(17,17,17,0.14)] xl:block"
    >
      <div className="mb-3 flex items-center justify-between border-b border-[#E2E2DF] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111111]">
            // A CLOSER LOOK
          </span>
          <span
            className={`border border-[#111111] px-1.5 py-0.5 font-mono text-[10px] font-bold ${
              isLearning
                ? "bg-[#B8FF01] text-[#111111]"
                : isKnown
                ? "bg-[#111111] text-white"
                : "bg-[#F8F8F6] text-[#666666]"
            }`}
          >
            {isLearning ? "LEARNING" : isKnown ? "KNOWN" : "UNFAMILIAR"}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-xs font-bold text-[#666666] cursor-pointer"
        >
          ✕ ESC
        </button>
      </div>

      <WordDockContent
        surface={surface}
        entry={entry}
        morph={morph}
        status={status}
        onSetStatus={onSetStatus}
        definitionLanguage={definitionLanguage}
        onDefinitionLanguageChange={onDefinitionLanguageChange}
        phrases={selectedToken.phrases}
      />
    </aside>
  );
};
