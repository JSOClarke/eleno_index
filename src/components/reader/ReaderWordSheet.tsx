import React from "react";
import { Sheet } from "@/components/ui/Sheet";
import type { SelectedTokenState } from "@/hooks/useReaderSession";
import type { DefinitionLanguage } from "@/types/reader.types";
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
}) => (
  <Sheet
    open={Boolean(selectedToken)}
    onClose={onClose}
    title={selectedToken ? "Word" : ""}
    className="md:hidden"
  >
    {selectedToken && (
      <WordDockContent
        surface={selectedToken.surface}
        entry={selectedToken.entry}
        morph={selectedToken.morph}
        status={status}
        onSetStatus={onSetStatus}
        definitionLanguage={definitionLanguage}
        onDefinitionLanguageChange={onDefinitionLanguageChange}
      />
    )}
  </Sheet>
);
