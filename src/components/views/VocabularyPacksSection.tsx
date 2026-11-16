import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useVocabularyPacks } from "@/hooks/useVocabularyPacks";
import { VocabularyPackApplicationBanner } from "./VocabularyPackApplicationBanner";
import { VocabularyPackGroups } from "./VocabularyPackGroups";
import { VocabularyPackPreviewDialog } from "./VocabularyPackPreview";

interface VocabularyPacksSectionProps {
  userId?: string | null;
  activeLanguage?: string;
  onApplied: () => void | Promise<void>;
}

export const VocabularyPacksSection: React.FC<VocabularyPacksSectionProps> = ({
  userId,
  activeLanguage = "es",
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
  } = useVocabularyPacks(userId, onApplied, activeLanguage);

  const toggle = () => {
    if (open) closePreview();
    setOpen((value) => !value);
  };

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-3 text-left cursor-pointer ${open ? "border-b border-slate-100 pb-3" : ""}`}
      >
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Vocabulary Packs
          </h3>
          <p className="text-xs text-slate-500">
            {packs.length > 0 ? `${packs.length} packs available` : "Bulk calibration"}
            {!userId ? " · sign in to apply" : ""}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">
          {open ? "Hide" : "Browse packs"}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
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
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
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
