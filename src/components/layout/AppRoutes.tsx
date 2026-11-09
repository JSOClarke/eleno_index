import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { KnownWordsView } from "@/components/views/KnownWordsView";
import { SignInNotice } from "@/components/views/SignInNotice";
import { CataloguePage } from "@/pages/CataloguePage";
import { InspectorPage } from "@/pages/InspectorPage";
import { AdminImportPage } from "@/pages/AdminImportPage";
import { FlashcardReviewPage } from "@/pages/FlashcardReviewPage";
import { WorkPage } from "@/pages/WorkPage";
import type { MediaCatalogItem } from "@/types/media.types";
import type { UserProfile, UserVocabStatus } from "@/types/vocabulary.types";

interface AppRoutesProps {
  user: UserProfile | null;
  items: MediaCatalogItem[];
  catalogueLoading: boolean;
  statusMap: Record<string, UserVocabStatus>;
  knownCount: number;
  sharedCataloguePageProps: any;
  onRequireAuth: () => void;
  onSetWordStatus: (canonicalId: string, status: UserVocabStatus | null) => void;
  onBubbleBookWordToggle: (mediaId: string, freq: number, newStatus: UserVocabStatus | null, oldStatus?: UserVocabStatus) => void;
  onRecordHistory: (mediaId: string) => void;
  onReloadAfterPacks: () => Promise<void>;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  user,
  items,
  catalogueLoading,
  statusMap,
  knownCount,
  sharedCataloguePageProps,
  onRequireAuth,
  onSetWordStatus,
  onBubbleBookWordToggle,
  onRecordHistory,
  onReloadAfterPacks,
}) => {
  return (
    <Routes>
      <Route path="/" element={<CataloguePage mode="catalogue" {...sharedCataloguePageProps} />} />
      <Route path="/saved" element={<CataloguePage mode="saved" {...sharedCataloguePageProps} />} />
      <Route path="/history" element={<CataloguePage mode="history" {...sharedCataloguePageProps} />} />
      <Route
        path="/known-words"
        element={
          user ? (
            <KnownWordsView
              userId={user.id}
              statusMap={statusMap}
              knownCount={knownCount}
              onSetWordStatus={onSetWordStatus}
              onReloadVocabulary={onReloadAfterPacks}
            />
          ) : (
            <SignInNotice
              title="Vocabulary Ledger"
              message="Sign in to see the words you've marked as known or learning."
              onSignIn={onRequireAuth}
            />
          )
        }
      />
      <Route
        path="/reviews"
        element={
          user ? (
            <FlashcardReviewPage userId={user.id} />
          ) : (
            <SignInNotice
              title="Cloze Flashcards"
              message="Sign in to practice your due flashcards and spaced repetition queue."
              onSignIn={onRequireAuth}
            />
          )
        }
      />
      <Route
        path="/media/:mediaId"
        element={
          <InspectorPage
            items={items}
            catalogueLoading={catalogueLoading}
            userId={user?.id}
            statusMap={statusMap}
            onRecordHistory={onRecordHistory}
            onRequireAuth={onRequireAuth}
            onSetWordStatus={onSetWordStatus}
            onBubbleBookWordToggle={onBubbleBookWordToggle}
          />
        }
      />
      <Route
        path="/work/:workId"
        element={
          <WorkPage
            items={items}
            loading={catalogueLoading}
            isAuthenticated={Boolean(user)}
            onRequireAuth={onRequireAuth}
          />
        }
      />
      <Route
        path="/admin/imports"
        element={
          user ? (
            <AdminImportPage />
          ) : (
            <SignInNotice
              title="Import Workbench"
              message="Sign in to stage and audit book imports."
              onSignIn={onRequireAuth}
            />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
