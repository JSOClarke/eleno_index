import React from "react";
import { CatalogueCard } from "@/components/catalogue/CatalogueCard";
import { DictionarySentenceList } from "@/components/dictionary/DictionarySentenceList";
import { DictionaryWordCard } from "@/components/dictionary/DictionaryWordCard";
import { MOCK_BOOK, MOCK_SENTENCES, MOCK_WORD } from "./landingMocks";

export { StepThreePreview } from "./StepThreePreview";

interface PreviewProps {
  onRequireAuth: () => void;
}

export const StepOnePreview: React.FC<PreviewProps> = ({ onRequireAuth }) => (
  <div className="space-y-3">
    <DictionaryWordCard
      word={MOCK_WORD} status={undefined} isAuthenticated
      onRequireAuth={onRequireAuth} onSetStatus={onRequireAuth}
    />
    <DictionarySentenceList
      canonicalId={MOCK_WORD.id} sentences={MOCK_SENTENCES} loading={false}
      loadingMore={false} hasMore={false} iPlusOne={false} isAuthenticated
      statusMap={{}} onToggleIPlusOne={onRequireAuth} onLoadMore={onRequireAuth}
      onSelectToken={onRequireAuth}
    />
  </div>
);

export const StepTwoPreview: React.FC<PreviewProps> = ({ onRequireAuth }) => (
  <CatalogueCard
    item={MOCK_BOOK} isSelected={false} isSaved={false}
    statusMap={{ w3: "known", w2: "learning" }} isAuthenticated
    onRequireAuth={onRequireAuth} onSelectCard={onRequireAuth}
    onToggleSave={onRequireAuth} onToggleWord={onRequireAuth}
  />
);
