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
  onToggleHasAudio,
  onSetFlowTier,
  resultCount,
  onClearAll,
}) => (
  <Sheet open={open} onClose={onClose} title="Filters">
    <div className="space-y-6">
      <FacetSidebar
        variant="sheet"
        filters={filters}
        counts={counts}
        onToggleLevel={onToggleLevel}
        onToggleType={onToggleType}
        onToggleLength={onToggleLength}
        onToggleProfile={onToggleProfile}
        onToggleHasAudio={onToggleHasAudio}
        onSetFlowTier={onSetFlowTier}
      />

      <div className="sticky bottom-0 -mx-4 flex gap-2 border-t border-[#E2E2DF] bg-white px-4 pt-3">
        <button
          type="button"
          onClick={onClearAll}
          className="flex-1 border border-[#111111] bg-white px-3 py-2 font-mono text-xs font-bold text-[#111111] cursor-pointer hover:bg-[#F8F8F6]"
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-[2] border border-[#111111] bg-[#111111] px-3 py-2 font-mono text-xs font-bold text-[#B8FF01] cursor-pointer shadow-[2px_2px_0px_#111111]"
        >
          Show {resultCount} results
        </button>
      </div>
    </div>
  </Sheet>
);
