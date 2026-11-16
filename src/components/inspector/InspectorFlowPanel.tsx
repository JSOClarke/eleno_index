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
  barColorClass = "bg-emerald-500",
}) => (
  <div>
    <div className="text-xs font-medium text-slate-500">
      {index} · {title}
    </div>

    {isAuthenticated ? (
      <>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {Math.round(pct)}%
          </span>
          {learnPct > 0 && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200/80">
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
              className="h-full rounded-r-full bg-amber-300 transition-all duration-300"
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
