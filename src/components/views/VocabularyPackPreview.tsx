import React, { useState } from "react";
import type { VocabularyPack, VocabularyPackPreview } from "@/types/vocabularyPack.types";
interface VocabularyPackPreviewProps {
  pack: VocabularyPack;
  preview: VocabularyPackPreview | null;
  loading: boolean;
  applying: boolean;
  onClose: () => void;
  onApply: (preserveLearning: boolean, preserveIgnored: boolean) => void;
}
const countBox = (label: string, value: number, tone = "text-[#111111]") => (
  <div className="border border-[#E2E2DF] bg-[#F8F8F6] px-2 py-1.5">
    <div className="font-mono text-[9px] uppercase tracking-wider text-[#666666]">{label}</div>
    <div className={`font-mono text-sm font-bold tabular-nums ${tone}`}>{value}</div>
  </div>
);
export const VocabularyPackPreviewDialog: React.FC<VocabularyPackPreviewProps> = ({
  pack,
  preview,
  loading,
  applying,
  onClose,
  onApply,
}) => {
  const [preserveLearning, setPreserveLearning] = useState(true);
  const [preserveIgnored, setPreserveIgnored] = useState(true);
  const canApply =
    !!preview && !loading && !applying &&
    (preview.new_count > 0 ||
      (!preserveLearning && preview.learning_count > 0) ||
      (!preserveIgnored && preview.ignored_count > 0));
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Preview ${pack.title}`}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[85dvh] w-full max-w-2xl overflow-y-auto border border-[#111111] bg-white p-5 shadow-[6px_6px_0px_#111111]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#111111] pb-3">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
              {pack.group_label} PACK
            </div>
            <h3 className="font-sans text-2xl font-bold tracking-tight text-[#111111]">
              {pack.title}
            </h3>
            <p className="mt-1 text-xs text-[#555555]">{pack.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 font-mono text-sm font-bold text-[#666666] hover:text-[#111111] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="mt-4 grid grid-cols-5 gap-2 animate-pulse">
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="h-14 border border-[#E2E2DF] bg-[#F4F4F2]" />
            ))}
          </div>
        ) : !preview ? (
          <div className="mt-4 border border-[#E2E2DF] bg-[#F8F8F6] p-3 font-mono text-xs text-[#666666]">
            Could not preview this pack.
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {countBox("TOTAL", preview.total_count)}
              {countBox("KNOWN", preview.known_count)}
              {countBox("LEARNING", preview.learning_count, "text-[#8a5a00]")}
              {countBox("IGNORED", preview.ignored_count)}
              {countBox("NEW", preview.new_count, "text-[#3c6b00]")}
            </div>

            <div className="mt-4">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[#666666]">
                SAMPLE
              </div>
              <div className="flex flex-wrap gap-1.5">
                {preview.sample.map((word) => (
                  <span
                    key={word.canonical_id}
                    className="border border-[#111111] bg-white px-1.5 py-0.5 font-mono text-[11px] text-[#111111]"
                    title={`${word.pos}${word.cefr ? ` · ${word.cefr}` : ""}${word.status ? ` · ${word.status}` : " · new"}`}
                  >
                    {word.lemma}
                    <span className="ml-1 text-[9px] text-[#888888]">{word.pos}</span>
                  </span>
                ))}
                {preview.sample.length === 0 && (
                  <span className="font-mono text-xs text-[#666666]">No sample words.</span>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-1.5 border-t border-[#E2E2DF] pt-3 font-mono text-[11px]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preserveLearning}
                  onChange={(event) => setPreserveLearning(event.target.checked)}
                />
                Preserve words currently marked Learning
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preserveIgnored}
                  onChange={(event) => setPreserveIgnored(event.target.checked)}
                />
                Preserve words currently Ignored
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#111111] pt-3">
              <p className="max-w-sm font-mono text-[11px] text-[#666666]">
                This adds up to {preview.new_count.toLocaleString()} new Known words. Existing statuses are preserved.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="border border-[#CCCCCC] bg-white px-3 py-1.5 font-mono text-xs font-bold text-[#555555] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  disabled={!canApply}
                  onClick={() => onApply(preserveLearning, preserveIgnored)}
                  className="border border-[#111111] bg-[#111111] px-3 py-1.5 font-mono text-xs font-bold text-[#B8FF01] disabled:opacity-40 cursor-pointer"
                >
                  {applying ? "APPLYING..." : "MARK KNOWN"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
