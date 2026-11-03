import React from "react";
import { Sheet } from "@/components/ui/Sheet";
import type { SelectedTokenState } from "@/hooks/useReaderSession";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { WordDockContent } from "./WordDockContent";

interface ReaderWordSheetProps {
  selectedToken: SelectedTokenState | null;
  status: UserVocabStatus | undefined;
  onSetStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  onClose: () => void;
}

/** Phone word sheet; the desktop dock remains ReaderWordDock. */
export const ReaderWordSheet: React.FC<ReaderWordSheetProps> = ({
  selectedToken,
  status,
  onSetStatus,
  onClose,
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
      />
    )}
  </Sheet>
);
