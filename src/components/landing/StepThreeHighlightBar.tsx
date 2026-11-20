import React from "react";
import type { DemoHighlightMode, ParsedDemoToken } from "./landingExtensionMocks";

const CEFR_BADGE: Record<string, string> = {
  A1: "bg-emerald-400/25 text-emerald-100 decoration-emerald-300/60",
  A2: "bg-cyan-400/25 text-cyan-100 decoration-cyan-300/60",
  B1: "bg-yellow-400/25 text-yellow-100 decoration-yellow-300/60",
  B2: "bg-orange-400/25 text-orange-100 decoration-orange-300/60",
  C1: "bg-rose-400/25 text-rose-100 decoration-rose-300/60",
  C2: "bg-violet-400/25 text-violet-100 decoration-violet-300/60",
};

const LEGEND_BY_MODE: Record<DemoHighlightMode, Array<{ label: string; dot: string }>> = {
  status: [
    { label: "Unknown", dot: "bg-sky-400" },
    { label: "Learning", dot: "bg-amber-400" },
    { label: "Known", dot: "bg-white/25" },
  ],
  cefr: [
    { label: "A1", dot: "bg-emerald-400" },
    { label: "A2", dot: "bg-cyan-400" },
    { label: "B1+", dot: "bg-yellow-400" },
  ],
  rank: [
    { label: "Top 3k", dot: "bg-emerald-400" },
    { label: "Top 10k", dot: "bg-orange-400" },
    { label: "Rare", dot: "bg-rose-400" },
  ],
  none: [{ label: "No highlights", dot: "bg-white/25" }],
};

export function getDemoTokenClass(
  token: ParsedDemoToken,
  mode: DemoHighlightMode,
  isActive: boolean,
): string {
  const ring = isActive ? "ring-1 ring-white/80 font-medium" : "";
  if (mode === "none") {
    return `${isActive ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/85"} underline decoration-white/25 ${ring}`;
  }
  if (mode === "status") {
    if (token.demoStatus === "unknown") return `bg-sky-400/25 text-sky-100 underline decoration-sky-300/60 ${ring}`;
    if (token.demoStatus === "learning") return `bg-amber-400/25 text-amber-100 underline decoration-amber-300/60 ${ring}`;
    return `${isActive ? "bg-white/15 text-white" : "hover:bg-white/10 text-white/75"} underline decoration-white/20 ${ring}`;
  }
  if (mode === "cefr") {
    const cefr = token.canonical?.cefr || "";
    const cls = CEFR_BADGE[cefr] || "hover:bg-white/10 text-white/80 decoration-white/25";
    return `${cls} underline ${ring}`;
  }
  const rank = token.canonical?.tubelex_rank || token.canonical?.elelex_rank || null;
  if (!rank || rank > 10000) return `bg-rose-400/25 text-rose-100 underline decoration-rose-300/60 ${ring}`;
  if (rank > 5000) return `bg-orange-400/25 text-orange-100 underline decoration-orange-300/60 ${ring}`;
  if (rank > 3000) return `bg-yellow-400/25 text-yellow-100 underline decoration-yellow-300/60 ${ring}`;
  return `bg-emerald-400/25 text-emerald-100 underline decoration-emerald-300/60 ${ring}`;
}

export const StepThreeHighlightBar: React.FC<{
  mode: DemoHighlightMode;
  onChange: (mode: DemoHighlightMode) => void;
}> = ({ mode, onChange }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
    <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/60">
      <span>Highlight</span>
      <select
        aria-label="Highlight mode"
        value={mode}
        onChange={(e) => onChange(e.target.value as DemoHighlightMode)}
        className="rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-[11px] font-medium text-white focus:border-white/40 focus:outline-none cursor-pointer"
      >
        <option value="status" className="bg-[#0A0A0C] text-white">Unknown / Learning</option>
        <option value="cefr" className="bg-[#0A0A0C] text-white">CEFR Level</option>
        <option value="rank" className="bg-[#0A0A0C] text-white">Frequency Rank</option>
        <option value="none" className="bg-[#0A0A0C] text-white">None</option>
      </select>
    </label>

    <div className="flex flex-wrap items-center gap-2.5 text-[10.5px] text-white/65">
      {LEGEND_BY_MODE[mode].map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1">
          <span className={`h-2 w-2 rounded-full ${item.dot}`} />
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  </div>
);
