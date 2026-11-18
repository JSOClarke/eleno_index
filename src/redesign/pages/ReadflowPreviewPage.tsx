import React, { useMemo, useState } from "react";
import type { SupportedLanguage } from "@/lib/catalogueLanguages";
import type { MediaCatalogItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";
import { ReadflowCatalogSection } from "../components/ReadflowCatalogSection";
import { ReadflowHero } from "../components/ReadflowHero";
import { ReadflowReadinessBands } from "../components/ReadflowReadinessBands";
import { ReadflowTextAnalyzer } from "../components/ReadflowTextAnalyzer";

interface ReadflowPreviewPageProps {
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
}

export const ReadflowPreviewPage: React.FC<ReadflowPreviewPageProps> = ({
  items,
  loading,
  activeLanguage,
  onChangeLanguage,
  knownCount,
  savedIds,
  onToggleSaved,
  userId,
  statusMap,
  onRequireAuth,
  onSetWordStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const totalTokens = useMemo(
    () => items.reduce((acc, it) => acc + (it.metrics?.total_tokens ?? 0), 0),
    [items]
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#040404] font-jakarta">
      <ReadflowHero
        activeLanguage={activeLanguage}
        onChangeLanguage={onChangeLanguage}
        knownCount={knownCount}
        totalCorpusItems={items.length}
        totalCorpusTokens={totalTokens}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <ReadflowCatalogSection
        items={items}
        loading={loading}
        searchQuery={searchQuery}
        savedIds={savedIds}
        onToggleSaved={onToggleSaved}
      />

      <ReadflowTextAnalyzer
        activeLanguage={activeLanguage}
        userId={userId}
        statusMap={statusMap}
        onRequireAuth={onRequireAuth}
        onSetWordStatus={onSetWordStatus}
      />

      <ReadflowReadinessBands items={items} />
    </div>
  );
};
