import React from "react";
import type { VocabularyPack } from "@/types/vocabularyPack.types";

interface VocabularyPackCardProps {
  pack: VocabularyPack;
  disabled?: boolean;
  applied?: boolean;
  onPreview: (pack: VocabularyPack) => void;
}

function packMeta(pack: VocabularyPack): string {
  if (pack.rule_type.includes("top") || pack.rule_params.limit) {
    return `${Number(pack.rule_params.limit || 0).toLocaleString()} words`;
  }
  if (pack.rule_type === "cefr_levels") {
    return (pack.rule_params.levels || []).join(" · ");
  }
  const count = Number(pack.rule_params.count || 0);
  return count > 0 ? `${count.toLocaleString()} words` : "Curated selection";
}

export const VocabularyPackCard: React.FC<VocabularyPackCardProps> = ({
  pack,
  disabled,
  applied,
  onPreview,
}) => (
  <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/50 p-3.5 transition hover:border-slate-300 hover:bg-white">
    <div>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-tight text-slate-900">
          {pack.title}
        </h3>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
          {pack.group_label === "FREQUENCY" ? "Frequency" : pack.group_label === "CEFR" ? "CEFR" : pack.group_label}
        </span>
      </div>
      <p className="mt-1 text-xs leading-snug text-slate-500">{pack.description}</p>
      {applied && (
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200/80">
          ✓ Applied
        </span>
      )}
    </div>

    <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-200/70 pt-2.5">
      <span className="text-[11px] font-medium text-slate-400">
        {packMeta(pack)}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onPreview(pack)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-40 cursor-pointer transition"
      >
        Review
      </button>
    </div>
  </div>
);
