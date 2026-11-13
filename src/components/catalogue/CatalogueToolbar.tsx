import React from "react";
import { Filter } from "lucide-react";
import { CatalogueSortSelect } from "./CatalogueSortSelect";
import type { CatalogueSortOption, CatalogueViewMode } from "@/types/filter.types";

interface CatalogueToolbarProps {
  resultCount: number;
  viewMode: CatalogueViewMode;
  onChangeViewMode: (mode: CatalogueViewMode) => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
  sortOption: CatalogueSortOption;
  onChangeSort: (option: CatalogueSortOption) => void;
}

export const CatalogueToolbar: React.FC<CatalogueToolbarProps> = ({
  resultCount,
  viewMode,
  onChangeViewMode,
  activeFilterCount,
  onOpenFilters,
  sortOption,
  onChangeSort,
}) => {
  return (
    <div className="flex flex-col gap-3 border-b border-[#111111] pb-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-[#444444]">
          <strong className="text-[#111111]">{resultCount} items</strong>
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
        {/* Mobile Filters Trigger */}
        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex items-center gap-1.5 border border-[#111111] bg-white px-2.5 py-1.5 font-mono text-xs font-semibold text-[#111111] shadow-[2px_2px_0px_#111111] cursor-pointer md:hidden hover:bg-[#F8F8F6]"
        >
          <Filter className="h-3.5 w-3.5 text-[#555555]" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="rounded-xs bg-[#111111] px-1 text-[10px] font-bold text-[#B8FF01]">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort Select */}
        <CatalogueSortSelect sortOption={sortOption} onChangeSort={onChangeSort} />

        {/* Table / Cards View Switcher */}
        <div className="inline-flex shadow-[2px_2px_0px_#111111]">
          <button
            type="button"
            onClick={() => onChangeViewMode("table")}
            className={`px-3 py-1.5 text-xs font-mono font-medium border border-[#111111] cursor-pointer transition-colors ${
              viewMode === "table"
                ? "bg-[#111111] text-white font-semibold"
                : "bg-white text-[#111111] hover:bg-[#F4F4F2]"
            }`}
          >
            Table
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode("cards")}
            className={`px-3 py-1.5 text-xs font-mono font-medium border border-l-0 border-[#111111] cursor-pointer transition-colors ${
              viewMode === "cards"
                ? "bg-[#111111] text-white font-semibold"
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
