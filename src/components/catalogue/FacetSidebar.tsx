import React from "react";
import type {
  CatalogueFilterState,
  LengthBucket,
  ProfileFilterId,
} from "@/types/filter.types";
import { FacetGroup } from "./FacetGroup";

interface FacetSidebarProps {
  filters: CatalogueFilterState;
  counts: {
    levels: Record<string, number>;
    types: Record<string, number>;
    lengths: Record<string, number>;
    profiles: Record<string, number>;
  };
  onToggleLevel: (level: string) => void;
  onToggleType: (type: string) => void;
  onToggleLength: (bucket: LengthBucket) => void;
  onToggleProfile: (profile: ProfileFilterId) => void;
}

export const FacetSidebar: React.FC<FacetSidebarProps> = ({
  filters,
  counts,
  onToggleLevel,
  onToggleType,
  onToggleLength,
  onToggleProfile,
}) => {
  const levelOptions = ["A1", "A2", "B1", "B2", "C1"].map((lvl) => ({
    id: lvl,
    label: lvl,
    count: counts.levels[lvl] || 0,
  }));

  const typeOptions = [
    "Reader / book",
    "Film / Subtitles",
    "Short story",
    "Lore / guide",
  ].map((t) => ({
    id: t,
    label: t,
    count: counts.types[t] || 0,
  }));

  const lengthOptions = [
    { id: "under25k", label: "Under 25k words", count: counts.lengths.under25k || 0 },
    { id: "25to80k", label: "25k–80k words", count: counts.lengths["25to80k"] || 0 },
    { id: "80k+", label: "80k+ words", count: counts.lengths["80k+"] || 0 },
  ];

  const profileOptions = [
    {
      id: "dialogue20",
      label: "High dialogue (20%+)",
      count: counts.profiles.dialogue20 || 0,
    },
    {
      id: "fh70",
      label: "F-H Accessible (70+)",
      count: counts.profiles.fh70 || 0,
    },
    {
      id: "subj2",
      label: "Subjunctive rich",
      count: counts.profiles.subj2 || 0,
    },
  ];

  return (
    <aside className="w-52 shrink-0 space-y-6 select-none">
      <FacetGroup
        title="LEVEL"
        options={levelOptions}
        selectedSet={filters.levels}
        onToggle={onToggleLevel}
      />
      <FacetGroup
        title="TYPE"
        options={typeOptions}
        selectedSet={filters.types}
        onToggle={onToggleType}
      />
      <FacetGroup
        title="LENGTH"
        options={lengthOptions}
        selectedSet={filters.lengths as Set<string>}
        onToggle={(id) => onToggleLength(id as LengthBucket)}
      />
      <FacetGroup
        title="LINGUISTIC PROFILE"
        options={profileOptions}
        selectedSet={filters.profiles as Set<string>}
        onToggle={(id) => onToggleProfile(id as ProfileFilterId)}
      />
    </aside>
  );
};
