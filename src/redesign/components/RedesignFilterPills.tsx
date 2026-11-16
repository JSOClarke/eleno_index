import React from "react";
import { Headphones, RotateCcw } from "lucide-react";
import type { CatalogueFilterState, FlowTier } from "@/types/filter.types";

interface RedesignFilterPillsProps {
  filters: CatalogueFilterState;
  audioCount: number;
  hasActiveFilters: boolean;
  onToggleType: (t: string) => void;
  onToggleLevel: (lvl: string) => void;
  onToggleHasAudio: () => void;
  onSetFlowTier: (tier: FlowTier) => void;
  onClearAll: () => void;
}

export const RedesignFilterPills: React.FC<RedesignFilterPillsProps> = ({
  filters,
  audioCount,
  hasActiveFilters,
  onToggleType,
  onToggleLevel,
  onToggleHasAudio,
  onSetFlowTier,
  onClearAll,
}) => {
  const levels = ["A2", "B1", "B2", "C1"];
  const flowTiers: { id: FlowTier; label: string }[] = [
    { id: "fluent", label: "95%+ Fluent" },
    { id: "sweet_spot", label: "85–95% Sweet Spot" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(["Book / Reader", "Film / Subtitles"] as const).map((cat) => {
        const active = filters.types.has(cat);
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onToggleType(cat)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer transition ${
              active
                ? "bg-slate-900 text-white font-semibold"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat === "Book / Reader" ? "📚 Books" : "🎬 Films & Shows"}
          </button>
        );
      })}

      <button
        type="button"
        onClick={onToggleHasAudio}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer transition ${
          filters.hasAudio
            ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300 font-semibold"
            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        <Headphones className="h-3.5 w-3.5" />
        <span>Audio ({audioCount})</span>
      </button>

      <div className="mx-1 h-4 w-px bg-slate-200" />

      {levels.map((lvl) => {
        const active = filters.levels.has(lvl);
        return (
          <button
            key={lvl}
            type="button"
            onClick={() => onToggleLevel(lvl)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer transition ${
              active
                ? "bg-slate-900 text-white font-semibold"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {lvl}
          </button>
        );
      })}

      <div className="mx-1 h-4 w-px bg-slate-200" />

      {flowTiers.map((f) => {
        const active = filters.flowTier === f.id;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onSetFlowTier(active ? "all" : f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer transition ${
              active
                ? "bg-emerald-600 text-white font-semibold"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        );
      })}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      )}
    </div>
  );
};
