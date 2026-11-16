import React from "react";
import { ScrollFadeX } from "@/components/ui/ScrollFadeX";

type LedgerTab = "canonical" | "characters" | "noise";

interface LedgerTabsProps {
  active: LedgerTab;
  onChange: (tab: LedgerTab) => void;
  canonicalCount: number;
}

const TABS: { id: LedgerTab; label: string }[] = [
  { id: "canonical", label: "Vocabulary" },
  { id: "characters", label: "Cast of Characters" },
  { id: "noise", label: "Filtered Noise" },
];

export const LedgerTabs: React.FC<LedgerTabsProps> = ({ active, onChange, canonicalCount }) => (
  <ScrollFadeX className="min-w-0 flex-1 text-xs">
    <div className="flex w-max gap-1.5 py-0.5">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 font-medium cursor-pointer transition ${
            active === tab.id
              ? "bg-slate-900 text-white shadow-xs"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          {tab.label}
          {tab.id === "canonical" ? ` (${canonicalCount})` : ""}
        </button>
      ))}
    </div>
  </ScrollFadeX>
);
