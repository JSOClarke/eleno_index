import React, { useMemo, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AuthModal } from "@/components/layout/AuthModal";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { AppRoutes } from "@/components/layout/AppRoutes";
import { ReaderAuthGate } from "@/components/views/ReaderAuthGate";
import { useAuth } from "@/hooks/useAuth";
import { useCatalogueData } from "@/hooks/useCatalogueData";
import { useFilterState } from "@/hooks/useFilterState";
import { useUserVocabulary } from "@/hooks/useUserVocabulary";
import {
  readActiveLanguage,
  selectWorkEditionForLanguage,
  writeActiveLanguage,
  type SupportedLanguage,
} from "@/lib/catalogueLanguages";
import { inspectorCache } from "@/lib/inspectorCache";
import { ReaderPage } from "@/pages/ReaderPage";
import { RedesignPreviewRouter } from "@/redesign/RedesignPreviewRouter";
import type { MediaCatalogItem, PreviewWordItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

export const App: React.FC = () => {
  const auth = useAuth();
  const location = useLocation();
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage>(() =>
    readActiveLanguage()
  );
  const userVocab = useUserVocabulary(auth.user, activeLanguage);
  const catalogue = useCatalogueData(auth.user?.id, auth.loading);
  const filterState = useFilterState();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleChangeLanguage = (lang: SupportedLanguage) => {
    setActiveLanguage(lang);
    writeActiveLanguage(lang);
  };

  const languageCatalogueItems = useMemo(
    () =>
      catalogue.items
        .map((item) => selectWorkEditionForLanguage(item, activeLanguage))
        .filter((item): item is MediaCatalogItem => Boolean(item)),
    [catalogue.items, activeLanguage]
  );

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
    inspectorCache.clear();
    await userVocab.reloadVocab();
    await catalogue.reloadCatalogue();
  };

  const sharedCataloguePageProps = {
    items: languageCatalogueItems,
    loading: catalogue.loading,
    filterState,
    statusMap: userVocab.statusMap,
    isAuthenticated: Boolean(auth.user),
    onRequireAuth: () => setAuthModalOpen(true),
    onToggleWord: handleTogglePreviewWord,
    onEnsurePreviewWords: catalogue.ensurePreviewWords,
  };

  if (location.pathname.startsWith("/preview")) {
    return (
      <Routes>
        <Route path="/preview/*" element={<RedesignPreviewRouter />} />
      </Routes>
    );
  }

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
        activeLanguage={activeLanguage}
        onChangeLanguage={handleChangeLanguage}
        user={auth.user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={auth.signOut}
      />
      <main className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-8 flex-1">
        <AppRoutes
          user={auth.user}
          activeLanguage={activeLanguage}
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
