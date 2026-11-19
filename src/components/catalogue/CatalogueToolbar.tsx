import React from "react";
import { AlignJustify, LayoutGrid, Rows2, SlidersHorizontal } from "lucide-react";
import { CatalogueSortSelect } from "./CatalogueSortSelect";
import type { CatalogueSortOption, CatalogueViewMode } from "@/types/filter.types";

const VIEW_MODES: { mode: CatalogueViewMode; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { mode: "cards", label: "Cards view", Icon: Rows2 },
  { mode: "mosaic", label: "Mosaic view", Icon: LayoutGrid },
  { mode: "table", label: "Table view", Icon: AlignJustify },
];

interface CatalogueToolbarProps {
  viewMode: CatalogueViewMode;
  onChangeViewMode: (mode: CatalogueViewMode) => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
  sortOption: CatalogueSortOption;
  onChangeSort: (option: CatalogueSortOption) => void;
  searchSlot?: React.ReactNode;
  tagsSlot?: React.ReactNode;
}

export const CatalogueToolbar: React.FC<CatalogueToolbarProps> = ({
  viewMode,
  onChangeViewMode,
  activeFilterCount,
  onOpenFilters,
  sortOption,
  onChangeSort,
  searchSlot,
  tagsSlot,
}) => {
  return (
    <div className="space-y-2 border-b border-slate-200/80 pb-3">
      <div className="flex flex-wrap items-center gap-2">
        {searchSlot && <div className="min-w-[220px] flex-1">{searchSlot}</div>}
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
      <button
        type="button"
        onClick={onOpenFilters}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium shadow-xs cursor-pointer transition ${
          activeFilterCount > 0
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-white px-1.5 py-0.2 text-[10px] font-semibold text-slate-900">
            {activeFilterCount}
          </span>
        )}
      </button>

        <CatalogueSortSelect sortOption={sortOption} onChangeSort={onChangeSort} />

        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-0.5">
          {VIEW_MODES.map(({ mode, label, Icon }) => (
            <button
              key={mode}
              type="button"
              aria-label={mode}
              title={label}
              onClick={() => onChangeViewMode(mode)}
              className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 cursor-pointer transition-all ${
                viewMode === mode
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
        </div>
      </div>
      </div>
      {tagsSlot}
    </div>
  );
};
