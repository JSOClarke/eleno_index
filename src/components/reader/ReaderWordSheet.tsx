import React from "react";
import { Sheet } from "@/components/ui/Sheet";
import type { DefinitionLanguage, SelectedTokenState } from "@/types/reader.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { WordDockContent } from "./WordDockContent";

interface ReaderWordSheetProps {
  selectedToken: SelectedTokenState | null;
  status: UserVocabStatus | undefined;
  onSetStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  onClose: () => void;
  definitionLanguage: DefinitionLanguage;
  onDefinitionLanguageChange: (language: DefinitionLanguage) => void;
}

/** Phone word sheet; the desktop dock remains ReaderWordDock. */
export const ReaderWordSheet: React.FC<ReaderWordSheetProps> = ({
  selectedToken,
  status,
  onSetStatus,
  onClose,
  definitionLanguage,
  onDefinitionLanguageChange,
}) => {
  if (!selectedToken) return null;
  if (typeof window !== "undefined" && window.innerWidth >= 1280) return null;

  return (
    <Sheet
      open={Boolean(selectedToken)}
      onClose={onClose}
      title="Word"
      className="xl:hidden"
    >
      <WordDockContent
        surface={selectedToken.surface}
        entry={selectedToken.entry}
        morph={selectedToken.morph}
        status={status}
        onSetStatus={onSetStatus}
        definitionLanguage={definitionLanguage}
        onDefinitionLanguageChange={onDefinitionLanguageChange}
        phrases={selectedToken.phrases}
      />
    </Sheet>
  );
};
