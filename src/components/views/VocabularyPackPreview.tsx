import React, { useState } from "react";
import { X } from "lucide-react";
import type { VocabularyPack, VocabularyPackPreview } from "@/types/vocabularyPack.types";
interface VocabularyPackPreviewProps {
  pack: VocabularyPack;
  preview: VocabularyPackPreview | null;
  loading: boolean;
  applying: boolean;
  onClose: () => void;
  onApply: (preserveLearning: boolean, preserveIgnored: boolean) => void;
}
const countBox = (label: string, value: number, tone = "text-slate-900") => (
  <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2">
    <div className="text-[11px] font-medium text-slate-500">{label}</div>
    <div className={`text-base font-bold tabular-nums ${tone}`}>{value.toLocaleString()}</div>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Preview ${pack.title}`}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
              {pack.group_label === "FREQUENCY" ? "Frequency" : pack.group_label === "CEFR" ? "CEFR" : pack.group_label} pack
            </span>
            <h3 className="mt-1.5 font-serif text-2xl font-medium tracking-tight text-slate-900">
              {pack.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500">{pack.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close pack preview"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 animate-pulse">
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="h-14 rounded-xl border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : !preview ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            Could not preview this pack.
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
              {countBox("Total", preview.total_count)}
              {countBox("Known", preview.known_count)}
              {countBox("Learning", preview.learning_count, "text-amber-700")}
              {countBox("Ignored", preview.ignored_count, "text-slate-500")}
              {countBox("New", preview.new_count, "text-emerald-700")}
            </div>

            <div className="mt-4">
              <div className="mb-2 text-xs font-medium text-slate-500">Sample words</div>
              <div className="flex flex-wrap gap-1.5">
                {preview.sample.map((word) => (
                  <span
                    key={word.canonical_id}
                    className="rounded-lg border border-slate-200 bg-slate-50/70 px-2 py-1 text-xs text-slate-800"
                    title={`${word.pos}${word.cefr ? ` · ${word.cefr}` : ""}${word.status ? ` · ${word.status}` : " · new"}`}
                  >
                    {word.lemma}
                    <span className="ml-1 text-[10px] text-slate-400">{word.pos}</span>
                  </span>
                ))}
                {preview.sample.length === 0 && <span className="text-xs text-slate-500">No sample words.</span>}
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-3.5 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={preserveLearning} onChange={(e) => setPreserveLearning(e.target.checked)} className="rounded accent-slate-900" />
                Preserve words currently marked Learning
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={preserveIgnored} onChange={(e) => setPreserveIgnored(e.target.checked)} className="rounded accent-slate-900" />
                Preserve words currently Ignored
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <p className="max-w-sm text-xs text-slate-500">
                Adds up to {preview.new_count.toLocaleString()} new known words. Existing statuses stay intact.
              </p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                  Cancel
                </button>
                <button type="button" disabled={!canApply} onClick={() => onApply(preserveLearning, preserveIgnored)} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-600 disabled:opacity-40 cursor-pointer transition">
                  {applying ? "Applying..." : "Mark known"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
