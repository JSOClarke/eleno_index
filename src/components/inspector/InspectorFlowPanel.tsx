import React from "react";
import { CoverageGate } from "@/components/ui/CoverageGate";
import { formatLearningDelta } from "@/lib/formatters";

interface InspectorFlowPanelProps {
  index: string;
  title: string;
  pct: number;
  learnPct: number;
  footnote: React.ReactNode;
  isAuthenticated: boolean;
  onSignIn: () => void;
}

/** One of the two coverage panels in the inspector header. */
export const InspectorFlowPanel: React.FC<InspectorFlowPanelProps> = ({
  index,
  title,
  pct,
  learnPct,
  footnote,
  isAuthenticated,
  onSignIn,
}) => (
  <div>
    <div className="font-mono text-xs uppercase text-[#666666]">
      {index} / {title}
    </div>

    {isAuthenticated ? (
      <>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold tabular-nums">{Math.round(pct)}%</span>
          {learnPct > 0 && (
            <span className="border border-[#111111] bg-[#B8FF01] px-1.5 py-0.5 font-mono text-xs font-semibold">
              {formatLearningDelta(learnPct)} learn
            </span>
          )}
        </div>
        <div className="mt-2 flex h-2.5 w-full overflow-hidden border border-[#111111] bg-white">
          <div
            className="h-full bg-[#111111] transition-all duration-200"
            style={{ width: `${Math.min(100, pct)}%` }}
          />
          {learnPct > 0 && (
            <div
              className="h-full border-l border-[#111111]/40 bg-[#B8FF01] transition-all duration-200"
              style={{ width: `${Math.min(100 - pct, Math.max(learnPct, 1.5))}%` }}
            />
          )}
        </div>
        <div className="mt-1.5 font-mono text-xs text-[#666666]">{footnote}</div>
      </>
    ) : (
      <div className="mt-1">
        <CoverageGate
          onSignIn={onSignIn}
          rows={2}
          label={`Sign in to see ${title.toLowerCase()}`}
        />
      </div>
    )}
  </div>
);
