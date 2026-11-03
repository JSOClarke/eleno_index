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
  <div className="flex h-2 w-full overflow-hidden border border-[#111111] bg-white">
    <div
      className="h-full bg-[#111111] transition-all duration-200"
      style={{ width: `${Math.min(100, flowPct)}%` }}
    />
    {learnFlowPct > 0 && (
      <div
        className="h-full border-l border-[#111111]/40 bg-[#B8FF01] transition-all duration-200"
        style={{ width: `${Math.min(100 - flowPct, Math.max(learnFlowPct, 3))}%` }}
      />
    )}
  </div>
);
