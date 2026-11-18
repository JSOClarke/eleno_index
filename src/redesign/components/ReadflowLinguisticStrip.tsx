import React from "react";
import type { MediaMetrics } from "@/types/media.types";

interface ReadflowLinguisticStripProps {
  metrics: MediaMetrics | null;
}

const CEFR_COLORS: Record<string, string> = {
  A1: "bg-[#E2F59B]",
  A2: "bg-[#FFFFFF]",
  B1: "bg-[#9A99F6]",
  B2: "bg-[#040404]",
  C1: "bg-[#F3E1E6]",
  C2: "bg-[#5A595C]",
};

export const ReadflowLinguisticStrip: React.FC<ReadflowLinguisticStripProps> = ({ metrics }) => {
  if (!metrics) return null;
  const cefrEntries = Object.entries(metrics.cefr_distribution || {}).filter(([, v]) => v > 0);
  const cefrTotal = cefrEntries.reduce((s, [, v]) => s + v, 0) || 1;
  const pct = metrics.frequency_tiers?.percentages;
  const verb = metrics.verb_profile;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="bg-[#D8D6FA] rounded-2xl p-4 flex flex-col justify-between">
        <div>
          <span className="inline-block px-2 py-0.5 rounded-lg bg-white text-[10px] font-extrabold uppercase tracking-wider text-[#040404]">
            CEFR Distribution
          </span>
          <div className="mt-2.5 h-3 w-full rounded-full overflow-hidden flex bg-white">
            {cefrEntries.map(([lvl, cnt]) => (
              <div key={lvl} className={CEFR_COLORS[lvl] || "bg-[#ECECEF]"} style={{ width: `${(cnt / cefrTotal) * 100}%` }} title={`${lvl}: ${((cnt / cefrTotal) * 100).toFixed(1)}%`} />
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {cefrEntries.map(([lvl, cnt]) => (
            <span key={lvl} className="px-2 py-0.5 rounded-lg bg-white/90 text-[10px] font-extrabold text-[#040404]">
              {lvl} · {Math.round((cnt / cefrTotal) * 100)}%
            </span>
          ))}
        </div>
      </div>

      <div className="bg-[#E2F59B] rounded-2xl p-4">
        <span className="inline-block px-2 py-0.5 rounded-lg bg-white text-[10px] font-extrabold uppercase tracking-wider text-[#040404]">
          Frequency Tiers
        </span>
        <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px]">
          {[
            { label: "Top 1k", val: pct?.top_1k_pct },
            { label: "1k–5k", val: pct?.k1_to_5k_pct },
            { label: "5k–10k", val: pct?.k5_to_10k_pct },
            { label: "Rare 10k+", val: pct?.rare_pct },
          ].map((row) => (
            <div key={row.label} className="rounded-lg bg-white/95 px-2.5 py-1.5 flex items-center justify-between">
              <span className="font-bold text-[#5A595C]">{row.label}</span>
              <span className="font-extrabold text-[#040404]">{row.val != null ? `${row.val.toFixed(1)}%` : "—"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#F3E1E6] rounded-2xl p-4">
        <span className="inline-block px-2 py-0.5 rounded-lg bg-white text-[10px] font-extrabold uppercase tracking-wider text-[#040404]">
          Grammar &amp; Style
        </span>
        <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px]">
          {[
            { label: "Subjunctive", val: verb?.subjunctive_load != null ? `${(verb.subjunctive_load * 100).toFixed(1)}%` : "—" },
            { label: "Preterite", val: verb?.preterite_share != null ? `${(verb.preterite_share * 100).toFixed(1)}%` : "—" },
            { label: "Imperfect", val: verb?.imperfect_share != null ? `${(verb.imperfect_share * 100).toFixed(1)}%` : "—" },
            { label: "Lexical Dens.", val: metrics.lexical_density != null ? `${(metrics.lexical_density * 100).toFixed(0)}%` : "—" },
          ].map((row) => (
            <div key={row.label} className="rounded-lg bg-white/95 px-2.5 py-1.5 flex items-center justify-between">
              <span className="font-bold text-[#5A595C]">{row.label}</span>
              <span className="font-extrabold text-[#040404]">{row.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
