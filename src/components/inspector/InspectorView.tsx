import React, { useState } from "react";
import { useMediaInspector } from "@/hooks/useMediaInspector";
import type { MediaCatalogItem } from "@/types/media.types";
import type { UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";
import { CanonicalPrimerTable } from "./CanonicalPrimerTable";
import { ChapterPacingStrip } from "./ChapterPacingStrip";
import { InspectorSpecHeader } from "./InspectorSpecHeader";
import { LinguisticProfileRow } from "./LinguisticProfileRow";
import { QuarantineGrid } from "./QuarantineGrid";

interface InspectorViewProps {
  item: MediaCatalogItem;
  userId?: string | null;
  statusMap: Record<string, UserVocabStatus>;
  onBack: () => void;
  onRequireAuth: () => void;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  onBubbleBookWordToggle: (
    mediaItemId: string,
    wordFrequency: number,
    newStatus: UserVocabStatus | null,
    oldStatus: UserVocabStatus | undefined
  ) => void;
}

export const InspectorView: React.FC<InspectorViewProps> = ({
  item,
  userId,
  statusMap,
  onBack,
  onRequireAuth,
  onSetWordStatus,
  onBubbleBookWordToggle,
}) => {
  const [ledgerTab, setLedgerTab] = useState<"canonical" | "characters" | "noise">(
    "canonical"
  );
  const inspector = useMediaInspector(item, userId);

  const handleToggleWord = (word: VocabularyWord) => {
    if (!userId) {
      onRequireAuth();
      return;
    }
    const oldStatus = statusMap[word.canonical_id];
    const newStatus: UserVocabStatus | null = oldStatus === "known" ? null : "known";

    onSetWordStatus(word.canonical_id, newStatus);
    inspector.handleOptimisticWordChange(word, newStatus, oldStatus);
    onBubbleBookWordToggle(item.id, word.frequency, newStatus, oldStatus);
  };

  return (
    <div className="space-y-6">
      <InspectorSpecHeader
        item={item}
        comprehension={inspector.bookComp}
        onBack={onBack}
      />

      <LinguisticProfileRow metrics={item.metrics} />

      <ChapterPacingStrip chapters={inspector.chapterMetrics} />

      {/* Master Lexical Ledger Tabs */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-[#111111] pb-2">
          <div className="inline-flex gap-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setLedgerTab("canonical")}
              className={`px-3.5 py-1.5 border border-[#111111] cursor-pointer ${
                ledgerTab === "canonical"
                  ? "bg-[#111111] text-white font-semibold"
                  : "bg-white text-[#111111]"
              }`}
            >
              CANONICAL PRIMER ({inspector.vocabulary.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setLedgerTab("characters");
                inspector.loadQuarantine();
              }}
              className={`px-3.5 py-1.5 border border-[#111111] cursor-pointer ${
                ledgerTab === "characters"
                  ? "bg-[#111111] text-white font-semibold"
                  : "bg-white text-[#111111]"
              }`}
            >
              CAST OF CHARACTERS
            </button>
            <button
              type="button"
              onClick={() => {
                setLedgerTab("noise");
                inspector.loadQuarantine();
              }}
              className={`px-3.5 py-1.5 border border-[#111111] cursor-pointer ${
                ledgerTab === "noise"
                  ? "bg-[#111111] text-white font-semibold"
                  : "bg-white text-[#111111]"
              }`}
            >
              FILTERED NOISE
            </button>
          </div>
        </div>

        {ledgerTab === "canonical" ? (
          <CanonicalPrimerTable
            words={inspector.vocabulary}
            loading={inspector.loading}
            statusMap={statusMap}
            onToggleWord={handleToggleWord}
          />
        ) : (
          <QuarantineGrid
            items={inspector.quarantineItems}
            loading={inspector.quarantineLoading}
            mode={ledgerTab}
          />
        )}
      </div>
    </div>
  );
};
