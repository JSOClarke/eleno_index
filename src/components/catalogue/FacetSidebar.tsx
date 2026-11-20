import React from "react";
import type {
  CatalogueFilterState,
  FlowTier,
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
    genres: Record<string, number>;
    publishers: Record<string, number>;
    years: Record<string, number>;
    audio: number;
    flow: Record<FlowTier, number>;
  };
  onToggleLevel: (level: string) => void;
  onToggleType: (type: string) => void;
  onToggleLength: (bucket: LengthBucket) => void;
  onToggleProfile: (profile: ProfileFilterId) => void;
  onToggleGenre: (genre: string) => void;
  onTogglePublisher: (publisher: string) => void;
  onToggleYear: (year: string) => void;
  onToggleHasAudio: () => void;
  onSetFlowTier: (tier: FlowTier) => void;
  variant?: "sidebar" | "sheet";
}

const sortOptions = (counts: Record<string, number>) =>
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({ id, label: id, count }));

const sortYears = (counts: Record<string, number>) =>
  Object.entries(counts)
    .sort((a, b) => {
      if (a[0] === "Unknown") return 1;
      if (b[0] === "Unknown") return -1;
      return a[0].localeCompare(b[0], undefined, { numeric: true });
    })
    .map(([id, count]) => ({ id, label: id, count }));

export const FacetSidebar: React.FC<FacetSidebarProps> = ({
  filters,
  counts,
  onToggleLevel,
  onToggleType,
  onToggleLength,
  onToggleProfile,
  onToggleGenre,
  onTogglePublisher,
  onToggleYear,
  onToggleHasAudio,
  onSetFlowTier,
  variant = "sidebar",
}) => {
  const levelOptions = ["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => ({
    id: lvl,
    label: lvl,
    count: counts.levels[lvl] || 0,
  }));

  const audioOptions = [
    { id: "audio_on", label: "🎧 Audio Narration", count: counts.audio || 0 },
  ];

  const flowOptions = [
    { id: "fluent", label: "Fluent (95%+)", count: counts.flow.fluent || 0 },
    { id: "sweet_spot", label: "Sweet Spot (85–95%)", count: counts.flow.sweet_spot || 0 },
    { id: "challenge", label: "Challenge (<85%)", count: counts.flow.challenge || 0 },
  ];

  const typeOptions = ["Book / Reader", "Film / Subtitles"].map((t) => ({
    id: t,
    label: t,
    count: counts.types[t] || 0,
  }));

  const lengthOptions = [
    { id: "under25k", label: "< 25k words", count: counts.lengths.under25k || 0 },
    { id: "25to80k", label: "25k–80k words", count: counts.lengths["25to80k"] || 0 },
    { id: "80k+", label: "80k+ words", count: counts.lengths["80k+"] || 0 },
  ];

  const profileOptions = [
    { id: "dialogue20", label: "Conversational (20%+)", count: counts.profiles.dialogue20 || 0 },
    { id: "fh70", label: "Accessible (F-H 70+)", count: counts.profiles.fh70 || 0 },
    { id: "subj2", label: "Subjunctive Rich", count: counts.profiles.subj2 || 0 },
  ];

  const genreOptions = sortOptions(counts.genres);
  const publisherOptions = sortOptions(counts.publishers);
  const yearOptions = sortYears(counts.years);

  return (
    <aside
      className={
        variant === "sheet"
          ? "w-full space-y-6 select-none"
          : "w-52 shrink-0 space-y-6 select-none"
      }
    >
      <FacetGroup
        title="Audio & Media"
        options={audioOptions}
        selectedSet={new Set(filters.hasAudio ? ["audio_on"] : [])}
        onToggle={onToggleHasAudio}
      />
      <FacetGroup
        title="Reading Flow"
        options={flowOptions}
        selectedSet={new Set(filters.flowTier !== "all" ? [filters.flowTier] : [])}
        onToggle={(id) => onSetFlowTier(filters.flowTier === id ? "all" : (id as FlowTier))}
      />
      <FacetGroup
        title="CEFR Level"
        options={levelOptions}
        selectedSet={filters.levels}
        onToggle={onToggleLevel}
      />
      <FacetGroup
        title="Media Type"
        options={typeOptions}
        selectedSet={filters.types}
        onToggle={onToggleType}
      />
      <FacetGroup
        title="Length"
        options={lengthOptions}
        selectedSet={filters.lengths as Set<string>}
        onToggle={(id) => onToggleLength(id as LengthBucket)}
      />
      <FacetGroup
        title="Linguistic Profile"
        options={profileOptions}
        selectedSet={filters.profiles as Set<string>}
        onToggle={(id) => onToggleProfile(id as ProfileFilterId)}
      />
      <FacetGroup
        title="Genre"
        options={genreOptions}
        selectedSet={filters.genres}
        onToggle={onToggleGenre}
      />
      <FacetGroup
        title="Publisher"
        options={publisherOptions}
        selectedSet={filters.publishers}
        onToggle={onTogglePublisher}
      />
    </aside>
  );
};
