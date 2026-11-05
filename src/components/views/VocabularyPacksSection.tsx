import React, { useState } from "react";
import { useVocabularyPacks } from "@/hooks/useVocabularyPacks";
import { VocabularyPackApplicationBanner } from "./VocabularyPackApplicationBanner";
import { VocabularyPackGroups } from "./VocabularyPackGroups";
import { VocabularyPackPreviewDialog } from "./VocabularyPackPreview";

interface VocabularyPacksSectionProps {
  userId?: string | null;
  onApplied: () => void | Promise<void>;
}

export const VocabularyPacksSection: React.FC<VocabularyPacksSectionProps> = ({
  userId,
  onApplied,
}) => {
  const [open, setOpen] = useState(false);
  const {
    packs,
    loading,
    selected,
    preview,
    previewLoading,
    applying,
    latest,
    appliedByPack,
    message,
    error,
    openPreview,
    closePreview,
    apply,
    undo,
  } = useVocabularyPacks(userId, onApplied);

  const toggle = () => {
    if (open) closePreview();
    setOpen((value) => !value);
  };

  return (
    <section className="space-y-3 border border-[#111111] bg-[#F8F8F6] p-3">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 border-b border-[#E2E2DF] pb-2 text-left cursor-pointer"
      >
        <div>
          <h3 className="font-sans text-sm font-bold uppercase tracking-[0.14em] text-[#111111]">
            Vocabulary Packs
          </h3>
          <p className="font-mono text-[9px] uppercase tracking-wider text-[#666666]">
            {packs.length > 0 ? `${packs.length} packs` : "Bulk calibration"}
            {!userId ? " · sign in to apply" : ""}
          </p>
        </div>
        <span className="shrink-0 border border-[#111111] bg-white px-2 py-1 font-mono text-[10px] font-bold text-[#111111]">
          {open ? "COLLAPSE ▲" : "EXPAND ▼"}
        </span>
      </button>

      {open && (
        <div className="space-y-3">
          <VocabularyPackApplicationBanner
            latest={latest}
            applying={applying}
            onUndo={() => void undo()}
          />

          {message && (
            <div className="border border-[#111111] bg-[#B8FF01] px-2.5 py-1.5 font-mono text-[11px] font-bold text-[#111111]">
              {message}
            </div>
          )}
          {error && (
            <div className="border border-red-600 bg-white px-2.5 py-1.5 font-mono text-[11px] text-red-600">
              {error}
            </div>
          )}

          <VocabularyPackGroups
            packs={packs}
            loading={loading}
            disabled={!userId}
            appliedPacks={appliedByPack}
            onPreview={(next) => void openPreview(next)}
          />
        </div>
      )}

      {open && selected && (
        <VocabularyPackPreviewDialog
          pack={selected}
          preview={preview}
          loading={previewLoading}
          applying={applying}
          onClose={closePreview}
          onApply={(preserveLearning, preserveIgnored) =>
            void apply(preserveLearning, preserveIgnored)
          }
        />
      )}
    </section>
  );
};
