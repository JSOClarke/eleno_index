import React from "react";
import { formatLearningDelta } from "@/lib/formatters";

interface RedesignFlowMetricCardProps {
  index: string;
  title: string;
  pct: number;
  learnPct?: number;
  footnote: React.ReactNode;
  barColorClass?: string;
}

export const RedesignFlowMetricCard: React.FC<RedesignFlowMetricCardProps> = ({
  index,
  title,
  pct,
  learnPct = 0,
  footnote,
  barColorClass = "bg-emerald-500",
}) => {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {index} · {title}
      </div>

      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
          {Math.round(pct)}%
        </span>
        {learnPct > 0 && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200/80">
            {formatLearningDelta(learnPct)} learn
          </span>
        )}
      </div>

      <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColorClass}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
        {learnPct > 0 && (
          <div
            className="h-full bg-amber-300 transition-all duration-300"
            style={{ width: `${Math.min(100 - pct, Math.max(learnPct, 2))}%` }}
          />
        )}
      </div>

      <div className="text-xs text-slate-500">{footnote}</div>
    </div>
  );
};
