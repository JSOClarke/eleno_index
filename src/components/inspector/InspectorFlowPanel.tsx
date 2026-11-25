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
  barColorClass?: string;
}

export const InspectorFlowPanel: React.FC<InspectorFlowPanelProps> = ({
  index,
  title,
  pct,
  learnPct,
  footnote,
  isAuthenticated,
  onSignIn,
  barColorClass = "bg-slate-900",
}) => (
  <div>
    <div className="text-xs font-medium text-slate-500">
      {index} · {title}
    </div>

    {isAuthenticated ? (
      <>
        <div className="mt-1.5 flex flex-nowrap items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums shrink-0">
            {Math.round(pct)}%
          </span>
          {learnPct > 0 && (
            <span className="whitespace-nowrap shrink-0 rounded-full border border-sky-200/80 bg-sky-50 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-sky-700">
              {formatLearningDelta(learnPct)} learn
            </span>
          )}
        </div>
        <div className="mt-2.5 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full transition-all duration-300 ${barColorClass} ${learnPct > 0 ? "" : "rounded-r-full"}`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
          {learnPct > 0 && (
            <div
              className="h-full rounded-r-full bg-sky-400 transition-all duration-300"
              style={{ width: `${Math.min(100 - pct, Math.max(learnPct, 2))}%` }}
            />
          )}
        </div>
        <div className="mt-1.5 text-xs text-slate-500">{footnote}</div>
      </>
    ) : (
      <div className="mt-2">
        <CoverageGate
          onSignIn={onSignIn}
          rows={2}
          label={`Sign in to see ${title.toLowerCase()}`}
        />
      </div>
    )}
  </div>
);
