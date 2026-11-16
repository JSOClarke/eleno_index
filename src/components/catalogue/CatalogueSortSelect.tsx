import React from "react";
import { ArrowUpDown } from "lucide-react";
import { FilterSelectDropdown } from "@/components/ui/FilterSelectDropdown";
import { SORT_OPTIONS } from "@/lib/catalogueSorting";
import type { CatalogueSortOption } from "@/types/filter.types";

interface CatalogueSortSelectProps {
  sortOption: CatalogueSortOption;
  onChangeSort: (option: CatalogueSortOption) => void;
}

const DROPDOWN_OPTIONS = SORT_OPTIONS.map((opt) => ({
  value: opt.id,
  label: opt.label,
}));

export const CatalogueSortSelect: React.FC<CatalogueSortSelectProps> = ({
  sortOption,
  onChangeSort,
}) => (
  <FilterSelectDropdown
    prefix="Sort"
    icon={<ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
    value={sortOption}
    options={DROPDOWN_OPTIONS}
    onChange={onChangeSort}
    ariaLabel="Sort catalogue items"
    menuWidthClass="w-60"
  />
);
