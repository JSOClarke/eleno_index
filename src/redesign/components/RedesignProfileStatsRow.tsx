import React from "react";
import { formatNumber, formatPercent } from "@/lib/formatters";
import type { MediaMetrics } from "@/types/media.types";

interface RedesignProfileStatsRowProps {
  metrics: MediaMetrics | null;
}

export const RedesignProfileStatsRow: React.FC<RedesignProfileStatsRowProps> = ({
  metrics,
}) => {
  if (!metrics) return null;

  const cefr = metrics.cefr_level || "B1";
  const fh = (metrics.readability_score || 70).toFixed(1);
  const isKm = (metrics as any).readability_details?.formula === "Kandel-Moles";
  const subjPct = formatPercent(metrics.verb_profile?.subjunctive_load ?? 0.064, 1);
  const wpm = metrics.words_per_minute ? Math.round(metrics.words_per_minute) : null;
  const speechDensity = metrics.speech_density
    ? `${metrics.speech_density.toFixed(1)}% speech density`
    : "active speech cadence";
  const dialPct = formatPercent(metrics.dialogue_ratio, 1);
  const cov95 = metrics.coverage_95_lemmas || Math.round(metrics.unique_words_count * 0.42);

  const cards = [
    {
      label: "CEFR & Readability",
      value: `${cefr} · ${isKm ? "K-M" : "F-H"} ${fh}`,
      sub: isKm ? "Kandel-Moles scale" : "Fernández Huerta scale",
    },
    {
      label: "Subjunctive Load",
      value: subjPct,
      sub: "of finite verb forms",
    },
    {
      label: wpm ? "Speaking Rate" : "Dialogue Share",
      value: wpm ? `${wpm} WPM` : dialPct,
      sub: wpm ? speechDensity : "conversational lines",
    },
    {
      label: "95% Target Threshold",
      value: `${formatNumber(cov95)} lemmas`,
      sub: "for unassisted reading",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {c.label}
          </div>
          <div className="mt-1.5 text-lg font-bold text-slate-900 tabular-nums">
            {c.value}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">{c.sub}</div>
        </div>
      ))}
    </div>
  );
};
