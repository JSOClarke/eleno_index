import React, { useEffect, useState } from "react";
import { useInspectorWordStatus } from "@/hooks/useInspectorWordStatus";
import { useMediaInspector } from "@/hooks/useMediaInspector";
import type { MediaCatalogItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { ReadflowChapterPacing } from "../components/ReadflowChapterPacing";
import { ReadflowInspectorHeader } from "../components/ReadflowInspectorHeader";
import { ReadflowPrimerLedger } from "../components/ReadflowPrimerLedger";

interface ReadflowInspectorPageProps {
  item: MediaCatalogItem;
  userId?: string;
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

export const ReadflowInspectorPage: React.FC<ReadflowInspectorPageProps> = ({
  item, userId, statusMap, onRequireAuth, onSetWordStatus, onBubbleBookWordToggle,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<number | "all">("all");
  const [activeTab, setActiveTab] = useState<"canonical" | "characters" | "noise">("canonical");
  const inspector = useMediaInspector(item, userId);

  useEffect(() => {
    setSelectedChapter("all");
    setActiveTab("canonical");
  }, [item.id]);

  useEffect(() => {
    if (activeTab === "characters" || activeTab === "noise") {
      inspector.loadQuarantine();
    }
  }, [activeTab, inspector]);

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

  return (
    <div className="min-h-screen bg-[#FAFAFA] hero-grid-bg text-[#040404] font-jakarta py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <ReadflowInspectorHeader item={item} comprehension={inspector.bookComp} />
        <ReadflowChapterPacing
          chapters={inspector.chapterMetrics}
          loading={inspector.chaptersLoading}
          selectedChapter={selectedChapter}
          onSelectChapter={setSelectedChapter}
        />
        <ReadflowPrimerLedger
          words={inspector.vocabulary}
          quarantineItems={inspector.quarantineItems}
          loading={inspector.loading}
          quarantineLoading={inspector.quarantineLoading}
          statusMap={statusMap}
          selectedChapter={selectedChapter}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onSetWordStatus={handleSetWordStatus}
        />
      </div>
    </div>
  );
};
