import React from "react";
import { ArrowUpDown } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/catalogueSorting";
import type { CatalogueSortOption } from "@/types/filter.types";

interface CatalogueSortSelectProps {
  sortOption: CatalogueSortOption;
  onChangeSort: (option: CatalogueSortOption) => void;
}

export const CatalogueSortSelect: React.FC<CatalogueSortSelectProps> = ({
  sortOption,
  onChangeSort,
}) => {
  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-1.5 border border-[#111111] bg-white px-2.5 py-1.5 font-mono text-xs text-[#111111] shadow-[2px_2px_0px_#111111] transition-all hover:bg-[#F8F8F6]">
        <ArrowUpDown className="h-3.5 w-3.5 text-[#555555] shrink-0" />
        <span className="hidden lg:inline text-[#666666]">Sort:</span>
        <select
          value={sortOption}
          onChange={(e) => onChangeSort(e.target.value as CatalogueSortOption)}
          aria-label="Sort catalogue items"
          className="cursor-pointer bg-transparent font-mono text-xs font-semibold text-[#111111] outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
