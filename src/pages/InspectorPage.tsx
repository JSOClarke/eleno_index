import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { InspectorView } from "@/components/inspector/InspectorView";
import type { MediaCatalogItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface InspectorPageProps {
  items: MediaCatalogItem[];
  catalogueLoading: boolean;
  userId?: string | null;
  statusMap: Record<string, UserVocabStatus>;
  onRecordHistory: (id: string) => void;
  onRequireAuth: () => void;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  onBubbleBookWordToggle: (
    mediaItemId: string,
    wordFrequency: number,
    newStatus: UserVocabStatus | null,
    oldStatus: UserVocabStatus | undefined
  ) => void;
}

export const InspectorPage: React.FC<InspectorPageProps> = ({
  items,
  catalogueLoading,
  userId,
  statusMap,
  onRecordHistory,
  onRequireAuth,
  onSetWordStatus,
  onBubbleBookWordToggle,
}) => {
  const { mediaId } = useParams<{ mediaId: string }>();
  const item = items.find((x) => x.id === mediaId) || null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (mediaId) {
      onRecordHistory(mediaId);
    }
  }, [mediaId, onRecordHistory]);

  if (catalogueLoading && !item) {
    return (
      <div className="space-y-6">
        <div className="h-44 border border-[#E2E2DF] bg-[#F8F8F6] animate-pulse" />
        <div className="h-24 border border-[#E2E2DF] bg-[#F8F8F6] animate-pulse" />
        <div className="h-64 border border-[#E2E2DF] bg-[#F8F8F6] animate-pulse" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="border border-[#111111] p-12 text-center space-y-3 font-mono text-xs">
        <div className="font-bold text-sm text-[#111111]">
          MEDIA RECORD NOT FOUND
        </div>
        <p className="text-[#666666]">
          No Spanish corpus item matches ID: {mediaId}
        </p>
        <Link
          to="/"
          className="inline-block px-4 py-2 bg-[#111111] text-[#B8FF01] font-semibold"
        >
          ← Back to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <InspectorView
      item={item}
      userId={userId}
      statusMap={statusMap}
      onRequireAuth={onRequireAuth}
      onSetWordStatus={onSetWordStatus}
      onBubbleBookWordToggle={onBubbleBookWordToggle}
    />
  );
};
