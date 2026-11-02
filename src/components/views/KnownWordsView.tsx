import React, { useMemo } from "react";
import type { MediaCatalogItem, PreviewWordItem } from "@/types/media.types";
import type { UserVocabStatus } from "@/types/vocabulary.types";

interface KnownWordsViewProps {
  items: MediaCatalogItem[];
  statusMap: Record<string, UserVocabStatus>;
  knownCount: number;
  onRemoveWord: (canonicalId: string) => void;
}

export const KnownWordsView: React.FC<KnownWordsViewProps> = ({
  items,
  statusMap,
  knownCount,
  onRemoveWord,
}) => {
  const knownEntries = useMemo(() => {
    const wordLookup = new Map<string, PreviewWordItem>();
    for (const item of items) {
      for (const w of item.previewWords) {
        if (!wordLookup.has(w.canonical_id)) {
          wordLookup.set(w.canonical_id, w);
        }
      }
    }

    return Object.entries(statusMap)
      .filter(([, status]) => status === "known")
      .map(([canonicalId]) => ({
        canonicalId,
        preview: wordLookup.get(canonicalId) || null,
      }));
  }, [items, statusMap]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#111111] pb-3">
        <div>
          <h2 className="text-lg font-bold text-[#111111]">
            Known Words Ledger ({knownCount})
          </h2>
          <p className="font-mono text-xs text-[#666666]">
            Canonical Spanish headwords marked as known in your profile. Click any
            pill to unmark.
          </p>
        </div>
      </div>

      {knownEntries.length === 0 ? (
        <div className="border border-dashed border-[#111111] py-16 text-center font-mono text-xs text-[#666666]">
          No words marked as known yet. Click any word pill on a Card or in the
          Inspector to build your profile.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pt-2">
          {knownEntries.map(({ canonicalId, preview }) => (
            <button
              key={canonicalId}
              type="button"
              onClick={() => onRemoveWord(canonicalId)}
              className="px-3 py-1.5 border border-[#111111] bg-[#111111] text-[#B8FF01] font-mono text-xs font-semibold flex items-center gap-2 hover:opacity-80 cursor-pointer"
            >
              <span>✓ {preview ? preview.lemma : canonicalId.slice(0, 10)}</span>
              <span className="text-white/60">×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
