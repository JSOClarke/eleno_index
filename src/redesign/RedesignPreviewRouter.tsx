import React from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import type { SupportedLanguage } from "@/lib/catalogueLanguages";
import type { MediaCatalogItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { ReadflowInspectorPage } from "./pages/ReadflowInspectorPage";
import { ReadflowPreviewPage } from "./pages/ReadflowPreviewPage";

export interface RedesignPreviewRouterProps {
  items: MediaCatalogItem[];
  loading: boolean;
  activeLanguage: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  knownCount: number;
  savedIds: Set<string>;
  onToggleSaved: (id: string) => void;
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

const InspectorRouteWrapper: React.FC<RedesignPreviewRouterProps> = (props) => {
  const { mediaId } = useParams<{ mediaId: string }>();
  const item = props.items.find((x) => x.id === mediaId) || props.items[0];
  if (!item) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-16 text-center text-sm text-[#5A595C]">
        {props.loading ? "Loading media item..." : "Media item not found."}
      </div>
    );
  }
  return (
    <ReadflowInspectorPage
      item={item}
      userId={props.userId}
      statusMap={props.statusMap}
      onRequireAuth={props.onRequireAuth}
      onSetWordStatus={props.onSetWordStatus}
      onBubbleBookWordToggle={props.onBubbleBookWordToggle}
    />
  );
};

export const RedesignPreviewRouter: React.FC<RedesignPreviewRouterProps> = (props) => {
  return (
    <Routes>
      <Route index element={<ReadflowPreviewPage {...props} />} />
      <Route path="media/:mediaId" element={<InspectorRouteWrapper {...props} />} />
      <Route path="*" element={<Navigate to="/preview" replace />} />
    </Routes>
  );
};
