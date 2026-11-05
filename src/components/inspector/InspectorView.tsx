import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMediaInspector } from "@/hooks/useMediaInspector";
import { useInspectorWordStatus } from "@/hooks/useInspectorWordStatus";
import type { MediaCatalogItem } from "@/types/media.types";
import type { UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";
import { CanonicalPrimerTable } from "./CanonicalPrimerTable";
import { ChapterPacingStrip } from "./ChapterPacingStrip";
import { InspectorSpecHeader } from "./InspectorSpecHeader";
import { LedgerTabs } from "./LedgerTabs";
import { LinguisticProfileRow } from "./LinguisticProfileRow";
import { QuarantineGrid } from "./QuarantineGrid";

interface InspectorViewProps {
  item: MediaCatalogItem;
  userId?: string | null;
  statusMap: Record<string, UserVocabStatus>;
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
  onRequireAuth,
  onSetWordStatus,
  onBubbleBookWordToggle,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedChapter, setSelectedChapter] = useState<number | "all">("all");
  const rawTab = searchParams.get("tab");
  const ledgerTab: "canonical" | "characters" | "noise" =
    rawTab === "characters" || rawTab === "noise" ? rawTab : "canonical";

  const inspector = useMediaInspector(item, userId);

  useEffect(() => {
    setSelectedChapter("all");
  }, [item.id]);

  useEffect(() => {
    if (ledgerTab === "characters" || ledgerTab === "noise") {
      inspector.loadQuarantine();
    }
  }, [ledgerTab, inspector]);

  const selectLedgerTab = (tab: "canonical" | "characters" | "noise") => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === "canonical") next.delete("tab");
      else next.set("tab", tab);
      return next;
    });
  };

  const handleSetWordStatus = useInspectorWordStatus({
    mediaItemId: item.id,
    userId,
    statusMap,
    words: inspector.vocabulary,
    onRequireAuth,
    onSetWordStatus,
    onBubbleBookWordToggle,
    onOptimisticWordChange: inspector.handleOptimisticWordChange,
  });

  const handleChangeWordStatus = (word: VocabularyWord, targetStatus: UserVocabStatus) =>
    handleSetWordStatus(word.canonical_id, targetStatus);

  return (
    <div className="space-y-6">
      <InspectorSpecHeader
        item={item}
        comprehension={inspector.bookComp}
        isAuthenticated={Boolean(userId)}
        onRequireAuth={onRequireAuth}
      />

      <LinguisticProfileRow metrics={item.metrics} />

      <ChapterPacingStrip
        chapters={inspector.chapterMetrics}
        loading={inspector.chaptersLoading}
        selectedChapter={selectedChapter}
        onSelectChapter={setSelectedChapter}
        bookMetrics={item.metrics}
        bookComprehension={inspector.bookComp}
      />

      <div className="space-y-4 pt-2">
        <div className="border-b border-[#111111] pb-2">
          <LedgerTabs
            active={ledgerTab}
            onChange={selectLedgerTab}
            canonicalCount={inspector.vocabulary.length}
          />
        </div>

        {ledgerTab === "canonical" ? (
          <CanonicalPrimerTable
            mediaItemId={item.id}
            words={inspector.vocabulary}
            loading={inspector.loading}
            selectedChapter={selectedChapter}
            onClearChapter={() => setSelectedChapter("all")}
            statusMap={statusMap}
            userId={userId}
            onRequireAuth={onRequireAuth}
            onChangeWordStatus={handleChangeWordStatus}
            onSetWordStatus={handleSetWordStatus}
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
