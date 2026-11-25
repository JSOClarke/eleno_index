import React from "react";
import { Loader2, Search, X } from "lucide-react";
import { CoverageGate } from "@/components/ui/CoverageGate";
import { FilterSelectDropdown } from "@/components/ui/FilterSelectDropdown";
import { getProficiencySystemLabel } from "@/lib/proficiencyScale";
import { getRankOptionsForLanguage, type RankingSourceKey, type VocabStatusFilter } from "@/lib/vocabSorting";
import type { UserVocabStatus, VocabularyWord } from "@/types/vocabulary.types";
import { ExportAnkiButton } from "./ExportAnkiButton";

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
  language?: string;
  selectedChapter: number | "all";
  onClearChapter: () => void;
  isEpisodeMode: boolean;
  sortValue: string;
  onSortChange: (value: string) => void;
  resultCount: number;
  exportWords: VocabularyWord[];
  statusMap: Record<string, UserVocabStatus>;
  mediaTitle?: string;
  mediaItemId?: string;
  userId?: string | null;
  onRequireAuth: () => void;
  loadingMore?: boolean;
  totalExpected?: number;
}

export const PrimerFilterBar: React.FC<PrimerFilterBarProps> = ({
  query, onQueryChange, statusFilter, onStatusFilter, statusCounts, posFilter, onPosFilter,
  rankingSource, onRankingSource, language, selectedChapter, onClearChapter, isEpisodeMode,
  sortValue, onSortChange, resultCount, exportWords, statusMap, mediaTitle, mediaItemId, userId, onRequireAuth, loadingMore = false, totalExpected,
}) => {
  const rankOpts = getRankOptionsForLanguage(language);
  const mobileSortOpts = [
    { value: "frequency:desc", label: "Frequency ↓" },
    { value: "rank:asc", label: "Rank ↑" },
    { value: "lemma:asc", label: "Lemma A–Z" },
    { value: "cefr:asc", label: getProficiencySystemLabel(language) },
    { value: "debut:asc", label: "Debut" },
    { value: "pos:asc", label: "POS" },
  ] as const;

  return (
  <>
    <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
        <div className="relative w-full sm:flex-1 sm:min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search canonical lemma..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 focus:bg-white"
          />
        </div>
        {selectedChapter !== "all" && (
          <button
            type="button"
            onClick={onClearChapter}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <span>Debut in {isEpisodeMode ? `Ep.${selectedChapter}` : `Ch.${selectedChapter}`}</span>
            <X className="h-3 w-3" />
          </button>
        )}
        {userId ? (
          <div className="flex w-full sm:w-auto items-center overflow-x-auto rounded-full border border-slate-200 bg-slate-50 p-0.5 text-xs">
            {STATUS_OPTS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => onStatusFilter(id)}
                title={id === "ALL" && loadingMore ? `Loading ${statusCounts.ALL.toLocaleString()}${totalExpected ? ` of ~${totalExpected.toLocaleString()}` : ""} words…` : undefined}
                className={`inline-flex items-center justify-center gap-1 flex-1 sm:flex-initial whitespace-nowrap text-center rounded-full px-2.5 sm:px-3 py-1 cursor-pointer transition ${
                  statusFilter === id
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {id === "ALL" && loadingMore && <Loader2 className="h-3 w-3 animate-spin" />}
                <span>{label} ({statusCounts[id].toLocaleString()}{id === "ALL" && loadingMore ? "…" : ""})</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="w-full sm:w-64 shrink-0">
              <CoverageGate onSignIn={onRequireAuth} label="Sign in to filter by status" />
            </div>
            {loadingMore && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading {statusCounts.ALL.toLocaleString()}{totalExpected ? ` / ~${totalExpected.toLocaleString()}` : ""}…
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs xl:shrink-0 xl:justify-end">
        <div className="flex items-center gap-2">
          <FilterSelectDropdown prefix="Rank" value={rankingSource} options={rankOpts} onChange={onRankingSource} ariaLabel="Frequency ranking source" />
          <FilterSelectDropdown prefix="POS" value={posFilter} options={POS_OPTS} onChange={onPosFilter} ariaLabel="Part of speech filter" />
        </div>
        <ExportAnkiButton words={exportWords} statusMap={statusMap} mediaTitle={mediaTitle} mediaItemId={mediaItemId} rankingSource={rankingSource} />
      </div>
    </div>

    <div className="flex items-center justify-between gap-2 text-xs md:hidden">
      <FilterSelectDropdown
        prefix="Sort"
        value={sortValue}
        options={mobileSortOpts}
        onChange={onSortChange}
        ariaLabel="Sort vocabulary table"
        align="left"
      />
      <span className="text-slate-500">{resultCount} lemmas</span>
    </div>
  </>
  );
};
