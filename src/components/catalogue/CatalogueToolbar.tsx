import React from "react";
import type { CatalogueViewMode } from "@/types/filter.types";

interface CatalogueToolbarProps {
  resultCount: number;
  viewMode: CatalogueViewMode;
  onChangeViewMode: (mode: CatalogueViewMode) => void;
}

export const CatalogueToolbar: React.FC<CatalogueToolbarProps> = ({
  resultCount,
  viewMode,
  onChangeViewMode,
}) => {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-[#111111]">
      <span className="font-mono text-xs text-[#444444]">
        <strong className="text-[#111111]">{resultCount} results</strong> · sorted
        by best fit (reading flow)
      </span>

      <div className="inline-flex">
        <button
          type="button"
          onClick={() => onChangeViewMode("table")}
          className={`px-3.5 py-1.5 text-xs font-medium border border-[#111111] cursor-pointer ${
            viewMode === "table"
              ? "bg-[#111111] text-white"
              : "bg-white text-[#111111] hover:bg-[#F4F4F2]"
          }`}
        >
          Table
        </button>
        <button
          type="button"
          onClick={() => onChangeViewMode("cards")}
          className={`px-3.5 py-1.5 text-xs font-medium border border-l-0 border-[#111111] cursor-pointer ${
            viewMode === "cards"
              ? "bg-[#111111] text-white"
              : "bg-white text-[#111111] hover:bg-[#F4F4F2]"
          }`}
        >
          Cards
        </button>
      </div>
    </div>
  );
};
