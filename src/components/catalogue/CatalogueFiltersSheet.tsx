import React from "react";
import { Sheet } from "@/components/ui/Sheet";
import { FacetSidebar } from "./FacetSidebar";
import type {
  CatalogueFilterState,
  FlowTier,
  LengthBucket,
  ProfileFilterId,
} from "@/types/filter.types";

interface FacetCounts {
  levels: Record<string, number>;
  types: Record<string, number>;
  lengths: Record<string, number>;
  profiles: Record<string, number>;
  genres: Record<string, number>;
  publishers: Record<string, number>;
  years: Record<string, number>;
  audio: number;
  flow: Record<FlowTier, number>;
}

interface CatalogueFiltersSheetProps {
  open: boolean;
  onClose: () => void;
  filters: CatalogueFilterState;
  counts: FacetCounts;
  onToggleLevel: (level: string) => void;
  onToggleType: (type: string) => void;
  onToggleLength: (bucket: LengthBucket) => void;
  onToggleProfile: (profile: ProfileFilterId) => void;
  onToggleGenre: (genre: string) => void;
  onTogglePublisher: (publisher: string) => void;
  onToggleYear: (year: string) => void;
  onToggleHasAudio: () => void;
  onSetFlowTier: (tier: FlowTier) => void;
  resultCount: number;
  onClearAll: () => void;
}

export const CatalogueFiltersSheet: React.FC<CatalogueFiltersSheetProps> = ({
  open,
  onClose,
  filters,
  counts,
  onToggleLevel,
  onToggleType,
  onToggleLength,
  onToggleProfile,
  onToggleGenre,
  onTogglePublisher,
  onToggleYear,
  onToggleHasAudio,
  onSetFlowTier,
  resultCount,
  onClearAll,
}) => (
  <Sheet
    open={open}
    onClose={onClose}
    title="Filters"
    side="left"
    footer={
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClearAll}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-50"
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-[2] rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white cursor-pointer hover:bg-slate-800 shadow-xs"
        >
          Show {resultCount} results
        </button>
      </div>
    }
  >
    <FacetSidebar
      variant="sheet"
      filters={filters}
      counts={counts}
      onToggleLevel={onToggleLevel}
      onToggleType={onToggleType}
      onToggleLength={onToggleLength}
      onToggleProfile={onToggleProfile}
      onToggleGenre={onToggleGenre}
      onTogglePublisher={onTogglePublisher}
      onToggleYear={onToggleYear}
      onToggleHasAudio={onToggleHasAudio}
      onSetFlowTier={onSetFlowTier}
    />
  </Sheet>
);
