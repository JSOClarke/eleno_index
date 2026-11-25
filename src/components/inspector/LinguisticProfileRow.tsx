import React from "react";
import type { MediaMetrics } from "@/types/media.types";
import { MetricInfoTooltip } from "./MetricInfoTooltip";
import { ChartColorKeys, MiniPieChart } from "./MetricMiniCharts";
import { buildMetricCards } from "./metricCardSpecs";

interface LinguisticProfileRowProps {
  metrics: MediaMetrics | null;
  language?: string;
}

export const LinguisticProfileRow: React.FC<LinguisticProfileRowProps> = ({ metrics, language }) => {
  if (!metrics) return null;
  const cards = buildMetricCards(metrics, language);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {cards.map((c) => (
        <div
          key={c.label}
          className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-xs"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {c.label}
              </span>
              <MetricInfoTooltip label={c.label} text={c.tooltip} />
            </div>
            <div className="mt-0.5 truncate text-sm font-bold text-slate-900 tabular-nums">{c.value}</div>
            <div className="truncate text-[11px] text-slate-500">{c.sub}</div>
            {c.segments && <ChartColorKeys segments={c.segments} />}
          </div>
          {c.segments && <MiniPieChart segments={c.segments} />}
        </div>
      ))}
    </div>
  );
};
