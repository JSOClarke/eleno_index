import React, { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AuthModal } from "@/components/layout/AuthModal";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { AppRoutes } from "@/components/layout/AppRoutes";
import { ReaderAuthGate } from "@/components/views/ReaderAuthGate";
import { useAuth } from "@/hooks/useAuth";
import { useCatalogueData } from "@/hooks/useCatalogueData";
import { useFilterState } from "@/hooks/useFilterState";
import { useUserVocabulary } from "@/hooks/useUserVocabulary";
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

  const handleReloadAfterPacks = async () => {
    await userVocab.reloadVocab();
    await catalogue.reloadCatalogue();
  };

  const sharedCataloguePageProps = {
    items: catalogue.items,
    loading: catalogue.loading,
    filterState,
    statusMap: userVocab.statusMap,
    isAuthenticated: Boolean(auth.user),
    onRequireAuth: () => setAuthModalOpen(true),
    onToggleWord: handleTogglePreviewWord,
  };

  if (location.pathname.startsWith("/read/")) {
    return (
      <ReaderAuthGate
        loading={auth.loading}
        isAuthenticated={Boolean(auth.user)}
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
      >
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
      </ReaderAuthGate>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white text-[#111111]">
      <TopNavBar
        savedCount={filterState.savedIds.size}
        knownCount={userVocab.knownCount}
        learningCount={userVocab.learningCount}
        user={auth.user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={auth.signOut}
      />
      <main className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-8 flex-1">
        <AppRoutes
          user={auth.user}
          items={catalogue.items}
          catalogueLoading={catalogue.loading}
          statusMap={userVocab.statusMap}
          knownCount={userVocab.knownCount}
          sharedCataloguePageProps={sharedCataloguePageProps}
          onRequireAuth={() => setAuthModalOpen(true)}
          onSetWordStatus={userVocab.setWordStatus}
          onBubbleBookWordToggle={catalogue.applyOptimisticWordToggle}
          onRecordHistory={filterState.recordHistory}
          onReloadAfterPacks={handleReloadAfterPacks}
        />
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
