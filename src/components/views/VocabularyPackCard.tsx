import React from "react";
import type { VocabularyPack } from "@/types/vocabularyPack.types";

interface VocabularyPackCardProps {
  pack: VocabularyPack;
  disabled?: boolean;
  applied?: boolean;
  onPreview: (pack: VocabularyPack) => void;
}

function packMeta(pack: VocabularyPack): string {
  if (pack.rule_type === "tubelex_top") {
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
  <div className="flex h-full flex-col justify-between border border-[#111111] bg-white p-3">
    <div>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-sans text-base font-bold leading-tight tracking-tight text-[#111111]">
          {pack.title}
        </h3>
        <span className="shrink-0 border border-[#111111] bg-[#F8F8F6] px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-[#111111]">
          {pack.group_label}
        </span>
      </div>
      <p className="mt-1 text-xs leading-snug text-[#555555]">{pack.description}</p>
      {applied && (
        <span className="mt-2 inline-flex items-center gap-1 border border-[#111111] bg-[#B8FF01] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[#111111]">
          ✓ Applied
        </span>
      )}
    </div>

    <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#E2E2DF] pt-2">
      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#666666]">
        {packMeta(pack)}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onPreview(pack)}
        className="border border-[#111111] bg-[#B8FF01] px-2.5 py-1 font-mono text-[11px] font-bold text-[#111111] disabled:opacity-40 cursor-pointer"
      >
        REVIEW →
      </button>
    </div>
  </div>
);
