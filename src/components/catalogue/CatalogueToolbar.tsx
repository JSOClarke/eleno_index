import React from "react";
import type { CatalogueViewMode } from "@/types/filter.types";

interface CatalogueToolbarProps {
  resultCount: number;
  viewMode: CatalogueViewMode;
  onChangeViewMode: (mode: CatalogueViewMode) => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
}

export const CatalogueToolbar: React.FC<CatalogueToolbarProps> = ({
  resultCount,
  viewMode,
  onChangeViewMode,
  activeFilterCount,
  onOpenFilters,
}) => {
  return (
    <div className="flex flex-col gap-2 border-b border-[#111111] pb-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-mono text-xs text-[#444444]">
        <strong className="text-[#111111]">{resultCount} results</strong>
        <span className="hidden sm:inline"> · sorted by best fit (reading flow)</span>
      </span>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex items-center gap-1.5 border border-[#111111] px-3 py-1.5 font-mono text-xs font-semibold text-[#111111] cursor-pointer md:hidden"
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="rounded-sm bg-[#111111] px-1 text-[10px] text-[#B8FF01]">
              {activeFilterCount}
            </span>
          )}
        </button>

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
    </div>
  );
};
