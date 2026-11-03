import React from "react";
import { formatLearningDelta } from "@/lib/formatters";
import type { MediaCatalogItem } from "@/types/media.types";
import { CoverageGate } from "@/components/ui/CoverageGate";

interface CardCoveragePanelProps {
  item: MediaCatalogItem;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

/** Known-flow panel on a catalogue card; gated for signed-out users. */
export const CardCoveragePanel: React.FC<CardCoveragePanelProps> = ({
  item,
  isAuthenticated,
  onRequireAuth,
}) => {
  const flowPct =
    item.comprehension?.text_coverage_percentage ??
    item.comprehension?.comprehension_percentage ??
    0;
  const learnFlowPct = item.comprehension?.learning_text_coverage_percentage ?? 0;
  const vocabPct = Math.round(item.comprehension?.comprehension_percentage ?? 0);

  return (
    <div className="space-y-1.5 border border-[#E2E2DF] bg-[#F4F4F2] p-2.5">
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-[#555555]">KNOWN FLOW</span>
        {isAuthenticated ? (
          <span className="font-bold tabular-nums text-[#111111]">
            {Math.round(flowPct)}%
            {learnFlowPct > 0 ? ` ${formatLearningDelta(learnFlowPct)}` : ""} ({vocabPct}% voc)
          </span>
        ) : (
          <span className="text-[#888888]">—</span>
        )}
      </div>

      {isAuthenticated ? (
        <div className="flex h-2 w-full overflow-hidden border border-[#111111] bg-white">
          <div
            className="h-full bg-[#111111] transition-all duration-200"
            style={{ width: `${Math.min(100, flowPct)}%` }}
          />
          {learnFlowPct > 0 && (
            <div
              className="h-full border-l border-[#111111]/40 bg-[#B8FF01] transition-all duration-200"
              style={{ width: `${Math.min(100 - flowPct, Math.max(learnFlowPct, 2))}%` }}
            />
          )}
        </div>
      ) : (
        <CoverageGate onSignIn={onRequireAuth} label="Sign in to see coverage" />
      )}
    </div>
  );
};
