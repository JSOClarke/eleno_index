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
    <div className="flex flex-wrap items-center justify-between gap-2 border border-[#111111] bg-white px-2.5 py-1.5 font-mono text-[11px]">
      <span>
        LAST APPLIED: <strong>{latest.pack_slug}</strong> ·{" "}
        {latest.changed_count.toLocaleString()} WORDS
      </span>
      <button
        type="button"
        disabled={applying}
        onClick={onUndo}
        className="border border-[#111111] bg-white px-2 py-1 font-bold text-[#111111] disabled:opacity-40 cursor-pointer"
      >
        UNDO
      </button>
    </div>
  );
};
