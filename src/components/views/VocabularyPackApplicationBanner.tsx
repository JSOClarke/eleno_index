import React from "react";
import type { VocabularyPackApplication } from "@/types/vocabularyPack.types";

interface VocabularyPackApplicationBannerProps {
  latest: VocabularyPackApplication | null;
  applying: boolean;
  onUndo: () => void;
}

export const VocabularyPackApplicationBanner: React.FC<
  VocabularyPackApplicationBannerProps
> = ({ latest, applying, onUndo }) => {
  if (!latest) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
      <span>
        Last applied: <strong className="font-semibold text-slate-900">{latest.pack_slug}</strong> ·{" "}
        {latest.changed_count.toLocaleString()} words
      </span>
      <button
        type="button"
        disabled={applying}
        onClick={onUndo}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer transition"
      >
        Undo
      </button>
    </div>
  );
};
