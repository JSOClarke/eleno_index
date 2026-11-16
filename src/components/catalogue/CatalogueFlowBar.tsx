import React from "react";

interface CatalogueFlowBarProps {
  flowPct: number;
  learnFlowPct?: number;
}

/** Two-segment known/learning progress bar shared by the catalogue views. */
export const CatalogueFlowBar: React.FC<CatalogueFlowBarProps> = ({
  flowPct,
  learnFlowPct = 0,
}) => (
  <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
    <div
      className={`h-full bg-emerald-500 transition-all duration-300 ${learnFlowPct > 0 ? "" : "rounded-r-full"}`}
      style={{ width: `${Math.min(100, flowPct)}%` }}
    />
    {learnFlowPct > 0 && (
      <div
        className="h-full rounded-r-full bg-amber-300 transition-all duration-300"
        style={{ width: `${Math.min(100 - flowPct, Math.max(learnFlowPct, 3))}%` }}
      />
    )}
  </div>
);
