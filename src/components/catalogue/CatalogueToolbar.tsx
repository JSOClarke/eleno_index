import React from "react";
import { SlidersHorizontal } from "lucide-react";
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
    <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500">
          <strong className="font-semibold text-slate-900">{resultCount}</strong>{" "}
          {resultCount === 1 ? "title" : "titles"}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
        <button
          type="button"
          onClick={onOpenFilters}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium shadow-xs cursor-pointer transition ${
            activeFilterCount > 0
              ? "border-indigo-300 bg-indigo-50 text-indigo-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-indigo-600 px-1.5 py-0.2 text-[10px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <CatalogueSortSelect sortOption={sortOption} onChangeSort={onChangeSort} />

        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-0.5">
          {(["cards", "mosaic", "table"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChangeViewMode(mode)}
              className={`rounded-lg px-3 py-1 text-xs font-medium capitalize cursor-pointer transition-all ${
                viewMode === mode
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
