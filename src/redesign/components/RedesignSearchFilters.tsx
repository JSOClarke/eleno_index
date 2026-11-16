import React from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/catalogueSorting";
import type { CatalogueFilterState, CatalogueSortOption, FlowTier } from "@/types/filter.types";
import { RedesignFilterPills } from "./RedesignFilterPills";

interface RedesignSearchFiltersProps {
  searchText: string;
  onSearchChange: (val: string) => void;
  filters: CatalogueFilterState;
  counts: { audio: number };
  sortOption: CatalogueSortOption;
  onChangeSort: (opt: CatalogueSortOption) => void;
  resultCount: number;
  onToggleType: (t: string) => void;
  onToggleLevel: (lvl: string) => void;
  onToggleHasAudio: () => void;
  onSetFlowTier: (tier: FlowTier) => void;
  onClearAll: () => void;
}

export const RedesignSearchFilters: React.FC<RedesignSearchFiltersProps> = ({
  searchText,
  onSearchChange,
  filters,
  counts,
  sortOption,
  onChangeSort,
  resultCount,
  onToggleType,
  onToggleLevel,
  onToggleHasAudio,
  onSetFlowTier,
  onClearAll,
}) => {
  const hasFilters =
    filters.levels.size > 0 ||
    filters.types.size > 0 ||
    filters.hasAudio ||
    filters.flowTier !== "all" ||
    searchText.trim() !== "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-slate-900">
            Find Your Next Match
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Compare vocabulary comfort, linguistic stats, and synopses before you read or watch.
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search titles, authors, or synopses..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-xs outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <RedesignFilterPills
          filters={filters}
          audioCount={counts.audio}
          hasActiveFilters={hasFilters}
          onToggleType={onToggleType}
          onToggleLevel={onToggleLevel}
          onToggleHasAudio={onToggleHasAudio}
          onSetFlowTier={onSetFlowTier}
          onClearAll={onClearAll}
        />

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-slate-500">
            {resultCount} {resultCount === 1 ? "title" : "titles"}
          </span>
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-xs">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortOption}
              onChange={(e) => onChangeSort(e.target.value as CatalogueSortOption)}
              className="cursor-pointer bg-transparent font-medium text-slate-700 outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
