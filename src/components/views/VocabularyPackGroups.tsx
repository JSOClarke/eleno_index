import React, { useMemo } from "react";
import type {
  VocabularyPack,
  VocabularyPackApplication,
} from "@/types/vocabularyPack.types";
import { VocabularyPackCard } from "./VocabularyPackCard";

interface VocabularyPackGroupsProps {
  packs: VocabularyPack[];
  loading: boolean;
  disabled: boolean;
  appliedPacks: Record<string, VocabularyPackApplication>;
  onPreview: (pack: VocabularyPack) => void;
}

export const VocabularyPackGroups: React.FC<VocabularyPackGroupsProps> = ({
  packs,
  loading,
  disabled,
  appliedPacks,
  onPreview,
}) => {
  const groups = useMemo(() => {
    const grouped = new Map<string, VocabularyPack[]>();
    for (const pack of packs) {
      const current = grouped.get(pack.group_label) || [];
      current.push(pack);
      grouped.set(pack.group_label, current);
    }
    return Array.from(grouped.entries()).sort((a, b) => {
      const rank = (group: string) =>
        group === "FREQUENCY" ? 0 : group === "CEFR" ? 1 : 2;
      return rank(a[0]) - rank(b[0]);
    });
  }, [packs]);

  if (loading) {
    return (
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl border border-slate-200/80 bg-slate-100" />
        ))}
      </div>
    );
  }

  const formatGroup = (g: string) =>
    g === "FREQUENCY" ? "Frequency" : g === "CEFR" ? "CEFR" : g.charAt(0) + g.slice(1).toLowerCase();

  return (
    <div className="space-y-4">
      {groups.map(([group, groupPacks]) => (
        <div key={group}>
          <div className="mb-2 text-xs font-semibold text-slate-500">
            {formatGroup(group)}
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {groupPacks.map((pack) => (
              <VocabularyPackCard
                key={pack.id}
                pack={pack}
                disabled={disabled}
                applied={Boolean(appliedPacks[pack.id] || appliedPacks[pack.slug])}
                onPreview={onPreview}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
