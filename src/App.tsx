import React, { useState } from "react";
import { CatalogueCardsGrid } from "@/components/catalogue/CatalogueCardsGrid";
import { CatalogueTable } from "@/components/catalogue/CatalogueTable";
import { CatalogueToolbar } from "@/components/catalogue/CatalogueToolbar";
import { CommandFilterBar } from "@/components/catalogue/CommandFilterBar";
import { FacetSidebar } from "@/components/catalogue/FacetSidebar";
import { InspectorView } from "@/components/inspector/InspectorView";
import { AuthModal } from "@/components/layout/AuthModal";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { KnownWordsView } from "@/components/views/KnownWordsView";
import { useAuth } from "@/hooks/useAuth";
import { useCatalogueData } from "@/hooks/useCatalogueData";
import { useFacetCounts } from "@/hooks/useFacetCounts";
import { useFilterState } from "@/hooks/useFilterState";
import { useUserVocabulary } from "@/hooks/useUserVocabulary";
import type { CatalogueViewMode, NavSection } from "@/types/filter.types";
import type { MediaCatalogItem, PreviewWordItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

export const App: React.FC = () => {
  const auth = useAuth();
  const userVocab = useUserVocabulary(auth.user);
  const catalogue = useCatalogueData(auth.user?.id);
  const filterState = useFilterState();

  const [activeNav, setActiveNav] = useState<NavSection>("catalogue");
  const [viewMode, setViewMode] = useState<CatalogueViewMode>("cards");
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [inspectedItem, setInspectedItem] = useState<MediaCatalogItem | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { facetCounts, filteredItems } = useFacetCounts(
    catalogue.items,
    filterState.filters,
    filterState.savedIds,
    filterState.historyIds,
    activeNav
  );

  const handleOpenInspector = (item: MediaCatalogItem) => {
    filterState.recordHistory(item.id);
    setInspectedItem(item);
    setActiveNav("inspector");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const toggleExpand = (id: string) => setExpandedRowId((prev) => (prev === id ? null : id));
  const sharedCatalogueProps = {
    items: filteredItems,
    loading: catalogue.loading,
    expandedRowId,
    savedIds: filterState.savedIds,
    statusMap: userVocab.statusMap,
    onOpenInspector: handleOpenInspector,
    onToggleSave: filterState.toggleSave,
    onToggleWord: handleTogglePreviewWord,
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      <TopNavBar
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        savedCount={filterState.savedIds.size}
        knownCount={userVocab.knownCount}
        user={auth.user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={auth.signOut}
      />

      <main className="max-w-[1380px] w-full mx-auto px-6 py-6 flex-1">
        {activeNav === "inspector" && inspectedItem ? (
          <InspectorView
            item={catalogue.items.find((x) => x.id === inspectedItem.id) || inspectedItem}
            userId={auth.user?.id}
            statusMap={userVocab.statusMap}
            onBack={() => setActiveNav("catalogue")}
            onRequireAuth={() => setAuthModalOpen(true)}
            onSetWordStatus={userVocab.setWordStatus}
            onBubbleBookWordToggle={catalogue.applyOptimisticWordToggle}
          />
        ) : activeNav === "known" ? (
          <KnownWordsView
            items={catalogue.items}
            statusMap={userVocab.statusMap}
            knownCount={userVocab.knownCount}
            onRemoveWord={(canonicalId) => userVocab.setWordStatus(canonicalId, null)}
          />
        ) : (
          <div className="space-y-6">
            <CommandFilterBar
              tags={filterState.filters.tags}
              searchText={filterState.searchText}
              onSearchChange={filterState.setSearchText}
              onRemoveTag={filterState.removeTag}
              onAddTag={filterState.addTag}
              onClearAll={filterState.clearAll}
            />

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <FacetSidebar
                filters={filterState.filters}
                counts={facetCounts}
                onToggleLevel={filterState.toggleLevel}
                onToggleType={filterState.toggleType}
                onToggleLength={filterState.toggleLength}
                onToggleProfile={filterState.toggleProfile}
              />

              <div className="flex-1 min-w-0 w-full">
                <CatalogueToolbar
                  resultCount={filteredItems.length}
                  viewMode={viewMode}
                  onChangeViewMode={setViewMode}
                />
                {viewMode === "cards" ? (
                  <CatalogueCardsGrid {...sharedCatalogueProps} onSelectCard={toggleExpand} />
                ) : (
                  <CatalogueTable {...sharedCatalogueProps} onToggleExpand={toggleExpand} />
                )}
              </div>
            </div>
          </div>
        )}
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
