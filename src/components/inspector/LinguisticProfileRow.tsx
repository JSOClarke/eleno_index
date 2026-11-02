import React from "react";
import { formatNumber } from "@/lib/formatters";
import type { MediaMetrics } from "@/types/media.types";

interface LinguisticProfileRowProps {
  metrics: MediaMetrics | null;
}

export const LinguisticProfileRow: React.FC<LinguisticProfileRowProps> = ({
  metrics,
}) => {
  if (!metrics) return null;

  const cefr = metrics.cefr_level || "B1";
  const fh = (metrics.readability_score || 70).toFixed(1);
  const subjPct = ((metrics.verb_profile?.subjunctive_load || 0) * 100).toFixed(1);
  const dialPct = ((metrics.dialogue_ratio || 0) * 100).toFixed(1);
  const cov95 = metrics.coverage_95_lemmas || Math.round(metrics.unique_words_count * 0.42);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
      <div className="border border-[#E2E2DF] bg-white p-3.5">
        <div className="text-[#777777] uppercase">CEFR & Readability</div>
        <div className="text-lg font-bold text-[#111111] mt-1">
          {cefr} · F-H {fh}
        </div>
        <div className="text-[#666666] mt-0.5">Fernández Huerta scale</div>
      </div>

      <div className="border border-[#E2E2DF] bg-white p-3.5">
        <div className="text-[#777777] uppercase">Subjunctive Load</div>
        <div className="text-lg font-bold text-[#111111] mt-1">{subjPct}%</div>
        <div className="text-[#666666] mt-0.5">of finite verb forms</div>
      </div>

      <div className="border border-[#E2E2DF] bg-white p-3.5">
        <div className="text-[#777777] uppercase">Dialogue Share</div>
        <div className="text-lg font-bold text-[#111111] mt-1">{dialPct}%</div>
        <div className="text-[#666666] mt-0.5">conversational lines</div>
      </div>

      <div className="border border-[#E2E2DF] bg-white p-3.5">
        <div className="text-[#777777] uppercase">95% Target Threshold</div>
        <div className="text-lg font-bold text-[#111111] mt-1">
          {formatNumber(cov95)} lemmas
        </div>
        <div className="text-[#666666] mt-0.5">for unassisted reading</div>
      </div>
    </div>
  );
};
