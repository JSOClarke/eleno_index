import React from "react";
import { ScrollFadeX } from "@/components/ui/ScrollFadeX";

type LedgerTab = "canonical" | "characters" | "noise";

interface LedgerTabsProps {
  active: LedgerTab;
  onChange: (tab: LedgerTab) => void;
  canonicalCount: number;
}

const TABS: { id: LedgerTab; label: string }[] = [
  { id: "canonical", label: "CANONICAL PRIMER" },
  { id: "characters", label: "CAST OF CHARACTERS" },
  { id: "noise", label: "FILTERED NOISE" },
];

/** Scrollable ledger tabs; the edge fade signals the off-screen third tab. */
export const LedgerTabs: React.FC<LedgerTabsProps> = ({ active, onChange, canonicalCount }) => (
  <ScrollFadeX className="min-w-0 flex-1 font-mono text-xs">
    <div className="flex w-max gap-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`shrink-0 whitespace-nowrap border border-[#111111] px-3.5 py-1.5 cursor-pointer ${
            active === tab.id ? "bg-[#111111] text-white font-semibold" : "bg-white text-[#111111]"
          }`}
        >
          {tab.label}
          {tab.id === "canonical" ? ` (${canonicalCount})` : ""}
        </button>
      ))}
    </div>
  </ScrollFadeX>
);
