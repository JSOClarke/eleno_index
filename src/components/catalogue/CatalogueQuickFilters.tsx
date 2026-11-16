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

const FLOW_OPTIONS: { id: FlowTier; label: string }[] = [
  { id: "all", label: "Any Comfort" },
  { id: "fluent", label: "95%+ Fluent" },
  { id: "sweet_spot", label: "85–95% Sweet Spot" },
  { id: "challenge", label: "<85% Challenge" },
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
        <button
          type="button"
          onClick={onToggleHasAudio}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer transition-all ${
            filters.hasAudio
              ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300 font-semibold shadow-xs"
              : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <Headphones className="h-3.5 w-3.5 shrink-0" />
          <span>Audio ({counts.audio})</span>
        </button>

        <div className="mx-1 h-4 w-px bg-slate-200 shrink-0" />

        <div className="flex items-center gap-1.5 shrink-0">
          {cefrLevels.map((lvl) => {
            const active = filters.levels.has(lvl);
            const count = counts.levels[lvl] || 0;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => onToggleLevel(lvl)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer transition-all ${
                  active
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>{lvl}</span>
                <span className="text-[10px] opacity-65">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="mx-1 h-4 w-px bg-slate-200 shrink-0" />

        <div className="flex items-center gap-1.5 shrink-0">
          {FLOW_OPTIONS.map((f) => {
            const active = filters.flowTier === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onSetFlowTier(f.id)}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer transition-all ${
                  active
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer transition"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </ScrollFadeX>
  );
};
