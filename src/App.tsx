import React, { useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthModal } from "@/components/layout/AuthModal";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { KnownWordsView } from "@/components/views/KnownWordsView";
import { useAuth } from "@/hooks/useAuth";
import { useCatalogueData } from "@/hooks/useCatalogueData";
import { useFilterState } from "@/hooks/useFilterState";
import { useUserVocabulary } from "@/hooks/useUserVocabulary";
import { CataloguePage } from "@/pages/CataloguePage";
import { InspectorPage } from "@/pages/InspectorPage";
import { ReaderPage } from "@/pages/ReaderPage";
import type { MediaCatalogItem, PreviewWordItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

export const App: React.FC = () => {
  const auth = useAuth();
  const location = useLocation();
  const userVocab = useUserVocabulary(auth.user);
  const catalogue = useCatalogueData(auth.user?.id, auth.loading);
  const filterState = useFilterState();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleTogglePreviewWord = (item: MediaCatalogItem, word: PreviewWordItem) => {
    if (!auth.user) {
      setAuthModalOpen(true);
      return;
    }
    const oldStatus = userVocab.statusMap[word.canonical_id];
    const newStatus: UserVocabStatus | null = oldStatus === "known" ? null : "known";
    userVocab.setWordStatus(word.canonical_id, newStatus);
    catalogue.applyOptimisticWordToggle(item.id, word.frequency, newStatus, oldStatus);
  };

  const sharedCataloguePageProps = {
    items: catalogue.items,
    loading: catalogue.loading,
    filterState,
    statusMap: userVocab.statusMap,
    onToggleWord: handleTogglePreviewWord,
  };

  if (location.pathname.startsWith("/read/")) {
    return (
      <Routes>
        <Route
          path="/read/:mediaId"
          element={
            <ReaderPage
              statusMap={userVocab.statusMap}
              onSetWordStatus={userVocab.setWordStatus}
            />
          }
        />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      <TopNavBar
        savedCount={filterState.savedIds.size}
        knownCount={userVocab.knownCount}
        user={auth.user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={auth.signOut}
      />

      <main className="max-w-[1380px] w-full mx-auto px-6 py-6 flex-1">
        <Routes>
          <Route
            path="/"
            element={<CataloguePage mode="catalogue" {...sharedCataloguePageProps} />}
          />
          <Route
            path="/saved"
            element={<CataloguePage mode="saved" {...sharedCataloguePageProps} />}
          />
          <Route
            path="/history"
            element={<CataloguePage mode="history" {...sharedCataloguePageProps} />}
          />
          <Route
            path="/known-words"
            element={
              <KnownWordsView
                userId={auth.user?.id}
                statusMap={userVocab.statusMap}
                knownCount={userVocab.knownCount}
                onSetWordStatus={userVocab.setWordStatus}
              />
            }
          />
          <Route
            path="/media/:mediaId"
            element={
              <InspectorPage
                items={catalogue.items}
                catalogueLoading={catalogue.loading}
                userId={auth.user?.id}
                statusMap={userVocab.statusMap}
                onRecordHistory={filterState.recordHistory}
                onRequireAuth={() => setAuthModalOpen(true)}
                onSetWordStatus={userVocab.setWordStatus}
                onBubbleBookWordToggle={catalogue.applyOptimisticWordToggle}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
      />
    </div>
  );
};
