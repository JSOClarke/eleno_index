import React from "react";
import { Search, X } from "lucide-react";
import { CoverageGate } from "@/components/ui/CoverageGate";
import { FilterSelectDropdown } from "@/components/ui/FilterSelectDropdown";
import type { RankingSourceKey, VocabStatusFilter } from "@/lib/vocabSorting";

const STATUS_OPTS: ReadonlyArray<readonly [VocabStatusFilter, string]> = [
  ["ALL", "All"], ["UNKNOWN", "Unknown"], ["LEARNING", "Learning"], ["KNOWN", "Known"],
];

const POS_OPTS = [
  { value: "ALL", label: "All" },
  { value: "NOUN", label: "Noun" },
  { value: "VERB", label: "Verb" },
  { value: "ADJ", label: "Adj" },
  { value: "ADV", label: "Adv" },
] as const;

const RANK_OPTS: ReadonlyArray<{ value: RankingSourceKey; label: string }> = [
  { value: "tubelex_v2025", label: "TubeLex" },
  { value: "elelex_v2020", label: "ELELex" },
];

const MOBILE_SORT_OPTS = [
  { value: "frequency:desc", label: "Frequency ↓" },
  { value: "rank:asc", label: "Rank ↑" },
  { value: "lemma:asc", label: "Lemma A–Z" },
  { value: "cefr:asc", label: "CEFR" },
  { value: "debut:asc", label: "Debut" },
  { value: "pos:asc", label: "POS" },
] as const;

interface PrimerFilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: VocabStatusFilter;
  onStatusFilter: (value: VocabStatusFilter) => void;
  statusCounts: Record<string, number>;
  posFilter: string;
  onPosFilter: (value: string) => void;
  rankingSource: RankingSourceKey;
  onRankingSource: (value: RankingSourceKey) => void;
  selectedChapter: number | "all";
  onClearChapter: () => void;
  isEpisodeMode: boolean;
  sortValue: string;
  onSortChange: (value: string) => void;
  resultCount: number;
  userId?: string | null;
  onRequireAuth: () => void;
}

export const PrimerFilterBar: React.FC<PrimerFilterBarProps> = ({
  query, onQueryChange, statusFilter, onStatusFilter, statusCounts, posFilter, onPosFilter,
  rankingSource, onRankingSource, selectedChapter, onClearChapter, isEpisodeMode,
  sortValue, onSortChange, resultCount, userId, onRequireAuth,
}) => (
  <>
    <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search canonical lemma..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-400 focus:bg-white"
          />
        </div>
        {selectedChapter !== "all" && (
          <button
            type="button"
            onClick={onClearChapter}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 cursor-pointer"
          >
            <span>Debut in {isEpisodeMode ? `Ep.${selectedChapter}` : `Ch.${selectedChapter}`}</span>
            <X className="h-3 w-3" />
          </button>
        )}
        {userId ? (
          <div className="flex max-w-full items-center overflow-x-auto rounded-full border border-slate-200 bg-slate-50 p-0.5 text-xs">
            {STATUS_OPTS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => onStatusFilter(id)}
                className={`rounded-full px-3 py-1 cursor-pointer transition ${
                  statusFilter === id
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {label} ({statusCounts[id]})
              </button>
            ))}
          </div>
        ) : (
          <div className="w-full sm:w-64">
            <CoverageGate
              onSignIn={onRequireAuth}
              label="Sign in to filter by status"
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <FilterSelectDropdown
          prefix="Rank"
          value={rankingSource}
          options={RANK_OPTS}
          onChange={onRankingSource}
          ariaLabel="Frequency ranking source"
        />
        <FilterSelectDropdown
          prefix="POS"
          value={posFilter}
          options={POS_OPTS}
          onChange={onPosFilter}
          ariaLabel="Part of speech filter"
        />
      </div>
    </div>

    <div className="flex items-center justify-between gap-2 text-xs md:hidden">
      <FilterSelectDropdown
        prefix="Sort"
        value={sortValue}
        options={MOBILE_SORT_OPTS}
        onChange={onSortChange}
        ariaLabel="Sort vocabulary table"
        align="left"
      />
      <span className="text-slate-500">{resultCount} lemmas</span>
    </div>
  </>
);
