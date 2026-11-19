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
        <div className="h-44 rounded-2xl border border-slate-200/80 bg-white animate-pulse" />
        <div className="h-24 rounded-2xl border border-slate-200/80 bg-white animate-pulse" />
        <div className="h-64 rounded-2xl border border-slate-200/80 bg-white animate-pulse" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center space-y-3 shadow-xs">
        <div className="font-semibold text-base text-slate-900">
          Media record not found
        </div>
        <p className="text-xs text-slate-500">
          No corpus item matches ID: {mediaId}
        </p>
        <Link
          to="/catalogue"
          className="inline-block rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-600 transition"
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
