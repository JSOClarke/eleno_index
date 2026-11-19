import React, { useMemo, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AuthModal } from "@/components/layout/AuthModal";
import { FeedbackHub } from "@/components/layout/FeedbackHub";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { ReadflowTopNav } from "@/redesign/components/ReadflowTopNav";
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

  const isPreview = location.pathname.startsWith("/preview");

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

  const previewProps = {
    items: languageCatalogueItems,
    loading: catalogue.loading,
    activeLanguage,
    onChangeLanguage: handleChangeLanguage,
    knownCount: userVocab.knownCount,
    savedIds: filterState.savedIds,
    onToggleSaved: filterState.toggleSave,
    userId: auth.user?.id,
    statusMap: userVocab.statusMap,
    onRequireAuth: () => setAuthModalOpen(true),
    onSetWordStatus: userVocab.setWordStatus,
    onBubbleBookWordToggle: catalogue.applyOptimisticWordToggle,
  };

  const navProps = {
    savedCount: filterState.savedIds.size, knownCount: userVocab.knownCount,
    learningCount: userVocab.learningCount, activeLanguage,
    onChangeLanguage: handleChangeLanguage, user: auth.user,
    onOpenAuth: () => setAuthModalOpen(true), onSignOut: auth.signOut,
  };

  return (
    <div className="relative isolate min-h-[100dvh] flex flex-col bg-white text-slate-900">
      {isPreview ? <ReadflowTopNav {...navProps} /> : <TopNavBar {...navProps} />}
      {isPreview ? (
        <Routes>
          <Route path="/preview/*" element={<RedesignPreviewRouter {...previewProps} />} />
        </Routes>
      ) : (
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 flex-1">
          <AppRoutes
            user={auth.user} activeLanguage={activeLanguage} items={catalogue.items}
            catalogueLoading={catalogue.loading} statusMap={userVocab.statusMap}
            knownCount={userVocab.knownCount} sharedCataloguePageProps={sharedCataloguePageProps}
            onRequireAuth={() => setAuthModalOpen(true)} onSetWordStatus={userVocab.setWordStatus}
            onBubbleBookWordToggle={catalogue.applyOptimisticWordToggle}
            onRecordHistory={filterState.recordHistory} onReloadAfterPacks={handleReloadAfterPacks}
          />
        </main>
      )}
      {!isPreview && <FeedbackHub activeLanguage={activeLanguage} userId={auth.user?.id} />}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onSignIn={auth.signIn} onSignUp={auth.signUp} />
    </div>
  );
};
