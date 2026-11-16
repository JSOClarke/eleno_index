import React from "react";
import { formatLearningDelta } from "@/lib/formatters";
import type { MediaCatalogItem } from "@/types/media.types";
import { CoverageGate } from "@/components/ui/CoverageGate";

interface CardCoveragePanelProps {
  item: MediaCatalogItem;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

/** Clean vocabulary match progress bar on catalogue cards; gated when signed out. */
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">Vocabulary Match</span>
        {isAuthenticated ? (
          <span className="font-semibold tabular-nums text-emerald-700">
            {Math.round(flowPct)}% known
            {learnFlowPct > 0 ? ` (${formatLearningDelta(learnFlowPct)})` : ""}
            <span className="ml-1 font-normal text-slate-400">· {vocabPct}% voc</span>
          </span>
        ) : (
          <span className="text-slate-400">Sign in to view</span>
        )}
      </div>

      {isAuthenticated ? (
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full bg-emerald-500 transition-all duration-300 ${learnFlowPct > 0 ? "" : "rounded-r-full"}`}
            style={{ width: `${Math.min(100, flowPct)}%` }}
          />
          {learnFlowPct > 0 && (
            <div
              className="h-full rounded-r-full bg-amber-300 transition-all duration-300"
              style={{ width: `${Math.min(100 - flowPct, Math.max(learnFlowPct, 2))}%` }}
            />
          )}
        </div>
      ) : (
        <CoverageGate onSignIn={onRequireAuth} label="Sign in to see match" />
      )}
    </div>
  );
};
