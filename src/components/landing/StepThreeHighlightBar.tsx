import React from "react";
import type { DemoHighlightMode, ParsedDemoToken } from "./landingExtensionMocks";

const CEFR_RGBA: Record<string, string> = {
  A1: "rgba(16, 185, 129, 0.16)",
  A2: "rgba(6, 182, 212, 0.16)",
  B1: "rgba(234, 179, 8, 0.18)",
  B2: "rgba(249, 115, 22, 0.18)",
  C1: "rgba(244, 63, 94, 0.18)",
  C2: "rgba(139, 92, 246, 0.18)",
};

const LEGEND_BY_MODE: Record<DemoHighlightMode, Array<{ label: string; color: string }>> = {
  status: [
    { label: "Unknown", color: "rgba(14, 165, 233, 0.16)" },
    { label: "Learning", color: "rgba(245, 158, 11, 0.24)" },
    { label: "Known", color: "transparent" },
  ],
  cefr: [
    { label: "A1", color: "rgba(16, 185, 129, 0.16)" },
    { label: "A2", color: "rgba(6, 182, 212, 0.16)" },
    { label: "B1+", color: "rgba(234, 179, 8, 0.18)" },
  ],
  rank: [
    { label: "Top 3k", color: "rgba(16, 185, 129, 0.16)" },
    { label: "Top 10k", color: "rgba(249, 115, 22, 0.18)" },
    { label: "Rare", color: "rgba(244, 63, 94, 0.18)" },
  ],
  none: [{ label: "No highlights", color: "transparent" }],
};

export function getDemoTokenStyle(
  token: ParsedDemoToken,
  mode: DemoHighlightMode,
  isActive: boolean,
  inPhrase = false,
): React.CSSProperties {
  const phraseStyle: React.CSSProperties = inPhrase && mode !== "none"
    ? { textDecoration: "underline dotted rgba(14, 116, 144, 0.85)", textUnderlineOffset: "3px" }
    : {};
  if (isActive) return { ...phraseStyle, backgroundColor: "rgba(15, 23, 42, 0.16)" };
  if (mode === "none") return {};
  if (mode === "status") {
    if (token.demoStatus === "unknown") return { ...phraseStyle, backgroundColor: "rgba(14, 165, 233, 0.16)" };
    if (token.demoStatus === "learning") return { ...phraseStyle, backgroundColor: "rgba(245, 158, 11, 0.24)" };
    return phraseStyle;
  }
  if (mode === "cefr") {
    const bg = CEFR_RGBA[token.canonical?.cefr || ""];
    return bg ? { ...phraseStyle, backgroundColor: bg } : phraseStyle;
  }
  const rank = token.canonical?.tubelex_rank || token.canonical?.elelex_rank || null;
  if (!rank || rank > 10000) return { ...phraseStyle, backgroundColor: "rgba(244, 63, 94, 0.18)" };
  if (rank > 5000) return { ...phraseStyle, backgroundColor: "rgba(249, 115, 22, 0.18)" };
  if (rank > 3000) return { ...phraseStyle, backgroundColor: "rgba(234, 179, 8, 0.18)" };
  return { ...phraseStyle, backgroundColor: "rgba(16, 185, 129, 0.16)" };
}

export const StepThreeHighlightBar: React.FC<{
  mode: DemoHighlightMode;
  onChange: (mode: DemoHighlightMode) => void;
}> = ({ mode, onChange }) => (
  <div className="flex flex-wrap items-center justify-between gap-2">
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

    <div className="flex flex-wrap items-center gap-2.5 text-[10.5px] text-white/70">
      {LEGEND_BY_MODE[mode].map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-[3px] border border-white/25 bg-white"
            style={{ backgroundImage: `linear-gradient(${item.color}, ${item.color})` }}
          />
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  </div>
);
