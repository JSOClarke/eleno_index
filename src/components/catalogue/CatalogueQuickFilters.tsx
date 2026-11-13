import React from "react";
import { Headphones, RotateCcw } from "lucide-react";
import { ScrollFadeX } from "@/components/ui/ScrollFadeX";
import type { CatalogueFilterState, FlowTier } from "@/types/filter.types";

interface CatalogueQuickFiltersProps {
  filters: CatalogueFilterState;
  counts: {
    levels: Record<string, number>;
    audio: number;
    flow: Record<FlowTier, number>;
  };
  onToggleLevel: (level: string) => void;
  onToggleHasAudio: () => void;
  onSetFlowTier: (tier: FlowTier) => void;
  onClearAll: () => void;
}

const FLOW_OPTIONS: { id: FlowTier; label: string; badge: string }[] = [
  { id: "all", label: "All Flow", badge: "" },
  { id: "fluent", label: "95%+ Fluent", badge: "Easy" },
  { id: "sweet_spot", label: "85–95% Sweet Spot", badge: "i+1" },
  { id: "challenge", label: "<85% Challenge", badge: "Intensive" },
];

export const CatalogueQuickFilters: React.FC<CatalogueQuickFiltersProps> = ({
  filters,
  counts,
  onToggleLevel,
  onToggleHasAudio,
  onSetFlowTier,
  onClearAll,
}) => {
  const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const hasActiveFilters =
    filters.levels.size > 0 ||
    filters.hasAudio ||
    filters.flowTier !== "all" ||
    filters.types.size > 0 ||
    filters.lengths.size > 0 ||
    filters.profiles.size > 0 ||
    filters.searchText.trim() !== "";

  return (
    <ScrollFadeX className="w-full pb-1">
      <div className="flex items-center gap-2 py-1">
        {/* Audio Narration Toggle */}
        <button
          type="button"
          onClick={onToggleHasAudio}
          className={`inline-flex shrink-0 items-center gap-1.5 border px-2.5 py-1 font-mono text-xs font-semibold cursor-pointer transition-all ${
            filters.hasAudio
              ? "border-[#111111] bg-[#B8FF01] text-[#111111] shadow-[2px_2px_0px_#111111]"
              : "border-[#111111]/40 bg-white text-[#555555] hover:border-[#111111] hover:text-[#111111]"
          }`}
        >
          <Headphones className="h-3.5 w-3.5 shrink-0" />
          <span>Narration</span>
          <span className="text-[10px] opacity-75">({counts.audio})</span>
        </button>

        <div className="h-4 w-px bg-[#CCCCCC] shrink-0 mx-0.5" />

        {/* CEFR Level Quick Pills */}
        <div className="flex items-center gap-1 shrink-0">
          {cefrLevels.map((lvl) => {
            const active = filters.levels.has(lvl);
            const count = counts.levels[lvl] || 0;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => onToggleLevel(lvl)}
                className={`inline-flex items-center gap-1 border px-2 py-1 font-mono text-xs font-bold cursor-pointer transition-all ${
                  active
                    ? "border-[#111111] bg-[#111111] text-[#B8FF01] shadow-[1px_1px_0px_#111111]"
                    : "border-[#111111]/30 bg-white text-[#444444] hover:border-[#111111] hover:text-[#111111]"
                }`}
              >
                <span>{lvl}</span>
                <span className="text-[10px] font-normal opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="h-4 w-px bg-[#CCCCCC] shrink-0 mx-0.5" />

        {/* Reading Flow Tier Pills */}
        <div className="flex items-center gap-1 shrink-0">
          {FLOW_OPTIONS.map((f) => {
            const active = filters.flowTier === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onSetFlowTier(f.id)}
                className={`inline-flex items-center gap-1 border px-2.5 py-1 font-mono text-xs cursor-pointer transition-all ${
                  active
                    ? "border-[#111111] bg-[#111111] text-white font-semibold"
                    : "border-[#111111]/30 bg-white text-[#555555] hover:border-[#111111] hover:text-[#111111]"
                }`}
              >
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Clear All Reset Pill */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex shrink-0 items-center gap-1 border border-dashed border-[#888888] bg-transparent px-2 py-1 font-mono text-xs text-[#666666] hover:border-[#111111] hover:text-[#111111] cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </ScrollFadeX>
  );
};
